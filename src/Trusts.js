//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  useParams
} from 'react-router-dom';
import {
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react';
import { TrustKey } from './trusts/TrustKeys.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { 
  useTrustInfo, 
  useTrustKeys,
} from './hooks/LocksmithHooks.js';

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

  return (<>
    {!trustInfo.isSuccess ? (
      <HStack>
        <Skeleton width='3em' height='3m'/>
        <VStack>
          <Skeleton height='3em' width='20em'/>
          <Skeleton mt='1.5em' height='1.5em' width='30em'/>
        </VStack>
      </HStack>
    ): (<>
      <Heading>{trustInfo.data.trustKeyCount < 1 ? 'Invalid Trust' : trustInfo.data.name}</Heading>
      <Text mt='1.5em' fontSize='lg'>This trust has <b>{trustInfo.data.trustKeyCount.toString()}</b> keys.</Text>
      <VStack  spacing='2em' pb='6em' pt='2em'>
        { (!trustKeys.isSuccess || trustInfo.data.trustKeyCount < 1) ? (<></>) : 
          trustKeys.data.map((k) => (
            <TrustKey rootKeyId={trustInfo.data.rootKeyId} key={k} keyId={k}/>
          ))
        }
      </VStack>
    </>)} 
  </>)
}
