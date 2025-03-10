
// Web3Provider.tsx
'use client'; // For Next.js client-side only
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from 'sonner';

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

interface Web3ContextType {
  wallet: string | null;
  contract: any | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  wallet: null,
  contract: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
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

  const handleChainChanged = () => {
    window.location.reload();
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
      await setupContract();
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Connection failed:', error);
      toast.error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
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
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      try {
        const signer = await provider.getSigner();
        
        // Use the CONTRACT_ADDRESS and ABI defined at the top
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(contract);
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
    <Web3Context.Provider value={{ wallet, contract, isConnected, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
