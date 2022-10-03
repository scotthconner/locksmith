import useDebounce from './UseDebounce.js';
import Locksmith from '../services/Locksmith.js';
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
 * useKeyBalance
 *
 * Gets the key balance of an address
 **/
export function useKeyBalance(keyId, address) {
  const provider   = useProvider();
  const keyVault = useContract(Locksmith.getContract('keyVault', provider));
  return useQuery('keyBalance for ' + keyId + ' with holder ' + address, async function() {
    return keyId ? await keyVault.balanceOf(address, keyId) : 0;
  });
}

/**
 * useSoulboundKeyAmounts 
 *
 * Gets the soulbound count of an address
 **/
export function useSoulboundKeyAmounts(keyId, address) {
  const provider   = useProvider();
  const keyVault = useContract(Locksmith.getContract('keyVault', provider));
  return useQuery('soulbound count for ' + keyId + ' with holder ' + address, async function() {
    return await keyVault.soulboundKeyAmounts(address, keyId);
  });
}

/**
 * useKeyInfo 
 *
 * This hook takes a KeyId, and calls 
 *  - Locksmith#inspectKey
 *  - Locksmith#trustRegistry
 *  - KeyVault#balanceOf
 *  - KeyVault#soulboundKeyAmounts
 *
 * @param keyId the key you want to you inspect 
 * @return an query that returns the key Ids
 */
export function useKeyInfo(keyId, address = null) {
  const provider   = useProvider();
  const locksmith = useContract(Locksmith.getContract('locksmith', provider));
  const keyVault = useContract(Locksmith.getContract('keyVault', provider));
  const keyInfo = useQuery('keyInfo for ' + keyId + ' with holder ' + address, async function() {
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
        
        // determine how many of them are soulbound
        soulboundCount = await keyVault.soulboundKeyAmounts(address, keyId); 
      }
    }

    return {
      isValid: response[0],
      keyId: keyId.toString(),
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

/**
 * useKeyHolders
 *
 * Hook into the addresses holding the given key.
 */
export function useKeyHolders(keyId) {
  const provider = useProvider();
  const keyVault = useContract(Locksmith.getContract('keyVault', provider));
  const keyHolders = useQuery('keyHolders for ' + keyId, async function() {
    return await keyVault.getHolders(keyId);
  });
  return keyHolders;
}

/**
 * useKeyInventory
 *
 * This method introspects on a keyID and determines
 * the total outstanding mint amounts as well as who
 * is holding how many, and how many of them are
 * soulbound.
 */
export function useKeyInventory(keyId) {
  const provider = useProvider();
  const keyVault = useContract(Locksmith.getContract('keyVault', provider));
  const keyInventory = useQuery('keyInventory for ' + keyId, async function() {
    // first get the addresses that hold the key
    let holderInfo = {};
    let total = 0;
    let holders = await keyVault.getHolders(keyId);
    for(const h in holders) {
      let b = await keyVault.balanceOf(holders[h], keyId);
      total += b.toNumber(); 
      holderInfo[holders[h]] = { 
        balance: b,
        soulbound: await keyVault.soulboundKeyAmounts(holders[h], keyId),
      };
    };

    return {
      total: total,
      holders: holderInfo
    };
  });

  return keyInventory; 
}

/**
 * useCreateTrustAndRootKey
 *
 * Prepares and writes to the Locksmith contract,
 * calling #createTrustAndRootKey.
 *
 * The caller must take the query and eventually call write?() to initate
 * the wallet interaction.
 *
 * @param trustName the human readable trustname you want to make
 * @param errorFunc what to do if this fails at signing or is aborted
 * @param successFunc what to do when the transaction has been signed and broadast
 * @return a query of the contract write
 **/
export function useCreateTrustAndRootKey(trustName, errorFunc, successFunc) {
  const debouncedTrustName = useDebounce(trustName.trim(), 500);
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('locksmith', 'createTrustAndRootKey', 
      [ethers.utils.formatBytes32String(debouncedTrustName)], 
      debouncedTrustName.length > 0));

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
 * useBurnKey
 *
 * Prepares and writes to the Locksmith contract,
 * calling #burnKey.
 *
 * The caller must take the query and eventually call write?() to initate
 * the wallet interaction.
 *
 * This transaction is going to fail if the holder isn't root.
 */
export function useBurnKey(rootKeyId, keyId, address, burnAmount, errorFunc, successFunc) {
  const debouncedBurn = useDebounce(burnAmount, 500);
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('locksmith', 'burnKey',
      [rootKeyId, keyId, address, debouncedBurn],
      debouncedBurn > 0));

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
 * useCopyKey
 *
 * Prepares and writes to the Locksmith contract,
 * calling #copyKey.
 *
 * The caller must take the query and eventually call write?() to initate
 * the wallet interaction.
 *
 * This transaction is going to fail if the holder isn't root.
 */
export function useCopyKey(rootKeyId, keyId, address, soulbind, errorFunc, successFunc) {
  const debouncedAddress = useDebounce(address.trim(), 500);
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('locksmith', 'copyKey',
      [rootKeyId, keyId, debouncedAddress, soulbind],
      debouncedAddress.length > 0));

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
 * useSoulbindKey
 *
 * Prepares and writes to the Locksmith contract,
 * calling #soulbindKey.
 *
 * The caller must take the query and eventually call write?() to initate
 * the wallet interaction.
 *
 * This transaction is going to fail if the holder isn't root.
 */
export function useSoulbindKey(rootKeyId, keyId, address, soulbindAmount, errorFunc, successFunc) {
  const debouncedAmount = useDebounce(soulbindAmount, 500);
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('locksmith', 'soulbindKey',
      [rootKeyId, address, keyId, debouncedAmount], true));

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
 * useSendKey
 * 
 * Will call #safeTransferFrom from the current user
 * and will sign the transaction for sending. Does not
 * check for soulbound conditions.
 */
export function useSendKey(keyId, address, amount, errorFunc, successFunc) {
  const account = useAccount();
  const debouncedAmount = useDebounce(amount, 500);
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('keyVault', 'safeTransferFrom',
      [account.address, address, 
        keyId, debouncedAmount, 
        ethers.utils.formatBytes32String('')], 
      debouncedAmount > 0 && ethers.utils.isAddress(address))
  );

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
 * useTrustInfo
 * 
 * Takes a trust ID, and grabs a lot of information
 * about it to build a trust detail page.
 *
 * @param trustId the trust id to intospect
 * @return {
 *    trustId,
 *    name,
 *    rootkKeyId,
 *    trustKeyCount
 *    keys[]
 * }  
 */
export function useTrustInfo(trustId) {
  const provider  = useProvider();
  const locksmith = useContract(Locksmith.getContract('locksmith', provider));

  const trustInfo = useQuery('trust for ' + trustId, async function() {
    // grab the trust information
    let trust = await locksmith.trustRegistry(trustId);

    return {
      trustId: trust[0],
      name: ethers.utils.parseBytes32String(trust[1]),
      rootKeyId: trust[2],
      trustKeyCount: trust[3]
    }
  });

  return trustInfo;
}

/**
 * useTrustKeys
 *
 * Returns an array of Key IDs for a given
 * trust Id. Returns null if the trust ID is null.
 * This is useful when chaining hooks. 
 */
export function useTrustKeys(trustId) {
  const provider  = useProvider();
  const locksmith = useContract(Locksmith.getContract('locksmith', provider));

  const trustKeys = useQuery('getKeys for trust ' + trustId, async function() {
    // if the input is invalid just forget it  
    return trustId == null ? [] : await locksmith.getKeys(trustId.toString());
  })

  return trustKeys;
}
