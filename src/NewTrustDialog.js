import React, { ReactNode } from 'react';
import {
  IconButton,
  Avatar,
  Box,
  Button,
  CloseButton,
  Flex,
  Stack,
  Heading,
  FormContrl,
  Input,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  FormControl,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { IoIosAdd } from 'react-icons/io';
import {
  BsShieldLock,
} from 'react-icons/bs';
import {
  HiOutlineKey,
} from 'react-icons/hi';
import { IconType } from 'react-icons';
import { ReactText } from 'react';
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";
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
    <Button isDisabled={!isConnected} leftIcon={<IoIosAdd/>} colorScheme='blue' variant='ghost' onClick={onOpen}>
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
          <Button
              leftIcon={<HiOutlineKey/>}
              bg={'blue.400'}
              color={'white'}
              _hover={{
                bg: 'blue.500',
              }}>
              Mint Root Key
            </Button>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
}
