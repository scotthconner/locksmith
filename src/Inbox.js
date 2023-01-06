import {
  Box,
  Button,
  Collapse,
  HStack,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  Text,
  Skeleton,
  Spacer,
  Spinner,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { QRCode } from 'react-qrcode-logo';
import { 
  AiOutlineWarning,
  AiOutlineQuestion
} from 'react-icons/ai';
import { 
  FiCopy, 
  FiSend 
} from 'react-icons/fi';
import { BiGhost } from 'react-icons/bi';
import { ImQrcode } from 'react-icons/im';
import { BsShieldLock } from 'react-icons/bs';
import { RiSafeLine } from 'react-icons/ri';
import { useAccount } from 'wagmi';
import { useParams } from 'react-router-dom';
import { AssetResource } from './services/AssetResource.js';

// Raw Hooks
import { ethers } from 'ethers';
import { useKeyInboxAddress } from './hooks/PostOfficeHooks.js';
import { 
  KEY_CONTEXT_ID,
  useContextBalanceSheet,
  useContextProviderRegistry,
  useContextArnBalances,
} from './hooks/LedgerHooks.js';
import { 
  useKeyBalance,
  useInspectKey,
  useKeyHolders,
  useSoulboundKeyAmounts,
  useTrustInfo,
} from './hooks/LocksmithHooks.js';
import {
  useInboxTransactionCount,
} from './hooks/VirtualKeyAddressHooks.js';
import {
  useTrustedActorAlias,
  COLLATERAL_PROVIDER,
} from './hooks/NotaryHooks.js';
import {
  useCoinCapPrice,
  USDFormatter,
} from './hooks/PriceHooks.js';

// Components
import { ContextBalanceUSD } from './components/Trust.js';
import { KeyIcon } from './components/KeyInfo.js';
import { DisplayAddress } from './components/Address.js';

export function Inbox({...rest}) {
  const { keyId } = useParams();
  const account = useAccount();
  
  // does the user hold the key?
  const userKeyBalance = useKeyBalance(keyId, account.address);
   
  // where is the inbox for this key?
  const inboxAddress = useKeyInboxAddress(keyId); 
  
  // get the profile of the key itself
  const keyInfo = useInspectKey(keyId);

  return <VStack mb='1em'>{ 
    !inboxAddress.isSuccess || !userKeyBalance.isSuccess || !keyInfo.isSuccess ? 
      <VStack p='5em'><Spinner thickness='4px' speed='0.65s' emptyColor='gray.200' color='blue.500' size='xl'/></VStack> : 
    ( userKeyBalance.data.gt(0) ? <VirtualKeyInbox keyId={keyId} keyInfo={keyInfo.data} address={inboxAddress.data}/> :
      <Text p='2em' fontSize='3xl'>Nothing here for you.</Text> )}
  </VStack>
}

const VirtualKeyInbox = ({keyId, keyInfo, address, ...rest}) => {
  return <>
    <InboxHeader keyId={keyId} keyInfo={keyInfo} address={address}/>
    <InboxAssetBalance keyId={keyId} keyInfo={keyInfo} address={address}/>
    <InboxAssetList keyId={keyId} keyInfo={keyInfo} address={address}/>
  </>
}

const InboxHeader= ({keyId, keyInfo, address, ...rest}) => {
  const toast = useToast();
  const boxColor = useColorModeValue('white', 'gray.800');
  const qrModal = useDisclosure();

  // is the inbox safely soulbound?
  // note: not having the inbox key soulbound means
  //       the key holder could flush the NFT out with
  //       a multi-call and gain dual possession outside
  //       the designs of the trust owner.
  const soulboundAmount = useSoulboundKeyAmounts(keyId, address);
  const inboxKeyBalance = useKeyBalance(keyId, address);

  return <VStack width='100%'>
    <Box bg={boxColor} borderRadius='lg' boxShadow='md' p='1em' mt='1em' width='90%'>
      <VStack spacing='1em'> 
        <TrustLabel trustId={keyInfo.trustId}/>
        <HStack>
          <KeyIcon keyId={keyId} size='40px'/>
          <Text fontSize='3xl'>{keyInfo.alias}</Text>
        </HStack>
        { (!soulboundAmount.isSuccess || !inboxKeyBalance.isSuccess) ?  
          <Skeleton width='10em' height='1em' borderRadius='full'/> :
        ( inboxKeyBalance.data.lt(1) ?
          <Tag size='md' colorScheme='red' borderRadius='full'>
            <TagLeftIcon as={AiOutlineQuestion}/>
            <TagLabel>Key Missing</TagLabel>
          </Tag> : (
          soulboundAmount.data.lt(1) ?
            <Tag size='md' colorScheme='yellow' borderRadius='full'>
              <TagLeftIcon as={AiOutlineWarning}/>
              <TagLabel>Not Soulbound</TagLabel>
            </Tag> 
          :
             <Tag size='md' colorScheme='purple' borderRadius='full'>
              <TagLeftIcon as={BiGhost}/>
              <TagLabel>Soulbound</TagLabel>
            </Tag>
        )) }
        <HStack>
          <Tag size='lg' cursor='pointer' onClick={() => {
            navigator.clipboard.writeText(address);
            toast({
              title: 'Copied',
              description: 'Your address is on the clipboard.',
              status: 'info',
              duration: 2000,
              isClosable: false,
              position: 'top',
            }); }}>
            <TagLabel><DisplayAddress address={address}/></TagLabel>
            <TagRightIcon as={FiCopy}/>
          </Tag>
          <Button size='sm' onClick={qrModal.onOpen}><ImQrcode/></Button>
          <QrModal keyAlias={keyInfo.alias} address={address} disclosure={qrModal}/>
        </HStack>
      </VStack>
    </Box>
  </VStack>
}

const QrModal = ({keyAlias, address, disclosure, ...rest}) => {
  return <Modal isOpen={disclosure.isOpen} onClose={disclosure.onClose} isCentered> 
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>{keyAlias}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack mb='3em' spacing='3em'>
          <Text>{address}</Text>
          <QRCode logoImage='/Locksmith-logo.png' removeQrCodeBehindLogo={true} 
            logoWidth='70' logoHeight='70' size='200' ecLevel='H' value={address}/>
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
}

const TrustLabel = ({trustId, ...rest}) => {
  const trustInfo = useTrustInfo(trustId);
  return <HStack {...rest}>
    <BsShieldLock/>
    { trustInfo.isSuccess ? <Text>{trustInfo.data.name}</Text> :
      <Skeleton width='5em' height='1em'/> }
  </HStack>
}

const InboxAssetBalance = ({keyId, keyInfo, address, ...rest}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  return <Box bg={boxColor} borderRadius='lg' boxShadow='md' p='1em' mt='1em' width='90%'>
    <VStack spacing='0.5em'> 
      <ContextBalanceUSD contextId={KEY_CONTEXT_ID} identifier={keyId} textProps={{
        fontSize: '4xl'
      }}/>
      <Button leftIcon={<FiSend/>} variant='solid' size='lg' borderRadius='full'>
        Send
      </Button>
    </VStack>
  </Box>
}

const InboxAssetList = ({keyId, keyInfo, address, ...rest}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  const providerDisclosure = useDisclosure();

  // grab the asset list for the key
  const keyBalanceSheet = useContextBalanceSheet(KEY_CONTEXT_ID, keyId);
  const keyArns = keyBalanceSheet.isSuccess ? keyBalanceSheet.data[0] : [];
  const keyArnBalances = keyBalanceSheet.isSuccess ? keyBalanceSheet.data[1] : [];

  return <Box bg={boxColor} borderRadius='lg' boxShadow='md' p='1em' mt='1em' width='90%'>
    { !keyBalanceSheet.isSuccess && <List>
      <ListItem key='0'><Skeleton width='100%' height='4em'/></ListItem>
      <ListItem key='1'><Skeleton width='100%' height='4em'/></ListItem>
      <ListItem key='2'><Skeleton width='100%' height='4em'/></ListItem>
    </List> }
    { keyBalanceSheet.isSuccess && <List>
      { keyArns.map((arn, x) => <ListItem key={'ali-'+x}>
          <VStack spacing='1em' width='100%' align='stretch'>
            <InboxAssetArn keyId={keyId} keyInfo={keyInfo} address={address}
              arn={arn} balance={keyArnBalances[x]} toggle={providerDisclosure.onToggle}/>
            <Collapse in={providerDisclosure.isOpen}>
              <InboxAssetArnProviderList keyId={keyId} keyInfo={keyInfo} arn={arn}/>
            </Collapse>
          </VStack>
        </ListItem> )}
      </List> }
  </Box>;
}

const InboxAssetArn = ({keyId, keyInfo, address, arn, balance, toggle, ...rest}) => {
  const asset = AssetResource.getMetadata(arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const formatted = ethers.utils.formatUnits(balance, asset.decimals);
  const assetValue = assetPrice.isSuccess ? USDFormatter.format(assetPrice.data * formatted) : null;

  return <HStack onClick={toggle}>
    {asset.icon()}
    <Text>{asset.name}</Text>
    <Spacer/>
    <VStack align='stretch' spacing='0em'>
      <HStack><Spacer/><Text>{assetValue}</Text></HStack>
      <HStack><Spacer/><Text fontSize='sm' color='gray'>{formatted} {asset.symbol}</Text></HStack>
    </VStack>
  </HStack>;
}

const InboxAssetArnProviderList = ({keyId, keyInfo, arn, ...rest}) => {
  const providers = useContextProviderRegistry(KEY_CONTEXT_ID, keyId, arn);
  const stripeColor = useColorModeValue('gray.100', 'gray.700');

  return <List>
    {!providers.isSuccess && [...Array(2)].map((y,x) =>
      <ListItem key={'lie-'+arn+x} padding='1em' width='100%' bg={x % 2 === 0 ? stripeColor : ''}>
        <HStack spacing='1em'>
          <Skeleton width='10em' height='1em'/>
          <Spacer/>
          <Skeleton width='3em' height='1em'/>
        </HStack>
      </ListItem>)}
    {providers.isSuccess &&
      providers.data.map((provider, x) => (
        <ListItem key={'li-'+arn+provider} p='0.5em' width='100%'
          bg={x % 2 === 0 ? stripeColor : ''}>
          <KeyArnProvider keyId={keyId} keyInfo={keyInfo} arn={arn} provider={provider}/>
        </ListItem>
      ))
    }</List>
}

export function KeyArnProvider({keyId, keyInfo, arn, provider, ...rest}) {
  const providerAlias = useTrustedActorAlias(keyInfo.trustId, COLLATERAL_PROVIDER, provider);
  const providerBalance = useContextArnBalances(KEY_CONTEXT_ID, keyId, [arn], provider);
  const asset = AssetResource.getMetadata(arn);

  return (<>
    <HStack align='stretch' fontSize='sm'>
      {!providerAlias.isSuccess && <Skeleton width='8em' height='1em'/>}
      {providerAlias.isSuccess && <>
        <RiSafeLine size={20}/>
        <Text>{providerAlias.data}</Text></>}
      <Spacer/>
      {!providerBalance.isSuccess && <Skeleton width='4em' height='1em'/>}
      {providerBalance.isSuccess &&
        <Text>{ethers.utils.formatUnits(providerBalance.data[0], asset.decimals)} {asset.symbol}</Text>}
    </HStack>
  </>)
}
