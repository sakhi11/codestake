
import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { LogOut, Menu, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface DashboardNavbarProps {
  address: string;
}

const DashboardNavbar = ({ address }: DashboardNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Format wallet address for display (0x71C7...976F)
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4",
        isScrolled ? "glassmorphism bg-web3-background/80" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold text-gradient">
            Code<span className="text-web3-blue">Stake</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-white hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/challenges" className="text-white/80 hover:text-white transition-colors">
              My Challenges
            </Link>
            <Link to="/rewards" className="text-white/80 hover:text-white transition-colors">
              Rewards
            </Link>
            
            <div className="flex items-center ml-4">
              <div className="flex items-center mr-4 glassmorphism px-3 py-1.5 rounded-full">
                <User className="h-4 w-4 mr-2 text-web3-blue" />
                <span className="text-sm text-white/90">{formatAddress(address)}</span>
              </div>
              
              <Button variant="outline" size="sm" onClick={() => console.log("Disconnect wallet")}>
                <LogOut className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </div>
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
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
              to="/challenges"
              className="py-3 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Challenges
            </Link>
            <Link
              to="/rewards"
              className="py-3 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rewards
            </Link>
            
            <div className="mt-3 glassmorphism px-3 py-2 rounded-full inline-flex items-center self-start">
              <User className="h-4 w-4 mr-2 text-web3-blue" />
              <span className="text-sm text-white/90">{formatAddress(address)}</span>
            </div>
            
            <Button variant="outline" size="sm" className="mt-4" onClick={() => console.log("Disconnect wallet")}>
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
