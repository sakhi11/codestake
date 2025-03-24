
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Award, Shield, TrendingUp } from "lucide-react";

const features = [
  {
    title: "Stake Your Skills",
    description:
      "Put your coding skills to the test by staking crypto in challenges. Prove your expertise and earn rewards upon successful completion.",
    icon: <Coins className="h-8 w-8 text-web3-blue" />,
  },
  {
    title: "Fair Competition",
    description:
      "Our blockchain-based scoring ensures transparent and tamper-proof evaluation of your coding challenges and quizzes.",
    icon: <Award className="h-8 w-8 text-web3-orange" />,
  },
  {
    title: "Secure Rewards",
    description:
      "All stakes and rewards are secured by smart contracts, ensuring automatic and trustless distribution based on performance.",
    icon: <Shield className="h-8 w-8 text-web3-success" />,
  },
  {
    title: "Learn & Earn",
    description:
      "Improve your coding skills while earning crypto rewards. Track your progress and measure growth with on-chain achievements.",
    icon: <TrendingUp className="h-8 w-8 text-web3-blue" />,
  },
];

const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);

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

    const currentSection = sectionRef.current;
    if (currentSection) {
      const elements = currentSection.querySelectorAll(".animate-on-scroll");
      elements.forEach((el) => {
        observer.observe(el);
      });
    }

    return () => {
      if (currentSection) {
        const elements = currentSection.querySelectorAll(".animate-on-scroll");
        elements.forEach((el) => {
          observer.unobserve(el);
        });
      }
    };
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-24 md:py-32 bg-web3-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-web3-background/0 via-web3-blue/5 to-web3-background/0"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
            Features that Revolutionize Coding
          </h2>
          <p className="text-white/70 max-w-3xl mx-auto">
            CodeStake combines the power of Web3 with coding education to create
            a unique learning experience that rewards your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="animate-on-scroll"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="h-full">
                <CardHeader className="pb-2">
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70">
                    {feature.description}
                  </p>
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
