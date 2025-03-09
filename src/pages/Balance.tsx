import React, { useState, useEffect } from "react";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { 
  ArrowDownCircle, ArrowUpCircle, Clock, DollarSign, 
  Wallet, X, Download, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useWeb3 } from "@/context/Web3Provider";
import { ethers } from "ethers";

interface Transaction {
  id: string;
  type: "earned" | "staked" | "deposited" | "withdrawn";
  amount: number;
  date: Date;
  description: string;
  challenge?: string;
}

interface WalletSummary {
  balance: number;
  totalEarned: number;
  totalStaked: number;
}

const Balance = () => {
  const { wallet, contract } = useWeb3();
  const [summary, setSummary] = useState<WalletSummary>({
    balance: 0,
    totalEarned: 0,
    totalStaked: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (wallet && contract) {
      fetchWalletData();
    }
  }, [wallet, contract]);
  
  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch wallet summary from contract
      const walletSummary = await contract.getWalletSummary(wallet);
      setSummary({
        balance: Number(ethers.formatEther(walletSummary.balance)),
        totalEarned: Number(ethers.formatEther(walletSummary.totalEarned)),
        totalStaked: Number(ethers.formatEther(walletSummary.totalStaked))
      });

      // Fetch transaction history from contract
      const txHistory = await contract.getTransactionHistory(wallet);
      const formattedTxs = txHistory.map((tx: any) => ({
        id: tx.id,
        type: tx.txType,
        amount: Number(ethers.formatEther(tx.amount)),
        date: new Date(Number(tx.timestamp) * 1000),
        description: tx.description,
        challenge: tx.challenge || undefined
      }));

      setTransactions(formattedTxs);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      setIsProcessing(true);
      const amountInWei = ethers.parseEther(depositAmount);

      // Show pending toast
      toast.loading("Processing deposit...");

      const tx = await contract.deposit({
        value: amountInWei,
        gasLimit: 300000 // Adjust as needed
      });

      await tx.wait();
      
      await fetchWalletData(); // Refresh data
      setIsDepositModalOpen(false);
      setDepositAmount("");
      
      toast.success(`Successfully deposited ${depositAmount} ETH`);
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error(error.reason || "Failed to process deposit");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (parseFloat(withdrawAmount) > summary.balance) {
      toast.error("Insufficient balance");
      return;
    }
    
    try {
      setIsProcessing(true);
      const amountInWei = ethers.parseEther(withdrawAmount);

      // Show pending toast
      toast.loading("Processing withdrawal...");

      const tx = await contract.withdraw(amountInWei, {
        gasLimit: 300000 // Adjust as needed
      });

      await tx.wait();
      
      await fetchWalletData(); // Refresh data
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      
      toast.success(`Successfully withdrawn ${withdrawAmount} ETH`);
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast.error(error.reason || "Failed to process withdrawal");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <DollarSign className="h-6 w-6 text-web3-success" />;
      case "staked":
        return <ArrowDownCircle className="h-6 w-6 text-web3-blue" />;
      case "deposited":
        return <Download className="h-6 w-6 text-web3-blue" />;
      case "withdrawn":
        return <Upload className="h-6 w-6 text-web3-orange" />;
      default:
        return <Clock className="h-6 w-6 text-white/70" />;
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
        return "text-web3-success";
      case "staked":
        return "text-web3-blue";
      case "deposited":
        return "text-web3-blue";
      case "withdrawn":
        return "text-web3-orange";
      default:
        return "text-white/70";
    }
  };
  
  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please connect your wallet</h2>
            <p className="text-white/70">Connect your wallet to view your balance and transactions</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Loading wallet data...</h2>
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
        <h1 className="text-3xl font-bold mb-8 text-gradient">Balance & Transactions</h1>
        
        <div className="mb-8 glassmorphism border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-web3-blue/5 via-transparent to-web3-orange/5 pointer-events-none"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="text-white/70 mb-2">Total Balance</p>
              <h2 className="text-4xl font-bold text-gradient mb-4">{summary.balance.toFixed(2)} ETH</h2>
              
              <div className="flex gap-4">
                <Button 
                  variant="gradient" 
                  onClick={() => setIsDepositModalOpen(true)}
                  className="group overflow-hidden transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <Download className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsWithdrawModalOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-web3-blue/10 to-web3-orange/10 rounded-xl border border-white/20 p-4 md:max-w-xs w-full">
              <div className="flex items-center mb-3">
                <Wallet className="h-5 w-5 text-web3-orange mr-2" />
                <h3 className="text-lg font-semibold text-white">Wallet Summary</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-white/70">Available Balance:</p>
                  <p className="text-white font-medium">{summary.balance.toFixed(2)} ETH</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-white/70">Total Earned:</p>
                  <p className="text-white font-medium">{summary.totalEarned.toFixed(2)} ETH</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-white/70">Total Staked:</p>
                  <p className="text-white font-medium">{summary.totalStaked.toFixed(2)} ETH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="glassmorphism border border-white/10">
          <CardHeader>
            <CardTitle className="text-gradient">Transaction History</CardTitle>
            <CardDescription className="text-white/70">
              View all your deposits, withdrawals, stakes, and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-start p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="mr-4 mt-1 p-2 rounded-full bg-white/5">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                      <p className="font-medium text-white">
                        {formatTransactionType(transaction.type)} {transaction.type === "earned" ? "reward" : transaction.type === "staked" ? "entry fee" : ""}
                      </p>
                      <p className={`${getTransactionColor(transaction.type)} font-semibold`}>
                        {transaction.type === "withdrawn" || transaction.type === "staked" ? "-" : "+"}{transaction.amount} ETH
                      </p>
                    </div>
                    
                    <p className="text-sm text-white/70 mb-1">{transaction.description}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs">
                      <p className="text-white/50">{formatDate(transaction.date)}</p>
                      {transaction.challenge && (
                        <p className="text-web3-blue">{transaction.challenge}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative glassmorphism border border-white/20 rounded-xl w-full max-w-md overflow-hidden">
            <div className="bg-web3-background/90 backdrop-blur-sm border-b border-white/10 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gradient">Deposit ETH</h2>
              
              <button 
                onClick={() => setIsDepositModalOpen(false)}
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                disabled={isProcessing}
              >
                <X className="h-4 w-4 text-white/70" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-white/70 mb-4">
                Enter the amount of ETH you want to deposit to your CodeStake wallet.
              </p>
              
              <div className="mb-6">
                <label htmlFor="depositAmount" className="text-white/70 text-sm mb-2 block">
                  Amount (ETH)
                </label>
                <div className="relative">
                  <input
                    id="depositAmount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-web3-blue/50"
                    disabled={isProcessing}
                    min="0"
                    step="0.01"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50">
                    ETH
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDepositModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="gradient"
                  onClick={handleDeposit}
                  disabled={isProcessing || !depositAmount}
                  className="min-w-[100px]"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing
                    </div>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Deposit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative glassmorphism border border-white/20 rounded-xl w-full max-w-md overflow-hidden">
            <div className="bg-web3-background/90 backdrop-blur-sm border-b border-white/10 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gradient">Withdraw ETH</h2>
              
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                disabled={isProcessing}
              >
                <X className="h-4 w-4 text-white/70" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-white/70 mb-4">
                Enter the amount of ETH you want to withdraw to your external wallet.
              </p>
              
              <div className="mb-4">
                <label htmlFor="withdrawAmount" className="text-white/70 text-sm mb-2 block">
                  Amount (ETH)
                </label>
                <div className="relative">
                  <input
                    id="withdrawAmount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-web3-blue/50"
                    disabled={isProcessing}
                    min="0"
                    max={summary.balance}
                    step="0.01"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50">
                    ETH
                  </div>
                </div>
                <p className="text-sm text-white/50 mt-1">
                  Available: {summary.balance.toFixed(2)} ETH
                </p>
              </div>
              
              <div className="p-3 bg-white/5 rounded-lg mb-6">
                <p className="text-sm text-white/70">
                  Note: A small gas fee will be charged for processing your withdrawal.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                
                <Button
                  variant="glass"
                  onClick={handleWithdraw}
                  disabled={isProcessing || !withdrawAmount || parseFloat(withdrawAmount) > summary.balance}
                  className="min-w-[100px]"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing
                    </div>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Withdraw
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Balance;
