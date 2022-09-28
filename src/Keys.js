//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box, BoxProps,
  Heading,
  Skeleton,
  Stack,
  useColorModeValue
} from '@chakra-ui/react'


//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
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
      <Skeleton height='6em'/>
      <Skeleton height='6em'/>
      <Skeleton height='6em'/>
    </>); 
  } else {
      keyBody = (<>
      {keys.data.map((k) => (
        <Key keyId={k}/>
      ))}
    </>);
  }

  return (
    <Stack m='1em' spacing='1em'>
      <Heading size='md'>Keys in Your Wallet</Heading>
      <Stack spacing='1.5em'>
        {keyBody}
      </Stack>
    </Stack>
  );
}

interface KeyProps extends BoxProps {
  keyId: BigNumber
}

const Key = ({keyId, ...rest}: KeyProps) => {
  var boxColor = useColorModeValue('white', 'gray.800');
  var keyInfo = useKeyInfo(keyId);

  return (
    <Box p='1em' h='6em' borderRadius='lg' bg={boxColor} boxShadow='dark-lg'>
      {keyId.toNumber()} 
    </Box>
  );
}


export default Keys;
