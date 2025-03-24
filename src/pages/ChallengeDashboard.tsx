
import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useWeb3 } from "@/context/Web3Provider";
import { ethers } from "ethers";
import { useParams, useNavigate } from "react-router-dom";
import QuizModal from "@/components/quiz/QuizModal";
import Footer from "@/components/layout/Footer";
import { CheckCircle, XCircle, AlertCircle, Calendar, Zap } from "lucide-react";
import { EDU_CHAIN_CONFIG } from "@/lib/utils";

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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { wallet, contract, isConnected, switchToEduChain, networkDetails } = useWeb3();
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
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [contractValid, setContractValid] = useState(true);

  useEffect(() => {
    console.log("ChallengeDashboard - Address:", wallet);
    console.log("ChallengeDashboard - Contract:", contract);
    console.log("ChallengeDashboard - IsConnected:", isConnected);
    console.log("ChallengeDashboard - Network Details:", networkDetails);
    
    const validateContract = () => {
      if (contract) {
        console.log("Contract methods:", Object.keys(contract));
        setContractValid(!!contract.createChallenge);
        
        if (!contract.createChallenge) {
          toast.error("Contract interface incomplete. Please make sure you're on eduChain Testnet.");
        }
      }
    };
    
    validateContract();
  }, [wallet, contract, isConnected, networkDetails]);

  const handleNetworkCheck = async () => {
    if (!window.ethereum) return false;
    
    try {
      if (!networkDetails.isCorrectNetwork) {
        toast({
          title: "Network Mismatch",
          description: (
            <div>
              <p>You're not connected to eduChain Testnet. Current network: {networkDetails.name} ({networkDetails.chainId})</p>
              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                <p className="font-semibold">Required Network Details:</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Name: {EDU_CHAIN_CONFIG.chainName}</li>
                  <li>Chain ID: {EDU_CHAIN_CONFIG.chainId}</li>
                  <li>RPC URL: {EDU_CHAIN_CONFIG.rpcUrls[0]}</li>
                  <li>Symbol: {EDU_CHAIN_CONFIG.nativeCurrency.symbol}</li>
                </ul>
              </div>
              <Button 
                onClick={async () => await switchToEduChain()} 
                className="w-full mt-3"
              >
                Switch Network
              </Button>
            </div>
          ),
          duration: 8000,
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking network:", error);
      return false;
    }
  };

  const completeMilestone = async (code: string) => {
    if (!contract || !isConnected || !id) {
      toast.error("Wallet not connected or contract not available");
      return false;
    }

    try {
      const isCorrectNetwork = await handleNetworkCheck();
      if (!isCorrectNetwork) {
        return false;
      }

      toast.success(`Quiz completed successfully! Code: ${code}`);
      
      setMilestones(prevMilestones => 
        prevMilestones.map(m => 
          m.id === selectedMilestone?.id 
            ? {...m, status: 'complete', isCompleted: true} 
            : m
        )
      );
      
      return true;
    } catch (error: any) {
      console.error("Error completing milestone:", error);
      toast.error(error.message || "Failed to complete milestone");
      return false;
    }
  };

  const fetchChallenge = async () => {
    if (id && contract && contract.getChallenge) {
      try {
        const challenge = await contract.getChallenge(id);
        if (challenge) {
          // Process challenge data
          console.log("Fetched challenge:", challenge);
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
      }
    }
  };

  useEffect(() => {
    if (contract && id) {
      fetchChallenge();
    }
  }, [id, contract]);

  const handleOpenQuizModal = (milestone: MilestoneItem) => {
    setSelectedMilestone(milestone);
    setIsQuizModalOpen(true);
  };

  const handleQuizSubmit = async (code: string) => {
    console.log("Quiz submitted with code:", code);
    const result = await completeMilestone(code);
    if (result) {
      setIsQuizModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address={wallet} />
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
              
              {!networkDetails.isCorrectNetwork && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
                  <p className="text-red-200 text-sm">
                    You are not connected to eduChain Testnet. Some features may not work correctly.
                  </p>
                  <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs">
                    <p className="font-semibold text-white">Network Details:</p>
                    <ul className="list-disc pl-4 mt-1 text-gray-200">
                      <li>Network Name: {EDU_CHAIN_CONFIG.chainName}</li>
                      <li>Chain ID: {EDU_CHAIN_CONFIG.chainId}</li>
                      <li>RPC URL: {EDU_CHAIN_CONFIG.rpcUrls[0]}</li>
                      <li>Symbol: {EDU_CHAIN_CONFIG.nativeCurrency.symbol}</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={async () => await switchToEduChain()}
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white text-sm"
                    size="sm"
                  >
                    Switch to eduChain Testnet
                  </Button>
                </div>
              )}

              {!contractValid && networkDetails.isCorrectNetwork && (
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
              <div key={milestone.id} onClick={() => handleOpenQuizModal(milestone)}>
                <Milestone milestone={milestone} />
              </div>
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
