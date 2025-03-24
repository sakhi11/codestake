import React, { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEth } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Balance = () => {
  const web3 = useWeb3();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    if (!web3.isConnected) {
      web3.connectWallet();
    }
  }, [web3.isConnected, web3.connectWallet]);

  const handleWithdraw = async () => {
    if (!withdrawAmount) {
      toast({
        title: "Error",
        description: "Please enter an amount to withdraw.",
      });
      return;
    }

    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount to withdraw.",
        });
        return;
      }

      await web3.withdraw(amount.toString());
      toast({
        title: "Success",
        description: `Successfully withdrew ${amount} EDU.`,
      });
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error",
        description: `Withdrawal failed: ${error.message}`,
      });
    }
  };

  useEffect(() => {
    const checkChain = async () => {
      if (web3.getCurrentChainId) {
        const chainId = await web3.getCurrentChainId();
        console.log("Chain ID:", chainId);
        // Use chainId here
      } else {
        console.warn("getCurrentChainId is not available on web3 object");
      }
    };

    if (web3.isConnected) {
      checkChain();
    }
  }, [web3.isConnected, web3]);

  return (
    <div className="min-h-screen bg-web3-background text-white">
      <Navbar />
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Your Account Balance
        </h1>
        {web3.isConnected ? (
          <div className="flex flex-col items-center space-y-4">
            <p>
              Wallet Address: {web3.address}
            </p>
            <p>
              Current Balance: {formatEth(web3.balance)} EDU
            </p>
            <div className="flex space-x-4">
              <Input
                type="number"
                placeholder="Amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="text-black"
              />
              <Button variant="gradient" onClick={handleWithdraw}>
                Withdraw
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>Please connect your wallet to view your balance.</p>
            <Button variant="gradient" onClick={web3.connectWallet}>
              Connect Wallet
            </Button>
          </div>
        )}
      </div>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Balance;
