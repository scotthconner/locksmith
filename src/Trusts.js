//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  useParams
} from 'react-router-dom';
import {
  BoxProps,
  Button,
  Center,
  Heading,
  HStack,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  ModalFooter,
  Skeleton,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { AiOutlineUser } from 'react-icons/ai';
import { HiOutlineKey } from 'react-icons/hi';
import { GiBossKey } from 'react-icons/gi';
//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { 
  useTrustInfo, 
  useTrustKeys,
  useKeyInfo,
  useKeyInventory,
  useKeyHolders,
  useKeyBalance,
} from './hooks/LocksmithHooks.js';
import {
  useAccount
} from 'wagmi';

//////////////////////////////////////
// Trustees Function Component
//////////////////////////////////////
interface KeyProps extends BoxProps {
  keyId: BigNumber
}

export function Trusts() {
  return (
    <>
      Trusts! 
    </>
  );
}

export function Trust() {
  let { id } = useParams();
  let trustInfo = useTrustInfo(id);
  let trustKeys = useTrustKeys(trustInfo.isSuccess ? trustInfo.data.trustId : null);

  return (<>
    {!trustInfo.isSuccess ? (
      <HStack>
        <Skeleton width='3em' height='3m'/>
        <VStack>
          <Skeleton height='3em' width='20em'/>
          <Skeleton mt='1.5em' height='1.5em' width='30em'/>
        </VStack>
      </HStack>
    ): (<>
      <Heading>{trustInfo.data.trustKeyCount < 1 ? 'Invalid Trust' : trustInfo.data.name}</Heading>
      <Text mt='1.5em' fontSize='lg'>This trust has <b>{trustInfo.data.trustKeyCount.toString()}</b> keys.</Text>
      <Wrap padding='3em' spacing='2em' pb='6em'>
        { (!trustKeys.isSuccess || trustInfo.data.trustKeyCount < 1) ? (<></>) : 
          trustKeys.data.map((k) => (
            <TrustKey rootKeyId={trustInfo.data.rootKeyId} key={k} keyId={k}/>
          ))
        }
      </Wrap>
    </>)} 
  </>)
}

const TrustKey = ({keyId, rootKeyId, ...rest}: KeyProps) => {
  var account = useAccount();
  var keyInfo = useKeyInfo(keyId);
  var keyInventory = useKeyInventory(keyId);
  var userKeyBalance = useKeyBalance(rootKeyId, account.address);
  var keyHolders = useKeyHolders(keyId);
  var {isOpen, onOpen, onClose} = useDisclosure();
  var boxColor = useColorModeValue('white', 'gray.800');
  var userHasRoot = false;

  return (
    <WrapItem key={keyId} p='1em' w='10em' h='9em'
      border={keyInfo.isSuccess && keyInfo.data.isRoot ? '2px' : '0px'}
      borderColor={keyInfo.isSuccess && keyInfo.data.isRoot ? 'yellow.400' : 'white'}
      borderRadius='lg'
      bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
        <VStack spacing='1em'>
          { !keyInfo.isSuccess ?
                <VStack>    
                  <Skeleton width='4.5em' height='1.1em'/>
                  <Skeleton width='2.2em' height='0.8em'/>
                </VStack>
            : 
          <VStack>
            <Text><b>{keyInfo.data.alias}</b></Text>
            <Text fontSize='sm'><i>id: {keyInfo.data.keyId.toString()}</i></Text> 
          </VStack> }
          <HStack spacing='1.5em'>
            <HStack>
              {!keyInventory.isSuccess || !keyInfo.isSuccess ? 
              <Skeleton width='2.2em' height='1.3em'/> : 
              <Button {... !(userKeyBalance.isSuccess && userKeyBalance.data > 0)? {isDisabled: true} : {}}
              size='sm' leftIcon={keyInfo.data.isRoot ? <GiBossKey/> : <HiOutlineKey/>}>{keyInventory.data.total}</Button>}
            </HStack>
            <HStack>
              {!keyHolders.isSuccess ? 
              <Skeleton width='2.2em' height='1.3em'/> : 
              <Button size='sm' leftIcon={<AiOutlineUser/>}>{keyHolders.data.length}</Button>}
            </HStack>
          </HStack> }
        </VStack>
    </WrapItem>
  )
}

const KeyHolderDialog = ({keyId, onClose, isOpen, onOpen, ...rest}: KeyProps) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size='full'>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>Key Holders</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant='striped' colorScheme='gray'>
              <Thead>
                <Tr>
                  <Th>Address</Th>
                  <Th>Balance</Th>
                  <Th>Soulbound</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
            </Table>
          </TableContainer>
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
