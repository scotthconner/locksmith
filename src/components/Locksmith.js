import {
  Button,
  HStack,
  Text,
  Spinner,
  VStack,
  Tag,
  TagLabel
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Locksmith from '../services/Locksmith.js';
import { usePendingHashes } from '../hooks/LocksmithHooks.js';
import { ConnectKitButton } from 'connectkit';
import { useNavigate } from 'react-router-dom';
import { useWaitForTransaction } from 'wagmi';

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

export function PendingTransactionMonitor({}) {
  const hashes = usePendingHashes();
  return hashes.isSuccess && hashes.data.length > 0 && 
    <Tag mr='1em' size='lg' colorScheme='red' borderRadius='full'>
      <Spinner size='sm' mr='1em'/>
      <TagLabel>{hashes.data.length}</TagLabel>
      { hashes.data.map((h) => <HashWatcher key={'hw-'+h} txHash={h}/>) }
    </Tag>
}

export function HashWatcher({txHash, ...rest}) {
  const watcher = useWaitForTransaction({hash: txHash});
  if (watcher.isSuccess) {
    Locksmith.removeHash(txHash);
  }
}
