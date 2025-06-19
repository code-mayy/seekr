import { ReactNode } from 'react';
import { Web3Context, useWeb3Provider } from '@/hooks/useWeb3';

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const web3 = useWeb3Provider();
  return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>;
}