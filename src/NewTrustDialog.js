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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalContent
} from '@chakra-ui/react';
import { useState } from 'react';
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const [input, setInput] = useState('');
  const handleInputChange = (e) => setInput(e.target.value);
  const isError = input.trim().length === 0;
  const writeConfig = useCreateTrustAndRootKey(input);

  const onSubmit = () => {
    writeConfig.write?.();
  }

  return (
    <>
    <Button isDisabled={!isConnected} leftIcon={<IoIosAdd/>} colorScheme='gray' variant='ghost' onClick={onOpen}>
      New Trust
    </Button>
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Trust</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
          <Text
            fontSize={{ base: 'sm', sm: 'md' }}
            color={useColorModeValue('gray.800', 'gray.400')}>
            Name your trust, and mint the root key into your wallet. 
          </Text>
          <FormControl id="trustName" isInvalid={isError}>
            <FormLabel>Trust Name</FormLabel>
            <Input
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
              isDisabled={isError}>
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
