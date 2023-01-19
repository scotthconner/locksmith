import { ethers } from 'ethers';
import Locksmith from './Locksmith.js';

import {
  FIL,
  LINK,
  DAI,
  USDC,
} from 'react-cryptoicon';

import { AVAX } from '../components/icons/AVAX.js';
import { GRT } from '../components/icons/GRT.js';

export const HyperspaceAssets = (function() {
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
  
    // Shadow ERC20s
    metadata[getArn(Locksmith.getAssetAddress('link'), 20, 0)] = {
      name: 'Chainlink',
      symbol: 'LINK',
      decimals: 18,
      contractAddress: Locksmith.getAssetAddress('link'),
      standard: 20,
      id: 0,
      coinCapId: 'chainlink',
      icon: function(props = {}) {
        return <LINK {...props} color='#375BD2'/>;
      }
    };
    metadata[getArn(Locksmith.getAssetAddress('avax'), 20, 0)] = {
      name: 'Wormhole',
      symbol: 'WAVAX',
      decimals: 18,
      contractAddress: Locksmith.getAssetAddress('avax'),
      standard: 20,
      id: 0,
      coinCapId: 'avalanche',
      icon: function(props = {}) {
        return <AVAX color='#e84142' {...props}/>;
      }
    };
    metadata[getArn(Locksmith.getAssetAddress('grt'), 20, 0)] = {
      name: 'The Graph',
      symbol: 'GRT',
      decimals: 18,
      coinCapId: 'the-graph',
      contractAddress: Locksmith.getAssetAddress('grt'),
      standard: 20,
      id: 0,
      icon: function(props = {}) {
        return <GRT color='#6f4cff' {...props}/>;
      }
    };
    metadata[getArn(Locksmith.getAssetAddress('usdc'), 20, 0)] = {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      contractAddress: Locksmith.getAssetAddress('usdc'),
      standard: 20,
      id: 0,
      coinCapId: 'usd-coin',
      icon: function(props = {}) {
        return <USDC color='#2775ca' {...props}/>;
      }
    };
    metadata[getArn(Locksmith.getAssetAddress('dai'), 20, 0)] = {
      name: 'Dai',
      symbol: 'DAI',
      decimals: 18,
      coinCapId: 'multi-collateral-dai',
      contractAddress: Locksmith.getAssetAddress('dai'),
      standard: 20,
      id: 0,
      icon: function(props = {}) {
        return <DAI color='#febe44' {...props}/>;
      }
    };

    return metadata;
  };

  return {
    assetMetadata: freshenUp
  };
})();
