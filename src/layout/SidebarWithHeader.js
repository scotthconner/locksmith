import React, { ReactNode } from 'react';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import {
  FaRegHandshake
} from 'react-icons/fa';
import {
  FiMenu,
  FiChevronDown,
} from 'react-icons/fi';
import { FaMoneyBill } from 'react-icons/fa';
import {
  HiOutlineKey,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import {
  BsShieldLock,
} from 'react-icons/bs';
import { IconType } from 'react-icons';
import { ReactText } from 'react';
import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import NewTrustDialog from '../NewTrustDialog';
import Locksmith from '../services/Locksmith.js';

interface LinkItemProps {
  name: string;
  icon: IconType;
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Keys', icon: HiOutlineKey},
  { name: 'Assets', icon: FaMoneyBill},
  { name: 'Trustees', icon: FaRegHandshake},
  { name: 'Events', icon: HiOutlineLightningBolt}
];

export default function SidebarWithHeader({
  children
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <ConnectKitProvider theme='auto' mode={useColorModeValue('light', 'dark')}>
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full">
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
    </ConnectKitProvider>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Locksmith 
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
       <Flex alignItems='center' mx='8'>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}
              ml='0.2em' mt='0.5em' mb='0.5em'>
              <HStack>
                  <Icon mr='0.2em' fontSize='1.4em' _groupHover={{color: 'white'}} as={BsShieldLock}/>
                  <Text fontSize="m" color={useColorModeValue("black.600", "white")}>Trusts</Text>
                <Box display={{ md: 'flex' }}>
                <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}>
              <MenuItem>Will</MenuItem>
              <MenuItem>Hunter's</MenuItem>
              <MenuItem>My non-profit</MenuItem>
              <MenuDivider />
              <MenuItem>New</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      {LinkItems.map((link) => (
        <NavItem mt='0.4em' key={link.name} icon={link.icon} fontSize='lg'>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: ReactText;
}
const NavItem = ({ icon, children, ...rest }: NavItemProps) => {
  return (
    <Link href="#" style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'blue.500',
          color: 'white',
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize='1.4em'
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}/>

      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontWeight="bold">Locksmith 
      </Text>

      <NewTrustDialog/>

      <ConnectKitButton />

      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <ColorModeSwitcher justifySelf="flex-end" />
        </Flex>
      </HStack>
    </Flex>
  );
};
