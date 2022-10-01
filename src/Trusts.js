//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  useParams
} from 'react-router-dom';
import {
  Box,
  BoxProps,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  List,
  ListItem,
  ListIcon,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  ModalFooter,
  Skeleton,
  Collapse,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Spacer,
  Text,
  Tag,
  TagLabel,
  TagLeftIcon,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  KeyInfoIcon
} from './components/KeyInfo.js';
import { 
  AiOutlineUser,
  AiOutlineNumber,
  AiOutlineFire,
} from 'react-icons/ai';
import { HiOutlineKey } from 'react-icons/hi';
import { FcKey } from 'react-icons/fc';
import { FaTimes } from 'react-icons/fa';
import { BiGhost } from 'react-icons/bi';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { 
  useTrustInfo, 
  useTrustKeys,
  useKeyInfo,
  useKeyInventory,
  useKeyHolders,
  useKeyBalance,
  useSoulboundKeyAmounts,
} from './hooks/LocksmithHooks.js';
import {
  useAccount
} from 'wagmi';

//////////////////////////////////////
// Trustees Function Component
//////////////////////////////////////
interface KeyProps extends BoxProps {
  keyId: BigNumber
}

export function Trusts() {
  return (
    <>
      Trusts! 
    </>
  );
}

export function Trust() {
  let { id } = useParams();
  let trustInfo = useTrustInfo(id);
  let trustKeys = useTrustKeys(trustInfo.isSuccess ? trustInfo.data.trustId : null);
  let { isOpen, onOpen, onClose, onToggle } = useDisclosure();


  return (<>
    {!trustInfo.isSuccess ? (
      <HStack>
        <Skeleton width='3em' height='3m'/>
        <VStack>
          <Skeleton height='3em' width='20em'/>
          <Skeleton mt='1.5em' height='1.5em' width='30em'/>
        </VStack>
      </HStack>
    ): (<>
      <Heading>{trustInfo.data.trustKeyCount < 1 ? 'Invalid Trust' : trustInfo.data.name}</Heading>
      <Text mt='1.5em' fontSize='lg'>This trust has <b>{trustInfo.data.trustKeyCount.toString()}</b> keys.</Text>
      <VStack padding='3em' spacing='2em' pb='6em'>
        { (!trustKeys.isSuccess || trustInfo.data.trustKeyCount < 1) ? (<></>) : 
          trustKeys.data.map((k) => (
            <TrustKey rootKeyId={trustInfo.data.rootKeyId} key={k} keyId={k}/>
          ))
        }
      </VStack>
    </>)} 
  </>)
}

const TrustKey = ({keyId, rootKeyId, ...rest}: KeyProps) => {
  var account = useAccount();
  var keyInfo = useKeyInfo(keyId);
  var keyInventory = useKeyInventory(keyId);
  var userKeyBalance = useKeyBalance(rootKeyId, account.address);
  var keyHolders = useKeyHolders(keyId);
  const { onToggle, isOpen, getDisclosureProps, getButtonProps } = useDisclosure();
  const buttonProps = getButtonProps();
  const disclosureProps = getDisclosureProps();
  var boxColor = useColorModeValue('white', 'gray.800');
  var hasRoot = userKeyBalance.isSuccess && userKeyBalance.data > 0 ? true : false; 

  return (
    <Box p='1em' width='90%' 
      border={keyInfo.isSuccess && keyInfo.data.isRoot ? '2px' : '0px'}
      borderColor={keyInfo.isSuccess && keyInfo.data.isRoot ? 'yellow.400' : 'white'}
      borderRadius='lg'
      bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
        <HStack spacing='1em'>
          { !keyInfo.isSuccess ?
                <HStack>    
                  <Skeleton width='2.0em' height='1.1em'/>
                  <Skeleton width='7.5em' height='1.1em'/>
                </HStack>
            : 
          <HStack>
            <Tag>
              <TagLeftIcon boxSize='12px' as={AiOutlineNumber} />
              <TagLabel>{(keyInfo.data.keyId).toString()}</TagLabel>
            </Tag>
            <Text><b>{keyInfo.data.alias}</b></Text>
          </HStack> }
          <Spacer/>
          <HStack spacing='1.5em'>
            <HStack>
              {!keyInventory.isSuccess || !keyInfo.isSuccess ? 
              <Skeleton width='2.2em' height='1.3em'/> : 
              <Button {... !(hasRoot) ? {isDisabled: true} : {}}
              size='sm' leftIcon={KeyInfoIcon(keyInfo)}>{keyInventory.data.total}</Button>}
            </HStack>
            <HStack>
              {!keyHolders.isSuccess ? 
              <Skeleton width='2.2em' height='1.3em'/> : 
              <Button {... buttonProps} size='sm' leftIcon={<AiOutlineUser/>}>{keyHolders.data.length}</Button>}
            </HStack>
          </HStack> }
        </HStack>
        <HStack>
        {!keyHolders.isSuccess ? '' :
              <List width='100%' mt='1em' spacing='1em' {... disclosureProps} transition='all 0.2s ease-in-out'>
                <Divider/>
                <Collapse in={isOpen} width='100%'>
                  <KeyHolderList hasRoot={hasRoot} keyId={keyId} keyHolders={keyHolders.data}/>
                </Collapse>
              </List>} 
        </HStack>
    </Box>
  )
}

const KeyHolderList = ({keyId, keyHolders, hasRoot, ...rest}: KeyProps) => { 
  return keyHolders.map((address, x) => (
    <AddressKeyBalance hasRoot={hasRoot} 
      key={'key: ' + keyId + " address " + address} 
        rowNum={x} keyId={keyId} address={address}/>
  ));
}

const AddressKeyBalance = ({keyId, address, rowNum, hasRoot, ...rest}: KeyProps) => { 
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const account = useAccount();
  const keyBalance = useKeyBalance(keyId, address);
  const soulboundCount = useSoulboundKeyAmounts(keyId, address);
  const stripeColor = useColorModeValue('gray.100', 'gray.700');

  var buttonContent = null;
  var rootProps = hasRoot ? {} : {isDisabled: true};
  var modalProps = {onClick: () => { onToggle(); }}; 

  return (<ListItem padding='1em' bg={rowNum % 2 == 0 ? stripeColor : ''}> 
      <HStack>
        <AiOutlineUser/>
        <Text>{address == account.address ? <i>(you)</i> : address}</Text>
        <Spacer/>
        <HStack>
          <Button size='sm' {... rootProps} {... modalProps} leftIcon={<HiOutlineKey/>} variant='outline' colorScheme='blue'>
            {(soulboundCount.isSuccess ? soulboundCount.data : '0').toString() === '0' ? '' : 
                soulboundCount.data.toString() + ' / '}&nbsp;{keyBalance.isSuccess ? keyBalance.data.toString() : '?'}
          </Button>
          {!soulboundCount.isSuccess ? '' : (
            <AddressKeyActionModal
              keyId={keyId} address={address} 
              soulbound={soulboundCount.data.toNumber()} 
              isOpen={isOpen} onOpen={onOpen} onClose={onClose}/>)}
        </HStack>
      </HStack>
    </ListItem>
  )
}

const AddressKeyActionModal = ({keyId, address, soulbound, onOpen, onClose, isOpen, ...rest}: KeyProps) => {
  const account = useAccount();
  const [soulbindAmount, setSoulbindAmount] = useState(soulbound);
  const keyBalance = useKeyBalance(keyId, address);
  const soulboundCount = useSoulboundKeyAmounts(keyId, address);
  const keyInfo = useKeyInfo(keyId);
  const carefulColor = useColorModeValue('red.600','orange');
  var burnLabel = '';

  if(keyBalance.isSuccess) {
    burnLabel = (keyBalance.data.toNumber() + " ") 
      + (keyBalance.data.toNumber() > 1 ? "Keys" : "Key");
  }

  return ( 
    <Modal onClose={onClose} isOpen={isOpen} isCentered size='xl'>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>
          <HStack>
            {keyInfo.isSuccess && KeyInfoIcon(keyInfo) }
            <Text>{keyInfo.isSuccess && keyInfo.data.alias}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Center>
            <Box padding='2em'> 
              <VStack>
                <Text fontWeight='bold' fontStyle='italic' fontSize='md'>{address}</Text>
                {address === account.address && 
                  <Text fontSize='2xl' color={carefulColor}><i>Careful, this is <b>you!</b></i></Text>}
              </VStack>
            </Box>
          </Center>
          <HStack spacing='1em'>
            <Box width='60%'>
              <Slider width='90%' m='1em' mt='2em' defaultValue={soulbindAmount} min={0} 
                max={keyBalance.isSuccess ? keyBalance.data : 1} step={1} 
                onChangeEnd={setSoulbindAmount}>
              <SliderTrack bg='purple.200'>
                <Box position='relative' right={10} />
                <SliderFilledTrack bg='purple.600'/>
              </SliderTrack>
              <SliderThumb boxSize={10}>
                <Box color='purple'><HiOutlineKey size='30px'/></Box> 
              </SliderThumb>
            </Slider>
            </Box>
            <Text fontSize='lg' fontWeight='bold'>
              {soulbindAmount} /&nbsp;
                  {(keyBalance.isSuccess ? keyBalance.data.toString() : '0')}
            </Text>
            <Spacer/>
            <Button leftIcon={<BiGhost/>} colorScheme='purple'>Soulbind</Button>
          </HStack>
          <HStack>
          <Text>You <b>burn</b> keys to take them away.</Text>
            <Spacer/>
            <Button leftIcon={<AiOutlineFire/>} colorScheme='red'>
              Burn {burnLabel} 
            </Button>
          </HStack>
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </ModalContent>
    </Modal>)
}
