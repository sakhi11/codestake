
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "@/context/Web3Provider";
import { Code, Sparkles } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const { connectWallet, isConnected } = useWeb3();
  const [, forceUpdate] = useState({});

  // Animation states
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Force update after wallet connection
    if (isConnected) {
      forceUpdate({});
    }
  }, [isConnected]);

  const handleCreateChallenge = () => {
    if (isConnected) {
      navigate("/dashboard");
    } else {
      connectWallet();
    }
  };

  const handleExplore = () => {
    navigate("/dashboard");
  };

  return (
    <section className="min-h-screen pt-32 pb-20 flex items-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-web3-blue/10 via-transparent to-transparent" />
      <div className="absolute w-96 h-96 -top-48 -left-48 bg-web3-blue/10 rounded-full filter blur-3xl" />
      <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-web3-orange/10 rounded-full filter blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Tag line */}
          <div 
            className={`inline-block mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-1000 ${
              isVisible ? "opacity-100 transform-none" : "opacity-0 -translate-y-4"
            }`}
          >
            <span className="text-sm text-white/80 flex items-center justify-center">
              <Code className="w-4 h-4 mr-2 text-web3-blue" />
              Web3-powered DeFi Learning Platform
              <Sparkles className="w-4 h-4 ml-2 text-web3-orange" />
            </span>
          </div>
          
          {/* Main heading */}
          <h1 
            className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 transform-none" : "opacity-0 -translate-y-4"
            }`}
          >
            <span className="text-white block">Stake. Code. Win.</span>
            <span className="text-gradient-blue-orange block">The Future of Competitive Learning.</span>
          </h1>
          
          {/* Description */}
          <p 
            className={`text-white/70 text-lg md:text-xl max-w-3xl mx-auto mb-10 transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100 transform-none" : "opacity-0 -translate-y-4"
            }`}
          >
            Compete in coding challenges, stake crypto, and earn rewards by completing 
            milestone-based quizzes. Secure, fair, and rewarding.
          </p>
          
          {/* Action buttons */}
          <div 
            className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-1000 delay-700 ${
              isVisible ? "opacity-100 transform-none" : "opacity-0 -translate-y-4"
            }`}
          >
            <Button 
              onClick={handleCreateChallenge}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium"
            >
              Create a Challenge
            </Button>
            <Button 
              onClick={handleExplore}
              size="lg" 
              variant="outline" 
              className="border border-white/20 text-white hover:bg-white/10"
            >
              Explore Challenges
            </Button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-white/50 text-sm mb-2">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
