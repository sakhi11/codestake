
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Wallet, ChevronRight } from "lucide-react";
import { Scene3D } from "../3d/Scene3D";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <Scene3D />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white animate-fade-in">
            Level Up Your <span className="text-gradient">Learning Journey</span><br/> 
            With <span className="text-web3-blue">Smart Contracts</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-10 leading-relaxed animate-fade-in">
            Complete challenges, stake EDU tokens, and earn rewards while mastering Web3 technologies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button 
              variant="gradient" 
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Wallet className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              <span className="relative z-10">Start Learning</span>
            </Button>
            
            <Button
              variant="glass"
              size="lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="backdrop-blur-sm"
            >
              Learn More
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="mt-16 glassmorphism border border-white/20 rounded-xl p-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-3xl font-bold text-gradient mb-2">1000+ EDU</h3>
              <p className="text-white/70">Total Rewards</p>
            </div>
            
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-3xl font-bold text-gradient mb-2">150+</h3>
              <p className="text-white/70">Active Learners</p>
            </div>
            
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-3xl font-bold text-gradient mb-2">5</h3>
              <p className="text-white/70">Learning Tracks</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
