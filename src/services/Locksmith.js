/**
 * Locksmith
 *
 * Service provides an interface to the locksmith contracts.
 **/
const Locksmith = (function() {
  var contractAddresses = require("../registries/network-contracts-31337.json")
  var assetAddresses = require("../registries/network-assets-31337.json");

  const interfaces = {
    KeyVault: require("../contracts/KeyVault.sol/KeyVault.json"),
    Locksmith: require("../contracts/Locksmith.sol/Locksmith.json"),
    Notary: require("../contracts/Notary.sol/Notary.json"),
    Ledger: require("../contracts/Ledger.sol/Ledger.json"),
    EtherVault: require("../contracts/providers/EtherVault.sol/EtherVault.json"),
    TokenVault: require("../contracts/providers/TokenVault.sol/TokenVault.json"),
    TrustEventLog: require("../contracts/TrustEventLog.sol/TrustEventLog.json"),
    KeyOracle: require("../contracts/dispatchers/KeyOracle.sol/KeyOracle.json"),
    AlarmClock: require("../contracts/dispatchers/AlarmClock.sol/AlarmClock.json"),
    Trustee: require("../contracts/scribes/Trustee.sol/Trustee.json"),
  };

  return {
    ////////////////////////////////////////////
    // setChainId
    //
    // Will reload all of the addresses based
    // on the new chain ID.
    ////////////////////////////////////////////
    setChainId: function(chainId) {
      contractAddresses = require("../registries/network-contracts-" + chainId + ".json")
      assetAddresses = require("../registries/network-assets-" + chainId + ".json");
    },
    ////////////////////////////////////////////
    // getContractAddress
    ////////////////////////////////////////////
    getContractAddress: function(contract) {
      return contractAddresses[contract];
    },
    ////////////////////////////////////////////
    // getContractAddress
    ////////////////////////////////////////////
    getAssetAddress: function(asset) {
      return assetAddresses[asset];
    },
    ////////////////////////////////////////////
    // getContract
    // 
    // Given a contract alias, produce the ethers
    // map necessary for a useContract hook.
    ////////////////////////////////////////////
    getContract: function(contract, provider) {
      return {
        addressOrName: contractAddresses[contract],
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
        addressOrName: contractAddresses[contract],
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
