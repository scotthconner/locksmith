//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Heading,
  HStack,
  Skeleton,
  Stack,
  Text,
  Wrap,
  WrapItem,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { KeyInfoIcon } from './components/KeyInfo.js';
import { ContextBalanceUSD } from './components/Trust.js';
import { PolicyActivationTag } from './trusts/Policies.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import {
  useWalletKeys,
  useKeyInfo,
} from './hooks/LocksmithHooks.js';
import {
  KEY_CONTEXT_ID,
} from './hooks/LedgerHooks.js';
import {
  usePolicy,
} from './hooks/TrusteeHooks.js';

//////////////////////////////////////
// Trustees Function Component
//////////////////////////////////////
function Trustees() {
  const keys = useWalletKeys();

  return <Stack m='1em' spacing='1em'>
    <Heading size='md'>Trustee Keys in Your Wallet</Heading>
    <Wrap padding='3em' spacing='2em' pb='6em'>
      { !keys.isSuccess && [1,2,3].map((k) => 
        <TrusteeKeySkeleton k={k} key={'trustee-key-skeleton-' + k}/>
      ) } 
      { keys.isSuccess && keys.data.map((k) => 
        <TrusteeKey keyId={k} key={'trustee-key-component-' + k}/>
      ) } 
    </Wrap>
  </Stack>
}

export function TrusteeKeySkeleton({k, ...rest}) {
  return  <WrapItem key={k} w='10em' h='12em' borderRadius='lg'>
    <Skeleton width='10em' height='12em' borderRadius='lg'/>
  </WrapItem>
}

export function TrusteeKey({keyId, ...rest}) {
  const boxColor = useColorModeValue('white', 'gray.800'); 
  const keyInfo = useKeyInfo(keyId);
  const policy = usePolicy(keyId);

  return policy.isSuccess && policy.data[2].length > 0 && 
    <WrapItem key={'trustee-key-' + keyId} 
      p='1em' w='10em' h='12em' bg={boxColor} borderRadius='lg' boxShadow='dark-lg'>
      <VStack w='8em' spacing='1em'>
        { !keyInfo.isSuccess && <Skeleton width='6em' height='1.2em'/> }
        { !keyInfo.isSuccess && <Skeleton width='4em' height='1em'/> }
        { keyInfo.isSuccess && <>
          <Text fontSize='xs' fontStyle='italic' color='gray.500'>{keyInfo.data.trust.name}</Text>
          <ContextBalanceUSD mt='2em' contextId={KEY_CONTEXT_ID} identifier={policy.data[1]} 
            textProps={{fontSize: '2xl' }} skeletonProps={{width: '6em', height: '1.5em'}}/>
          <HStack>
            {KeyInfoIcon(keyInfo)}    
            <Text>{keyInfo.data.alias}</Text>
          </HStack>
          <PolicyActivationTag events={policy.data[3]} position={0} total={0}/>
        </> }
      </VStack>
    </WrapItem>
}

export default Trustees;
