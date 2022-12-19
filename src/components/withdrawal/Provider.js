//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spacer,
  Text,
  useToast,
} from '@chakra-ui/react';
import { RiHandCoinLine } from 'react-icons/ri';
import { BiCoinStack } from 'react-icons/bi';
import { useState } from 'react';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers, BigNumber } from 'ethers';
import Locksmith from '../../services/Locksmith.js';
import { AssetResource } from '../../services/AssetResource.js';
import { useEtherWithdrawal } from '../../hooks/EtherVaultHooks.js';
import { useTokenWithdrawal } from '../../hooks/TokenVaultHooks.js';

export function CollateralProviderWithdrawalAdapter({provider, keyId, arn, allowance, balance, onClose, ...rest}) {
  if (provider === Locksmith.getContractAddress('EtherVault')) {
    return <VaultWithdrawal keyId={keyId} arn={arn} allowance={allowance} balance={balance} onClose={onClose}/>
  } else if (provider === Locksmith.getContractAddress('TokenVault')) {
    return <TokenWithdrawal keyId={keyId} arn={arn} allowance={allowance} balance={balance} onClose={onClose}/> 
  } else {
    return <Text>It doesn't look like withdrawaling from this provider is supported yet.</Text> 
  }
}

const VaultWithdrawal = ({keyId, arn, allowance, balance, onClose, ...rest}) => {
  const asset = AssetResource.getMetadata(arn);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const cleanWithdrawal = allowance.div(BigNumber.from(100)).mul(withdrawalAmount);

  const toast = useToast();
  const withdrawalConfig = useEtherWithdrawal(keyId, cleanWithdrawal,
    function(error) {
      // error
      toast({
        title: 'Transaction Error!',
        description: error.toString(),
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    }, function(data) {
      Locksmith.watchHash(data.hash); 
      // success
      toast({
        title: 'Withdrawal complete!',
        description: ethers.utils.formatEther(cleanWithdrawal) + ' ' + asset.symbol + ' was sent to your wallet.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      onClose();
    });

  if(allowance.toString() === '0') { 
    return <Text textAlign='center' color='gray'><i>You need to set an allowance before you can withdrawal.</i></Text>
  }

  var withdrawalButtonProps = withdrawalConfig.isLoading ? {isLoading: true} : {};

  return <HStack spacing='1em'>
    <Box width='55%'>
      <Slider width='90%' m='1em' mt='2em' defaultValue={0} min={0}
        max={100} step={1}
        onChangeEnd={(e) => setWithdrawalAmount(e)}>
        <SliderTrack bg='yellow.400'>
          <Box position='relative' right={10} />
          <SliderFilledTrack bg='yellow.600'/>
        </SliderTrack>
        <SliderThumb boxSize={10}>
          <Box color='yellow.600'><BiCoinStack size='30px'/></Box>
        </SliderThumb>
      </Slider>
    </Box>
    <Text fontSize='lg' fontWeight='bold'>
      {parseFloat(ethers.utils.formatEther(cleanWithdrawal)).toFixed(2)}&nbsp;/&nbsp;{parseFloat(ethers.utils.formatEther(allowance)).toFixed(2)}
    </Text>
    <Spacer/>
    <Button {...withdrawalButtonProps} 
      leftIcon={<RiHandCoinLine/>} colorScheme='yellow'
      onClick={() => {withdrawalConfig.write?.()}}>Withdrawal</Button>
  </HStack>
}

const TokenWithdrawal = ({keyId, arn, allowance, balance, onClose, ...rest}) => {
  const asset = AssetResource.getMetadata(arn);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const cleanWithdrawal = allowance.div(BigNumber.from(100)).mul(withdrawalAmount);

  const toast = useToast();
  const withdrawalConfig = useTokenWithdrawal(keyId, arn, cleanWithdrawal,
    function(error) {
      // error
      toast({
        title: 'Transaction Error!',
        description: error.toString(),
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    }, function(data) {
      Locksmith.watchHash(data.hash); 
      // success
      toast({
        title: 'Withdrawal complete!',
        description: ethers.utils.formatEther(cleanWithdrawal) + ' ' + asset.symbol + ' was sent to your wallet.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      onClose();
    });

  if(allowance.toString() === '0') {
    return <Text textAlign='center' color='gray'><i>You need to set an allowance before you can withdrawal.</i></Text>
  }

  var withdrawalButtonProps = withdrawalConfig.isLoading ? {isLoading: true} : {};

  return <HStack spacing='1em'>
    <Box width='55%'>
      <Slider width='90%' m='1em' mt='2em' defaultValue={0} min={0}
        max={100} step={1}
        onChangeEnd={(e) => setWithdrawalAmount(e)}>
        <SliderTrack bg='yellow.400'>
          <Box position='relative' right={10} />
          <SliderFilledTrack bg='yellow.600'/>
        </SliderTrack>
        <SliderThumb boxSize={10}>
          <Box color='yellow.600'><BiCoinStack size='30px'/></Box>
        </SliderThumb>
      </Slider>
    </Box>
    <Text fontSize='lg' fontWeight='bold'>
      {parseFloat(ethers.utils.formatUnits(cleanWithdrawal, asset.decimals)).toFixed(2)}&nbsp;/&nbsp;{parseFloat(ethers.utils.formatUnits(allowance, asset.decimals)).toFixed(2)}
    </Text>
    <Spacer/>
    <Button {...withdrawalButtonProps}
      leftIcon={<RiHandCoinLine/>} colorScheme='yellow'
      onClick={() => {withdrawalConfig.write?.()}}>Withdrawal</Button>
  </HStack>
}
