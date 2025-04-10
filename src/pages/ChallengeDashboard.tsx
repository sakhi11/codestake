
import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useWeb3 } from "@/context/Web3Provider";
import { useChallenge } from "@/hooks/useChallenge";
import { ethers } from "ethers";
import { useParams, useNavigate } from "react-router-dom";
import QuizModal from "@/components/quiz/QuizModal";
import Footer from "@/components/layout/Footer";
import { CheckCircle, XCircle, AlertCircle, Calendar, Zap, User, Users, Coins } from "lucide-react";
import { EDU_CHAIN_CONFIG, formatEth, shortenAddress } from "@/lib/utils";

interface MilestoneItem {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  quizLink: string;
  status: 'complete' | 'incomplete' | 'pending';
}

const ChallengeDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { wallet, contract, isConnected, switchToEduChain, networkDetails } = useWeb3();
  const { getChallengeDetails, joinChallenge, isParticipant } = useChallenge();
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoiningChallenge, setIsJoiningChallenge] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [walletBalance, setWalletBalance] = useState("0");

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !isConnected || !contract) return;
      
      setIsLoading(true);
      try {
        console.log(`Fetching details for challenge ID: ${id}`);
        const challengeData = await getChallengeDetails(Number(id));
        
        if (challengeData) {
          console.log("Challenge data received:", challengeData);
          setChallenge(challengeData);
          
          // Check if current user has joined
          if (wallet) {
            const joined = await isParticipant(Number(id), wallet);
            console.log("Has joined challenge:", joined);
            setHasJoined(joined);
          }
        } else {
          toast.error("Challenge not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching challenge details:", error);
        toast.error("Failed to load challenge details");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWalletBalance = async () => {
      if (!wallet) return;
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(wallet);
        setWalletBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchData();
    fetchWalletBalance();
  }, [id, isConnected, contract, wallet, getChallengeDetails, isParticipant, navigate]);

  const handleJoinChallenge = async () => {
    if (!id || !isConnected || !contract || !challenge) {
      toast.error("Cannot join challenge: missing required data");
      return;
    }
    
    if (!networkDetails.isCorrectNetwork) {
      toast.error(`Please switch to the ${networkDetails.name} network`);
      return;
    }
    
    setIsJoiningChallenge(true);
    try {
      const stakeAmount = challenge.stakeAmount.toString();
      console.log(`Joining challenge ${id} with stake amount ${stakeAmount} ETH`);
      
      const success = await joinChallenge(Number(id), stakeAmount);
      
      if (success) {
        toast.success("Successfully joined the challenge!");
        setHasJoined(true);
      }
    } catch (error: any) {
      console.error("Error joining challenge:", error);
      toast.error(error.message || "Failed to join challenge");
    } finally {
      setIsJoiningChallenge(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Loading Challenge</h2>
            <p className="text-white/70">Please wait while we fetch the challenge details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Challenge Not Found</h2>
            <p className="text-white/70">The challenge you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate stake progress
  const stakeProgress = challenge.totalStakePaid && challenge.totalStakeNeeded 
    ? (Number(challenge.totalStakePaid) / Number(challenge.totalStakeNeeded)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address={wallet} />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <Card className="glassmorphism border border-white/10">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {challenge.name || `Challenge ${id}`}
                  </CardTitle>
                  <CardDescription className="text-white/70 mt-2">
                    {challenge.description || "No description available"}
                  </CardDescription>
                </div>
                {challenge.isActive ? (
                  <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500">
                    Inactive
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-400" />
                    <h3 className="text-white font-medium">Creator</h3>
                  </div>
                  <p className="text-white/80 mt-2">{shortenAddress(challenge.creator)}</p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-yellow-400" />
                    <h3 className="text-white font-medium">Stake Amount</h3>
                  </div>
                  <p className="text-white/80 mt-2">{formatEth(challenge.stakeAmount)} ETH per participant</p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-400" />
                    <h3 className="text-white font-medium">Progress</h3>
                  </div>
                  <div className="mt-2">
                    <p className="text-white/80 mb-1">
                      {formatEth(challenge.totalStakePaid || 0)} / {formatEth(challenge.totalStakeNeeded || 0)} ETH collected
                    </p>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" 
                        style={{ width: `${stakeProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-web3-orange" />
                    <h3 className="text-white font-medium">Status</h3>
                  </div>
                  <p className="text-white/80 mt-2">
                    {hasJoined ? (
                      <span className="text-green-400">You have joined this challenge</span>
                    ) : (
                      <span>You have not joined this challenge yet</span>
                    )}
                  </p>
                </div>
              </div>

              {!hasJoined && challenge.isActive && (
                <Card className="border border-white/20 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Join Challenge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 mb-4">
                      To join this challenge, you need to stake {formatEth(challenge.stakeAmount)} ETH.
                      Your current wallet balance is {formatEth(walletBalance)} ETH.
                    </p>
                    
                    <Button
                      onClick={handleJoinChallenge}
                      disabled={isJoiningChallenge || Number(walletBalance) < Number(challenge.stakeAmount)}
                      className="w-full"
                      variant="gradient"
                    >
                      {isJoiningChallenge ? (
                        <>
                          <span className="mr-2">Joining...</span>
                          <span className="animate-spin">↻</span>
                        </>
                      ) : (
                        "Join Challenge"
                      )}
                    </Button>
                    
                    {Number(walletBalance) < Number(challenge.stakeAmount) && (
                      <p className="text-red-400 text-sm mt-2">
                        Insufficient balance. You need at least {formatEth(challenge.stakeAmount)} ETH to join.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChallengeDashboard;
