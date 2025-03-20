import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

// Smart Contract Details - update ABI to match actual contract
const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165";
const CONTRACT_ABI = [
  "function getChallengeDetails(uint256 _challengeId) view returns (address creator, uint256 totalStake, uint256 totalPlayers, uint256 joinedCount, uint256 balance, uint256 milestoneCount)",
  "function createChallenge(uint256 _totalStake, uint256 _totalPlayers, address[] _allowedParticipants, uint256[] _milestoneTimestamps) payable",
  "function joinChallenge(uint256 _challengeId) payable",
  "function setMilestoneWinner(uint256 _challengeId, uint256 _milestoneIndex, address _winner)",
  "function withdrawRemainingBalance(uint256 _challengeId)",
  "function challengeCounter() view returns (uint256)"
];

// eduChain Testnet configuration
export const EDU_CHAIN_CONFIG = {
  chainId: '0xa045c', // 656476 in decimal
  chainName: 'eduChain Testnet',
  nativeCurrency: {
    name: 'EDU',
    symbol: 'EDU',
    decimals: 18
  },
  rpcUrls: ['https://open-campus-codex-sepolia.drpc.org'],
  blockExplorerUrls: ['https://explorer.edu.ooo/']
};

// Classname utility function (for Tailwind)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to shorten an Ethereum address
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

// Function to check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum;
}

// Function to check current network
export async function getCurrentChainId(): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;
  try {
    return await window.ethereum.request({ method: 'eth_chainId' });
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
}

// Function to check if we're on eduChain
export async function isOnEduChain(): Promise<boolean> {
  const chainId = await getCurrentChainId();
  return chainId === EDU_CHAIN_CONFIG.chainId;
}

// Function to switch to eduChain network
export async function switchToEduChain(): Promise<boolean> {
  if (!window.ethereum) return false;
  
  try {
    // Try to switch to eduChain network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: EDU_CHAIN_CONFIG.chainId }]
    });
    
    // Wait a moment for the chain to switch before checking
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify the switch was successful
    const chainId = await getCurrentChainId();
    return chainId === EDU_CHAIN_CONFIG.chainId;
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
        const chainId = await getCurrentChainId();
        return chainId === EDU_CHAIN_CONFIG.chainId;
      } catch (addError) {
        console.error('Error adding eduChain network to MetaMask:', addError);
        return false;
      }
    }
    console.error('Error switching to eduChain network:', switchError);
    return false;
  }
}

// Function to Connect Wallet
export async function connectWallet() {
  if (window.ethereum) {
    try {
      // Ensure user is on eduChain network
      const chainId = await getCurrentChainId();
      if (chainId !== EDU_CHAIN_CONFIG.chainId) {
        const switched = await switchToEduChain();
        if (!switched) throw new Error("Failed to switch to eduChain network");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      return signer;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error("MetaMask not installed");
  }
}

// Get Smart Contract Instance with better error handling
export async function getContract() {
  try {
    // Make sure we're on eduChain first
    const chainId = await getCurrentChainId();
    if (chainId !== EDU_CHAIN_CONFIG.chainId) {
      console.warn('Not on eduChain, attempting to switch...');
      const switched = await switchToEduChain();
      if (!switched) {
        throw new Error('Please switch to eduChain Testnet to interact with the contract');
      }
    }

    const signer = await connectWallet();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    // Verify contract methods
    console.log('Available contract methods:', Object.keys(contract));
    
    // Changed this check to work with ethers v6
    if (!contract.createChallenge) {
      throw new Error('Contract interface is incomplete. Please check network connection.');
    }
    
    return contract;
  } catch (error) {
    console.error('Error getting contract:', error);
    throw error;
  }
}

// Fetch User Balance (Total Staked)
export async function getUserBalance(userAddress: string): Promise<number> {
  try {
    if (!isMetaMaskInstalled()) return 0;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(userAddress);
    return Number(ethers.formatEther(balance));
  } catch (error) {
    console.error("Error getting balance:", error);
    return 0;
  }
}

// Enhanced error handling for contract calls with verbose logging
export function handleContractError(error: any): string {
  console.error('Contract error details:', error);
  
  // For debugging purposes, log the entire error object
  try {
    console.log('Error JSON representation:', JSON.stringify(error, null, 2));
  } catch (e) {
    console.log('Error cannot be stringified:', error);
  }
  
  // Contract method doesn't exist
  if (error.message && error.message.includes("undefined") && error.message.includes("createChallenge")) {
    return "Contract method 'createChallenge' is not available. Please make sure you're connected to eduChain Testnet (Chain ID: 0xa045c).";
  }
  
  // Check for eduChain network connection issues
  if (error.code === 'NETWORK_ERROR') {
    return "Network error. Please check your connection to eduChain Testnet and try again.";
  }
  
  // User rejected transaction
  if (error.code === 4001 || (error.message && error.message.includes('user rejected'))) {
    return "Transaction was rejected in your wallet.";
  }
  
  // JSON-RPC internal errors - typically indicate network or contract issues
  if (error.code === -32603 || (error.message && error.message.includes('Internal JSON-RPC error'))) {
    return "Transaction failed on the eduChain network. This could be due to contract limitations or network congestion. Try reducing the stake amount or simplifying participant list.";
  }

  // Look for nonce-related errors
  if (error.message && error.message.includes('nonce')) {
    return "Transaction nonce issue. Please reset your wallet's transaction history or try again later.";
  }
  
  // Insufficient funds
  if (error.message && (
    error.message.includes('insufficient funds') || 
    error.message.includes('exceeds balance')
  )) {
    return "Insufficient funds for this transaction. Make sure you have enough EDU tokens to cover the stake amount plus gas fees.";
  }

  // Gas estimation failures often indicate contract-level issues
  if (error.message && error.message.includes('estimate gas')) {
    return "Transaction would fail. The contract is rejecting this operation. Please ensure you are connected to eduChain Testnet (Chain ID: 0xa045c).";
  }
  
  // "Missing revert data" errors typically indicate chain/contract mismatch
  if (error.message && error.message.includes('missing revert data')) {
    return "Transaction failed. Please make sure you're connected to eduChain Testnet (Chain ID: 0xa045c) and try again with a lower stake amount.";
  }

  // "Could not coalesce error" typically indicates complex issues with the transaction
  if (error.message && error.message.includes('could not coalesce error')) {
    return "Transaction failed on the eduChain network. Try using a much smaller stake amount (0.001-0.01 EDU).";
  }
  
  // CALL_EXCEPTION typically means the contract function reverted
  if (error.code === 'CALL_EXCEPTION') {
    if (error.reason) {
      return `Smart contract error: ${error.reason}`;
    } 
    
    // Missing revert data errors
    if (error.message && error.message.includes('missing revert data')) {
      return "Transaction would fail. Please verify you're connected to eduChain Testnet (Chain ID: 0xa045c) and that your parameters are valid.";
    }
    
    return "The smart contract rejected this operation. Please verify your inputs and try again with a lower stake amount.";
  }

  // UNKNOWN_ERROR - could be various issues
  if (error.code === 'UNKNOWN_ERROR') {
    return "Unknown error occurred. This could be due to network issues or contract limitations. Try reducing the stake amount or simplifying the transaction.";
  }
  
  // Default fallback with more details
  return error.message || "An unknown error occurred. Please try again with a lower stake amount.";
}

// Helper function to safely estimate gas for contract calls
export async function safelyEstimateGas(contract: ethers.Contract, method: string, args: any[], options: any = {}): Promise<{ success: boolean, gasLimit?: bigint, error?: string }> {
  try {
    // First check if the method exists on the contract
    if (!contract[method]) {
      console.error(`Method ${method} doesn't exist on contract`);
      return {
        success: false,
        error: `Contract method '${method}' is not available. Please make sure you're connected to eduChain Testnet.`
      };
    }
    
    // Try to estimate the gas
    const gasEstimate = await contract.estimateGas[method](...args, options);
    
    // Add a buffer to the gas estimate (30% more for eduChain)
    const gasLimit = gasEstimate * BigInt(130) / BigInt(100);
    
    return {
      success: true,
      gasLimit
    };
  } catch (error: any) {
    console.error(`Gas estimation failed for ${method}:`, error);
    return {
      success: false,
      error: handleContractError(error)
    };
  }
}

// Helper function to safely execute contract calls with proper gas estimation
export async function safeContractCall(contract: ethers.Contract, method: string, args: any[], options: any = {}): Promise<{ success: boolean, result?: any, error?: string }> {
  try {
    // First check if the method exists on the contract
    if (!contract[method]) {
      console.error(`Method ${method} doesn't exist on contract`);
      return {
        success: false,
        error: `Contract method '${method}' is not available. Please make sure you're connected to eduChain Testnet.`
      };
    }
    
    // Log available methods for debugging
    console.log("Available contract methods:", Object.keys(contract || {}));
    
    // First, make sure we're on the right network
    const isOnCorrectNetwork = await isOnEduChain();
    if (!isOnCorrectNetwork) {
      const switched = await switchToEduChain();
      if (!switched) {
        return {
          success: false,
          error: "Failed to switch to eduChain network. Please switch manually in your wallet."
        };
      }
    }
    
    // Try to estimate gas first
    const gasEstimation = await safelyEstimateGas(contract, method, args, options);
    if (!gasEstimation.success) {
      return {
        success: false,
        error: gasEstimation.error
      };
    }
    
    // Adjust options with our gas estimate
    const callOptions = {
      ...options,
      gasLimit: gasEstimation.gasLimit
    };
    
    // Make the actual contract call
    const tx = await contract[method](...args, callOptions);
    const receipt = await tx.wait();
    
    return {
      success: true,
      result: receipt
    };
  } catch (error: any) {
    console.error(`Contract call failed for ${method}:`, error);
    return {
      success: false,
      error: handleContractError(error)
    };
  }
}
