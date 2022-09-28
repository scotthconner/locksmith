import Locksmith from '../services/Locksmith.js';
import {useState, useEffect} from 'react';
import {useQuery} from 'react-query';
import {
  useAccount, 
  useProvider, 
  useContract,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';
import {ethers} from 'ethers';

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
 * This hook takes a KeyId, and calls 
 *  - Locksmith#inspectKey
 *  - Locksmith#trustRegistry
 *
 * @param keyId the key you want to you inspect 
 * @return an query that returns the key Ids
 */
export function useKeyInfo(keyId, address = null) {
  const provider   = useProvider();
  const locksmith = useContract(Locksmith.getContract('locksmith', provider));
  const keyVault = useContract(Locksmith.getContract('keyVault', provider));
  const keyInfo = useQuery('keyInfo for ' + keyId, async function() {
    let trust = null;
    let held = null;
    let soulboundCount = null;

    // call #inspectKey
    let response = await locksmith.inspectKey(keyId);

    // get the trust slug if the key is valid
    if (response[0]) {
      // grab the trust information
      trust = await locksmith.trustRegistry(response[2]);

      // get the user's inventory
      if(address) {
        held = await keyVault.balanceOf(address, keyId);
      }

      // determine how many of them are soulbound
      soulboundCount = await keyVault.soulboundKeyAmounts(address, keyId); 
    }

    return {
      isValid: response[0],
      alias: ethers.utils.parseBytes32String(response[1]),
      inventory: held,
      soulbound: soulboundCount,
      isRoot: response[3],
      trust: {
        id: response[2], 
        name: ethers.utils.parseBytes32String(trust.name),
        rootKeyId: trust.rootKeyId,
        keys: response[4]
      }
    };
  });

  return keyInfo;
}

export function useCreateTrustAndRootKey(trustName) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('locksmith', 'createTrustAndRootKey', 
      [ethers.utils.formatBytes32String(trustName.trim())], 
      trustName.trim().length > 0));

  const call = useContractWrite(preparation.config);

  return call;
}
