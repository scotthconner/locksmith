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
    Locksmith.getContractWrite('TokenVault', 'arnWithdrawal',
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

/**
 * useTokenDeposit
 *
 * This uses a key to deposit tokens into the
 * local token vault. If the token allowance isn't sufficient,
 * this transaction will fail.
 */
export function useTokenDeposit(keyId, token, amount, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('TokenVault', 'deposit',
      [keyId, token, amount], amount > 0));

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}
