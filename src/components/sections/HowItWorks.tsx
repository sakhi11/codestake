
import React, { useEffect, useRef } from "react";
import { Wallet, Users, CheckSquare, Trophy } from "lucide-react";

const steps = [
  {
    icon: <Wallet className="h-8 w-8 text-web3-blue" />,
    title: "Connect Your Wallet",
    description: "Connect your crypto wallet securely to our platform to get started.",
  },
  {
    icon: <Users className="h-8 w-8 text-web3-blue" />,
    title: "Create or Join a Challenge",
    description: "Set up your own challenge or join an existing one. Stake your crypto to participate.",
  },
  {
    icon: <CheckSquare className="h-8 w-8 text-web3-blue" />,
    title: "Complete Milestone Quizzes",
    description: "Tackle quizzes that unlock on preset dates. Learn, solve, and progress through milestones.",
  },
  {
    icon: <Trophy className="h-8 w-8 text-web3-orange" />,
    title: "Win Rewards",
    description: "The fastest participant per milestone earns a share of the staked amount. Automatically distributed via smart contracts.",
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

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

    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      stepsRef.current.forEach((step) => {
        if (step) observer.unobserve(step);
      });
    };
  }, []);

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-web3-background to-web3-card relative overflow-hidden animate-on-scroll"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            How It Works
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Our platform makes it easy to participate in coding challenges. Follow these simple steps to get started.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto relative">
          {/* Connecting line */}
          <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-0.5 bg-gradient-to-b from-web3-blue to-web3-orange h-[calc(100%-40px)] mt-8 transform md:-translate-x-1/2 z-0"></div>
          
          <div className="space-y-12 md:space-y-0 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index}
                ref={(el) => (stepsRef.current[index] = el)}
                className="flex flex-col md:flex-row items-start md:items-center gap-4 animate-on-scroll"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`
                  flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center glassmorphism 
                  ${index === steps.length - 1 ? 'bg-web3-orange/10' : 'bg-web3-blue/10'} z-10
                `}>
                  {step.icon}
                </div>
                
                <div className={`md:w-1/2 md:text-right md:pr-8 ${index % 2 === 0 ? 'md:order-first' : ''}`}>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
                
                {index % 2 === 0 && <div className="hidden md:block md:w-1/2"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-web3-background/20 to-transparent"></div>
    </section>
  );
};

export default HowItWorks;
