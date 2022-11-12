import Locksmith from '../services/Locksmith.js';
import {
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';

/**
 * useEtherWithdrawal
 *
 * Essentially, will call withdrawal on the ether EtherVault for a given
 * key. The caller must be holding the key, and have the actual
 * amount on their key via the EtherVault's ledger.
 */
export function useEtherWithdrawal(keyId, amount, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('EtherVault', 'withdrawal',
      [keyId, amount], amount > 0)); 

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
 * useEtherDeposit
 *
 * This uses a key to deposit ether into the
 * local ether EtherVault.
 */
export function useEtherDeposit(keyId, amount, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('EtherVault', 'deposit',
      [keyId, {value: amount}], amount > 0));

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}
