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
import { FiPower } from 'react-icons/fi';
import { FcCheckmark } from 'react-icons/fc';
import { IoIosHourglass } from 'react-icons/io';
import Locksmith from '../services/Locksmith.js';

// Hooks
import { 
  useInspectKey,
  useKeyHolders,
} from '../hooks/LocksmithHooks.js';
import { 
  useEventState,
  useEventDescription
} from '../hooks/TrustEventLogHooks.js';
import { 
  usePolicy, 
  useRemovePolicy 
} from '../hooks/TrusteeHooks.js';

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
