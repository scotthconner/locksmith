//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box, BoxProps,
  Button,
  Center,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  Flex,
  FormErrorMessage,
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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spacer,
  Stack,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import { HiOutlineKey } from 'react-icons/hi';
import { FcKey } from 'react-icons/fc';
import { BsEye } from 'react-icons/bs';
import { Link } from 'react-router-dom';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers } from 'ethers';
import {
  useAccount
} from 'wagmi';

import {
  useWalletKeys,
  useKeyInfo,
  useKeyInventory,
  useSendKey,
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
  const keyInventory = useKeyInventory(keyInfo.data.keyId);
  const transferBound = keyInfo.data.soulbound >= keyInfo.data.inventory;
  const sendDisclosure = useDisclosure();
  const [sendAmount, setSendAmount] = useState(0);
  const [address, setAddress] = useState('');
  var isError = !ethers.utils.isAddress(address);
  const toast = useToast();

  var handleChange = (e) => {

    setAddress(e.target.value);
  }

  const sendConfig = useSendKey(keyInfo.data.keyId, address, sendAmount, function(error) {
    // error
    toast({
      title: 'Transaction Error!',
      description: error.toString(),
      status: 'error',
      duration: 9000,
      isClosable: true
    });
  }, function(data) {
    // success
    toast({
      title: 'Keys Sent!',
      description: 'I hope you meant to do that.',
      status: 'success',
      duration: 9000,
      isClosable: true
    });
    onClose();
  });

  var sendButtonProps = sendConfig.isLoading ? {isLoading: true} : (
    isError || sendAmount < 1 ? {isDisabled: true} : {}
  );

  const onSubmit = () => {
    sendConfig.write?.();
  }

  return (<>
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>Key Detail</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Collapse in={!sendDisclosure.isOpen} width='100%'>
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
          <VStack>
            <Link to={'/trust/' + keyInfo.data.trust.id + '/keys/'}>
              <Button colorScheme='gray' leftIcon={<BsEye/>}>See Trust</Button>
            </Link>
            {!transferBound && (
              <Button colorScheme='blue' 
                onClick={sendDisclosure.onToggle}
                leftIcon={<FiSend/>}>Send Key</Button>)}
            {transferBound && (
              <VStack>
                <Button colorScheme='blue' isDisabled leftIcon={<FiSend/>}>Send Key</Button>
                <Text fontSize='sm' fontStyle='italic' color='gray.500'>Keys are soulbound</Text>
              </VStack>
            )}
          </VStack>
        </Flex>
        </Collapse>
        <Collapse in={sendDisclosure.isOpen} width='100%'>
          <FormControl id="destination" isInvalid={isError}>
            <FormLabel>Destination Address</FormLabel>
              <Input
                placeholder="0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
                _placeholder={{ color: 'gray.500' }}
                onChange={handleChange}/>
            { isError && <FormErrorMessage>Destination address invalid</FormErrorMessage>}
          </FormControl>
          <HStack spacing='1em'>
            <Box ml='0.5em' width='68%'>
              <Slider width='90%' m='1em' mt='1em' defaultValue={0} min={0}
                max={keyInfo.data.inventory.toNumber()} step={1}
                onChangeEnd={setSendAmount}>
                <SliderTrack bg='blue.200'>
                  <Box position='relative' right={10} />
                  <SliderFilledTrack bg='blue.600'/>
                </SliderTrack>
                <SliderThumb boxSize={10}>
                  <Box color='blue.700'><HiOutlineKey size='30px'/></Box>
                </SliderThumb>
              </Slider>
            </Box>
            <Text fontSize='lg' fontWeight='bold'>
              {sendAmount}&nbsp;/&nbsp;{keyInfo.data.inventory.toNumber()}
            </Text>
            <Spacer/>
            <Button {... sendButtonProps} onClick={onSubmit}
              leftIcon={<FiSend/>} colorScheme='blue'>Send</Button>
          </HStack>
        </Collapse>
      </ModalBody>
      <ModalFooter>
        <Collapse in={sendDisclosure.isOpen}>
          <Button onClick={sendDisclosure.onToggle}>Nevermind</Button>
        </Collapse>
      </ModalFooter>
    </ModalContent>
  </>);
};

export default Keys;
