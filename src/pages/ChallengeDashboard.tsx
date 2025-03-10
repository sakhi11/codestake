
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { useWeb3 } from "@/context/Web3Provider";
import { ethers } from "ethers";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { shortenAddress } from "@/lib/utils";
import { 
  Trophy,
  Calendar as CalendarIcon,
  BadgeCheck as BadgeCheckIcon,
  BookOpen as BookOpenIcon,
  Lock as LockIcon,
  AlertTriangle as AlertTriangleIcon,
  Gift as GiftIcon
} from "lucide-react";
import { toast } from "sonner";
import CodeEditor from "@/components/quiz/CodeEditor";

// Import the Quiz modal
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const PLACEHOLDER_MILESTONES = [
  {
    id: 1,
    name: "Complete Setup",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    isComplete: true,
    isUnlocked: true,
    reward: 0.2,
  },
  {
    id: 2,
    name: "Build Core Features",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isComplete: false,
    isUnlocked: true,
    reward: 0.3,
  },
  {
    id: 3,
    name: "Complete Testing",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isComplete: false,
    isUnlocked: false,
    reward: 0.5,
  },
];

const PLACEHOLDER_PARTICIPANTS = [
  {
    address: "0xABc34597832b345B28a12389743f55DB12449076",
    avatar: "https://robohash.org/1",
    name: "Alice",
    milestonesCompleted: 1,
  },
  {
    address: "0xBCd56708943c567D89a123456789012345678901",
    avatar: "https://robohash.org/2",
    name: "Bob",
    milestonesCompleted: 0,
  },
  {
    address: "0xDEf78901234567890123456789012345678901234",
    avatar: "https://robohash.org/3",
    name: "Charlie",
    milestonesCompleted: 0,
  },
];

const ChallengeDashboard = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { wallet, contract, isConnected } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<any>(null);
  const [milestones, setMilestones] = useState(PLACEHOLDER_MILESTONES);
  const [participants, setParticipants] = useState(PLACEHOLDER_PARTICIPANTS);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<any>(null);
  const [connectWalletPrompt, setConnectWalletPrompt] = useState(false);

  // Fetch challenge data
  useEffect(() => {
    if (contract && challengeId) {
      fetchChallengeData();
    } else if (!isConnected) {
      setConnectWalletPrompt(true);
    }
    // For demo purposes, we'll set loading to false after a delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [contract, challengeId, isConnected]);

  const fetchChallengeData = async () => {
    try {
      setLoading(true);
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      // Try to get challenge details from the contract
      const details = await contract.getChallengeDetails(challengeId);
      console.log("Challenge details:", details);
      
      // If we got details, we can use them to update our state
      // For now, we'll just use placeholder data
      setChallenge({
        id: challengeId,
        name: `Challenge #${challengeId}`,
        description: "Complete a series of programming challenges to earn rewards and improve your skills.",
        track: "javascript",
        totalStake: 1.0,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        progress: 33,
        creator: PLACEHOLDER_PARTICIPANTS[0].address,
      });

      // We could also fetch milestone and participant details here
      // For now, we'll use our placeholder data
      
    } catch (error) {
      console.error("Error fetching challenge data:", error);
      // Use placeholder data if there's an error
      setChallenge({
        id: challengeId || "1",
        name: `Challenge #${challengeId || "1"}`,
        description: "Complete a series of programming challenges to earn rewards and improve your skills.",
        track: "javascript",
        totalStake: 1.0,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        progress: 33,
        creator: PLACEHOLDER_PARTICIPANTS[0].address,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMilestone = (milestone: any) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to complete milestones");
      return;
    }

    // Open the quiz modal
    setCurrentMilestone(milestone);
    setIsQuizOpen(true);
  };

  const handleQuizComplete = (passed: boolean) => {
    setIsQuizOpen(false);
    if (passed && currentMilestone) {
      // Update milestone in state
      const updatedMilestones = milestones.map(m => 
        m.id === currentMilestone.id ? { ...m, isComplete: true } : m
      );
      
      // Unlock next milestone if there is one
      const currentIndex = milestones.findIndex(m => m.id === currentMilestone.id);
      if (currentIndex < milestones.length - 1) {
        updatedMilestones[currentIndex + 1].isUnlocked = true;
      }
      
      setMilestones(updatedMilestones);
      toast.success(`Milestone "${currentMilestone.name}" completed!`);

      // Update challenge progress
      const completedCount = updatedMilestones.filter(m => m.isComplete).length;
      const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
      setChallenge(prev => ({ ...prev, progress: newProgress }));

      // Update participant milestone count
      const updatedParticipants = participants.map(p => 
        p.address === wallet ? { ...p, milestonesCompleted: p.milestonesCompleted + 1 } : p
      );
      setParticipants(updatedParticipants);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-web3-blue"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (connectWalletPrompt) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <AlertTriangleIcon className="h-12 w-12 text-web3-orange mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-white/70 mb-6">Please connect your wallet to view challenge details</p>
            <Button className="bg-web3-blue hover:bg-web3-blue/80" onClick={() => setConnectWalletPrompt(false)}>
              Try Again
            </Button>
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
            <AlertTriangleIcon className="h-12 w-12 text-web3-orange mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Challenge Not Found</h2>
            <p className="text-white/70 mb-6">The challenge you're looking for doesn't exist or has been removed</p>
            <Link to="/dashboard">
              <Button className="bg-web3-blue hover:bg-web3-blue/80">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address={wallet} />
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Challenge Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{challenge.name}</h1>
              <div className="flex items-center text-gray-300 mb-4">
                <Badge className="mr-2 bg-web3-blue text-white">
                  {challenge.track}
                </Badge>
                <span className="flex items-center mr-4">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {challenge.startDate.toLocaleDateString()} - {challenge.endDate.toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1 text-web3-orange" />
                  {challenge.totalStake} ETH
                </span>
              </div>
              <p className="text-gray-400">{challenge.description}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/dashboard">
                <Button variant="outline" className="border-white/20 hover:bg-white/5">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Challenge Progress</span>
              <span className="text-sm text-white">{challenge.progress}%</span>
            </div>
            <Progress value={challenge.progress} className="h-2" />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="milestones" className="mt-8">
          <TabsList className="grid grid-cols-2 gap-4 mb-8 bg-transparent">
            <TabsTrigger
              value="milestones"
              className="data-[state=active]:bg-web3-blue data-[state=active]:text-white bg-web3-card text-gray-300 border border-white/10"
            >
              <BookOpenIcon className="h-4 w-4 mr-2" />
              Milestones
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="data-[state=active]:bg-web3-blue data-[state=active]:text-white bg-web3-card text-gray-300 border border-white/10"
            >
              <BadgeCheckIcon className="h-4 w-4 mr-2" />
              Participants
            </TabsTrigger>
          </TabsList>

          {/* Milestones Content */}
          <TabsContent value="milestones" className="space-y-6">
            {milestones.map(milestone => (
              <Card key={milestone.id} className="glassmorphism border border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    {milestone.isComplete ? (
                      <BadgeCheckIcon className="h-5 w-5 mr-2 text-green-500" />
                    ) : milestone.isUnlocked ? (
                      <BookOpenIcon className="h-5 w-5 mr-2 text-web3-blue" />
                    ) : (
                      <LockIcon className="h-5 w-5 mr-2 text-gray-500" />
                    )}
                    {milestone.name}
                  </CardTitle>
                  <Badge className={`${milestone.isComplete ? 'bg-green-500' : milestone.isUnlocked ? 'bg-web3-blue' : 'bg-gray-700'}`}>
                    {milestone.isComplete ? 'Completed' : milestone.isUnlocked ? 'In Progress' : 'Locked'}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Due: {milestone.dueDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-web3-orange">
                      <GiftIcon className="h-4 w-4 mr-1" />
                      Reward: {milestone.reward} ETH
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleCompleteMilestone(milestone)}
                    disabled={!milestone.isUnlocked || milestone.isComplete}
                    variant={milestone.isComplete ? "outline" : "default"}
                    className={milestone.isComplete 
                      ? "w-full border-green-500 text-green-500 hover:text-green-400 hover:border-green-400" 
                      : milestone.isUnlocked 
                      ? "w-full bg-web3-blue hover:bg-web3-blue/80" 
                      : "w-full bg-gray-700 text-gray-400 cursor-not-allowed"
                    }
                  >
                    {milestone.isComplete 
                      ? "Completed" 
                      : milestone.isUnlocked 
                      ? "Complete Milestone" 
                      : "Locked"
                    }
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          {/* Participants Content */}
          <TabsContent value="participants" className="space-y-6">
            {participants.map((participant, index) => (
              <Card key={index} className="glassmorphism border border-white/10">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <img 
                          src={participant.avatar} 
                          alt={`Avatar of ${participant.name}`} 
                          className="w-12 h-12 rounded-full border-2 border-web3-blue"
                        />
                        {challenge.creator === participant.address && (
                          <div className="absolute -top-1 -right-1 bg-web3-orange text-xs text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center">
                            <Trophy className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-white">{participant.name}</h3>
                        <p className="text-sm text-gray-400">{shortenAddress(participant.address)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Milestones Completed</p>
                      <div className="flex items-center justify-end mt-1">
                        <span className="font-medium text-white mr-2">
                          {participant.milestonesCompleted} / {milestones.length}
                        </span>
                        {participant.milestonesCompleted > 0 && (
                          <BadgeCheckIcon className="h-4 w-4 text-green-500" />
                        )}
                        {participant.milestonesCompleted === 0 && (
                          <LockIcon className="h-4 w-4 text-gray-500" />
                        )}
                        {participant.milestonesCompleted === milestones.length && (
                          <GiftIcon className="h-4 w-4 text-web3-orange ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Quiz Modal */}
      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="sm:max-w-[600px] bg-web3-card border border-white/10 text-white">
          <DialogTitle>Complete Milestone: {currentMilestone?.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Solve the challenge to complete this milestone
          </DialogDescription>
          
          <div className="mt-4">
            <CodeEditor 
              initialCode="// Write your solution here\nfunction solution() {\n  // Your code\n  return true;\n}"
              language="javascript"
              onSubmit={(code) => {
                // In a real app, we would validate the code
                // For this demo, we'll just auto-pass
                handleQuizComplete(true);
              }}
            />
          </div>
          
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="outline" onClick={() => setIsQuizOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleQuizComplete(true)}>
              Submit Solution
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ChallengeDashboard;
