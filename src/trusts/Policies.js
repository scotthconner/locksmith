import {
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  HStack,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalContent,
  Select,
  Skeleton,
  Spacer,
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
  VStack,
  useDisclosure,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';

// icons
import { KeyInfoIcon } from '../components/KeyInfo.js';
import { AiOutlineUser } from 'react-icons/ai';
import { BiCheckCircle } from 'react-icons/bi';
import { HiOutlineLightningBolt } from 'react-icons/hi';
import { FiPower } from 'react-icons/fi';
import { FcCheckmark } from 'react-icons/fc';
import { IoIosHourglass } from 'react-icons/io';
import Locksmith from '../services/Locksmith.js';

// Hooks
import { 
  useInspectKey,
  useKeyHolders,
} from '../hooks/LocksmithHooks.js';
import { usePolicy } from '../hooks/TrusteeHooks.js';

export function TrustPolicy({trustId, keyId, ...rest}) {
	var boxColor = useColorModeValue('white', 'gray.800');
	const key = useInspectKey(keyId);
    const policy = usePolicy(keyId);
    const keyHolders = useKeyHolders(keyId);

    return  <Box p='1em' width='90%' 
      borderRadius='lg' bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
	  <HStack spacing='1em'>
        { !key.isSuccess && policy.isSuccess && <Skeleton width='2em' height='2em'/> }
        { key.isSuccess && policy.isSuccess && KeyInfoIcon(key, 30) }
        { !key.isSuccess && <Skeleton width='5em' height='1em'/> }
        { !key.isSuccess && <Skeleton width='8em' height='1em'/> }
        { key.isSuccess && <b>{key.data.alias}</b> }
        { policy.isSuccess && policy.data[0] &&
          <Tag size='sm' variant='subtle' colorScheme='green'>
            <TagLeftIcon boxSize='12px' as={FcCheckmark} />
            <TagLabel>Activated</TagLabel>
          </Tag> }
        { policy.isSuccess && !policy.data[0] &&
          <Tag size='sm' variant='subtle' colorScheme='gray'>
            <TagLeftIcon boxSize='12px' as={IoIosHourglass} />
            <TagLabel>Waiting</TagLabel>
          </Tag> }
        <Spacer/>
        { !policy.isSuccess && <Skeleton width='2.2em' height='1.3em'/> }
        { policy.isSuccess && 
          <Button size='sm' leftIcon={<AiOutlineUser/>}>
            {policy.data[1].length}</Button>}
        { !policy.isSuccess && <Skeleton width='2.2em' height='1.3em'/> }
        { policy.isSuccess && 
          <Button size='sm' leftIcon={<HiOutlineLightningBolt/>}>
            {policy.data[2].length}</Button>}
        
      </HStack>
    </Box>
}
