
import React, { useEffect, useState } from "react";
// Fix import casing to match actual file
import { Button } from "@/components/ui/button";
import { Wallet, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeb3 } from "@/context/Web3Provider";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, connectWallet, isConnected } = useWeb3();
  
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
          <a href="/" className="text-xl font-semibold text-gradient">
            Code<span className="text-web3-blue">Stake</span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </a>
            <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#faqs" className="text-white/80 hover:text-white transition-colors">
              FAQs
            </a>
            <Button variant="default" size="default" className="bg-blue-500 hover:bg-blue-600 ml-4" onClick={connectWallet}>
              <Wallet className="mr-2 h-4 w-4" />
              {address ? 'Connected' : 'Connect Wallet'}
            </Button>
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
            <a
              href="/"
              className="py-3 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              className="py-3 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#features"
              className="py-3 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#faqs"
              className="py-3 text-white/80 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQs
            </a>
            <Button variant="default" size="default" className="bg-blue-500 hover:bg-blue-600 mt-4" onClick={connectWallet}>
              <Wallet className="mr-2 h-4 w-4" />
              {address ? 'Connected' : 'Connect Wallet'}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
