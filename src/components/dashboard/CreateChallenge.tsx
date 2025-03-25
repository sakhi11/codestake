
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

interface NewChallenge {
  player1: string;
  player2: string;
  stakeAmount: string;
  track: string;
}

interface CreateChallengeProps {
  onCreateChallenge: (challenge: NewChallenge) => Promise<void>;
  walletBalance: string;
}

const CreateChallenge: React.FC<CreateChallengeProps> = ({ onCreateChallenge, walletBalance }) => {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [track, setTrack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { address, isConnected, networkDetails } = useWeb3();

  // Set current wallet as player1 by default when connected
  useEffect(() => {
    if (address && !player1) {
      setPlayer1(address);
    }
  }, [address, player1]);

  const validateInputs = () => {
    const errors: Record<string, string> = {};
    
    // Validate addresses
    if (!ethers.isAddress(player1)) {
      errors.player1 = "Invalid ethereum address format";
    }
    
    if (!ethers.isAddress(player2)) {
      errors.player2 = "Invalid ethereum address format";
    }
    
    if (player1 && player2 && player1.toLowerCase() === player2.toLowerCase()) {
      errors.player2 = "Player 2 must be different from Player 1";
    }
    
    // Validate stake amount
    const stakeNum = parseFloat(stakeAmount);
    const balanceNum = parseFloat(walletBalance);
    
    if (isNaN(stakeNum) || stakeNum <= 0) {
      errors.stakeAmount = "Stake amount must be greater than 0";
    } else if (stakeNum > balanceNum) {
      errors.stakeAmount = `Insufficient funds (balance: ${walletBalance} ETH)`;
    }
    
    // Validate track
    if (!track.trim()) {
      errors.track = "Track cannot be empty";
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
        player1,
        player2,
        stakeAmount,
        track,
      };
      
      console.log("Creating challenge with details:", newChallenge);
      await onCreateChallenge(newChallenge);
      
      // Reset form after successful submission
      setPlayer2("");
      setStakeAmount("");
      setTrack("");
      
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
          Challenge your friend to complete coding tasks and stake ETH!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="player1" className="text-white">
              Player 1 Address (You)
            </Label>
            <Input
              type="text"
              id="player1"
              placeholder="0x..."
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className={`${inputClass} ${validationErrors.player1 ? errorClass : ""}`}
              disabled={isLoading}
            />
            {validationErrors.player1 && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.player1}
              </p>
            )}
            {player1 && ethers.isAddress(player1) && (
              <p className="text-white/60 text-sm mt-1">
                {shortenAddress(player1)}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="player2" className="text-white">
              Player 2 Address (Opponent)
            </Label>
            <Input
              type="text"
              id="player2"
              placeholder="0x..."
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className={`${inputClass} ${validationErrors.player2 ? errorClass : ""}`}
              disabled={isLoading}
            />
            {validationErrors.player2 && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.player2}
              </p>
            )}
            {player2 && ethers.isAddress(player2) && (
              <p className="text-white/60 text-sm mt-1">
                {shortenAddress(player2)}
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
            <Label htmlFor="track" className="text-white">
              Track
            </Label>
            <Input
              type="text"
              id="track"
              placeholder="e.g. Web Development"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className={`${inputClass} ${validationErrors.track ? errorClass : ""}`}
              disabled={isLoading}
            />
            {validationErrors.track && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.track}
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
