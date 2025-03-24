
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
} from "@/components/ui/Card"; 
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button"; 
import { useWeb3 } from "@/context/Web3Provider";
import { Loader2 } from "lucide-react";

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
  const { wallet } = useWeb3();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!player1 || !player2 || !stakeAmount || !track) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (player1 === player2) {
      toast.error("Player 1 and Player 2 cannot be the same address.");
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
      await onCreateChallenge(newChallenge);
      setPlayer1("");
      setPlayer2("");
      setStakeAmount("");
      setTrack("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glassmorphism border border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Create Challenge</CardTitle>
        <CardDescription className="text-white/60">
          Challenge your friend!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="player1" className="text-white">
              Player 1 Address
            </Label>
            <Input
              type="text"
              id="player1"
              placeholder="0x..."
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label htmlFor="player2" className="text-white">
              Player 2 Address
            </Label>
            <Input
              type="text"
              id="player2"
              placeholder="0x..."
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
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
              className="bg-white/5 border-white/10 text-white"
            />
            {wallet && (
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
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            variant="gradient"
            disabled={isLoading}
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
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateChallenge;
