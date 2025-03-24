
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Provider';
import { EDU_CHAIN_CONFIG } from '@/lib/utils';

interface DebuggerState {
  isDebugging: boolean;
  logs: string[];
}

export const useContractDebugger = () => {
  const { provider, signer, address, isConnected } = useWeb3();
  const [debugState, setDebugState] = useState<DebuggerState>({
    isDebugging: false,
    logs: [],
  });

  const addLog = useCallback((message: string) => {
    setDebugState(prev => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toISOString()} - ${message}`]
    }));
  }, []);

  // Effect to check for debugging flag
  useEffect(() => {
    const isDebuggingEnabled = localStorage.getItem('codestake_debug_mode') === 'true';
    setDebugState(prev => ({
      ...prev,
      isDebugging: isDebuggingEnabled
    }));
  }, []);

  // Initialize contract with proper handling for Promise<Signer>
  const initializeContract = useCallback(async (
    contractAddress: string, 
    contractAbi: ethers.InterfaceAbi
  ) => {
    if (!provider || !signer) {
      addLog('Provider or signer not available');
      return null;
    }

    try {
      // Create contract with signer, not the Promise
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      addLog('Contract initialized successfully');
      return contract;
    } catch (error) {
      addLog(`Error initializing contract: ${error}`);
      return null;
    }
  }, [provider, signer, addLog]);

  // Check network compatibility
  const checkNetwork = useCallback(async () => {
    if (!provider) {
      addLog('Provider not available');
      return false;
    }

    try {
      const network = await provider.getNetwork();
      const eduChainId = BigInt(parseInt(EDU_CHAIN_CONFIG.chainId, 16));
      const isCorrectNetwork = network.chainId === eduChainId;
      
      addLog(`Network check: Chain ID ${network.chainId.toString()}, eduChain ID ${eduChainId.toString()}`);
      addLog(`On correct network: ${isCorrectNetwork ? 'Yes' : 'No'}`);
      
      return isCorrectNetwork;
    } catch (error) {
      addLog(`Network check error: ${error}`);
      return false;
    }
  }, [provider, addLog]);

  return {
    ...debugState,
    addLog,
    initializeContract,
    checkNetwork,
  };
};

export default useContractDebugger;
