import {
  Box,
  Button,
  Collapse,
  Input,
  InputGroup,
  InputRightElement,
  ListIcon,
  ListItem,
  FormControl,
  FormLabel,
  FormErrorMessage,
  HStack,
  List,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalContent,
  NumberInput,
  NumberInputField,
  Select,
  Skeleton,
  Spacer,
  Text,
  Tooltip,
  VStack,
  UnorderedList,
  useDisclosure,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ethers } from 'ethers';
import DatePicker from "react-datepicker";
import Locksmith from '../services/Locksmith.js';
import { AssetResource } from '../services/AssetResource.js';

// icons
import { 
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineCreditCard,
  AiOutlineNumber,
} from 'react-icons/ai';
import { GrMoney } from 'react-icons/gr';
import { BsTrash } from 'react-icons/bs';
import { HiOutlineLightningBolt } from 'react-icons/hi';

// Hooks
import { 
  useInspectKey,
  useTrustKeys,
} from '../hooks/LocksmithHooks.js';
import { 
  useTrustEventRegistry,
} from '../hooks/TrustEventLogHooks.js';
import {
  TRUST_CONTEXT_ID,
  useContextProviderRegistry
} from '../hooks/LedgerHooks.js';
import {
  useAllowance,
  mapAllowanceData,
  useCreateAllowance,
  useSetTrancheCount,
  useRemoveAllowance,
} from '../hooks/AllowanceHooks.js';

// hook components
import {
  TrustKeyOption
} from './Events.js';
import {
  TrustEventOption,
  SelectedTrustEvent,
  PolicyEventList,
  PolicyFiredEventCount,
  PolicyActivationTag,
} from './Policies.js';
import {
  ProviderOption
} from '../Inbox.js';
import { KeyLabel } from '../components/KeyInfo.js';
import { TrustedActorAlias } from '../components/Notary.js'; 
import { secondsToUnits } from '../components/AlarmClock.js';
import {
  AllowanceName
} from '../components/Allowance.js';

export function TrustAllowance({trustId, allowanceId, hasRoot, ...rest}) {
	var boxColor = useColorModeValue('white', 'gray.800');
	const toast = useToast();
    const eventsDisclosure = useDisclosure();
    const entitlementDisclosure = useDisclosure();
    const scheduleDisclosure = useDisclosure();
    const allowance = useAllowance(allowanceId);
    const allowanceObject = mapAllowanceData(allowance.data);
    const removePolicy = useRemoveAllowance(allowanceId, 
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
          title: 'Recurring Payment Removed!',
          description: 'This recurring payment has been deleted.',
          status: 'success',
          duration: 9000,
          isClosable: true
        });
      }
    );

    const removeProps = removePolicy.isLoading ? {isLoading: true} : {};

    return <Box p='1em' width='90%' 
      borderRadius='lg' bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
      <HStack spacing='1em'>
        <AiOutlineCreditCard size='30px'/>
        <VStack align='stretch' spacing='0'>
          <HStack>
            <AllowanceName allowanceObject={allowanceObject} fontWeight='bold'/>
            <PolicyActivationTag activated={allowanceObject.enabled}/>
          </HStack>
          <HStack>
            <Text fontSize='sm'>Payment goes to</Text>
            { allowance.isSuccess ? <KeyLabel keyId={allowanceObject.recipientKeyId}/> :
              <Skeleton width='6em' height='1em'/> }
          </HStack>
        </VStack>
        <Spacer/>
        { (allowanceObject.requiredEvents || []).length > 0 && <Tooltip label='Required Events'>
          <Button size='sm' leftIcon={<HiOutlineLightningBolt/>}
            onClick={() => { scheduleDisclosure.onClose(); eventsDisclosure.onToggle(); entitlementDisclosure.onClose();}}>
              <PolicyFiredEventCount events={allowanceObject.requiredEvents || []} position={0} total={0}/> / {(allowanceObject.requiredEvents||[]).length}
          </Button>
        </Tooltip> }
        <Tooltip label='Schedule'>
          <Button size='sm' leftIcon={<AiOutlineCalendar/>}
            onClick={() => { scheduleDisclosure.onToggle(); eventsDisclosure.onClose(); entitlementDisclosure.onClose();}}>
            {allowanceObject.remainingTrancheCount ? allowanceObject.remainingTrancheCount.toString() : <Skeleton width='1em' height='1em'/>}
          </Button>
        </Tooltip>
        <Tooltip label='Payment'>
          <Button size='sm' leftIcon={<GrMoney/>}
            onClick={() => {scheduleDisclosure.onClose(); eventsDisclosure.onClose(); entitlementDisclosure.onToggle();}}>
            {allowanceObject.entitlements ? allowanceObject.entitlements.length : <Skeleton width='1em' height='1em'/>}
          </Button>
        </Tooltip>
        { <Tooltip label='Remove Policy'>
          <Button {...removeProps} isDisabled={!hasRoot} colorScheme='red' size='sm'
            onClick={() => {removePolicy.write?.();}}><BsTrash/></Button>
        </Tooltip> }
      </HStack>
      <List width='100%' spacing='1em' mt={eventsDisclosure.isOpen ? '1em' : '0'}>
        <Collapse width='100%' in={eventsDisclosure.isOpen}>
          { allowance.isSuccess && <PolicyEventList keyId={allowanceId} events={allowanceObject.requiredEvents}/> }
        </Collapse>
      </List>
      <Collapse width='100%' in={entitlementDisclosure.isOpen}>
        { allowance.isSuccess && <EntitlementList trustId={trustId} entitlements={allowanceObject.entitlements}/> } 
      </Collapse>
      <Collapse width='100%' in={scheduleDisclosure.isOpen}>
        { allowance.isSuccess && <PaymentScheduleDetail allowanceObject={allowanceObject} 
          allowanceId={allowanceId} hasRoot={hasRoot}/> }
      </Collapse>
    </Box>
}

export function PaymentScheduleDetail({allowanceId, allowanceObject, hasRoot, ...rest}) {
  const trancheDisclosure = useDisclosure();

  return <List spacing='0.5em' mt='1em'>
    <ListItem>
      <ListIcon as={AiOutlineCalendar}/>
      Next payment on: <b>{new Date(allowanceObject.nextVestTime).toDateString()}</b>
    </ListItem>
    <ListItem>
      <ListIcon as={AiOutlineClockCircle}/>
      With payments every: <b>{secondsToUnits(allowanceObject.vestingInterval)}</b>
    </ListItem>
    <ListItem>
      <ListIcon as={AiOutlineNumber}/>
      With <b>{allowanceObject.remainingTrancheCount.toString()}</b> remaining payments.
      <Button isDisabled={!hasRoot} size='sm' ml='1em'
        onClick={trancheDisclosure.onOpen}>Change This</Button>
      <ChangeTrancheDialog allowanceId={allowanceId} allowanceObject={allowanceObject}
        disclosure={trancheDisclosure}/>
    </ListItem>
  </List>
}

export function ChangeTrancheDialog({allowanceId, allowanceObject, disclosure, ...rest}) {
  const [trancheCount, setTrancheCount]  = useState(allowanceObject.remainingTrancheCount);
  const toast = useToast();
  const hasError = trancheCount === '';

  const writeTrancheCount = useSetTrancheCount(allowanceId, trancheCount,
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
          title: 'Recurring Payment Updated!',
          description: 'There are now ' + trancheCount + ' payments scheduled.',
          status: 'success',
          duration: 9000,
          isClosable: true
        });
        disclosure.onClose();
      }
    );
  return <Modal onClose={disclosure.onClose} isOpen={disclosure.isOpen} isCentered size='xl'>
    <ModalOverlay backdropFilter='blur(10px)'/>
    <ModalContent>
      <ModalHeader>{allowanceObject.allowanceName}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl isInvalid={hasError}>
          <FormLabel>Remaining Payments</FormLabel>
          <NumberInput defaultValue={trancheCount} min={0} precision={0} step={1}>
            <NumberInputField width='6em' onChange={(e) => {
              setTrancheCount(e.target.value);
            }}/>
          </NumberInput>
        </FormControl>
      </ModalBody>
      <ModalFooter>
        <Button mr='1em' onClick={disclosure.onClose}>Cancel</Button>
        <Button isLoading={writeTrancheCount.isLoading} isDisabled={hasError} colorScheme='blue'
          onClick={() => {writeTrancheCount.write?.(); }}>Save</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
}

export function EntitlementList({trustId, entitlements, ...rest}) {
  const stripeColor = useColorModeValue('gray.100', 'gray.700');
  return <VStack mt='1em' align='stretch'>
    { entitlements.map((e,x) => <HStack p='1em' key={'entitlement-review-'+x} bg={x%2===0 ? stripeColor : ''}>
      {AssetResource.getMetadata(e.arn).icon({size: '24px'})}
      <Text>{ethers.utils.formatUnits(e.amount, AssetResource.getMetadata(e.arn).decimals)} {AssetResource.getMetadata(e.arn).symbol} from</Text>
      <KeyLabel keyId={e.sourceKey}/>
      <Text>at</Text>
      <TrustedActorAlias trustId={trustId} role={0} address={e.provider} fontWeight='bold'/>
    </HStack>) }
  </VStack>
}

export function AddAllowanceDialog({trustId, rootKeyId, onClose, isOpen, ...rest}) {
  const assets = AssetResource.getMetadata();
  const toast = useToast();
  const keys = useTrustKeys(trustId);
  const events = useTrustEventRegistry(trustId);
  const entitlementsDisclosure = useDisclosure();
  const scheduleDisclosure = useDisclosure();
  const eventsDisclosure = useDisclosure();
  const nameDisclosure = useDisclosure();
  const reviewDisclosure = useDisclosure(); 
  const [recipientKey, setRecipientKey] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [firstVestTime, setFirstVestTime] = useState(new Date((new Date().getTime()))); // today
  const [vestInterval, setVestInterval] = useState(0);
  const [vestUnits, setVestUnits] = useState(60*60*24);
  const [trancheCount, setTrancheCount] = useState(0);
  const [eventHashes, setEventHashes] = useState([]);
  const [paymentName, setPaymentName] = useState('');
  const recipientKeyInfo = useInspectKey(recipientKey);

  const isKeyError = !recipientKey || recipientKey === 'Choose Key';
  const hasEntitlementError = entitlements.filter((e) => 
    e.provider === null || parseFloat(e.amount) === 0 || e.sourceKey === null 
  ).length > 0;
  const hasPaymentPeriodError = parseFloat(vestInterval) <= 0;
  const hasTrancheCountError = parseInt(trancheCount) <= 0;
  const hasNameError = paymentName.length < 1;

  const addEntitlement = function(arn) {
    if (arn.length < 1) { return; }
    setEntitlements([entitlements, {
      sourceKey: null,
      arn:  arn,
      provider: null,
      amount: 0,
    }].flat());
  };

  const cleanUp = function() {
    eventsDisclosure.onClose();
    entitlementsDisclosure.onClose();
    scheduleDisclosure.onClose();
    reviewDisclosure.onClose();
    setRecipientKey(null);
    setEventHashes([]);
    setEntitlements([]);
    setFirstVestTime(new Date((new Date().getTime())));
    setVestInterval(0);
    setTrancheCount(0);
    setPaymentName('');
    onClose();
  };

  const createAllowance = useCreateAllowance(rootKeyId, paymentName, recipientKey, trancheCount, 
    parseInt(vestInterval) * parseInt(vestUnits), Math.floor(firstVestTime.getTime()/1000), entitlements, eventHashes,
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
        title: 'Recurring Payment created!',
        description: 'This distribution rule has been saved.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      cleanUp();
    });

  const recipientReview = recipientKey && <HStack>
    <Text>You're setting up a recurring payment to </Text>
    <KeyLabel keyId={recipientKey} fontWeight='bold'/>
  </HStack>

  const entitlementReview = !entitlementsDisclosure.isOpen && <VStack mt='1em' align='stretch'>
    <Text>With the following asset payments:</Text>
    { entitlements.map((e,x) => <HStack key={'entitlement-review-'+x}> 
      {AssetResource.getMetadata(e.arn).icon()}
      <Text>{ethers.utils.formatUnits(e.amount, AssetResource.getMetadata(e.arn).decimals)} {AssetResource.getMetadata(e.arn).symbol} from</Text>
      <KeyLabel keyId={e.sourceKey}/>
      <Text>at</Text>
      <TrustedActorAlias trustId={trustId} role={0} address={e.provider} fontWeight='bold'/>
    </HStack>) }
  </VStack>

  const scheduleReview = <VStack mt='1em' align='stretch'>
    <Text>And the following payment schedule:</Text>
    <UnorderedList spacing='0.5em'>
      <ListItem>
        <ListIcon as={AiOutlineCalendar}/>
        First payment on: <b>{firstVestTime.toDateString()}</b>
      </ListItem>
      <ListItem>
        <ListIcon as={AiOutlineClockCircle}/>
        With payments every: <b>{secondsToUnits(parseFloat(vestInterval) * parseInt(vestUnits))}</b>
      </ListItem>
      <ListItem>
        <ListIcon as={AiOutlineNumber}/>
        For <b>{trancheCount}</b> total payments.
      </ListItem>
    </UnorderedList>
  </VStack>
  const eventReview = eventHashes.length > 0 && <VStack mt='1em' align='stretch' spacing='1em'>
    <Text>But only after:</Text>
    { eventHashes.map((h) =>
      <SelectedTrustEvent hideRemove={true} eventHash={h}
        key={'selected-trust-event-' + h}/>)}
  </VStack>

  const nameReview = <Text mt='1em'>This payment is called: <b>{paymentName}</b></Text>

  const buttonProps = isKeyError ? {isDisabled: true} : {};
  const entitlementProps = entitlements.length < 1 || hasEntitlementError ? {isDisabled: true} : {};
  const scheduleProps = hasPaymentPeriodError || hasTrancheCountError ? {isDisabled: true} : {}; 
  const nameProps = hasNameError ? {isDisabled: true} : {};
  const allowanceButtonProps = createAllowance.isLoading ? {isLoading: true} : {};

  return <Modal onClose={cleanUp} isOpen={isOpen} isCentered size='xl'>
      <ModalOverlay backdropFilter='blur(10px)'/>
      <ModalContent>
        <ModalHeader>Create Recurring Payment Policy</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Collapse in={!nameDisclosure.isOpen && !scheduleDisclosure.isOpen && !eventsDisclosure.isOpen && !entitlementsDisclosure.isOpen && !reviewDisclosure.isOpen}>
            <Text>You can enable a <b>recipient key</b> to take funds from <b>source keys</b> on a <b>recurring basis</b>. You can restrict the ability to take assets until certain <b>event conditions</b> are met.</Text> 
            <Text mt='1em'>First, pick a <b>recipient key</b> to give a recurring allowance.</Text>
            <FormControl mt='2em' isInvalid={isKeyError}>
              <FormLabel>Recipient Key</FormLabel>
              <Select placeholder='Choose Key' variant='filled'
                onChange={(e) => { setRecipientKey(e.target.value) }}>
                {keys.isSuccess && 
                  keys.data.map((k) => <TrustKeyOption key={'select-option-key' + k} keyId={k}/>)}
              </Select>
              { isKeyError && <FormErrorMessage>Which key do you want to give an allowance to?</FormErrorMessage>}
            </FormControl>
          </Collapse>
          <Collapse in={entitlementsDisclosure.isOpen}>
            { recipientReview }
            { eventReview }
            <FormControl mt='1em'>
              <FormLabel>Choose Recurring Payments</FormLabel>
              <Select placeholder='Add Asset' variant='filled'
                onChange={(e) => { addEntitlement(e.target.value); e.target.value='';}}>
                { Object.keys(assets).map((arn) => <option value={arn} key={arn}>{assets[arn].name}</option>) }
              </Select>
              { entitlements.map((e,x) => 
                <AddedEntitlement trustId={trustId} keys={keys} recipientKey={recipientKey} entitlement={e}
                  key={'entitlement-' + x}
                  setSourceKey={(key) => {
                    entitlements[x].sourceKey = key;
                    setEntitlements([...entitlements].flat());
                  }}
                  setProvider={(provider) => {
                    entitlements[x].provider = provider;
                    setEntitlements([...entitlements].flat());
                  }}
                  setAmount={(amount) => {
                    entitlements[x].amount = amount;
                    setEntitlements([...entitlements].flat());
                  }}
                  removeMe={() => {
                    var e = [...entitlements].flat();
                    e.splice(x,1);
                    setEntitlements(e);
                  }}
              />) } 
            </FormControl>
          </Collapse>
          <Collapse in={scheduleDisclosure.isOpen}>
            { recipientReview }
            { entitlementReview }
              <FormControl mt='2em'>
                <FormLabel>First Payment Date</FormLabel>
                <DatePicker selected={firstVestTime} onChange={(date) => setFirstVestTime(date)}
                  popperModifiers={[{
                    name: "preventOverflow",
                    options: {
                      altAxis: true,
                    }
                  }]}/>
              </FormControl>
              <FormControl mt='1em' isInvalid={hasPaymentPeriodError}>
                <FormLabel>Payment Period</FormLabel>
                <HStack>
                  <NumberInput defaultValue={0} min={0} precision={0} step={1}>
                    <NumberInputField width='6em'
                      onChange={(e) => { setVestInterval(e.target.value); }}/>
                  </NumberInput>
                  <Select variant='filled'
                    width='20%'
                    onChange={(e) => { setVestUnits(e.target.value); }}>
                    <option value={60*60*24}>Days</option>
                    <option value={60*60*24*7}>Weeks</option>
                    <option value={60*60*24*365}>Years</option>
                  </Select>
                </HStack>
              </FormControl>
              <FormControl mt='1em' isInvalid={hasTrancheCountError}>
                <FormLabel>Number of Payments</FormLabel>
                <NumberInput defaultValue={0} precision={0} step={1}>
                    <NumberInputField width='6em'
                      onChange={(e) => { setTrancheCount(e.target.value); }}/>
                </NumberInput>
              </FormControl>
          </Collapse>
          <Collapse in={eventsDisclosure.isOpen}>
            { recipientReview }
            { entitlementReview }
            { scheduleReview }
            <FormControl mt='2em'>
              <FormLabel>Required Events for Enablement</FormLabel>
              <Select placeholder='Choose Event' variant='filled'
                onChange={(e) => {
                  setEventHashes([eventHashes, e.target.value].flat()); 
                }}>
                  {events.isSuccess &&
                    events.data.map((e) => !eventHashes.includes(e) && 
                      <TrustEventOption key={'select-event-hash-' + e} eventHash={e}/>)}
              </Select>
            </FormControl>
            <VStack mt='2em' align='stretch' spacing='1em'>
            { eventHashes.map((h) => 
              <SelectedTrustEvent eventHash={h} key={'selected-trust-event-' + h}
                removeMe={() => {
                  setEventHashes(eventHashes.filter(function(eh) {
                    return eh !== h;
                  }));
                }}/> ) }
            </VStack>
          </Collapse>
          <Collapse in={nameDisclosure.isOpen}>
            { recipientReview }
            { entitlementReview }
            { scheduleReview }
            { eventReview }
            <FormControl mt='1em' isInvalid={hasNameError} mb={hasNameError ? '' : '1.6em'}>
              <FormLabel>Payment Label</FormLabel>
              <Input
                placeholder="My Bankless Subscription"
                _placeholder={{ color: 'gray.500' }}
                onChange={(e) => {setPaymentName(e.target.value);}}/>
              { hasNameError && <FormErrorMessage>Please provide a short description.</FormErrorMessage>}
            </FormControl>
          </Collapse>
          <Collapse in={reviewDisclosure.isOpen}>
            { recipientReview }
            { entitlementReview }
            { scheduleReview }
            { eventReview }
            { nameReview }
          </Collapse>
        </ModalBody>
        <ModalFooter>
          {!nameDisclosure.isOpen && !scheduleDisclosure.isOpen && !eventsDisclosure.isOpen && !entitlementsDisclosure.isOpen && !reviewDisclosure.isOpen && 
            <Button {... buttonProps} colorScheme='blue'
              onClick={entitlementsDisclosure.onOpen}>
              Pay {recipientKeyInfo.isSuccess && recipientKeyInfo.data && 
                ("'" + recipientKeyInfo.data.alias + "'") }
            </Button> }
          { entitlementsDisclosure.isOpen &&
            <HStack>
              <Button onClick={() => {
                  entitlementsDisclosure.onClose();
                }} colorScheme='gray'>Back</Button>
              <Button {... entitlementProps} colorScheme='blue'
                onClick={() => {scheduleDisclosure.onOpen(); entitlementsDisclosure.onClose();}}>
                    Choose {entitlements.length} {entitlements.length !== 1 ? 'Assets' : 'Asset'}</Button> 
            </HStack> }
          { scheduleDisclosure.isOpen &&
            <HStack>
              <Button onClick={() => {
                  scheduleDisclosure.onClose(); entitlementsDisclosure.onOpen();
                }} colorScheme='gray'>Back</Button>
              <Button {... scheduleProps} colorScheme='blue'
                onClick={() => {eventsDisclosure.onOpen(); scheduleDisclosure.onClose();}}>
                    Use Schedule</Button>
            </HStack> }
          { eventsDisclosure.isOpen && 
            <HStack spacing='1em'>
              <Button onClick={() => {eventsDisclosure.onClose(); scheduleDisclosure.onOpen();}} colorScheme='gray'>Back</Button>
              <Button onClick={() => {nameDisclosure.onOpen(); eventsDisclosure.onClose(); }}
                colorScheme='blue'>
                Require {eventHashes.length} Events
              </Button>
            </HStack> }
          { nameDisclosure.isOpen &&
            <HStack spacing='1em'>
              <Button onClick={() => {nameDisclosure.onClose(); eventsDisclosure.onOpen();}} colorScheme='gray'>Back</Button>
              <Button {...nameProps} onClick={() => {reviewDisclosure.onOpen(); nameDisclosure.onClose(); }}
                colorScheme='blue'>
                Use Name 
              </Button>
            </HStack> }
          { reviewDisclosure.isOpen && 
            <HStack spacing='1em'>
              <Button onClick={() => {
                  reviewDisclosure.onClose();
                  eventsDisclosure.onOpen();
                }} colorScheme='gray'>Back</Button>
              <Button onClick={() => { createAllowance.write?.(); }}
                {... allowanceButtonProps} colorScheme='yellow'
                leftIcon={<AiOutlineCreditCard/>}>Create Recurring Payment</Button>
            </HStack>
          }
        </ModalFooter>
      </ModalContent>
   </Modal>
}

export function AddedEntitlement({trustId, entitlement, keys, recipientKey, setSourceKey, setProvider, setAmount, removeMe, hideRemove, ...rest}) {
  const asset = AssetResource.getMetadata(entitlement.arn);
  const providers = useContextProviderRegistry(TRUST_CONTEXT_ID, trustId); 

  return keys.isSuccess && 
    <HStack mt='1em'>
      {asset.icon()}
      <FormControl width='22%' isInvalid={parseFloat(entitlement.amount) <= 0}>
        <InputGroup size='md'>
          <Input type='number' placeholder='0.0' onChange={(e) => {
            setAmount(e.target.value.length === 0 ? '0' : ethers.utils.parseUnits(e.target.value, asset.decimals));
          }}/>
          <InputRightElement>
            <Text type='number' fontSize='0.7em' color='gray'>{asset.symbol}</Text>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl width='25%' isInvalid={entitlement.sourceKey === null}>
        <Select placeholder='From Key' variant='filled'
          onChange={(e) => { setSourceKey(e.target.value === '' ? null : e.target.value);}}>
            {keys.isSuccess && keys.data.filter((k) => k.toString() !== (recipientKey||'').toString())
              .map((k) => <TrustKeyOption key={'select-option-key' + k} keyId={k}/>)}
        </Select>
      </FormControl>
      <FormControl width='35%' isInvalid={entitlement.provider === null}>
        <Select placeholder='From Provider' variant='filled'
          onChange={(e) => { setProvider(e.target.value === '' ? null : e.target.value); }}>
          { providers.isSuccess && providers.data.map((p) =>
            <ProviderOption keyId={entitlement.sourceKey} key={'provider-option-' + p} 
              keyInfo={{trustId: trustId}} provider={p} arn={entitlement.arn}/>) }
        </Select>
      </FormControl>
      <Button colorScheme='red' size='sm' onClick={() => {removeMe();}}><BsTrash/></Button>
    </HStack>
}
