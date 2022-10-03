import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useProvider,
  useContract,
} from 'wagmi';
import {ethers} from 'ethers';

//////////////////////////////////////////////
// Notary Roles
//////////////////////////////////////////////
export const LEDGER_CONTEXT_ID = 0; 
export const TRUST_CONTEXT_ID = 1;
export const KEY_CONTEXT_ID = 2;

/**
 * useContextArnRegistry
 *
 * Calls the ledger, and gets a list of ARNs for a given
 * context.
 */
export function useContextArnRegistry(context, context_id, collateralProvider = ethers.constants.AddressZero) {
  const provider = useProvider();
  const ledger = useContract(Locksmith.getContract('ledger', provider));
  return useQuery('getContextArnRegistry ' + context + ' ' + context_id + ' ' + collateralProvider, async function() {
    return await ledger.getContextArnRegistry(context, context_id, collateralProvider);
  });
}

/**
 * useContextProviderRegistry
 *
 * Calls the ledger, and gets the list of providers for
 * a given context, and optional arn.
 */
export function useContextProviderRegistry(context, context_id, arn = ethers.constants.HashZero) {
  const provider = useProvider();
  const ledger = useContract(Locksmith.getContract('ledger', provider));
  return useQuery('getContextProviderRegistry ' + context + ' ' + context_id + ' ' + arn, async function() {
    return await ledger.getContextProviderRegistry(context, context_id, arn);
  });
}

/**
 * useContextArnBalance
 *
 * Calls the ledger, and for a given ARN gives you the context
 * level balance, or per-provider within the context if provided.
 */
export function useContextArnBalances(context, context_id, arns, collateralProvider = ethers.constants.AddressZero) {
  const provider = useProvider();
  const ledger = useContract(Locksmith.getContract('ledger', provider));
  return useQuery('getContextArnBalance ' + context + ' ' + context_id + 
    ' ' + ' ' + arns + ' ' + collateralProvider, async function() {
      return arns ? await ledger.getContextArnBalances(context, context_id, collateralProvider, arns) : [];
  });
}
