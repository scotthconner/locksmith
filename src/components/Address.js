import {
  Button,
  useToast
} from '@chakra-ui/react';
import {
  FiCopy
} from 'react-icons/fi';


export function DisplayAddress({address, ...rest}) {
  return address.substring(0,5) + '...' + address.substring(address.length - 3)
}

export function CopyButton({label, thing, ...rest}) {
  const toast = useToast();
  return <Button variant='ghost' size='sm' borderRadius='full' onClick={() => {
    navigator.clipboard.writeText(thing);
    toast({
      title: 'Copied to clipboard',
      description: thing,
      status: 'info',
      duration: 2000,
      isClosable: false
    });
  }}>{label}</Button>
}
