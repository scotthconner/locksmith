//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Spacer,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { RiSafeLine } from 'react-icons/ri';
import { HiOutlineKey } from 'react-icons/hi';
import { KeyInfoIcon } from './components/KeyInfo.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers, BigNumber } from 'ethers';
import { AssetResource } from './services/AssetResource.js';
import {
  useWalletKeys
} from './hooks/LocksmithHooks.js';
import {
  KEY_CONTEXT_ID,
  useContextArnRegistry,
  useContextProviderRegistry,
  useContextArnBalances,
} from './hooks/LedgerHooks.js';
import {
  useCoinCapPrice,
  USDFormatter,
} from './hooks/PriceHooks.js';

function Assets() {
  const keys = useWalletKeys();
  return (
    <Stack m='1em' spacing='3em'>
      <Heading size='md'>Your Withdrawalable Assets</Heading>
        {(!keys.isSuccess || keys.data.length === 0) && 
          <VStack spacing='2em' mt='2em'>
            <Skeleton width='100%' height='4em'/>
            <Skeleton width='100%' height='4em'/>
            <Skeleton width='100%' height='4em'/>
            <Skeleton width='100%' height='4em'/>
          </VStack>}
        {(keys.isSuccess && keys.data.length > 0) && 
          <RecursiveWalletArnCollector keys={keys.data} position={0} arns={[]}/>} 
    </Stack>
  );
}

const RecursiveWalletArnCollector = ({keys, position, arns, ...rest}) => {
  // we need to grab the arns for for the active key position
  const keyArns = useContextArnRegistry(KEY_CONTEXT_ID, keys[position]);
  const collectedArns = !keyArns.isSuccess ? arns : [...arns, ...keyArns.data];
  
  return (position === keys.length - 1) ? 
    <WalletArnList keys={keys} arns={[...(new Set(arns))]}/> :
    <RecursiveWalletArnCollector keys={keys} position={position+1}
      arns={collectedArns}/> 
}

const WalletArnList = ({arns, keys, ...rest}) => {
  return <VStack spacing='2em' pb='2em'>
      {arns.map((a,x) => <WalletArn key={'wallet-arn-' + a} 
        keys={keys} arn={a} arnPosition={x}/> 
      )}
  </VStack>
}

const WalletArn = ({arn, keys, keyBalances, ...rest}) => {
  var asset = AssetResource.getMetadata(arn);
  var boxColor = useColorModeValue('white', 'gray.800');

  return <Box p='1em' width='90%'
    borderRadius='lg'
    bg={boxColor} boxShadow='dark-lg'
    _hover= {{
      transform: 'scale(1.1)',
    }}
    transition='all 0.2s ease-in-out'>
      <HStack spacing='1em'>
        {asset.icon()}
        <Text><b>{asset.name}</b>&nbsp;
          <font color='gray'>({asset.symbol})</font>
        </Text>
        <Spacer/>
        <RecursiveKeyArnBalanceCollector asset={asset} arn={arn} keys={keys}
          position={0} arnBalance={BigNumber.from(0)}/>
      </HStack>
  </Box>
}

const RecursiveKeyArnBalanceCollector = ({asset, arn, keys, position, arnBalance, ...rest}) => {
  // get the arn balance for the key position
  const keyArnBalance = useContextArnBalances(KEY_CONTEXT_ID, keys[position], [arn]);
  let keyArnBalanceAmount = keyArnBalance.isSuccess && keyArnBalance.data.length > 0 ?
    keyArnBalance.data[0] : BigNumber.from(0)
  
  return position === (keys.length - 1) ? 
    <VStack>
      <Text><font color='gray'>
        {ethers.utils.formatEther(arnBalance.add(keyArnBalanceAmount))} {asset.symbol}
      </font></Text>
    </VStack> :
    <RecursiveKeyArnBalanceCollector arn={arn} keys={keys} asset={asset}
      position={position+1} arnBalance={arnBalance.add(keyArnBalanceAmount)}/> 
}

export default Assets;
