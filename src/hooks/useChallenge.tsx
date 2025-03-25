import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Provider';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/utils';

export interface ChallengeDetails {
  id: number;
  name: string;
  track: string;
  creator: string;
  player1?: string;
  player2?: string;
  startDate: number;
  endDate: number;
  stakedAmount: number;
  totalStake: number;
  isActive: boolean;
  milestones?: any[];
}

export const useChallenge = () => {
  const { provider, signer, address, isConnected, contract, networkDetails } = useWeb3();
  const [challenges, setChallenges] = useState<Record<number, ChallengeDetails>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const getChallengeDetails = useCallback(async (challengeId: number) => {
    if (!isConnected || !signer || !contract) {
      setLastError("Wallet not connected");
      return null;
    }

    if (!networkDetails.isCorrectNetwork) {
      setLastError(`Please switch to the ${networkDetails.name} network`);
      return null;
    }

    try {
      setIsLoading(true);
      setLastError(null);
      
      // Call the contract to get challenge details
      let challengeDetails;
      
      try {
        // The actual contract call
        console.log("Fetching challenge details for ID:", challengeId);
        challengeDetails = await contract.challenges(challengeId);
        console.log("Challenge details received:", challengeDetails);
      } catch (error: any) {
        console.error("Error fetching from contract:", error);
        setLastError(`Contract error: ${error.message || "Unknown error"}`);
        
        // Mock data as fallback
        challengeDetails = {
          name: `Challenge ${challengeId}`,
          track: "Web Development",
          creator: address,
          startDate: Math.floor(Date.now() / 1000) - 86400, // Yesterday
          endDate: Math.floor(Date.now() / 1000) + 604800, // 1 week from now
          stakedAmount: ethers.parseEther("0.5"),
          totalStake: ethers.parseEther("1.0"),
          isActive: true
        };
        console.log("Using mock data instead:", challengeDetails);
      }
      
      // Process the challenge details
      const challenge: ChallengeDetails = {
        id: challengeId,
        name: challengeDetails.name || `Challenge ${challengeId}`,
        track: challengeDetails.track || "Web Development",
        creator: challengeDetails.creator || address,
        startDate: Number(challengeDetails.startDate) || Math.floor(Date.now() / 1000) - 86400,
        endDate: Number(challengeDetails.endDate) || Math.floor(Date.now() / 1000) + 604800,
        stakedAmount: Number(ethers.formatEther(challengeDetails.stakedAmount || 0)),
        totalStake: Number(ethers.formatEther(challengeDetails.totalStake || 0)),
        isActive: challengeDetails.isActive
      };
      
      // Update the challenges state
      setChallenges(prev => ({
        ...prev,
        [challengeId]: challenge
      }));
      
      return challenge;
    } catch (error: any) {
      console.error(`Error getting challenge ${challengeId} details:`, error);
      setLastError(`Error getting challenge details: ${error.message || "Unknown error"}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, signer, contract, address, networkDetails]);

  const getActiveChallenges = useCallback(async () => {
    if (!isConnected || !contract) {
      return [];
    }

    if (!networkDetails.isCorrectNetwork) {
      toast.error(`Please switch to the ${networkDetails.name} network`);
      return [];
    }

    try {
      setIsLoading(true);
      setLastError(null);
      console.log("Fetching active challenges...");
      
      // Try to get active challenges from contract
      try {
        const activeChallenges = await contract.getActiveChallenges();
        console.log("Active challenges:", activeChallenges);
        return activeChallenges.map((id: ethers.BigNumberish) => Number(id));
      } catch (error: any) {
        console.error("Error fetching active challenges:", error);
        setLastError(`Contract error: ${error.message || "Unknown error"}`);
        // Return mock data
        console.log("Using mock challenge IDs");
        return [1, 2, 3];
      }
    } catch (error: any) {
      console.error("Error getting active challenges:", error);
      setLastError(`Error getting challenges: ${error.message || "Unknown error"}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, contract, networkDetails]);

  const createChallenge = useCallback(async (
    player1: string,
    player2: string,
    stakeAmount: string,
    track: string
  ) => {
    if (!isConnected || !signer || !contract) {
      toast.error("Wallet not connected");
      return false;
    }

    if (!networkDetails.isCorrectNetwork) {
      toast.error(`Please switch to the ${networkDetails.name} network`);
      return false;
    }

    if (!ethers.isAddress(player1) || !ethers.isAddress(player2)) {
      toast.error("Invalid ethereum addresses provided");
      return false;
    }

    if (player1.toLowerCase() === player2.toLowerCase()) {
      toast.error("Player 1 and Player 2 must be different");
      return false;
    }

    try {
      setIsLoading(true);
      setLastError(null);
      
      // Convert stake amount to wei
      const amountInWei = ethers.parseEther(stakeAmount);
      console.log("Creating challenge with stake:", stakeAmount, "ETH");
      console.log("Players:", player1, player2);
      console.log("Track:", track);
      
      // Call the contract to create a challenge
      try {
        console.log("Sending transaction to contract...");
        
        // Calculate milestone dates (4 milestones, 1 week apart)
        const now = Math.floor(Date.now() / 1000);
        const milestoneTimestamps = [
          now + (7 * 24 * 60 * 60),    // 1 week
          now + (14 * 24 * 60 * 60),   // 2 weeks
          now + (21 * 24 * 60 * 60),   // 3 weeks
          now + (28 * 24 * 60 * 60)    // 4 weeks
        ];
        
        // Create challenge transaction
        const tx = await contract.createChallenge(
          amountInWei,
          2, // totalPlayers (fixed at 2)
          [player1, player2],
          milestoneTimestamps,
          { value: amountInWei }
        );
        
        console.log("Transaction sent:", tx.hash);
        toast.success("Transaction sent! Waiting for confirmation...");
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        
        toast.success("Challenge created successfully!");
        return true;
      } catch (error: any) {
        console.error("Contract error creating challenge:", error);
        
        // Check for common errors
        if (error.message?.includes("insufficient funds")) {
          toast.error("Insufficient funds to create challenge");
        } else if (error.message?.includes("user rejected")) {
          toast.error("Transaction was rejected");
        } else {
          toast.error(`Failed to create challenge: ${error.message || "Unknown error"}`);
        }
        
        setLastError(`Contract error: ${error.message || "Unknown error"}`);
        return false;
      }
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      toast.error(`Failed to create challenge: ${error.message || "Unknown error"}`);
      setLastError(`Error: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, signer, contract, networkDetails]);

  const completeMilestone = useCallback(async (
    challengeId: number,
    milestoneIndex: number
  ) => {
    if (!isConnected || !signer || !contract) {
      toast.error("Wallet not connected");
      return false;
    }

    try {
      setIsLoading(true);
      
      // Call the contract to complete a milestone
      try {
        const tx = await contract.completeMilestone(challengeId, milestoneIndex);
        await tx.wait();
        toast.success("Milestone completed successfully!");
        return true;
      } catch (error: any) {
        console.error("Contract error completing milestone:", error);
        toast.error(`Failed to complete milestone: ${error.message || "Unknown error"}`);
        return false;
      }
    } catch (error: any) {
      console.error("Error completing milestone:", error);
      toast.error(`Failed to complete milestone: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, signer, contract]);

  return {
    challenges,
    isLoading,
    lastError,
    getChallengeDetails,
    getActiveChallenges,
    createChallenge,
    completeMilestone
  };
};

export default useChallenge;
