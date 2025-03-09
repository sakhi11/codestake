
import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { 
  Calendar, Clock, Trophy, Users, Lock, CheckCircle, 
  AlertTriangle, BookOpen, GiftIcon, BadgeCheck
} from "lucide-react";
import { toast } from "sonner";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/progress";

// Sample data for challenge - in a real app this would come from a database or blockchain
const getChallengeData = (id: string) => {
  return {
    id,
    name: id === "ch-01" ? "Solidity Masters - Group 3" : "JavaScript Challenge - Advanced",
    stakedAmount: id === "ch-01" ? 0.75 : 0.7,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    participants: [
      { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", avatar: "/placeholder.svg" },
      { address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", avatar: "/placeholder.svg" },
      { address: id === "ch-01" ? "0xdD2FD4581271e230360230F9337D5c0430Bf44C0" : "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", avatar: "/placeholder.svg" }
    ],
    track: id === "ch-01" ? "Solidity" : "JavaScript",
    milestones: [
      {
        id: "m1",
        name: `${id === "ch-01" ? "Solidity" : "JavaScript"} Fundamentals`,
        unlockDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (unlocked)
        reward: id === "ch-01" ? 0.15 : 0.14,
        isUnlocked: true,
        isCompleted: true,
        firstCompletedBy: {
          address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // completed 2 days ago
        }
      },
      {
        id: "m2",
        name: `${id === "ch-01" ? "Smart Contract" : "Advanced Functions"}`,
        unlockDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday (unlocked)
        reward: id === "ch-01" ? 0.15 : 0.14,
        isUnlocked: true,
        isCompleted: false,
        firstCompletedBy: null
      },
      {
        id: "m3",
        name: `${id === "ch-01" ? "Security & Auditing" : "Async JavaScript"}`,
        unlockDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now (locked)
        reward: id === "ch-01" ? 0.15 : 0.14,
        isUnlocked: false,
        isCompleted: false,
        firstCompletedBy: null
      },
      {
        id: "m4",
        name: `${id === "ch-01" ? "Advanced Patterns" : "ES6+ Features"}`,
        unlockDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now (locked)
        reward: id === "ch-01" ? 0.15 : 0.14,
        isUnlocked: false,
        isCompleted: false,
        firstCompletedBy: null
      },
      {
        id: "m5",
        name: "Final Project",
        unlockDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000), // 19 days from now (locked)
        reward: id === "ch-01" ? 0.15 : 0.14,
        isUnlocked: false,
        isCompleted: false,
        firstCompletedBy: null
      }
    ],
    activityLog: [
      {
        action: "milestone_completed",
        milestone: "m1",
        user: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reward: id === "ch-01" ? 0.15 : 0.14
      },
      {
        action: "milestone_unlocked",
        milestone: "m2",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        action: "user_joined",
        user: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        action: "challenge_started",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ]
  };
};

const ChallengeDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState(getChallengeData(id || "ch-01"));
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format wallet address for display (0x71C7...976F)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Calculate the total progress based on completed milestones
  const calculateProgress = () => {
    const completedMilestones = challenge.milestones.filter(m => m.isCompleted).length;
    return (completedMilestones / challenge.milestones.length) * 100;
  };
  
  // Handle attempt quiz button
  const handleAttemptQuiz = (milestoneId: string) => {
    const milestone = challenge.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    if (!milestone.isUnlocked) {
      toast.error("This milestone is still locked!");
      return;
    }
    
    if (milestone.isCompleted) {
      toast.info("You've already completed this milestone!");
      return;
    }
    
    toast.info("Opening quiz for " + milestone.name);
    setExpandedMilestone(milestoneId);
  };
  
  // Handle mark as completed
  const handleMarkCompleted = (milestoneId: string) => {
    const milestone = challenge.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    if (!milestone.isUnlocked) {
      toast.error("This milestone is still locked!");
      return;
    }
    
    if (milestone.isCompleted) {
      toast.info("This milestone has already been completed!");
      return;
    }
    
    // Check if this is the first completion
    const isFirst = !milestone.firstCompletedBy;
    
    // Update milestone in state
    const updatedMilestones = challenge.milestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          isCompleted: true,
          firstCompletedBy: isFirst ? {
            address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // Current user's address
            timestamp: new Date()
          } : m.firstCompletedBy
        };
      }
      return m;
    });
    
    // Add to activity log
    const updatedLogs = [
      {
        action: "milestone_completed",
        milestone: milestoneId,
        user: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // Current user's address
        timestamp: new Date(),
        reward: isFirst ? milestone.reward : 0
      },
      ...challenge.activityLog
    ];
    
    // Update state
    setChallenge({
      ...challenge,
      milestones: updatedMilestones,
      activityLog: updatedLogs
    });
    
    // Show confetti for a win
    if (isFirst) {
      setConfetti(true);
      toast.success(`Congratulations! You're the first to complete this milestone and won ${milestone.reward} ETH!`);
      
      // Hide confetti after 4 seconds
      setTimeout(() => {
        setConfetti(false);
      }, 4000);
    } else {
      toast.success("Milestone marked as completed!");
    }
    
    // Close the expanded milestone
    setExpandedMilestone(null);
  };
  
  // Get time until milestone unlocks
  const getTimeUntilUnlock = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    // If already unlocked
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

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Confetti overlay - only shown when confetti state is true */}
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 animate-confetti opacity-70">
              {/* Confetti animation would be here in a real implementation */}
            </div>
          </div>
        )}
        
        {/* Challenge Overview Card */}
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
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gradient">Challenge Progress</h2>
            <p className="text-white/70 text-sm">{calculateProgress().toFixed(0)}% Complete</p>
          </div>
          <Progress value={calculateProgress()} className="h-2 bg-white/10" />
        </div>
        
        {/* Milestones */}
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
                        <CheckCircle className="h-4 w-4 text-web3-success mr-2" />
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
                
                {/* Expanded content */}
                {expandedMilestone === milestone.id && (
                  <div className="mt-6 pt-4 border-t border-white/10 animate-accordion-down">
                    <h4 className="text-white font-medium mb-2">Quiz Details</h4>
                    <p className="text-white/70 mb-4">
                      {milestone.name} quiz tests your knowledge of {challenge.track} fundamentals.
                      You'll need to answer 10 multiple-choice questions correctly to earn the milestone completion.
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
                        onClick={() => handleMarkCompleted(milestone.id)}
                      >
                        <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* Rules and Guidelines */}
        <section className="mb-10">
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
        
        {/* Activity Feed */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gradient">Activity Log</h2>
          
          <div className="glassmorphism border border-white/10 rounded-xl p-6">
            <div className="overflow-hidden relative h-12 mb-4">
              <div className="absolute whitespace-nowrap animate-move-background">
                {challenge.activityLog.slice(0, 3).map((activity, index) => (
                  <span key={index} className="mx-6 text-white/80">
                    {activity.action === 'milestone_completed' && (
                      <>
                        <span className="text-web3-success">@{formatAddress(activity.user)}</span> completed Milestone {activity.milestone.replace('m', '')} and won <span className="text-web3-orange">{activity.reward} ETH</span>!
                      </>
                    )}
                    {activity.action === 'milestone_unlocked' && (
                      <>
                        <span className="text-web3-blue">Milestone {activity.milestone.replace('m', '')}</span> is now unlocked! Who will complete it first?
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
                            <span className="text-web3-success font-medium">@{formatAddress(activity.user)}</span> completed Milestone {activity.milestone.replace('m', '')}
                          </p>
                        )}
                        {activity.action === 'milestone_unlocked' && (
                          <p className="text-white">
                            <span className="text-web3-blue font-medium">Milestone {activity.milestone.replace('m', '')}</span> is now unlocked
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
                    
                    {activity.action === 'milestone_completed' && activity.reward > 0 && (
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
        
        {/* Back to Dashboard Button */}
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
