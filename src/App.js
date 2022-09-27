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


//////////////////////////////////////
// Pages and Navigation
//////////////////////////////////////
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from './Home.js';
import Keys from './Keys.js';
import Assets from './Assets.js';
import Trustees from './Trustees.js';
import Events from './Events.js';

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
    <Router>
      <ChakraProvider theme={theme}>
        <WagmiConfig client={client}>
          <SidebarWithHeader>
            <Routes>
              <Route exact path='/' exact element={<Home/>} />
              <Route path='/keys' element={<Keys/>} />
              <Route path='/assets' element={<Assets/>} />
              <Route path='/trustees' element={<Trustees/>} />
              <Route path='/events' element={<Events/>} />
            </Routes>
          </SidebarWithHeader>
        </WagmiConfig>
      </ChakraProvider>
    </Router>
  );
}

export default App;
