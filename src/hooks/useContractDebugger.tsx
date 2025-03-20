
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Provider';
import { toast } from 'sonner';
import { EDU_CHAIN_CONFIG } from '@/lib/utils';

/**
 * A hook for debugging contract interactions
 */
export function useContractDebugger() {
  const { wallet, contract, getCurrentChainId, switchToEduChain } = useWeb3();
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastDebugLog, setLastDebugLog] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{
    chainId: string | null;
    isCorrectNetwork: boolean;
    networkName: string;
  }>({
    chainId: null,
    isCorrectNetwork: false,
    networkName: 'Unknown',
  });

  // Check network on mount and when wallet changes
  useEffect(() => {
    const checkNetwork = async () => {
      if (wallet) {
        const chainId = await getCurrentChainId();
        const isCorrectNetwork = chainId === EDU_CHAIN_CONFIG.chainId;
        
        setNetworkStatus({
          chainId,
          isCorrectNetwork,
          networkName: isCorrectNetwork ? 'eduChain Testnet' : `Unknown Network (${chainId})`
        });
      }
    };
    
    checkNetwork();
  }, [wallet, getCurrentChainId]);

  // Debug a transaction
  const debugTransaction = async (
    fn: () => Promise<any>,
    description: string
  ) => {
    setIsBusy(true);
    setLastError(null);
    setLastDebugLog(`Starting: ${description}...`);
    
    try {
      const result = await fn();
      setLastDebugLog(`Success: ${description}`);
      return { success: true, result };
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setLastError(errorMessage);
      setLastDebugLog(`Failed: ${description} - ${errorMessage}`);
      return { success: false, error };
    } finally {
      setIsBusy(false);
    }
  };

  // Helper to validate and debug contract calls
  const debugContractCall = async (
    methodName: string,
    args: any[],
    options = {}
  ) => {
    console.log(`[CONTRACT DEBUG] Calling ${methodName} with args:`, args);
    console.log(`[CONTRACT DEBUG] Options:`, options);
    
    if (!contract) {
      console.error('[CONTRACT DEBUG] No contract instance available');
      return { success: false, error: 'No contract instance available' };
    }
    
    if (!networkStatus.isCorrectNetwork) {
      console.error(`[CONTRACT DEBUG] Wrong network. Expected ${EDU_CHAIN_CONFIG.chainId}, got ${networkStatus.chainId}`);
      return { 
        success: false, 
        error: `Wrong network. Expected eduChain Testnet (${EDU_CHAIN_CONFIG.chainId}), got ${networkStatus.chainId}`,
        needsNetworkSwitch: true 
      };
    }
    
    try {
      // Check if method exists on contract
      if (!contract[methodName]) {
        console.error(`[CONTRACT DEBUG] Method ${methodName} does not exist on contract`);
        return { success: false, error: `Method ${methodName} does not exist on contract` };
      }
      
      // Print contract address and ABI
      console.log(`[CONTRACT DEBUG] Contract address: ${contract.target}`);
      console.log(`[CONTRACT DEBUG] Contract interface:`, contract.interface.format());
      
      return { success: true };
    } catch (error) {
      console.error(`[CONTRACT DEBUG] Error validating contract call:`, error);
      return { success: false, error: `Error validating contract call: ${error}` };
    }
  };

  // Helper to switch network if needed
  const ensureCorrectNetwork = async (): Promise<boolean> => {
    if (!networkStatus.isCorrectNetwork) {
      toast.warning(`You need to be on eduChain Testnet. Attempting to switch...`);
      return await switchToEduChain();
    }
    return true;
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    setIsDebugMode(!isDebugMode);
  };

  return {
    isDebugMode,
    toggleDebugMode,
    networkStatus,
    debugContractCall,
    ensureCorrectNetwork,
    debugTransaction,
    isBusy,
    lastError,
    lastDebugLog
  };
}

export default useContractDebugger;
