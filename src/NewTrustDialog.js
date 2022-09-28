import React, { ReactNode } from 'react';
import {
  Button,
  Input,
  VStack,
  useColorModeValue,
  FormControl,
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
import { IoIosAdd } from 'react-icons/io';
import {
  HiOutlineKey,
} from 'react-icons/hi';
import { useAccount } from 'wagmi'

export default function NewTrustDialog({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();

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
          <FormControl id="trustName">
            <Input
              placeholder="My Living Trust"
              _placeholder={{ color: 'gray.500' }}
            />
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
              }}>
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
