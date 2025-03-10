
import React from 'react';
import { ethers } from 'ethers';
import { useContractDebugger } from '@/hooks/useContractDebugger';
import { Button } from "@/components/ui/button";
import { Lightbulb } from 'lucide-react';

interface CreateChallengeHelperProps {
  stakeAmount: string;
  participants: string[];
  onDebugLog: (log: any) => void;
}

/**
 * A component to help debug contract interactions for the CreateChallenge component
 */
const CreateChallengeHelper: React.FC<CreateChallengeHelperProps> = ({
  stakeAmount,
  participants,
  onDebugLog
}) => {
  const { debugTransaction, isBusy, lastError, lastDebugLog } = useContractDebugger();

  const handleDebug = async () => {
    // Validate inputs
    if (!stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0) {
      onDebugLog({
        error: 'Invalid stake amount',
        details: 'Please enter a valid stake amount'
      });
      return;
    }
    
    if (!participants.length || !participants[0]) {
      onDebugLog({
        error: 'No participants',
        details: 'Please add at least one participant'
      });
      return;
    }
    
    // Filter valid participants
    const validParticipants = participants.filter(p => 
      p && ethers.isAddress(p)
    );
    
    if (validParticipants.length === 0) {
      onDebugLog({
        error: 'No valid participants',
        details: 'Please add at least one valid Ethereum address'
      });
      return;
    }
    
    // Setup parameters for createChallenge function
    const stakeInWei = ethers.parseEther(stakeAmount);
    const totalPlayers = validParticipants.length;
    
    // Create milestone timestamps
    const now = Math.floor(Date.now() / 1000);
    const milestoneTimestamps = [
      now + 86400, // 1 day from now
      now + 172800, // 2 days from now
      now + 259200, // 3 days from now
    ];

    // Debug the transaction
    const result = await debugTransaction(
      'createChallenge',
      [stakeInWei, totalPlayers, validParticipants, milestoneTimestamps],
      { value: stakeInWei }
    );
    
    onDebugLog(result);
  };

  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDebug}
        disabled={isBusy}
        className="text-amber-400 border-amber-400 hover:bg-amber-400/10"
      >
        <Lightbulb className="h-4 w-4 mr-1" />
        Debug Contract Interaction
      </Button>
      {lastError && (
        <div className="mt-2 text-xs text-amber-400">
          <p>Last error: {lastError}</p>
        </div>
      )}
    </div>
  );
};

export default CreateChallengeHelper;
