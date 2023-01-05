import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useProvider,
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
