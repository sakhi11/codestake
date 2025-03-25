
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { EDU_CHAIN_CONFIG, CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/utils";

interface Web3ContextProps {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string;
  isConnected: boolean;
  balance: string;
  wallet: string;
  contract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getCurrentChainId: () => Promise<string>;
  switchToEduChain: () => Promise<boolean>;
  networkDetails: {
    chainId: string;
    name: string;
    isCorrectNetwork: boolean;
  };
}

const Web3Context = createContext<Web3ContextProps | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("0");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [networkDetails, setNetworkDetails] = useState({
    chainId: "",
    name: "",
    isCorrectNetwork: false
  });
  
  const checkNetwork = useCallback(async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const chainIdHex = '0x' + network.chainId.toString(16);
      const isCorrectNetwork = chainIdHex === EDU_CHAIN_CONFIG.chainId;
      
      console.log("Current network:", network.name, "Chain ID:", chainIdHex);
      console.log("Expected eduChain ID:", EDU_CHAIN_CONFIG.chainId);
      console.log("Is on correct network:", isCorrectNetwork);
      
      setNetworkDetails({
        chainId: chainIdHex,
        name: network.name || "Unknown Network",
        isCorrectNetwork
      });
      
      return isCorrectNetwork;
    } catch (error: any) {
      console.error("Network check error:", error);
      toast.error("Failed to check network: " + (error.message || "Unknown error"));
      return false;
    }
  }, []);
  
  const switchToEduChain = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed!");
      return false;
    }
    
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: EDU_CHAIN_CONFIG.chainId }],
      });
      
      // Verify the switch was successful
      if (provider) {
        const isCorrect = await checkNetwork(provider);
        if (isCorrect) {
          toast.success(`Successfully connected to ${EDU_CHAIN_CONFIG.chainName}`);
          return true;
        }
      }
      return true;
    } catch (switchError: any) {
      console.error("Switch network error:", switchError);
      
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [EDU_CHAIN_CONFIG],
          });
          
          toast.success(`Added ${EDU_CHAIN_CONFIG.chainName} to MetaMask`);
          
          // Verify the addition was successful
          if (provider) {
            const isCorrect = await checkNetwork(provider);
            return isCorrect;
          }
          return true;
        } catch (addError: any) {
          console.error("Failed to add eduChain:", addError);
          
          toast.error("Failed to add eduChain network. Please add it manually with these details: " +
            `Network Name: ${EDU_CHAIN_CONFIG.chainName}, ` +
            `Chain ID: ${EDU_CHAIN_CONFIG.chainId}, ` +
            `RPC URL: ${EDU_CHAIN_CONFIG.rpcUrls[0]}, ` +
            `Symbol: ${EDU_CHAIN_CONFIG.nativeCurrency.symbol}`
          );
          return false;
        }
      } else {
        toast.error("Failed to switch to eduChain network: " + (switchError.message || "Unknown error"));
        return false;
      }
    }
  }, [provider, checkNetwork]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask Not Detected. Please install MetaMask to use this application.");
      console.error("MetaMask not detected");
      return;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(tempProvider);

      const tempSigner = await tempProvider.getSigner();
      setSigner(tempSigner);

      const tempAddress = await tempSigner.getAddress();
      setAddress(tempAddress);
      
      // Update wallet property
      const tempBalance = await tempProvider.getBalance(tempAddress);
      setBalance(ethers.formatEther(tempBalance));

      console.log("Connected to wallet:", tempAddress);
      console.log("Balance:", ethers.formatEther(tempBalance));

      try {
        // Initialize contract
        console.log("Initializing contract at:", CONTRACT_ADDRESS);
        const tempContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          tempSigner
        );
        setContract(tempContract);
        console.log("Contract initialized successfully");
      } catch (contractError) {
        console.error("Error initializing contract:", contractError);
        toast.error("Failed to initialize contract. Please try again.");
      }

      setIsConnected(true);

      // Check network and show appropriate messages
      const isCorrectNetwork = await checkNetwork(tempProvider);
      if (!isCorrectNetwork) {
        toast.error(`Wrong Network Detected. Please switch to ${EDU_CHAIN_CONFIG.chainName} (Chain ID: ${EDU_CHAIN_CONFIG.chainId}).`);
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet: " + (error.message || "Unknown error"));
    }
  }, [checkNetwork, switchToEduChain]);

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress("");
    setIsConnected(false);
    setBalance("0");
    setContract(null);
    setNetworkDetails({
      chainId: "",
      name: "",
      isCorrectNetwork: false
    });
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          if (provider) {
            const tempBalance = await provider.getBalance(accounts[0]);
            setBalance(ethers.formatEther(tempBalance));
          }
          setIsConnected(true);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        // Refresh the provider on chain change
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [provider]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error("Auto-connect error:", error);
        }
      }
    };
    
    autoConnect();
  }, [connectWallet]);

  const getCurrentChainId = async () => {
    if (!provider) return "";
    const network = await provider.getNetwork();
    return '0x' + network.chainId.toString(16);
  };

  const providerValue = {
    provider,
    signer,
    address,
    isConnected,
    balance,
    wallet: address, // set wallet to address for compatibility
    contract,
    connectWallet,
    disconnectWallet,
    getCurrentChainId,
    switchToEduChain,
    networkDetails
  };

  return (
    <Web3Context.Provider value={providerValue}>
      {children}
    </Web3Context.Provider>
  );
};
