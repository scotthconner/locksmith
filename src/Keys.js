//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box, BoxProps,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  ModalFooter,
  Skeleton,
  Spacer,
  Stack,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  VStack,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import { KeyInfoIcon } from './components/KeyInfo.js';
import { FaTimes } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import { HiOutlineKey } from 'react-icons/hi';
import { FcKey } from 'react-icons/fc';
import { BsEye } from 'react-icons/bs';
import { Link } from 'react-router-dom';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import {
  useAccount
} from 'wagmi';

import {
  useWalletKeys,
  useKeyInfo,
  useKeyInventory
} from './hooks/LocksmithHooks.js';

//////////////////////////////////////
// Keys Function Component
//////////////////////////////////////
function Keys() {
  const keys = useWalletKeys();
  let keyBody = '';

  if (!keys.isSuccess) {
    keyBody = (<>
      <WrapItem key='1'>
        <Box w='10em' h='12em'>
          <Skeleton height='12em' borderRadius='lg'/>
        </Box>
      </WrapItem>
      <WrapItem key='2'>
        <Box w='10em' h='12em'>
          <Skeleton height='12em' borderRadius='lg'/>
        </Box>
      </WrapItem>
      <WrapItem key='3'>
        <Box w='10em' h='12em'>
          <Skeleton height='12em' borderRadius='lg'/>
        </Box>
      </WrapItem></>); 
  } else {
    keyBody = (keys.data.map((k) => (
      <Key key={k} keyId={k}/>
    )));
  }

  return (<>
    <Stack m='1em' spacing='1em'>
      <Heading size='md'>Keys in Your Wallet</Heading>
        <Wrap padding='3em' spacing='2em' pb='6em'>
          {keyBody}
        </Wrap>
    </Stack>
  </>);
}

interface KeyProps extends BoxProps {
  keyId: BigNumber
}

const Key = ({keyId, onClick, ...rest}: KeyProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  var boxColor = useColorModeValue('white', 'gray.800');
  var account = useAccount(); 
  var keyInfo = useKeyInfo(keyId, account.address);
  var body = '';

  if(!keyInfo.isSuccess) {
    body = (
      <Center w='8em'>
        <VStack spacing='1em'>
          <Skeleton width='8em' height='0.6em'/>
          <HStack>
            <Skeleton width='6em' height='5em'/>
          </HStack>
          <Skeleton width='5.5em' height='1em'/>
        </VStack>
      </Center>
    );
  } else {
    body = (
      <Center w='8em'>
        <VStack spacing='1em'>
          <Text fontSize='xs' fontStyle='italic' color='gray.500'>{keyInfo.data.trust.name}</Text>
          <HStack>
            {keyInfo.data.isRoot ? <FcKey size='56px'/> : <HiOutlineKey size='56px'/>}
            <FaTimes/>
            <Text fontSize='2xl'>{(keyInfo.data.inventory || '').toString()}</Text>
          </HStack>
          <Text>{keyInfo.data.alias}</Text>
          {(keyInfo.data.soulbound || '').toString() !== '0' && 
            <Tag colorScheme='purple'><TagLabel>{(keyInfo.data.soulbound||'').toString()} × Soulbound</TagLabel></Tag>}
        </VStack>
      </Center>
    )
  }

  return (<>
    <WrapItem key={keyId} p='1em' w='10em' h='12em' 
      border={keyInfo.isSuccess && keyInfo.data.isRoot ? '2px' : '0px'} 
      borderColor={keyInfo.isSuccess && keyInfo.data.isRoot ? 'yellow.400' : 'white'}
      borderRadius='lg' 
      bg={boxColor} boxShadow='dark-lg'
      cursor='pointer'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'
      onClick={onOpen}>
      {body}
    </WrapItem>
    <Modal onClose={onClose} isOpen={isOpen} isCentered size='xl'>
      <KeyDetailBody onClose={onClose} keyInfo={keyInfo}/>
    </Modal>
  </>);
}

const KeyDetailBody = ({keyInfo, onClose, ...rest}: KeyProps) => {
  let keyInventory = useKeyInventory(keyInfo.data.keyId);
  let transferBound = keyInfo.data.soulbound >= keyInfo.data.inventory;

  return (<>
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>Key Detail</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Flex>
          <VStack>
            {keyInfo.data.isRoot ? <FcKey size='70px'/> : <HiOutlineKey size='70px'/> } 
            {keyInfo.data.isRoot && 
              <Tag colorScheme='yellow'><TagLabel>Root Key</TagLabel></Tag>}
            {keyInfo.data.soulbound.toString() !== '0' &&
              <Tag colorScheme='purple'><TagLabel>{keyInfo.data.soulbound.toString()} × Soulbound</TagLabel></Tag>}
          </VStack>
          <VStack ml='1em' spacing='0.1em' align='stretch'>
            <Text><b>Trust Name:</b> {keyInfo.data.trust.name}</Text>
            <Text><b>Key Alias:</b> {keyInfo.data.alias}</Text>
            <Text><b>Key ID:</b> {keyInfo.data.keyId}</Text>
            <HStack>
              <Text>
                <b>Inventory:</b>&nbsp; 
                {keyInfo.data.inventory.toString()} of {keyInventory.isSuccess && keyInventory.data.total}
              </Text>
              {!keyInventory.isSuccess && <Skeleton width='1.1em' height='1.1em'/>}
            </HStack>
          </VStack>
          <Spacer/>
          <Center>
            <VStack>
              <Link to={'/trust/' + keyInfo.data.trust.id}>
                <Button colorScheme='gray' leftIcon={<BsEye/>}>See Trust</Button>
              </Link>
              {!transferBound && (<Button colorScheme='blue' leftIcon={<FiSend/>}>Send Key</Button>)}
              {transferBound && (
                <VStack>
                  <Button colorScheme='blue' isDisabled leftIcon={<FiSend/>}>Send Key</Button>
                  <Text fontSize='sm' fontStyle='italic' color='gray.500'>Keys are soulbound</Text>
                </VStack>
              )}
            </VStack>
          </Center>
        </Flex>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </ModalContent>
  </>);
};

export default Keys;
