//////////////////////////////////////
// React and UI Components
//////////////////////////////////////

//////////////////////////////////////
// Wallet, Network, Contracts
//////////////////////////////////////
import { useProvider, useContract} from "wagmi";
import { useQuery } from "react-query";
import Locksmith from './services/Locksmith.js';
import { useWalletKeys } from './hooks/LocksmithHooks.js';

function KeyWallet({
  children
}: {
  children: ReactNode;
}) {
  const provider = useProvider();
  const contract = useContract(Locksmith.getContract('keyVault', provider)); 

  const walletKeys = useQuery('balance', async function() {
    return (await contract.getKeys('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'));
  });

  const keys = useWalletKeys('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

  return (
    <>
    [{keys.isSuccess && keys.data.map((key) => (key + " "))}]
    { walletKeys.isLoading && "hello" }
    { walletKeys.isSuccess && "bye" }
    [{walletKeys.isSuccess && walletKeys.data.map((key) => (
      key + ','
    ))}]
    {children}
    </>
  );
}

export default KeyWallet;
