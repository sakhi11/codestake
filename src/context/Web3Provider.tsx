// Web3Provider.tsx
'use client'; // For Next.js client-side only
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from 'sonner';

const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165";
const ABI = [
  "function getActiveChallenges() view returns (tuple(string id, string name, uint256 stakedAmount, address[] participants, uint256 nextMilestoneDate, uint256 progress, string track)[])",
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "player1", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "player2", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "stakeAmount", "type": "uint256" }
    ],
    "name": "ChallengeCreated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_challengeId", "type": "uint256" },
      { "internalType": "uint256", "name": "_milestone", "type": "uint256" }
    ],
    "name": "completeMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_player1", "type": "address" },
      { "internalType": "address", "name": "_player2", "type": "address" },
      { "internalType": "uint256", "name": "_stakeAmount", "type": "uint256" }
    ],
    "name": "createChallenge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "milestone", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "winner", "type": "address" }
    ],
    "name": "MilestoneCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "RewardWithdrawn",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_challengeId", "type": "uint256" }
    ],
    "name": "stakeAmount",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "StakeDeposited",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_challengeId", "type": "uint256" }
    ],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "challengeCounter",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "challengeExists",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "challenges",
    "outputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "address", "name": "player1", "type": "address" },
      { "internalType": "address", "name": "player2", "type": "address" },
      { "internalType": "uint256", "name": "stakedAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "totalStake", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
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
    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
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
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setContract(null);
    setIsConnected(false);
  };

  const setupContract = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Replace with your contract address and ABI
      const contractAddress = "YOUR_CONTRACT_ADDRESS";
      const contractABI = []; // Your contract ABI
      
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contract);
    } catch (error) {
      console.error('Contract setup failed:', error);
      toast.error('Failed to setup contract');
    }
  };

  return (
    <Web3Context.Provider value={{ wallet, contract, isConnected, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);