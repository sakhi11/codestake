
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, TrendingUp } from "lucide-react";
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
  // Format wallet address for display (0x71C7...976F)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Calculate time left for next milestone
  const getTimeLeft = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    // If time has passed
    if (diff <= 0) return "Now!";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
  };

  // Empty state content if no challenges
  const emptyState = (
    <div className="text-center py-12 glassmorphism rounded-xl border border-white/10">
      <div className="max-w-md mx-auto">
        <div className="text-web3-blue mb-4">
          <TrendingUp className="h-12 w-12 mx-auto opacity-60" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-white">You haven't joined any challenges yet!</h3>
        <p className="text-white/60 mb-6">
          Start competing and earning rewards by creating or joining a challenge today.
        </p>
        <Button 
          variant="gradient" 
          size="lg"
          className="group overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_25px_rgba(248,161,0,0.3)]"
          style={{
            background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)",
          }}
          onClick={() => {
            // Scroll to create challenge section
            const createSection = document.getElementById('create-challenge');
            if (createSection) {
              createSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          Create a Challenge
        </Button>
      </div>
    </div>
  );

  return (
    <section className="mb-12" id="ongoing-challenges">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gradient">Ongoing Challenges</h2>
        
        {challenges.length > 0 && (
          <Link to="/challenges" className="text-web3-blue hover:text-web3-blue/80 text-sm flex items-center">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      
      {challenges.length === 0 ? (
        emptyState
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className="glassmorphism hover:bg-white/5 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{challenge.name}</h3>
                  <p className="text-white/60 text-sm">{challenge.track} Track</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-gradient-blue-orange">{challenge.stakedAmount}</span>
                  <span className="text-sm ml-1 text-white/70">ETH</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-sm">Progress</p>
                  <p className="text-white/70 text-sm">{challenge.progress}%</p>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-web3-blue to-web3-orange transition-all duration-1000"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <Clock className="h-4 w-4 text-web3-blue mr-2" />
                <div className="text-sm">
                  <span className="text-white/70">Next milestone: </span>
                  <span className="text-white font-medium">{getTimeLeft(challenge.nextMilestoneDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <Calendar className="h-4 w-4 text-web3-blue mr-2" />
                <div className="text-sm">
                  <span className="text-white/70">Unlocks on: </span>
                  <span className="text-white font-medium">{formatDate(challenge.nextMilestoneDate)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <p className="text-white/70 text-sm mb-2">Participants</p>
                  <div className="flex -space-x-2">
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
                
                <Link to={`/challenges/${challenge.id}`}>
                  <Button variant="glass" size="sm">
                    View Challenge
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OngoingChallenges;
