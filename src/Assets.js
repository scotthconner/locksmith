//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  Center,
  Collapse,
  Heading,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Skeleton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Stack,
  Spacer,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ConnectWalletPrompt } from './components/Locksmith.js';
import { useState } from 'react';
import { BiCoinStack } from 'react-icons/bi';
import { BsShieldLock } from 'react-icons/bs';
import { FiUnlock } from 'react-icons/fi';
import { RiHandCoinLine, RiSafeLine } from 'react-icons/ri';
import { KeyInfoIcon } from './components/KeyInfo.js';
import { CollateralProviderWithdrawalAdapter } from './components/withdrawal/Provider.js';
import Locksmith from './services/Locksmith.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { useAccount } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import { AssetResource } from './services/AssetResource.js';
import {
  useWalletKeys,
  useInspectKey,
  useTrustInfo,
} from './hooks/LocksmithHooks.js';
import {
  KEY_CONTEXT_ID,
  useContextBalanceSheet,
  useContextArnAllocations,
} from './hooks/LedgerHooks.js';
import {
  COLLATERAL_PROVIDER,
  useTrustedActorAlias,
  useWithdrawalAllowance,
  useSetWithdrawalAllowance,
} from './hooks/NotaryHooks.js';
import {
  useCoinCapPrice,
  USDFormatter,
} from './hooks/PriceHooks.js';

function Assets() {
  const {isConnected} = useAccount();
  const keys = useWalletKeys();
  const navigate = useNavigate();
  return !isConnected ? <ConnectWalletPrompt/> : (
    <Stack m='1em' spacing='3em'>
      <Heading size='md'>Your Withdrawalable Assets</Heading>
        { !keys.isSuccess && 
          <VStack spacing='2em' mt='2em'>
            <Skeleton width='100%' height='4em'/>
            <Skeleton width='100%' height='4em'/>
            <Skeleton width='100%' height='4em'/>
            <Skeleton width='100%' height='4em'/>
          </VStack> }
        { keys.isSuccess && keys.data.length < 1 && <VStack spacing='1em'>
          <Text fontSize='30px'>You have no keys, and thus - no assets.</Text>
          <Text fontSize='30px' pb='1em'>Create a trust to deposit funds.</Text>
          <Button colorScheme='blue' onClick={() => {navigate('/wizard');}}>Design Trust</Button>
        </VStack> }
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
  return <VStack spacing='1em' pb='2em'>
      {Object.keys(balanceSheet).length < 1 && 
        <Text fontSize='30px'>You have no withdrawalable assets at this time.</Text>
      }
      {Object.keys(balanceSheet||{}).map((a) => <WalletArn key={'wallet-arn-' + a} 
        arn={a} arnBalanceSheet={balanceSheet[a]} keys={keys}/> 
      )}
  </VStack>
}

const WalletArn = ({arn, arnBalanceSheet, keys, ...rest}) => {
  const asset = AssetResource.getMetadata(arn);
  const boxColor = useColorModeValue('white', 'gray.800');
  const total = ethers.utils.formatEther(
    Object.values(arnBalanceSheet||[]).reduce((p, n) =>
      p.add(n), BigNumber.from(0)))
  const assetPrice = useCoinCapPrice([asset.coinCapId]);
  const assetValue = assetPrice.isSuccess ?
    USDFormatter.format(assetPrice.data * total) : null;
  const withdrawalDisclosure = useDisclosure();

  return <Box p='1em' width='90%'
    borderRadius='lg'
    bg={boxColor} boxShadow='dark-lg'
    _hover= {{
      transform: 'scale(1.1)',
    }}
    transition='all 0.2s ease-in-out'>
      <HStack spacing='1em' cursor='pointer' onClick={withdrawalDisclosure.onToggle}>
        {asset.icon()}
        <Text><b>{asset.name}</b>&nbsp;
          <font color='gray'>({asset.symbol})</font>
        </Text>
        <Spacer/>
        <VStack align='stretch'>
          <HStack> 
            <Spacer/>
            {assetValue ? <Text>{assetValue}</Text> : <Skeleton width='4em' height='1em'/>}
          </HStack>
          <HStack>
            <Spacer/>
            <Button onClick={withdrawalDisclosure.onToggle} 
              size='sm' variant='ghost' borderRadius='full' p={0}>
                <RiHandCoinLine size={20}/>
              </Button>
            <Text><font color='gray'>{total} {asset.symbol}</font></Text>
          </HStack>
        </VStack>
      </HStack>
      <Collapse in={withdrawalDisclosure.isOpen}>
        <Wrap width='100%' spacing='1em' padding='1em'>
          <WithdrawalOpportunities keys={keys} arn={arn}/>
        </Wrap>
      </Collapse>
  </Box>
}

const WithdrawalOpportunities = ({arn, keys, ...rest}) => {
  return (<>
    {keys.map((k) => <KeyWithdrawalOpportunities key={arn + '-' + k}
      keyId={k} arn={arn}/>)}</>)
}

const KeyWithdrawalOpportunities = ({arn, keyId, ...rest}) => {
  const keyArnAllocations = useContextArnAllocations(KEY_CONTEXT_ID, keyId, arn);
  return keyArnAllocations.isSuccess && 
    keyArnAllocations.data[0].map((p, b) =>
      <KeyWithdrawalSlot arn={arn} keyId={keyId} provider={p}
        balance={keyArnAllocations.data[1][b]}
        key={'withdrawal-op' + arn + keyId + p}/>) 
}

const KeyWithdrawalSlot = ({arn, keyId, provider, balance, ...rest}) => {
  const asset = AssetResource.getMetadata(arn);
  const keyInfo = useInspectKey(keyId); 
  const trustInfo = useTrustInfo(keyInfo.isSuccess ? keyInfo.data.trustId : null); 
  const alias = useTrustedActorAlias(keyInfo.isSuccess ? keyInfo.data.trustId : null,
    COLLATERAL_PROVIDER, provider);
  const allowance = useWithdrawalAllowance(provider, keyId, arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const boxColor = useColorModeValue('gray.100', 'gray.700');
  const ethAmount = ethers.utils.formatEther(balance);
  const withdrawalDisclosure = useDisclosure();

  return <WrapItem key={'key-withdrawal-slot' + arn + keyId + provider}
    _hover= {{
      transform: 'scale(1.1)',
    }}
    cursor='pointer'
    bg={boxColor} padding='1em'
    borderRadius='2xl' boxShadow='lg'
    onClick={withdrawalDisclosure.onOpen}>
    <VStack align='left'>
      <Center>
        <VStack mt='1em' mb='1em' spacing='0.1em'>
          {!assetPrice.isSuccess ? 
            <Skeleton width='4em' height='1em'/> :
            <Text><b>{USDFormatter.format(assetPrice.data * ethAmount)}</b></Text> } 
          <HStack fontStyle='italic' color='gray' fontSize='sm'>
            {!allowance.isSuccess ? <Skeleton width='2em' height='1em'/> :
              <Text>{ethers.utils.formatEther(allowance.data)}</Text>}
            <Text> / {ethAmount} {asset.symbol}</Text>
          </HStack>
        </VStack>
      </Center>
      <HStack>
        <BsShieldLock/>
        {!(keyInfo.isSuccess && trustInfo.isSuccess) ?
          <Skeleton width='5em' height='1em'/> :
          <Text>{trustInfo.data.name}</Text>}
      </HStack>
      <HStack>
        <RiSafeLine/>
        {!(keyInfo.isSuccess && alias.isSuccess) ?
          <Skeleton width='6em' height='1em'/> :
          <Text>{alias.data.toString()}</Text>}
      </HStack>
      <HStack>
        {!keyInfo.isSuccess ? 
          <Skeleton width='4em' height='1em'/> : <>
            {KeyInfoIcon(keyInfo)} 
            <Text>{keyInfo.data.alias}</Text>
          </>}
      </HStack>
    </VStack>
    {allowance.isSuccess &&  
      <SlotWithdrawalDialog provider={provider} keyId={keyId}
        arn={arn} onClose={withdrawalDisclosure.onClose}
        isOpen={withdrawalDisclosure.isOpen}
        allowance={allowance.data}
        balance={balance}/>}
  </WrapItem>
}

const SlotWithdrawalDialog = ({provider, keyId, arn, allowance, balance, onClose, isOpen, ...rest}) => {
  const toast = useToast();
  const asset = AssetResource.getMetadata(arn);
  const [slideAllowance, setAllowance]  = useState(allowance.gt(balance) ? 100 : allowance.mul(BigNumber.from(100)).div(balance)); 
  const cleanAllowance = balance.div(BigNumber.from(100)).mul(slideAllowance);
  const allowanceConfig = useSetWithdrawalAllowance(provider, keyId, arn, cleanAllowance,
    function(error) {
      // error
      toast({
        title: 'Transaction Error!',
        description: error.toString(),
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    },function(data) {
      Locksmith.watchHash(data.hash);
      // success
      toast({
        title: 'Allowance Set!',
        description: 'The provider can withdrawal ' + ethers.utils.formatUnits(cleanAllowance, asset.decimals) + ' ' + asset.symbol + '.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    });

  var allowButtonProps = allowanceConfig.isLoading ? {isLoading: true} : {};

  return <Modal onClose={onClose} isOpen={isOpen} isCentered size='xl'>
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>Withdrawal {asset.symbol}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>You'll need to set the <b>withdrawal allowance</b> to enable the collateral provider 
          to withdrawal funds on your behalf. This is for your security.</Text>
        <HStack spacing='1em'>
          <Box width='55%'>
            <Slider width='90%' m='1em' mt='2em' defaultValue={slideAllowance} min={0}
              max={100} step={1}
              onChangeEnd={(e) => setAllowance(e)}>
              <SliderTrack bg='blue.200'>
                <Box position='relative' right={10} />
                <SliderFilledTrack bg='blue.600'/>
              </SliderTrack>
              <SliderThumb boxSize={10}>
                <Box color='blue'><BiCoinStack size='30px'/></Box>
              </SliderThumb>
            </Slider>
          </Box>
          <Text fontSize='lg' fontWeight='bold'>
            {parseFloat(ethers.utils.formatUnits(cleanAllowance, asset.decimals)).toFixed(2)}&nbsp;/&nbsp;{parseFloat(ethers.utils.formatUnits(balance, asset.decimals)).toFixed(2)}
          </Text>
          <Spacer/>
          <Button {... allowButtonProps} onClick={() => {allowanceConfig.write?.()}} 
            leftIcon={<FiUnlock/>} colorScheme='blue'>Allow</Button>
        </HStack>
        <CollateralProviderWithdrawalAdapter provider={provider}
          keyId={keyId} arn={arn} allowance={allowance} balance={balance}
          onClose={onClose}/>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </ModalContent>
  </Modal>
}
export default Assets;
