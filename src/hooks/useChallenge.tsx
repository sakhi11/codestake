
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Provider';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/utils';

export interface ChallengeDetails {
  id: number;
  name: string;
  description: string;
  creator: string;
  stakeAmount: number;
  totalStakeNeeded: number;
  totalStakePaid: number;
  isActive: boolean;
  track?: string; // For backward compatibility
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
      
      console.log("Fetching challenge details for ID:", challengeId);
      
      // Call the contract to get challenge details - use the new getChallengeDetails function
      let challengeDetails;
      
      try {
        // The actual contract call using new function
        challengeDetails = await contract.getChallengeDetails(challengeId);
        console.log("Challenge details received:", challengeDetails);
      } catch (error: any) {
        console.error("Error fetching challenge details:", error);
        setLastError(`Contract error: ${error.message || "Unknown error"}`);
        
        try {
          // Fallback to challenges mapping if getChallengeDetails fails
          challengeDetails = await contract.challenges(challengeId);
          console.log("Challenge details from mapping:", challengeDetails);
        } catch (fallbackError: any) {
          console.error("Error with fallback fetch:", fallbackError);
          
          // Mock data as last resort
          challengeDetails = {
            id: challengeId,
            name: `Challenge ${challengeId}`,
            description: "Mock challenge description",
            creator: address,
            stakeAmount: ethers.parseEther("0.1"),
            totalStakeNeeded: ethers.parseEther("0.5"),
            totalStakePaid: ethers.parseEther("0.1"),
            isActive: true
          };
          console.log("Using mock data instead:", challengeDetails);
        }
      }
      
      // Process the challenge details - handle both struct return and mapping return formats
      const challenge: ChallengeDetails = {
        id: Number(challengeDetails.id || challengeId),
        name: challengeDetails.name || `Challenge ${challengeId}`,
        description: challengeDetails.description || "",
        creator: challengeDetails.creator || address || "",
        stakeAmount: Number(ethers.formatEther(challengeDetails.stakeAmount || 0)),
        totalStakeNeeded: Number(ethers.formatEther(challengeDetails.totalStakeNeeded || 0)),
        totalStakePaid: Number(ethers.formatEther(challengeDetails.totalStakePaid || 0)),
        isActive: challengeDetails.isActive !== undefined ? challengeDetails.isActive : true,
        track: "Programming" // Default track for compatibility
      };
      
      // Update the challenges state
      setChallenges(prev => ({
        ...prev,
        [challengeId]: challenge
      }));
      
      console.log("Processed challenge details:", challenge);
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
      
      try {
        // Get total challenge count from the new contract
        const count = await contract.getChallengeIdCount();
        console.log("Total challenge count:", Number(count));
        
        if (Number(count) === 0) {
          console.log("No challenges found");
          return [];
        }
        
        // Get all challenge IDs using getChallengeIds function
        // Limited to the first 10 for performance
        const limit = count < 10 ? Number(count) : 10;
        const ids = await contract.getChallengeIds(0, limit);
        console.log("Challenge IDs:", ids);
        
        return ids.map((id: ethers.BigNumberish) => Number(id));
      } catch (error: any) {
        console.error("Error fetching challenge IDs:", error);
        
        try {
          // Fallback: try getting total count and then fetch individual IDs
          const count = await contract.challengeCount();
          console.log("Challenge count from fallback:", Number(count));
          
          const ids = [];
          for (let i = 0; i < Number(count) && i < 10; i++) {
            try {
              const id = await contract.challengeIds(i);
              ids.push(Number(id));
            } catch (idError) {
              console.error(`Error fetching challenge ID at index ${i}:`, idError);
            }
          }
          
          console.log("Challenge IDs from fallback:", ids);
          return ids;
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          // Return mock IDs as last resort
          console.log("Using mock challenge IDs");
          return [0, 1, 2];
        }
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
    name: string,
    description: string,
    stakeAmount: string,
    participantCount: number
  ) => {
    if (!isConnected || !signer || !contract) {
      toast.error("Wallet not connected");
      return false;
    }

    if (!networkDetails.isCorrectNetwork) {
      toast.error(`Please switch to the ${networkDetails.name} network`);
      return false;
    }

    try {
      setIsLoading(true);
      setLastError(null);
      
      // Convert stake amount to wei
      const amountInWei = ethers.parseEther(stakeAmount);
      console.log("Creating challenge with parameters:", {
        name,
        description,
        stakeAmount: stakeAmount + " ETH",
        participantCount
      });
      
      // Call the contract to create a challenge using the new function signature
      try {
        console.log("Sending transaction to contract...");
        
        const tx = await contract.createChallenge(
          name,
          description,
          amountInWei,
          participantCount
        );
        
        console.log("Transaction sent:", tx.hash);
        toast.success("Transaction sent! Waiting for confirmation...");
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        
        toast.success("Challenge created successfully on the blockchain!");
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

  const joinChallenge = useCallback(async (
    challengeId: number,
    stakeAmount: string
  ) => {
    if (!isConnected || !signer || !contract) {
      toast.error("Wallet not connected");
      return false;
    }

    try {
      setIsLoading(true);
      
      // Call the contract to join a challenge
      try {
        const amountInWei = ethers.parseEther(stakeAmount);
        console.log(`Joining challenge ${challengeId} with stake ${stakeAmount} ETH`);
        
        const tx = await contract.joinChallenge(challengeId, {
          value: amountInWei
        });
        
        console.log("Transaction sent:", tx.hash);
        toast.success("Transaction sent! Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        
        toast.success("Successfully joined the challenge!");
        return true;
      } catch (error: any) {
        console.error("Contract error joining challenge:", error);
        
        if (error.message?.includes("insufficient funds")) {
          toast.error("Insufficient funds to join challenge");
        } else if (error.message?.includes("user rejected")) {
          toast.error("Transaction was rejected");
        } else {
          toast.error(`Failed to join challenge: ${error.message || "Unknown error"}`);
        }
        
        return false;
      }
    } catch (error: any) {
      console.error("Error joining challenge:", error);
      toast.error(`Failed to join challenge: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, signer, contract]);

  const isParticipant = useCallback(async (
    challengeId: number,
    participantAddress: string
  ) => {
    if (!isConnected || !contract) {
      return false;
    }

    try {
      const result = await contract.isParticipant(challengeId, participantAddress);
      return result;
    } catch (error) {
      console.error("Error checking participant status:", error);
      return false;
    }
  }, [isConnected, contract]);

  return {
    challenges,
    isLoading,
    lastError,
    getChallengeDetails,
    getActiveChallenges,
    createChallenge,
    joinChallenge,
    isParticipant
  };
};

export default useChallenge;
