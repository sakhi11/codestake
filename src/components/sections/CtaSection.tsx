
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Code, Award, ArrowRight } from "lucide-react";

const CtaSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-web3-blue/20 to-web3-orange/20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glassmorphism border border-white/20 rounded-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                Ready to Test Your Skills & Earn Rewards?
              </h2>
              
              <p className="text-white/80 text-lg mb-8">
                Join thousands of developers who are improving their programming skills, completing challenges, and earning crypto rewards.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-web3-blue/20 p-2 rounded-full mr-4">
                    <Code className="h-5 w-5 text-web3-blue" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Pick Your Track</h3>
                    <p className="text-white/70">JavaScript, Python, Solidity, React, or Web3 Development</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-web3-orange/20 p-2 rounded-full mr-4">
                    <Award className="h-5 w-5 text-web3-orange" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Stake & Earn</h3>
                    <p className="text-white/70">Stake crypto, complete milestones, and win rewards</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Get Started Today</h3>
              
              <p className="text-white/70 mb-8">
                Create an account, connect your wallet, and start your first challenge in just a few minutes.
              </p>
              
              <div className="space-y-4">
                <Button 
                  variant="gradient" 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  Join CodeStake Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full border-white/20"
                  onClick={() => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
