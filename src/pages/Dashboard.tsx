
import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import WalletSummary from "@/components/dashboard/WalletSummary";
import CreateChallenge from "@/components/dashboard/CreateChallenge";
import OngoingChallenges from "@/components/dashboard/OngoingChallenges";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { useWeb3 } from "@/context/Web3Provider";
import { useChallenge } from "@/hooks/useChallenge";
import { ethers } from "ethers";
import { EDU_CHAIN_CONFIG } from "@/lib/utils";

interface NewChallenge {
  name: string;
  description: string;
  stakeAmount: string;
  participantCount: number;
}

const Dashboard = () => {
  const { address, wallet, contract, isConnected, networkDetails } = useWeb3();
  const { createChallenge } = useChallenge();
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

  const handleCreateChallenge = async (newChallenge: NewChallenge) => {
    if (!contract || !wallet) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!networkDetails.isCorrectNetwork) {
      toast.error(`Please switch to the ${networkDetails.name} network`);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Creating challenge with details:", newChallenge);
      
      // Call the createChallenge function from our hook
      const success = await createChallenge(
        newChallenge.name,
        newChallenge.description,
        newChallenge.stakeAmount,
        newChallenge.participantCount
      );
      
      if (success) {
        toast.success("Challenge created successfully!");
        await fetchWalletBalance(); // Refresh wallet balance
      }
    } catch (error: any) {
      console.error("Error in handleCreateChallenge:", error);
      toast.error(
        error.reason || error.message || "Failed to create challenge. Please try again."
      );
    } finally {
      setIsLoading(false);
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
        <CreateChallenge 
          onCreateChallenge={handleCreateChallenge} 
          walletBalance={walletBalance} 
        />
        <OngoingChallenges />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
