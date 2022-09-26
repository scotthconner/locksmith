import React from 'react';
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Logo } from './Logo';
import SidebarWithHeader from './layout/SidebarWithHeader'

function App() {
  return (
    <ChakraProvider theme={theme}>
      <SidebarWithHeader />
    </ChakraProvider>
  );
}

export default App;
