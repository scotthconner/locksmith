import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useProvider,
  useContract
} from 'wagmi';
import {ethers} from 'ethers';
/**
 * useTrustEventRegistry
 *
 * For a given trust ID, provides a list of registered 
 * events as byte32 hashes.
 */
export function useTrustEventRegistry(trustId, errorFunc, successFunc) {
  const provider = useProvider();
  const events = useContract(Locksmith.getContract('events', provider));
  return useQuery('getTrustEventRegistry for ' + trustId, async function() {
    return await events.getRegisteredTrustEvents(trustId);
  });
}
