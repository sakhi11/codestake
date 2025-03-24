
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
  const { provider, signer, address, isConnected, contract } = useWeb3();
  const [challenges, setChallenges] = useState<Record<number, ChallengeDetails>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getChallengeDetails = useCallback(async (challengeId: number) => {
    if (!isConnected || !signer || !contract) {
      toast.error("Wallet not connected");
      return null;
    }

    try {
      setIsLoading(true);
      
      // Call the contract to get challenge details
      let challengeDetails;
      
      try {
        // The actual contract call
        challengeDetails = await contract.challenges(challengeId);
      } catch (error) {
        console.error("Error fetching from contract, using mock data", error);
        
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
    } catch (error) {
      console.error(`Error getting challenge ${challengeId} details:`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, signer, contract, address]);

  const getActiveChallenges = useCallback(async () => {
    if (!isConnected || !contract) {
      return [];
    }

    try {
      // Try to get active challenges from contract
      try {
        const activeChallenges = await contract.getActiveChallenges();
        return activeChallenges.map((id: ethers.BigNumberish) => Number(id));
      } catch (error) {
        console.error("Error fetching active challenges, using mock data", error);
        // Return mock data
        return [1, 2, 3];
      }
    } catch (error) {
      console.error("Error getting active challenges:", error);
      return [];
    }
  }, [isConnected, contract]);

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

    try {
      setIsLoading(true);
      const amountInWei = ethers.parseEther(stakeAmount);
      
      // Call the contract to create a challenge
      try {
        const tx = await contract.createChallenge(player1, player2, amountInWei, { value: amountInWei });
        await tx.wait();
        toast.success("Challenge created successfully!");
        return true;
      } catch (error: any) {
        console.error("Contract error creating challenge:", error);
        toast.error(`Failed to create challenge: ${error.message || "Unknown error"}`);
        return false;
      }
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      toast.error(`Failed to create challenge: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, signer, contract]);

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
    getChallengeDetails,
    getActiveChallenges,
    createChallenge,
    completeMilestone
  };
};

export default useChallenge;
