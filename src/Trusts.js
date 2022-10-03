//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  useParams
} from 'react-router-dom';
import {
  Button,
  Heading,
  HStack,
  Skeleton,
  Spacer,
  Tag, TagLabel,
  Tabs, TabList, Tab,
  TabPanels, TabPanel,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { IoIosAdd } from 'react-icons/io';
import { RiSafeLine, RiQuillPenLine } from 'react-icons/ri';
import { TrustKey } from './trusts/TrustKeys.js';
import { 
  TrustedLedgerActors, 
  AddTrustedLedgerActorModal
} from './trusts/LedgerActors.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import {
  useKeyBalance,
  useTrustInfo, 
  useTrustKeys,
} from './hooks/LocksmithHooks.js';
import {
  COLLATERAL_PROVIDER,
  SCRIBE,
  useTrustedActors,
} from './hooks/NotaryHooks.js';
import { useAccount } from 'wagmi';

//////////////////////////////////////
// Trusts Function Component
//////////////////////////////////////
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
  let trustedProviders = useTrustedActors(id, COLLATERAL_PROVIDER);
  let trustedScribes = useTrustedActors(id, SCRIBE);
  let providerDisclosure = useDisclosure();
  let scribeDisclosure = useDisclosure();
  var account = useAccount();
  var userKeyBalance = useKeyBalance(trustInfo.isSuccess ? trustInfo.data.rootKeyId : null, account.address);
  var hasRoot = userKeyBalance.isSuccess && userKeyBalance.data > 0 ? true : false;

  // tab counts
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
    <Tabs isLazy isFitted mt='1.5em'>
      <TabList>
        <Tab>{trustKeyCount}Keys</Tab>
        <Tab>{providerCount}Collateral Providers</Tab>
        <Tab>{scribeCount}Scribes</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {!trustInfo.isSuccess ? <Skeleton width='14em' height='1.1em' mt='1.5em'/> :
            <Text mt='1.5em' fontSize='lg'>
              This trust has <b>{trustInfo.data.trustKeyCount.toString()}</b>&nbsp;
              {trustInfo.data.trustKeyCount > 1 ? 'keys' : 'key'}
            </Text>}
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
                  trusted collateral {trustedProviders.data.length > 1 ? 'providers' : 'provider'}.
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
                {trustedScribes.data.length > 1 ? 'scribes' : 'scribe'}. 
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
