// local nets
import * as hardhatContracts from '../registries/network-contracts-31337.json';
import * as hardhatAssets    from '../registries/network-assets-31337.json';

// test nets
import * as goerliContracts  from '../registries/network-contracts-5.json';
import * as baseGoerliContracts from '../registries/network-contracts-84531.json';
import * as goerliAssets     from '../registries/network-assets-5.json';
import * as baseGoerliAssets     from '../registries/network-assets-84531.json';
import * as hyperspaceContracts from '../registries/network-contracts-3141.json';
import * as hyperspaceAssets from '../registries/network-assets-3141.json';

// main nets
import * as filecoinContracts from '../registries/network-contracts-314.json';
import * as filecoinAssets from '../registries/network-assets-314.json';

import * as shadowERC from  "../contracts/stubs/ShadowERC.sol/ShadowERC.json";
import * as keyVault from  "../contracts/KeyVault.sol/KeyVault.json";
import * as locksmith from "../contracts/Locksmith.sol/Locksmith.json";
import * as notary from "../contracts/Notary.sol/Notary.json";
import * as ledger from "../contracts/Ledger.sol/Ledger.json";
import * as etherVault from "../contracts/providers/EtherVault.sol/EtherVault.json";
import * as tokenVault from "../contracts/providers/TokenVault.sol/TokenVault.json";
import * as trustEventLog from "../contracts/TrustEventLog.sol/TrustEventLog.json";
import * as keyOracle from "../contracts/dispatchers/KeyOracle.sol/KeyOracle.json";
import * as alarmClock from "../contracts/dispatchers/AlarmClock.sol/AlarmClock.json";
import * as trustee from "../contracts/scribes/Trustee.sol/Trustee.json";
import * as allowance from "../contracts/scribes/Allowance.sol/Allowance.json";
import * as creator from "../contracts/agents/TrustCreator.sol/TrustCreator.json";
import * as postOffice from '../contracts/PostOffice.sol/PostOffice.json';
import * as megaKey from '../contracts/agents/MegaKeyCreator.sol/MegaKeyCreator.json';
import * as inbox from '../contracts/agents/VirtualKeyAddress.sol/VirtualKeyAddress.json';

/**
 * Locksmith
 *
 * Service provides an interface to the locksmith contracts.
 **/
const Locksmith = (function() {
  var pendingHashes = [];
  var myChainId = 31337; // hardhat
  var contractAddresses = {};
  var assetAddresses = {};

  contractAddresses[31337] = hardhatContracts;
  assetAddresses[31337] = hardhatAssets;
  contractAddresses[3141] = hyperspaceContracts;
  assetAddresses[3141] = hyperspaceAssets;
  

  contractAddresses[5] = goerliContracts;
  assetAddresses[5] = goerliAssets;
  contractAddresses[84531] = baseGoerliContracts;
  assetAddresses[84531] = baseGoerliAssets;
  
  contractAddresses[314] = filecoinContracts;
  assetAddresses[314] = filecoinAssets;

  const interfaces = {
    ShadowERC: shadowERC, 
    KeyVault: keyVault,
    Locksmith: locksmith, 
    Notary: notary, 
    Ledger: ledger,  
    EtherVault: etherVault, 
    TokenVault: tokenVault,
    TrustEventLog: trustEventLog, 
    KeyOracle: keyOracle, 
    AlarmClock: alarmClock, 
    Trustee: trustee,
    Allowance: allowance,
    TrustCreator: creator,
    VirtualKeyAddress: inbox,
    MegaKeyCreator: megaKey,
    PostOffice: postOffice,
  };

  return {
    ////////////////////////////////////////////
    // setChainId
    //
    // Will reload all of the addresses based
    // on the new chain ID.
    ////////////////////////////////////////////
    setChainId: function(chainId) {
      myChainId = chainId; 
    },
    getChainId: function() {
      return myChainId;
    },
    ////////////////////////////////////////////
    // getContractAddress
    ////////////////////////////////////////////
    getContractAddress: function(contract) {
      return (contractAddresses[myChainId][contract]||{})['address'];
    },
    getContractRegistry: function(chainId) {
      return contractAddresses[chainId];
    },
    ////////////////////////////////////////////
    // getContractAddress
    ////////////////////////////////////////////
    getAssetAddress: function(asset) {
      return (assetAddresses[myChainId][asset]||{})['address'];
    },
    ////////////////////////////////////////////
    // getContract
    // 
    // Given a contract alias, produce the ethers
    // map necessary for a useContract hook.
    ////////////////////////////////////////////
    getContract: function(contract, provider, address = null) {
      return {
        addressOrName: Locksmith.getContractAddress(contract) || Locksmith.getAssetAddress(contract) || address, 
        contractInterface: interfaces[contract].abi,
        signerOrProvider: provider
      }
    },
    ////////////////////////////////////////////
    // getContractRead
    //
    // Given a contract alias, produce a wagmi hash
    // for the useContractRead hook
    ////////////////////////////////////////////
    getContractRead: function(contract, method, _args = [], _enabled = true, _watch = true) {
      return {
        addressOrName: Locksmith.getContractAddress(contract),
        contractInterface: interfaces[contract].abi,
        functionName: method,
        args: _args,
        watch: _watch,
        enabled: _enabled
      }
    },
    ////////////////////////////////////////////
    // getContractWrite
    //
    // Given a contract alias, produce the
    // wagmi hash for the useContractWrite hook.
    ////////////////////////////////////////////
    getContractWrite: function(contract, method, args, enabled, addressOverride = null) {
      return {
        addressOrName: addressOverride || contractAddresses[myChainId][contract]['address'] || assetAddresses[myChainId][contract]['address'],
        contractInterface: interfaces[contract].abi,
        functionName: method,
        args: args,
        enabled: enabled,
        onError(error) {
          console.log("There was an error prepping a contract write on: " + contract + "::" + method);
          console.log(args);
          console.log("Something really bad happened " + error);
        }
      }
    },
    ////////////////////////////////////////////
    // watchHash
    //
    // A small utility function that will watch this
    // hash and wait for it to receive a confirmation,
    // then clear itself.
    ////////////////////////////////////////////
    watchHash: function(hash) {
      pendingHashes.push(hash);
    },
    ////////////////////////////////////////////
    // getHashes
    //
    // Powers the react components to get their state.
    // Needs to be wrapped in a hook.
    ////////////////////////////////////////////
    getHashes: function() {
      return pendingHashes;
    },
    ////////////////////////////////////////////
    // removeHash
    //
    // Once the transaction completes, we will remove
    // the hash from the registry.
    ////////////////////////////////////////////
    removeHash: function(hash) {
      pendingHashes = pendingHashes.filter((h) => h !== hash);
    }
  }
})();

export default Locksmith;
