import Locksmith from '../services/Locksmith.js';
import {
  usePrepareContractWrite,
  useContractRead,
  useContractWrite
} from 'wagmi';
import {ethers} from 'ethers';

/**
 * useEventKey
 *
 * grabs the keyId for the given event hash,
 * assuming that the event hash is properly registered
 * with the Key Oracle dispatcher. If it isn't, it will
 * return KeyID 0 improperly. To know the event hash is
 * valid for the key oracle is getting the oracle's contract
 * address from the dispatch registery in the event log.
 */
export function useEventKey(eventHash) {
  return useContractRead(Locksmith.getContractRead('KeyOracle', 'eventKeys',
    [eventHash]));
}

/**
 * useOracleKeyEvents
 *
 * With a given keyID, will return all of the event hashes that are associated
 * with that key in the KeyOracle event dispatcher.
 */
export function useOracleKeyEvents(keyId) {
  return useContractRead(Locksmith.getContractRead('KeyOracle', 'getOracleKeyEvents',
    [keyId], keyId != null));
}

/**
 * useCreateKeyOracle
 * 
 * Assuming the caller is root, create a key oracle event.
 */
export function useCreateKeyOracle(rootKeyId, keyId, description, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('KeyOracle', 'createKeyOracle',
      [rootKeyId, keyId, ethers.utils.formatBytes32String(description||'')],
      rootKeyId && keyId && description 
    )
  );

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}

/**
 * useFireKeyOracleEvent
 *
 * This will call the contract and attempt to fire the event.
 * All the pre-reqs must be met or this will fail. The caller must
 * own the key, the key must be an oracle for the event hash, the event
 * hash must be registered, and it need not already be fired.
 */
export function useFireKeyOracleEvent(keyId, eventHash, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('KeyOracle', 'fireKeyOracleEvent',
      [keyId, eventHash], 
      keyId && eventHash 
    )
  );

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}
