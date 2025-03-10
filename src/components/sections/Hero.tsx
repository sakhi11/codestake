
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Wallet, ChevronRight } from "lucide-react";
import AnimatedBackground from "../animations/AnimatedBackground";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Level Up Your <span className="text-gradient">Coding Skills</span> With 
            <span className="text-web3-blue"> Incentives</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-10 leading-relaxed">
            Complete programming challenges, stake crypto, and earn rewards while mastering new technologies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="gradient" 
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="group"
            >
              <Wallet className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Get Started
            </Button>
            
            <Button
              variant="glass"
              size="lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="mt-16 glassmorphism border border-white/20 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gradient mb-2">$25k+</h3>
              <p className="text-white/70">Staked in Challenges</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gradient mb-2">150+</h3>
              <p className="text-white/70">Active Users</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gradient mb-2">5</h3>
              <p className="text-white/70">Technology Tracks</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
