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
  const account  = useAccount(); 
  const wallet   = address || account.address;
  const provider = useProvider();
  const contract = useContract(Locksmith.getContract('keyVault', provider));
  const walletKeys = useQuery('walletKeys for ' + wallet, async function() {
    return await contract.getKeys(wallet);
  });

  return walletKeys;
}

/**
 * useWalletKeyInspection
 *
 * Returns a hashmap of key ID to inspection status
 **/
export function useWalletKeyInspection(address) {

}
