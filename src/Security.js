//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  VStack,
  Text,
  HStack,
  List,
  ListItem,
  Link
} from '@chakra-ui/react';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import Locksmith from './services/Locksmith.js'; 

//////////////////////////////////////
// Trusts Function Component
//////////////////////////////////////
export function Security() {
  const chainId = Locksmith.getChainId();
  const contractRegistry = Locksmith.getContractRegistry(chainId);
  const etherscanURL = function(address) {
    if (chainId === 5) {
      return "https://goerli.etherscan.io/address/" + address;
    } else if (chainId === 1) {
      return "https://etherscan.io/address/" + address;
    } else {
      return "https://etherscan.io";
    }
  };

  return <VStack> 
    <Text fontSize='lg'>You are currently pointed at chain ID: {chainId}</Text>
    <Text fontSize='lg'>Please check the contracts and their code verification on Etherscan:</Text>
    <List>
      { Object.keys(contractRegistry).map((c) => c !== 'default' && <ListItem key={'crli-' + c}>
        <HStack>
          <Text>{c}:</Text>
          <Link color='blue.500' target='_blank' href={etherscanURL(contractRegistry[c]['address'])}>{contractRegistry[c]['address']}</Link>
        </HStack>
      </ListItem>) }
    </List>
  </VStack>
}
