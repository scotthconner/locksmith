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
  VStack,
  Wrap,
  WrapItem,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import { IoIosAdd } from 'react-icons/io';
import { BiCoinStack } from 'react-icons/bi';
import { HiOutlineKey } from 'react-icons/hi';
import { RiSafeLine, RiQuillPenLine } from 'react-icons/ri';
import { 
  TrustKey,
  CreateKeyModal
} from './trusts/TrustKeys.js';
import { 
  TrustedLedgerActors, 
  AddTrustedLedgerActorModal
} from './trusts/LedgerActors.js';
import { TrustArn } from './trusts/Assets.js';
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
  TrustBalanceUSD
} from './components/Trust.js';
import { useAccount } from 'wagmi';

//////////////////////////////////////
// Trusts Function Component
//////////////////////////////////////
export function Trusts() {
  // this could be as bad as O(n) + 1 where n 
  // is the number of keys in the wallet. In most
  // cases, it will be O(1).
  const trusts = useWalletTrusts(); 

  return (
    <Stack m='1em' spacing='1em'>
      <Heading size='md'>Your Trust Participation</Heading>
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
          {trusts.isSuccess &&
            trusts.data.map((t) => <TrustSummary key={'trust-' + t} trustId={t}/>)}
        </Wrap>
    </Stack>
  );
}
export function TrustSummary({trustId, ...rest}) {
  const navigate = useNavigate();
  const trustInfo = useTrustInfo(trustId);
  const trustArns = useContextArnRegistry(TRUST_CONTEXT_ID, trustId);
  const trustedProviders = useTrustedActors(trustId, COLLATERAL_PROVIDER);
  const trustedScribes = useTrustedActors(trustId, SCRIBE);
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
              <TrustBalanceUSD mt='2em' trustId={trustId} textProps={{
                fontSize: '2xl',
                cursor: 'pointer',
                onClick: () => { navigate('/trust/' + trustId + '/assets/')}
              }} skeletonProps={{width: '6em', height: '1.5em'}}/>
              <Text fontSize='sm' color='gray.500'><i>in total assets</i></Text>
            </VStack>
            <HStack spacing='1em'>
              {!trustArns.isSuccess && <Skeleton borderRadius='full' width='3.5em' height='2em'/>}
              {trustArns.isSuccess &&
                <Button borderRadius='full' leftIcon={<BiCoinStack/>}
                  onClick={() => { navigate('/trust/' + trustId + '/assets/')}}>
                  {trustArns.data.length}
                </Button>}
              {!trustInfo.isSuccess && <Skeleton borderRadius='full' width='3.5em' height='2em'/>}
              {trustInfo.isSuccess && 
                <Button borderRadius='full' leftIcon={<HiOutlineKey/>}
                  onClick={() => { navigate('/trust/' + trustId + '/keys/')}}>
                  {trustInfo.data.trustKeyCount.toString()}
                </Button>}
            </HStack>
            <HStack spacing='1em'>
              {!trustedProviders.isSuccess && <Skeleton borderRadius='full' width='3.5em' height='2em'/>}
              {trustedProviders.isSuccess &&
                <Button borderRadius='full' leftIcon={<RiSafeLine/>}
                  onClick={() => { navigate('/trust/' + trustId + '/providers/')}}>
                  {trustedProviders.data.length}
                </Button>}
              {!trustedScribes.isSuccess && <Skeleton borderRadius='full' width='3.5em' height='2em'/>}
              {trustedScribes.isSuccess &&
                <Button borderRadius='full' leftIcon={<RiQuillPenLine/>}
                  onClick={() => { navigate('/trust/' + trustId + '/scribes/')}}>
                  {trustedScribes.data.length}
                </Button>}
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
  const trustedProviders = useTrustedActors(id, COLLATERAL_PROVIDER);
  const trustedScribes = useTrustedActors(id, SCRIBE);
  const providerDisclosure = useDisclosure();
  const scribeDisclosure = useDisclosure();
  const createKeyDisclosure = useDisclosure();
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

  return (<>
    {!trustInfo.isSuccess ? <Skeleton width='20em' height='3em'/> :
      <Heading>
        {trustInfo.data.trustKeyCount < 1 ? 'Invalid Trust' : trustInfo.data.name}
      </Heading>
    }
    <Tabs isLazy isFitted mt='1.5em' defaultIndex={['assets','keys','providers','scribes'].indexOf(tab)}>
      <TabList>
        <Tab>{trustArnCount}Assets</Tab>
        <Tab>{trustKeyCount}Keys</Tab>
        <Tab>{providerCount}Collateral Providers</Tab>
        <Tab>{scribeCount}Scribes</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {!trustBalanceSheet.isSuccess ? <Skeleton width='14em' height='1.1em' mt='1.5em'/> :
            <Text mt='1.5em' fontSize='lg'>
              This trust has <b>{trustArns.length}</b> asset&nbsp;
              {trustArns.length > 1 || trustArns.length === 0 ? 'types' : 'type'}.
            </Text>}
          {!trustBalanceSheet.isSuccess ?
            <VStack mt='1.5em'>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
              <Skeleton width='100%' height='4em'/>
            </VStack>
            :
            <VStack spacing='2em' pb='2em' pt='2em'>
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
            <VStack  spacing='2em' pb='2em' pt='2em'>
              { trustKeys.data.map((k) => (
                <TrustKey rootKeyId={trustInfo.data.rootKeyId} key={k} keyId={k}/>
              ))}
            </VStack>}
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
            <VStack  spacing='2em' pb='2em' pt='2em'>
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
            <VStack  spacing='2em' pb='2em' pt='2em'>
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
