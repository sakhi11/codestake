
import React, { useState } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import WalletSummary from "@/components/dashboard/WalletSummary";
import CreateChallenge from "@/components/dashboard/CreateChallenge";
import OngoingChallenges from "@/components/dashboard/OngoingChallenges";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

const Dashboard = () => {
  // Mock wallet data - in a real app, this would come from wallet connection
  const [walletData] = useState({
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    totalStaked: 1.45,
    ongoingChallenges: 2,
    totalWinnings: 0.87,
    milestonesCompleted: 3
  });

  // Mock challenge data - in a real app, this would come from a database or blockchain
  const [challenges, setChallenges] = useState([
    {
      id: "ch-01",
      name: "Solidity Masters - Group 3",
      stakedAmount: 0.75,
      participants: [
        { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", avatar: "/placeholder.svg" },
        { address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", avatar: "/placeholder.svg" },
        { address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", avatar: "/placeholder.svg" }
      ],
      nextMilestoneDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      progress: 33, // percent
      track: "Solidity"
    },
    {
      id: "ch-02",
      name: "JavaScript Challenge - Advanced",
      stakedAmount: 0.7,
      participants: [
        { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", avatar: "/placeholder.svg" },
        { address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", avatar: "/placeholder.svg" }
      ],
      nextMilestoneDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      progress: 66, // percent
      track: "JavaScript"
    }
  ]);

  const handleCreateChallenge = (newChallenge) => {
    // In a real app, this would involve blockchain transactions
    setChallenges([...challenges, {
      id: `ch-${challenges.length + 1}`,
      name: `${newChallenge.track} Challenge - Group ${challenges.length + 1}`,
      stakedAmount: Number(newChallenge.stakeAmount),
      participants: [
        { address: walletData.address, avatar: "/placeholder.svg" },
        ...newChallenge.participants.map(address => ({ 
          address, 
          avatar: "/placeholder.svg" 
        }))
      ],
      nextMilestoneDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      progress: 0,
      track: newChallenge.track
    }]);
    
    toast.success("New challenge created successfully!");
  };

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address={walletData.address} />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <WalletSummary 
          totalStaked={walletData.totalStaked}
          ongoingChallenges={walletData.ongoingChallenges}
          totalWinnings={walletData.totalWinnings}
          milestonesCompleted={walletData.milestonesCompleted}
        />
        
        <CreateChallenge onCreateChallenge={handleCreateChallenge} />
        
        <OngoingChallenges challenges={challenges} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
