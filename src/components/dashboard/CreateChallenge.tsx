
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { toast } from "sonner";

interface CreateChallengeProps {
  onCreateChallenge: (challenge: any) => void;
}

const codingTracks = [
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
  { value: "Solidity", label: "Solidity" },
  { value: "React", label: "React" },
  { value: "Web3", label: "Web3 Development" }
];

const CreateChallenge = ({ onCreateChallenge }: CreateChallengeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    stakeAmount: "",
    totalPlayers: "2",
    participants: [""],
    track: "JavaScript"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddParticipant = () => {
    if (formData.participants.length < (parseInt(formData.totalPlayers) - 1)) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, ""]
      }));
    } else {
      toast.error(`Maximum ${formData.totalPlayers} participants allowed (including you)`);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const handleParticipantChange = (index: number, value: string) => {
    const updatedParticipants = [...formData.participants];
    updatedParticipants[index] = value;
    setFormData(prev => ({
      ...prev,
      participants: updatedParticipants
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.stakeAmount || parseFloat(formData.stakeAmount) <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }
    
    // Validate wallet addresses (simplified validation for demo)
    const invalidAddresses = formData.participants.filter(addr => !addr.startsWith("0x") || addr.length !== 42);
    if (invalidAddresses.length > 0) {
      toast.error("Please enter valid wallet addresses for all participants");
      return;
    }
    
    onCreateChallenge(formData);
    
    // Reset form
    setFormData({
      stakeAmount: "",
      totalPlayers: "2",
      participants: [""],
      track: "JavaScript"
    });
    
    setIsExpanded(false);
  };

  return (
    <section className="mb-12" id="create-challenge">
      <div className="glassmorphism border border-white/10 rounded-xl p-6 md:p-8 relative overflow-hidden">
        {/* Background pseudo-element with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-web3-blue/5 via-transparent to-web3-orange/5 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gradient">Create a New Challenge</h2>
          
          <p className="text-white/70 mb-6">
            Set up a new challenge, invite participants, and start earning rewards by completing milestones!
          </p>
          
          {!isExpanded ? (
            <Button 
              variant="gradient" 
              size="lg"
              className="group overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_25px_rgba(248,161,0,0.3)]"
              style={{
                background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)",
              }}
              onClick={() => setIsExpanded(true)}
            >
              <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create a New Challenge
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white mb-2 font-medium">Stake Amount (ETH)</label>
                  <input
                    type="number"
                    name="stakeAmount"
                    value={formData.stakeAmount}
                    onChange={handleChange}
                    placeholder="0.1"
                    step="0.01"
                    min="0.01"
                    className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white"
                    required
                  />
                  <p className="text-white/50 text-xs mt-1">Minimum amount each participant will stake</p>
                </div>
                
                <div>
                  <label className="block text-white mb-2 font-medium">Total Players</label>
                  <select
                    name="totalPlayers"
                    value={formData.totalPlayers}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white"
                  >
                    <option value="2">2 Players</option>
                    <option value="3">3 Players</option>
                    <option value="4">4 Players</option>
                    <option value="5">5 Players</option>
                  </select>
                  <p className="text-white/50 text-xs mt-1">Including yourself</p>
                </div>
                
                <div>
                  <label className="block text-white mb-2 font-medium">Coding Track</label>
                  <select
                    name="track"
                    value={formData.track}
                    onChange={handleChange}
                    className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white"
                  >
                    {codingTracks.map(track => (
                      <option key={track.value} value={track.value}>{track.label}</option>
                    ))}
                  </select>
                  <p className="text-white/50 text-xs mt-1">Determines milestones and quizzes</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-white mb-2 font-medium">Participant Wallet Addresses</label>
                  <p className="text-white/50 text-xs mb-2">Enter the wallet addresses of other participants</p>
                  
                  {formData.participants.map((participant, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={participant}
                        onChange={(e) => handleParticipantChange(index, e.target.value)}
                        placeholder="0x..."
                        className="flex-1 bg-black/30 border border-white/20 rounded-lg p-3 text-white"
                      />
                      {formData.participants.length > 1 && (
                        <button
                          type="button"
                          className="ml-2 text-white/60 hover:text-white p-1"
                          onClick={() => handleRemoveParticipant(index)}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {formData.participants.length < (parseInt(formData.totalPlayers) - 1) && (
                    <button
                      type="button"
                      className="flex items-center text-web3-blue hover:text-web3-blue/80 mt-2"
                      onClick={handleAddParticipant}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Another Participant
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  type="submit" 
                  variant="gradient" 
                  size="lg"
                  className="group overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[0_0_25px_rgba(248,161,0,0.3)]"
                  style={{
                    background: "linear-gradient(135deg, #4A90E2 0%, #F8A100 100%)",
                  }}
                >
                  <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  Create Challenge
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default CreateChallenge;
