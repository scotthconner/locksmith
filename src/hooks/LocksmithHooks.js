import useDebounce from './UseDebounce.js';
import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useNetwork,
  useAccount, 
  useProvider, 
  useContract,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';
import {ethers} from 'ethers';

/**
 * useCacheKey
 *
 * Encapsulates some of the salts needed to refresh
 * large swaths of hooks across a frontend application.
 */
export function useCacheKey(cacheKey) {
  const network = useNetwork();
  return "" + ((network.chain||{id: 0}).id) + cacheKey;
}

/**
 * useWalletKeys
 *
 * This hook takes a wallet address, and uses
 * either the attached account or the given address
 * to produce a list of key IDs held by the address
 * using the KeyVault.
 *
 * @param address an optional address to get the keys from
 * @return an query that returns the key Ids
 */
export function useWalletKeys(address) {
  const account    = useAccount(); 
  const wallet     = address || account.address;
  return useContractRead(Locksmith.getContractRead('KeyVault', 'getKeys',
    [wallet], wallet != null));
}

/**
 * useWalletTrusts
 *
 * This is a tricky piece of code to get the associated trusts
 * for all the keys in the wallet. This does chain some async calls,
 * so this will be slower than most calls. It does however
 * reduce components, ghost rendering, and repeat calls.
 *
 * It will return an array of trust IDs.
 */
export function useWalletTrusts(address) {
  const account    = useAccount();
  const wallet     = address || account.address;
  const provider   = useProvider();
  const KeyVault   = useContract(Locksmith.getContract('KeyVault', provider));
  const locksmith  = useContract(Locksmith.getContract('Locksmith', provider));
  return useQuery(useCacheKey('wallet trusts for ' + wallet), async function() {
    // here are the trust IDs we want to ultimately return
    let walletTrusts = [];

    // this is the keys we've seen and collected for. This prevents us
    // from grabbing the same trust info for keys that will result in the same trust ID.
    let witnessedKeys = [];

    // grab the keys first. We don't keep track of 
    // trusts per wallet address, but via keys.
    let keys = await KeyVault.getKeys(wallet);

    // then, for each key go in and determine the trustID by inspecting
    // the key. Skip any keys we've already witnessed. 
    for(var x = 0; x < keys.length; x++) {
      if(!witnessedKeys.includes(keys[x].toString())) {
        // go ahead and inspect the key.
        let inspection = await locksmith.inspectKey(keys[x]);
        
        // grab the trust ID and keep it
        walletTrusts.push(inspection[2]);

        // prevent us from fetching keys that will result
        // in the same trust ID
        witnessedKeys.push(...inspection[4].map((k) => { return k.toString(); }));
      }
    }

    return walletTrusts;
  });
}

/**
 * useKeyBalance
 *
 * Gets the key balance of an address
 **/
export function useKeyBalance(keyId, address) {
  return useContractRead(Locksmith.getContractRead('KeyVault', 'balanceOf', 
    [address, keyId],
    keyId != null));
}

/**
 * useSoulboundKeyAmounts 
 *
 * Gets the soulbound count of an address
 **/
export function useSoulboundKeyAmounts(keyId, address) {
  return useContractRead(Locksmith.getContractRead('KeyVault', 'keyBalanceOf', 
    [address, keyId, true],
    keyId != null && address != null));
}

/**
 * useKeySupply
 *
 * Returns the total number of keys for a given id.
 */
export function useKeySupply(keyId) {
  return useContractRead(Locksmith.getContractRead('KeyVault', 'keySupply', 
    [keyId],
    keyId != null));
}

/**
 * useInspectKey
 *
 * Calls inspect key for a given keyId.
 */
export function useInspectKey(keyId) {
  const provider   = useProvider();
  const locksmith = useContract(Locksmith.getContract('Locksmith', provider));
  return useQuery(useCacheKey('inspectKey for ' + keyId), async function() {
    if(null === keyId || keyId === '') { return null; }

    let response = await locksmith.inspectKey(keyId);

    return {
      isValid: response[0],
      alias: ethers.utils.parseBytes32String(response[1]),
      trustId: response[2],
      isRoot: response[3],
      trustKeys: response[4]
    }
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
  const locksmith = useContract(Locksmith.getContract('Locksmith', provider));
  const KeyVault = useContract(Locksmith.getContract('KeyVault', provider));
  const keyInfo = useQuery(useCacheKey('keyInfo for ' + keyId + ' with holder ' + address), async function() {
    let trust = null;
    let held = null;
    let soulboundCount = null;

    // call #inspectKey
    let response = await locksmith.inspectKey(keyId);

    // get the trust slug if the key is valid
    if (response[0]) {
      // grab the trust information
      trust = await locksmith.getTrustInfo(response[2]);

      // get the user's inventory
      if(address) {
        held = await KeyVault.balanceOf(address, keyId);
        
        // determine how many of them are soulbound
        soulboundCount = await KeyVault.keyBalanceOf(address, keyId, true); 
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
        name: ethers.utils.parseBytes32String(trust ? trust[1] || '' : ''),
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
  return useContractRead(Locksmith.getContractRead('KeyVault', 'getHolders', 
    [keyId],
    keyId != null));
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
 * @param recipient the receiving wallet address of the new trust's root key
 * @param errorFunc what to do if this fails at signing or is aborted
 * @param successFunc what to do when the transaction has been signed and broadast
 * @return a query of the contract write
 **/
export function useCreateTrustAndRootKey(trustName, recipient, errorFunc, successFunc) {
  const debouncedTrustName = useDebounce(trustName.trim(), 500);
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Locksmith', 'createTrustAndRootKey', 
      [ethers.utils.formatBytes32String(debouncedTrustName), recipient], 
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
    Locksmith.getContractWrite('Locksmith', 'burnKey',
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
    Locksmith.getContractWrite('Locksmith', 'copyKey',
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
    Locksmith.getContractWrite('Locksmith', 'soulbindKey',
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
    Locksmith.getContractWrite('KeyVault', 'safeTransferFrom',
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
 * useCreate Key
 *
 * Will call #createKey. This will barf if the signer
 * does not hold the root key for the trust
 */
export function useCreateKey(rootKeyId, keyName, receiver, bind, errorFunc, successFunc) {
  const debouncedName = useDebounce(keyName, 500);
  const debouncedAddress = useDebounce(receiver, 500);
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('Locksmith', 'createKey',
      [rootKeyId, ethers.utils.formatBytes32String(debouncedName), debouncedAddress, bind],
      debouncedName.length > 0 && ethers.utils.isAddress(debouncedAddress))
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
 *    rootKeyId,
 *    trustKeyCount
 *    keys[]
 * }  
 */
export function useTrustInfo(trustId) {
  const provider  = useProvider();
  const locksmith = useContract(Locksmith.getContract('Locksmith', provider));

  const trustInfo = useQuery(useCacheKey('trust for ' + trustId), async function() {
    if( null === trustId ) {
      return {};
    }

    // grab the trust information
    let trust = await locksmith.getTrustInfo(trustId);

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
  return useContractRead(Locksmith.getContractRead('Locksmith', 'getKeys', 
    [trustId],
    trustId != null));
}

export function usePendingHashes() {
  return useQuery({queryKey: Date.now(), queryFn: async function() {
    return Locksmith.getHashes();
  }, cacheTime: 3000, staleTime: 3000});
}
