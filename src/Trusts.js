//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  useParams
} from 'react-router-dom';
import {
  Button,
  Center,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Spacer,
  Tag, TagLabel,
  Tabs, TabList, Tab,
  TabPanels, TabPanel,
  Text,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import { ConnectWalletPrompt } from './components/Locksmith.js';
import { IoIosAdd } from 'react-icons/io';
import { BiCoinStack } from 'react-icons/bi';
import { 
  FiShare2
} from 'react-icons/fi';
import { 
  HiOutlineKey, 
  HiOutlineLightningBolt
} from 'react-icons/hi';
import { RiSafeLine, RiQuillPenLine } from 'react-icons/ri';
import { 
  TrustKey,
  CreateKeyModal
} from './trusts/TrustKeys.js';
import {
  TrustEvent,
  AddEventDialog,
} from './trusts/Events.js';
import { 
  TrustedLedgerActors, 
  AddTrustedLedgerActorModal
} from './trusts/LedgerActors.js';
import { 
  TrustArn,
  DepositFundsModal,
} from './trusts/Assets.js';
import {
  TrustPolicy,
  AddPolicyDialog,
} from './trusts/Policies.js';
import { useNavigate } from 'react-router-dom';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import {
  useWalletKeys,
  useWalletTrusts,
  useKeyBalance,
  useTrustInfo, 
  useTrustKeys,
} from './hooks/LocksmithHooks.js';
import {
  COLLATERAL_PROVIDER,
  SCRIBE,
  useTrustedActors,
} from './hooks/NotaryHooks.js';
import {
  TRUST_CONTEXT_ID,
  useContextArnRegistry,
  useContextBalanceSheet
} from './hooks/LedgerHooks.js';
import {
  useTrustEventRegistry,
} from './hooks/TrustEventLogHooks.js';
import {
  useTrustPolicyKeys,
} from './hooks/TrusteeHooks.js';
import {
  ContextBalanceUSD
} from './components/Trust.js';
import { useAccount } from 'wagmi';

//////////////////////////////////////
// Trusts Function Component
//////////////////////////////////////
export function Trusts() {
  // this could be as bad as O(n) + 1 where n 
  // is the number of keys in the wallet. In most
  // cases, it will be O(1).
  const {isConnected} = useAccount();
  const navigate = useNavigate();
  const trusts = useWalletTrusts(); 

  return !isConnected ? <ConnectWalletPrompt/> : (
    <Stack m='1em' spacing='1em'>
      <HStack width='100%'>
        <Heading size='md'>Your Wallet Participation</Heading>
        <Spacer/>
        <Button leftIcon={<IoIosAdd/>} colorScheme='blue'
          onClick={() => { navigate('/wizard'); }}>Create Wallet</Button>
      </HStack>
      <Wrap padding='3em' spacing='2em' pb='6em'>
        {!trusts.isSuccess && <> 
        <WrapItem key='1'>
          <Skeleton width='14em' height='16em'/>
        </WrapItem>
        <WrapItem key='2'>
          <Skeleton width='14em' height='16em'/>
        </WrapItem>
        <WrapItem key='3'>
          <Skeleton width='14em' height='16em'/>
        </WrapItem></>}
        { trusts.isSuccess && trusts.data.length < 1 &&
          <VStack spacing='1em' width='100%'>
            <Text fontSize='30px'>You have no trusts.</Text>
            <Button colorScheme='blue' onClick={() => {navigate('/wizard');}}>Design Wallet</Button>
          </VStack>
        }
        { trusts.isSuccess &&
            trusts.data.map((t) => <TrustSummary key={'trust-' + t} trustId={t}/>) }
      </Wrap>
    </Stack>
  );
}
export function TrustSummary({trustId, ...rest}) {
  const navigate = useNavigate();
  const trustInfo = useTrustInfo(trustId);
  const trustArns = useContextArnRegistry(TRUST_CONTEXT_ID, trustId);
  const trustEvents = useTrustEventRegistry(trustId);
  const trustPolicies = useTrustPolicyKeys(trustId);
  const walletKeys = useWalletKeys();
  const boxColor = useColorModeValue('white', 'gray.800');
  const hasRoot = !(trustInfo.isSuccess && walletKeys.isSuccess) ? false :
    walletKeys.data.map((k) => { return k.toString() })
      .includes(trustInfo.data.rootKeyId.toString());

  return (
    <WrapItem key={'summary-' + trustId} p='1em' w='14em' h='16em'
      border={hasRoot ? '2px' : '0px'}
      borderColor={hasRoot ? 'yellow.400' : 'white'}
      borderRadius='lg'
      bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
        <Center width='14em'>
          <VStack spacing='1em'>
            {!trustInfo.isSuccess && <Skeleton width='8em' height='1em'/>}
            {trustInfo.isSuccess && <Text fontSize='lg'><b>{trustInfo.data.name}</b></Text>}
            <VStack spacing='0em'>
              <ContextBalanceUSD mt='2em' contextId={TRUST_CONTEXT_ID} identifier={trustId} textProps={{
                fontSize: '2xl',
                cursor: 'pointer',
                onClick: () => { navigate('/trust/' + trustId + '/assets/')}
              }} skeletonProps={{width: '6em', height: '1.5em'}}/>
              <Text fontSize='sm' color='gray.500'><i>in total assets</i></Text>
            </VStack>
            <HStack spacing='1em'>
              { !trustArns.isSuccess && <Skeleton borderRadius='full' width='3.5em' height='2em'/> }
              { trustArns.isSuccess &&
                <Tooltip label='Assets'>
                  <Button borderRadius='full' leftIcon={<BiCoinStack/>}
                    onClick={() => { navigate('/trust/' + trustId + '/assets/')}}>
                      {trustArns.data.length}
                  </Button>
                </Tooltip> }
              { !trustInfo.isSuccess && <Skeleton borderRadius='full' width='3.5em' height='2em'/>}
              { trustInfo.isSuccess && 
                <Tooltip label='Keys'>
                  <Button borderRadius='full' leftIcon={<HiOutlineKey/> }
                    onClick={() => { navigate('/trust/' + trustId + '/keys/')}}>
                      {trustInfo.data.trustKeyCount.toString()}
                  </Button>
                </Tooltip> }
            </HStack>
            <HStack spacing='1em'>
              { !trustEvents.isSuccess && <Skeleton borderRadius='full' width='3.5em' height='2em'/>}
              { trustEvents.isSuccess &&
                <Tooltip label='Events'>
                  <Button borderRadius='full' leftIcon={<HiOutlineLightningBolt/>}
                    onClick={() => { navigate('/trust/' + trustId + '/events/') }}>
                      { trustEvents.data.length }
                  </Button> 
                </Tooltip> }
              { !trustPolicies.isSuccess && <Skeleton borderRadius='full' width='3.5em' height='2em'/>}
              { trustPolicies.isSuccess &&
                <Tooltip label='Trustees'>
                  <Button borderRadius='full' leftIcon={<FiShare2/>}
                    onClick={() => { navigate('/trust/' + trustId + '/policies/')}}>
                      {trustPolicies.data.length}
                  </Button>
                </Tooltip> }
            </HStack>
          </VStack>
        </Center>
    </WrapItem>
  )
}

export function Trust() {
  const { id, tab } = useParams();
  const trustInfo = useTrustInfo(id);
  const trustBalanceSheet = useContextBalanceSheet(TRUST_CONTEXT_ID, id);
  const trustArns = trustBalanceSheet.isSuccess ? trustBalanceSheet.data[0] : []; 
  const trustArnBalances = trustBalanceSheet.isSuccess ? trustBalanceSheet.data[1] : [];
  const trustKeys = useTrustKeys(trustInfo.isSuccess ? trustInfo.data.trustId : null);
  const trustPolicyKeys = useTrustPolicyKeys(id);
  const trustedProviders = useTrustedActors(id, COLLATERAL_PROVIDER);
  const registeredEvents = useTrustEventRegistry(id);
  const trustedScribes = useTrustedActors(id, SCRIBE);
  const providerDisclosure = useDisclosure();
  const scribeDisclosure = useDisclosure();
  const createKeyDisclosure = useDisclosure();
  const depositDisclosure = useDisclosure();
  const createEventDisclosure = useDisclosure();
  const trusteeDisclosure = useDisclosure();
  var account = useAccount();
  var userKeyBalance = useKeyBalance(trustInfo.isSuccess ? trustInfo.data.rootKeyId : null, account.address);
  var hasRoot = userKeyBalance.isSuccess && userKeyBalance.data > 0 ? true : false;

  // tab counts
  let trustArnCount = trustBalanceSheet.isSuccess ?
    <Tag mr='1em'><TagLabel>{trustArns.length}</TagLabel></Tag> :
    <Skeleton mr='1em' width='1em' height='1em'/>;
  let trustKeyCount = trustInfo.isSuccess ? 
    <Tag mr='1em'><TagLabel>{trustInfo.data.trustKeyCount.toNumber()}</TagLabel></Tag> : 
    <Skeleton mr='1em' width='1em' height='1em'/>;
  let providerCount = trustedProviders.isSuccess ?  
    <Tag mr='1em'><TagLabel>{trustedProviders.data.length}</TagLabel></Tag> : 
    <Skeleton mr='1em' width='1em' height='1em'/>;
  let scribeCount = trustedScribes.isSuccess ?  
    <Tag mr='1em'><TagLabel>{trustedScribes.data.length}</TagLabel></Tag> : 
    <Skeleton mr='1em' width='1em' height='1em'/>;
  let eventCount = registeredEvents.isSuccess ?
    <Tag mr='1em'><TagLabel>{registeredEvents.data.length}</TagLabel></Tag> :
    <Skeleton mr='1em' width='1em' height='1em'/>;
  let trusteeCount = trustPolicyKeys.isSuccess ?
    <Tag mr='1em'><TagLabel>{trustPolicyKeys.data.length}</TagLabel></Tag> :
    <Skeleton mr='1em' width='1em' height='1em'/>;
  
  return (<>
    {!trustInfo.isSuccess ? <Skeleton width='20em' height='3em'/> :
      <Heading>
        {trustInfo.data.trustKeyCount < 1 ? 'Invalid Trust' : trustInfo.data.name}
      </Heading>
    }
    <Tabs isLazy isFitted mt='1.5em' defaultIndex={['assets','keys','events','policies','providers','scribes'].indexOf(tab)}>
      <TabList>
        <Tab>{trustArnCount}Assets</Tab>
        <Tab>{trustKeyCount}Keys</Tab>
        <Tab>{eventCount}Events</Tab>
        <Tab>{trusteeCount}Trustees</Tab>
        <Tab>{providerCount}Providers</Tab>
        <Tab>{scribeCount}Scribes</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {!trustBalanceSheet.isSuccess ? <Skeleton width='14em' height='1.1em' mt='1.5em'/> :
            <HStack mt='1.5em'>
              <Text fontSize='lg'>
                This trust has <b>{trustArns.length}</b> asset&nbsp;
                {trustArns.length > 1 || trustArns.length === 0 ? 'types' : 'type'}.
              </Text>
              <Spacer/>
               {hasRoot && trustInfo.isSuccess && <Button
                  colorScheme='blue'
                  leftIcon={<IoIosAdd/>}
                  onClick={depositDisclosure.onOpen}>
                    Deposit</Button>}
              {(hasRoot && trustInfo.isSuccess) && 
                <DepositFundsModal rootKeyId={trustInfo.data.rootKeyId}
                  trustId={id} onClose={depositDisclosure.onClose}
                  isOpen={depositDisclosure.isOpen}/>}
            </HStack>
          }
          {!(trustBalanceSheet.isSuccess && trustInfo.isSuccess) ?
            <VStack mt='1.5em'>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
            </VStack>
            :
            <VStack spacing='1em' pb='2em' pt='2em'>
              { trustArns.map((arn, x) => (
                <TrustArn trustId={id} rootKeyId={trustInfo.data.rootKeyId} 
                  key={arn} arn={arn} balance={trustArnBalances[x]}
                  trustKeys={trustKeys}/>
              ))}
            </VStack>}
        </TabPanel>
        <TabPanel>
          {!trustInfo.isSuccess ? <Skeleton width='14em' height='1.1em' mt='1.5em'/> :
            <HStack mt='1.5em'>
              <Text fontSize='lg'>
                This trust has <b>{trustInfo.data.trustKeyCount.toString()}</b>&nbsp;
                {trustInfo.data.trustKeyCount > 1 ? 'keys' : 'key'}.
              </Text>
              <Spacer/>
                {hasRoot && <Button
                  colorScheme='blue'
                  leftIcon={<IoIosAdd/>}
                  onClick={createKeyDisclosure.onOpen}>
                    Add Key</Button>}
                {hasRoot && <CreateKeyModal
                  trustId={id} rootKeyId={trustInfo.data.rootKeyId}
                  isOpen={createKeyDisclosure.isOpen}
                  onClose={createKeyDisclosure.onClose}/>}
            </HStack>
          }
          {!trustKeys.isSuccess ?
            <VStack mt='1.5em'>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
            </VStack>
            :
            <VStack spacing='1em' pb='2em' pt='2em'>
              { trustKeys.data.map((k) => (
                <TrustKey rootKeyId={trustInfo.data.rootKeyId} key={k} keyId={k}/>
              ))}
            </VStack>}
        </TabPanel>
        <TabPanel>
          {!registeredEvents.isSuccess && <>
            <Skeleton width='14em' height='1.1em' mt='1.5em'/>
            <VStack mt='1.5em'>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
            </VStack></>}
          {registeredEvents.isSuccess && <>
              <HStack mt='1.5em'>
                <Text fontSize='lg'>
                  This trust has <b>{registeredEvents.data.length}</b>&nbsp;
                  {registeredEvents.data.length > 1 || 
                    registeredEvents.data.length === 0 ? 'events' : 'event'}.
                </Text>
                <Spacer/>
                {hasRoot && <Button
                  colorScheme='blue'
                  leftIcon={<IoIosAdd/>}
                  onClick={createEventDisclosure.onOpen}>
                    Add Event</Button>}
                {hasRoot && <AddEventDialog trustId={id} isOpen={createEventDisclosure.isOpen}
                  onClose={createEventDisclosure.onClose} rootKeyId={trustInfo.data.rootKeyId}/>}
              </HStack>
              <VStack spacing='1em' pb='2em' pt='2em'>
              { registeredEvents.data.map((event) => (
                <TrustEvent trustId={id} key={event} eventHash={event}/> 
              ))}
              </VStack></>
          }
        </TabPanel>
        <TabPanel>
          { !(trustPolicyKeys.isSuccess || trustInfo.isSuccess) && <>
            <Skeleton width='14em' height='1.1em' mt='1.5em'/>
            <VStack mt='1.5em'>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
            </VStack></>
          }{ trustPolicyKeys.isSuccess && trustInfo.isSuccess &&
            <><HStack mt='1.5em'>
                <Text fontSize='lg'>
                  This trust has <b>{trustPolicyKeys.data.length}</b> trustee&nbsp;
                  {trustPolicyKeys.data.length === 1 ? 'policy' : 'policies'}.
                </Text>
                <Spacer/>
                {hasRoot && <Button
                  colorScheme='blue'
                  leftIcon={<IoIosAdd/>}
                  onClick={trusteeDisclosure.onOpen}>
                    Add Trustee</Button>}
                {hasRoot && <AddPolicyDialog trustId={id} rootKeyId={trustInfo.data.rootKeyId} 
                  onClose={trusteeDisclosure.onClose} isOpen={trusteeDisclosure.isOpen}/> }
              </HStack>
              <VStack spacing='1em' pb='2em' pt='2em'>
              { trustPolicyKeys.data.map((k) => (
                <TrustPolicy rootKeyId={trustInfo.data.rootKeyId} 
                  trustId={id} keyId={k} key={'policy-' + k.toString()}/>
              ))}</VStack></>
          }
        </TabPanel>
        <TabPanel>
          {!(trustedProviders.isSuccess && trustInfo.isSuccess) ? <> 
            <Skeleton width='14em' height='1.1em' mt='1.5em'/> 
            <VStack mt='1.5em'>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
            </VStack></> : <>
              <HStack mt='1.5em'> 
                <Text fontSize='lg'>
                  This trust has <b>{trustedProviders.data.length}</b>&nbsp;
                  trusted collateral {trustedProviders.data.length > 1 || 
                    trustedProviders.data.length === 0 ? 'providers' : 'provider'}.
                </Text>
                <Spacer/>
                {hasRoot && <Button 
                  colorScheme='blue'
                  leftIcon={<IoIosAdd/>}
                  onClick={providerDisclosure.onOpen}>
                    Add Provider</Button>}
                {hasRoot && <AddTrustedLedgerActorModal
                  trustId={id} rootKeyId={trustInfo.data.rootKeyId}
                  role={COLLATERAL_PROVIDER} isOpen={providerDisclosure.isOpen}
                  onClose={providerDisclosure.onClose}
                  modalTitle='Add Collateral Provider'
                  roleName='Provider'
                  roleIcon={<RiSafeLine/>}>
                  <Text>By trusting a <b>collateral provider</b>, you will enable that contract&nbsp;
                    to <b>deposit</b> funds for the root key, and <b>withdrawal</b> funds on behalf of your trust's keyholders.
                  </Text>
                </AddTrustedLedgerActorModal>}
              </HStack>
            <VStack spacing='1em' pb='2em' pt='2em'>
              { trustedProviders.data.map((a) => (
                <TrustedLedgerActors
                  trustId={id}
                  key={a}
                  rootKeyId={trustInfo.data.rootKeyId}
                  actor={a}
                  role={COLLATERAL_PROVIDER}
                  roleIcon={<RiSafeLine size='30px'/>}/>
              ))}
            </VStack></>
          }
        </TabPanel>
        <TabPanel>
          {!(trustedScribes.isSuccess && trustInfo.isSuccess) ? <> 
            <Skeleton width='14em' height='1.1em' mt='1.5em'/> 
              <VStack mt='1.5em'>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
            </VStack></> : <>
            <HStack mt='1.5em'>
              <Text fontSize='lg'>
                This trust has <b>{trustedScribes.data.length}</b> trusted ledger&nbsp;
                {trustedScribes.data.length > 1 || trustedScribes.data.length === 0 ? 'scribes' : 'scribe'}. 
              </Text>
              <Spacer/>
              {hasRoot && <Button
                  colorScheme='blue'
                  leftIcon={<IoIosAdd/>}
                  onClick={scribeDisclosure.onOpen}>
                    Add Scribe</Button>}
                {hasRoot && <AddTrustedLedgerActorModal
                  trustId={id} rootKeyId={trustInfo.data.rootKeyId}
                  role={SCRIBE} isOpen={scribeDisclosure.isOpen}
                  onClose={scribeDisclosure.onClose}
                  modalTitle='Add Scribe'
                  roleName='Scribe'
                  roleIcon={<RiQuillPenLine/>}>
                  <Text>By trusting a <b>scribe</b>, you enable that contract&nbsp;
                    to <b>distrbute</b> funds from the root key to key holders of your trust.
                  </Text>
                </AddTrustedLedgerActorModal>}
            </HStack>
            <VStack spacing='1em' pb='2em' pt='2em'>
              { trustedScribes.data.map((a) => (
                <TrustedLedgerActors
                  trustId={id}
                  key={a}
                  rootKeyId={trustInfo.data.rootKeyId}
                  actor={a}
                  role={SCRIBE}
                  roleIcon={<RiQuillPenLine size='30px'/>}/>
              ))}
            </VStack></>
          }
        </TabPanel>
      </TabPanels>
    </Tabs>
  </>)
}
