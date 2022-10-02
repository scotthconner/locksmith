/**
 * Locksmith
 *
 * Service provides an interface to the locksmith contracts.
 **/
const Locksmith = (function() {
  const contractAddresses = require("../hardhat-contracts.json")
  const interfaces = {
    keyVault: require("../contracts/KeyVault.sol/KeyVault.json"),
    locksmith: require("../contracts/Locksmith.sol/Locksmith.json"),
    notary: require("../contracts/Notary.sol/Notary.json")
  };

  return {
    ////////////////////////////////////////////
    // getCollateralProviderName 
    ////////////////////////////////////////////
    getCollateralProviderName: function(address) {
      switch(address) {
        case Locksmith.getContractAddress('vault'):
          return 'Ether Vault';
          break;
        case Locksmith.getContractAddress('tokenVault'):
          return 'ERC20 Vault';
          break;
        default:
          return address;
      }

      return address;
    },
    ////////////////////////////////////////////
    // getContractAddress
    ////////////////////////////////////////////
    getContractAddress: function(contract) {
      return contractAddresses[contract];
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
