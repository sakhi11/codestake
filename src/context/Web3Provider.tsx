
'use client'; // For Next.js client-side only
import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { EDU_CHAIN_CONFIG } from "@/lib/utils";

// Using the ABI from the stake_contract.sol that matches exactly
const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165";
const ABI = [
  // Functions that match CodeStake.sol
  "function getChallengeDetails(uint256 challengeId) view returns (Challenge memory)",
  "function createChallenge(uint256 stakeAmount, uint256 totalPlayers, address[] participants, uint256[] milestoneTimestamps) payable",
  "function joinChallenge(uint256 challengeId) payable",
  "function completeMilestone(uint256 challengeId, uint256 milestoneIndex)",
  "function getWalletSummary(address user) view returns (uint256 balance, uint256 totalEarned, uint256 totalStaked)",
  "function challengeCounter() view returns (uint256)",
  "function challenges(uint256) view returns (string name, string track, address creator, uint256 startDate, uint256 endDate, uint256 stakedAmount, uint256 totalStake, bool isActive)",
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function getActiveChallenges() view returns (uint256[])",
];

// Define web3 context interface
interface Web3ContextProps {
  isConnected: boolean;
  wallet: string;
  contract: ethers.Contract | null;
  provider: ethers.Provider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToEduChain: () => Promise<void>;
  networkStatus: {
    chainId: string | null;
    networkName: string;
    isCorrectNetwork: boolean;
  };
}

// Create context with default values
const Web3Context = createContext<Web3ContextProps>({
  isConnected: false,
  wallet: "",
  contract: null,
  provider: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchToEduChain: async () => {},
  networkStatus: {
    chainId: null,
    networkName: "Not Connected",
    isCorrectNetwork: false,
  },
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [networkStatus, setNetworkStatus] = useState({
    chainId: null as string | null,
    networkName: "Not Connected",
    isCorrectNetwork: false,
  });

  // Initialize Web3 on component mount
  useEffect(() => {
    const init = async () => {
      // Check if ethereum is available
      if (typeof window.ethereum !== "undefined") {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            // User is already connected
            setWallet(accounts[0]);
            await setupProvider();
            setIsConnected(true);
          }
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      }
    };

    init();

    // Setup event listeners for wallet changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnectWallet();
    } else {
      // Account changed
      setWallet(accounts[0]);
      setupProvider();
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    // Reload when chain changes
    window.location.reload();
  };

  // Setup ethers provider and contract
  const setupProvider = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      setProvider(provider);
      setContract(contract);

      // Check current network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      updateNetworkStatus(chainId);
    } catch (error) {
      console.error("Error setting up provider:", error);
    }
  };

  // Update network status
  const updateNetworkStatus = (chainId: string) => {
    const isCorrectNetwork = chainId === EDU_CHAIN_CONFIG.chainId;
    const networkName = isCorrectNetwork
      ? "eduChain Testnet"
      : getNetworkName(chainId);

    setNetworkStatus({
      chainId,
      networkName,
      isCorrectNetwork,
    });
  };

  // Get network name from chainId
  const getNetworkName = (chainId: string): string => {
    const networks: Record<string, string> = {
      "0x1": "Ethereum Mainnet",
      "0x5": "Goerli Testnet",
      "0xaa36a7": "Sepolia Testnet",
      "0x89": "Polygon Mainnet",
      "0x13881": "Mumbai Testnet",
      [EDU_CHAIN_CONFIG.chainId]: "eduChain Testnet",
    };

    return networks[chainId] || "Unknown Network";
  };

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install MetaMask.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setWallet(accounts[0]);
        await setupProvider();
        setIsConnected(true);
        
        // Check if on eduChain, if not prompt to switch
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== EDU_CHAIN_CONFIG.chainId) {
          toast.warning("Please switch to eduChain Testnet for full functionality", {
            action: {
              label: "Switch Network",
              onClick: switchToEduChain,
            },
          });
        }
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setWallet("");
    setIsConnected(false);
    setContract(null);
    setProvider(null);
    setNetworkStatus({
      chainId: null,
      networkName: "Not Connected",
      isCorrectNetwork: false,
    });
  };

  // Switch to eduChain network
  const switchToEduChain = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: EDU_CHAIN_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: EDU_CHAIN_CONFIG.chainId,
                chainName: EDU_CHAIN_CONFIG.chainName,
                nativeCurrency: {
                  name: EDU_CHAIN_CONFIG.nativeCurrency.name,
                  symbol: EDU_CHAIN_CONFIG.nativeCurrency.symbol,
                  decimals: EDU_CHAIN_CONFIG.nativeCurrency.decimals,
                },
                rpcUrls: EDU_CHAIN_CONFIG.rpcUrls,
                blockExplorerUrls: EDU_CHAIN_CONFIG.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding eduChain network:", addError);
          toast.error("Failed to add eduChain network");
        }
      } else {
        console.error("Error switching to eduChain network:", switchError);
        toast.error("Failed to switch network");
      }
    }
  };

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        wallet,
        contract,
        provider,
        connectWallet,
        disconnectWallet,
        switchToEduChain,
        networkStatus,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
