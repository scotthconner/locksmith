//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Icon,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { RiLock2Fill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////

//////////////////////////////////////
// Home Function Component
//////////////////////////////////////
const features = [{
    id: 0,
    title: 'Full Root Access',
    text: 'Configure your trust exactly as you see fit. Or burn you root key to make the trust irrevocable.'
  }, {
    id: 1,
    title: 'Granular Permissions',
    text: 'Enable your trust participants to do only what you allow.'
  }, { 
    id: 2,
    title: 'Integrated Asset Vaults',
    text: 'Store and distribute Ethereum and ERC-20 tokens safely.'
  }, {
    id: 3,
    title: 'Collateral Platform',
    text: 'Bring interest bearing or exotic assets of your own into the managed trust ledger.'
  }, {
    id: 4,
    title: 'Trustee Platform',
    text: 'Configure scribes or write your own to manage complex distributions.',
  }, {
    id: 5,
    title: 'Event Platform',
    text: 'Use the integrated event bus to chain life events or set up gating factors on trust execution.' 
  }, {
    id: 6,
    title: 'Crypto Notarization',
    text: 'Only trusted collateral providers or scribes can deposit, withdrawal, or distribute funds on your behalf.'
  }, {
    id: 7,
    title: 'Soulbound Key Security',
    text: 'Prevent keys from being transferred, sold, or collateralized. Enable soulbound contract agents.'
  }
];

function Home() {
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <VStack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'}>
        <HStack spacing='0'>
          <Heading fontSize={'3xl'}>Welcome to L</Heading>
          <RiLock2Fill size='26px'/>
          <Heading fontSize={'3xl'}>cksmith</Heading>
        </HStack>
        <Text color={'gray.600'} fontSize={'xl'}>
          Create and manage your Web3 circle of trust. 
        </Text>
        <Text color={'gray.600'} fontSize={'xl'}>
          Mint, configure, distribute, soulbind, and burn trust keys <b>you</b> control.
        </Text>
        <Button colorScheme='blue' onClick={() => { navigate('/wizard'); }}>Design Trust Now</Button>
      </VStack>

      <Container maxW={'6xl'} mt={10}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={10}>
          {features.map((feature) => (
            <HStack key={feature.id} align={'top'}>
              <Box color={'green.400'} px={2}>
                <Icon as={CheckIcon} />
              </Box>
              <VStack align={'start'}>
                <Text fontWeight={600}>{feature.title}</Text>
                <Text color={'gray.600'}>{feature.text}</Text>
              </VStack>
            </HStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default Home;
