import Locksmith from '../services/Locksmith.js';
import { ethers } from 'ethers';
import {
  useQuery
} from 'react-query';
import { useCacheKey } from './LocksmithHooks.js';
import {
  useProvider,
  useContract,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';

/**
 * useTokenAllowance
 *
 * Grabs the token allowance from the ERC20 contract address
 * for the token vault, for the given user.
 */
export function useTokenAllowance(tokenAddress, userAddress) {
  const provider   = useProvider();
  const tokenVault = Locksmith.getContractAddress('TokenVault');
  
  // we are going to cut a corner here. We should have an ERC20 ABI
  // that we could load, but we have the generic ShadowERC. This
  // will break for test-net.
  // note: also hacking around Filecoin that doesn't have erc20s right now.
  // this technical debt stems from not separating out tokens from gas in the
  // UI slider that uses this on deposit.
  const contract = Locksmith.getContract(tokenAddress === null ? 'Locksmith' : 'ShadowERC', provider);
  const token = useContract(contract);
  
  return useQuery(useCacheKey('useTokenAllowance' + tokenAddress + userAddress), async function() {
    // we are also checking to make sure the contract hook isn't stubbed out
    return contract.addressOrName !== Locksmith.getContract('Locksmith',provider).addressOrName && 
      tokenAddress !== null ? await token.attach(tokenAddress).allowance(userAddress, tokenVault) :
      ethers.constants.MaxUint256; // if the token address is null, its ether so allowance isn't needed
  });
}

/**
 * useApprove
 *
 * Will use wagmi to call approve for an ERC20 token contract.
 */
export function useApprove(tokenAddress, userAddress, amount, errorFunc, successFunc) {
  const provider   = useProvider();
  const tokenVault = Locksmith.getContractAddress('TokenVault');

  const preparation = usePrepareContractWrite({
    addressOrName: tokenAddress, 
    contractInterface: Locksmith.getContract('ShadowERC', provider).contractInterface, 
    functionName: 'approve', 
    args: [tokenVault, amount],
    enabled: tokenAddress && tokenVault && userAddress && amount
  });

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
