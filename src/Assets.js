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
  useContextBalanceSheet,
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
          <WalletBalanceSheet keys={keys.data} position={0} balanceSheet={{}}/>} 
    </Stack>
  );
}

const WalletBalanceSheet = ({keys, position, balanceSheet, ...rest}) => {
  const keyBalanceSheet = useContextBalanceSheet(KEY_CONTEXT_ID, keys[position]);
  const newBalanceSheet = !keyBalanceSheet.isSuccess ? balanceSheet :
    // for each arn, add the key balance to the balance sheet
    keyBalanceSheet.data[0].reduce((p, n, x) => { 
      // if the arn balance sheet is empty, make it
      p[n] = p[n] || {}
      // add the key balance to the sheet
      p[n][keys[position].toString()] = keyBalanceSheet.data[1][x];
      return p;
    }, balanceSheet);

  return (position === keys.length - 1) ? 
    <WalletArnList keys={keys} balanceSheet={newBalanceSheet}/> :  
    <WalletBalanceSheet keys={keys} position={position+1}
      balanceSheet={newBalanceSheet}/>
}

const WalletArnList = ({arns, keys, balanceSheet, ...rest}) => {
  return <VStack spacing='2em' pb='2em'>
      {Object.keys(balanceSheet||{}).map((a) => <WalletArn key={'wallet-arn-' + a} 
        arn={a} arnBalanceSheet={balanceSheet[a]}/> 
      )}
  </VStack>
}

const WalletArn = ({arn, arnBalanceSheet, ...rest}) => {
  var asset = AssetResource.getMetadata(arn);
  var boxColor = useColorModeValue('white', 'gray.800');
  var total = ethers.utils.formatEther(
    Object.values(arnBalanceSheet||[]).reduce((p, n) =>
      p.add(n), BigNumber.from(0)))
  var assetPrice = useCoinCapPrice([asset.coinCapId]);
  var assetValue = assetPrice.isSuccess ?
    USDFormatter.format(assetPrice.data * total) : null;

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
        <VStack>
          <HStack>
            <Spacer/>
            {assetValue ? <Text>{assetValue}</Text> : <Skeleton width='4em' height='1em'/>}
          </HStack>
          <HStack>
            <Spacer/>
            <Text><font color='gray'>{total} {asset.symbol}</font></Text>
          </HStack>
        </VStack>
      </HStack>
  </Box>
}

export default Assets;
