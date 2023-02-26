import Locksmith from '../services/Locksmith.js';
import { ethers } from 'ethers';
import {
  useContractRead,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';

/**
 * useKeyAllowances 
 *
 * This method calls the "Allowance" scribe contract,
 * and given an array of key IDs will return the set of
 * allowance IDs in accordance to each key provided.
 */
export function useKeyAllowances(keys) {
  return useContractRead(Locksmith.getContractRead('Allowance','getKeyAllowances',
    [keys],
    keys !== null && keys.length !== 0));
}

/**
 * useAllowance
 *
 * This method calls the "Allowance" scribe contract,
 * and given an allowance ID will return all of its pertinent 
 * configuration. 
 */
export function useAllowance(allowanceId) {
  return useContractRead(Locksmith.getContractRead('Allowance','getAllowance',
    [allowanceId],
    allowanceId !== null));
}

/**
 * useRedeemableTrancheCount
 * 
 * Get the number of solvent tranches that are available for redemption
 * on a given allowance.
 */
export function useRedeemableTrancheCount(allowanceId) {
  return useContractRead(Locksmith.getContractRead('Allowance','getRedeemableTrancheCount',
    [allowanceId],
    allowanceId != null));
}

/**
 * mapAllowanceData 
 *
 * This method takes the data from useAllowance and turns it
 * into a more addressable object with keys and values.
 */
export function mapAllowanceData(allowanceData) {
  if (!allowanceData) { return {}; }

  return {
    enabled: allowanceData[0][0],
    rootKeyId: allowanceData[0][1],
    allowanceName: ethers.utils.parseBytes32String(allowanceData[0][2]),
    recipientKeyId: allowanceData[0][3],
    remainingTrancheCount: allowanceData[0][4],
    vestingInterval: allowanceData[0][5],
    nextVestTime: allowanceData[0][6] * 1000,
    requiredEvents: allowanceData[1],
    entitlements: allowanceData[2].map((e) => { return {
      sourceKey: e[0],
      arn: e[1],
      provider: e[2],
      amount: e[3]
    }})
  }
}

/**
 * useCreateAllowance
 *
 * This will create an allowance. The objects for "entitlements" is specified
 * in the IAllowance.sol interface in smarttrust.
 */
export function useCreateAllowance(rootKeyId, name, recipientKeyId, trancheCount, vestInterval,
  firstVestTime, entitlements, events = [], errorFunc, successFunc) {

  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Allowance', 'createAllowance',
      [rootKeyId, ethers.utils.formatBytes32String(name), recipientKeyId, trancheCount, vestInterval, firstVestTime, entitlements, events], 
      rootKeyId && name && name.length > 0 && recipientKeyId && trancheCount !== 0 && vestInterval !== 0 &&
      firstVestTime !== 0 && entitlements && entitlements.length > 0));

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
 * setTrancheCount
 *
 * Use this method to change the number of tranches for this allowance.
 */
export function useSetTrancheCount(allowanceId, tranches, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Allowance', 'setTrancheCount',
      [allowanceId, tranches], allowanceId && tranches));

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
 * useRemoveAllowance
 *
 * Method to delete an allowance from the registry.
 */
export function useRemoveAllowance(allowanceId, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Allowance', 'removeAllowance',
      [allowanceId], allowanceId));

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
 * useRedeemAllowance
 *
 * This method is called when a key holder has an allowance
 * to redeem. If the message sender isn't the key holder of
 * the allowance entitlement or the allowance is otherwise
 * incapable of dispensing this will fail.
 */
export function useRedeemAllowance(allowanceId, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Allowance', 'redeemAllowance',
      [allowanceId], allowanceId));

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}
