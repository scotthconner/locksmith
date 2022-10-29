import { 
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { FcCheckmark } from 'react-icons/fc';
import { IoIosHourglass } from 'react-icons/io';
import {
  useEventState,
  useEventDescription,
} from '../hooks/TrustEventLogHooks.js';

export function EventStateIcon({eventHash, iconProps, ...rest}) {
  const state = useEventState(eventHash);
  return !state.isSuccess ? <Skeleton width='2em' height='2em'/> :
    (state.data ? <FcCheckmark {...iconProps}/> : <IoIosHourglass {...iconProps}/>);
}

export function EventDescription({eventHash, textProps, ...rest}) {
  const description = useEventDescription(eventHash);
  return !description.isSuccess ? <Skeleton width='5em' height='1em'/> :
    <Text {...textProps}>{description.data}</Text>;
}
