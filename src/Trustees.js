//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Collapse,
  Heading,
  HStack,
  List,
  ListItem,
  Skeleton,
  Spacer,
  Stack,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { AiOutlineUser } from 'react-icons/ai';
import { RiSafeLine } from 'react-icons/ri';
import { KeyInfoIcon } from './components/KeyInfo.js';
import { ContextBalanceUSD } from './components/Trust.js';
import { PolicyActivationTag } from './trusts/Policies.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers } from 'ethers';
import { AssetResource } from './services/AssetResource.js';
import {
  useWalletKeys,
  useKeyInfo,
} from './hooks/LocksmithHooks.js';
import {
  COLLATERAL_PROVIDER,
  useTrustedActorAlias,
} from './hooks/NotaryHooks.js';
import {
  KEY_CONTEXT_ID,
  useContextBalanceSheet,
  useContextProviderRegistry,
  useContextArnBalances,
} from './hooks/LedgerHooks.js';
import {
  usePolicy,
} from './hooks/TrusteeHooks.js';
import {
  useCoinCapPrice,
  USDFormatter,
} from './hooks/PriceHooks.js';

//////////////////////////////////////
// Trustees Function Component
//////////////////////////////////////
function Trustees() {
  const keys = useWalletKeys();

  return <Stack m='1em' spacing='1em'>
    <Heading size='md'>Trustee Keys in Your Wallet</Heading>
    <VStack spacing='2em' pb='2em' pt='2em'>
      { !keys.isSuccess && [1,2,3].map((k) => 
        <Skeleton key={'skeleton-key-' + k} width='100%' height='4em' borderRadius='lg'/>
      ) } 
      { keys.isSuccess && keys.data.map((k) => 
        <TrusteeKey keyId={k} key={'trustee-key-component-' + k}/>
      ) } 
    </VStack>
  </Stack>
}

export function TrusteeKey({keyId, ...rest}) {
  const sheetDisclosure = useDisclosure(); 
  const boxColor = useColorModeValue('white', 'gray.800'); 
  const keyInfo = useKeyInfo(keyId);
  const policy = usePolicy(keyId);

  return policy.isSuccess && policy.data[2].length > 0 && 
    <Box width='90%' 
      p='1em' bg={boxColor} borderRadius='lg' boxShadow='dark-lg' 
      _hover={{
        transform: 'scale(1.1)',
      }}>
      <HStack spacing='1.5em' cursor='pointer' onClick={sheetDisclosure.onToggle}>
        { !keyInfo.isSuccess && <Skeleton width='6em' height='1.2em'/> }
        { !keyInfo.isSuccess && <Skeleton width='4em' height='1em'/> }
        { keyInfo.isSuccess && <>
          {KeyInfoIcon(keyInfo, '30px')}    
          <VStack spacing='0' align='stretch'>
            <Text><b>{keyInfo.data.alias}</b></Text>
            <Text fontSize='sm' color='gray'><i>{keyInfo.data.trust.name}</i></Text>
          </VStack>
          <HStack>
            <AiOutlineUser size='24px'/>
            <Text>{policy.data[2].length}</Text>
          </HStack>
        </> }
        <Spacer/>
        <PolicyActivationTag events={policy.data[3]} position={0} total={0}/>
        <ContextBalanceUSD contextId={KEY_CONTEXT_ID} identifier={policy.data[1]} 
          textProps={{fontSize: '2xl' }} skeletonProps={{width: '6em', height: '1.5em'}}/>
      </HStack>
      <Collapse in={sheetDisclosure.isOpen} width='100%'>
        { keyInfo.isSuccess && 
          <KeyBalanceSheet trustId={keyInfo.data.trust.id} 
            keyId={policy.data[1]}/> }
      </Collapse>
    </Box>
}

export function KeyBalanceSheet({trustId, keyId, ...rest}) {
  const keyBalanceSheet = useContextBalanceSheet(KEY_CONTEXT_ID, keyId);
  return !keyBalanceSheet.isSuccess ? <VStack mt='1em' spacing='1em'>
    <Skeleton width='100%' height='3em'/>
    <Skeleton width='100%' height='3em'/>
    <Skeleton width='100%' height='3em'/>
  </VStack> :
  <List spacing='1em' mt='1em'>
    { keyBalanceSheet.data[0].map((arn, x) => 
      <KeyAssetBalanceOption trustId={trustId} keyId={keyId} arn={arn}
        balance={keyBalanceSheet.data[1][x]}
          key={'key-balance-sheet-for-' + arn + keyId}/>
    )}
  </List>
}

export function KeyAssetBalanceOption({trustId, keyId, arn, balance, ...rest}) {
  const asset = AssetResource.getMetadata(arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const ethAmount = ethers.utils.formatEther(balance);
  const assetValue = assetPrice.isSuccess ?
    USDFormatter.format(ethAmount * assetPrice.data) : null;
  const providers = useContextProviderRegistry(KEY_CONTEXT_ID, keyId, arn);
  const providerDisclosure = useDisclosure();

  return <ListItem padding='1em' borderRadius='lg'> 
    <HStack spacing='1em' cursor='pointer' onClick={providerDisclosure.onToggle}>
      {asset.icon()}
      <Text><b>{asset.name}</b>&nbsp;
        <font color='gray'>({asset.symbol})</font>
      </Text>
      <Spacer/>
      <VStack align='stretch'>
        <HStack fontSize='sm'>
          <Spacer/>
          { providers.isSuccess && <HStack>
            <RiSafeLine/>
            <Text>x {providers.data.length}&nbsp;&nbsp;</Text> 
          </HStack> }
          {assetValue ? <Text>{assetValue}</Text> : <Skeleton width='4em' height='1em'/>}
        </HStack>
        <HStack>
          <Spacer/>
          <Text size='sm' color='gray'>{ethAmount} {asset.symbol}</Text>
        </HStack>
      </VStack>
    </HStack>
    <Collapse in={providerDisclosure.isOpen}>
      <Wrap spacing='1em' p='1em'>{ providers.isSuccess && providers.data.map((p,x) =>
        <KeyArnProviderOption trustId={trustId} keyId={keyId} 
          arn={arn} provider={p} key={'kapo-' + keyId + arn + p}/>
      ) }</Wrap>
    </Collapse>
  </ListItem>
}

export function KeyArnProviderOption({trustId, keyId, arn, provider, ...rest}) {
  const asset = AssetResource.getMetadata(arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const providerBalance = useContextArnBalances(KEY_CONTEXT_ID, keyId, [arn], provider);
  const providerAlias = useTrustedActorAlias(trustId, COLLATERAL_PROVIDER, provider); 
  const ethAmount = !providerBalance.isSuccess ? 0 : 
    ethers.utils.formatEther(providerBalance.data[0]);
  const usdAmount = assetPrice.isSuccess ?
    USDFormatter.format(ethAmount * assetPrice.data) : null;
  const boxColor = useColorModeValue('gray.100', 'gray.700'); 
  
  return <WrapItem borderRadius='lg' bg={boxColor} p='1em' boxShadow='lg'
    _hover={{transform: 'scale(1.1)'}} cursor='pointer'>
    <VStack spacing='0'>
      <Text fontSize='2xl'>{usdAmount}</Text>
      <Text fontSize='sm' color='gray' fontStyle='italic'>{ethAmount} {asset.symbol}</Text>
      <HStack pt='1em'>
        <RiSafeLine/>
        { !providerAlias.isSuccess && <Skeleton width='5en' height='1.2em'/> }
        { providerAlias.isSuccess && <Text>{providerAlias.data}</Text> }
      </HStack>
    </VStack>
  </WrapItem>
}

export default Trustees;
