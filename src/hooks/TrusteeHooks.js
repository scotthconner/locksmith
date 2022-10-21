import useDebounce from './UseDebounce.js';
import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useAccount,
  useProvider,
  useContract,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';
import {ethers} from 'ethers';

/**
 * useTrustPolicyKeys
 *
 * This method calls the "Trustee" scribe contract,
 * and provides each Key ID that has policy entries
 * in the contract.
 */
export function useTrustPolicyKeys(trustId) {
  const provider = useProvider();
  const trustee = useContract(Locksmith.getContract('trustee', provider));
  return useQuery('getTrustPolicyKeys for ' + trustId, async function() {
    return await trustee.getTrustPolicyKeys(trustId);
  });
}

/**
 * usePolicy
 * 
 * Provides all of the metadata for a given trustee distribution
 * policy:
 *
 * boolean : is the policy currently enabled
 * [KeyId:BigNumber]: a list of key ids that can get distributions from the trustee key
 * [EventHash:Bytes32]: a list of event hashes that are required for the policy to be enabled
 */
export function usePolicy(keyId) {
  const provider = useProvider();
  const trustee = useContract(Locksmith.getContract('trustee', provider));
  return useQuery('usePolicy for ' + keyId, async function() {
    return await trustee.getPolicy(keyId);
  });
}

/**
 * useRemovePolicy
 *
 * Given a held root key Id, and a key policy id, remove the key trustee
 * from the trust, regardless of state.
 */
export function useRemovePolicy(rootKeyId, keyId, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('trustee', 'removePolicy',
      [rootKeyId, keyId],
      rootKeyId && keyId 
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
