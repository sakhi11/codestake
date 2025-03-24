
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useContractDebugger } from "@/hooks/useContractDebugger";

interface Props {
  player1: string;
  player2: string;
  stakeAmount: string;
  track: string;
  setPlayer1: (player1: string) => void;
  setPlayer2: (player2: string) => void;
  setStakeAmount: (stakeAmount: string) => void;
  setTrack: (track: string) => void;
  onCreateChallenge: (challengeDetails: {
    player1: string;
    player2: string;
    stakeAmount: string;
    track: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  walletBalance: string;  // Add wallet balance prop
}

const CreateChallengeHelper: React.FC<Props> = ({
  player1,
  player2,
  stakeAmount,
  track,
  setPlayer1,
  setPlayer2,
  setStakeAmount,
  setTrack,
  onCreateChallenge,
  isSubmitting,
  walletBalance,
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateChallenge({ player1, player2, stakeAmount, track });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="player1">Player 1 Address</Label>
        <Input
          type="text"
          id="player1"
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          placeholder="0x..."
          required
        />
      </div>
      <div>
        <Label htmlFor="player2">Player 2 Address</Label>
        <Input
          type="text"
          id="player2"
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          placeholder="0x..."
          required
        />
      </div>
      <div>
        <Label htmlFor="stakeAmount">Stake Amount (ETH)</Label>
        <Input
          type="number"
          id="stakeAmount"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="0.1"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Wallet Balance: {walletBalance} ETH</p>
      </div>
      <div>
        <Label htmlFor="track">Track</Label>
        <Input
          type="text"
          id="track"
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          placeholder="e.g., Web Development"
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting} variant="gradient" className="w-full">
        {isSubmitting ? "Creating Challenge..." : "Create Challenge"}
      </Button>
      <DebugInfo />
    </form>
  );
};

export const DebugInfo = () => {
  const { isDebugging, logs } = useContractDebugger();
  
  if (!isDebugging) return null;
  
  return (
    <div className="mt-4 p-3 border border-orange-400 bg-orange-100/10 rounded-md">
      <h3 className="font-medium text-orange-500">Debug Information</h3>
      {logs.length > 0 && (
        <div className="text-sm text-orange-400">
          <p>Last log: {logs[logs.length - 1]}</p>
        </div>
      )}
    </div>
  );
};

export default CreateChallengeHelper;
