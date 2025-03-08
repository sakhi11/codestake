
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowRight, PlusCircle } from "lucide-react";

const CtaSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 relative overflow-hidden animate-on-scroll"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-web3-background via-web3-card to-web3-background opacity-50"></div>
      
      {/* Glassmorphism container */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto glassmorphism rounded-2xl p-8 md:p-12 border border-white/10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
              Ready to Challenge Yourself?
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Join our community of developers, stake your crypto, and start earning rewards while improving your coding skills.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="gradient" 
                size="xl"
                className="animate-glow"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create a Challenge
              </Button>
              
              <Button 
                variant="glass" 
                size="xl"
              >
                Join an Ongoing Challenge
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-web3-background to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-web3-background to-transparent"></div>
    </section>
  );
};

export default CtaSection;
