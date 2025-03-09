import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { LogOut, Menu, User, X, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3 } from "@/context/Web3Provider";
import { toast } from "sonner";

interface DashboardNavbarProps {
  address: string;
  setAddress: (addr: string | null) => void;
}

const DashboardNavbar = ({ address, setAddress }: DashboardNavbarProps) => {
  const { contract } = useWeb3();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (address) {
      fetchWalletBalance();
    }
  }, [address]);

  const fetchWalletBalance = async () => {
    try {
      setIsLoading(true);
      
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get ETH balance
      const ethBalance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(ethBalance);
      
      // If you have a contract balance as well, fetch it
      let contractBalance = "0";
      if (contract) {
        const walletData = await contract.getWalletSummary(address);
        contractBalance = ethers.formatEther(walletData.balance);
      }

      // You can choose to show either ETH balance or contract balance
      // Here we're showing the contract balance if available, otherwise ETH balance
      setBalance(contract ? contractBalance : formattedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch wallet balance");
      setBalance("0");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    try {
      setAddress(null);
      localStorage.removeItem("walletAddress");
      
      // Clear any other stored data
      localStorage.removeItem("web3Provider");
      localStorage.removeItem("userSignature");
      
      // Reset states
      setBalance("0");
      setMobileMenuOpen(false);
      
      // Navigate to home
      navigate("/");
      
      toast.success("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  const handleBalanceClick = () => {
    // Refresh balance when clicked
    fetchWalletBalance();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4",
        isScrolled ? "glassmorphism bg-web3-background/80" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gradient">
            Code<span className="text-web3-blue">Stake</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-white hover:text-white transition-colors">
              Dashboard
            </Link>

            <div className="flex items-center ml-4">
              <Link
                to="/balance"
                onClick={handleBalanceClick}
                className="flex items-center mr-4 glassmorphism px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors group"
              >
                <Wallet className="h-4 w-4 mr-2 text-web3-orange group-hover:text-web3-blue transition-colors" />
                {isLoading ? (
                  <span className="text-sm text-white/90 animate-pulse">Loading...</span>
                ) : (
                  <span className="text-sm text-white/90">{Number(balance).toFixed(4)} ETH</span>
                )}
              </Link>

              <div className="flex items-center mr-4 glassmorphism px-3 py-1.5 rounded-full">
                <User className="h-4 w-4 mr-2 text-web3-blue" />
                <span className="text-sm text-white/90">{formatAddress(address)}</span>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                className="hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </div>
          </nav>

          <button 
            className="md:hidden text-white" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden glassmorphism bg-web3-background/95 mt-4">
          <nav className="flex flex-col py-4 px-4">
            <Link
              to="/dashboard"
              className="py-3 text-white hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              to="/balance"
              className="py-3 flex items-center text-white/80 hover:text-white transition-colors"
              onClick={() => {
                setMobileMenuOpen(false);
                handleBalanceClick();
              }}
            >
              <Wallet className="h-4 w-4 mr-2 text-web3-orange" />
              {isLoading ? (
                <span className="animate-pulse">Loading balance...</span>
              ) : (
                `Balance: ${Number(balance).toFixed(4)} ETH`
              )}
            </Link>

            <div className="mt-3 glassmorphism px-3 py-2 rounded-full inline-flex items-center self-start">
              <User className="h-4 w-4 mr-2 text-web3-blue" />
              <span className="text-sm text-white/90">{formatAddress(address)}</span>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 hover:bg-red-500/10 hover:text-red-500 transition-colors" 
              onClick={handleDisconnect}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default DashboardNavbar;
