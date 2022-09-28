//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box, BoxProps,
  Center,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  VStack,
  useColorModeValue
} from '@chakra-ui/react'

import { FaTimes } from 'react-icons/fa';
import { GiBossKey } from 'react-icons/gi';
import { HiOutlineKey } from 'react-icons/hi';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import {
  useAccount
} from 'wagmi';

import {
  useWalletKeys,
  useKeyInfo,
} from './hooks/LocksmithHooks.js';

//////////////////////////////////////
// Keys Function Component
//////////////////////////////////////
function Keys() {
  const keys = useWalletKeys();
  let keyBody = '';

  if (!keys.isSuccess) {
    keyBody = (<>
      <WrapItem key='1'>
        <Box w='10em' h='12em'>
          <Skeleton height='12em' borderRadius='lg'/>
        </Box>
      </WrapItem>
      <WrapItem key='2'>
        <Box w='10em' h='12em'>
          <Skeleton height='12em' borderRadius='lg'/>
        </Box>
      </WrapItem>
      <WrapItem key='3'>
        <Box w='10em' h='12em'>
          <Skeleton height='12em' borderRadius='lg'/>
        </Box>
      </WrapItem></>); 
  } else {
    keyBody = (keys.data.map((k) => (<Key key={k} keyId={k}/>)));
  }

  return (
    <Stack m='1em' spacing='1em'>
      <Heading size='md'>Keys in Your Wallet</Heading>
        <Wrap padding='3em' spacing='2em' pb='6em'>
          {keyBody}
        </Wrap>
    </Stack>
  );
}

interface KeyProps extends BoxProps {
  keyId: BigNumber
}

const Key = ({keyId, ...rest}: KeyProps) => {
  var boxColor = useColorModeValue('white', 'gray.800');
  var account = useAccount(); 
  var keyInfo = useKeyInfo(keyId, account.address);
  var body = '';

  if(!keyInfo.isSuccess) {
    body = (
      <></>
    );
  } else {
    body = (
      <Center w='8em'>
        <VStack spacing='1em'>
          <Text fontSize='xs' fontStyle='italic' color='gray.500'>{keyInfo.data.trust.name}</Text>
          <HStack>
            {keyInfo.data.isRoot ? <GiBossKey size='56px'/> : <HiOutlineKey size='56px'/>}
            <FaTimes/>
            <Text fontSize='2xl'>{keyInfo.data.inventory.toString()}</Text>
          </HStack>
          <Text>{keyInfo.data.alias}</Text>
          {keyInfo.data.soulbound.toString() != '0' && 
            <Tag colorScheme='purple'><TagLabel>{keyInfo.data.soulbound.toString()} × Soulbound</TagLabel></Tag>}
        </VStack>
      </Center>
    )
  }

  return (
    <WrapItem key={keyId} p='1em' w='10em' h='12em' 
      border={keyInfo.isSuccess && keyInfo.data.isRoot ? '2px' : '0px'} 
      borderColor={keyInfo.isSuccess && keyInfo.data.isRoot ? 'yellow.400' : 'white'}
      borderRadius='lg' 
      bg={boxColor} boxShadow='dark-lg'
      cursor='pointer'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
      {body}
    </WrapItem>
  );
}


export default Keys;
