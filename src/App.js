//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  ChakraProvider,
  theme,
} from '@chakra-ui/react';
import SidebarWithHeader from './layout/SidebarWithHeader'

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { WagmiConfig, createClient, chain } from "wagmi";
import { getDefaultClient } from "connectkit";
import KeyWallet from "./KeyWallet.js";

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
        <KeyWallet>
          <SidebarWithHeader>
          </SidebarWithHeader>
        </KeyWallet>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default App;
