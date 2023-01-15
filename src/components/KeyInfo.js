import { useInspectKey } from '../hooks/LocksmithHooks.js';
import { Skeleton, Text } from '@chakra-ui/react';
import { FcKey } from 'react-icons/fc';
import { HiOutlineKey } from 'react-icons/hi';

export function KeyIcon({keyId, ...rest}) {
  const key = useInspectKey(keyId);
  return key.isSuccess ? KeyInfoIcon(key, null, rest) : 
    <Skeleton width='1.5em' height='1.5em'/>
}

export function KeyInfoIcon(keyInfo, size = null, props = {}) {
  var sizeProps = size ? {size: size} : {};
  return (keyInfo.data.isRoot ? <FcKey {... sizeProps} {... props}/> :  <HiOutlineKey {... sizeProps} {... props}/>)
}

export function KeyName({keyId, ...rest}) {
  const key = useInspectKey(keyId);
  return !key.isSuccess ? <Skeleton width='6em' height='1em'/> : 
    <Text>{key.data.alias}</Text>
}
