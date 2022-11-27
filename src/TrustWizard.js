import {
  Button,
  Center,
  Collapse,
  Heading,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Progress,
  Skeleton,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import {
  useState,
  useRef,
} from 'react';
import { ethers } from 'ethers';

export function TrustWizard({...rest}) {
  const [step, setStep] = useState(0);


  // Step 0: Setting Trust Name
  const trustNameDisclosure = useDisclosure();
  const [trustName, setTrustName] = useState('');
  const isError = trustName.length < 1;

  // Step 1: Setting up Beneficiaries
  const keyDisclosure = useDisclosure();
  const [beneficiaries, setBeneficiaries] = useState([]);
  
  // Step Processing
  const stepDisclosures = [
    trustNameDisclosure,
    keyDisclosure,
  ];

  const nextStep = function() {
    stepDisclosures[step].onClose();
    stepDisclosures[step+1].onOpen();
    setStep(step+1);
  }

  return <Stack spacing='1em'>
    <Stack spacing='1em' mb='3em'>
      <Heading size='lg'>Design Your Trust</Heading>
      <Text fontSize='xl'>Use the Locksmith key system to secure your assets <i>without</i> sharing your private key in just a few quick steps. You will get a set of NFT keys, a vault to store your ether and ERC20s, and an optional trustee and deadman switch.</Text>
    </Stack>
    <Center><Progress hasStripe value={25 * (step + 1)} width='60%'/></Center>
    <Collapse in={(trustName.length === 0) || step === 0 || trustNameDisclosure.isOpen}>
      <SetTrustName trustName={trustName} setTrustName={setTrustName} isError={isError}/>
    </Collapse>
    <Collapse in={keyDisclosure.isOpen}>
      <Text>{trustName}</Text>
    </Collapse>
    <HStack pr='3em'>
      <Spacer/>
      <Button {... isError ? {isDisabled: true} : {}} size='lg' onClick={nextStep}>Next</Button>
    </HStack>
  </Stack>
}

const SetTrustName = ({trustName, setTrustName, isError}) => {
  return <FormControl p='3em' id="trustName" isInvalid={isError}>
    <FormLabel>Trust Name</FormLabel>
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
        <FormErrorMessage>Trust name can't be empty</FormErrorMessage> :
        <FormHelperText>Name the trust that will control all of your permissions.</FormHelperText>
      }
  </FormControl>
}

const CreateBeneficiaries = ({beneficiaries, setBeneficiaries, isError}) => {

}
