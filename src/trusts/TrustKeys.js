//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  Center,
  Collapse,
  Input,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  ModalFooter,
  Skeleton,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spacer,
  Text,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import {
  KeyInfoIcon
} from '../components/KeyInfo.js';
import { 
  AiOutlineUser,
  AiOutlineNumber,
  AiOutlineFire,
} from 'react-icons/ai';
import { HiOutlineKey } from 'react-icons/hi';
import { BiGhost } from 'react-icons/bi';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { 
  useKeyInfo,
  useKeySupply,
  useKeyHolders,
  useKeyBalance,
  useSoulboundKeyAmounts,
  useCopyKey,
  useCreateKey,
  useBurnKey,
  useSoulbindKey,
} from '../hooks/LocksmithHooks.js';
import {ethers} from 'ethers';
import { useAccount } from 'wagmi';

//////////////////////////////////////
// Trustees Function Component
//////////////////////////////////////
export function TrustKey({keyId, rootKeyId, ...rest}) {
  var account = useAccount();
  var keyInfo = useKeyInfo(keyId);
  var keyInventory = useKeySupply(keyId);
  var userKeyBalance = useKeyBalance(rootKeyId, account.address);
  var keyHolders = useKeyHolders(keyId);
  const { isOpen, getButtonProps } = useDisclosure();
  const copyKeyDisclosure = useDisclosure();
  const buttonProps = getButtonProps();
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
              <Tooltip label='Copy Key'>
                <Button {... !(hasRoot) ? {isDisabled: true} : {}}
                  onClick={copyKeyDisclosure.onOpen}
                  size='sm' leftIcon={KeyInfoIcon(keyInfo)}>{keyInventory.data.toString()}</Button>
              </Tooltip> }
              <KeyActionModal
                rootKeyId={rootKeyId} keyId={keyId}
                isOpen={copyKeyDisclosure.isOpen} onOpen={copyKeyDisclosure.onOpen} 
                onClose={copyKeyDisclosure.onClose}/>
            </HStack>
            <HStack>
              {!keyHolders.isSuccess ? 
              <Skeleton width='2.2em' height='1.3em'/> : 
              <Tooltip label='Key Holders'>
                <Button {... buttonProps} size='sm' leftIcon={<AiOutlineUser/>}>{keyHolders.data.length}</Button>
              </Tooltip> }
            </HStack>
          </HStack> }
        </HStack>
        <HStack>
        {!keyHolders.isSuccess ? '' :
        <List width='100%' mt={isOpen ? '1em' : '0'} spacing='1em'> 
            <Collapse in={isOpen} width='100%'>
              <KeyHolderList rootKeyId={rootKeyId} hasRoot={hasRoot} keyId={keyId} keyHolders={keyHolders.data}/>
            </Collapse>
          </List>} 
        </HStack>
    </Box>
  )
}

const KeyHolderList = ({rootKeyId, keyId, keyHolders, hasRoot, ...rest}) => { 
  return keyHolders.map((address, x) => (
    <AddressKeyBalance hasRoot={hasRoot} 
      key={'key: ' + keyId + " address " + address} 
        rootKeyId={rootKeyId} rowNum={x} keyId={keyId} address={address}/>
  ));
}

const AddressKeyBalance = ({rootKeyId, keyId, address, rowNum, hasRoot, ...rest}) => { 
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const account = useAccount();
  const keyBalance = useKeyBalance(keyId, address);
  const soulboundCount = useSoulboundKeyAmounts(keyId, address);
  const stripeColor = useColorModeValue('gray.100', 'gray.700');
  const hasNoSoulbound = (soulboundCount.isSuccess ? soulboundCount.data : '0').toString() === '0';

  var rootProps = hasRoot ? {} : {isDisabled: true};
  var modalProps = {onClick: () => { onToggle(); }}; 

  return (<ListItem padding='1em' bg={rowNum % 2 === 0 ? stripeColor : ''}> 
      <HStack>
        <AiOutlineUser/>
        <Text noOfLines={1}>{address === account.address ? <i>(you)</i> : address}</Text>
        <Spacer/>
        <HStack>
          <Button size='sm' {... rootProps} {... modalProps} 
            leftIcon={ hasNoSoulbound ? <HiOutlineKey/> : <BiGhost/>} 
            variant='outline' colorScheme='blue'>
              {hasNoSoulbound ? '' : 
                soulboundCount.data.toString() + ' / '}&nbsp;{keyBalance.isSuccess ? keyBalance.data.toString() : '?'}
          </Button>
          {!soulboundCount.isSuccess ? '' : (
            <AddressKeyActionModal
              rootKeyId={rootKeyId} keyId={keyId} address={address} 
              soulbound={soulboundCount.data.toNumber()} 
              isOpen={isOpen} onOpen={onOpen} onClose={onClose}/>)}
        </HStack>
      </HStack>
    </ListItem>
  )
}

const KeyActionModal = ({rootKeyId, keyId, onOpen, onClose, isOpen, ...rest}) => {
  const initialRef = useRef(null);
  const [isChecked, setChecked] = useState(false);
  const toast = useToast();
  const keyInfo = useKeyInfo(keyId);
  const [input, setInput] = useState('');
  var isError = !ethers.utils.isAddress(input);
  const handleInputChange = (e) => {
    setInput(e.target.value);
  }

  const writeConfig = useCopyKey(rootKeyId, keyId, input || '', isChecked, function(error) {
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
      title: 'Key copied!',
      description: 'The key is now in ' + input,
      status: 'success',
      duration: 9000,
      isClosable: true
    });
    setInput('');
    onClose();
  });

  var buttonProps = writeConfig.isLoading ? {isLoading: true} : {};
  
  const onSubmit = () => {
    writeConfig.write?.(); 
  }

  const onModalClose = () => {
    setInput('');
    onClose();
  }

  return (
    <Modal onClose={onModalClose} isOpen={isOpen} isCentered size='lg' initalFocusRef={initialRef}>
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
          <VStack>
            <Text
              mb='1.5em'
              color={useColorModeValue('gray.800', 'gray.400')}>
              You can <b>copy</b> this key into another wallet.
            </Text>
            <FormControl id="destination" isInvalid={isError}>
              <FormLabel>Destination Address</FormLabel>
              <Input
                ref={initialRef}
                placeholder="0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
                _placeholder={{ color: 'gray.500' }}
                onChange={handleInputChange}/>
              { isError && <FormErrorMessage>Destination address invalid</FormErrorMessage>}
            </FormControl>
            <FormControl>
              <HStack mt='1.5em'>
                <FormLabel>Do you want to <b>soulbind</b> this key?</FormLabel>
                <Spacer/>
                <Switch colorScheme='purple' size='lg' 
                  onChange={(e) => {setChecked(e.target.checked);}}/>
              </HStack>
            </FormControl>
          </VStack> 
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button
              leftIcon={<HiOutlineKey/>}
              bg='yellow.400'
              color={'black'}
              _hover={{
                bg: 'yellow.300',
              }}
              onClick={onSubmit}
              loadingText='Signing'
              isDisabled={isError}
              {...buttonProps}>
              Copy Key
            </Button>
            <Button onClick={onClose}>Close</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>)
}

const AddressKeyActionModal = ({rootKeyId, keyId, address, soulbound, onOpen, onClose, isOpen, ...rest}) => {
  const account = useAccount();
  const keyBalance = useKeyBalance(keyId, address);
  const soulboundCount = useSoulboundKeyAmounts(keyId, address);
  const keyInfo = useKeyInfo(keyId);
  const carefulColor = useColorModeValue('red.600','orange');

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
          {keyBalance.isSuccess && soulboundCount.isSuccess && <BindFormControl
              rootKeyId={rootKeyId} keyId={keyId} address={address}
              onClose={onClose} keyBalance={keyBalance.data.toNumber()}
              soulbound={soulboundCount.data.toNumber()}/>}
          {keyBalance.isSuccess && <BurnFormControl
              rootKeyId={rootKeyId} keyId={keyId} address={address}
              onClose={onClose} keyBalance={keyBalance.data.toNumber()}/>}
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </ModalContent>
    </Modal>)
}

const BindFormControl = ({rootKeyId, keyId, address, keyBalance, soulbound, onClose, ...rest}) => {
  const toast = useToast();
  const [soulbindAmount, setSoulbindAmount] = useState(soulbound);
  const bindConfig = useSoulbindKey(rootKeyId, keyId, address, soulbindAmount, function(error) {
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
      title: 'Keys bound!',
      description: 'The user now has ' + soulbindAmount + ' bound keys.',
      status: 'success',
      duration: 9000,
      isClosable: true
    });
    onClose();
  });

  var bindButtonProps = bindConfig.isLoading ? {isLoading: true} : {};

  const onBindSubmit= () => {
    bindConfig.write?.();
  }

  return (
    <HStack spacing='1em'>
      <Box width='60%'>
        <Slider width='90%' m='1em' mt='2em' defaultValue={soulbound} min={0}
          max={keyBalance} step={1}
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
        {soulbindAmount}&nbsp;/&nbsp;{keyBalance}
      </Text>
      <Spacer/>
      <Button {... bindButtonProps} onClick={onBindSubmit}
        leftIcon={<BiGhost/>} colorScheme='purple'>Bind</Button>
    </HStack>
  )
}

const BurnFormControl = ({rootKeyId, keyId, address, keyBalance, onClose, ...rest}) => {
  const toast = useToast();
  const [burnAmount, setBurnAmount] = useState(0);
  const burnConfig = useBurnKey(rootKeyId, keyId, address, burnAmount, function(error) {
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
      title: 'Keys burned!',
      description: 'User now has ' + burnAmount + ' less key(s).',
      status: 'success',
      duration: 9000,
      isClosable: true
    });
    onClose();
  });
  var burnButtonProps = burnConfig.isLoading ? {isLoading: true} : {};

  const onBurnSubmit= () => {
    burnConfig.write?.();
  }

  return (
    <HStack spacing='1em'>
      <Box width='60%'>
        <Slider width='90%' m='1em' mt='2em' defaultValue={0} min={0}
          max={keyBalance} step={1}
          onChangeEnd={setBurnAmount}>
        <SliderTrack bg='red.200'>
          <Box position='relative' right={10} />
          <SliderFilledTrack bg='red.600'/>
        </SliderTrack>
        <SliderThumb boxSize={10}>
          <Box color='red'><HiOutlineKey size='30px'/></Box>
        </SliderThumb>
        </Slider>
      </Box>
      <Text fontSize='lg' fontWeight='bold'>
        {burnAmount}&nbsp;/&nbsp;{keyBalance}
      </Text>
      <Spacer/>
      <Button {... burnButtonProps} onClick={onBurnSubmit}
        leftIcon={<AiOutlineFire/>} colorScheme='red'>Burn</Button>
    </HStack>
  )
}

export function CreateKeyModal({trustId, rootKeyId, isOpen, onClose, ...rest}) {
  const initialRef = useRef(null);
  const toast = useToast();
  const [alias, setAlias] = useState('');
  const [address, setAddress] = useState('');
  const [bind, setBind] = useState('');
  var isInvalidAlias   = alias.length < 3;
  var isInvalidAddress = !ethers.utils.isAddress(address);
  var handleAliasChange = (e) => {
    if (e.target.value.length < 32) {
      setAlias(e.target.value);
    }
  }
  var createKey = useCreateKey(rootKeyId, alias, address, bind, 
    function(error) {
      toast({
        title: 'Transaction Error!',
        description: error.toString(),
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    },
    function(data) {
      toast({
        title: 'Key ' + alias + ' created!',
        description: 'It has been sent to ' + address + '.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      onClose();
    }
  );

  var buttonProps = createKey.isLoading ? {isLoading: true} : 
    (isInvalidAlias || isInvalidAddress ? {isDisabled: true} : {}); 

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered initialFocusRef={initialRef} size='xl'>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>Create Key</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>By creating a <b>key</b>, you can craft unique permissions for your trust.</Text>
          <FormControl id='key_alias' isInvalid={isInvalidAlias} mt='1.5em'>
            <FormLabel>Key Name</FormLabel>
            <Input
              ref={initialRef}
              value={alias}
              placeholder="Beneficiary #1"
              _placeholder={{ color: 'gray.500' }}
              onChange={handleAliasChange}/>
            { isInvalidAlias ?
              <FormErrorMessage>Key name must be at least three characters.</FormErrorMessage> :
              <FormHelperText>Name the key for its designed purpose.</FormHelperText>
            }
          </FormControl>
          <FormControl id='receiver_address' isInvalid={isInvalidAddress} mt='1.5em'>
            <FormLabel>Receiver Wallet Address</FormLabel>
            <Input
              placeholder="0xfd471836031dc5108809d173a067e8486b9047a3"
              _placeholder={{ color: 'gray.500' }}
              onChange={(e) => { setAddress(e.target.value); }}/>
            { isInvalidAddress ?
              <FormErrorMessage>This doesn't seem like a valid address.</FormErrorMessage> :
              <FormHelperText>The newly created key will go here.</FormHelperText>
            }
          </FormControl>
          <FormControl>
              <HStack mt='1.5em'>
                <FormLabel>Do you want to <b>soulbind</b> this key?</FormLabel>
                <Spacer/>
                <Switch colorScheme='purple' size='lg'
                  onChange={(e) => {setBind(e.target.checked);}}/>
              </HStack>
            </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => { createKey.write?.(); }}
            {... buttonProps}
            leftIcon={<HiOutlineKey/>} ml='1.5em'
            colorScheme='yellow'>Create Key</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
