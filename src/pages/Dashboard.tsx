
import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import WalletSummary from "@/components/dashboard/WalletSummary";
import CreateChallenge from "@/components/dashboard/CreateChallenge";
import OngoingChallenges from "@/components/dashboard/OngoingChallenges";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { useWeb3 } from "@/context/Web3Provider";
import { ethers } from "ethers";
import { EDU_CHAIN_CONFIG } from "@/lib/utils";

interface Challenge {
  id: string;
  creator: string;
  player1: string;
  player2: string;
  stakedAmount: number;
  totalStake: number;
  isActive: boolean;
  track?: string;
  milestones?: string[];
}

interface WalletSummary {
  totalStaked: number;
  ongoingChallenges: number;
  totalWinnings: number;
  milestonesCompleted: number;
}

interface NewChallenge {
  player1: string;
  player2: string;
  stakeAmount: string;
  track: string;
}

interface OngoingChallengeItem {
  id: string;
  name: string;
  stakedAmount: number;
  participants: {
    address: string;
    avatar: string;
  }[];
  nextMilestoneDate: Date;
  progress: number;
  track: string;
}

const Dashboard = () => {
  const { address, wallet, contract, isConnected, networkDetails } = useWeb3();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [ongoingChallenges, setOngoingChallenges] = useState<OngoingChallengeItem[]>([]);
  const [summary, setSummary] = useState<WalletSummary>({
    totalStaked: 0,
    ongoingChallenges: 0,
    totalWinnings: 0,
    milestonesCompleted: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState("0");

  useEffect(() => {
    console.log("Dashboard - Wallet:", wallet);
    console.log("Dashboard - Address:", address);
    console.log("Dashboard - Is Connected:", isConnected);
    console.log("Dashboard - Contract:", contract);
    console.log("Dashboard - Network Details:", networkDetails);
  }, [wallet, address, isConnected, contract, networkDetails]);

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        await fetchWalletBalance();
        await fetchChallenges();
      }
    };
    init();
  }, [wallet, contract]);

  const fetchWalletBalance = async () => {
    if (!wallet) {
      return;
    }

    try {
      console.log("Fetching wallet balance for address:", wallet);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(wallet);
      const formattedBalance = ethers.formatEther(balance);
      console.log("Wallet balance:", formattedBalance, "ETH");
      setWalletBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchChallenges = async () => {
    if (!contract || !wallet) {
      console.log("Cannot fetch challenges: Contract or wallet not available");
      return;
    }

    if (!networkDetails.isCorrectNetwork) {
      console.log("Cannot fetch challenges: Not on the correct network");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting to fetch active challenges...");
      
      // Try to get active challenges from contract
      let activeIds: number[] = [];
      try {
        activeIds = await contract.getActiveChallenges();
        console.log("Active challenge IDs:", activeIds);
      } catch (error) {
        console.error("Error calling getActiveChallenges:", error);
        // Fallback for testing
        activeIds = [0, 1, 2];
        console.log("Using fallback challenge IDs:", activeIds);
      }

      const fetchedChallenges: Challenge[] = [];

      for (let i = 0; i < activeIds.length; i++) {
        try {
          console.log(`Fetching details for challenge ID: ${activeIds[i]}`);
          const challenge = await fetchChallengeDetails(activeIds[i]);
          if (challenge) {
            fetchedChallenges.push(challenge);
          }
        } catch (error) {
          console.error(`Error fetching challenge ${activeIds[i]}:`, error);
        }
      }

      console.log("Fetched challenges:", fetchedChallenges);
      setChallenges(fetchedChallenges);
      updateSummary(fetchedChallenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      toast.error("Failed to fetch challenges. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChallengeDetails = async (index: number): Promise<Challenge | null> => {
    try {
      let challenge;
      console.log(`Attempting to fetch challenge ID: ${index}`);
      
      try {
        challenge = await contract.challenges(index);
        console.log(`Raw challenge data for ID ${index}:`, challenge);
      } catch (error) {
        console.error(`Contract error fetching challenge ${index}:`, error);
        // Create mock data for testing if contract call fails
        challenge = {
          creator: wallet,
          player1: wallet,
          player2: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          stakedAmount: ethers.parseEther("0.1"),
          totalStake: ethers.parseEther("0.2"),
          isActive: true,
          track: "Web Development",
        };
        console.log(`Using mock data for challenge ${index}:`, challenge);
      }

      // Format the challenge data
      return {
        id: index.toString(),
        creator: challenge.creator || wallet,
        player1: challenge.player1 || wallet,
        player2: challenge.player2 || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        stakedAmount: Number(ethers.formatEther(challenge.stakedAmount || 0)),
        totalStake: Number(ethers.formatEther(challenge.totalStake || 0)),
        isActive: challenge.isActive !== undefined ? challenge.isActive : true,
        track: challenge.track || "General Programming",
      };
    } catch (error) {
      console.error(`Error processing challenge ${index}:`, error);
      return null;
    }
  };

  const updateSummary = (fetchedChallenges: Challenge[]) => {
    const summary = fetchedChallenges.reduce(
      (acc, challenge) => {
        if (challenge.isActive && (challenge.player1 === wallet || challenge.player2 === wallet)) {
          acc.totalStaked += challenge.stakedAmount;
          acc.ongoingChallenges += 1;
        }
        return acc;
      },
      {
        totalStaked: 0,
        ongoingChallenges: 0,
        totalWinnings: 0,
        milestonesCompleted: 0,
      }
    );

    console.log("Updated summary:", summary);
    setSummary(summary);
  };

  useEffect(() => {
    if (challenges.length > 0) {
      const convertedChallenges = challenges.map(challenge => ({
        id: challenge.id,
        name: `Challenge ${challenge.id}`,
        stakedAmount: challenge.stakedAmount,
        participants: [
          {
            address: challenge.player1,
            avatar: `https://robohash.org/${challenge.player1}.png`,
          },
          {
            address: challenge.player2,
            avatar: `https://robohash.org/${challenge.player2}.png`,
          }
        ],
        nextMilestoneDate: new Date(),
        progress: 0,
        track: challenge.track || "General",
      }));
      
      console.log("Converted challenges for UI:", convertedChallenges);
      setOngoingChallenges(convertedChallenges);
    }
  }, [challenges]);

  const handleCreateChallenge = async (newChallenge: NewChallenge) => {
    if (!contract || !wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!networkDetails.isCorrectNetwork) {
      toast.error(`Please switch to the ${networkDetails.name} network`);
      return;
    }

    if (!ethers.isAddress(newChallenge.player1) || !ethers.isAddress(newChallenge.player2)) {
      toast.error("Invalid wallet addresses provided");
      return;
    }

    try {
      const stakeInWei = ethers.parseEther(newChallenge.stakeAmount);
      
      const userBalance = ethers.parseEther(walletBalance);
      if (userBalance < stakeInWei) {
        toast.error(`Insufficient balance (${walletBalance} ETH). Please deposit funds first.`);
        return;
      }
      
      toast.loading("Creating challenge on blockchain...");
      console.log("Creating challenge with data:", newChallenge);
      console.log("Stake amount in Wei:", stakeInWei.toString());

      // Calculate milestone timestamps (4 milestones over 30 days)
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const totalDuration = 30 * 24 * 60 * 60; // 30 days in seconds
      const intervalDuration = totalDuration / 4; // Duration between milestones
      
      const milestoneTimestamps = [
        now + intervalDuration,
        now + intervalDuration * 2,
        now + intervalDuration * 3,
        now + totalDuration
      ];
      
      console.log("Milestone timestamps:", milestoneTimestamps);

      try {
        // Call the contract to create the challenge
        console.log("Calling contract.createChallenge with params:", {
          stakeAmount: stakeInWei,
          players: [newChallenge.player1, newChallenge.player2],
          milestoneTimestamps,
          value: stakeInWei
        });
        
        const tx = await contract.createChallenge(
          stakeInWei,  // total stake
          2,  // total players (hardcoded to 2 for now)
          [newChallenge.player1, newChallenge.player2],  // participants
          milestoneTimestamps, // milestone timestamps
          { value: stakeInWei }  // Send ETH with transaction
        );

        console.log("Transaction sent:", tx.hash);
        toast.success("Transaction submitted, waiting for confirmation...");

        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
        
        toast.success("Challenge created successfully on the blockchain!");
        await fetchWalletBalance(); // Refresh wallet balance
        await fetchChallenges();    // Refresh challenges list
      } catch (error: any) {
        console.error("Contract interaction error:", error);
        
        // Check for specific error types
        if (error.message?.includes("insufficient funds")) {
          toast.error("Insufficient funds to cover gas and stake amount");
        } else if (error.message?.includes("user rejected")) {
          toast.error("Transaction rejected by user");
        } else {
          toast.error(error.reason || error.message || "Failed to create challenge on blockchain");
        }
      }
    } catch (error: any) {
      console.error("Error in handleCreateChallenge:", error);
      toast.error(
        error.reason || error.message || "Failed to create challenge. Please try again."
      );
    }
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please connect your wallet</h2>
            <p className="text-white/70">Connect your wallet to view your dashboard</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-web3-background">
      <DashboardNavbar address={wallet} />
      <main className="container mx-auto px-4 py-8 mt-16">
        <WalletSummary />
        <CreateChallenge onCreateChallenge={handleCreateChallenge} walletBalance={walletBalance} />
        <OngoingChallenges />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
