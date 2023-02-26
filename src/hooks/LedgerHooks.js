import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import { useCacheKey } from './LocksmithHooks.js';
import {
  useProvider,
  useContract,
  useContractRead
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
 * Calls the Ledger, and gets a list of ARNs for a given
 * context.
 */
export function useContextArnRegistry(context, context_id, collateralProvider = ethers.constants.AddressZero) {
  return useContractRead(Locksmith.getContractRead('Ledger', 'getContextArnRegistry',
    [context, context_id, collateralProvider]));
}

/**
 * useContextProviderRegistry
 *
 * Calls the Ledger, and gets the list of providers for
 * a given context, and optional arn.
 */
export function useContextProviderRegistry(context, context_id, arn = ethers.constants.HashZero) {
  const provider = useProvider();
  const Ledger = useContract(Locksmith.getContract('Ledger', provider));
  return useQuery(useCacheKey('getContextProviderRegistry ' + context + ' ' + context_id + ' ' + arn), async function() {
    return await Ledger.getContextProviderRegistry(context, context_id, arn);
  });
}

/**
 * useContextArnBalances
 *
 * Calls the Ledger, and for a given ARN gives you the context
 * level balance, or per-provider within the context if provided.
 */
export function useContextArnBalances(context, context_id, arns, collateralProvider = ethers.constants.AddressZero) {
  return useContractRead(Locksmith.getContractRead('Ledger', 'getContextArnBalances',
    [context, context_id, collateralProvider, arns], arns !== null && context_id !== null));
}

/**
 * useContextBalanceSheet
 * 
 * Calls the Ledger, and for a given context returns
 * both the arns and the balances of those arns, or per-provider
 * within the context if provided.
 */
export function useContextBalanceSheet(context, context_id, collateralProvider = ethers.constants.AddressZero) {
  return useContractRead(Locksmith.getContractRead('Ledger', 'getContextBalanceSheet',
    [context, context_id, collateralProvider], context_id && collateralProvider));
}

/**
 * getContextArnAllocations
 *
 * For a given context and ARN, provide the combination of 
 * provider and available amounts.
 */
export function useContextArnAllocations(context, context_id, arn) {
  return useContractRead(Locksmith.getContractRead('Ledger', 'getContextArnAllocations',
    [context, context_id, arn], context_id && context && arn));
}
