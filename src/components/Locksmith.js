import {
  Button,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ConnectKitButton } from 'connectkit';
import { useNavigate } from 'react-router-dom';

export function ConnectWalletPrompt({}) {
  const navigate = useNavigate();
  return <VStack textAlign='center' spacing='2em' m='3em'>
    <Text fontSize='lg'>You have not connected your wallet.</Text>
    <HStack>
      <ConnectKitButton/>
      <Button colorScheme='blue' onClick={() => {navigate('/wizard');} }>Design Trust Now</Button>
    </HStack>
  </VStack>
}
