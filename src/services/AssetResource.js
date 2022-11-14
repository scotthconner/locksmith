import { ethers } from 'ethers';
import Locksmith from './Locksmith.js';

import {
  DAI,
  LINK,
  USDC,
} from 'react-cryptoicon';

import { AVAX } from '../components/icons/AVAX.js';
import { ETH } from '../components/icons/ETH.js';
import { GRT } from '../components/icons/GRT.js';
import { MATIC } from '../components/icons/MATIC.js';

/**
 * AssetResource 
 *
 * This is a quick way of determining some asset metadata.
 * There is a big assumption that right now there is only
 * one environment (development), but this will need to be
 * extended for test nets and main nets along the way.
 */
export const AssetResource = (function() {
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

  // we are going to boostrap this against known ARNs and
  // contracts deployed in development. Because the node
  // re-starts and we deploy it over and over, we have
  // to reconstitute this each time.
  var metadata = {};

  var freshenUp = function() {
    metadata = {}
    // Gas Token
    metadata[getArn(ethers.constants.AddressZero, 0, 0)] = {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      contractAddress: null,
      coinCapId: 'ethereum',
      icon: function(props = {}) {
        return <ETH {...props} color='#716b94'/>;
      }
    };
  
    // Shadow ERC20s
    metadata[getArn(Locksmith.getAssetAddress('link'), 20, 0)] = {
      name: 'Chainlink',
      symbol: 'LINK',
      decimals: 18,
      contractAddress: Locksmith.getAssetAddress('link'),
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
      icon: function(props = {}) {
        return <GRT color='#6f4cff' {...props}/>;
      }
    };
    metadata[getArn(Locksmith.getAssetAddress('usdc'), 20, 0)] = {
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      contractAddress: Locksmith.getAssetAddress('usdc'),
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
      icon: function(props = {}) {
        return <DAI color='#febe44' {...props}/>;
      }
    };
  };
  freshenUp();

  return {
    /////////////////////////////////////////////
    // refreshMetadata
    //
    // If a network changes, you'll want to re-cache
    // the addresses.
    /////////////////////////////////////////////
    refreshMetadata: function() { freshenUp(); },
    /////////////////////////////////////////////
    // getTokenArn
    //
    // Assumes you are trying to get an ARN for
    // an ERC20, given nothing but the token's 
    // contract address.
    /////////////////////////////////////////////
    getTokenArn: function(contract) {
      // ERC20s have no unique ID
      return getArn(contract, 20, 0);
    },
    /////////////////////////////////////////////
    // getMetadata
    //
    // Given an ARN, provides a hash of information 
    // that is useful for a number of scenarios.
    // This is obivously network dependent.
    /////////////////////////////////////////////
    getMetadata: function(arn = null) {
      return arn ? metadata[arn] : metadata; 
    }
  };
})();
