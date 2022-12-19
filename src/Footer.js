import {
  HStack,
  Heading,
  Box,
  Container,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { RiLock2Fill } from 'react-icons/ri';

const ListHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

export function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}>
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>Code</ListHeader>
            <Link target='_blank' href={'/security'}>Deployment Verification</Link>
            <Link target='_blank' href={'https://github.com/scotthconner/smartrust'}>Contract Github</Link>
            <Link target='_blank' href={'https://github.com/scotthconner/locksmith'}>Website Github</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link href={'#'}>About Us</Link>
            <Link href={'#'}>Terms of Service</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>Follow Us</ListHeader>
            <Link target='_blank' href={'https://twitter.com/LocksmithWallet'}>Twitter</Link>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box py={10}>
        <Flex
          align={'center'}
          _before={{
            content: '""',
            borderBottom: '1px solid',
            borderColor: useColorModeValue('gray.200', 'gray.700'),
            flexGrow: 1,
            mr: 8,
          }}
          _after={{
            content: '""',
            borderBottom: '1px solid',
            borderColor: useColorModeValue('gray.200', 'gray.700'),
            flexGrow: 1,
            ml: 8,
          }}>
          <HStack spacing='0'>
            <Heading fontSize={'3xl'}>L</Heading>
            <RiLock2Fill size='26px'/>
            <Heading fontSize={'3xl'}>cksmith</Heading>
          </HStack>
        </Flex>
        <Text pt={6} fontSize={'sm'} textAlign={'center'}>
          © 2022 Locksmith Contracts. All rights reserved
        </Text>
      </Box>
    </Box>
  );
}
