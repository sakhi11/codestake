
import React from "react";
import { Github, Twitter, MessageSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-web3-background relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gradient">
              Code<span className="text-web3-blue">Stake</span>
            </h2>
            <p className="text-white/70 text-sm max-w-xs">
              A DeFi-based coding challenge platform where developers can compete, learn, and earn rewards.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="#" 
                className="text-white/70 hover:text-web3-blue transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-web3-blue transition-colors"
                aria-label="Discord"
              >
                <MessageSquare size={20} />
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-web3-blue transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>
          
          {/* Links Column 1 */}
          <div>
            <h3 className="font-medium text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          
          {/* Links Column 2 */}
          <div>
            <h3 className="font-medium text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Challenges
                </a>
              </li>
            </ul>
          </div>
          
          {/* Links Column 3 */}
          <div>
            <h3 className="font-medium text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} CodeStake. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-white/50 text-sm">
              Powered by Web3 Technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
