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
 * TrustEventLog as byte32 hashes.
 */
export function useTrustEventRegistry(trustId, dispatcher = ethers.constants.AddressZero) {
  const provider = useProvider();
  const TrustEventLog = useContract(Locksmith.getContract('TrustEventLog', provider));
  return useQuery('getTrustEventRegistry for ' + trustId + dispatcher, async function() {
    return await TrustEventLog.getRegisteredTrustEvents(trustId, dispatcher);
  });
}

/**
 * useEventDescription
 *
 * Given an event hash, return the UTF-8 decoded description string for it.
 */
export function useEventDescription(eventHash) {
  const provider = useProvider();
  const TrustEventLog = useContract(Locksmith.getContract('TrustEventLog', provider));
  return useQuery('eventDescription for ' + eventHash, async function() {
    return ethers.utils.parseBytes32String(await TrustEventLog.eventDescriptions(eventHash));
  });
}

/**
 * useEventDispatcher
 *
 * Given an event hash, provide the owning dispatcher for the event.
 */
export function useEventDispatcher(eventHash) {
  const provider = useProvider();
  const TrustEventLog = useContract(Locksmith.getContract('TrustEventLog', provider));
  return useQuery('eventDispatcher for ' + eventHash, async function() {
    return await TrustEventLog.eventDispatchers(eventHash);
  });
}

/**
 * useEventState
 *
 * Given an event hash, provide the boolean state value for whether
 * or not it was fired.
 */
export function useEventState(eventHash) {
  const provider = useProvider();
  const TrustEventLog = useContract(Locksmith.getContract('TrustEventLog', provider));
  return useQuery('firedEvents for ' + eventHash, async function() {
    return eventHash ? await TrustEventLog.firedEvents(eventHash) : null;
  });
}
