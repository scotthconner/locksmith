import {
  Skeleton,
  Text
} from '@chakra-ui/react'
import { 
  useCoinCapPrice,
  USDFormatter,
} from '../hooks/PriceHooks.js';
import {
  TRUST_CONTEXT_ID,
  useContextArnRegistry,
  useContextArnBalances,
} from '../hooks/LedgerHooks.js';
import {
  AssetResource
} from '../services/AssetResource.js';
import { ethers } from 'ethers';

export function TrustBalanceUSD({trustId, skeletonProps, textProps, ...rest}) {
  // get the trust context arn registry for the given trust ID
  const arns = useContextArnRegistry(TRUST_CONTEXT_ID, trustId);

  // for each arn we want to get the asset balance. I've gone back
  // and forth if I should return an arn array along with the balances
  // for Ledger.sol, preventing this serialization. Another more robust
  // way to solve this is to use a graph or index. In the end, the two
  // serial calls is sub-optimal but worth the trade-off. Having to handle
  // the additional array on return every time even if you know what you're
  // getting seems like a heavy cost. I could introduce more byte-code
  // to provide the serialized introspection, but that's valuble contract
  // space. You can wait another 300ms.
  const arnBalances = useContextArnBalances(TRUST_CONTEXT_ID, trustId, 
    arns.isSuccess ? arns.data : null);

  return !(arnBalances.isSuccess && arns.isSuccess) ? <Skeleton {... textProps} {...skeletonProps}/> :
    (arns.data.length !== 0 ? <RecursiveTrustBalanceUSD arns={arns.data} arnBalances={arnBalances.data} 
          position={0} total={0} textProps={textProps}/> : <Text {...textProps}>$0.00</Text>)
}

const RecursiveTrustBalanceUSD = ({arns, arnBalances, position, total, textProps, ...rest}) => {
  // grab the coin cap price for the position we are at.
  const assetPrice = useCoinCapPrice(AssetResource.getMetadata(arns[position]).coinCapId);

  // once we have the asset price, determine the total arn value
  const arnValue = !assetPrice.isSuccess ? 0 : assetPrice.data * 
    ethers.utils.formatEther(arnBalances[position]);

  // this becomes an interesting trick where we 'trickle down' loaded asset
  // prices recursively until we reach the end node where we simply display
  // the value. This is a way to "add to the balance" every time 
  // #useCoinCapPrice comes back, and allows us to parallelize all promises.
  return position === (arnBalances.length - 1) ?
    <Text {...textProps}>{USDFormatter.format(total + arnValue)}</Text> :
    <RecursiveTrustBalanceUSD arns={arns} arnBalances={arnBalances}
      position={position+1} total={total + arnValue} textProps={textProps}/>
}
