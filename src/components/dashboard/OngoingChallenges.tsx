import React, { useEffect, useState } from 'react';
import { useWeb3 } from "@/context/Web3Provider";
import { useChallenge } from "@/hooks/useChallenge";
import { formatEth, shortenAddress } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
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

const OngoingChallenges = () => {
  const { address, isConnected } = useWeb3();
  const { challenges, getChallengeDetails, getActiveChallenges } = useChallenge();
  const [activeChallengeIds, setActiveChallengeIds] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveChallenges = async () => {
      if (isConnected) {
        try {
          const ids = await getActiveChallenges();
          setActiveChallengeIds(ids.map(Number));
        } catch (error) {
          console.error("Failed to fetch active challenge IDs:", error);
          toast({
            title: "Error",
            description: "Failed to fetch active challenges.",
            variant: "destructive",
          });
        }
      }
    };

    fetchActiveChallenges();
  }, [isConnected, getActiveChallenges, toast]);

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      if (activeChallengeIds.length > 0) {
        try {
          await Promise.all(
            activeChallengeIds.map(async (challengeId) => {
              if (!challenges[challengeId]) {
                await getChallengeDetails(challengeId);
              }
            })
          );
        } catch (error) {
          console.error("Failed to fetch challenge details:", error);
          toast({
            title: "Error",
            description: "Failed to fetch challenge details.",
            variant: "destructive",
          });
        }
      }
    };

    fetchChallengeDetails();
  }, [activeChallengeIds, getChallengeDetails, challenges, toast]);

  const navigateToChallenge = (challengeId: number) => {
    navigate(`/challenges/${challengeId}`);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {activeChallengeIds.map((challengeId) => {
        const challenge = challenges[challengeId];
        if (!challenge) return null;

        const stakeProgress = (challenge.stakedAmount / challenge.totalStake) * 100;

        return (
          <Card key={challengeId} variant="hover">
            <CardHeader>
              <CardTitle>{challenge.name}</CardTitle>
              <CardDescription>Track: {challenge.track}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Creator: {shortenAddress(challenge.creator)}</p>
              <p>Start Date: {new Date(challenge.startDate * 1000).toLocaleDateString()}</p>
              <p>End Date: {new Date(challenge.endDate * 1000).toLocaleDateString()}</p>
              <p>Staked Amount: {formatEth(challenge.stakedAmount)} EDU</p>
              <p>Total Stake: {formatEth(challenge.totalStake)} EDU</p>
              <div>
                Stake Progress:
                <Progress value={stakeProgress} />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button onClick={() => navigateToChallenge(challengeId)}>
                View Challenge
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default OngoingChallenges;
