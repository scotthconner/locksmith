import React, { ReactNode } from 'react';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps
} from '@chakra-ui/react';
import {Link, useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiShare2,
} from 'react-icons/fi';
import { AiOutlineWallet } from 'react-icons/ai';
import { BiCoinStack } from 'react-icons/bi';
import {
  HiOutlineKey,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import {
  BsShieldLock,
} from 'react-icons/bs';
import { RiLock2Fill } from 'react-icons/ri';
import { IconType } from 'react-icons';
import { ReactText } from 'react';
import { ColorModeSwitcher } from '../ColorModeSwitcher';
import { PendingTransactionMonitor } from '../components/Locksmith.js';
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import { useNetwork } from 'wagmi';
import { useState } from 'react';
import Locksmith from '../services/Locksmith.js';
import { AssetResource } from '../services/AssetResource.js';

interface LinkItemProps {
  name: string;
  icon: IconType;
  href: string;
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Wallets', icon: AiOutlineWallet, href: '/inbox' },
  { name: 'Trusts', icon: BsShieldLock, href: '/trusts'},
  { name: 'Keys', icon: HiOutlineKey, href: '/keys'},
  { name: 'Assets', icon: BiCoinStack, href: '/assets'},
  { name: 'Distribute', icon: FiShare2, href: '/trustees'},
  { name: 'Events', icon: HiOutlineLightningBolt, href: '/events'}
];

export default function SidebarWithHeader({
  children
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const network = useNetwork();
  const [chain, setChain] = useState(null);

  // if it looks like we've switched, reload
  // the contract addresses
  if(network.chain && network.chain.id !== chain) {
    Locksmith.setChainId(network.chain.id); 
    AssetResource.refreshMetadata(); 
    setChain(network.chain.id);
  }

  return (
    <ConnectKitProvider theme='auto' mode={useColorModeValue('light', 'dark')}>
    <Box minH="100vh" bg={useColorModeValue('gray.200', 'gray.900')}>
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
      <MobileNav onOpen={onOpen}/>
      <Box ml={{ base: 0, md: 60 }}>
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
  const navigate = useNavigate();
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
        <HStack spacing={0} onClick={() => {navigate('/');}} cursor='pointer'>
          <Text fontSize='2xl'><b>L</b></Text>
          <RiLock2Fill size='22px'/>
          <Text fontSize='2xl'><b>cksmith</b></Text>
        </HStack>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem onClick={onClose} mt='0.4em' href={link.href} key={link.name} icon={link.icon} fontSize='lg'>
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
const NavItem = ({ href, icon, children, ...rest }: NavItemProps) => {
  return (
    <Link to={href} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: useColorModeValue('gray.500','gray.700'),
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
      <HStack spacing={0} display={{base: 'flex', md: 'none'}}>
        <Text fontSize='2xl'><b>L</b></Text>
        <RiLock2Fill size='22px'/>
        <Text fontSize='2xl'><b>cksmith</b></Text>
      </HStack>
      <PendingTransactionMonitor/> 
      <ConnectKitButton />
      <HStack spacing={{ base: '0', md: '6' }}>
        <Flex alignItems={'center'}>
          <ColorModeSwitcher justifySelf="flex-end" />
        </Flex>
      </HStack>
    </Flex>
  );
};
