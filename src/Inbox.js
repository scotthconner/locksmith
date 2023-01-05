import {
  Text,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { useParams } from 'react-router-dom';

// Raw Hooks
import { useKeyInboxAddress } from './hooks/PostOfficeHooks.js';
import { KEY_CONTEXT_ID } from './hooks/LedgerHooks.js';
import { 
  useKeyBalance,
  useInspectKey,
  useKeyHolders,
  useSoulboundKeyAmounts,
} from './hooks/LocksmithHooks.js';
import {
  useInboxTransactionCount,
} from './hooks/VirtualKeyAddressHooks.js';

// Components
import { ContextBalanceUSD } from './components/Trust.js';

export function Inbox({...rest}) {
  const { keyId } = useParams();
  const account = useAccount();
  const inboxAddress = useKeyInboxAddress(keyId); 
    
  // does the user hold the key?
  const userKeyBalance = useKeyBalance(keyId, account.address);

  // get the profile of the key itself
  const keyInfo = useInspectKey(keyId);

  // who has access to this inbox?
  const keyHolders = useKeyHolders(keyId);

  // is the inbox safely soulbound?
  // note: not having the inbox key soulbound means
  //       the key holder could flush the NFT out with
  //       a multi-call and gain dual possession outside
  //       the designs of the trust owner.
  const soulboundAmount = useSoulboundKeyAmounts(keyId, account.address);

  // how many transactions are we talking about here?

  return !inboxAddress.isSuccess ? 
    <VStack>
      <Spinner thickness='4px' speed='0.65s' emptyColor='gray.200' color='blue.500' size='xl'/>
    </VStack> :
    <VirtualKeyInbox keyId={keyId} address={inboxAddress.data}/>
}

const VirtualKeyInbox = ({keyId, address, ...rest}) => {
  const transactionCount = useInboxTransactionCount(address);

  return <VStack>
    <Text>{address}</Text>
    <ContextBalanceUSD contextId={KEY_CONTEXT_ID} identifier={keyId}/>
    { transactionCount.isSuccess && <Text>{transactionCount.data.toString()}</Text> } 
  </VStack>
}
