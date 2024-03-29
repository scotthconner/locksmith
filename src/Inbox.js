import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  Text,
  Select,
  Skeleton,
  Spacer,
  Spinner,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  useState
} from 'react';
import { QRCode } from 'react-qrcode-logo';
import { 
  AiOutlineWarning,
  AiOutlineQuestion,
} from 'react-icons/ai';
import { 
  FiCopy,
  FiSend, 
} from 'react-icons/fi';
import { AiOutlineNumber } from 'react-icons/ai';
import { BiGhost } from 'react-icons/bi';
import { ImQrcode } from 'react-icons/im';
import { BsShieldLock } from 'react-icons/bs';
import { RiSafeLine, RiHandCoinLine } from 'react-icons/ri';
import { useAccount } from 'wagmi';
import { useParams } from 'react-router-dom';
import { AssetResource } from './services/AssetResource.js';
import Locksmith from './services/Locksmith.js';

// Raw Hooks
import { ethers, BigNumber } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useBalance } from 'wagmi';
import { useKeyInboxAddress } from './hooks/PostOfficeHooks.js';
import { 
  KEY_CONTEXT_ID,
  useContextBalanceSheet,
  useContextProviderRegistry,
  useContextArnBalances,
} from './hooks/LedgerHooks.js';
import { 
  useWalletKeys,
  useKeyBalance,
  useInspectKey,
  useSoulboundKeyAmounts,
  useTrustInfo,
} from './hooks/LocksmithHooks.js';
import {
  useInboxTransactionCount,
  useInboxTransaction,
  useSend,
  useSendToken,
  useAcceptTokenBatch,
  useAcceptPaymentBatch,
} from './hooks/VirtualKeyAddressHooks.js';
import {
  useTrustedActorAlias,
  COLLATERAL_PROVIDER,
} from './hooks/NotaryHooks.js';
import {
  useCoinCapPrice,
  USDFormatter,
} from './hooks/PriceHooks.js';
import {
  useKeyAllowances,
  useAllowance,
  useRedeemableTrancheCount,
  mapAllowanceData,
} from './hooks/AllowanceHooks.js';

// Components
import { ContextBalanceUSD } from './components/Trust.js';
import { KeyIcon } from './components/KeyInfo.js';
import { DisplayAddress } from './components/Address.js';
import { ConnectWalletPrompt } from './components/Locksmith.js';
export function InboxDirectory({...rest}) {
  const {isConnected} = useAccount();
  const keys = useWalletKeys();
  const navigate = useNavigate();

  return !isConnected ? <ConnectWalletPrompt/> : (
    !keys.isSuccess ? <VStack p='3em'><Spinner size='lg'/></VStack> :
    (keys.data.length < 1 ? 
      <VStack spacing='1em' width='100%' p='3em'>
        <Text fontSize='30px'>You have no keys.</Text>
        <Button colorScheme='blue' onClick={() => {navigate('/wizard');}}>Create Trust</Button>
      </VStack>
    : <VStack mb='2em'>{keys.data.map((k) => <InboxChoice keyId={k} key={k}/>)}</VStack>)
  )
}

const InboxChoice = ({keyId, ...rest}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  const keyInfo = useInspectKey(keyId);
  const navigate = useNavigate();

  return !keyInfo.isSuccess ? <Skeleton width='90%' height='3em'/> : <Box bg={boxColor} borderRadius='lg' boxShadow='md' p='1em' mt='1em' width='90%'
      border={keyInfo.data.isRoot ? '2px' : '0px'}
      borderColor={keyInfo.data.isRoot ? 'yellow.400' : 'white'}
      cursor='pointer'
      onClick={() => { navigate('/inbox/' + keyId.toString()); }}
      _hover= {{
        transform: 'scale(1.1)',
      }}>
     <HStack>
       <Tag>
         <TagLeftIcon boxSize='12px' as={AiOutlineNumber} />
         <TagLabel>{keyId.toString()}</TagLabel>
       </Tag>
       <Text><b>{keyInfo.data.alias}</b></Text>
       <Spacer/>
       <ContextBalanceUSD contextId={KEY_CONTEXT_ID} 
         identifier={keyId}/>
     </HStack>
  </Box>
}

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
  const boxColor = useColorModeValue('white', 'gray.800');
  const tab = 'assets';
  
  return <>
    <InboxHeader keyId={keyId} keyInfo={keyInfo} address={address}/>
    <InboxAssetBalance keyId={keyId} keyInfo={keyInfo} address={address}/>
    <TokenAcceptBox keyId={keyId} keyInfo={keyInfo} address={address}/>
    <PaymentAcceptBox keyId={keyId} address={address}/>
    <Box bg={boxColor} borderRadius='lg' boxShadow='md' p='1em' mt='1em' width='90%'>
      <Tabs isLazy isFitted defaultIndex={['assets','transactions'].indexOf(tab)}>
        <TabList>
          <Tab>Assets</Tab>
          <Tab>Transactions</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p='0'>
            <VStack spacing='1.5em' align='stretch' mt='1em'>
              <InboxAssetList keyId={keyId} keyInfo={keyInfo} address={address}/>
            </VStack>
          </TabPanel>
          <TabPanel p='0'>
            <TransactionHistory keyId={keyId} keyInfo={keyInfo} address={address}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  </>
}

const TokenAcceptBox = ({keyId, keyInfo, address, ...rest}) => {
  // at this address, we are going to check the balance of any known
  // ERC20 that is in our asset resource bin.
  var assets = AssetResource.getMetadata();
  var tokens = Object.keys(assets)
    .map((arn) => assets[arn].standard === 20 ? assets[arn].contractAddress : null)
    .filter((ca) => ca !== null); 
  
  return <RecursiveAcceptBox keyId={keyId} keyInfo={keyInfo}
    address={address} tokens={tokens} position={0} balanceCount={0}/> 
}

const RecursiveAcceptBox = ({keyId, keyInfo, address, tokens, position, balanceCount}) => {
  // first thing we want to do is get the ERC20 balance
  // of the inbox address for the position token
  const balance = useBalance({
    addressOrName: address, 
    token: tokens[position],
    watch: true
  });
  // we try to see if we have a non-zero balance for this token
  const myBalanceCount = balanceCount + 
    (balance.isSuccess && balance.data.value.gt(0) ? 1 : 0);

  return position >= (tokens.length-1) ?
    <FinalAcceptBoxDisplay keyId={keyId} keyInfo={keyInfo} address={address}
      balanceCount={myBalanceCount} tokens={tokens}/> :
    <RecursiveAcceptBox keyId={keyId} keyInfo={keyInfo} address={address}
      tokens={tokens} position={position+1} balanceCount={myBalanceCount}/>
}

const FinalAcceptBoxDisplay = ({keyId, keyInfo, address, tokens, balanceCount, ...rest}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  const modalDisclosure = useDisclosure();

  return balanceCount > 0 && 
      <Box bg={boxColor} borderRadius='lg' boxShadow='md' p='1em' mt='1em' width='90%'>
        <HStack>
          <Text>You have tokens to accept.</Text>
          <Spacer/>
          <Button onClick={() => { modalDisclosure.onOpen(); }}>Review</Button>
          <ReviewTokenModal keyId={keyId} keyInfo={keyInfo} address={address} tokens={tokens}
            disclosure={modalDisclosure}/>
        </HStack>
      </Box>
}

const ReviewTokenModal = ({keyId, keyInfo, address, tokens, disclosure, ...rest}) => {
  const toast = useToast();
  const [selectedTokens, setSelectedTokens] = useState([]);

  const addToken = function(token) {
    setSelectedTokens([token, selectedTokens].flat());
  };

  const removeToken = function(token) {
    setSelectedTokens(selectedTokens.filter((t) => t !== token));
  };

  const sweepTokens = useAcceptTokenBatch(address, selectedTokens,
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
      Locksmith.watchHash(data.hash);
      toast({
        title: 'Accepted!',
        description: 'The tokens have been deposited.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      disclosure.onClose();
    }
  );

  const buttonProps = selectedTokens.length < 1 ? {isDisabled: true} : (
    sweepTokens.isLoading ? {isLoading: true } : {} 
  );

  return <Modal isOpen={disclosure.isOpen} onClose={disclosure.onClose} isCentered size='xl'>
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>Accept Token Review</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <List spacing='2em'>
          { tokens.map((t) => <ListItem key={'aac-'+t}>
            <AssetApprovalChoice token={t} address={address} addToken={addToken} removeToken={removeToken}/>
          </ListItem>) }
        </List>
      </ModalBody>
      <ModalFooter>
        <Button {... buttonProps} 
          onClick={() => { sweepTokens.write?.(); }}
          leftIcon={<RiSafeLine/>} colorScheme='yellow'>Deposit</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
}

const AssetApprovalChoice = ({token, address, addToken, removeToken, ...rest}) => {
  const asset = AssetResource.getMetadata(AssetResource.getTokenArn(token));
  const balance = useBalance({
    addressOrName: address,
    token: token 
  });
  return !balance.isSuccess ? <Skeleton width='100%' height='3em'/> : (
    balance.data.value.gt(0) ? <HStack>
      <Checkbox value={token} size='lg'
        onChange={(e) => {
          if (e.target.checked) {
            addToken(token);
          } else {
            removeToken(token);
          }
          return false; 
        }}><HStack>
      {asset.icon()}
      <Text>{asset.name}</Text></HStack>
    </Checkbox>
    <Spacer/>
    <Text>{balance.data.formatted} {asset.symbol}</Text>
    </HStack> : '');
}

const PaymentAcceptBox = ({keyId, address, ...rest}) => {
  const allowances = useKeyAllowances([BigNumber.from(keyId)]);
  return allowances.isSuccess && allowances.data.flat(2).length > 0 && 
    <RecursivePaymentAccept keyId={BigNumber.from(keyId)} address={address} removeAllowances={[]} 
      allowances={allowances.data.flat(2)} position={0} structure={[]} paymentCount={BigNumber.from(0)}/>
}

const RecursivePaymentAccept = ({keyId, address, allowances, position, structure, paymentCount, removeAllowances, ...rest}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  const allowance = useAllowance(allowances[position]);
  const tranches = useRedeemableTrancheCount(allowances[position]);
  const allowanceObject = mapAllowanceData(allowance.data);
  const newPaymentCount = tranches.isSuccess ? paymentCount.add(tranches.data) : paymentCount;
  const newStructure = !allowance.isSuccess || !tranches.isSuccess ? structure : [structure, 
    (tranches.data.gt(0) ? allowanceObject.entitlements.map((e) => {
      return {
        arn: e.arn,
        amount: e.amount,
        tranche: tranches.data
      };
    }) : [])
  ].flat();
  
  // if there are no tranches on an allowance, make sure to remove it from the multicall
  var newRemoveAllowances = [...removeAllowances];
  if (tranches.isSuccess && tranches.data.lt(1)) {
    newRemoveAllowances.push(allowances[position]);
  }

  return (position >= allowances.length - 1) ?
    (newPaymentCount.gt(0) && <Box bg={boxColor} borderRadius='lg' boxShadow='md' p='1em' mt='1em' width='90%'>
      <HStack>
        <Text>You have <b>{newPaymentCount.toString()}</b> payments to accept.</Text>
        <Spacer/>
        <TotalPaymentAmount address={address} allowances={allowances} removeAllowances={newRemoveAllowances} structure={newStructure} position={0} total={0}/>
      </HStack>
    </Box>) : 
    <RecursivePaymentAccept keyId={keyId} allowances={allowances} position={position+1} removeAllowances={newRemoveAllowances}
      structure={newStructure} paymentCount={newPaymentCount} address={address}/>
}

/*
 * structure:
 *  [{arn, amount, tranche}]
 */
const TotalPaymentAmount = ({allowances, structure, position, total, address, removeAllowances, ...rest}) => {
  const asset = AssetResource.getMetadata(structure[position].arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const totalAmount = total + (!assetPrice.isSuccess ? 0 :
    assetPrice.data * ethers.utils.formatUnits(structure[position].amount, asset.decimals) *
      structure[position].tranche);

  return position === (structure.length-1) ?
    <AcceptPaymentsButton allowances={allowances.filter((a) => !removeAllowances.includes(a))} totalAmount={totalAmount} address={address}/> :
    <TotalPaymentAmount allowances={allowances} structure={structure} removeAllowances={removeAllowances} 
      position={position+1} total={totalAmount} address={address} {...rest}/>
}

const AcceptPaymentsButton = ({address, allowances, totalAmount, ...rest}) => {
  const toast = useToast();
  const accept = useAcceptPaymentBatch(address, allowances,
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
      Locksmith.watchHash(data.hash);
      toast({
        title: 'Payments Received!',
        description: 'The payments have been received.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
    }
  );

  return <Button isLoading={accept.isLoading} colorScheme='yellow' leftIcon={<RiHandCoinLine/>}
    onClick={() => { accept.write?.(); }}>
    {USDFormatter.format(totalAmount)}
  </Button>
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
  const sendDisclosure = useDisclosure();

  return <Box bg={boxColor} borderRadius='lg' boxShadow='md' p='1em' mt='1em' width='90%'>
    <VStack spacing='0.5em'> 
      <ContextBalanceUSD contextId={KEY_CONTEXT_ID} identifier={keyId} textProps={{
        fontSize: '4xl'
      }}/>
      <Button leftIcon={<FiSend/>} variant='solid' size='lg' borderRadius='full'
        onClick={sendDisclosure.onOpen}>
        Send
      </Button>
      <SendAssetDialog keyId={keyId} keyInfo={keyInfo} address={address} disclosure={sendDisclosure}/>
    </VStack>
  </Box>
}

const InboxAssetList = ({keyId, keyInfo, address, ...rest}) => {
  // grab the asset list for the key
  const keyBalanceSheet = useContextBalanceSheet(KEY_CONTEXT_ID, keyId);
  const keyArns = keyBalanceSheet.isSuccess ? keyBalanceSheet.data[0] : [];
  const keyArnBalances = keyBalanceSheet.isSuccess ? keyBalanceSheet.data[1] : [];

  return !keyBalanceSheet.isSuccess ? '' : keyArns.map((arn, x) => 
      <InboxAssetArn keyId={keyId} keyInfo={keyInfo} address={address} key={'iar'+arn}
        arn={arn} balance={keyArnBalances[x]}/>)
}

const InboxAssetArn = ({keyId, keyInfo, address, arn, balance, ...rest}) => {
  const asset = AssetResource.getMetadata(arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const formatted = ethers.utils.formatUnits(balance, asset.decimals);
  const assetValue = assetPrice.isSuccess ? USDFormatter.format(assetPrice.data * formatted) : null;
  const sendDisclosure = useDisclosure();

  return <> 
    <HStack onClick={sendDisclosure.onToggle} cursor='pointer'>
      {asset.icon()}
      <Text>{asset.name}</Text>
      <Spacer/>
      <VStack align='stretch' spacing='0em'>
        <HStack><Spacer/><Text>{assetValue}</Text></HStack>
        <HStack><Spacer/><Text fontSize='sm' color='gray'>{formatted} {asset.symbol}</Text></HStack>
      </VStack>
    </HStack>
    <SendAssetDialog keyId={keyId} keyInfo={keyInfo} address={address} 
      arn={arn} disclosure={sendDisclosure}/>
  </>
}

export function KeyArnProvider({keyId, keyInfo, arn, provider, ...rest}) {
  const providerAlias = useTrustedActorAlias(keyInfo.trustId, COLLATERAL_PROVIDER, provider);
  const providerBalance = useContextArnBalances(KEY_CONTEXT_ID, keyId, [arn], provider);
  const asset = AssetResource.getMetadata(arn);

  return (<HStack align='stretch' fontSize='sm'>
      {!providerAlias.isSuccess && <Skeleton width='8em' height='1em'/>}
      {providerAlias.isSuccess && <>
        <RiSafeLine size={20}/>
        <Text>{providerAlias.data}</Text></>}
      <Spacer/>
      {!providerBalance.isSuccess && <Skeleton width='4em' height='1em'/>}
      {providerBalance.isSuccess &&
        <Text>{ethers.utils.formatUnits(providerBalance.data[0], asset.decimals)} {asset.symbol}</Text>}
    </HStack>)
}

const SendAssetDialog = ({keyId, keyInfo, address, arn, disclosure, ...rest}) => {
  const toast = useToast();

  // form inputs
  const [selectedArn, setSelectedArn] = useState(arn||AssetResource.getGasArn());
  const [selectedProvider, setSelectedProvider] = useState(null); 
  const [selectedAmount, setSelectedAmount] = useState('0'); // this will be in "units" by decimal, not wei.
  const [selectedAddress, setSelectedAddress] = useState(null);

  // conditional state
  const selectedProviderBalance = useContextArnBalances(KEY_CONTEXT_ID, keyId, 
    selectedArn ? [selectedArn] : null, selectedProvider || ethers.constants.AddressZero);

  // get the arn information
  const asset = AssetResource.getMetadata(selectedArn);
  const assetPrice = useCoinCapPrice(asset.coinCapId); 
  const sendInDollars = !assetPrice.isSuccess ? 0 : USDFormatter.format(assetPrice.data * selectedAmount); 
  const rawAmount = ethers.utils.parseUnits(selectedAmount, asset.decimals);

  // grab the asset list for the key
  const keyBalanceSheet = useContextBalanceSheet(KEY_CONTEXT_ID, keyId);
  const keyArns = keyBalanceSheet.isSuccess ? keyBalanceSheet.data[0] : [];
  
  // grab the arn providers for a given key assuming the arn is set.
  // NOTE: if this comes from the 'send' button and arn is null, it will default to
  //       all providers. This is generally an OK thing since it won't be displayed to
  //       the user until an arn is selected, its an additional RPC call that is un-necessary
  //       and we will want to fix as part of RPC reduction on the frontend.
  const keyArnProviders = useContextProviderRegistry(KEY_CONTEXT_ID, keyId, selectedArn);

  // error conditions
  const addressError = !ethers.utils.isAddress(selectedAddress) || selectedAddress === address;
  const amountError = !selectedProviderBalance.isSuccess || selectedProviderBalance.data.length < 1 ? true :
    rawAmount.gt(selectedProviderBalance.data[0]);

  // callbacks
  const error = function(error) {
    toast({
      title: 'Transaction Error!',
      description: error.toString(),
      status: 'error',
      duration: 9000,
      isClosable: true
    });
  };

  const success = function(data) {
    Locksmith.watchHash(data.hash);
    toast({
      title: 'Sent!',
      description: 'The funds have been sent.',
      status: 'success',
      duration: 9000,
      isClosable: true
    });
    disclosure.onClose();
  };

  // sending ethereum, only when arn is ethereum arn
  const sendEth = useSend(address, selectedArn === AssetResource.getGasArn() ? 
    selectedProvider || (keyArnProviders.data||[null])[0] : null, amountError ? null : rawAmount, selectedAddress, error, success);
  
  // sending erc-20
  const sendToken = useSendToken(address, selectedProvider || (keyArnProviders.data||[null])[0],
    (asset||{}).standard === 20 ? asset.contractAddress : null,
    amountError ? null : rawAmount, selectedAddress, error, success);

  const buttonProps = addressError || amountError || !selectedArn ? {isDisabled: true} : (
    sendEth.isLoading || sendToken.isLoading ? {isLoading: true} : {}); 

  return <Modal isOpen={disclosure.isOpen} onClose={() => {
    setSelectedArn(arn);
    setSelectedProvider(null);
    setSelectedAmount('0');
    setSelectedAddress(null);
    disclosure.onClose();
  }} isCentered size='xl' width='100%'>
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>Send Funds</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack mb='3em' spacing='3em'>
          <FormControl key='send_asset_form'>
            <FormLabel>What do you want to send?</FormLabel>
            <Select placeholder='Choose Asset' value={arn} onChange={(e) => {setSelectedArn(e.target.value);}}>
              { keyArns.map((a) => 
              <option key={'send-option-'+a} value={a}>
                {AssetResource.getMetadata(a).name}
              </option>
              ) }
            </Select>
          </FormControl>
          { selectedArn && 
            <FormControl key='send_asset_provider_form'> 
              <FormLabel>Which provider do you want to send from?</FormLabel>
              <Select onChange={(e) => {setSelectedProvider(e.target.value);}}>
                { keyArnProviders.isSuccess && keyArnProviders.data.map(
                  (p) => <ProviderOption key={'provider-' + p} keyId={keyId} keyInfo={keyInfo} provider={p} arn={selectedArn}/>
                ) }
              </Select>
            </FormControl> }
          { selectedArn &&
            <FormControl key='send_amount_form' isInvalid={amountError}>
              <FormLabel>Send how much {asset.symbol}?</FormLabel>
              <HStack>
                <Input type='number' placeholder='0.0' size='lg' width='50%' onChange={(e) => {
                  setSelectedAmount(e.target.value.length === 0 ? '0' : e.target.value);
                }}/>
                <Text align='center' width='50%'>{sendInDollars}</Text>
              </HStack>
              <FormErrorMessage>You don't have that much.</FormErrorMessage>
            </FormControl> }
          { selectedArn && selectedAmount > 0 && !amountError &&
            <FormControl key='send_destination_form' isInvalid={addressError}>
              <FormLabel>Send where?</FormLabel>
              <Input placeholder='0x000000000000000000000000' fontSize='12px' size='lg' onChange={(e) => {
                setSelectedAddress(e.target.value);
              }}/>
              <FormErrorMessage>{selectedAddress === address ? 'This is your own virtual address!' : 'Address looks kinda invalid?'}</FormErrorMessage>
            </FormControl> }
          <HStack width='100%'>
            <Spacer/>
            <Button onClick={() => {
              if(asset.standard === 0) {
                sendEth.write?.();
              } else if (asset.standard === 20) {
                sendToken.write?.();
              }
            }} {... buttonProps} leftIcon={<FiSend/>} colorScheme='yellow'>Send</Button>
          </HStack>
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
}

export function ProviderOption({keyId, keyInfo, provider, arn, ...rest}) {
  const providerAlias = useTrustedActorAlias(keyInfo.trustId, COLLATERAL_PROVIDER, provider);
  const providerBalance = useContextArnBalances(KEY_CONTEXT_ID, keyId, [arn], provider);
  const asset = AssetResource.getMetadata(arn);

  return providerAlias.isSuccess && providerBalance.isSuccess &&
    <option value={provider} {...rest}>
      {providerAlias.data} ({ethers.utils.formatUnits(providerBalance.data[0], asset.decimals)} {asset.symbol})
    </option>
}

const TransactionHistory = ({keyId, keyInfo, address, ...rest}) => {
  const transactionCount = useInboxTransactionCount(address);
  
  return !transactionCount.isSuccess ? <VStack p='5em'>
    <Spinner size='lg'/>
  </VStack> : <VStack spacing='1em' mt='1em'>
    { transactionCount.data.eq(0) && <Text>You have no transactions.</Text> }
    { transactionCount.data.gt(0) &&
     <TransactionUnroll address={address} index={transactionCount.data - 1} pageSize={5} depth={5}/> }
  </VStack>
}

const TransactionUnroll = ({address, index, pageSize, depth, ...rest}) => {
  const tx = useInboxTransaction(address, index);
  const asset = AssetResource.getMetadata(!tx.isSuccess ? null : tx.data.arn);
  const [wantMore, setWantMore] = useState(false);

  const txTypeStrings    = ['Invalid', 'Send', 'Receive', 'Batch']; 
  const txTypeTarget     = ['', 'To', 'From', 'Target']; 
  const txTypeAmountSign = ['', '-', '+', '-']; 

  return !tx.isSuccess ? <Skeleton width='100%' height='3em'/> : <>
    <HStack width='100%'>
      {asset.icon()}
      <VStack align='stretch' spacing='0'>
        <Text fontWeight='bold'>{txTypeStrings[tx.data.type]}</Text>
        <Text>{(new Date(1000*tx.data.blockTime.toNumber())).toLocaleDateString()}</Text>
      </VStack>
      <Spacer/>
      <VStack align='stretch' spacing='0'>
        <HStack>
          <Spacer/>
          <Text fontWeight='bold'>{txTypeAmountSign[tx.data.type]}{ethers.utils.formatUnits(tx.data.amount, asset.decimals)} {asset.symbol}</Text>
        </HStack>
        <Text>{txTypeTarget[tx.data.type]}: <DisplayAddress address={tx.data.target}/></Text>
      </VStack>
    </HStack>
    { depth > 0 && index > 0 && 
      <TransactionUnroll address={address} index={index-1} pageSize={pageSize} depth={depth-1}/> }
    { depth === 0 && index > 0 && !wantMore &&
      <Button onClick={() => {setWantMore(true);}}width='100%' size='lg'>More</Button> }
    { depth === 0 && index > 0 && wantMore &&
      <TransactionUnroll address={address} index={index-1} depth={pageSize} pageSize={pageSize}/> }
  </>
}
