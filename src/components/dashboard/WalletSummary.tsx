
import React from "react";
import { Coins, Trophy, Users, CheckSquare } from "lucide-react";

interface WalletSummaryProps {
  totalStaked: number;
  ongoingChallenges: number;
  totalWinnings: number;
  milestonesCompleted: number;
}

const WalletSummary = ({ totalStaked, ongoingChallenges, totalWinnings, milestonesCompleted }: WalletSummaryProps) => {
  return (
    <section className="mb-12 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gradient">Your Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Staked Card */}
        <div className="glassmorphism hover:bg-white/10 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-web3-blue/20 mr-4 group-hover:animate-pulse">
              <Coins className="h-6 w-6 text-web3-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white">Total Staked</h3>
          </div>
          <p className="text-3xl font-bold text-gradient-blue-orange flex items-baseline">
            {totalStaked} <span className="text-lg ml-1 text-white/70">ETH</span>
          </p>
          <p className="text-white/60 text-sm mt-2">Across all challenges</p>
        </div>
        
        {/* Ongoing Challenges Card */}
        <div className="glassmorphism hover:bg-white/10 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-web3-orange/20 mr-4 group-hover:animate-pulse">
              <Users className="h-6 w-6 text-web3-orange" />
            </div>
            <h3 className="text-lg font-semibold text-white">Active Challenges</h3>
          </div>
          <p className="text-3xl font-bold text-gradient-blue-orange">{ongoingChallenges}</p>
          <p className="text-white/60 text-sm mt-2">Currently participating</p>
        </div>
        
        {/* Total Winnings Card */}
        <div className="glassmorphism hover:bg-white/10 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-web3-success/20 mr-4 group-hover:animate-pulse">
              <Trophy className="h-6 w-6 text-web3-success" />
            </div>
            <h3 className="text-lg font-semibold text-white">Total Winnings</h3>
          </div>
          <p className="text-3xl font-bold text-gradient-blue-orange flex items-baseline">
            {totalWinnings} <span className="text-lg ml-1 text-white/70">ETH</span>
          </p>
          <p className="text-white/60 text-sm mt-2">From completed challenges</p>
        </div>
        
        {/* Milestones Completed Card */}
        <div className="glassmorphism hover:bg-white/10 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-web3-blue/20 mr-4 group-hover:animate-pulse">
              <CheckSquare className="h-6 w-6 text-web3-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white">Milestones</h3>
          </div>
          <p className="text-3xl font-bold text-gradient-blue-orange">{milestonesCompleted}</p>
          <p className="text-white/60 text-sm mt-2">Quiz milestones completed</p>
        </div>
      </div>
    </section>
  );
};

export default WalletSummary;
