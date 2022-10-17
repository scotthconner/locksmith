import {
  Box,
  Button,
  HStack,
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
  useToast,
} from '@chakra-ui/react';

export function TrustEvent({trustId, eventHash, ...rest}) {
	var boxColor = useColorModeValue('white', 'gray.800');

	return  <Box p='1em' width='90%'
      borderRadius='lg'
      bg={boxColor} boxShadow='dark-lg'
      _hover= {{
        transform: 'scale(1.1)',
      }}
      transition='all 0.2s ease-in-out'>
		{eventHash}
	</Box>
}
