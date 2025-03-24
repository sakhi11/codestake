
import { useState, useCallback } from 'react';
import { useWeb3 } from '@/context/Web3Provider';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/utils';
import { ethers } from 'ethers';
import { toast } from './use-toast';

interface Challenge {
  id: number;
  name: string;
  track: string;
  creator: string;
  startDate: number;
  endDate: number;
  stakedAmount: string;
  totalStake: string;
  isActive: boolean;
}

export function useChallenge() {
  const { provider, signer, address, isConnected } = useWeb3();
  const [challenges, setChallenges] = useState<Record<number, Challenge>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getChallengeDetails = useCallback(async (challengeId: number) => {
    if (!provider || !isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const challenge = await contract.challenges(challengeId);
      
      const challengeData = {
        id: challengeId,
        name: challenge.name || `Challenge ${challengeId}`,
        track: challenge.track || "General",
        creator: challenge.creator,
        startDate: Number(challenge.startDate),
        endDate: Number(challenge.endDate),
        stakedAmount: challenge.stakedAmount.toString(),
        totalStake: challenge.totalStake.toString(),
        isActive: challenge.isActive,
      };

      setChallenges(prev => ({
        ...prev,
        [challengeId]: challengeData
      }));

      return challengeData;
    } catch (error) {
      console.error("Error fetching challenge details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch challenge details",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected]);

  const getActiveChallenges = useCallback(async () => {
    if (!provider || !isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return [];
    }

    try {
      setIsLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const activeChallengeIds = await contract.getActiveChallenges();
      return activeChallengeIds.map((id: ethers.BigNumberish) => Number(id));
    } catch (error) {
      console.error("Error fetching active challenges:", error);
      toast({
        title: "Error",
        description: "Failed to fetch active challenges",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected]);

  return {
    challenges,
    isLoading,
    getChallengeDetails,
    getActiveChallenges
  };
}
