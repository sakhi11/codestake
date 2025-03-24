
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
          
          toast({
            title: "Failed to add eduChain network",
            description: (
              <div className="mt-2">
                <p className="mb-2">{addError.message || "Please add it manually with these details:"}</p>
                <ul className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <li><strong>Network Name:</strong> {EDU_CHAIN_CONFIG.chainName}</li>
                  <li><strong>Chain ID:</strong> {EDU_CHAIN_CONFIG.chainId}</li>
                  <li><strong>RPC URL:</strong> {EDU_CHAIN_CONFIG.rpcUrls[0]}</li>
                  <li><strong>Symbol:</strong> {EDU_CHAIN_CONFIG.nativeCurrency.symbol}</li>
                  <li><strong>Decimals:</strong> {EDU_CHAIN_CONFIG.nativeCurrency.decimals}</li>
                </ul>
              </div>
            ),
            duration: 8000,
          });
          return false;
        }
      } else {
        toast.error("Failed to switch to eduChain network: " + (switchError.message || "Unknown error"));
        return false;
      }
    }
  }, [provider, checkNetwork]);

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

        // Check network and show appropriate messages
        const isCorrectNetwork = await checkNetwork(tempProvider);
        if (!isCorrectNetwork) {
          toast({
            title: "Wrong Network Detected",
            description: (
              <div>
                <p>Please switch to {EDU_CHAIN_CONFIG.chainName} (Chain ID: {EDU_CHAIN_CONFIG.chainId}).</p>
                <button 
                  onClick={switchToEduChain}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full"
                >
                  Switch Network
                </button>
              </div>
            ),
            duration: 5000,
          });
        }
      } catch (error: any) {
        console.error("Wallet connection error:", error);
        toast.error("Failed to connect wallet: " + (error.message || "Unknown error"));
      }
    } else {
      toast({
        title: "MetaMask Not Detected",
        description: (
          <div>
            <p>Please install MetaMask to use this application.</p>
            <a 
              href="https://metamask.io/download.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 block text-center"
            >
              Download MetaMask
            </a>
          </div>
        ),
        duration: 8000,
      });
      console.error("MetaMask not detected");
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
