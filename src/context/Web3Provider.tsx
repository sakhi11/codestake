
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
  wallet: string; // add wallet property
  contract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getCurrentChainId: () => Promise<string>;
  switchToEduChain: () => Promise<void>; // add switchToEduChain method
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
  
  const switchToEduChain = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed!");
      return;
    }
    
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
            params: [EDU_CHAIN_CONFIG],
          });
        } catch (addError: any) {
          toast.error("Failed to add eduChain network: " + (addError.message || "Unknown error"));
          console.error("Failed to add eduChain:", addError);
        }
      } else {
        toast.error("Failed to switch to eduChain network: " + (switchError.message || "Unknown error"));
        console.error("Failed to switch to eduChain:", switchError);
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
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

        // Initialize contract
        const tempContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          tempSigner
        );
        setContract(tempContract);

        setIsConnected(true);

        // Switch to eduChain network if not already connected
        const network = await tempProvider.getNetwork();
        if (network.chainId !== BigInt(parseInt(EDU_CHAIN_CONFIG.chainId, 16))) {
          await switchToEduChain();
        }
      } catch (error: any) {
        console.error("Wallet connection error:", error);
        toast.error("Failed to connect wallet: " + (error.message || "Unknown error"));
      }
    } else {
      toast.error("MetaMask not detected! Please install MetaMask extension.");
      console.error("MetaMask not detected");
    }
  }, [switchToEduChain]);

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress("");
    setIsConnected(false);
    setBalance("0");
    setContract(null);
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
        connectWallet();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [connectWallet, provider]);

  useEffect(() => {
    if (window.ethereum && isConnected) {
      connectWallet();
    }
  }, [isConnected, connectWallet]);

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
    switchToEduChain
  };

  return (
    <Web3Context.Provider value={providerValue}>
      {children}
    </Web3Context.Provider>
  );
};
