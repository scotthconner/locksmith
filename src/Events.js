//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  Heading,
  HStack,
  List,
  ListItem,
  Skeleton,
  Spacer,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { BiCheckCircle  } from 'react-icons/bi';
import { BsShieldLock } from 'react-icons/bs';
import { IoIosHourglass } from 'react-icons/io';
import { FiPower } from 'react-icons/fi';
import { KeyInfoIcon } from './components/KeyInfo.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { 
  useWalletKeys, 
  useInspectKey,
  useTrustInfo,
} from './hooks/LocksmithHooks.js';
import { 
  useOracleKeyEvents,
  useFireKeyOracleEvent,
} from './hooks/KeyOracleHooks.js';
import { 
  useEventDescription,
  useEventState
} from './hooks/TrustEventLogHooks.js';

//////////////////////////////////////
// Events Function Component
//////////////////////////////////////
function Events() {
  const keys = useWalletKeys();

  return (
    <Stack m='1em' spacing='1em'>
      <Heading size='md' mb='2em'>Your Key Events</Heading>
      { !keys.isSuccess && <List spacing='2em'>
        <ListItem><Skeleton width='100%' height='4em'/></ListItem>
        <ListItem><Skeleton width='100%' height='4em'/></ListItem>
        <ListItem><Skeleton width='100%' height='4em'/></ListItem>
      </List> }
      { keys.isSuccess && <VStack spacing='2em'>
        {keys.data.map((k) => <KeyEventListItems key={'key-event-list-items' + k.toString()} keyId={k}/>)} 
      </VStack> }
    </Stack>
  );
}

const KeyEventListItems = ({keyId, ...rest}) => {
  const keyEvents = useOracleKeyEvents(keyId);

  return <>
    { !keyEvents.isSuccess && <Skeleton width='100%' height='4em'/> }
    { keyEvents.isSuccess && keyEvents.data.map((event) => 
      <KeyEventListItem key={'key-event-list-item-for-' + event} keyId={keyId} eventHash={event}/>
    )}
  </>
}

const KeyEventListItem = ({keyId, eventHash, ...rest}) => {
  const toast = useToast();
  const boxColor = useColorModeValue('white', 'gray.800');
  const eventDescription = useEventDescription(eventHash); 
  const eventState = useEventState(eventHash);
  const key = useInspectKey(keyId);
  const trust = useTrustInfo(key.isSuccess ? key.data.trustId : null);
  const fireEvent = useFireKeyOracleEvent(keyId, 
    eventState.isSuccess && !eventState.data ? eventHash : null,  
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
        title: 'Event Fired!',
        description: 'The event has been enabled.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    }
  );

  const buttonProps = fireEvent.isLoading ? {isLoading: true} : {};

  return <Box p='1em' width='90%'
      borderRadius='lg' bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
    <HStack spacing='1em'>
      { !eventState.isSuccess && <Skeleton width='1.7em' height='1.7em'/> }
      { eventState.isSuccess && eventState.data && <BiCheckCircle color='green' size='24px'/> }
      { eventState.isSuccess && !eventState.data && <IoIosHourglass color='gray' size='24px'/> }
      <VStack align='stretch'>
        { !eventDescription.isSuccess && <Skeleton width='10em' height='1em'/> }
        { eventDescription.isSuccess && <Text fontWeight='bold'>{eventDescription.data}</Text> }
        <HStack>
          <Text>{eventState.data ? 'Used' : 'Use'}</Text>
          { !key.isSuccess && <Skeleton width='5em' height='1em'/> }
          { key.isSuccess && KeyInfoIcon(key) }
          { key.isSuccess && <Text><i>{key.data.alias}</i> from </Text> }
          <BsShieldLock/>
          { !trust.isSuccess && <Skeleton width='5em' height='1em'/> }
          { trust.isSuccess && <Text><i>{trust.data.name}</i></Text> }
        </HStack>
      </VStack>
      <Spacer/>
      { eventState.isSuccess && !eventState.data &&
        <Button {...buttonProps} colorScheme='green' leftIcon={<FiPower/>} 
          onClick={() => { fireEvent.write?.(); }}>Enable</Button> }
    </HStack>
  </Box>
}
export default Events;
