//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  Collapse,
  Heading,
  HStack,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Skeleton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spacer,
  Stack,
  Text,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { BiCoinStack } from 'react-icons/bi';
import { FiShare2 } from 'react-icons/fi';
import { RiSafeLine } from 'react-icons/ri';
import { KeyInfoIcon } from './components/KeyInfo.js';
import { 
  EventStateIcon, 
  EventDescription 
} from './components/Event.js';
import { ContextBalanceUSD } from './components/Trust.js';
import { PolicyActivationTag } from './trusts/Policies.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers, BigNumber } from 'ethers';
import { AssetResource } from './services/AssetResource.js';
import {
  useWalletKeys,
  useKeyInfo,
  useInspectKey,
} from './hooks/LocksmithHooks.js';
import {
  COLLATERAL_PROVIDER,
  useTrustedActorAlias,
} from './hooks/NotaryHooks.js';
import {
  KEY_CONTEXT_ID,
  useContextBalanceSheet,
  useContextProviderRegistry,
  useContextArnBalances,
} from './hooks/LedgerHooks.js';
import {
  usePolicy,
  useDistribute,
} from './hooks/TrusteeHooks.js';
import {
  useCoinCapPrice,
  USDFormatter,
} from './hooks/PriceHooks.js';

//////////////////////////////////////
// Trustees Function Component
//////////////////////////////////////
function Trustees() {
  const keys = useWalletKeys();

  return <Stack m='1em' spacing='1em'>
    <Heading size='md'>Trustee Keys in Your Wallet</Heading>
    <VStack spacing='1em' pb='2em' pt='2em'>
      { !keys.isSuccess && [1,2,3].map((k) => 
        <Skeleton key={'skeleton-key-' + k} width='100%' height='4em' borderRadius='lg'/>
      ) } 
      { keys.isSuccess && keys.data.map((k) => 
        <TrusteeKey keyId={k} key={'trustee-key-component-' + k}/>
      ) } 
    </VStack>
  </Stack>
}

export function TrusteeKey({keyId, ...rest}) {
  const sheetDisclosure = useDisclosure(); 
  const boxColor = useColorModeValue('white', 'gray.800'); 
  const keyInfo = useKeyInfo(keyId);
  const policy = usePolicy(keyId);

  return policy.isSuccess && policy.data[2].length > 0 && 
    <Box width='90%' 
      p='1em' bg={boxColor} borderRadius='lg' boxShadow='dark-lg' 
      _hover={{
        transform: 'scale(1.1)',
      }}>
      <HStack spacing='1.5em' cursor='pointer' onClick={sheetDisclosure.onToggle}>
        { !keyInfo.isSuccess && <Skeleton width='6em' height='1.2em'/> }
        { !keyInfo.isSuccess && <Skeleton width='4em' height='1em'/> }
        { keyInfo.isSuccess && <>
          {KeyInfoIcon(keyInfo, '30px')}    
          <VStack spacing='0' align='stretch'>
            <Text><b>{keyInfo.data.alias}</b></Text>
            <Text fontSize='sm' color='gray'><i>{keyInfo.data.trust.name}</i></Text>
          </VStack>
          <HStack>
            <AiOutlineUser size='24px'/>
            <Text>{policy.data[2].length}</Text>
          </HStack>
        </> }
        <Spacer/>
        <PolicyActivationTag activated={policy.data[0]}/>
        <ContextBalanceUSD contextId={KEY_CONTEXT_ID} identifier={policy.data[1]} 
          textProps={{fontSize: '2xl' }} skeletonProps={{width: '6em', height: '1.5em'}}/>
      </HStack>
      <Collapse in={sheetDisclosure.isOpen} width='100%'>
        { keyInfo.isSuccess && 
          <KeyBalanceSheet trustId={keyInfo.data.trust.id} 
            keyId={policy.data[1]} trusteeKey={keyId}/> }
      </Collapse>
    </Box>
}

export function KeyBalanceSheet({trustId, keyId, trusteeKey, ...rest}) {
  const keyBalanceSheet = useContextBalanceSheet(KEY_CONTEXT_ID, keyId);
  return !keyBalanceSheet.isSuccess ? <VStack mt='1em' spacing='1em'>
    <Skeleton width='100%' height='3em'/>
    <Skeleton width='100%' height='3em'/>
    <Skeleton width='100%' height='3em'/>
  </VStack> :
  <List spacing='1em' mt='1em'>
    { keyBalanceSheet.data[0].map((arn, x) => 
      <KeyAssetBalanceOption trustId={trustId} keyId={keyId} arn={arn}
        balance={keyBalanceSheet.data[1][x]} trusteeKey={trusteeKey}
          key={'key-balance-sheet-for-' + arn + keyId}/>
    )}
  </List>
}

export function KeyAssetBalanceOption({trustId, keyId, arn, balance, trusteeKey, ...rest}) {
  const asset = AssetResource.getMetadata(arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const ethAmount = ethers.utils.formatEther(balance);
  const assetValue = assetPrice.isSuccess ?
    USDFormatter.format(ethAmount * assetPrice.data) : null;
  const providers = useContextProviderRegistry(KEY_CONTEXT_ID, keyId, arn);
  const providerDisclosure = useDisclosure();

  return <ListItem padding='1em' borderRadius='lg'> 
    <HStack spacing='1em' cursor='pointer' onClick={providerDisclosure.onToggle}>
      {asset.icon()}
      <Text><b>{asset.name}</b>&nbsp;
        <font color='gray'>({asset.symbol})</font>
      </Text>
      <Spacer/>
      <VStack align='stretch'>
        <HStack fontSize='sm'>
          <Spacer/>
          { providers.isSuccess && <HStack>
            <RiSafeLine/>
            <Text>x {providers.data.length}&nbsp;&nbsp;</Text> 
          </HStack> }
          {assetValue ? <Text>{assetValue}</Text> : <Skeleton width='4em' height='1em'/>}
        </HStack>
        <HStack>
          <Spacer/>
          <Text size='sm' color='gray'>{ethAmount} {asset.symbol}</Text>
        </HStack>
      </VStack>
    </HStack>
    <Collapse in={providerDisclosure.isOpen}>
      <Wrap spacing='1em' p='1em'>{ providers.isSuccess && providers.data.map((p,x) =>
        <KeyArnProviderOption trustId={trustId} keyId={keyId} trusteeKey={trusteeKey} 
          arn={arn} provider={p} key={'kapo-' + keyId + arn + p}/>
      ) }</Wrap>
    </Collapse>
  </ListItem>
}

export function KeyArnProviderOption({trustId, keyId, trusteeKey, arn, provider, ...rest}) {
  const distributeDisclosure = useDisclosure();
  const asset = AssetResource.getMetadata(arn);
  const assetPrice = useCoinCapPrice(asset.coinCapId);
  const policy = usePolicy(trusteeKey);
  const providerBalance = useContextArnBalances(KEY_CONTEXT_ID, keyId, [arn], provider);
  const providerAlias = useTrustedActorAlias(trustId, COLLATERAL_PROVIDER, provider); 
  const ethAmount = !providerBalance.isSuccess ? 0 : 
    ethers.utils.formatEther(providerBalance.data[0]);
  const usdAmount = assetPrice.isSuccess ?
    USDFormatter.format(ethAmount * assetPrice.data) : null;
  const boxColor = useColorModeValue('gray.100', 'gray.700'); 
  
  return <WrapItem borderRadius='lg' bg={boxColor} p='1em' boxShadow='lg'
    _hover={{transform: 'scale(1.1)'}} cursor='pointer' onClick={distributeDisclosure.onOpen}>
    <VStack spacing='0'>
      <Text fontSize='2xl'>{usdAmount}</Text>
      <Text fontSize='sm' color='gray' fontStyle='italic'>{ethAmount} {asset.symbol}</Text>
      <HStack pt='1em'>
        <RiSafeLine/>
        { !providerAlias.isSuccess && <Skeleton width='5en' height='1.2em'/> }
        { providerAlias.isSuccess && <Text>{providerAlias.data}</Text> }
      </HStack>
    </VStack>
    { providerBalance.isSuccess && policy.isSuccess && policy.data[0] && 
      <DistributeFundsDialog trustId={trustId} keyId={keyId} arn={arn}
        provider={provider} isOpen={distributeDisclosure.isOpen} trusteeKey={trusteeKey}
          onClose={distributeDisclosure.onClose} balance={providerBalance.data[0]}/> }
    { policy.isSuccess && !policy.data[0] &&
      <RequiredEventsDialog trustId={trustId} keyId={keyId} trusteeKey={trusteeKey}
        isOpen={distributeDisclosure.isOpen} onClose={distributeDisclosure.onClose}/> }
  </WrapItem>
}

export function RequiredEventsDialog({trustId, keyId, trusteeKey, isOpen, onClose, ...rest}) {
  const policy = usePolicy(trusteeKey)
  
  return <Modal onClose={onClose} isOpen={isOpen} isCentered size='xl'>
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>Awaiting Trustee Policy Activation</ModalHeader>
      <ModalCloseButton/>
      <ModalBody>
        <Text>This trustee policy is still awaiting the following <b>event conditions</b>:</Text>
        { !policy.isSuccess && [1,2,3].map((k) => 
          <Skeleton mt='1em' width='100%' height='1em' key={'missing-event-' + k}/>) }
        <List spacing='1em' mt='1em'>
        { policy.isSuccess && policy.data[3].map((event) => 
          <UnfiredEventLabel eventHash={event} key={'ufel-' + event}/>
        ) }
        </List>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </ModalContent>
  </Modal>
}

export function UnfiredEventLabel({eventHash, ...rest}) {
  return <ListItem>
    <HStack spacing='0.5em'>
      <EventStateIcon eventHash={eventHash}/>
      <EventDescription eventHash={eventHash}/>
    </HStack>
  </ListItem>
}

export function DistributeFundsDialog({trustId, keyId, trusteeKey, arn, provider, isOpen, onClose, balance, ...rest}) {
  const asset = AssetResource.getMetadata(arn);
  const toast = useToast();
  const keyInfo = useKeyInfo(trusteeKey);
  const policy = usePolicy(trusteeKey);
  const [keyDistributions, setKeyDistributions] = useState({});
  const [balanceLeft, setBalanceLeft] = useState(balance);
  
  // we want to reset sliders when the dialog closes
  const resetClose = function() {
    setKeyDistributions({});
    setBalanceLeft(balance);
    onClose();
  }

  const distribution = useDistribute(trusteeKey, provider, arn, 
    policy.isSuccess ? policy.data[2] : null, policy.data[2].map((k) => 
      keyDistributions[k.toString()] || BigNumber.from(0)),
    function(error) {
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
        title: 'Funds Distributed!',
        description: 'There is ' + ethers.utils.formatEther(balanceLeft) 
          + " " + asset.symbol + ' left on that provider.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      resetClose();
    }
  );

  // we need a special function to accumulate balances across sliders
  const assignDistributionAmount = function(keyId, amount) {
    var distributions = keyDistributions;
    distributions[keyId.toString()] = amount;

    // figure out how much is left 
    setBalanceLeft(balance.sub(Object.keys(distributions).reduce((p,k) => {
      return p.add(distributions[k.toString()]);
    }, BigNumber.from(0))));
    
    setKeyDistributions({...distributions});
  }

  const buttonProps = distribution.isLoading ? {isLoading: true} :
    (balance.eq(balanceLeft) || !policy.isSuccess || !policy.data[0] ? {isDisabled: true} : {});

  return <Modal onClose={resetClose} isOpen={isOpen} isCentered size='xl'>
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>Distribute {asset.symbol}</ModalHeader>
      <ModalCloseButton/>
      <ModalBody>
        { !keyInfo.isSuccess && <Skeleton width='8em' height='1em'/> }
        { keyInfo.isSuccess &&
          <HStack>
              <Text>Use</Text>
              {KeyInfoIcon(keyInfo)}
              <Text><b>{keyInfo.data.alias}</b> to distribute</Text>
              {asset.icon()}
              <Text><b>{asset.name}</b>.</Text>
          </HStack>}
        { !policy.isSuccess && [1,2,3].map((k) => 
          <Skeleton mt='1em' key={'skeleton-key-distribution-' + k} width='100%' height='2em'/>) }
        { policy.isSuccess && policy.data[2].map((b) => {
          var amount= keyDistributions[b.toString()] || BigNumber.from(0);
          return <BeneficiaryDistributionSlider keyId={b} maxBalance={amount.add(balanceLeft)} 
            balance={amount} setBalance={assignDistributionAmount}
            symbol={asset.symbol} key={'bds-' + b}/>
        }) }
      </ModalBody>
      <ModalFooter>
        <Text mr='2em' fontStyle='italic'>With <b>{ethers.utils.formatEther(balanceLeft)} {asset.symbol}</b> left.</Text>
        <Button {...buttonProps} leftIcon={<FiShare2/>} colorScheme='yellow'
          onClick={() => { distribution.write?.() }}>Distribute Funds</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
}

export function BeneficiaryDistributionSlider({keyId, symbol, maxBalance, balance, setBalance, ...rest}) {
  const beneficiaryInfo = useInspectKey(keyId);
  const balanceDisplay = ethers.utils.formatEther(balance||BigNumber.from(0));
  const maxBalanceDisplay = ethers.utils.formatEther(maxBalance);

  return <HStack mt='1em' ml='2em' spacing='1em'>
    <Box width='70%'>
      { !beneficiaryInfo.isSuccess && <Skeleton width='5em' height='1em'/> }
      { beneficiaryInfo.isSuccess &&
        <HStack>
          {KeyInfoIcon(beneficiaryInfo)}
          <Text><b>{beneficiaryInfo.data.alias}</b></Text>
          <Text fontSize='sm' color='gray'><i>id: {keyId.toString()}</i></Text>
        </HStack> }
      <Slider mt='0.5em' width='100%' defaultValue={0} min={0}
        max={maxBalance} step={ethers.utils.parseEther("1") / 100}
        onChangeEnd={(e) => { setBalance(keyId, BigNumber.from(e.toString()));}}>
        <SliderTrack bg='blue.200'>
          <Box position='relative' right={10} />
          <SliderFilledTrack bg='blue.600'/>
        </SliderTrack>
        <SliderThumb boxSize={10}>
          <Box color='blue'><BiCoinStack size='30px'/></Box>
        </SliderThumb>
      </Slider>
    </Box>
    <Spacer/>
    <Text pt='1.4em'>{balanceDisplay} / {maxBalanceDisplay} {symbol}</Text>
  </HStack>
}

export default Trustees;
