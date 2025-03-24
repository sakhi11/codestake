
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

// Smart Contract Details - update ABI to match actual contract
const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165";
const CONTRACT_ABI = [
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

// Utility function to combine Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eduChain network configuration for MetaMask
export const EDU_CHAIN_CONFIG = {
  chainId: "0x7A69",
  chainName: "eduChain Testnet",
  nativeCurrency: {
    name: "eduChain Token",
    symbol: "EDU",
    decimals: 18,
  },
  rpcUrls: ["http://localhost:8545"],
  blockExplorerUrls: ["http://localhost:8545"],
};

// Utility function to format wallet address for display
export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Utility function to format ETH value with specified decimal places
export function formatEth(value: string | number, decimals: number = 4): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  return value.toFixed(decimals);
}

export { CONTRACT_ADDRESS, CONTRACT_ABI };
