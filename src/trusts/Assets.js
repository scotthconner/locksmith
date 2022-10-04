//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  Collapse,
  HStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  Skeleton,
  Spacer,
  Text,
  VStack,
  useDisclosure,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { RiSafeLine } from 'react-icons/ri';
import { useState, useRef } from 'react';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { AssetResource } from '../services/AssetResource.js';
import { 
  useCoinCapPrice,
  USDFormatter,
} from '../hooks/PriceHooks.js';

//////////////////////////////////////
// Function Component
//////////////////////////////////////
export function TrustArn({rootKeyId, arn, balance, ...rest}) {
  var asset = AssetResource.getMetadata(arn);
  var assetPrice = useCoinCapPrice(asset.coinCapId);
  var assetValue = assetPrice.isSuccess ?
    USDFormatter.format(assetPrice.data * ethers.utils.formatEther(balance)) : null;
  var boxColor = useColorModeValue('white', 'gray.800');
  var providerDisclosure = useDisclosure();

  return (
    <Box p='1em' width='90%' 
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
          <VStack align='stretch' spacing='0em'> 
            <HStack>
              <Spacer/>
              {assetValue ? <Text>{assetValue}</Text> : <Skeleton width='4em' height='1em'/>}
            </HStack>
            <HStack spacing='0em'>
              <Spacer/>
              <Button onClick={providerDisclosure.onToggle} size='sm' variant='ghost' borderRadius='full' p={0}>
                <RiSafeLine/>
              </Button>
              <Text><font color='gray'>{ethers.utils.formatEther(balance)} {asset.symbol}</font></Text>
            </HStack>
          </VStack>
        </HStack>
        <HStack>
          <Collapse in={providerDisclosure.isOpen} width='100%'>
            Here are your providers
          </Collapse>
        </HStack>
    </Box>
  )
}
