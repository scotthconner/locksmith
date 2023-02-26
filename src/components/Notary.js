import { useTrustedActorAlias } from '../hooks/NotaryHooks.js';
import { Text, Skeleton } from '@chakra-ui/react';

export function TrustedActorAlias({trustId, role, address, ledger = 'Ledger', ...rest}) {
  const alias = useTrustedActorAlias(trustId, role, address, ledger);
  return alias.isSuccess ? <Text {...rest}>{alias.data}</Text> : <Skeleton width='4em' height='1em'/>
}
