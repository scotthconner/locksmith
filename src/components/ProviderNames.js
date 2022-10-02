import Locksmith from '../services/Locksmith.js';

export function getProviderName(address) {
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
}
