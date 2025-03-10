
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

// Smart Contract Details (Replace with Your Contract Address & ABI)
const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165";
const CONTRACT_ABI = [
  // Add your smart contract ABI here
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

// Function to Connect Wallet
export async function connectWallet() {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = await provider.getSigner();
    return signer;
  } else {
    throw new Error("MetaMask not installed");
  }
}

// Get Smart Contract Instance
export async function getContract() {
  const signer = await connectWallet();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// The following functions would need to be updated to match your actual contract
// Since we don't have a matching contract, we'll provide placeholder implementations

// Fetch User Balance (Total Staked)
export async function getUserBalance(userAddress: string): Promise<number> {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(userAddress);
    return Number(ethers.formatEther(balance));
  } catch (error) {
    console.error("Error getting balance:", error);
    return 0;
  }
}

// Fetch Challenges for Logged-in Wallet
export async function getUserChallenges(userAddress: string) {
  // This would need to match your contract's actual function
  // Placeholder implementation
  return [];
}

// Join Challenge by Staking
export async function joinChallenge(challengeId: number, stakeAmount: number) {
  const contract = await getContract();
  const tx = await contract.joinChallenge(challengeId, { 
    value: ethers.parseEther(stakeAmount.toString()) 
  });
  await tx.wait();
}

// Mark Milestone as Completed
export async function completeMilestone(challengeId: number, milestoneIndex: number) {
  const contract = await getContract();
  const signer = await connectWallet();
  const address = await signer.getAddress();
  const tx = await contract.setMilestoneWinner(challengeId, milestoneIndex, address);
  await tx.wait();
}

// Withdraw Remaining Balance After Challenge Ends
export async function withdrawBalance(challengeId: number) {
  const contract = await getContract();
  const tx = await contract.withdrawRemainingBalance(challengeId);
  await tx.wait();
}
