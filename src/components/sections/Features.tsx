import React from "react";
// Fix import casing to match actual file
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureItem {
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    title: "Stake EDU Tokens",
    description:
      "Stake your EDU tokens to participate in challenges and earn rewards.",
  },
  {
    title: "Compete in Challenges",
    description:
      "Join programming challenges and compete with other developers to showcase your skills.",
  },
  {
    title: "Earn Rewards",
    description:
      "Complete milestones and win challenges to earn EDU tokens and recognition.",
  },
  {
    title: "Learn and Grow",
    description:
      "Improve your programming skills and learn new technologies through challenges and collaboration.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-12 bg-web3-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gradient mb-8">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="glassmorphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
