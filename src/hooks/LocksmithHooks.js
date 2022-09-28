import Locksmith from '../services/Locksmith.js';
import {useState, useEffect} from 'react';
import {useQuery} from 'react-query';
import {useAccount, useProvider, useContract} from 'wagmi';

/**
 * useWalletKeys
 *
 * This hook takes a wallet address, and uses
 * either the attached account or the given address
 * to produce a list of key IDs held by the address
 * using the keyVault.
 *
 * @param address an optional address to get the keys from
 * @return an query that returns the key Ids
 */
export function useWalletKeys(address) {
  const account    = useAccount(); 
  const wallet     = address || account.address;
  const provider   = useProvider();
  const keyVault   = useContract(Locksmith.getContract('keyVault', provider));
  const walletKeys = useQuery('walletKeys for ' + wallet, async function() {
    return await keyVault.getKeys(wallet);
  });

  return walletKeys;
}

/**
 * useKeyInfo 
 *
 * This hook takes a KeyId, and calls Locksmith#inspectKey. 
 *
 * @param keyId the key you want to you inspect 
 * @return an query that returns the key Ids
 */
export function useKeyInfo(keyId) {
  const provider   = useProvider();
  const locksmith = useContract(Locksmith.getContract('locksmith', provider));
  const keyInfo = useQuery('keyInfo for ' + keyId, async function() {
    return await locksmith.inspectKey(keyId);
  });

  return keyInfo;
}
