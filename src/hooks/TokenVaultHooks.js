import Locksmith from '../services/Locksmith.js';
import {
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';

/**
 * useTokenWithdrawal
 *
 * Essentially, will call withdrawal on the token vault for a given
 * key. The caller must be holding the key, and have the actual
 * amount on their key via the vault's ledger.
 */
export function useTokenWithdrawal(keyId, arn, amount, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('tokenVault', 'arnWithdrawal',
      [keyId, arn, amount], amount > 0)); 

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}
