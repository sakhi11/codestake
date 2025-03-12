import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/context/Web3Provider";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { toast } from "sonner";
import Footer from "@/components/layout/Footer";
import QuizModal from "@/components/quiz/QuizModal";
import { Trophy, Zap, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { EDU_CHAIN_CONFIG, handleContractError, switchToEduChain } from "@/lib/utils";

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
          <Calendar className="h-4 w-4 mr-2" />
          <p className="text-sm text-muted-foreground">Due: {milestone.dueDate}</p>
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

  useEffect(() => {
    console.log("ChallengeDashboard - Address:", address);
    console.log("ChallengeDashboard - Contract:", contract);
    console.log("ChallengeDashboard - IsConnected:", isConnected);
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
        
        {/* Add this needed prop to QuizModal */}
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
