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
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Logo } from './Logo';
import SidebarWithHeader from './layout/SidebarWithHeader'

//////////////////////////////////////
// Wallet and Network
//////////////////////////////////////
import { WagmiConfig, createClient } from "wagmi";
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";

// We are using alchemy for now
const alchemyId = process.env.ALCHEMY_ID;
const client = createClient(
  getDefaultClient({
    appName: "Locksmith",
    alchemyId,
  })
);

function App() {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <ChakraProvider theme={theme}>
          <SidebarWithHeader />
        </ChakraProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default App;
