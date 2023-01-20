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
import { AiOutlineTwitter, AiOutlineGithub } from 'react-icons/ai';
import { FaDiscord, FaPaintBrush } from 'react-icons/fa';
import { RiLock2Fill } from 'react-icons/ri';
import { IoIosDocument } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////

//////////////////////////////////////
// Home Function Component
//////////////////////////////////////
const features = [{
    id: 0,
    title: 'NFT-based Permissions',
    text: 'Manage wallet permissions with a fully customizable NFT collection.'
  }, {
    id: 1,
    title: 'Virtual Wallet Identity',
    text: 'Maintain a single on-chain address irrespective of private key.'
  }, {
    id: 2,
    title: 'Next Generation Security',
    text: 'Block unsolicited token deposits. Prevent dustings.' 
  }, {
    id: 3,
    title: 'Chain-wide Portfolio',
    text: 'Store, track, and permission your crypto anywhere on-chain.'
  },{
    id: 4,
    title: 'Wallet Recovery and Inheritance',
    text: 'Recover your entire wallet, or divide in absence.'
  }, {
    id: 5,
    title: 'Open Platform API',
    text: 'Customize events, permissions, asset storage, or build on top.'
  }
];

function Home() {
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <VStack spacing={4} as={Container} maxW={'3xl'} textAlign={'center'}>
        <HStack spacing='0'>
          <Heading fontSize='5xl'>L</Heading>
          <RiLock2Fill size='44px'/>
          <Heading fontSize={'5xl'}>cksmith</Heading>
        </HStack>
        <Text pb='1em' color={'gray.600'} fontSize={'xl'}>
          Your Keys. Your Locks. Your Wallet. 
        </Text>
        <HStack>
          <Button leftIcon={<IoIosDocument/>} colorScheme='gray' 
            onClick={() => { window.open('https://locksmith-wallet.gitbook.io/whitepaper/');}}>Read Whitepaper</Button> 
          <Button leftIcon={<FaPaintBrush/>} colorScheme='blue' onClick={() => { navigate('/wizard'); }}>Design Wallet</Button>
        </HStack>
        <HStack pt='1em'>
          <Button variant='ghost' colorScheme='twitter' leftIcon={<AiOutlineTwitter/>}
            onClick={() => window.open('https://twitter.com/LocksmithWallet')}>Twitter</Button>
          <Button variant='ghost' colorScheme='purple' leftIcon={<FaDiscord/>}
            onClick={() => window.open('https://discord.gg/Drwrw4gmqP')}>Discord</Button>
          <Button variant='ghost' colorScheme='gray' leftIcon={<AiOutlineGithub/>}
            onClick={() => window.open('https://github.com/scotthconner?tab=repositories')}>Github</Button>
        </HStack>
        <Heading pt='0.5em' fontSize='3xl'>The Next Generation Wallet is Virtual.</Heading>
        <Text pt='0.5em' fontSize='lg'>Keep your existing wallet. Extend it with Locksmith.</Text>
      </VStack>

      <Container maxW={'6xl'} mt={10} mb='4em'>
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
