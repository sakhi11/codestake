import React, { useState, useEffect } from 'react';
import { initializeFlow } from '../flow-config';
import { FlowService } from '../services/flowService';

const FlowContractExample: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize Flow client
  useEffect(() => {
    initializeFlow('testnet');
  }, []);

  // Check connection status
  const checkConnection = async () => {
    try {
      const userResult = await FlowService.getCurrentUser();
      if (userResult.success) {
        setIsConnected(true);
        setUserAddress(userResult.data.address);
        await loadUserData();
      } else {
        setIsConnected(false);
        setUserAddress('');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    }
  };

  // Load user data
  const loadUserData = async () => {
    if (!userAddress) return;
    
    try {
      setLoading(true);
      
      // Get wallet summary
      const walletResult = await FlowService.getWalletSummary(userAddress);
      if (walletResult.success) {
        setBalance(walletResult.data.balance);
      }
      
      // Get user transactions
      const transactionsResult = await FlowService.getUserTransactions(userAddress);
      if (transactionsResult.success) {
        // Group transactions by challenge
        const challengeMap = new Map();
        transactionsResult.data.forEach((tx: any) => {
          if (tx.challenge && !challengeMap.has(tx.challenge)) {
            challengeMap.set(tx.challenge, {
              name: tx.challenge,
              transactions: []
            });
          }
          if (tx.challenge) {
            challengeMap.get(tx.challenge).transactions.push(tx);
          }
        });
        setChallenges(Array.from(challengeMap.values()));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Create a new challenge
  const createChallenge = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await FlowService.createChallenge(
        "Sample Challenge",
        "Web3 Development",
        86400, // 1 day
        [userAddress],
        ["Milestone 1", "Milestone 2"],
        [100, 200],
        50
      );
      
      if (result.success) {
        alert(`Challenge created! Transaction ID: ${result.transactionId}`);
        await loadUserData(); // Refresh data
      } else {
        setError(result.error || 'Failed to create challenge');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError('Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  // Join a challenge
  const joinChallenge = async (challengeId: number) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await FlowService.joinChallenge(challengeId, 25);
      
      if (result.success) {
        alert(`Joined challenge! Transaction ID: ${result.transactionId}`);
        await loadUserData(); // Refresh data
      } else {
        setError(result.error || 'Failed to join challenge');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      setError('Failed to join challenge');
    } finally {
      setLoading(false);
    }
  };

  // Complete a milestone
  const completeMilestone = async (challengeId: number, milestoneIndex: number) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await FlowService.completeMilestone(challengeId, milestoneIndex);
      
      if (result.success) {
        alert(`Milestone completed! Transaction ID: ${result.transactionId}`);
        await loadUserData(); // Refresh data
      } else {
        setError(result.error || 'Failed to complete milestone');
      }
    } catch (error) {
      console.error('Error completing milestone:', error);
      setError('Failed to complete milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">CodeStake Flow Contract</h1>
      
      {/* Connection Status */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={checkConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Connection
          </button>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {userAddress && (
            <span className="text-sm text-gray-600">
              Address: {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* User Actions */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Wallet Info</h3>
            <p className="text-gray-600">Balance: {balance} FLOW</p>
            <button
              onClick={loadUserData}
              disabled={loading}
              className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <button
              onClick={createChallenge}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Create Challenge
            </button>
          </div>
        </div>
      )}

      {/* Challenges List */}
      {isConnected && challenges.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Your Challenges</h3>
          <div className="space-y-3">
            {challenges.map((challenge, index) => (
              <div key={index} className="border rounded p-3">
                <h4 className="font-medium">{challenge.name}</h4>
                <div className="text-sm text-gray-600 mt-1">
                  Transactions: {challenge.transactions.length}
                </div>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => joinChallenge(index)}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => completeMilestone(index, 0)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    Complete Milestone
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Processing...</p>
        </div>
      )}

      {/* Instructions */}
      {!isConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Get Started</h3>
          <p className="text-blue-700 mb-4">
            Connect your Flow wallet to start using the CodeStake contract.
          </p>
          <div className="text-sm text-blue-600">
            <p>1. Install a Flow wallet (Blocto, Lilico, etc.)</p>
            <p>2. Get some testnet FLOW tokens</p>
            <p>3. Connect your wallet to this dApp</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowContractExample;
