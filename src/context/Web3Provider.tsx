
// Web3Provider.tsx
'use client'; // For Next.js client-side only
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from 'sonner';
import { EDU_CHAIN_CONFIG } from "@/lib/utils";

// Using the ABI from the stake_contract.sol
const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165";
const ABI = [
  // Only include functions we'll actually use
  "function getChallengeDetails(uint256 _challengeId) view returns (address creator, uint256 totalStake, uint256 totalPlayers, uint256 joinedCount, uint256 balance, uint256 milestoneCount)",
  "function createChallenge(uint256 _totalStake, uint256 _totalPlayers, address[] _allowedParticipants, uint256[] _milestoneTimestamps) payable",
  "function joinChallenge(uint256 _challengeId) payable",
  "function setMilestoneWinner(uint256 _challengeId, uint256 _milestoneIndex, address _winner)",
  "function withdrawRemainingBalance(uint256 _challengeId)",
  "function challengeCounter() view returns (uint256)"
];

// Networks supported by the contract - we're only supporting eduChain now
const SUPPORTED_NETWORKS = {
  '0xa045c': 'eduChain Testnet', // eduChain Testnet - 656476 in decimal
};

interface Web3ContextType {
  wallet: string | null;
  contract: any | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getCurrentChainId: () => Promise<string | null>;
  checkNetworkSupport: () => Promise<boolean>;
  switchToEduChain: () => Promise<boolean>;
}

const Web3Context = createContext<Web3ContextType>({
  wallet: null,
  contract: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  getCurrentChainId: async () => null,
  checkNetworkSupport: async () => false,
  switchToEduChain: async () => false,
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [contract, setContract] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      // Use addEventListener instead of on for ethers v6
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setIsConnected(true);
          await setupContract();
        }
      }
    } catch (error) {
      console.error('Connection check failed:', error);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length > 0) {
      setWallet(accounts[0]);
      setIsConnected(true);
      await setupContract();
    } else {
      disconnectWallet();
    }
  };

  const handleChainChanged = async (chainId: string) => {
    // Instead of reloading the page, check if the chain is supported
    console.log("Chain changed to:", chainId);
    
    if (chainId !== EDU_CHAIN_CONFIG.chainId) {
      toast.warning("You are connected to an unsupported network. Please switch to eduChain Testnet.");
      await switchToEduChain();
    } else {
      // If we're on the correct chain, refresh the contract
      await setupContract();
      toast.success("Connected to eduChain Testnet!");
    }
  };

  const getCurrentChainId = async (): Promise<string | null> => {
    try {
      if (!window.ethereum) return null;
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return null;
    }
  };
  
  const checkNetworkSupport = async (): Promise<boolean> => {
    const chainId = await getCurrentChainId();
    if (!chainId) return false;
    return chainId === EDU_CHAIN_CONFIG.chainId;
  };

  const switchToEduChain = async (): Promise<boolean> => {
    if (!window.ethereum) {
      toast.error('MetaMask not installed');
      return false;
    }

    try {
      // Try to switch to eduChain network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EDU_CHAIN_CONFIG.chainId }]
      });
      
      // Wait a moment for the chain to switch before checking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify we're on the right chain
      const currentChainId = await getCurrentChainId();
      if (currentChainId === EDU_CHAIN_CONFIG.chainId) {
        toast.success('Successfully switched to eduChain Testnet!');
        await setupContract();
        return true;
      } else {
        toast.error('Failed to switch to eduChain Testnet');
        return false;
      }
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [EDU_CHAIN_CONFIG]
          });
          
          // Wait a moment for the chain to be added before checking
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify we're on the right chain
          const currentChainId = await getCurrentChainId();
          if (currentChainId === EDU_CHAIN_CONFIG.chainId) {
            toast.success('Successfully added and switched to eduChain Testnet!');
            await setupContract();
            return true;
          } else {
            toast.error('Failed to switch to eduChain Testnet after adding it');
            return false;
          }
        } catch (addError) {
          console.error('Error adding eduChain network to MetaMask:', addError);
          toast.error('Failed to add eduChain network to your wallet');
          return false;
        }
      }
      console.error('Error switching to eduChain network:', switchError);
      toast.error('Failed to switch to eduChain network');
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      setIsConnected(true);
      
      // Check if we're on the correct network
      const chainId = await getCurrentChainId();
      if (chainId !== EDU_CHAIN_CONFIG.chainId) {
        toast.warning('You are connected to an unsupported network. Switching to eduChain...');
        await switchToEduChain();
      } else {
        toast.success('Wallet connected successfully!');
      }
      
      await setupContract();
    } catch (error: any) {
      console.error('Connection failed:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected. Please approve the connection request in your wallet.');
      } else {
        toast.error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setContract(null);
    setIsConnected(false);
    toast.info('Wallet disconnected');
  };

  const setupContract = async () => {
    try {
      if (!window.ethereum) {
        console.warn('MetaMask not installed, cannot setup contract');
        return;
      }
      
      // Check if we're on the right network first
      const chainId = await getCurrentChainId();
      if (chainId !== EDU_CHAIN_CONFIG.chainId) {
        console.warn('Not on eduChain network, contract may not work correctly');
        // Don't setup contract if we're on the wrong network
        return;
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      try {
        const signer = await provider.getSigner();
        
        // Use the CONTRACT_ADDRESS and ABI defined at the top
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(contract);
        console.log("Contract setup successfully");
      } catch (signerError) {
        console.error('Failed to get signer:', signerError);
        // At least setup a read-only contract with provider
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        setContract(contract);
      }
    } catch (error) {
      console.error('Contract setup failed:', error);
      toast.error('Failed to setup contract connection');
    }
  };

  return (
    <Web3Context.Provider value={{ 
      wallet, 
      contract, 
      isConnected, 
      connectWallet, 
      disconnectWallet,
      getCurrentChainId,
      checkNetworkSupport,
      switchToEduChain
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
