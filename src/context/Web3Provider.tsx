import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { EDU_CHAIN_CONFIG } from "@/lib/utils";

interface Web3ContextProps {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  address: string;
  isConnected: boolean;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getCurrentChainId: () => Promise<string>; // Add this method
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
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>("0");

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        const tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);

        const tempAddress = await tempSigner.getAddress();
        setAddress(tempAddress);

        const tempBalance = await tempProvider.getBalance(tempAddress);
        setBalance(ethers.utils.formatEther(tempBalance));

        setIsConnected(true);

        // Switch to eduChain network if not already connected
        const chainId = await tempProvider.getNetwork();
        if (chainId.chainId !== parseInt(EDU_CHAIN_CONFIG.chainId)) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [EDU_CHAIN_CONFIG],
            });
          } catch (addError: any) {
            console.error(addError);
          }
        }
      } catch (error: any) {
        console.error("Wallet connection error:", error);
      }
    } else {
      console.error("MetaMask not detected");
    }
  }, []);

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress("");
    setIsConnected(false);
    setBalance("0");
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          if (provider) {
            const tempBalance = await provider.getBalance(accounts[0]);
            setBalance(ethers.utils.formatEther(tempBalance));
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

  // Include the getCurrentChainId method in the provider value
  const providerValue = {
    provider,
    signer,
    address,
    isConnected,
    balance,
    connectWallet,
    disconnectWallet,
    getCurrentChainId: async () => {
      if (!provider) return "";
      const network = await provider.getNetwork();
      return network.chainId.toString(16);
    }
  };

  return (
    <Web3Context.Provider value={providerValue}>
      {children}
    </Web3Context.Provider>
  );
};
