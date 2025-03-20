import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/context/Web3Provider";
import { ethers } from "ethers";
import { toast } from "sonner";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import Footer from "@/components/layout/Footer";
import { EDU_CHAIN_CONFIG } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, ArrowDownCircle, Download, Upload, X, AlertCircle, Loader2 } from "lucide-react";
import useContractDebugger from "@/hooks/useContractDebugger";

const fallbackTransactions = [
  {
    id: "tx-12345",
    type: "deposit",
    amount: 0.5,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "completed",
  },
  {
    id: "tx-12346",
    type: "withdrawal",
    amount: 0.2,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "completed",
  },
  {
    id: "tx-12347",
    type: "stake",
    amount: 0.3,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: "completed",
  },
  {
    id: "tx-12348",
    type: "reward",
    amount: 0.15,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: "completed",
  },
];

const FALLBACK_BALANCE = {
  available: 0.75,
  staked: 1.25,
  pending: 0.5,
  total: 2.5,
};

const Balance = () => {
  const { wallet, contract, isConnected, connectWallet, switchToEduChain, getCurrentChainId } = useWeb3();
  const { ensureCorrectNetwork, networkStatus } = useContractDebugger();
  const [isLoading, setIsLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [balance, setBalance] = useState(FALLBACK_BALANCE);
  const [transactions, setTransactions] = useState(fallbackTransactions);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const forceRefresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    if (wallet && isConnected) {
      checkNetwork();
      fetchBalanceAndTransactions();
    } else {
      setBalance(FALLBACK_BALANCE);
      setTransactions(fallbackTransactions);
    }
  }, [wallet, isConnected, refreshTrigger, networkStatus.isCorrectNetwork]);

  const checkNetwork = async () => {
    const chainId = await getCurrentChainId();
    const isEduChain = chainId === EDU_CHAIN_CONFIG.chainId;
    setIsCorrectNetwork(isEduChain);
    
    if (!isEduChain) {
      toast.warning(`Please switch to eduChain Testnet for this feature to work properly`, {
        action: {
          label: 'Switch Network',
          onClick: () => switchToEduChain()
        }
      });
    }
  };

  const fetchBalanceAndTransactions = async () => {
    setIsLoading(true);
    try {
      if (!networkStatus.isCorrectNetwork) {
        const switchSuccess = await ensureCorrectNetwork();
        if (!switchSuccess) {
          console.warn("Failed to switch to eduChain. Using fallback data.");
          setBalance(FALLBACK_BALANCE);
          setTransactions(fallbackTransactions);
          setIsLoading(false);
          return;
        }
      }
      
      if (!contract || !wallet) {
        console.warn("Contract or wallet not available. Using fallback data.");
        setBalance(FALLBACK_BALANCE);
        setTransactions(fallbackTransactions);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Attempting to fetch wallet balance...");
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const ethBalance = await provider.getBalance(wallet);
        const formattedEthBalance = Number(ethers.formatEther(ethBalance));
        
        let codeStakeBalance = {
          available: 0,
          staked: 0,
          pending: 0,
          total: 0
        };
        
        try {
          if (contract.getWalletSummary) {
            const walletSummary = await contract.getWalletSummary(wallet);
            if (walletSummary) {
              codeStakeBalance = {
                available: Number(ethers.formatEther(walletSummary.balance || 0n)),
                staked: Number(ethers.formatEther(walletSummary.totalStaked || 0n)),
                pending: Number(ethers.formatEther(walletSummary.pendingRewards || 0n)),
                total: Number(ethers.formatEther((walletSummary.balance || 0n) + (walletSummary.totalStaked || 0n)))
              };
            }
          } else {
            if (contract.getBalance) {
              const balance = await contract.getBalance(wallet);
              codeStakeBalance = {
                available: Number(ethers.formatEther(balance || 0n)),
                staked: 0,
                pending: 0,
                total: Number(ethers.formatEther(balance || 0n))
              };
            } else {
              console.warn("Neither getWalletSummary nor getBalance methods available");
              codeStakeBalance = {
                available: formattedEthBalance,
                staked: 0,
                pending: 0,
                total: formattedEthBalance
              };
            }
          }
        } catch (error) {
          console.error("Error fetching contract wallet data:", error);
          codeStakeBalance = {
            available: formattedEthBalance,
            staked: 0,
            pending: 0,
            total: formattedEthBalance
          };
        }
        
        setBalance(codeStakeBalance);
        
        try {
          if (contract.getTransactionHistory) {
            const txHistory = await contract.getTransactionHistory(wallet);
            if (txHistory && Array.isArray(txHistory) && txHistory.length > 0) {
              const formattedTxs = txHistory.map((tx: any) => ({
                id: tx.id || `tx-${Date.now()}`,
                type: tx.txType || "unknown",
                amount: Number(ethers.formatEther(tx.amount || 0n)),
                date: new Date(Number(tx.timestamp || 0) * 1000),
                status: "completed",
              }));
              setTransactions(formattedTxs);
            } else {
              console.log("No transaction history found, using fallback");
              setTransactions(fallbackTransactions);
            }
          } else {
            console.warn("getTransactionHistory method not available");
            setTransactions(fallbackTransactions);
          }
        } catch (txError) {
          console.error("Error fetching transaction history:", txError);
          setTransactions(fallbackTransactions);
        }
      } catch (contractErr) {
        console.error("Contract data error:", contractErr);
        toast.error("Unable to fetch wallet data from contract. Using demo data.");
        setBalance(FALLBACK_BALANCE);
        setTransactions(fallbackTransactions);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch wallet data. Using demo data.");
      setBalance(FALLBACK_BALANCE);
      setTransactions(fallbackTransactions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const isOnCorrectNetwork = await ensureCorrectNetwork();
      if (!isOnCorrectNetwork) {
        toast.error("Please switch to eduChain Testnet to continue");
        setIsLoading(false);
        return;
      }
      
      if (!contract || !wallet) {
        throw new Error("Wallet not connected");
      }

      if (!contract.deposit) {
        toast.error("Deposit method not available. Please check your connection.");
        setIsLoading(false);
        return;
      }

      const depositValueWei = ethers.parseEther(depositAmount);
      
      const gasEstimatePromise = contract.deposit.estimateGas({ value: depositValueWei });
      
      toast.promise(gasEstimatePromise, {
        loading: 'Checking transaction...',
        success: 'Transaction looks good!',
        error: 'Transaction would fail. Please verify your connection to eduChain.'
      });
      
      try {
        await gasEstimatePromise;
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        throw new Error("Transaction would fail. Please verify you're connected to eduChain Testnet.");
      }
      
      const tx = await contract.deposit({ value: depositValueWei });
      
      toast.loading("Processing deposit...");
      await tx.wait();
      toast.success(`Successfully deposited ${depositAmount} ETH`);
      
      setShowDepositModal(false);
      setDepositAmount("");
      forceRefresh();
    } catch (error: any) {
      console.error("Deposit failed:", error);
      toast.error(`Deposit failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(withdrawAmount) > balance.available) {
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);
    try {
      const isOnCorrectNetwork = await ensureCorrectNetwork();
      if (!isOnCorrectNetwork) {
        toast.error("Please switch to eduChain Testnet to continue");
        setIsLoading(false);
        return;
      }
      
      if (!contract || !wallet) {
        throw new Error("Wallet not connected");
      }

      if (!contract.withdraw) {
        toast.error("Withdraw method not available. Please check your connection.");
        setIsLoading(false);
        return;
      }

      const withdrawValueWei = ethers.parseEther(withdrawAmount);
      
      const gasEstimatePromise = contract.withdraw.estimateGas(withdrawValueWei);
      
      toast.promise(gasEstimatePromise, {
        loading: 'Checking transaction...',
        success: 'Transaction looks good!',
        error: 'Transaction would fail. Please verify your connection to eduChain.'
      });
      
      try {
        await gasEstimatePromise;
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        throw new Error("Transaction would fail. Please verify you're connected to eduChain Testnet.");
      }
      
      const tx = await contract.withdraw(withdrawValueWei);
      
      toast.loading("Processing withdrawal...");
      await tx.wait();
      toast.success(`Successfully withdrew ${withdrawAmount} ETH`);
      
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      forceRefresh();
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
      toast.error(`Withdrawal failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-6 w-6 text-web3-blue" />;
      case "withdrawal":
        return <Upload className="h-6 w-6 text-web3-orange" />;
      case "stake":
        return <DollarSign className="h-6 w-6 text-web3-blue" />;
      case "reward":
      case "earned":
        return <Download className="h-6 w-6 text-web3-success" />;
      default:
        return <DollarSign className="h-6 w-6 text-web3-blue" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!wallet) {
    return (
      <div className="min-h-screen bg-web3-background">
        <DashboardNavbar address={wallet} />
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please connect your wallet</h2>
            <p className="text-white/70 mb-4">Connect your wallet to view your balance</p>
            <Button onClick={connectWallet} variant="gradient">
              Connect Wallet
            </Button>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gradient">Your Balance</h1>
          <div className="flex items-center">
            {!networkStatus.isCorrectNetwork && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2 text-web3-red border-web3-red"
                onClick={() => switchToEduChain()}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Switch to eduChain
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={forceRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Refresh</span>
              )}
            </Button>
          </div>
        </div>

        {!networkStatus.isCorrectNetwork && (
          <div className="mb-6 p-3 bg-web3-red/10 border border-web3-red/30 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-web3-red mr-2" />
              <p className="text-web3-red">
                You are not connected to eduChain Testnet. Please switch networks to access all features.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="glassmorphism border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Available Balance</CardTitle>
              <CardDescription className="text-white/60">Ready to use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gradient-blue-orange">{balance.available}</span>
                <span className="text-lg ml-1 text-white/70">ETH</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
                <DialogTrigger asChild>
                  <Button variant="gradient" size="sm" className="w-[48%]">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] glassmorphism border border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gradient mb-4">Deposit ETH</DialogTitle>
                    <button
                      onClick={() => setShowDepositModal(false)}
                      className="absolute right-4 top-4 text-white/70 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="mb-4">
                      <Label htmlFor="deposit-amount" className="text-white mb-2 block">
                        Amount (ETH)
                      </Label>
                      <Input
                        id="deposit-amount"
                        placeholder="0.0"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleDeposit}
                      disabled={isLoading || !depositAmount}
                      className="w-full"
                      variant="glass"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? "Processing..." : "Deposit ETH"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[48%]">
                    <Upload className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] glassmorphism border border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gradient mb-4">Withdraw ETH</DialogTitle>
                    <button
                      onClick={() => setShowWithdrawModal(false)}
                      className="absolute right-4 top-4 text-white/70 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="mb-4">
                      <Label htmlFor="withdraw-amount" className="text-white mb-2 block">
                        Amount (ETH)
                      </Label>
                      <Input
                        id="withdraw-amount"
                        placeholder="0.0"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <p className="text-white/60 text-sm mt-1">
                        Available: {balance.available} ETH
                      </p>
                    </div>
                    <Button
                      onClick={handleWithdraw}
                      disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) > balance.available}
                      className="w-full"
                      variant="glass"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? "Processing..." : "Withdraw ETH"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card className="glassmorphism border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Staked</CardTitle>
              <CardDescription className="text-white/60">In challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gradient-blue-orange">{balance.staked}</span>
                <span className="text-lg ml-1 text-white/70">ETH</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Pending Rewards</CardTitle>
              <CardDescription className="text-white/60">Not yet claimed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gradient-blue-orange">{balance.pending}</span>
                <span className="text-lg ml-1 text-white/70">ETH</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Total Balance</CardTitle>
              <CardDescription className="text-white/60">Available + staked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gradient-blue-orange">{balance.total}</span>
                <span className="text-lg ml-1 text-white/70">ETH</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="mb-10">
          <TabsList className="glassmorphism border border-white/10 mb-4">
            <TabsTrigger value="all" className="text-white data-[state=active]:text-web3-blue">
              All Transactions
            </TabsTrigger>
            <TabsTrigger value="deposits" className="text-white data-[state=active]:text-web3-blue">
              Deposits
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="text-white data-[state=active]:text-web3-blue">
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="stakes" className="text-white data-[state=active]:text-web3-blue">
              Stakes
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-white data-[state=active]:text-web3-blue">
              Rewards
            </TabsTrigger>
          </TabsList>

          <Card className="glassmorphism border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TabsContent value="all" className="p-0">
                {renderTransactions(transactions)}
              </TabsContent>
              <TabsContent value="deposits" className="p-0">
                {renderTransactions(
                  transactions.filter((tx) => tx.type === "deposit")
                )}
              </TabsContent>
              <TabsContent value="withdrawals" className="p-0">
                {renderTransactions(
                  transactions.filter((tx) => tx.type === "withdrawal")
                )}
              </TabsContent>
              <TabsContent value="stakes" className="p-0">
                {renderTransactions(
                  transactions.filter((tx) => tx.type === "stake")
                )}
              </TabsContent>
              <TabsContent value="rewards" className="p-0">
                {renderTransactions(
                  transactions.filter((tx) => tx.type === "reward" || tx.type === "earned")
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </main>
      <Footer />
    </div>
  );

  function renderTransactions(txs: typeof transactions) {
    if (txs.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-white/70">No transactions found</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-white/10">
        {txs.map((tx) => (
          <div key={tx.id} className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 mr-4">
                {getTransactionIcon(tx.type)}
              </div>
              <div>
                <p className="text-white font-medium capitalize">{tx.type}</p>
                <p className="text-white/60 text-sm">{formatDate(tx.date)}</p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-medium ${
                  tx.type === "withdrawal" ? "text-web3-orange" : "text-web3-blue"
                }`}
              >
                {tx.type === "withdrawal" ? "-" : "+"}
                {tx.amount} ETH
              </p>
              <p
                className={`text-sm ${
                  tx.status === "completed"
                    ? "text-web3-success"
                    : tx.status === "pending"
                    ? "text-web3-orange"
                    : "text-web3-red"
                }`}
              >
                {tx.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default Balance;
