import * as hardhatContracts from '../registries/network-contracts-31337.json';
import * as hardhatAssets    from '../registries/network-assets-31337.json';
import * as goerliContracts  from '../registries/network-contracts-5.json';
import * as goerliAssets     from '../registries/network-assets-5.json';

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

/**
 * Locksmith
 *
 * Service provides an interface to the locksmith contracts.
 **/
const Locksmith = (function() {
  var myChainId = 31337; // hardhat
  var contractAddresses = {};
  var assetAddresses = {};

  contractAddresses[31337] = hardhatContracts;
  assetAddresses[31337] = hardhatAssets;
  contractAddresses[5] = goerliContracts;
  assetAddresses[5] = goerliAssets;


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
    Trustee: trustee 
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
    ////////////////////////////////////////////
    // getContractAddress
    ////////////////////////////////////////////
    getContractAddress: function(contract) {
      return contractAddresses[myChainId][contract];
    },
    ////////////////////////////////////////////
    // getContractAddress
    ////////////////////////////////////////////
    getAssetAddress: function(asset) {
      return assetAddresses[myChainId][asset];
    },
    ////////////////////////////////////////////
    // getContract
    // 
    // Given a contract alias, produce the ethers
    // map necessary for a useContract hook.
    ////////////////////////////////////////////
    getContract: function(contract, provider) {
      return {
        addressOrName: contractAddresses[myChainId][contract] || assetAddresses[myChainId][contract],
        contractInterface: interfaces[contract].abi,
        signerOrProvider: provider
      }
    },
    ////////////////////////////////////////////
    // getContractWrite
    //
    // Given a contract alias, produce the
    // wagmi hash for the useContractRead hook.
    ////////////////////////////////////////////
    getContractWrite: function(contract, method, args, enabled) {
      return {
        addressOrName: contractAddresses[myChainId][contract] || assetAddresses[myChainId][contract],
        contractInterface: interfaces[contract].abi,
        functionName: method,
        args: args,
        enabled: enabled,
        onError(error) {
          console.log("Something really bad happened: " + error);
        }
      }
    }
  }
})();

export default Locksmith;
