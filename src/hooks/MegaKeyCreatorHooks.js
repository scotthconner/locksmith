import useDebounce from './UseDebounce.js';
import Locksmith from '../services/Locksmith.js';
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite
} from 'wagmi';
import {ethers} from 'ethers';


/**
 * useMegaKeyCreator
 *
 * This method will take in all of the parameters needed and:
 * - create a key, send it to the receiver.
 * - create an inbox, copy a key, and soulbind it to the inbox
 */
export function useMegaKeyCreator(rootKeyId, keyAlias, provider, receiver, bound, errorFunc, successFunc) {
  const { address } = useAccount();
  const debouncedName = useDebounce(keyAlias, 500);
  const debouncedAddress = useDebounce(receiver, 500);
  const megaKeyAddress = Locksmith.getContractAddress('MegaKeyCreator');

  // encode the data
  var data = ethers.utils.isAddress(debouncedAddress) ? ethers.utils.defaultAbiCoder.encode(
    ['bytes32','address','address','bool'],
    [ethers.utils.formatBytes32String(debouncedName), provider, debouncedAddress, bound]) : 
    ethers.utils.defaultAbiCoder.encode(['bool'],[false]);

  // do what we can to send the input
  const preparation = usePrepareContractWrite(
    Locksmith.getContractWrite('KeyVault', 'safeTransferFrom',
      [address, megaKeyAddress, rootKeyId, 1, data],
      debouncedName.length > 0 && ethers.utils.isAddress(debouncedAddress) && provider)
  );

  const call = useContractWrite({...preparation.config,
    onError(error) {
      errorFunc(error);
    },
    onSuccess(data) {
      successFunc(data);
    }
  });

  return call;
}
