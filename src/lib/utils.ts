import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

// Smart Contract Details (Replace with Your Contract Address & ABI)
const CONTRACT_ADDRESS = "YOUR_SMART_CONTRACT_ADDRESS_HERE";
const CONTRACT_ABI = [
  // Add your smart contract ABI here
];

// Classname utility function (for Tailwind)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

// Fetch User Balance (Total Staked)
export async function getUserBalance(userAddress: string): Promise<number> {
  const contract = await getContract();
  return await contract.balanceOf(userAddress); // Modify based on your contract method
}

// Fetch Challenges for Logged-in Wallet
export async function getUserChallenges(userAddress: string) {
  const contract = await getContract();
  const challengeCount = await contract.getChallengeCount(); // Adjust if needed

  let userChallenges = [];
  for (let i = 0; i < challengeCount; i++) {
    const challenge = await contract.getChallenge(i);
    if (challenge.allowedParticipants.includes(userAddress)) {
      userChallenges.push(challenge);
    }
  }
  return userChallenges;
}

// Join Challenge by Staking
export async function joinChallenge(challengeId: number, stakeAmount: number) {
  const contract = await getContract();
  const tx = await contract.joinChallenge(challengeId, { value: ethers.parseEther(stakeAmount.toString()) });
  await tx.wait();
}

// Mark Milestone as Completed
export async function completeMilestone(challengeId: number, milestoneIndex: number) {
  const contract = await getContract();
  const tx = await contract.setMilestoneWinner(challengeId, milestoneIndex, await contract.signer.getAddress());
  await tx.wait();
}

// Withdraw Remaining Balance After Challenge Ends
export async function withdrawBalance(challengeId: number) {
  const contract = await getContract();
  const tx = await contract.withdrawRemainingBalance(challengeId);
  await tx.wait();
}
