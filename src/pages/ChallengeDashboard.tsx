import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Provider";
import { ethers } from "ethers";
import { toast } from "sonner";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button"; // Fixed casing
import { shortenAddress, handleContractError, EDU_CHAIN_CONFIG } from "@/lib/utils";
import { User, Award, Calendar, Clock, CheckCircle, Users, AlertTriangle, Link as LinkIcon } from "lucide-react";
import CodeEditor from "@/components/quiz/CodeEditor";
import QuizModal from "@/components/quiz/QuizModal";

// Mock challenge data for development
const mockChallenge = {
  id: "1",
  name: "Smart Contract Security Challenge",
  description: "Find and fix vulnerabilities in a smart contract",
  creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  totalStake: 0.5,
  totalPlayers: 4,
  joinedCount: 2,
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  milestones: [
    {
      id: "m1",
      name: "Identify Reentrancy Vulnerabilities",
      description: "Find all reentrancy vulnerabilities in the provided contract",
      unlockDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      isUnlocked: true,
      isCompleted: true,
      reward: 0.1,
    },
    {
      id: "m2",
      name: "Fix Integer Overflow Issues",
      description: "Identify and fix all integer overflow vulnerabilities",
      unlockDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isUnlocked: true,
      isCompleted: false,
      reward: 0.15,
    },
    {
      id: "m3",
      name: "Implement Access Controls",
      description: "Add proper access control mechanisms to the contract",
      unlockDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      isUnlocked: false,
      isCompleted: false,
      reward: 0.25,
    },
  ],
  participants: [
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
    "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
  ],
};

// Sample quiz questions for milestones
const quizQuestions = {
  m1: {
    title: "Reentrancy Quiz",
    description: "Identify the reentrancy vulnerability in this code and fix it.",
    initialCode: `
function withdraw(uint _amount) public {
    require(balances[msg.sender] >= _amount);
    (bool success, ) = msg.sender.call{value: _amount}("");
    require(success, "Transfer failed");
    balances[msg.sender] -= _amount;
}
    `,
  },
  m2: {
    title: "Integer Overflow Quiz",
    description: "Fix the integer overflow vulnerability in this code.",
    initialCode: `
function addToBalance(uint256 _amount) public {
    balances[msg.sender] += _amount;
}

function transfer(address _to, uint256 _amount) public {
    require(balances[msg.sender] >= _amount, "Insufficient balance");
    balances[msg.sender] -= _amount;
    balances[_to] += _amount;
}
    `,
  },
  m3: {
    title: "Access Control Quiz",
    description: "Implement proper access control for this admin function.",
    initialCode: `
function withdrawFees(uint256 _amount) public {
    payable(feeCollector).transfer(_amount);
}
    `,
  },
};

const ChallengeDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallet, contract, isConnected } = useWeb3();
  
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [initialCode, setInitialCode] = useState("");

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== EDU_CHAIN_CONFIG.chainId) {
          toast.warning("Please switch to eduChain Testnet for this feature to work properly", {
            action: {
              label: 'Switch Network',
              onClick: () => {
                window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: EDU_CHAIN_CONFIG.chainId }]
                }).catch(console.error);
              }
            }
          });
        }
      }
    };
    
    checkNetwork();
    fetchChallengeDetails();
  }, [id, contract, wallet]);

  const fetchChallengeDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from contract if available
      if (contract && id) {
        try {
          const challengeId = Number(id);
          const details = await contract.getChallengeDetails(challengeId);
          
          // Format the challenge data from contract
          const formattedChallenge = {
            id: challengeId.toString(),
            creator: details.creator,
            totalStake: Number(ethers.formatEther(details.totalStake)),
            totalPlayers: Number(details.totalPlayers),
            joinedCount: Number(details.joinedCount),
            balance: Number(ethers.formatEther(details.balance)),
            milestoneCount: Number(details.milestoneCount),
            // Add other fields with mock data for now
            name: `Challenge #${challengeId}`,
            description: "A coding challenge on the blockchain",
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            milestones: Array(Number(details.milestoneCount)).fill(0).map((_, i) => ({
              id: `m${i+1}`,
              name: `Milestone ${i+1}`,
              description: `Complete milestone ${i+1}`,
              unlockDate: new Date(Date.now() + i * 3 * 24 * 60 * 60 * 1000),
              isUnlocked: i === 0, // First milestone is unlocked
              isCompleted: false,
              reward: Number(ethers.formatEther(details.totalStake)) / Number(details.milestoneCount),
            })),
            participants: [details.creator],
          };
          
          setChallenge(formattedChallenge);
          
          // Check if user has joined
          if (wallet) {
            const joined = await contract.hasJoined(challengeId, wallet);
            setHasJoined(joined);
          }
        } catch (contractError) {
          console.error("Contract error:", contractError);
          // Fallback to mock data
          setChallenge(mockChallenge);
          setHasJoined(mockChallenge.participants.includes(wallet || ""));
        }
      } else {
        // Use mock data if contract is not available
        setChallenge(mockChallenge);
        setHasJoined(mockChallenge.participants.includes(wallet || ""));
      }
    } catch (err) {
      console.error("Error fetching challenge:", err);
      setError("Failed to load challenge details. Please try again later.");
      // Still set mock data for development
      setChallenge(mockChallenge);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    if (!wallet || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!challenge) return;

    try {
      setLoading(true);
      
      if (contract && id) {
        const challengeId = Number(id);
        const stakeAmount = ethers.parseEther(challenge.totalStake.toString());
        
        try {
          const tx = await contract.joinChallenge(challengeId, { value: stakeAmount });
          toast.loading("Joining challenge...");
          await tx.wait();
          toast.success("Successfully joined the challenge!");
          setHasJoined(true);
        } catch (error: any) {
          const errorMessage = handleContractError(error);
          toast.error(errorMessage);
        }
      } else {
        // Mock join for development
        toast.success("Successfully joined the challenge! (Demo)");
        setHasJoined(true);
      }
    } catch (err) {
      console.error("Error joining challenge:", err);
      toast.error("Failed to join challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuiz = (milestone: any) => {
    setSelectedMilestone(milestone);
    // Set initial code based on milestone ID
    if (quizQuestions[milestone.id as keyof typeof quizQuestions]) {
      setInitialCode(quizQuestions[milestone.id as keyof typeof quizQuestions].initialCode);
    } else {
      setInitialCode("// Write your solution here");
    }
    setShowQuizModal(true);
  };

  const handleSubmitQuiz = (code: string) => {
    // The CodeEditor component expects onSubmit to receive code
    console.log("Quiz submitted with code:", code);
    
    // Here you can process the code/quiz submission as needed
    setQuizCompleted(true);
    setShowQuizModal(false);
    
    toast.success("Quiz solution submitted successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-web3-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading challenge details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center py-20">
            <AlertTriangle className="w-16 h-16 text-web3-orange mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Challenge</h2>
            <p className="text-white/70 mb-6">{error || "Challenge not found"}</p>
            <Button onClick={() => navigate("/dashboard")} variant="gradient">
              Back to Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate progress
  const completedMilestones = challenge.milestones.filter((m: any) => m.isCompleted).length;
  const progress = (completedMilestones / challenge.milestones.length) * 100;

  // Calculate time remaining
  const now = new Date();
  const timeRemaining = challenge.endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address={wallet} />
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Challenge Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2 md:mb-0">
              {challenge.name}
            </h1>
            {!hasJoined ? (
              <Button 
                onClick={handleJoinChallenge} 
                variant="gradient" 
                disabled={loading}
                className="w-full md:w-auto"
              >
                Join Challenge ({challenge.totalStake} ETH)
              </Button>
            ) : (
              <div className="glassmorphism border border-white/10 px-4 py-2 rounded-lg text-white">
                <span className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-web3-success mr-2" />
                  You've joined this challenge
                </span>
              </div>
            )}
          </div>
          
          <p className="text-white/80 mb-6">{challenge.description}</p>
          
          {/* Challenge Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glassmorphism border border-white/10 p-4 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-web3-blue mr-2" />
                <span className="text-white/70">Creator:</span>
              </div>
              <p className="text-white mt-1">{shortenAddress(challenge.creator)}</p>
            </div>
            
            <div className="glassmorphism border border-white/10 p-4 rounded-lg">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-web3-orange mr-2" />
                <span className="text-white/70">Total Stake:</span>
              </div>
              <p className="text-white mt-1">{challenge.totalStake} ETH</p>
            </div>
            
            <div className="glassmorphism border border-white/10 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-web3-blue mr-2" />
                <span className="text-white/70">Participants:</span>
              </div>
              <p className="text-white mt-1">{challenge.joinedCount} / {challenge.totalPlayers}</p>
            </div>
            
            <div className="glassmorphism border border-white/10 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-web3-orange mr-2" />
                <span className="text-white/70">Time Remaining:</span>
              </div>
              <p className="text-white mt-1">{daysRemaining} days</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="glassmorphism border border-white/10 p-4 rounded-lg mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-white">Progress</span>
              <span className="text-white">{completedMilestones} / {challenge.milestones.length} milestones</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-web3-blue to-web3-orange h-4 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Milestones */}
        <h2 className="text-xl font-bold text-white mb-4">Milestones</h2>
        <div className="space-y-4 mb-8">
          {challenge.milestones.map((milestone: any, index: number) => {
            const isUnlocked = milestone.isUnlocked;
            const isCompleted = milestone.isCompleted;
            const isPast = new Date(milestone.unlockDate) < new Date();
            
            return (
              <div 
                key={milestone.id} 
                className={`glassmorphism border rounded-lg p-4 transition-all ${
                  isCompleted 
                    ? "border-web3-success/30 bg-web3-success/5" 
                    : isUnlocked 
                      ? "border-web3-blue/30 bg-web3-blue/5" 
                      : "border-white/10"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-web3-success mr-2" />
                      ) : isUnlocked ? (
                        <Calendar className="h-5 w-5 text-web3-blue mr-2" />
                      ) : (
                        <Clock className="h-5 w-5 text-white/50 mr-2" />
                      )}
                      <h3 className={`font-semibold ${
                        isCompleted 
                          ? "text-web3-success" 
                          : isUnlocked 
                            ? "text-white" 
                            : "text-white/50"
                      }`}>
                        {milestone.name}
                      </h3>
                    </div>
                    <p className={`${
                      isUnlocked ? "text-white/70" : "text-white/40"
                    }`}>
                      {milestone.description}
                    </p>
                    <div className="flex items-center mt-2">
                      <Award className={`h-4 w-4 mr-1 ${
                        isUnlocked ? "text-web3-orange" : "text-white/40"
                      }`} />
                      <span className={`text-sm ${
                        isUnlocked ? "text-web3-orange" : "text-white/40"
                      }`}>
                        {milestone.reward} ETH
                      </span>
                      <span className="mx-2 text-white/30">•</span>
                      <Calendar className={`h-4 w-4 mr-1 ${
                        isPast ? "text-white/70" : "text-white/40"
                      }`} />
                      <span className={`text-sm ${
                        isPast ? "text-white/70" : "text-white/40"
                      }`}>
                        {new Date(milestone.unlockDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant={isCompleted ? "outline" : "gradient"}
                    size="sm"
                    disabled={!isUnlocked || !hasJoined}
                    onClick={() => isUnlocked && hasJoined && handleOpenQuiz(milestone)}
                    className={isCompleted ? "border-web3-success text-web3-success hover:bg-web3-success/10" : ""}
                  >
                    {isCompleted ? "Completed" : isUnlocked ? "Start Quiz" : "Locked"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Participants */}
        <h2 className="text-xl font-bold text-white mb-4">Participants</h2>
        <div className="glassmorphism border border-white/10 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenge.participants.slice(0, challenge.joinedCount || challenge.participants.length).map((participant: string, index: number) => (
              <div key={index} className="flex items-center p-2 rounded-lg hover:bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-web3-blue to-web3-orange flex items-center justify-center mr-3">
                  <span className="text-white text-xs font-bold">
                    {participant.substring(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white">{shortenAddress(participant)}</p>
                  {participant === challenge.creator && (
                    <span className="text-xs text-web3-orange">Creator</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Contract Details */}
        <h2 className="text-xl font-bold text-white mb-4">Contract Details</h2>
        <div className="glassmorphism border border-white/10 rounded-lg p-4 mb-8">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Challenge ID:</span>
              <span className="text-white">{challenge.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Contract Address:</span>
              <div className="flex items-center">
                <span className="text-white">{shortenAddress("0x5b4050c163Fb24522Fa25876b8F6A983a69D9165")}</span>
                <a 
                  href={`https://explorer.edu.ooo/address/0x5b4050c163Fb24522Fa25876b8F6A983a69D9165`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-web3-blue hover:text-web3-blue/80"
                >
                  <LinkIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Network:</span>
              <span className="text-white">eduChain Testnet</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          milestone={selectedMilestone}
          onSubmit={handleSubmitQuiz}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ChallengeDashboard;
