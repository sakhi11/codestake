import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, CheckSquare, Users, FileText, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useWeb3 } from "@/context/Web3Provider";
import { ethers } from "ethers";

// Contract configuration
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const ABI = [
  {
    "inputs": [{ "name": "challengeId", "type": "uint256" }],
    "name": "getChallengeDetails",
    "outputs": [
      {
        "components": [
          { "name": "name", "type": "string" },
          { "name": "stakedAmount", "type": "uint256" },
          { "name": "startDate", "type": "uint256" },
          { "name": "endDate", "type": "uint256" },
          { "name": "participants", "type": "address[]" },
          { "name": "track", "type": "string" },
          { "name": "isActive", "type": "bool" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "challengeId", "type": "uint256" },
      { "name": "milestoneId", "type": "uint256" }
    ],
    "name": "completeMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
  // Add other necessary contract functions
];

interface Challenge {
  id: string;
  name: string;
  stakedAmount: number;
  startDate: Date;
  endDate: Date;
  participants: Array<{
    address: string;
    avatar: string;
  }>;
  track: string;
  milestones: Array<{
    id: string;
    name: string;
    unlockDate: Date;
    reward: number;
    isUnlocked: boolean;
    isCompleted: boolean;
    firstCompletedBy: {
      address: string;
      timestamp: Date;
    } | null;
  }>;
  activityLog: Array<{
    action: string;
    milestone?: string;
    user?: string;
    timestamp: Date;
    reward?: number;
  }>;
}

const ChallengeDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { wallet, contract } = useWeb3();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<{id: string; name: string; reward: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const calculateProgress = () => {
    const completedMilestones = challenge?.milestones.filter(m => m.isCompleted).length || 0;
    return (completedMilestones / challenge?.milestones.length) * 100;
  };
  
  const handleAttemptQuiz = (milestoneId: string) => {
    const milestone = challenge?.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    if (!milestone.isUnlocked) {
      toast.error("This milestone is still locked!");
      return;
    }
    
    if (milestone.isCompleted) {
      toast.info("You've already completed this milestone!");
      return;
    }
    
    setCurrentMilestone({
      id: milestone.id,
      name: milestone.name,
      reward: milestone.reward
    });
    setQuizModalOpen(true);
    setExpandedMilestone(null);
  };
  
  const handleQuizComplete = async (passed: boolean) => {
    if (!currentMilestone || !challenge || !contract) return;

    if (!passed) {
      toast.error("You didn't pass the quiz. Try again later!");
      return;
    }

    try {
      const tx = await contract.completeMilestone(
        challenge.id,
        currentMilestone.id,
        { gasLimit: 300000 }
      );
      
      toast.loading("Submitting milestone completion...");
      await tx.wait();

      // Refresh challenge data
      await fetchChallengeData();
      
      setConfetti(true);
      toast.success("Milestone completed successfully!");
      
      setTimeout(() => {
        setConfetti(false);
      }, 4000);
    } catch (error: any) {
      console.error("Error completing milestone:", error);
      toast.error(error.reason || "Failed to complete milestone");
    }

    setQuizModalOpen(false);
  };
  
  const getTimeUntilUnlock = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return "Unlocked";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
  };

  useEffect(() => {
    if (contract && id) {
      fetchChallengeData();
    }
  }, [contract, id]);

  const fetchChallengeData = async () => {
    try {
      setIsLoading(true);
      const challengeData = await contract.getChallengeDetails(id);
      
      // Transform contract data to match our interface
      const transformedChallenge: Challenge = {
        id,
        name: challengeData.name,
        stakedAmount: Number(ethers.formatEther(challengeData.stakedAmount)),
        startDate: new Date(Number(challengeData.startDate) * 1000),
        endDate: new Date(Number(challengeData.endDate) * 1000),
        participants: challengeData.participants.map((addr: string) => ({
          address: addr,
          avatar: "/placeholder.svg" // You might want to fetch avatars from a service
        })),
        track: challengeData.track,
        milestones: await fetchMilestones(id),
        activityLog: await fetchActivityLog(id)
      };

      setChallenge(transformedChallenge);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      toast.error("Failed to load challenge data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMilestones = async (challengeId: string) => {
    try {
      const milestones = await contract.getChallengeMilestones(challengeId);
      return milestones.map((m: any) => ({
        id: m.id.toString(),
        name: m.name,
        unlockDate: new Date(Number(m.unlockDate) * 1000),
        reward: Number(ethers.formatEther(m.reward)),
        isUnlocked: m.isUnlocked,
        isCompleted: m.isCompleted,
        firstCompletedBy: m.firstCompletedBy.address !== ethers.ZeroAddress ? {
          address: m.firstCompletedBy.address,
          timestamp: new Date(Number(m.firstCompletedBy.timestamp) * 1000)
        } : null
      }));
    } catch (error) {
      console.error("Error fetching milestones:", error);
      return [];
    }
  };

  const fetchActivityLog = async (challengeId: string) => {
    try {
      const logs = await contract.getChallengeActivityLog(challengeId);
      return logs.map((log: any) => ({
        action: log.action,
        milestone: log.milestone,
        user: log.user,
        timestamp: new Date(Number(log.timestamp) * 1000),
        reward: log.reward ? Number(ethers.formatEther(log.reward)) : undefined
      }));
    } catch (error) {
      console.error("Error fetching activity log:", error);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-web3-background flex items-center justify-center">
        <div className="text-white">Loading challenge data...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-web3-background flex items-center justify-center">
        <div className="text-white">Challenge not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 animate-confetti opacity-70">
              {/* Confetti animation would be here in a real implementation */}
            </div>
          </div>
        )}
        
        {currentMilestone && (
          <QuizModal 
            isOpen={quizModalOpen}
            onClose={() => setQuizModalOpen(false)}
            onComplete={handleQuizComplete}
            track={challenge.track}
            milestone={currentMilestone}
          />
        )}
        
        <div className="mb-8 glassmorphism border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-web3-blue/5 via-transparent to-web3-orange/5 pointer-events-none"></div>
          
          <div className="relative flex flex-col lg:flex-row justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gradient">{challenge.name}</h1>
              <p className="text-white/70 mb-4">{challenge.track} Track</p>
              
              <div className="flex items-center mb-4">
                <Calendar className="h-4 w-4 text-web3-blue mr-2" />
                <div className="text-sm">
                  <span className="text-white/70">Started: </span>
                  <span className="text-white font-medium">{formatDate(challenge.startDate)}</span>
                  <span className="text-white/70 mx-2">•</span>
                  <span className="text-white/70">Ends: </span>
                  <span className="text-white font-medium">{formatDate(challenge.endDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <Users className="h-4 w-4 text-web3-blue mr-2" />
                <p className="text-sm text-white/70">Participants:</p>
                <div className="flex -space-x-2 ml-2">
                  {challenge.participants.map((participant, index) => (
                    <div 
                      key={index} 
                      className="h-8 w-8 rounded-full bg-web3-card border-2 border-web3-background flex items-center justify-center text-xs overflow-hidden"
                      title={participant.address}
                    >
                      <img 
                        src={participant.avatar}
                        alt={formatAddress(participant.address)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-web3-blue/10 to-web3-orange/10 rounded-xl border border-white/20 p-4 max-w-md w-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gradient-blue-orange">Total Staked</h3>
                <p className="text-2xl font-bold text-gradient-blue-orange flex items-baseline">
                  {challenge.stakedAmount * challenge.participants.length}
                  <span className="text-sm ml-1 text-white/70">ETH</span>
                </p>
              </div>
              
              <div className="h-px bg-white/10 my-3"></div>
              
              <h4 className="text-white/80 text-sm mb-2">Reward Distribution</h4>
              <div className="grid grid-cols-2 gap-2">
                {challenge.milestones.map((milestone, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <p className="text-white/70">Milestone {index+1}:</p>
                    <p className="text-white font-medium">{milestone.reward} ETH</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gradient">Challenge Progress</h2>
            <p className="text-white/70 text-sm">{calculateProgress().toFixed(0)}% Complete</p>
          </div>
          <Progress value={calculateProgress()} className="h-2 bg-white/10" />
        </div>
        
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gradient">Milestones</h2>
          
          <div className="space-y-4">
            {challenge.milestones.map((milestone, index) => (
              <div 
                key={milestone.id} 
                className={`glassmorphism hover:bg-white/5 transition-all duration-300 rounded-xl border ${milestone.isUnlocked ? (milestone.isCompleted ? 'border-web3-success/30' : 'border-web3-blue/30') : 'border-white/10'} p-6 ${!milestone.isUnlocked ? 'opacity-70' : ''}`}
              >
                <div 
                  className="flex flex-col md:flex-row justify-between cursor-pointer"
                  onClick={() => milestone.isUnlocked && setExpandedMilestone(expandedMilestone === milestone.id ? null : milestone.id)}
                >
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      {milestone.isCompleted ? (
                        <BadgeCheck className="h-5 w-5 text-web3-success mr-2" />
                      ) : milestone.isUnlocked ? (
                        <BookOpen className="h-5 w-5 text-web3-blue mr-2" />
                      ) : (
                        <Lock className="h-5 w-5 text-web3-orange/70 mr-2" />
                      )}
                      <h3 className={`text-lg font-semibold ${milestone.isCompleted ? 'text-web3-success' : (milestone.isUnlocked ? 'text-white' : 'text-white/60')}`}>
                        {index + 1}. {milestone.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center ml-7">
                      <Clock className="h-4 w-4 text-white/50 mr-2" />
                      <p className="text-sm text-white/70">
                        {milestone.isUnlocked ? 'Unlocked on ' + formatDate(milestone.unlockDate) : 'Unlocks in ' + getTimeUntilUnlock(milestone.unlockDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 text-web3-orange mr-2" />
                      <p className="text-sm text-white/70">
                        <span className="text-web3-orange font-medium">{milestone.reward} ETH</span> Reward
                      </p>
                    </div>
                    
                    {milestone.firstCompletedBy ? (
                      <div className="flex items-center">
                        <CheckSquare className="h-4 w-4 text-web3-success mr-2" />
                        <p className="text-sm text-white/70">
                          Completed by <span className="text-white">{formatAddress(milestone.firstCompletedBy.address)}</span>
                        </p>
                      </div>
                    ) : milestone.isUnlocked ? (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-web3-blue/50 text-web3-blue hover:bg-web3-blue/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAttemptQuiz(milestone.id);
                        }}
                      >
                        Attempt Quiz
                      </Button>
                    ) : (
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 text-web3-orange/70 mr-2" />
                        <p className="text-sm text-white/70">Locked</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {expandedMilestone === milestone.id && (
                  <div className="mt-6 pt-4 border-t border-white/10 animate-accordion-down">
                    <h4 className="text-white font-medium mb-2">Quiz Details</h4>
                    <p className="text-white/70 mb-4">
                      {milestone.name} quiz tests your knowledge of {challenge.track} fundamentals.
                      You'll need to answer 5 multiple-choice questions and complete 1 coding challenge to earn the milestone completion.
                    </p>
                    
                    <div className="flex items-center mb-4">
                      <AlertTriangle className="h-4 w-4 text-white/50 mr-2" />
                      <p className="text-sm text-white/70">
                        The first participant to complete this milestone will receive {milestone.reward} ETH.
                      </p>
                    </div>
                    
                    <div className="flex justify-end gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setExpandedMilestone(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="group overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_25px_rgba(248,161,0,0.3)]"
                        style={{
                          background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAttemptQuiz(milestone.id);
                        }}
                      >
                        <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gradient">Rules and Guidelines</h2>
          
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-gradient">Challenge Rules & Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-web3-orange mr-2" />
                    Fair Play Rules
                  </h3>
                  <p className="text-white/70 text-sm">
                    Each participant must complete milestones honestly. Sharing answers is prohibited.
                    Plagiarism will result in disqualification.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <Clock className="h-4 w-4 text-web3-blue mr-2" />
                    Time Limits
                  </h3>
                  <p className="text-white/70 text-sm">
                    Milestones unlock sequentially on specific dates. Each quiz has a 30-minute time limit.
                    Late submissions are allowed but won't qualify for first-completion rewards.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <GiftIcon className="h-4 w-4 text-web3-success mr-2" />
                    Reward Distribution
                  </h3>
                  <p className="text-white/70 text-sm">
                    The first to complete each milestone receives the reward automatically.
                    All rewards are distributed via smart contract for transparency.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gradient">Activity Log</h2>
          
          <div className="glassmorphism border border-white/10 rounded-xl p-6">
            <div className="overflow-hidden relative h-12 mb-4">
              <div className="absolute whitespace-nowrap animate-move-background">
                {challenge.activityLog.slice(0, 3).map((activity, index) => (
                  <span key={index} className="mx-6 text-white/80">
                    {activity.action === 'milestone_completed' && (
                      <>
                        <span className="text-web3-success">@{formatAddress(activity.user)}</span> completed Milestone {activity.milestone?.replace('m', '')} and won <span className="text-web3-orange">{activity.reward} ETH</span>!
                      </>
                    )}
                    {activity.action === 'milestone_unlocked' && (
                      <>
                        <span className="text-web3-blue">Milestone {activity.milestone?.replace('m', '')}</span> is now unlocked! Who will complete it first?
                      </>
                    )}
                    {activity.action === 'user_joined' && (
                      <>
                        <span className="text-web3-blue">@{formatAddress(activity.user)}</span> has joined the challenge!
                      </>
                    )}
                    {activity.action === 'challenge_started' && (
                      <>
                        <span className="text-web3-orange">Challenge started!</span> Good luck to all participants!
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {challenge.activityLog.map((activity, index) => (
                <div key={index} className="flex items-start border-b border-white/5 pb-3 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mr-3 mt-1">
                    {activity.action === 'milestone_completed' && <BadgeCheck className="h-5 w-5 text-web3-success" />}
                    {activity.action === 'milestone_unlocked' && <Lock className="h-5 w-5 text-web3-blue" />}
                    {activity.action === 'user_joined' && <Users className="h-5 w-5 text-web3-blue" />}
                    {activity.action === 'challenge_started' && <GiftIcon className="h-5 w-5 text-web3-orange" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        {activity.action === 'milestone_completed' && (
                          <p className="text-white">
                            <span className="text-web3-success font-medium">@{formatAddress(activity.user)}</span> completed Milestone {activity.milestone?.replace('m', '')}
                          </p>
                        )}
                        {activity.action === 'milestone_unlocked' && (
                          <p className="text-white">
                            <span className="text-web3-blue font-medium">Milestone {activity.milestone?.replace('m', '')}</span> is now unlocked
                          </p>
                        )}
                        {activity.action === 'user_joined' && (
                          <p className="text-white">
                            <span className="text-web3-blue font-medium">@{formatAddress(activity.user)}</span> has joined the challenge
                          </p>
                        )}
                        {activity.action === 'challenge_started' && (
                          <p className="text-white">
                            <span className="text-web3-orange font-medium">Challenge started</span>
                          </p>
                        )}
                      </div>
                      <p className="text-white/50 text-sm">{formatDate(activity.timestamp)}</p>
                    </div>
                    
                    {activity.action === 'milestone_completed' && activity.reward && (
                      <p className="text-sm text-white/70 mt-1">
                        Rewarded with <span className="text-web3-orange">{activity.reward} ETH</span> for first completion!
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <div className="text-center mb-10">
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChallengeDashboard;
