import Locksmith from '../services/Locksmith.js';
import {useQuery} from 'react-query';
import {
  useProvider,
  usePrepareContractWrite,
  useContractWrite,
  useContract,
} from 'wagmi';

/**
 * useInboxTransactionCount 
 *
 * For a given inbox address, return the total transaction count.
 */
export function useInboxTransactionCount(address) {
  const provider = useProvider();
  const inbox = useContract(Locksmith.getContract('VirtualKeyAddress', provider, address));
  return useQuery('VirtualKeyAddress::transactionCount at ' + address , async function() {
    return address !== null ? await inbox.transactionCount() : 0;
  });
}

/**
 * useInboxTransaction
 *
 * For a given inbox address and transaction index, return the transaction metadata. 
 */
export function useInboxTransaction(address, index) {
  const provider = useProvider();
  const inbox = useContract(Locksmith.getContract('VirtualKeyAddress', provider, address));
  return useQuery('VirtualKeyAddress::transactions at ' + address + " " + index, async function() {
    if (address === null) {
      return null;
    }

    const tx = await inbox.transactions(index);

    return {
      type: tx[0],
      blockTime: tx[1],
      operator: tx[2],
      target: tx[3],
      provider: tx[4],
      arn: tx[5],
      amount: tx[6]
    }
  });
}



/**
 * useSend
 * 
 * Will send ethereum out of an inbox.
 */
export function useSend(inboxAddress, provider, amount, destination, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('VirtualKeyAddress', 'send',
      [provider, amount, destination],
      inboxAddress && provider && amount && amount.gt(0) && destination, inboxAddress));

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}

/**
 * useSendToken
 *
 * Will send ethereum out of an inbox.
 */
export function useSendToken(inboxAddress, provider, token, amount, destination, errorFunc, successFunc) {
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('VirtualKeyAddress', 'sendToken',
      [provider, token, amount, destination],
      inboxAddress && provider && token && amount && amount.gt(0) && destination, inboxAddress));

  return useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });
}
