import { useState, useEffect, createContext, useContext } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isSwitchingNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToMumbai: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Mumbai testnet configuration
const MUMBAI_CHAIN_ID = 80001;
const MUMBAI_CONFIG = {
  chainId: `0x${MUMBAI_CHAIN_ID.toString(16)}`,
  chainName: 'Mumbai Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
  blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
};

export function useWeb3Provider(): Web3ContextType {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
    setIsSwitchingNetwork(false); // Reset switching state on chain change
    window.location.reload(); // Recommended by MetaMask
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      toast.success('Wallet connected successfully!');

      // Check if on Mumbai testnet
      if (Number(network.chainId) !== MUMBAI_CHAIN_ID) {
        toast.warning('Please switch to Mumbai testnet for full functionality.');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected by user.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setIsSwitchingNetwork(false);
    toast.info('Wallet disconnected.');
  };

  const switchToMumbai = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed.');
      return;
    }

    if (isSwitchingNetwork) {
      toast.info('Network switch already in progress. Please wait...');
      return;
    }

    if (chainId === MUMBAI_CHAIN_ID) {
      toast.info('Already connected to Mumbai testnet.');
      return;
    }

    setIsSwitchingNetwork(true);
    try {
      // Try to switch to Mumbai
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MUMBAI_CONFIG.chainId }],
      });
      toast.success('Switched to Mumbai testnet successfully!');
    } catch (switchError: any) {
      // If Mumbai is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MUMBAI_CONFIG],
          });
          toast.success('Mumbai testnet added and switched successfully!');
        } catch (addError: any) {
          console.error('Error adding Mumbai network:', addError);
          if (addError.code === 4001) {
            toast.error('Network addition rejected by user.');
          } else if (addError.code === -32002) {
            toast.warning('Network addition request already pending. Please check MetaMask.');
            // Don't reset switching state immediately for pending requests
            setTimeout(() => setIsSwitchingNetwork(false), 5000);
          } else {
            toast.error('Failed to add Mumbai testnet.');
          }
          setIsSwitchingNetwork(false);
        }
      } else if (switchError.code === 4001) {
        toast.error('Network switch rejected by user.');
        setIsSwitchingNetwork(false);
      } else if (switchError.code === -32002) {
        toast.warning('Network switch request already pending. Please check MetaMask.');
        // Don't reset switching state immediately for pending requests
        setTimeout(() => setIsSwitchingNetwork(false), 5000);
      } else {
        console.error('Error switching to Mumbai:', switchError);
        toast.error('Failed to switch to Mumbai testnet.');
        setIsSwitchingNetwork(false);
      }
    }
  };

  return {
    account,
    provider,
    signer,
    chainId,
    isConnected,
    isConnecting,
    isSwitchingNetwork,
    connectWallet,
    disconnectWallet,
    switchToMumbai,
  };
}

export { Web3Context };

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}