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
  Select,
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
  useToast,
} from '@chakra-ui/react'
import DatePicker from "react-datepicker";
import {
  useState,
  useRef,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectKitButton } from "connectkit";
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import Locksmith from './services/Locksmith.js';
import { secondsToUnits } from './components/AlarmClock.js';
import { AiOutlineWallet } from 'react-icons/ai';
import { BiGhost } from 'react-icons/bi';
import { BsTrash, BsShieldLock } from 'react-icons/bs';
import { FcKey } from 'react-icons/fc';
import { HiOutlineKey } from 'react-icons/hi';
import { IoIosAdd, IoIosHourglass } from 'react-icons/io';
import { useTrustCreator } from './hooks/TrustCreatorHooks.js';

export function TrustWizard({...rest}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { isConnected, address } = useAccount();
  const [step, setStep] = useState(0);
  const [buttonLabel, setButtonLabel] = useState('Next');
  const bottomRef = useRef(null);
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  };
  useEffect(() => {
    scrollToBottom();
  });

  // Step 0: Setting Trust Name
  const trustNameDisclosure = useDisclosure();
  const [trustName, setTrustName] = useState('');
  const [hasError, setHasError] = useState(false);

  // Step 1: Setting up Beneficiaries
  const keyDisclosure = useDisclosure();
  const [beneficiaries, setBeneficiaries] = useState([]);

  // Step 2: Setting up a trustee, or creating trust.
  const trusteeQuestionDisclosure = useDisclosure();
  const [trustee, setTrustee] = useState({
    alias: '', 
    destination: '',
    sendToRoot: true,
    soulbind: false,
  });

  // Step 3: Setting up a deadman switch, or creating a trust. 
  const deadmanDisclosure = useDisclosure();
  const [deadman, setDeadman] = useState({
    description: '',
    alarmTime: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // one year
    snoozeIntervalUnit: 60 * 60 * 24, // day
    snoozeUnitCount: 1,
    skipEvent: true,
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

  const createTrust = useTrustCreator(trustName, beneficiaries, trustee, deadman, step===4,
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
        title: 'Trust Created!',
        description: 'Your trust has been set up.',
        status: 'success',
        duration: 9000,
        isClosable: true
      });
      navigate('/trusts');
    }
  );
  const buttonProps = createTrust.isLoading ? {isLoading: true} : (!createTrust.write ? {isDisabled: true} : {});
  
  return <Stack spacing='1em'>
    <Stack spacing='1em' mb='3em'>
      <Heading size='lg'>Design Your Trust</Heading>
      <Text fontSize='xl'>Use the Locksmith key system to secure your assets <i>without</i> sharing your private key in just a few quick steps.</Text>
      <Text fontSize='xl'>You will get a set of NFT keys, a vault to store your ether and ERC20s, and an optional trustee and deadman switch. You can re-configure your trust at any time.</Text>
    </Stack>
    <Center><Progress hasStripe value={20 * (step + 1)} width='60%'/></Center>
    <Collapse in={(trustName.length === 0) || step === 0 || trustNameDisclosure.isOpen}>
      <SetTrustName trustName={trustName} setTrustName={setTrustName} 
        step={step} changeStep={changeStep} setHasError={setHasError} isError={hasError}/>
    </Collapse>
    <Collapse in={keyDisclosure.isOpen}>
      <CreateBeneficiaries trustName={trustName} beneficiaries={beneficiaries} setBeneficiaries={setBeneficiaries} 
        setButtonLabel={setButtonLabel} isError={hasError} setHasError={setHasError} step={step} changeStep={changeStep}/> 
    </Collapse>
    <Collapse in={trusteeQuestionDisclosure.isOpen && beneficiaries.length > 0}>
      <SetTrustee trustee={trustee} setTrustee={setTrustee} 
        step={step} changeStep={changeStep}/> 
    </Collapse>
    <Collapse in={deadmanDisclosure.isOpen}>
      <SetDeadman deadman={deadman} setDeadman={setDeadman} step={step} changeStep={changeStep}/>
    </Collapse>
    <Collapse in={reviewDisclosure.isOpen}>
      <VStack mt='2em' spacing='1em'>
        <VStack pb='3em'>
          <Text fontSize='lg'>You've named your trust.</Text>
          <HStack p='1em'>
            <BsShieldLock size='30px'/>
            <Text fontWeight='bold'>{trustName}</Text>
          </HStack>
          <Button onClick={()=> changeStep(0)}>Change Trust Name</Button>
        </VStack>
        { beneficiaries.length > 0 && <VStack pb='3em'>
          <Text fontSize='lg'>And defined your beneficiary keys.</Text>
          <Wrap p='1em' spacing='1em'>
            { beneficiaries.map((b, x) => <ReviewKey key={'rk-' + x} keyName={b.alias} destination={b.destination}
              sendToRoot={b.sendToRoot} soulbound={b.soulbind}/>) }
          </Wrap>
          <Button onClick={() => changeStep(1)}>Change Beneficiaries</Button>
        </VStack> }
        { beneficiaries.length < 1 && <VStack pb='3em'>
          <Text fontSize='lg'>You chose not to create any other keys.</Text>
          <Button onClick={() => changeStep(1)}>Add Beneficiary Keys</Button> 
        </VStack> }
        { beneficiaries.length > 0 && trustee.alias.length < 1 && <VStack pb='3em'>
          <Text fontSize='lg'>You chose not to create trustee distribution rights.</Text>
          <Button onClick={() => changeStep(2)}>Add Trustee</Button> 
        </VStack> }
        { trustee.alias.length > 0 && <VStack pb='3em'>
          <Text fontSize='lg'>You've enabled a trustee to distribute funds.</Text>
          <Wrap p='1em' spacing='1em'>
            <ReviewKey key='review-key-trustee' keyName={trustee.alias} destination={trustee.destination}
              sendToRoot={trustee.sendToRoot} soulbound={trustee.soulbind}/>
          </Wrap> 
          <Button onClick={() => changeStep(2)}>Change Trustee</Button>
        </VStack> }
        {!deadman.skipEvent && <VStack pb='3em'>
          <Text fontSize='lg'>You've added an event to your trust.</Text>
          <VStack>
            <HStack p='1em'>
              <IoIosHourglass size='30px'/>
              <Text fontWeight='bold'>{deadman.description}</Text>
            </HStack>
            <Text>Event will occur on: <b>{deadman.alarmTime.toDateString()}</b></Text>
            <Text>But can be postponed by you every: <b>{secondsToUnits(deadman.snoozeUnitCount*deadman.snoozeIntervalUnit)}</b></Text>
          </VStack>
          <Button onClick={() => changeStep(3)}>Change Event</Button>
        </VStack>}
        <VStack pb='4em'>
          <Text fontSize='lg'>Are you ready to create your trust?</Text>
          { isConnected && 
            <Button {...buttonProps} size='lg' colorScheme='yellow' leftIcon={<HiOutlineKey/>}
              onClick={() => {createTrust.write?.();} }>Mint Trust</Button> }
          { isConnected && !createTrust.write && <Text fontSize='sm'>Calculating gas...</Text> }
          { !isConnected && <ConnectKitButton/> }
        </VStack>
      </VStack>
    </Collapse> } 
    <div ref={bottomRef}/>
  </Stack>
}

const SetTrustName = ({trustName, setTrustName, step, changeStep, isError, setHasError}) => {
  return <FormControl p='3em' id="trustName" isInvalid={isError}>
    <VStack>
      <FormLabel>Let's start with the name of your Key Ring.</FormLabel>
      <Input
        bg={useColorModeValue('white', 'gray.900')} 
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
      <VStack p='2em'>
        <Button colorScheme='blue' {... trustName.length < 1 ? {isDisabled: true} : {}} size='lg' onClick={() => changeStep(step+1)}>Next</Button>
      </VStack>
    </VStack>
  </FormControl>
}

const ReviewKey = ({keyName, destination, sendToRoot, soulbound}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  return <WrapItem key={'rkwi' + keyName + destination + soulbound} p='0.5em' 
       bg={boxColor} borderRadius='2xl' boxShadow='lg'>
        <HStack>
          <HiOutlineKey size='30px'/>
          <VStack>
            <Center><Text fontWeight='bold'>{keyName}</Text></Center>
          { sendToRoot && <Tag variant='subtle' colorScheme='yellow'>
            <TagLeftIcon boxSize='12px' as={AiOutlineWallet} />
            <TagLabel>(you)</TagLabel>
          </Tag> }
          { !sendToRoot && <Tooltip label={destination}>
            <Tag variant='subtle' colorScheme='blue'>
              <TagLeftIcon boxSize='12px' as={AiOutlineWallet} />
              <TagLabel>{destination.substring(0,5) + '...' + destination.substring(destination.length - 3)}</TagLabel>
            </Tag> 
          </Tooltip>}
          { soulbound && <Tag variant='subtle' colorScheme='purple'>
            <TagLeftIcon boxSize='12px' as={BiGhost}/>
            <TagLabel>Soulbound</TagLabel>
          </Tag> }
        </VStack>
      </HStack>
    </WrapItem>
}

const CreateBeneficiaries = ({trustName, beneficiaries, setBeneficiaries, step, changeStep}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  const [hasError, setHasError] = useState(false);

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
    <VStack p='2em'>
      <Text fontSize='md'>Click next to use <b>{beneficiaries.length}</b> beneficiary keys.</Text>
      <HStack>
        <Button size='lg' onClick={() => changeStep(step-1)}>Back</Button> 
        <Button colorScheme='blue' {... hasError ? {isDisabled: true} : {}} size='lg' 
          onClick={() => changeStep(beneficiaries.length > 0 ? step+1 : 4)}>Next</Button>
      </HStack>
    </VStack>
  </VStack>
}

const SetTrustee = ({trustee, setTrustee, step, changeStep}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  const canNext = (trustee.sendToRoot || ethers.utils.isAddress(trustee.destination)) && trustee.alias.length > 0 

  return <VStack spacing='2em' pb='2em'> 
    <Text fontSize='xl'>Do you want to add a trustee? A trustee is a key holder that can distribute funds to beneficiaries.</Text>
    <Box w='30em' bg={boxColor} p='1em' borderRadius='lg' boxShadow='dark-lg'> 
      <FormControl>
        <FormLabel>Trustee Name:</FormLabel>
        <Input size='lg' fontSize='lg'
          placeholder="Aunt Carol" _placeholder={{ color: 'gray.500' }}
          value={trustee.name}
          onChange={(e) => {
            if (e.target.value.length < 32) {
              var t = {...trustee};
              t.alias = e.target.value;
              setTrustee(t);
            }
          }}/>
        { trustee.alias.length > 0 && <>
        <FormControl id={'address-t-'} isInvalid={ !ethers.utils.isAddress(trustee.destination)}>
            { !trustee.sendToRoot && <FormLabel mt='1em'>Key Destination Address:</FormLabel> }
            { !trustee.sendToRoot && <Input size='lg' fontSize='sm'
                placeholder="0xDEADBEEF" _placeholder={{ color: 'gray.500' }}
                value={trustee.destination}
                onChange={(e) => {
                  var t = {...trustee};
                  t.destination = e.target.value;
                  setTrustee(t);
                }}/>
            }
            { !trustee.sendToRoot && !ethers.utils.isAddress(trustee.destination) && 
                <FormErrorMessage>You need a valid ethereum address.</FormErrorMessage> }
        </FormControl>
        <HStack mt='1em'>
            <Checkbox
              isChecked={trustee.sendToRoot}
              onChange={(e) => {
                var t = {...trustee};
                t.sendToRoot = e.target.checked;
                setTrustee(t);
              }}
              size='md'>Send to me for now</Checkbox>
          </HStack>
          <HStack mt='1em'>
            <FormLabel>Do you want to <b>soulbind</b> this key?</FormLabel>
            <Spacer/>
            <Switch colorScheme='purple' size='lg'
              onChange={(e) => {
                var t = {...trustee};
                t.soulbind = e.target.checked;
                setTrustee(t);
              }}
            />
          </HStack></> }
    </FormControl>
    </Box>
    <VStack pt='1em'>
      <HStack>
        <Button size='lg' onClick={() => {changeStep(step-1);} }>Back</Button>
        { trustee.alias.length < 1 &&
          <Button size='lg' colorScheme='blue' onClick={() => {changeStep(step+2);} }>Skip</Button>
        }
        { trustee.alias.length > 0 && 
          <Button {...(canNext ? {} : {isDisabled: true})} size='lg' colorScheme='blue' onClick={() => {changeStep(step+1);}}>Next</Button>
        }
      </HStack>
    </VStack>
  </VStack>
}

const SetDeadman = ({deadman, setDeadman, step, changeStep}) => {
  return <VStack>
    <Text fontSize='xl'>Do you want to only enable trustee distribution after a time-lock or deadman switch?</Text>
    <VStack spacing='2em'>
      <FormControl id="Event Label" isInvalid={deadman.description.length < 1}> 
        <FormLabel>Switch Name</FormLabel>
        <Input
          bg={useColorModeValue('white', 'gray.900')}
          value={deadman.description}
          placeholder="My ephemeral emersion."
          _placeholder={{ color: 'gray.500' }}
          onChange={(e) => {
            if (e.target.value.length < 32) {
              var d = {...deadman};
              d.description = e.target.value;
              setDeadman(d);
            }  
          }}/>
        { deadman.description.length < 1 && <FormErrorMessage>Please provide a short description.</FormErrorMessage>}
      </FormControl>
      <FormControl id="Alarm Time">
        <FormLabel>Alarm Date</FormLabel>
        <DatePicker popperPlacement='auto' selected={deadman.alarmTime} onChange={(date) => {
          var d = {...deadman};
          d.alarmTime = date;
          setDeadman(d);
        }}/>
      </FormControl>
      <FormControl id="Snooze Interval" isInvalid={deadman.snoozeUnitCount.length > 0 && isNaN(parseInt(deadman.snoozeUnitCount))}>
        <FormLabel>Root Key Snooze Interval</FormLabel>
        <HStack>
          <Input
            bg={useColorModeValue('white', 'gray.900')}
            width='20%'
            placeholder="0"
            _placeholder={{ color: 'gray.500' }}
            onChange={(e) => { 
              var d = {...deadman};
              d.snoozeUnitCount = e.target.value;
              setDeadman(d);
            }}/>
          <Select variant='filled'
            width='40%'
            onChange={(e) => { 
              var d = {...deadman};
              d.snoozeIntervalUnit = e.target.value;
              setDeadman(d); 
            }}>
            <option value={60*60*24}>Days</option>
            <option value={60*60*24*7}>Weeks</option>
            <option value={60*60*24*365}>Years</option>
          </Select>
        </HStack>
        { deadman.snoozeUnitCount.length > 0 && isNaN(parseInt(deadman.snoozeUnitCount)) ? 
          <FormErrorMessage>The snooze interval must be a number.</FormErrorMessage> :
          <FormHelperText>A blank snooze interval acts as a time-lock.</FormHelperText>}
      </FormControl>
    </VStack>
    <VStack p='2em'>
      <HStack>
        <Button size='lg' onClick={() => changeStep(step-1)}>Back</Button>
        <Button size='lg' onClick={() => {
          var d = {...deadman};
          d.skipEvent = true;
          setDeadman(d);
          changeStep(step+1);
        }}>Skip</Button>
        <Button {... deadman.description.length < 1 ||
          deadman.snoozeUnitCount.length > 0 && isNaN(parseInt(deadman.snoozeUnitCount)) ? {isDisabled: true} : {}}
          colorScheme='blue' onClick={() => {
            var d = {...deadman};
            d.skipEvent = false;
            setDeadman(d);
            changeStep(step+1);
          }}>Review Trust</Button>
      </HStack>
    </VStack>
  </VStack>
}
