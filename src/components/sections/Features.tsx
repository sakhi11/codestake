
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Coins, Award, Shield, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <Coins className="h-8 w-8 text-web3-orange mb-4" />,
    title: "Crypto-Based Competition",
    description: "Stake your crypto and earn rewards based on your performance. The higher your rank, the bigger your rewards.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-web3-blue mb-4" />,
    title: "Preset Milestone Quizzes",
    description: "Learn through structured, gamified milestones. Each quiz unlocks on a preset date, keeping competition fair.",
  },
  {
    icon: <Shield className="h-8 w-8 text-web3-success mb-4" />,
    title: "Secure Smart Contracts",
    description: "Your staked funds are locked safely in transparent smart contracts until the challenge is completed.",
  },
  {
    icon: <Award className="h-8 w-8 text-web3-orange mb-4" />,
    title: "Live Leaderboard & Rewards",
    description: "Track your progress on our live leaderboard. Winners receive rewards automatically upon challenge completion.",
  },
];

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      cardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className="py-20 bg-web3-background relative overflow-hidden animate-on-scroll"
    >
      {/* Decorative grid background */}
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Key Features
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Our platform combines the best of Web3 technology with a gamified learning experience to create a unique and rewarding coding challenge platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className="animate-on-scroll"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card variant="glass" className="h-full">
                <CardHeader className="pb-2">
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
