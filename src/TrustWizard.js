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
} from '@chakra-ui/react'
import DatePicker from "react-datepicker";
import {
  useState,
  useRef,
  useEffect,
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
    skipEvent: false,
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
      <VStack mt='2em'>
        <Text fontSize='lg'>You've named your trust.</Text>
        <HStack p='3em'>
          <Text fontWeight='bold'>{trustName}</Text>
          <Spacer/>
          <Button>Change Trust Name</Button>
        </HStack>
        <Text fontSize='lg'>And defined your beneficairy keys.</Text>
        <Wrap p='3em' spacing='1em'>
          { beneficiaries.map((b, x) => <ReviewKey key={'rk-' + x} keyName={b.alias} destination={b.destination}
              sendToRoot={b.sendToRoot} soulbound={b.soulbind}/>) }
        </Wrap>
        <Button>Change Beneficaries</Button>
        <Text fontSize='lg'>You've enabled a trustee to distribute funds.</Text>
        <Wrap p='3em' spacing='1em'>
          <ReviewKey key='review-key-trustee' keyName={trustee.alias} destination={trustee.destination}
            sendToRoot={trustee.sendToRoot} soulbound={trustee.soulbind}/>
        </Wrap>
        <ReviewTrustee trustee={trustee}/>
        <Button>Change Trustee</Button>
        <ReviewDeadman deadman={deadman}/>
        <Button>Change Event</Button>
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
    <HStack pr='3em'>
      <Spacer/>
      <Button colorScheme='blue' {... trustName.length < 1 ? {isDisabled: true} : {}} size='lg' onClick={() => changeStep(step+1)}>Next</Button>
    </HStack>
  </FormControl>
}

const ReviewTrustName = ({trustName}) => {
  return <HStack mt='3em'>
    <Text fontSize='xl'>Ok, so you've named your Trust Ring <b>{trustName}</b>. A </Text>
    <FcKey/>
    <Text fontSize='xl'><b>root</b> key will be minted into your wallet.</Text>
  </HStack>
}

const ReviewKey = ({keyName, destination, sendToRoot, soulbound}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  return <WrapItem key={'rkwi' + keyName + destination + soulbound} p='0.5em' 
       bg={boxColor} borderRadius='2xl' boxShadow='dark-lg'>
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
    <HStack width='100%' pr='3em'>
      <Spacer/>
      <Text fontSize='md'>Click next to use <b>{beneficiaries.length}</b> beneficiary keys.</Text>
    </HStack>
    <HStack width='100%' pr='3em'>
      <Spacer/>
      <Button size='lg' onClick={() => changeStep(step-1)}>Back</Button> 
      <Button colorScheme='blue' {... hasError ? {isDisabled: true} : {}} size='lg' onClick={() => changeStep(step+1)}>Next</Button>
    </HStack>
  </VStack>
}

const ReviewTrustee = ({trustee, step, changeStep}) => {
  const boxColor = useColorModeValue('white', 'gray.800');
  // we only want to return a review if the trustee is there
  // this is coupled to the rest of the components in a bad way
  return trustee.alias.length > 0 && <VStack spacing='2em' p='2em'>
    <Text fontSize='xl'>The following key holder will have asset distrbution permissions.</Text>
    <Box p='1em'
        height='12em' width='10em' bg={boxColor} borderRadius='2xl' boxShadow='dark-lg'>
        <VStack>
          <Center w='8em'><Text fontWeight='bold'>{trustee.alias}</Text></Center>
          <HiOutlineKey size='56px'/>
          { trustee.sendToRoot && <Tag variant='subtle' colorScheme='yellow'>
            <TagLeftIcon boxSize='12px' as={AiOutlineWallet} />
            <TagLabel>(you)</TagLabel>
          </Tag> }
          { !trustee.sendToRoot && <Tooltip label={trustee.destination}>
            <Tag variant='subtle' colorScheme='blue'>
              <TagLeftIcon boxSize='12px' as={AiOutlineWallet} />
              <TagLabel>{trustee.destination.substring(0,5) + '...' + trustee.destination.substring(trustee.destination.length - 3)}</TagLabel>
            </Tag>
          </Tooltip>}
          { trustee.soulbind && <Tag variant='subtle' colorScheme='purple'>
            <TagLeftIcon boxSize='12px' as={BiGhost}/>
            <TagLabel>Soulbound</TagLabel>
          </Tag> }
        </VStack>
      </Box>
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
    <HStack width='100%' pt='1em'>
      <Spacer/>
      <Button size='lg' onClick={() => {changeStep(step-1);} }>Back</Button>
      { trustee.alias.length < 1 &&
        <Button size='lg' colorScheme='blue' onClick={() => {changeStep(step+2);} }>Skip</Button>
      }
      {trustee.alias.length > 0 && 
        <Button {...(canNext ? {} : {isDisabled: true})} size='lg' colorScheme='blue' onClick={() => {changeStep(step+1);}}>Next</Button>
      }
    </HStack>
  </VStack>
}

const SetDeadman = ({deadman, setDeadman, step, changeStep}) => {
  return <VStack>
    <Text fontSize='xl'>Do you want to only enable trustee distribution after a time-lock or deadman switch?</Text>
    <VStack spacing='2em'>
      <FormControl id="Event Label" isInvalid={deadman.description.length < 1}> 
        <FormLabel>Switch Name</FormLabel>
        <Input
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
    <HStack width='100%' p='3em'>
      <Spacer/>
      <Button size='lg' onClick={() => changeStep(step-1)}>Back</Button>
      <Button size='lg' onClick={() => {
        var d = {...deadman};
        d.skipEvent = true;
        setDeadman(d);
        changeStep(step+1);
      }}>Skip</Button>
      <Button {... deadman.description.length < 1 ||
          deadman.snoozeUnitCount.length > 0 && isNaN(parseInt(deadman.snoozeUnitCount)) ? {isDisabled: true} : {}}
        colorScheme='blue' onClick={() => {changeStep(step+1);}}>Create Trust</Button>
    </HStack>
  </VStack>
}

const ReviewDeadman = ({deadman}) => {
  return "Deadman Review";
}
