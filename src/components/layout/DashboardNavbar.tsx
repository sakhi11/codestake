
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Menu, X, Wallet, ChevronDown, LogOut } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useWeb3 } from "@/context/Web3Provider";

export interface DashboardNavbarProps {
  address: string | null;
  setAddress?: (address: string | null) => void;
  balance?: number;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ address, setAddress, balance }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { connectWallet, disconnectWallet } = useWeb3();

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    if (setAddress) {
      setAddress(null);
    }
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 glassmorphism bg-web3-background/80 py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold text-gradient">
            Code<span className="text-web3-blue">Stake</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-white/80 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/balance"
              className="text-white/80 hover:text-white transition-colors"
            >
              Balance
              {balance !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-web3-blue/20 text-web3-blue">
                  {balance.toFixed(2)} ETH
                </span>
              )}
            </Link>
          </nav>

          {/* Wallet Section - Desktop */}
          <div className="hidden md:flex items-center">
            {address ? (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Wallet className="mr-2 h-4 w-4 text-web3-blue" />
                  {shortenAddress(address)}
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg glassmorphism bg-web3-background/95 backdrop-blur-sm overflow-hidden z-20">
                    <div className="py-1">
                      <button
                        onClick={handleDisconnect}
                        className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-white/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={handleConnect}
                className="animate-pulse"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>

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
              className="py-3 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/balance"
              className="py-3 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Balance
              {balance !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-web3-blue/20 text-web3-blue">
                  {balance.toFixed(2)} ETH
                </span>
              )}
            </Link>
            
            {/* Wallet Section - Mobile */}
            {address ? (
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Wallet className="mr-2 h-4 w-4 text-web3-blue" />
                    <span className="text-white/80">{shortenAddress(address)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handleDisconnect}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                onClick={handleConnect}
                className="mt-4 w-full"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default DashboardNavbar;
