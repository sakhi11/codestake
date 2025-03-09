import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Coins, Trophy, Users, CheckSquare } from "lucide-react";

// Smart Contract Info (Replace with your actual contract details)
const CONTRACT_ADDRESS = "0x5b4050c163Fb24522Fa25876b8F6A983a69D9165"; // Replace with your deployed contract address
const ABI = [
  "function getUserSummary(address user) view returns (uint256 totalStaked, uint256 ongoingChallenges, uint256 totalWinnings, uint256 milestonesCompleted)",
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

const WalletSummary = () => {
  const [summary, setSummary] = useState({
    totalStaked: 0,
    ongoingChallenges: 0,
    totalWinnings: 0,
    milestonesCompleted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if we're in a browser environment and wallet is available
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No wallet found. Please install MetaMask and ensure it's active.");
      }

      // Initialize provider
      let provider;
      try {
        provider = new ethers.BrowserProvider(window.ethereum);
      } catch (err) {
        throw new Error("Failed to initialize Web3 provider. Ensure Ethers.js is correctly installed.");
      }

      // Request wallet connection
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        // Try getting challenge counter first to verify contract connection
        const challengeCount = await contract.challengeCounter();
        console.log("Challenge counter:", challengeCount);

        // Fetch user summary from the smart contract
        const data = await contract.getUserSummary(userAddress);
        console.log("Raw contract data:", data);

        if (!data) {
          throw new Error("No data returned from contract");
        }

        // Format the data with safe fallbacks
        setSummary({
          totalStaked: Number(ethers.formatEther(data.totalStaked || 0n)),
          ongoingChallenges: Number(data.ongoingChallenges || 0n),
          totalWinnings: Number(ethers.formatEther(data.totalWinnings || 0n)),
          milestonesCompleted: Number(data.milestonesCompleted || 0n),
        });
      } catch (contractErr: any) {
        console.error("Contract interaction error:", contractErr);
        if (contractErr.code === "BAD_DATA") {
          throw new Error("Contract data format mismatch. Please verify the contract address and network.");
        }
        throw contractErr;
      }
    } catch (err: any) {
      console.error("Error fetching summary:", err);
      const errorMessage = err.code === "BAD_DATA" 
        ? "Contract data format mismatch. Please verify the contract address and network."
        : err.message || "Failed to fetch summary. Check wallet and network.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mb-12 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gradient">Your Dashboard</h1>
        <p className="text-white">Loading summary...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gradient">Your Dashboard</h1>
        <div className="glassmorphism border border-white/10 p-8 text-center rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Summary</h3>
          <p className="text-web3-orange text-sm mb-6">{error}</p>
          <button
            onClick={fetchSummary}
            className="px-4 py-2 text-white rounded-lg"
            style={{ background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)" }}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gradient">Your Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glassmorphism hover:bg-white/10 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-web3-blue/20 mr-4 group-hover:animate-pulse">
              <Coins className="h-6 w-6 text-web3-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white">Total Staked</h3>
          </div>
          <p className="text-3xl font-bold text-gradient-blue-orange flex items-baseline">
            {summary.totalStaked} <span className="text-lg ml-1 text-white/70">ETH</span>
          </p>
          <p className="text-white/60 text-sm mt-2">Across all challenges</p>
        </div>
        <div className="glassmorphism hover:bg-white/10 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-web3-orange/20 mr-4 group-hover:animate-pulse">
              <Users className="h-6 w-6 text-web3-orange" />
            </div>
            <h3 className="text-lg font-semibold text-white">Active Challenges</h3>
          </div>
          <p className="text-3xl font-bold text-gradient-blue-orange">{summary.ongoingChallenges}</p>
          <p className="text-white/60 text-sm mt-2">Currently participating</p>
        </div>
        <div className="glassmorphism hover:bg-white/10 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-web3-success/20 mr-4 group-hover:animate-pulse">
              <Trophy className="h-6 w-6 text-web3-success" />
            </div>
            <h3 className="text-lg font-semibold text-white">Total Winnings</h3>
          </div>
          <p className="text-3xl font-bold text-gradient-blue-orange flex items-baseline">
            {summary.totalWinnings} <span className="text-lg ml-1 text-white/70">ETH</span>
          </p>
          <p className="text-white/60 text-sm mt-2">From completed challenges</p>
        </div>
        <div className="glassmorphism hover:bg-white/10 transition-all duration-300 rounded-xl p-6 border border-white/10 group hover:scale-[1.02]">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-web3-blue/20 mr-4 group-hover:animate-pulse">
              <CheckSquare className="h-6 w-6 text-web3-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white">Milestones</h3>
          </div>
          <p className="text-3xl font-bold text-gradient-blue-orange">{summary.milestonesCompleted}</p>
          <p className="text-white/60 text-sm mt-2">Quiz milestones completed</p>
        </div>
      </div>
    </section>
  );
};

export default WalletSummary;