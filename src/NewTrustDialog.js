import React, { ReactNode } from 'react';
import {
  Button,
  Input,
  VStack,
  useColorModeValue,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalContent,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { IoIosAdd } from 'react-icons/io';
import {
  HiOutlineKey,
} from 'react-icons/hi';
import { useAccount } from 'wagmi'
import {
  useCreateTrustAndRootKey
} from './hooks/LocksmithHooks.js';

export default function NewTrustDialog({
  children,
}: {
  children: ReactNode;
}) {
  const initialRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isConnected } = useAccount();
  const [input, setInput] = useState('');
  const handleInputChange = (e) => setInput(e.target.value);
  const isError = input.trim().length === 0;
  const toast = useToast();
  const writeConfig = useCreateTrustAndRootKey(input, function(error) {
    // error
    toast({
      title: 'Transaction Error!',
      description: error.toString(), 
      status: 'error',
      duration: 9000,
      isClosable: true
    });
  }, function(data) {
    // success
    toast({
      title: 'Trust Created!',
      description: 'The root key is now in your wallet.',
      status: 'success',
      duration: 9000,
      isClosable: true
    });
    setInput('');
    onClose();
  });

  var buttonProps = writeConfig.isLoading ? {isLoading: true} : {};

  const onSubmit = () => {
    writeConfig.write?.();
  }

  const onModalClose = () => {
    setInput('');
    onClose();
  }

  return (
    <>
    <Button isDisabled={!isConnected} leftIcon={<IoIosAdd/>} colorScheme='gray' variant='ghost' onClick={onOpen}>
      New Trust
    </Button>
    <Modal onClose={onModalClose} isOpen={isOpen} isCentered initialFocusRef={initialRef}>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>Create New Trust</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
          <Text
            mb='1.5em'
            color={useColorModeValue('gray.800', 'gray.400')}>
            Name your trust, and mint the root key into your wallet. 
          </Text>
          <FormControl id="trustName" isInvalid={isError}>
            <FormLabel>Trust Name</FormLabel>
            <Input
              ref={initialRef}
              placeholder="My Living Trust"
              _placeholder={{ color: 'gray.500' }}
              onChange={handleInputChange}
            />
            { isError ?
              <FormErrorMessage>Trust name can't be empty</FormErrorMessage> :
              <FormHelperText>Name your trust and mint the root key into your wallet.</FormHelperText>
            }
          </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button
              leftIcon={<HiOutlineKey/>}
              bg='yellow.400'
              color={'black'}
              _hover={{
                bg: 'yellow.300', 
              }}
              onClick={onSubmit}
              loadingText='Signing'
              isDisabled={isError}
              {...buttonProps}>
              Mint Root Key
            </Button>
            <Button onClick={onClose}>Close</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
}
