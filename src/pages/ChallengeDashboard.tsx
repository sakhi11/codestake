import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Provider";
import QuizModal from "@/components/quiz/QuizModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface MilestoneItem {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  quizLink: string;
  status: 'complete' | 'incomplete' | 'pending';
}

const Milestone = ({ milestone }: { milestone: MilestoneItem }) => {
  const getStatusIcon = (status: MilestoneItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'incomplete':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          {milestone.title}
          {getStatusIcon(milestone.status)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{milestone.description}</p>
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <p className="text-sm text-muted-foreground">Due: {milestone.dueDate}</p>
          </div>
          {milestone.status === 'incomplete' && (
            <Badge variant="outline">Quiz Available</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="secondary">View Details</Button>
        {milestone.status === 'incomplete' && (
          <Button>Take Quiz</Button>
        )}
      </CardFooter>
    </Card>
  );
};

const ChallengeDashboard = () => {
  const { wallet: address, contract, isConnected } = useWeb3();
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      id: 1,
      title: "Milestone 1: Setup",
      description: "Configure your development environment.",
      dueDate: "2024-08-15",
      isCompleted: false,
      quizLink: "/quiz/1",
      status: 'incomplete',
    },
    {
      id: 2,
      title: "Milestone 2: Smart Contract Basics",
      description: "Learn the basics of smart contracts.",
      dueDate: "2024-08-22",
      isCompleted: false,
      quizLink: "/quiz/2",
      status: 'incomplete',
    },
    {
      id: 3,
      title: "Milestone 3: Advanced Concepts",
      description: "Explore advanced smart contract concepts.",
      dueDate: "2024-08-29",
      isCompleted: false,
      quizLink: "/quiz/3",
      status: 'incomplete',
    },
  ]);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState(true);
  const [contractValid, setContractValid] = useState(true);

  useEffect(() => {
    console.log("ChallengeDashboard - Address:", address);
    console.log("ChallengeDashboard - Contract:", contract);
    console.log("ChallengeDashboard - IsConnected:", isConnected);
    
    // Check if we're on the correct network
    const checkNetwork = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setIsOnCorrectNetwork(chainId === EDU_CHAIN_CONFIG.chainId);
        
        if (chainId !== EDU_CHAIN_CONFIG.chainId) {
          toast.warning(`Please switch to eduChain Testnet (Chain ID: ${EDU_CHAIN_CONFIG.chainId})`);
        }
      }
    };
    
    // Also check if contract has required methods
    const validateContract = () => {
      if (contract) {
        console.log("Contract methods:", Object.keys(contract));
        setContractValid(!!contract.createChallenge);
        
        if (!contract.createChallenge) {
          toast.error("Contract interface incomplete. Please make sure you're on eduChain Testnet.");
        }
      }
    };
    
    checkNetwork();
    validateContract();
  }, [address, contract, isConnected]);

  // When modal opens for a milestone, provide an empty onSubmit prop to satisfy the component
  const handleOpenQuizModal = (milestone: any) => {
    setSelectedMilestone(milestone);
    setIsQuizModalOpen(true);
  };

  const handleQuizSubmit = (code: string) => {
    console.log("Quiz submitted with code:", code);
    // Implementation for quiz submission
    setIsQuizModalOpen(false);
  };

  const handleSwitchNetwork = async () => {
    try {
      const switched = await switchToEduChain();
      if (switched) {
        setIsOnCorrectNetwork(true);
        toast.success("Successfully switched to eduChain Testnet!");
      } else {
        toast.error("Failed to switch networks. Please try manually in your wallet.");
      }
    } catch (error) {
      console.error("Error switching network:", error);
      toast.error("Failed to switch networks");
    }
  };

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address={address} />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <Card className="glassmorphism border border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Challenge Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">Track your progress and complete milestones.</p>
              
              {!isOnCorrectNetwork && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
                  <p className="text-red-200 text-sm">
                    You are not connected to eduChain Testnet. Some features may not work correctly.
                  </p>
                  <Button 
                    onClick={handleSwitchNetwork}
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm"
                    size="sm"
                  >
                    Switch to eduChain Testnet
                  </Button>
                </div>
              )}

              {!contractValid && isOnCorrectNetwork && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-md">
                  <p className="text-yellow-200 text-sm">
                    Contract interface appears to be incomplete. This could be due to a connection issue.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                    size="sm"
                  >
                    Refresh Page
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Milestones
          </h2>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Milestone key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </section>
        
        {isQuizModalOpen && selectedMilestone && (
          <QuizModal 
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            milestone={selectedMilestone}
            onSubmit={handleQuizSubmit}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ChallengeDashboard;
