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
import { WagmiConfig, createClient, configureChains, chain } from "wagmi";
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

//////////////////////////////////////
// Pages and Navigation
//////////////////////////////////////
import { BrowserRouter as Router, Routes, Route}
    from 'react-router-dom';
import Home from './Home.js';
import {
  Trusts, 
  Trust
} from './Trusts.js';
import Keys from './Keys.js';
import Assets from './Assets.js';
import Trustees from './Trustees.js';
import Events from './Events.js';
import { Security } from './Security.js'
import { Footer } from './Footer.js';
import { TrustWizard } from './TrustWizard.js';
import { Inbox } from './Inbox.js';

// We are using alchemy for now
// Choose which chains you'd like to show
const {chains, provider, webSocketProvider} = configureChains([chain.goerli, chain.hardhat], [
  alchemyProvider({apiKey:'8TN4uRz1cIbyDUgHZ80u0tKdQA2Qsc8j'}),
  publicProvider(),
]);

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({chains}),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Locksmith',
      }
    })
  ],
  provider,
  webSocketProvider,
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <WagmiConfig client={client}>
        <Router>
          <SidebarWithHeader>
            <Routes>
              <Route exact path='/' element={<Home/>} />
              <Route path='/trusts' element={<Trusts/>} />
              <Route path='/trust/:id/:tab' element={<Trust/>} />
              <Route path='/keys' element={<Keys/>} />
              <Route path='/assets' element={<Assets/>} />
              <Route path='/trustees' element={<Trustees/>} />
              <Route path='/events' element={<Events/>} />
              <Route path='/wizard' element={<TrustWizard/>} />
              <Route path='/key/:keyId/inbox' element={<Inbox/>} />
              <Route path='/security' element={<Security/>} />
            </Routes>
            <Footer/>
          </SidebarWithHeader>
        </Router>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default App;
