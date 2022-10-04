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

  // Gas Token
  metadata[getArn(ethers.constants.AddressZero, 0, 0)] = {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    icon: function(props = {color: '#716b94'}) {
      return <ETH {...props}/>;
    }
  };
  
  // Shadow ERC20s
  metadata[getArn(Locksmith.getContractAddress('coin'), 20, 0)] = {
    name: 'Chainlink',
    symbol: 'LINK',
    decimals: 18,
    icon: function(props = {color: '#375BD2'}) {
      return <LINK {...props}/>;
    }
  };
  metadata[getArn(Locksmith.getContractAddress('matic'), 20, 0)] = {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    icon: function(props = {color: '#8247e5'}) {
      return <MATIC {...props}/>;
    }
  };
  metadata[getArn(Locksmith.getContractAddress('avax'), 20, 0)] = {
    name: 'Wormhole',
    symbol: 'WAVAX',
    decimals: 18,
    icon: function(props = {color: '#e84142'}) {
      return <AVAX {...props}/>;
    }
  };
  metadata[getArn(Locksmith.getContractAddress('grt'), 20, 0)] = {
    name: 'The Graph',
    symbol: 'GRT',
    decimals: 18,
    icon: function(props = {color: '#6f4cff'}) {
      return <GRT {...props}/>;
    }
  };
  metadata[getArn(Locksmith.getContractAddress('usdc'), 20, 0)] = {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
    icon: function(props = {color: '#2775ca'}) {
      return <USDC {...props}/>;
    }
  };
  metadata[getArn(Locksmith.getContractAddress('dai'), 20, 0)] = {
    name: 'Dai',
    symbol: 'DAI',
    decimals: 18,
    icon: function(props = {color: '#febe44'}) {
      return <DAI {...props}/>;
    }
  };

  return {
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
    getMetadata: function(arn) {
      return metadata[arn]; 
    }
  };
})();
