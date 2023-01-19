import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useNetwork,
  useProvider,
  useContract
} from 'wagmi';

/**
 * useKeyInboxAddress
 *
 * For a given keyId, return the virtual inbox address should 
 * there be one, otherwise null.
 */
export function useKeyInboxAddress(keyId) {
  const provider = useProvider();
  const network = useNetwork();
  const postOffice = useContract(Locksmith.getContract('PostOffice', provider));
  return useQuery('PostOffice::getKeyId-' + network.chain.id + keyId, async function() {
      return await postOffice.getKeyInbox(keyId);
  });
}
