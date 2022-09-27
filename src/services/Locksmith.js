/**
 * Locksmith
 *
 * Service provides an interface to the locksmith contracts.
 **/
const Locksmith = (function() {
  const contractAddresses = require("../hardhat-contracts.json")
  const interfaces = {
    keyVault: require("../contracts/KeyVault.sol/KeyVault.json"),
    locksmith: require("../contracts/Locksmith.sol/Locksmith.json")
  };

  return {
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
    // getContractRead
    //
    // Given a contract alias, produce the
    // wagmi hash for the useContractRead hook.
    ////////////////////////////////////////////
    getContractRead: function(contract, method, args) {
      return {
        addressOrName: contractAddresses[contract],
        contractInterface: interfaces[contract].abi,
        functionName: method,
        args: args
      }
    }
  }
})();

export default Locksmith;
