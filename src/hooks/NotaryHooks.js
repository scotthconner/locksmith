import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useProvider,
  useContract,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';
import {ethers} from 'ethers';

//////////////////////////////////////////////
// Notary Roles
//////////////////////////////////////////////
export const COLLATERAL_PROVIDER = 0;
export const SCRIBE = 1;
export const DISPATCHER = 2;

/**
 * useTrustedActors
 *
 * For the saske of simplicity, we are assuming our
 * ledger in this call.
 *   
 */
export function useTrustedActors(trustId, role, ledgerContractAlias = 'Ledger') {
  const provider = useProvider();
  const ledgerAddress = Locksmith.getContractAddress(ledgerContractAlias); 
  const Notary = useContract(Locksmith.getContract('Notary', provider));
  return useQuery('getTrustedActors for ' + trustId + " " + role + " " + ledgerAddress, async function() {
    return await Notary.getTrustedActors(ledgerAddress, trustId, role);
  });
}

/**
 * useTrustedActorAlias
 *
 * Given a trust, role, and actor, provides the given alias.
 */
export function useTrustedActorAlias(trustId, role, address, ledgerContractAlias = 'Ledger') {
  const provider = useProvider();
  const ledgerAddress = Locksmith.getContractAddress(ledgerContractAlias);
  const Notary = useContract(Locksmith.getContract('Notary', provider));
  return useQuery('getTrustedActorAlias for ' + trustId + " " + role + " " + address + " " + ledgerAddress, async function() {
    return (null !== trustId && null !== role && null !== address) ? ethers.utils.parseBytes32String(
        await Notary.actorAliases(ledgerAddress, trustId, role, address) 
    ) : '';
  });
}

/**
 * useSetTrustedLedgerRole
 *
 * Calls contract write for setting a trusted ledger role.
 */
export function useSetTrustedLedgerRole(rootKeyId, trustId, role, address, trusted, alias, errorFunc, successFunc) {
  // the function interface is messy enough, so here is a blatant hack my guy
  // this is going to immediately break the minute we add another actor to the notary
  const ledgerAddress = Locksmith.getContractAddress(role === 0 || role === 1 ? 'Ledger' : 'TrustEventLog');
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Notary', 'setTrustedLedgerRole',
      [rootKeyId, role, ledgerAddress, address, trusted, ethers.utils.formatBytes32String(alias)],
      ethers.utils.isAddress(address) && rootKeyId));

  const call = useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });

  return call;
}

/**
 * useWithdrawalAllowance
 *
 * This call assumes the internal ledger, and will determine
 * how much wei of allowance is enabled for a given provider, key,
 * and asset.
 */
export function useWithdrawalAllowance(ledgerProvider, key, arn) {
  const provider = useProvider();
  const ledgerAddress = Locksmith.getContractAddress('Ledger');
  const Notary = useContract(Locksmith.getContract('Notary', provider));
  return useQuery('useWithdrawalAllowance for ' + ledgerProvider + " " + key + " " + arn, async function() {
    if(ledgerProvider === null || key === null || arn === null) {
      return 0;
    }
    return await Notary.withdrawalAllowances(ledgerAddress, key, ledgerProvider, arn);
  });
}

/**
 * useSetWithdrawalAllowance
 *
 * This write call assumes the internal ledger, and will set
 * the allowance for a given provider arn and key. This will
 * fail if the signer doesn't hold the key.
 */
export function useSetWithdrawalAllowance(ledgerProvider, key, arn, amount, errorFunc, successFunc) {
  const ledgerAddress = Locksmith.getContractAddress('Ledger');
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Notary', 'setWithdrawalAllowance',
      [ledgerAddress, ledgerProvider, key, arn, amount], 
      amount !== null
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
