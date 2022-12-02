import {
  Box,
  Button,
  Center,
  Checkbox,
  Collapse,
  Heading,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  List,
  ListItem,
  Progress,
  Skeleton,
  Spacer,
  Stack,
  Switch,
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
  Tooltip,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import {
  useState,
  useRef,
} from 'react';
import { ethers } from 'ethers';

import { AiOutlineWallet } from 'react-icons/ai';
import { BiGhost } from 'react-icons/bi';
import { BsTrash } from 'react-icons/bs';
import { FcKey } from 'react-icons/fc';
import { HiOutlineKey } from 'react-icons/hi';
import { IoIosAdd } from 'react-icons/io';

export function TrustWizard({...rest}) {
  const [step, setStep] = useState(0);
  const [buttonLabel, setButtonLabel] = useState('Next');

  // Step 0: Setting Trust Name
  const trustNameDisclosure = useDisclosure();
  const [trustName, setTrustName] = useState('');
  const [hasError, setHasError] = useState(false);
  const isError = trustName.length < 1 || hasError;

  // Step 1: Setting up Beneficiaries
  const keyDisclosure = useDisclosure();
  const [beneficiaries, setBeneficiaries] = useState([]);

  // Step 2: Setting up a trustee, or creating trust.
  const trusteeQuestionDisclosure = useDisclosure();
  const [trusteeName, setTrusteeName] = useState('');

  // Step 3: Setting up a deadman switch, or creating a trust. 
  const deadmanDisclosure = useDisclosure();
  const [deadmanConfig, setDeadmanConfig] = useState({
    alarmTime: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // one year
    snoozeIntervalUnit: 60 * 60 * 24, // day
    snoozeUnitCount: 1
  });

  // Step 4: Review Trust Creation
  const reviewDisclosure = useDisclosure();

  // Step Processing
  const stepDisclosures = [
    trustNameDisclosure,
    keyDisclosure,
    trusteeQuestionDisclosure,
    deadmanDisclosure,
    reviewDisclosure,
  ];

  const changeStep = function(stepNumber) {
    stepDisclosures[step].onClose();
    stepDisclosures[stepNumber].onOpen();
    setStep(stepNumber);
  }

  return <Stack spacing='1em'>
    <Stack spacing='1em' mb='3em'>
      <Heading size='lg'>Design Your Trust</Heading>
      <Text fontSize='xl'>Use the Locksmith key system to secure your assets <i>without</i> sharing your private key in just a few quick steps.</Text>
      <Text fontSize='xl'>You will get a set of NFT keys, a vault to store your ether and ERC20s, and an optional trustee and deadman switch. You can re-configure your trust at any time.</Text>
    </Stack>
    <Center><Progress hasStripe value={20 * (step + 1)} width='60%'/></Center>
    <Collapse in={(trustName.length === 0) || step === 0 || trustNameDisclosure.isOpen}>
      <SetTrustName trustName={trustName} setTrustName={setTrustName} isError={isError}/>
    </Collapse>
    <Collapse in={!trustNameDisclosure.isOpen && step > 0}>
      <VStack><ReviewTrustName trustName={trustName}/></VStack>
    </Collapse>
    <Collapse in={step > 1}>
      <VStack><ReviewBeneficiaries beneficiaries={beneficiaries} goBack={
        () => { changeStep(step-1); }
      }/></VStack>
    </Collapse>
    <Collapse in={keyDisclosure.isOpen}>
      <CreateBeneficiaries trustName={trustName} beneficiaries={beneficiaries} setBeneficiaries={setBeneficiaries} 
        setButtonLabel={setButtonLabel} setHasError={setHasError}/> 
    </Collapse>
    <Collapse in={trusteeQuestionDisclosure.isOpen && beneficiaries.length > 0}>
      <SetTrusteeNameQuestion trusteeName={trusteeName} setTrusteeName={setTrusteeName} setHasError={setHasError}
        buttonLabel={buttonLabel} setButtonLabel={setButtonLabel}/>
    </Collapse>
    <Collapse in={deadmanDisclosure.isOpen}>
      Deadman Disclosure
    </Collapse>
    <Collapse in={reviewDisclosure.isOpen}>
      Review Disclosure
    </Collapse>
    { !(step > 1 && beneficiaries.length === 0) && <HStack pr='3em'>
      <Spacer/>
      { step > 0 && <Button size='lg' onClick={() => changeStep(step-1)}>Previous</Button> } 
      <Button colorScheme='blue' {... isError ? {isDisabled: true} : {}} size='lg' onClick={() => changeStep(step+1)}>{buttonLabel}</Button>
    </HStack> }
  </Stack>
}

const SetTrustName = ({trustName, setTrustName, isError}) => {
  return <FormControl p='3em' id="trustName" isInvalid={isError}>
    <VStack>
      <FormLabel>Let's start with the name of your Key Ring.</FormLabel>
      <Input
        size='lg'
        fontSize='2xl'
        width='16em'
        value={trustName}
        placeholder="My Living Trust"
        _placeholder={{ color: 'gray.500' }}
        onChange={(e) => {
          if (e.target.value.length < 32) {
            setTrustName(e.target.value)
          }
        }}
      />
      { isError ?
        <FormErrorMessage>Ring name can't be empty</FormErrorMessage> :
        <FormHelperText>Name the trust that will control all of your permissions.</FormHelperText>
      }
    </VStack>
  </FormControl>
}

const ReviewTrustName = ({trustName}) => {
  return <HStack mt='3em'>
    <Text fontSize='xl'>Ok, so you've named your Trust Ring <b>{trustName}</b>. A </Text>
    <FcKey/>
    <Text fontSize='xl'><b>root</b> key will be minted into your wallet.</Text>
  </HStack>
}

const ReviewBeneficiaries = ({beneficiaries, goBack}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  return beneficiaries.length < 1 ? <VStack spacing='2em'>
      <Text fontSize='xl'>And you've chosen not to create any other keys for now.</Text>
      <HStack>
        <Button onClick={goBack} leftIcon={<IoIosAdd/>}>Add Keys</Button>
        <Button colorScheme='yellow' leftIcon={<HiOutlineKey/>}>Mint Root Key</Button>
      </HStack>
  </VStack> :
  <VStack>
    <Text fontSize='xl'>And with the following beneficiary keys:</Text>
    <Wrap spacing='3em' p='3em'>
      { beneficiaries.map((b,x) => <WrapItem key={'bwi' + x} p='1em' 
        height='12em' width='10em' bg={boxColor} borderRadius='2xl' boxShadow='dark-lg'>
        <VStack>
          <Center w='8em'><Text fontWeight='bold'>{b.alias}</Text></Center>
          <HiOutlineKey size='56px'/>
          { b.sendToRoot && <Tag variant='subtle' colorScheme='yellow'>
            <TagLeftIcon boxSize='12px' as={AiOutlineWallet} />
            <TagLabel>(you)</TagLabel>
          </Tag> }
          { !b.sendToRoot && <Tooltip label={b.destination}>
            <Tag variant='subtle' colorScheme='blue'>
              <TagLeftIcon boxSize='12px' as={AiOutlineWallet} />
              <TagLabel>{b.destination.substring(0,5) + '...' + b.destination.substring(b.destination.length - 3)}</TagLabel>
            </Tag> 
          </Tooltip>}
          { b.soulbind && <Tag variant='subtle' colorScheme='purple'>
            <TagLeftIcon boxSize='12px' as={BiGhost}/>
            <TagLabel>Soulbound</TagLabel>
          </Tag> }
        </VStack>
      </WrapItem>)}
    </Wrap>
  </VStack>
}

const CreateBeneficiaries = ({trustName, beneficiaries, setBeneficiaries, setButtonLabel, setHasError}) => {
  const boxColor = useColorModeValue('white', 'gray.800');

  const addKey = function() {
    setBeneficiaries([...beneficiaries, {
      alias: 'Beneficiary #' + (beneficiaries.length + 1),
      destination: '',
      sendToRoot: true,
      soulbind: false,
    }]);
  };

  const setBeneficiaryKeyName = function(index, alias) {
    var newSet = [...beneficiaries];
    newSet[index].alias = alias;
    setBeneficiaries(newSet);
    calculateErrors(newSet);
  }
 
  const setSoulbind = function(index, soulbind) {
    var newSet = [...beneficiaries];
    newSet[index].soulbind = soulbind;
    setBeneficiaries(newSet);
  }

  const setBeneficiaryKeyAddress = function(index, destination) {
    var newSet = [...beneficiaries];
    newSet[index].destination = destination;
    setBeneficiaries(newSet);
    calculateErrors(newSet);
  }

  const setSendToRoot = function(index, sendToRoot) {
    var newSet = [...beneficiaries];
    newSet[index].sendToRoot = sendToRoot;
    setBeneficiaries(newSet);
    calculateErrors(newSet);
  }

  const removeKey = function(index) {
    var newSet = [...beneficiaries];
    newSet.splice(index, 1);
    setBeneficiaries(newSet);
    calculateErrors(newSet);
  }

  // determine if we have an error
  // this overly clever and wasteful piece of code validates every
  // beneficiary in bulk against some hard coded requirements that
  // hopefully match the individual form controls.
  const calculateErrors = function(bens) {
    setHasError(bens.length != 
      bens.filter(
        (b) => (b.sendToRoot || ethers.utils.isAddress(b.destination)) && b.alias.length > 0)
          .length);
  };

  return <VStack spacing='2em' mt='2em'>
    <Text fontSize='xl'>Next, name some beneficiaries - and where to send their Trust Key.</Text>
    <List spacing='3em'>
      { beneficiaries.map((b, x) => 
        <ListItem key={'bli-' + x} p='2em' bg={boxColor} borderRadius='2xl' boxShadow='dark-lg' width='30em'>
          <HStack>
            <Spacer/>
          </HStack>
          <FormControl id={'keyname-' + x} isInvalid={b.alias.length < 1}>
            <Button pos='absolute' right='-1em' top='-1em' onClick={() => removeKey(x)} size='sm' variant='ghost'><BsTrash/></Button>
            <FormLabel>Key Name:</FormLabel>
            <Input size='lg' fontSize='lg' 
              placeholder="Rebecca" _placeholder={{ color: 'gray.500' }}
              value={b.alias}
              onChange={(e) => {
                if (e.target.value.length < 32) {
                  setBeneficiaryKeyName(x, e.target.value);
                }
              }}/>
            { b.alias.length < 1 && <FormErrorMessage>Your key name shouldn't be empty.</FormErrorMessage> } 
          </FormControl>
          <FormControl id={'address-' + x} isInvalid={ !ethers.utils.isAddress(b.destination)}>
            { !b.sendToRoot && <FormLabel mt='1em'>Key Destination Address:</FormLabel> }
            { !b.sendToRoot && <Input size='lg' fontSize='sm' 
                placeholder="0xDEADBEEF" _placeholder={{ color: 'gray.500' }}
                value={b.destination}
                onChange={(e) => {
                    setBeneficiaryKeyAddress(x, e.target.value);
                }}/>
            }
            { !b.sendToRoot && !ethers.utils.isAddress(b.destination) && <FormErrorMessage>You need a valid ethereum address.</FormErrorMessage> } 
          </FormControl>
          <HStack mt='1em'>
            <Checkbox
              isChecked={b.sendToRoot}
              onChange={(e) => setSendToRoot(x, e.target.checked)}
              size='md'>Send to me for now</Checkbox>
          </HStack>
          <HStack mt='1em'>
            <FormLabel>Do you want to <b>soulbind</b> this key?</FormLabel>
            <Spacer/>
            <Switch colorScheme='purple' size='lg'
              onChange={(e) => {setSoulbind(x, e.target.checked);}}/>
          </HStack>
        </ListItem>
      ) }
    </List>
    <Button leftIcon={<IoIosAdd/>} onClick={addKey}>Add Beneficiary</Button>
    <HStack width='100%' pr='3em'>
      <Spacer/>
      <Text fontSize='md'>Click next to use <b>{beneficiaries.length}</b> beneficiary keys.</Text>
    </HStack>
  </VStack>
}

const SetTrusteeNameQuestion = ({trusteeName, setTrusteeName, setHasError, buttonLabel, setButtonLabel}) => {
  const [trusteeKeyName, setTrusteeKeyName] = useState('');
  return <VStack spacing='2em'> 
    <Text fontSize='xl'>Do you want to add a trustee? A trustee is a key holder that can distribute funds to beneficiaries.</Text>
    <Box w='30em'> 
    <FormControl>
      <FormLabel>Trustee Name:</FormLabel>
      <Input size='lg' fontSize='lg'
        placeholder="Aunt Carol" _placeholder={{ color: 'gray.500' }}
        value={trusteeKeyName}
        onChange={(e) => {
          if (e.target.value.length < 32) {
            setTrusteeKeyName(e.target.value);
          }
        }}/>
    </FormControl>
    </Box>
    <HStack width='100%' pr='3em'>
      <Spacer/>
        <Text fontSize='md'>{ trusteeKeyName.length > 0 ? 
            'Click next to use this trustee name.' : 
            'Click next to create a trustee later.' }
        </Text> 
    </HStack>
  </VStack>
}
