import { ethers } from 'ethers';
import Locksmith from './Locksmith.js';

import {
  FIL
} from 'react-cryptoicon';

export const FilecoinAssets = (function() {
  // we want to be able to generate ARNs in the same
  // fashion that the platform does
  var getArn = function(contractAddress, tokenStandard, assetId) {
    return ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address','uint256','uint256'],
        [contractAddress, tokenStandard, assetId]
      )
    );
  };

  var freshenUp = function() {
    var metadata = {}
    // Gas Token
    metadata[getArn(ethers.constants.AddressZero, 0, 0)] = {
      name: 'Filecoin',
      symbol: 'FIL',
      decimals: 18,
      contractAddress: null,
      standard: 0,
      id: 0,
      coinCapId: 'filecoin',
      icon: function(props = {}) {
        return <FIL {...props} color='#0090FF'/>;
      }
    };
 
    return metadata;
  };

  return {
    assetMetadata: freshenUp
  };
})(); 
