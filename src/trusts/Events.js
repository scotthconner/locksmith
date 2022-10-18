import {
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  HStack,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalContent,
  Select,
  Skeleton,
  Spacer,
  Text,
  VStack,
  useDisclosure,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { KeyInfoIcon } from '../components/KeyInfo.js';
import { BiCheckCircle } from 'react-icons/bi';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import { FiPower } from 'react-icons/fi';
import { IoIosHourglass } from 'react-icons/io';
import Locksmith from '../services/Locksmith.js';
import {
  useInspectKey,
  useTrustKeys,
} from '../hooks/LocksmithHooks.js';
import {
  useEventDescription,
  useEventState,
  useEventDispatcher,
} from '../hooks/TrustEventLogHooks.js';
import {
  useEventKey,
  useCreateKeyOracle,
} from '../hooks/KeyOracleHooks.js';

export function TrustEvent({trustId, eventHash, ...rest}) {
	var boxColor = useColorModeValue('white', 'gray.800');
    const eventDescription = useEventDescription(eventHash);
    const eventState = useEventState(eventHash);
    const eventDispatcher = useEventDispatcher(eventHash);
    const keyOracleAddress = Locksmith.getContractAddress('keyOracle');

    const eventTypes = {}
    eventTypes[keyOracleAddress] = 'KEY_ORACLE';
    const eventType = !eventDispatcher.isSuccess ? null : 
      eventTypes[eventDispatcher.data] || 'UNKNOWN';

	return  <Box p='1em' width='90%' 
      borderRadius='lg' bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
      <HStack>
        { !eventState.isSuccess && <Skeleton width='1.2em' height='1.2em'/>}
        { eventState.isSuccess && eventState.data && <BiCheckCircle color='green' size='24px'/> }
        { eventState.isSuccess && !eventState.data && <IoIosHourglass color='gray' size='24px'/> }
        <VStack align='stretch'>
          { !eventDescription.isSuccess && <Skeleton width='10em' height='1em'/> }
          { eventDescription.isSuccess && <Text><b>{eventDescription.data}</b></Text> }
          { !eventDispatcher.isSuccess && <Skeleton width='15em' height='1em'/> }
          { eventType === 'KEY_ORACLE' && 
            <KeyOracleEventDescription eventHash={eventHash}/> 
          }
          { eventType === 'UNKNOWN' &&
            <Text color='gray'>We don't recognize the event dispatcher.</Text>
          }
        </VStack>
        <Spacer/>
      </HStack>
	</Box>
}

const KeyOracleEventDescription = ({eventHash, ... rest}) => {
  const eventKey = useEventKey(eventHash);
  return !eventKey.isSuccess ? <Skeleton width='12em' height='1em'/> :
    <KeyOracleKeyLabel keyId={eventKey.data}/> 
}

const KeyOracleKeyLabel = ({keyId, ...rest}) => {
  const key = useInspectKey(keyId);
  return !key.isSuccess ? <Skeleton width='12em' height='1em'/> :
    <HStack>
      <Text color='gray'>This event is at the discretion of</Text>
      {key.isSuccess ? KeyInfoIcon(key) : <Skeleton width='2em' height='2em'/>}
      {key.isSuccess ? <Text fontWeight='bold' color='gray'>{key.data.alias}</Text> : 
        <Skeleton width='4em' height='1em'/>}
    </HStack>
}

export const AddEventDialog = ({trustId, rootKeyId, isOpen, onClose}) => {
  const choicesDisclosure = useDisclosure();
  const keyOracleDisclosure = useDisclosure();

  return <Modal onClose={onClose} isOpen={isOpen} isCentered size='xl'>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>Create Trust Event</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Collapse in={!choicesDisclosure.isOpen} width='100%'> 
          <Text>Choose an <b>event</b> you want to track as part of your trust's execution.</Text>
          <List mt='1em' padding='1em'>
            <ListItem>
              <HStack>
                <Box width='5em'><FiPower color='green' size='40px'/></Box>
                <VStack align='stretch' width='18em'>
                  <Text fontWeight='bold'>Key Oracle</Text>
                  <Text>Create an event button for a trust key holder.</Text>
                </VStack>
                <Spacer/>
                <Button colorScheme='blue' onClick={() => {
                  choicesDisclosure.onOpen();
                  keyOracleDisclosure.onOpen();
                }}>Create</Button>
              </HStack>
            </ListItem>
          </List>
          </Collapse>
          <Collapse in={keyOracleDisclosure.isOpen} width='100%'>
            <KeyOracleForm trustId={trustId} rootKeyId={rootKeyId} onClose={onClose}/>
          </Collapse>
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </ModalContent>
  </Modal>
}

const KeyOracleForm = ({trustId, rootKeyId, onClose}) => {
  const keys = useTrustKeys(trustId);
  const toast = useToast();

  const [eventDescription, setEventDescription] = useState('');
  const isDescriptionError = eventDescription.length < 5;

  const [eventKey, setEventKey] = useState(null);
  const isKeyError = !eventKey || eventKey === 'Choose Key';

  const createKeyOracle = useCreateKeyOracle(rootKeyId, isKeyError ? null : eventKey,
    isDescriptionError ? null : eventDescription,
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
        title: 'Key Oracle Created!',
        description: 'They event has been added to your trust',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      onClose();
    }
  );

  const buttonProps = isKeyError || isDescriptionError ? {isDisabled: true} :
    createKeyOracle.isLoading ? {isLoading: true} : {};

  return <VStack spacing='2em'>
     <Text>Choose a short description and a key that must be held to trigger an event.</Text>
     <FormControl id="Event Label" isInvalid={isDescriptionError}>
      <FormLabel>Event Label</FormLabel>
        <Input
          placeholder="My ephemeral emersion."
          _placeholder={{ color: 'gray.500' }}
          onChange={(e) => { setEventDescription(e.target.value)}}/>
          { isDescriptionError && <FormErrorMessage>Please provide a short description.</FormErrorMessage>}
      </FormControl>
      <FormControl isInvalid={isKeyError}>
        <FormLabel>Trust Key Requirement</FormLabel>
        <Select placeholder='Choose Key' variant='filled'
          onChange={(e) => { setEventKey(e.target.value) }}> 
          {keys.isSuccess && 
            keys.data.map((k) => <TrustKeyOption key={'select-option-key' + k} keyId={k}/>)}
        </Select>
        { isKeyError && <FormErrorMessage>Choose a key required to signal an event.</FormErrorMessage>} 
      </FormControl>
    <HStack width='100%'>
      <Spacer/>
      <Button {...buttonProps} leftIcon={<HiOutlineLightningBolt/>} colorScheme='yellow'
        onClick={
          () => { createKeyOracle.write?.(); }
        }>Mint Event</Button>
    </HStack>
  </VStack>
}

const TrustKeyOption = ({keyId, ...rest}) => {
  const key = useInspectKey(keyId);
  return <option value={keyId.toString()}>{keyId.toString()}:&nbsp; 
    {key.isSuccess && key.data.alias}</option>
}
