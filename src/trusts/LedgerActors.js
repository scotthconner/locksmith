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
import {
  BsTrash
} from 'react-icons/bs';
import { useState, useRef } from 'react';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import {
  useKeyBalance
} from '../hooks/LocksmithHooks.js';
import { 
  useTrustedActorAlias,
  useSetTrustedLedgerRole,
} from '../hooks/NotaryHooks.js';

//////////////////////////////////////
// Function Component
//////////////////////////////////////
export function TrustedLedgerActors({trustId, rootKeyId, role, actor, roleIcon, ...rest}) {
  var account = useAccount();
  var userKeyBalance = useKeyBalance(rootKeyId, account.address);
  var actorAlias = useTrustedActorAlias(trustId, role, actor);
  var toast = useToast();
  var hasRoot = userKeyBalance.isSuccess && userKeyBalance.data > 0 ? true : false; 
  var boxColor = useColorModeValue('white', 'gray.800');
  var untrust = useSetTrustedLedgerRole(hasRoot ? rootKeyId : null, trustId, role, actor, false, '', 
    function(error) {
      toast({
        title: 'Transaction Error!',
        description: error.toString(),
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    },
    function(data) {
      toast({
        title: 'Actor untrusted!',
        description: 'They can no longer act on your ledger.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    }
  );

  // its either loading, fine, or disabled.
  var buttonProps = untrust.isLoading ? {isLoading: true} :
    (hasRoot ? {} : {isDisabled: true});

  return (
    <Box p='1em' width='90%' 
      borderRadius='lg'
      bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
        <HStack spacing='1em'>
          {roleIcon} 
          <VStack align='stretch'>
            {!actorAlias.isSuccess ? <Skeleton width='7.5em' height='1.1em'/> :
            <Text><b>{actorAlias.data}</b></Text>}
            <Text noOfLines={1} color='gray.500'><i>{actor}</i></Text>
          </VStack>
          <Spacer/>
          <Button {... buttonProps} 
            leftIcon={<BsTrash/>}
            onClick={() => {untrust.write?.();}}>Untrust</Button>
        </HStack>
    </Box>
  )
}

export function AddTrustedLedgerActorModal({trustId, rootKeyId, role, isOpen, onClose, 
  modalTitle, roleName, roleIcon, children, ...rest}) {
  const initialRef = useRef(null);
  const toast = useToast();
  const [alias, setAlias] = useState('');
  const [address, setAddress] = useState('');
  var isInvalidAlias   = alias.length < 3;
  var isInvalidAddress = !ethers.utils.isAddress(address);

  var entrust = useSetTrustedLedgerRole(rootKeyId, trustId, role, address, true, alias,
    function(error) {
      toast({
        title: 'Transaction Error!',
        description: error.toString(),
        status: 'error',
        duration: 9000,
        isClosable: true
      });
    },
    function(data) {
      toast({
        title: alias + ' entrusted!',
        description: 'They can now act on your ledger accordingly.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      setAlias('');
      onClose();
    }
  );

  var handleAliasChange = function(e) {
    if (e.target.value.length < 32) {
      setAlias(e.target.value);
    }
  }

  var handleAddressChange = function(e) {
    setAddress(e.target.value);
  }

  var buttonProps = entrust.isLoading ? {isLoading: true} : 
    (isInvalidAlias || isInvalidAddress ? {isDisabled: true} : {}); 

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered initialFocusRef={initialRef} size='xl'>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {children}
          <FormControl id='actor_alias' isInvalid={isInvalidAlias} mt='1.5em'>
            <FormLabel>Actor Alias</FormLabel>
            <Input
              value={alias}
              ref={initialRef}
              placeholder="Aave Staking Platform"
              _placeholder={{ color: 'gray.500' }}
              onChange={handleAliasChange}/>
            { isInvalidAlias ?
              <FormErrorMessage>Alias must be at least three characters.</FormErrorMessage> :
              <FormHelperText>Make it easy to recognize your trusted actor.</FormHelperText>
            }
          </FormControl>
          <FormControl id='contract_address' isInvalid={isInvalidAddress} mt='1.5em'>
            <FormLabel>Contract Address</FormLabel>
            <Input
              placeholder="0xfd471836031dc5108809d173a067e8486b9047a3"
              _placeholder={{ color: 'gray.500' }}
              onChange={handleAddressChange}/>
            { isInvalidAddress ?
              <FormErrorMessage>This doesn't seem like a valid address.</FormErrorMessage> :
              <FormHelperText>Trust ledger activity from this address..</FormHelperText>
            }
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => { entrust.write?.(); }} 
            {... buttonProps}
            leftIcon={roleIcon} ml='1.5em' 
            colorScheme='blue'>Entrust {roleName}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>)
}
