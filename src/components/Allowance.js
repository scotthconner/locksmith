import { Text, Skeleton } from '@chakra-ui/react';

export function AllowanceName({allowanceObject, ...rest}) {
  return allowanceObject.allowanceName ?
    <Text {...rest}>{allowanceObject.allowanceName}</Text> :
    <Skeleton widith='6em' height='1em'/>
}
