//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  Collapse,
  HStack,
  Flex,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalContent,
  Skeleton,
  Spacer,
  Text,
  VStack,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { BsWallet } from 'react-icons/bs';
import { RiSafeLine } from 'react-icons/ri';
import { HiOutlineKey } from 'react-icons/hi';
import { FcKey } from 'react-icons/fc';
import { KeyInfoIcon } from '../components/KeyInfo.js';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers } from 'ethers';
import { useAccount, useBalance } from 'wagmi';
import { AssetResource } from '../services/AssetResource.js';
import {
  useInspectKey,
  useTrustInfo,
} from '../hooks/LocksmithHooks.js';
import {
  COLLATERAL_PROVIDER,
  useTrustedActorAlias
} from '../hooks/NotaryHooks.js';
import { 
  TRUST_CONTEXT_ID,
  KEY_CONTEXT_ID,
  useContextProviderRegistry,
  useContextArnBalances,
} from '../hooks/LedgerHooks.js';
import { 
  useCoinCapPrice,
  USDFormatter,
} from '../hooks/PriceHooks.js';

//////////////////////////////////////
// Function Component
//////////////////////////////////////
export function TrustArn({rootKeyId, trustId, arn, balance, trustKeys, ...rest}) {
  var asset = AssetResource.getMetadata(arn);
  var assetPrice = useCoinCapPrice([asset.coinCapId]);
  var assetValue = assetPrice.isSuccess ?
    USDFormatter.format(assetPrice.data * ethers.utils.formatEther(balance)) : null;
  var boxColor = useColorModeValue('white', 'gray.800');
  var providerDisclosure = useDisclosure();

  return (
    <Box p='1em' width='90%' 
      borderRadius='lg'
      bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
        <HStack spacing='1em' cursor='pointer' onClick={providerDisclosure.onToggle}>
          {asset.icon()}
          <Text><b>{asset.name}</b>&nbsp;
            <font color='gray'>({asset.symbol})</font>
          </Text>
          <Spacer/>
          <VStack align='stretch' spacing='0em'> 
            <HStack>
              <Spacer/>
              {assetValue ? <Text>{assetValue}</Text> : <Skeleton width='4em' height='1em'/>}
            </HStack>
            <HStack spacing='0em'>
              <Spacer/>
              <Button onClick={providerDisclosure.onToggle} size='sm' variant='ghost' borderRadius='full' p={0}>
                <RiSafeLine size={20}/>
              </Button>
              <Text><font color='gray'>{ethers.utils.formatEther(balance)} {asset.symbol}</font></Text>
            </HStack>
          </VStack>
        </HStack>
        <List width='100%'>
          <Collapse in={providerDisclosure.isOpen} width='100%'>
            <TrustArnProviderList rootKeyId={rootKeyId}
              trustId={trustId} arn={arn} trustKeys={trustKeys}/>
          </Collapse>
        </List>
    </Box>
  )
}

export function TrustArnProviderList({rootKeyId, trustId, arn, trustKeys, ...rest}) {
  const arnProviders = useContextProviderRegistry(TRUST_CONTEXT_ID, trustId, arn);
  const stripeColor = useColorModeValue('gray.100', 'gray.700');

  return (<>
    {!arnProviders.isSuccess && [...Array(2)].map((y,x) => 
      <ListItem key={x} padding='1em' width='100%' bg={x % 2 === 0 ? stripeColor : ''}>
        <HStack spacing='1em'>
          <Skeleton width='10em' height='1em'/>
          <Spacer/>
          <Skeleton width='3em' height='1em'/>
        </HStack>
      </ListItem>)}
    {arnProviders.isSuccess &&
      arnProviders.data.map((provider, x) => (
        <ListItem key={provider} p='1em' width='100%'
          bg={x % 2 === 0 ? stripeColor : ''}>
          <TrustArnProvider rootKeyId={rootKeyId}
            trustId={trustId} arn={arn} provider={provider}
            trustKeys={trustKeys}/>
        </ListItem>
      ))
    }
    </>)
}

export function TrustArnProvider({rootKeyId, trustId, arn, provider, trustKeys, ...rest}) {
  const providerAlias = useTrustedActorAlias(trustId, COLLATERAL_PROVIDER, provider);
  const providerBalance = useContextArnBalances(TRUST_CONTEXT_ID, trustId, [arn], provider);
  const keyBalanceDisclosure = useDisclosure();
  const asset = AssetResource.getMetadata(arn);

  return (<>
    <HStack align='stretch'>
      {!providerAlias.isSuccess && <Skeleton width='8em' height='1em'/>}
      {providerAlias.isSuccess && <> 
        <RiSafeLine size={24}/>
        <Text>{providerAlias.data}</Text></>}
      <Spacer/>
      <Button variant='ghost' size='sm' borderRadius='full' 
        p={0} position='relative' top='-0.25em'
        onClick={keyBalanceDisclosure.onToggle}>
          <HiOutlineKey size='20'/>
      </Button>
      {!providerBalance.isSuccess && <Skeleton width='4em' height='1em'/>}
      {providerBalance.isSuccess && 
        <Text>{ethers.utils.formatEther(providerBalance.data[0])} {asset.symbol}</Text>}
    </HStack>
    <List width='100%'>
      <Collapse in={keyBalanceDisclosure.isOpen} width='100%'>
        {(trustKeys.data || []).map((k,x) => 
          <TrustArnKeyBalance rootKeyId={rootKeyId} asset={asset}
            trustId={trustId} arn={arn} provider={provider}
            keyId={k} key={arn + '-' + k + '-' + provider + x}/>
        )}
      </Collapse>
    </List>
  </>)
}

export function TrustArnKeyBalance({rootKeyId, trustId, arn, provider, keyId, asset, ...rest}) {
  const inspectKey = useInspectKey(keyId);  
  const keyBalance = useContextArnBalances(KEY_CONTEXT_ID, keyId, [arn], provider);

  return inspectKey.isSuccess && keyBalance.isSuccess && keyBalance.data[0] > 0 &&
    <ListItem pt='1em' key={keyId + '-' + arn + '-' + provider} width='100%' fontSize='sm'>
      <HStack>
        {KeyInfoIcon(inspectKey, 20)}
        <Text><i>{inspectKey.data.alias}</i></Text>
        <Spacer/>
        <Text><i>{ethers.utils.formatEther(keyBalance.data.toString())} {asset.symbol}</i></Text>
      </HStack>
    </ListItem>
}

export function DepositFundsModal({rootKeyId, trustId, onClose, isOpen, ...rest}) {
  const rootInspectKey = useInspectKey(rootKeyId);
  const trustInfo = useTrustInfo(trustId);
  const boxColor = useColorModeValue('gray.100','gray.800');

  return <Modal size='xl' onClose={onClose} isOpen={isOpen} isCentered> 
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>Deposit Funds</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Flex>
          <VStack pl='1em' pr='2em'>
            <FcKey size='60px'/>
            {!rootInspectKey.isSuccess ? <Skeleton width='5em' height='1.5em'/> :
              <Text><b>{rootInspectKey.data.alias}</b></Text>}
          </VStack>
          <VStack>
            {!trustInfo.isSuccess ? <Skeleton width='15em' height='1.5em'/> :
              <Text mb='1.2em'>Deposit funds to <b>{trustInfo.data.name}</b> by choosing an asset.</Text>}
              <List width='100%' spacing='1em'>
                {Object.entries(AssetResource.getMetadata()).map((asset) =>
                  <ListItem key={'deposit-' + asset[0]} borderRadius='full'
                    bg={boxColor} cursor='pointer' _hover={{
                      transform: 'scale(1.1)'
                    }} boxShadow='md'>
                    <HStack pr='2em'>
                      {asset[1].icon({size:'50px'})}
                      <Text>{asset[1].name}</Text>
                      <Text fontSize='xs' fontStyle='italic' color='gray'>({asset[1].symbol})</Text>
                      <Spacer/>
                      <BsWallet color='gray'/>
                      <Text><WalletArnBalanceLabel address={asset[1].contractAddress}/></Text>
                    </HStack>
                  </ListItem>
                )}
              </List>
          </VStack>
        </Flex>
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </ModalContent>
  </Modal>
}

const TrustArnBalanceLabel = ({trustId, arn, ...rest}) => {
  const trustArnBalance = useContextArnBalances(TRUST_CONTEXT_ID, trustId, [arn]);

  return !trustArnBalance.isSuccess ? <Skeleton width='4em' height='1.2em'/> :
    <>{ethers.utils.formatEther(trustArnBalance.data[0])}</>
}

const WalletArnBalanceLabel = ({address, ...rest}) => {
  const account = useAccount();
  const balance = useBalance({
    addressOrName: account.address,
    token: address
  });

  return !balance.isSuccess ? <Skeleton width='3em' height='1em'/> :
    <>{balance.data.formatted.match(/.*\.[0-9][0-9]?/)}</>;
}
