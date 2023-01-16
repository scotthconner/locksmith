import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useProvider,
  usePrepareContractWrite,
  useContractWrite,
  useContract,
} from 'wagmi';

/**
 * useInboxTransactionCount 
 *
 * For a given inbox address, return the total transaction count.
 */
export function useInboxTransactionCount(address) {
  const provider = useProvider();
  const inbox = useContract(Locksmith.getContract('VirtualKeyAddress', provider, address));
  return useQuery('VirtualKeyAddress::transactionCount at ' + address , async function() {
    return address !== null ? await inbox.transactionCount() : 0;
  });
}

/**
 * useSend
 * 
 * Will send ethereum out of an inbox.
 */
export function useSend(inboxAddress, provider, amount, destination, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('VirtualKeyAddress', 'send',
      [provider, amount, destination],
      inboxAddress && provider && amount && amount.gt(0) && destination, inboxAddress));

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}
