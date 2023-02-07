import Locksmith from '../services/Locksmith.js';
import { BigNumber } from 'ethers';
import {useQuery} from 'react-query';
import { useCacheKey } from './LocksmithHooks.js';
import {
  useProvider,
  useContract,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';

/**
 * useTrustPolicyKeys
 *
 * This method calls the "Trustee" scribe contract,
 * and provides each Key ID that has policy entries
 * in the contract.
 */
export function useTrustPolicyKeys(trustId) {
  const provider = useProvider();
  const Trustee = useContract(Locksmith.getContract('Trustee', provider));
  return useQuery(useCacheKey('getTrustPolicyKeys for ' + trustId), async function() {
    return await Trustee.getTrustPolicyKeys(trustId);
  });
}

/**
 * usePolicy
 * 
 * Provides all of the metadata for a given Trustee distribution
 * policy:
 *
 * boolean : is the policy currently enabled
 * BigNumber: the root key Id that set up the policy
 * BigNumber: the source key Id that is the source of funds.
 * [KeyId:BigNumber]: a list of key ids that can get distributions from the Trustee key
 * [EventHash:Bytes32]: a list of event hashes that are required for the policy to be enabled
 */
export function usePolicy(keyId) {
  const provider = useProvider();
  const Trustee = useContract(Locksmith.getContract('Trustee', provider));
  return useQuery(useCacheKey('usePolicy for ' + keyId), async function() {
    return await Trustee.getPolicy(keyId);
  });
}

/**
 * useSetPolicy
 *
 * Given a root key, will create a Trustee Policy for a given set of events
 * and associated beneficiary keys.
 */
export function useSetPolicy(rootKeyId, trusteeKeyId, sourceKeyId, beneficiaries, events, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Trustee', 'setPolicy',
      [rootKeyId, trusteeKeyId, sourceKeyId, beneficiaries, events],
      rootKeyId && trusteeKeyId && sourceKeyId && beneficiaries.length > 0 && events
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
 * useRemovePolicy
 *
 * Given a held root key Id, and a key policy id, remove the key Trustee
 * from the trust, regardless of state.
 */
export function useRemovePolicy(rootKeyId, keyId, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Trustee', 'removePolicy',
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

/**
 * useDistribute
 *
 * Given a Trustee key Id, provider, arn, beneficiary keys and amounts,
 * use the Trustee contract to make an approved-scribe call to "distribute"
 * on the ledger. There are many reasons this could fail:
 * - provider is invalid
 * - scribe contract (Trustee.sol) isn't approved on the ledger for the root key
 * - invalid arn balance for root key on that provider
 * - invalid beneficiaries
 */
export function useDistribute(trusteeKeyId, provider, arn, beneficiaries, amounts,  errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Trustee', 'distribute',
      [trusteeKeyId, provider, arn, beneficiaries, amounts],
      trusteeKeyId && provider && arn && beneficiaries.length > 0 &&
      amounts.reduce((sum, amount) => {
        return sum.add(amount)
      }, BigNumber.from(0)).gt(BigNumber.from(0))
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
