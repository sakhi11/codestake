
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"; 
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { useWeb3 } from "@/context/Web3Provider";
import { Loader2, AlertCircle } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface NewChallenge {
  name: string;
  description: string;
  stakeAmount: string;
  participantCount: number;
}

interface CreateChallengeProps {
  onCreateChallenge: (challenge: NewChallenge) => Promise<void>;
  walletBalance: string;
}

const CreateChallenge: React.FC<CreateChallengeProps> = ({ onCreateChallenge, walletBalance }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [participantCount, setParticipantCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { address, isConnected, networkDetails } = useWeb3();

  const validateInputs = () => {
    const errors: Record<string, string> = {};
    
    // Validate name
    if (!name.trim()) {
      errors.name = "Challenge name cannot be empty";
    }
    
    // Validate description
    if (!description.trim()) {
      errors.description = "Challenge description cannot be empty";
    }
    
    // Validate stake amount
    const stakeNum = parseFloat(stakeAmount);
    const balanceNum = parseFloat(walletBalance);
    
    if (isNaN(stakeNum) || stakeNum <= 0) {
      errors.stakeAmount = "Stake amount must be greater than 0";
    } else if (stakeNum > balanceNum) {
      errors.stakeAmount = `Insufficient funds (balance: ${walletBalance} ETH)`;
    }
    
    // Validate participant count
    if (participantCount < 2) {
      errors.participantCount = "Must have at least 2 participants";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Stop if not connected
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    // Stop if on incorrect network
    if (!networkDetails.isCorrectNetwork) {
      toast.error(`Please switch to the ${networkDetails.name} network`);
      return;
    }
    
    // Validate all inputs
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    try {
      const newChallenge = {
        name,
        description,
        stakeAmount,
        participantCount
      };
      
      console.log("Creating challenge with details:", newChallenge);
      await onCreateChallenge(newChallenge);
      
      // Reset form after successful submission
      setName("");
      setDescription("");
      setStakeAmount("");
      setParticipantCount(2);
      
      // Show success message
      toast.success("Challenge created successfully!");
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      toast.error(error.message || "Failed to create challenge");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "bg-white/5 border-white/10 text-white";
  const errorClass = "border-red-500";

  return (
    <Card className="glassmorphism border border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Create Challenge</CardTitle>
        <CardDescription className="text-white/60">
          Create a new coding challenge and stake ETH!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">
              Challenge Name
            </Label>
            <Input
              type="text"
              id="name"
              placeholder="e.g. Web3 Development Challenge"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} ${validationErrors.name ? errorClass : ""}`}
              disabled={isLoading}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.name}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the challenge..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} ${validationErrors.description ? errorClass : ""} min-h-[100px]`}
              disabled={isLoading}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.description}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="stakeAmount" className="text-white">
              Stake Amount (ETH)
            </Label>
            <Input
              type="number"
              id="stakeAmount"
              placeholder="0.0"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className={`${inputClass} ${validationErrors.stakeAmount ? errorClass : ""}`}
              disabled={isLoading}
              step="0.001"
              min="0"
            />
            {validationErrors.stakeAmount && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.stakeAmount}
              </p>
            )}
            {address && (
              <p className="text-white/60 text-sm mt-1">
                Wallet Balance: {walletBalance} ETH
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="participantCount" className="text-white">
              Number of Participants
            </Label>
            <Input
              type="number"
              id="participantCount"
              placeholder="2"
              value={participantCount}
              onChange={(e) => setParticipantCount(parseInt(e.target.value))}
              className={`${inputClass} ${validationErrors.participantCount ? errorClass : ""}`}
              disabled={isLoading}
              min="2"
            />
            {validationErrors.participantCount && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.participantCount}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            variant="gradient"
            disabled={isLoading || !isConnected}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Challenge"
            )}
          </Button>
          
          {!isConnected && (
            <p className="text-amber-400 text-sm text-center mt-2">
              Please connect your wallet to create a challenge
            </p>
          )}
          
          {isConnected && !networkDetails.isCorrectNetwork && (
            <p className="text-amber-400 text-sm text-center mt-2">
              Please switch to the correct network to create a challenge
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateChallenge;
