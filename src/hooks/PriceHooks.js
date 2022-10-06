import { useQuery } from 'react-query';

////////////////////////////////////////////////
// Prices
//
// This is a simple service that grabs the price
// of a coin based on its ticker symbol, based in USD.
//
// It currently uses Coincap.io with no authentication.
////////////////////////////////////////////////

/**
 * USDFormatter
 *
 * Prices and dust can get messy. Let's clean it up.
 *
 * Usage: USDFormatter.format(number);
 */
export const USDFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

/**
 * useCoinCapPrice
 *
 * This calls out to CoinCap.io and uses their prices based
 * on their IDs. The IDs are locally stored in the AssetResource
 * service for now.
 */
export function useCoinCapPrice(coinCapId) {
  return useQuery("CoinCap price for symbol " + (coinCapId||'').toString(), async function() {
    // short circuit
    if (!coinCapId) { return 0; }

    var response = await fetch("https://api.coincap.io/v2/assets/" + coinCapId.toString(), {
      method: 'GET',
      redirect: 'follow'
    });
    return (await response.json()).data.priceUsd;
  });
}

