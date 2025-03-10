
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

// Smart Contract Details - using our ABI from the Web3Provider
const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165";
const CONTRACT_ABI = [
  "function getChallengeDetails(uint256 _challengeId) view returns (address creator, uint256 totalStake, uint256 totalPlayers, uint256 joinedCount, uint256 balance, uint256 milestoneCount)",
  "function createChallenge(uint256 _totalStake, uint256 _totalPlayers, address[] _allowedParticipants, uint256[] _milestoneTimestamps) payable",
  "function joinChallenge(uint256 _challengeId) payable",
  "function setMilestoneWinner(uint256 _challengeId, uint256 _milestoneIndex, address _winner)",
  "function withdrawRemainingBalance(uint256 _challengeId)",
  "function challengeCounter() view returns (uint256)"
];

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

// Function to Connect Wallet
export async function connectWallet() {
  if (window.ethereum) {
    try {
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

// Get Smart Contract Instance
export async function getContract() {
  try {
    const signer = await connectWallet();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
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

// Helper for error handling in contract calls
export function handleContractError(error: any): string {
  console.error('Contract error:', error);
  
  // Network related errors
  if (error.code === 'NETWORK_ERROR') {
    return "Network error. Please check your connection and try again.";
  }
  
  // User rejected transaction
  if (error.code === 4001 || (error.message && error.message.includes('user rejected'))) {
    return "Transaction was rejected in your wallet.";
  }
  
  // Insufficient funds
  if (error.message && error.message.includes('insufficient funds')) {
    return "Insufficient funds for this transaction.";
  }

  // Gas estimation failures often indicate contract-level issues
  if (error.message && error.message.includes('estimate gas')) {
    return "Transaction would fail. The contract is rejecting this operation. Possible reasons: incorrect parameters, insufficient allowance, or contract restrictions.";
  }
  
  // CALL_EXCEPTION typically means the contract function reverted
  if (error.code === 'CALL_EXCEPTION') {
    if (error.reason) {
      return `Smart contract error: ${error.reason}`;
    } 
    
    // Missing revert data errors
    if (error.message && error.message.includes('missing revert data')) {
      return "Transaction would fail. Please check that you're connected to the correct network and that your parameters are valid.";
    }
    
    return "The smart contract rejected this operation. Please verify your inputs and try again.";
  }
  
  // Default fallback
  return error.message || "An unknown error occurred.";
}
