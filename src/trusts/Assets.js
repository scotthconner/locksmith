//////////////////////////////////////
// React and UI Components
//////////////////////////////////////
import {
  Box,
  Button,
  Collapse,
  HStack,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  Skeleton,
  Spacer,
  Text,
  VStack,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { RiSafeLine } from 'react-icons/ri';

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { ethers } from 'ethers';
import { AssetResource } from '../services/AssetResource.js';
import {
  COLLATERAL_PROVIDER,
  useTrustedActorAlias
} from '../hooks/NotaryHooks.js';
import { 
  TRUST_CONTEXT_ID,
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
export function TrustArn({rootKeyId, trustId, arn, balance, ...rest}) {
  var asset = AssetResource.getMetadata(arn);
  var assetPrice = useCoinCapPrice(asset.coinCapId);
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
        <HStack spacing='1em'>
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
                <RiSafeLine/>
              </Button>
              <Text><font color='gray'>{ethers.utils.formatEther(balance)} {asset.symbol}</font></Text>
            </HStack>
          </VStack>
        </HStack>
        <List width='100%'>
          <Collapse in={providerDisclosure.isOpen} width='100%'>
            <TrustArnProviderList rootKeyId={rootKeyId}
              trustId={trustId} arn={arn}/>
          </Collapse>
        </List>
    </Box>
  )
}

export function TrustArnProviderList({rootKeyId, trustId, arn, ...rest}) {
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
            trustId={trustId} arn={arn} provider={provider}/>
        </ListItem>
      ))
    }
    </>)
}

export function TrustArnProvider({rootKeyId, trustId, arn, provider, ...rest}) {
  const providerAlias = useTrustedActorAlias(trustId, COLLATERAL_PROVIDER, provider);
  const providerBalance = useContextArnBalances(TRUST_CONTEXT_ID, trustId, [arn], provider);
  var asset = AssetResource.getMetadata(arn);

  return (<HStack align='stretch'>
    {!providerAlias.isSuccess && <Skeleton width='8em' height='1em'/>}
    {providerAlias.isSuccess && <> 
      <RiSafeLine size={24}/>
      <Text>{providerAlias.data}</Text></>}
    <Spacer/>
    {!providerBalance.isSuccess && <Skeleton width='4em' height='1em'/>}
    {providerBalance.isSuccess && 
      <Text>{ethers.utils.formatEther(providerBalance.data[0])} {asset.symbol}</Text>}
  </HStack>)
}
