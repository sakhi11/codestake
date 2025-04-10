
import React, { useEffect, useState } from 'react';
import { useWeb3 } from "@/context/Web3Provider";
import { useChallenge } from "@/hooks/useChallenge";
import { formatEth, shortenAddress } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, User, Info } from "lucide-react";

const OngoingChallenges = () => {
  const { address, isConnected } = useWeb3();
  const { challenges, getChallengeDetails, getActiveChallenges } = useChallenge();
  const [activeChallengeIds, setActiveChallengeIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveChallenges = async () => {
      if (isConnected) {
        setIsLoading(true);
        try {
          console.log("Fetching active challenge IDs");
          const ids = await getActiveChallenges();
          console.log("Received active challenge IDs:", ids);
          setActiveChallengeIds(ids.map(Number));
        } catch (error) {
          console.error("Failed to fetch active challenge IDs:", error);
          toast.error("Failed to fetch active challenges.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchActiveChallenges();
  }, [isConnected, getActiveChallenges]);

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      if (activeChallengeIds.length > 0) {
        setIsLoading(true);
        try {
          console.log("Fetching details for", activeChallengeIds.length, "challenges");
          await Promise.all(
            activeChallengeIds.map(async (challengeId) => {
              if (!challenges[challengeId]) {
                console.log(`Fetching details for challenge ID: ${challengeId}`);
                await getChallengeDetails(challengeId);
              }
            })
          );
          console.log("Challenge details fetched successfully");
        } catch (error) {
          console.error("Failed to fetch challenge details:", error);
          toast.error("Failed to fetch challenge details.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchChallengeDetails();
  }, [activeChallengeIds, getChallengeDetails, challenges]);

  const navigateToChallenge = (challengeId: number) => {
    console.log(`Navigating to challenge ${challengeId}`);
    navigate(`/challenges/${challengeId}`);
  };

  if (isLoading && Object.keys(challenges).length === 0) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold text-white mb-4">Ongoing Challenges</h2>
        <div className="flex justify-center items-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-white">Loading challenges...</span>
        </div>
      </div>
    );
  }

  // Show message if no challenges found
  if (activeChallengeIds.length === 0 && !isLoading) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold text-white mb-4">Ongoing Challenges</h2>
        <Card className="border border-white/10 bg-web3-card">
          <CardContent className="pt-6">
            <p className="text-center text-white/70">No active challenges found. Create a new challenge to get started!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold text-white mb-4">Ongoing Challenges</h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {activeChallengeIds.map((challengeId) => {
          const challenge = challenges[challengeId];
          if (!challenge) {
            // Placeholder card while loading
            return (
              <Card key={`loading-${challengeId}`} className="border border-white/10 bg-web3-card animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-300/20 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300/20 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300/20 rounded"></div>
                    <div className="h-4 bg-gray-300/20 rounded"></div>
                    <div className="h-4 bg-gray-300/20 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          // Convert to numbers before division to fix TypeScript error
          const stakeProgress = (
            (Number(challenge.totalStakePaid) / 
            Number(challenge.totalStakeNeeded) || 0) * 100
          );

          return (
            <Card key={challengeId} className="border border-white/10 bg-web3-card hover:scale-[1.02] transition-transform duration-300 hover:shadow-[0_0_15px_rgba(74,144,226,0.15)]">
              <CardHeader>
                <CardTitle>{challenge.name || `Challenge ${challengeId}`}</CardTitle>
                <CardDescription>{challenge.description || "No description available"}</CardDescription>
              </CardHeader>
              <CardContent>
                <p><User className="inline h-4 w-4 mr-1" /> Creator: {shortenAddress(challenge.creator || "")}</p>
                <p>Stake Amount: {formatEth(challenge.stakeAmount || 0)} ETH</p>
                <p>Total Stake Needed: {formatEth(challenge.totalStakeNeeded || 0)} ETH</p>
                <p>Stake Paid: {formatEth(challenge.totalStakePaid || 0)} ETH</p>
                <div>
                  Stake Progress:
                  <Progress value={stakeProgress || 0} />
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button onClick={() => navigateToChallenge(challengeId)}>
                  View Challenge
                </Button>
                {challenge.isActive && (
                  <Button variant="outline">
                    <Info className="h-4 w-4 mr-1" /> Active
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OngoingChallenges;
