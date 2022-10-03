//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
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
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { useState, useRef } from 'react';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';

//////////////////////////////////////
// Function Component
//////////////////////////////////////
export function TrustArn({rootKeyId, arn, balance, ...rest}) {
  var boxColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box p='1em' width='90%' 
      borderRadius='lg'
      bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
        <HStack spacing='1em'>
          <Text><b>Asset Name</b>: {balance.toString()}</Text>
          <Text noOfLines={1} color='gray.500'><i>{arn}</i></Text>
          <Spacer/>
        </HStack>
    </Box>
  )
}
