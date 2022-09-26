//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import React from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import { Logo } from './Logo';
import SidebarWithHeader from './layout/SidebarWithHeader'

//////////////////////////////////////
// Wallet and Network
//////////////////////////////////////
import { WagmiConfig, createClient, getDefualtClient, chain } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";

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
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={client}>
        <SidebarWithHeader/>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default App;
