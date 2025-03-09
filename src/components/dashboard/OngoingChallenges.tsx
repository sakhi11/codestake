
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Participant {
  address: string;
  avatar: string;
}

interface Challenge {
  id: string;
  name: string;
  stakedAmount: number;
  participants: Participant[];
  nextMilestoneDate: Date;
  progress: number;
  track: string;
}

interface OngoingChallengesProps {
  challenges: Challenge[];
}

const OngoingChallenges = ({ challenges }: OngoingChallengesProps) => {
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
  
  // Calculate days remaining until the date
  const getDaysRemaining = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-gradient">Ongoing Challenges</h2>
      
      {challenges.length === 0 ? (
        <Card className="glassmorphism border border-white/10 p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-16 w-16 text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Challenges</h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              You haven't joined any challenges yet! Start competing and earning rewards by creating or joining a challenge today.
            </p>
            <Button 
              className="relative group overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_25px_rgba(248,161,0,0.3)]"
              style={{
                background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)",
              }}
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Trophy className="mr-2 h-5 w-5" />
              Create Your First Challenge
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {challenges.map((challenge) => (
            <Card 
              key={challenge.id} 
              className="glassmorphism border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg overflow-hidden group"
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Challenge Info */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-white group-hover:text-gradient-blue-orange transition-colors">
                        {challenge.name}
                      </h3>
                      <p className="text-white/70">{challenge.track} Track</p>
                    </div>
                    
                    <div className="flex items-center">
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
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-web3-orange mr-2" />
                      <p className="text-sm text-white/70">
                        Next milestone: <span className="text-white">{formatDate(challenge.nextMilestoneDate)}</span>
                        <span className="ml-2 px-2 py-0.5 bg-white/10 rounded text-xs">
                          {getDaysRemaining(challenge.nextMilestoneDate)}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress & Stats */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-white/70">Progress</p>
                        <p className="text-sm font-medium text-white">{challenge.progress}%</p>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-web3-orange mr-2" />
                          <p className="text-sm text-white/70">Stake Amount:</p>
                        </div>
                        <p className="text-white font-medium">{challenge.stakedAmount} ETH</p>
                      </div>
                      
                      <div className="h-px bg-white/10 my-2"></div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-web3-blue mr-2" />
                          <p className="text-sm text-white/70">Total Participants:</p>
                        </div>
                        <p className="text-white font-medium">{challenge.participants.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex items-center justify-center lg:justify-end">
                    <Link to={`/challenges/${challenge.id}`}>
                      <Button
                        variant="outline"
                        className="w-full lg:w-auto px-6 py-6 bg-transparent border border-white/20 hover:bg-white/5 transition-all duration-300 text-white group-hover:border-web3-blue/50"
                      >
                        <span className="mr-2">View Challenge</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default OngoingChallenges;
