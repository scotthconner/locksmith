//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import React, {useState} from 'react';
import {
  ChakraProvider,
  theme,
} from '@chakra-ui/react';
import SidebarWithHeader from './layout/SidebarWithHeader'

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { WagmiConfig, createClient, chain, useProvider, useContract, useAccount } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { useQuery } from "react-query";
import Locksmith from './services/Locksmith.js';

// We are using alchemy for now
// Choose which chains you'd like to show
const chains = [chain.hardhat, chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum];

const alchemyId = process.env.ALCHEMY_ID;
const client = createClient(
  getDefaultClient({
    appName: "Locksmith",
    alchemyId,
    chains
  })
);

function App() {
  const provider = useProvider();
  const contract = useContract(Locksmith.getContract('keyVault', provider)); 

  const {data} = useQuery('balance', async function() {
    return (await contract.balanceOf('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 0)).toNumber(); 
  });


  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={client}>
        <SidebarWithHeader>
          {data}
        </SidebarWithHeader>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default App;
