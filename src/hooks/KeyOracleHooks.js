import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useProvider,
  useContract,
  usePrepareContractWrite,
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
  const provider = useProvider();
  const keyOracle = useContract(Locksmith.getContract('keyOracle', provider));
  return useQuery('getOracleKey for ' + eventHash, async function() {
    return await keyOracle.eventKeys(eventHash);
  });
}

/**
 * useCreateKeyOracle
 * 
 * Assuming the caller is root, create a key oracle event.
 */
export function useCreateKeyOracle(rootKeyId, keyId, description, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('keyOracle', 'createKeyOracle',
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
