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
import { 
  BiCheckCircle,
  BiAlarmSnooze,
} from 'react-icons/bi';
import { BsShieldLock } from 'react-icons/bs';
import { IoIosHourglass } from 'react-icons/io';
import { FiPower } from 'react-icons/fi';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import { KeyInfoIcon } from './components/KeyInfo.js';
import { alarmClockExpirationAgo } from './components/AlarmClock.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { BigNumber } from 'ethers';
import { useAccount } from 'wagmi';
import Locksmith from './services/Locksmith.js';
import { 
  useWalletKeys,
  useWalletTrusts,
  useInspectKey,
  useTrustInfo,
  useKeyBalance,
} from './hooks/LocksmithHooks.js';
import { 
  useOracleKeyEvents,
  useFireKeyOracleEvent,
} from './hooks/KeyOracleHooks.js';
import {
  useAlarm,
  useChallengeAlarm,
  useSnoozeAlarm,
} from './hooks/AlarmClockHooks.js';
import { 
  useTrustEventRegistry,
  useEventDescription,
  useEventDispatcher, 
  useEventState
} from './hooks/TrustEventLogHooks.js';

//////////////////////////////////////
// Events Function Component
//////////////////////////////////////
function Events() {
  const keys = useWalletKeys();
  const walletTrusts = useWalletTrusts();

  return (
    <Stack m='1em' spacing='1em'>
      <Heading size='md' mb='2em'>Your Events</Heading>
      { !keys.isSuccess && <List spacing='2em'>
        <ListItem><Skeleton width='100%' height='4em'/></ListItem>
        <ListItem><Skeleton width='100%' height='4em'/></ListItem>
        <ListItem><Skeleton width='100%' height='4em'/></ListItem>
      </List> }
      { keys.isSuccess && <VStack spacing='1em'>
        { keys.data.map((k) => <KeyEventListItems key={'key-event-list-items' + k.toString()} keyId={k}/>)} 
      </VStack> }
      { walletTrusts.isSuccess && <VStack spacing='1em'>
        { walletTrusts.data.map((t) => <TrustAlarmList key={'teli-' + t.toString()} trustId={t}/> ) }
      </VStack> }
    </Stack>
  );
}

const TrustAlarmList = ({trustId, ...rest}) => {
  const alarmClockAddress = Locksmith.getContractAddress('alarmClock');
  const alarms = useTrustEventRegistry(trustId, alarmClockAddress);

  return !alarms.isSuccess ? 
    <Skeleton width='90%' height='4em'/> :
    alarms.data.map((e) => 
      <AlarmClockItem trustId={trustId} eventHash={e} key={'tei-'  + e}/>) 
}

const AlarmClockItem = ({trustId, eventHash, ...rest}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  const eventDescription = useEventDescription(eventHash);
  const eventState = useEventState(eventHash);
  const alarmInfo = useAlarm(eventHash);

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
        { !alarmInfo.isSuccess && <Skeleton width='8em' height='1em'/> }
        <Text color='gray' fontStyle='italic'>
          { alarmInfo.isSuccess && (
            alarmInfo.data.alarmTime*1000 <= (new Date()).getTime() ? 
              'This alarm has expired!' : 
              'This alarm expires in about ' + alarmClockExpirationAgo(1000*alarmInfo.data.alarmTime.toNumber()) 
          ) }
        </Text>
      </VStack>
      <Spacer/>
      { alarmInfo.isSuccess && <AlarmClockSnoozeButton trustId={trustId} eventHash={eventHash}
        alarmTime={1000*alarmInfo.data.alarmTime.toNumber()} snoozeInterval={1000*alarmInfo.data.snoozeInterval.toNumber()}
        snoozeKeyId={alarmInfo.data.snoozeKeyId}/> }
      { alarmInfo.isSuccess && eventState.isSuccess && !eventState.data &&
          <AlarmClockChallengeButton trustId={trustId} eventHash={eventHash}
            alarmTime={1000*alarmInfo.data.alarmTime.toNumber()}/> }
    </HStack>
  </Box>
}

const AlarmClockSnoozeButton = ({trustId, eventHash, alarmTime, snoozeInterval, snoozeKeyId, ...rest}) => {
  const alarmDate = new Date(alarmTime);
  const snoozable = snoozeInterval > 0; 
  const canSnooze = ((new Date()).getTime() + snoozeInterval) >= alarmDate;

  const account = useAccount();
  const toast = useToast();
  const keyBalance = useKeyBalance(snoozeKeyId, account.address);

  const snooze = useSnoozeAlarm(snoozable && canSnooze ? eventHash : null,
    keyBalance.isSuccess && keyBalance.data.gt(BigNumber.from(0)) ? snoozeKeyId : null,
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
        title: 'Alarm successfully snoozed!',
        description: 'The alarm expiry has been delayed.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    }
  );

  return snoozable && keyBalance.isSuccess && keyBalance.data.gt(BigNumber.from(0)) &&  
    <Button isLoading={snooze.isLoading} isDisabled={!canSnooze} 
      colorScheme='blue' leftIcon={<BiAlarmSnooze/>}
        onClick={() => {snooze.write?.();}}>Snooze</Button>
}

const AlarmClockChallengeButton = ({trustId, eventHash, alarmTime, ...rest}) => {
  const canChallenge = ((new Date()) >= (new Date(alarmTime)));
  const toast = useToast();
  const challenge = useChallengeAlarm(canChallenge ? eventHash : null,
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
        title: 'Alarm successfully challenged!',
        description: 'The event has been enabled.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    }
  );

  return <Button isLoading={challenge.isLoading} isDisabled={!canChallenge} colorScheme='red' leftIcon={<HiOutlineLightningBolt/>}
    onClick={() => {challenge.write?.();}}>
    Challenge
  </Button>
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
