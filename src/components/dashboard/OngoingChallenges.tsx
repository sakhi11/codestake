import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Smart Contract Info (Replace with your actual contract details)
const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165"; // Replace with your deployed contract address
const ABI = [
  "function getActiveChallenges() view returns (tuple(string id, string name, uint256 stakedAmount, address[] participants, uint256 nextMilestoneDate, uint256 progress, string track)[])",
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "challengeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "player1",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "player2",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "stakeAmount",
          "type": "uint256"
        }
      ],
      "name": "ChallengeCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_challengeId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_milestone",
          "type": "uint256"
        }
      ],
      "name": "completeMilestone",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_player2",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_stakeAmount",
          "type": "uint256"
        }
      ],
      "name": "createChallenge",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "challengeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "milestone",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        }
      ],
      "name": "MilestoneCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "challengeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "RewardWithdrawn",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_challengeId",
          "type": "uint256"
        }
      ],
      "name": "stakeAmount",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "challengeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "StakeDeposited",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_challengeId",
          "type": "uint256"
        }
      ],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "challengeCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "challengeExists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "challenges",
      "outputs": [
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "player1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "player2",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "stakedAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalStake",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }// Add other functions from your contract ABI as needed
];

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

const OngoingChallenges = ({ challenges: propChallenges }: OngoingChallengesProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>(propChallenges);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch challenges when component mounts
  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("No wallet found. Please install MetaMask.");
      }

      // Connect to the wallet and get provider/signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      try {
        // Request wallet connection
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        // Fetch active challenges from the smart contract
        const challengeData = await contract.getActiveChallenges();
        
        if (!challengeData || !Array.isArray(challengeData)) {
          console.error("Invalid challenge data format:", challengeData);
          throw new Error("Failed to fetch challenges: Invalid data format");
        }

        // Format the data and filter for user's participation
        const formattedChallenges = challengeData
          .filter((c: any) => c.participants && Array.isArray(c.participants) && c.participants.includes(userAddress))
          .map((c: any) => ({
            id: c.id?.toString() || "0",
            name: c.name || `Challenge ${c.id || 0}`,
            stakedAmount: Number(ethers.formatEther(c.stakedAmount || 0)),
            participants: (c.participants || []).map((p: string) => ({
              address: p,
              avatar: `https://robohash.org/${p}.png`,
            })),
            nextMilestoneDate: new Date(Number(c.nextMilestoneDate || Date.now()) * 1000),
            progress: Number(c.progress || 0),
            track: c.track || "Unknown",
          }));

        setChallenges(formattedChallenges);
      } catch (contractErr: any) {
        console.error("Contract interaction error:", contractErr);
        if (contractErr.code === "BAD_DATA") {
          throw new Error("Contract returned invalid data. Please check if you're connected to the correct network.");
        }
        throw new Error(`Contract error: ${contractErr.message || "Failed to fetch challenges"}`);
      }
    } catch (err: any) {
      console.error("Error fetching challenges:", err);
      setError(err.message || "Failed to fetch challenges. Check wallet and network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-gradient">Ongoing Challenges</h2>

      {loading ? (
        <p className="text-white">Loading challenges...</p>
      ) : error ? (
        <Card className="glassmorphism border border-white/10 p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-16 w-16 text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Challenges</h3>
            <p className="text-web3-orange text-sm mb-6 max-w-md mx-auto">{error}</p>
            <Button
              onClick={fetchChallenges}
              style={{ background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)" }}
            >
              <Trophy className="mr-2 h-5 w-5" />
              Retry
            </Button>
          </div>
        </Card>
      ) : challenges.length === 0 ? (
        <Card className="glassmorphism border border-white/10 p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-16 w-16 text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Challenges</h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              You haven't joined any challenges yet! Start competing and earning rewards by creating or joining a challenge today.
            </p>
            <Button style={{ background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)" }}>
              <Trophy className="mr-2 h-5 w-5" />
              Create Your First Challenge
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="glassmorphism border border-white/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Challenge Info */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-semibold text-white">{challenge.name}</h3>
                    <p className="text-white/70">{challenge.track} Track</p>

                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-web3-blue mr-2" />
                      <p className="text-sm text-white/70">Participants:</p>
                      <div className="flex -space-x-2 ml-2">
                        {challenge.participants.map((participant, index) => (
                          <img
                            key={index}
                            src={participant.avatar}
                            alt={participant.address}
                            className="h-8 w-8 rounded-full border-2 border-web3-background"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-web3-orange mr-2" />
                      <p className="text-sm text-white/70">
                        Next milestone: {challenge.nextMilestoneDate.toLocaleDateString()}
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
                      <Button variant="outline" className="w-full lg:w-auto px-6 py-6">
                        <span className="mr-2">View Challenge</span>
                        <ArrowRight className="h-4 w-4" />
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