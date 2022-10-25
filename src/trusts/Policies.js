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
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
  Tooltip,
  VStack,
  useDisclosure,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

// icons
import { KeyInfoIcon } from '../components/KeyInfo.js';
import { AiOutlineUser } from 'react-icons/ai';
import { BiCheckCircle } from 'react-icons/bi';
import { BsTrash } from 'react-icons/bs';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import { FaRegHandshake } from 'react-icons/fa';
import { FiPower } from 'react-icons/fi';
import { FcCheckmark } from 'react-icons/fc';
import { IoIosHourglass } from 'react-icons/io';
import Locksmith from '../services/Locksmith.js';

// Hooks
import { 
  useInspectKey,
  useKeyHolders,
  useTrustKeys,
} from '../hooks/LocksmithHooks.js';
import { 
  useEventState,
  useEventDescription,
  useTrustEventRegistry,
} from '../hooks/TrustEventLogHooks.js';
import { 
  useTrustPolicyKeys,
  usePolicy, 
  useRemovePolicy,
  useSetPolicy,
} from '../hooks/TrusteeHooks.js';

// hook components
import {
  TrustKeyOption
} from './Events.js';

export function TrustPolicy({trustId, rootKeyId, keyId, ...rest}) {
	var boxColor = useColorModeValue('white', 'gray.800');
	const toast = useToast();
    const beneficiariesDisclosure = useDisclosure();
    const eventsDisclosure = useDisclosure();
    const key = useInspectKey(keyId);
    const policy = usePolicy(keyId);
    const keyHolders = useKeyHolders(keyId);
    const removePolicy = useRemovePolicy(rootKeyId, keyId, 
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
          title: 'Trustee Policy Removed!',
          description: 'This distribution rule has been deleted.',
          status: 'success',
          duration: 9000,
          isClosable: true
        });
      }
    );

    const removeProps = removePolicy.isLoading ? {isLoading: true} : {};

    return  <Box p='1em' width='90%' 
      borderRadius='lg' bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
	  <HStack spacing='1em'>
        { !key.isSuccess && policy.isSuccess && <Skeleton width='2em' height='2em'/> }
        { key.isSuccess && policy.isSuccess && KeyInfoIcon(key, 30) }
        { !key.isSuccess && <Skeleton width='5em' height='1em'/> }
        { !key.isSuccess && <Skeleton width='8em' height='1em'/> }
        { key.isSuccess && <b>{key.data.alias}</b> }
        { policy.isSuccess && <PolicyActivationTag events={policy.data[2]} position={0} total={0}/> }
        { !policy.isSuccess && <Skeleton width='5em' height='1em'/> }
        <Spacer/>
        { !policy.isSuccess && <Skeleton width='2.2em' height='1.3em'/> }
        { policy.isSuccess && 
          <Tooltip label='Beneficiaries'>
            <Button size='sm' leftIcon={<AiOutlineUser/>} onClick={() => {
                beneficiariesDisclosure.onToggle();
                eventsDisclosure.onClose();
              }}>
              {policy.data[1].length}
            </Button> 
          </Tooltip> }
        { !policy.isSuccess && <Skeleton width='2.2em' height='1.3em'/> }
        { policy.isSuccess && 
          <Tooltip label='Required Events'>
            <Button size='sm' leftIcon={<HiOutlineLightningBolt/>}
              onClick={() => { eventsDisclosure.onToggle(); beneficiariesDisclosure.onClose();}}>
                <PolicyFiredEventCount events={policy.data[2]} position={0} total={0}/> / {policy.data[2].length}
            </Button>
          </Tooltip>}
        <Tooltip label='Remove Policy'>
          <Button {...removeProps} colorScheme='red' size='sm'
            onClick={() => {removePolicy.write?.();}}><BsTrash/></Button>
        </Tooltip>
      </HStack>
      <List width='100%' spacing='1em' mt={eventsDisclosure.isOpen ? '1em' : '0'}>
        <Collapse width='100%' in={eventsDisclosure.isOpen}>
          { policy.isSuccess && <PolicyEventList keyId={keyId} events={policy.data[2]}/> }
        </Collapse>
      </List>
      <List width='100%' spacing='1em' mt={beneficiariesDisclosure.isOpen ? '1em' : '0'}>
        <Collapse width='100%' in={beneficiariesDisclosure.isOpen}>
          { policy.isSuccess && <PolicyBeneficiaryList keyId={keyId} beneficiaries={policy.data[1]}/> }
        </Collapse>
      </List>
    </Box>
}

export function PolicyBeneficiaryList({keyId, beneficiaries, ...rest}) {
  const stripeColor = useColorModeValue('gray.100', 'gray.700');
  return beneficiaries.map((b,x) =>
    <ListItem bg={x%2===0 ? stripeColor : ''} p='1em'
        key={'policy-beneficiary-list-item-for-' + keyId + b.toString()}>
      <PolicyBeneficiaryListItem keyId={keyId} beneficiary={b}/>
    </ListItem>)
}

export function PolicyBeneficiaryListItem({keyId, beneficiary, ...rest}) {
  const key = useInspectKey(beneficiary);
  return <HStack>
    { !key.isSuccess && <Skeleton width='2em' height='2em'/> }
    { key.isSuccess && KeyInfoIcon(key) } 
    { !key.isSuccess && <Skeleton width='8em' height='1em'/> }
    { key.isSuccess && <Text>{key.data.alias}</Text> }
    <Text fontStyle='italic' color='gray' fontSize='sm'>(id: {beneficiary.toString()})</Text>
  </HStack>
}

export function PolicyEventList({keyId, events, ...rest}) {
  const stripeColor = useColorModeValue('gray.100', 'gray.700');
  return events.map((e,x) => 
    <ListItem bg={x%2===0 ? stripeColor : ''} p='1em' 
        key={'policy-event-list-item-for-' + keyId + e}>
      <PolicyEventListItem keyId={keyId} event={e}/>
    </ListItem>)
}

export function PolicyEventListItem({keyId, event, ...rest}) {
  const state = useEventState(event);
  const description = useEventDescription(event);

  return <HStack>
    { !state.isSuccess && <Skeleton width='2em' height='2em'/> }
    { state.isSuccess && state.data && <FcCheckmark/> }
    { state.isSuccess && !state.data && <IoIosHourglass/> }
    { !description.isSuccess && <Skeleton width='8em' height='1em'/> }
    { description.isSuccess && <Text>{description.data}</Text> }
  </HStack>
}

export function PolicyFiredEventCount({events, position, total, ...rest}) {
  // recursively gets the state of the events array and returns the final number
  // this number will "grow" when each async hook comes back for each event
  const eventState = useEventState(events.length === 0 ? null : events[position]);
  const doesCount = eventState.isSuccess && eventState.data ? 1 : 0;

  return position >= (events.length-1) ? total + doesCount : 
    <PolicyFiredEventCount events={events} position={position+1}
      total={total+doesCount}/>
}

export function PolicyActivationTag({events, position, total, ...rest}) {
  // recursively gets the state of the events array and returns the final number
  // this number will "grow" when each async hook comes back for each event
  const eventState = useEventState(events.length === 0 ? null : events[position]);
  const doesCount = eventState.isSuccess && eventState.data ? 1 : 0;
  const activated = (total + doesCount) === events.length;
  
  return position >= (events.length-1) ?
      (activated ?
          <Tag size='sm' variant='subtle' colorScheme='green'>
            <TagLeftIcon boxSize='12px' as={FcCheckmark} />
            <TagLabel>Activated</TagLabel>
          </Tag>
        :
          <Tag size='sm' variant='subtle' colorScheme='gray'>
            <TagLeftIcon boxSize='12px' as={IoIosHourglass} />
            <TagLabel>Waiting</TagLabel>
          </Tag>
      ) : 
    <PolicyActivationTag events={events} position={position+1}
      total={total+doesCount}/>
}

export function AddPolicyDialog({trustId, rootKeyId, onClose, isOpen, ...rest}) {
  const toast = useToast();
  const keys = useTrustKeys(trustId);
  const trustPolicies = useTrustPolicyKeys(trustId);
  const trusteeChecks = trustPolicies.isSuccess ? trustPolicies.data.map((k) => k.toString()) : [];
  const events = useTrustEventRegistry(trustId);
  const eventsDisclosure = useDisclosure();
  const keyDisclosure = useDisclosure();
  const reviewDisclosure = useDisclosure(); 
  const [trusteeKey, setTrusteeKey] = useState(null);
  const [eventHashes, setEventHashes] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const trusteeKeyInfo = useInspectKey(trusteeKey);
  const isKeyError = !trusteeKey || trusteeKey === 'Choose Key';
  const setPolicy = useSetPolicy(rootKeyId, trusteeKey, beneficiaries, reviewDisclosure.isOpen ? eventHashes : null,
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
        title: 'Trustee Policy created!',
        description: 'This distribution rule has been saved.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      reviewDisclosure.onClose();
      setTrusteeKey(null);
      setEventHashes([]);
      setBeneficiaries([]);
      onClose();
    }
  );

  const buttonProps = isKeyError ? {isDisabled: true} : {};
  const keyButtonProps = beneficiaries.length < 1 ? {isDisabled: true}: {};
  const policyButtonProps = setPolicy.isLoading ? {isLoading: true} : {};

  const trusteeReview = <HStack mt='1em'>
    <Text>You've chosen to trust </Text>
    {(!trusteeKeyInfo.isSuccess || !trusteeKeyInfo.data) && <Skeleton height='1.2em' width='8em'/>}
    {trusteeKeyInfo.isSuccess && trusteeKeyInfo.data && KeyInfoIcon(trusteeKeyInfo)}
    {trusteeKeyInfo.isSuccess && trusteeKeyInfo.data && <Text><b>{trusteeKeyInfo.data.alias}</b> with distribution rights.</Text>}
  </HStack>

  const eventReview = <VStack mt='2em' align='stretch' spacing='1em'>
    { eventHashes.length > 0 && <Text>But only after:</Text> }
    { eventHashes.map((h) =>
      <SelectedTrustEvent hideRemove={true} eventHash={h}
        key={'selected-trust-event-' + h}/>)}
  </VStack>

  return <Modal onClose={onClose} isOpen={isOpen} isCentered size='xl'>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>Create Trustee Policy</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Collapse in={!eventsDisclosure.isOpen && !keyDisclosure.isOpen && !reviewDisclosure.isOpen}>
            <Text>You can allow a <b>trustee</b> to distribute funds in the trust to certain <b>beneficiaries.</b> You can restrict the ability to distribute assets until certain <b>event conditions</b> are met.</Text> 
            <Text mt='1em'>First, pick a <b>trustee</b> by choosing which key to give distribution rights.</Text>
            <FormControl mt='2em' isInvalid={isKeyError}>
              <FormLabel>Trustee Key</FormLabel>
              <Select placeholder='Choose Key' variant='filled'
                onChange={(e) => { setTrusteeKey(e.target.value) }}>
                {keys.isSuccess && trustPolicies.isSuccess &&  
                  keys.data.filter((k) => !trusteeChecks.includes(k.toString()))
                    .map((k) => !k.eq(rootKeyId) && 
                      <TrustKeyOption key={'select-option-key' + k} keyId={k}/>)}
              </Select>
              { isKeyError && <FormErrorMessage>Which key do you want to give distribution rights to?</FormErrorMessage>}
            </FormControl>
          </Collapse>
          <Collapse in={eventsDisclosure.isOpen}>
            {trusteeReview}
            <FormControl mt='2em'>
              <FormLabel>Add Event Conditions</FormLabel>
              <Select placeholder='Choose Event' variant='filled'
                onChange={(e) => {
                  setEventHashes([eventHashes, e.target.value].flat()); 
                }}>
                  {events.isSuccess &&
                    events.data.map((e) => !eventHashes.includes(e) && 
                      <TrustEventOption key={'select-event-hash-' + e} eventHash={e}/>)}
              </Select>
            </FormControl>
            <VStack mt='2em' align='stretch' spacing='1em'>
            { eventHashes.map((h) => 
              <SelectedTrustEvent eventHash={h} key={'selected-trust-event-' + h}
                removeMe={() => {
                  setEventHashes(eventHashes.filter(function(eh) {
                    return eh !== h;
                  }));
                }}/> ) }
            </VStack>
          </Collapse>
          <Collapse in={keyDisclosure.isOpen}>
            { trusteeReview }
            { eventReview }
            <FormControl mt='2em'>
              <FormLabel>Add Beneficiaries</FormLabel>
              <Select placeholder='Choose Key' variant='filled'
                onChange={(e) => {
                  setBeneficiaries([beneficiaries, e.target.value].flat());
                }}>
                  { keys.isSuccess &&
                      keys.data.map((k) => !k.eq(rootKeyId) && !beneficiaries.includes(k.toString()) && 
                      <TrustKeyOption key={'select-option-key' + k} keyId={k}/>)}
              </Select>
            </FormControl>
            <VStack align='stretch' mt='2em' spacing='1em'>
            { beneficiaries.map((b) => 
              <SelectedBeneficiaryKey keyId={b} key={'selected-beneficiary-key-' + b}
                removeMe={() => {
                  setBeneficiaries(beneficiaries.filter(function(bk) {
                    return bk !== b.toString();
                  }));
                }}/>
            ) }
            </VStack>
          </Collapse>
          <Collapse in={reviewDisclosure.isOpen}>
            { trusteeReview }
            { eventReview }
            <Text mt='2em'>Distribution will be enabled only for:</Text>
            <VStack align='stretch' mt='1em' spacing='1em'>
            { beneficiaries.map((b) =>
              <SelectedBeneficiaryKey keyId={b} key={'selected-beneficiary-review-key-' + b}
                hideRemove={true}/>
            ) }
            </VStack>
          </Collapse>
        </ModalBody>
        <ModalFooter>
          {!eventsDisclosure.isOpen && !keyDisclosure.isOpen && !reviewDisclosure.isOpen && 
            <Button {... buttonProps} colorScheme='blue'
              onClick={eventsDisclosure.onOpen}>
              Trust {trusteeKeyInfo.isSuccess && trusteeKeyInfo.data && 
                ("'" + trusteeKeyInfo.data.alias + "'") }
            </Button> }
          {eventsDisclosure.isOpen && 
            <HStack spacing='1em'>
              <Button onClick={eventsDisclosure.onClose} colorScheme='gray'>Back</Button>
              <Button onClick={() => {keyDisclosure.onOpen(); eventsDisclosure.onClose(); }}
                colorScheme='blue'>
                Require {eventHashes.length} Events
              </Button>
            </HStack> }
          {keyDisclosure.isOpen && 
            <HStack spacing='1em'>
              <Button onClick={() => {
                  keyDisclosure.onClose();
                  eventsDisclosure.onOpen(); 
                }} colorScheme='gray'>Back</Button>
              <Button {... keyButtonProps} colorScheme='blue' onClick={() => {
                  keyDisclosure.onClose();
                  reviewDisclosure.onOpen();
                }}>
                Create {beneficiaries.length} Beneficiaries 
              </Button>
            </HStack> }
          {reviewDisclosure.isOpen && 
            <HStack spacing='1em'>
              <Button onClick={() => {
                  reviewDisclosure.onClose();
                  keyDisclosure.onOpen();
                }} colorScheme='gray'>Back</Button>
              <Button onClick={() => { setPolicy.write?.(); }}
                {... policyButtonProps} colorScheme='yellow'
                leftIcon={<FaRegHandshake/>}>Create Trustee</Button>
            </HStack>
          }
        </ModalFooter>
      </ModalContent>
   </Modal>
}

export function TrustEventOption({eventHash, ...rest}) {
  const description = useEventDescription(eventHash);
  return description.isSuccess && 
    <option value={eventHash}>{description.data}</option>
}

export function SelectedTrustEvent({eventHash, removeMe, hideRemove, ...rest}) {
  const description = useEventDescription(eventHash);
  const state = useEventState(eventHash);

  return <HStack>
    { !state.isSuccess && <Skeleton width='2em' height='2em'/> }
    { state.isSuccess && state.data && <FcCheckmark/> }
    { state.isSuccess && !state.data && <IoIosHourglass/> }
    { !description.isSuccess && <Skeleton width='5em' height='1em'/> }
    { description.isSuccess && <Text>{description.data}</Text> }
    <Spacer/>
    { !hideRemove && <Button size='sm' colorScheme='red' onClick={() => {
      removeMe();
    }}><BsTrash/></Button> }
  </HStack>
}

export function SelectedBeneficiaryKey({keyId, removeMe, hideRemove, ...rest}) {
  const key = useInspectKey(keyId);

  return <HStack>
    { !key.isSuccess && <Skeleton width='2em' height='2em'/> }
    { key.isSuccess && KeyInfoIcon(key) }
    { !key.isSuccess && <Skeleton width='6em' height='1em'/> }
    { key.isSuccess && <Text>{key.data.alias}</Text> }
    <Spacer/>
    { !hideRemove && <Button size='sm' colorScheme='red' onClick={() => {
      removeMe();
    }}><BsTrash/></Button> }
  </HStack>
}
