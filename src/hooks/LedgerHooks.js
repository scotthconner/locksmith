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
    return ledger.getContextArnRegistry(context, context_id, collateralProvider);
  });
}
