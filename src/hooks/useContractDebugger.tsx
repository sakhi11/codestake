
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Provider';

/**
 * A hook for debugging contract interactions and validating parameters
 */
export function useContractDebugger() {
  const { contract, wallet, isConnected } = useWeb3();
  const [isBusy, setIsBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastDebugLog, setLastDebugLog] = useState<any>(null);

  // Debug a transaction before sending it
  const debugTransaction = async (
    functionName: string,
    args: any[],
    options: any = {}
  ) => {
    if (!contract || !isConnected) {
      return {
        success: false,
        error: 'Contract or wallet not connected',
        log: null
      };
    }

    setIsBusy(true);
    setLastError(null);
    
    try {
      // Log information for debugging
      const debugData = {
        function: functionName,
        args: args.map(arg => 
          ethers.isAddress(arg) ? arg : 
          Array.isArray(arg) ? arg.map(a => a.toString()) : 
          arg.toString()
        ),
        options: {
          ...options,
          value: options.value ? options.value.toString() : undefined
        },
        wallet,
        contractAddress: contract.target
      };
      
      console.log('Debug transaction:', debugData);
      setLastDebugLog(debugData);

      // Try to estimate gas to see if the transaction would fail
      if (contract[functionName]) {
        try {
          const gasEstimate = await contract[functionName].estimateGas(
            ...args, 
            options
          );
          console.log(`Gas estimate for ${functionName}:`, gasEstimate.toString());
          
          return {
            success: true,
            gasEstimate,
            error: null,
            log: debugData
          };
        } catch (error: any) {
          console.error(`Gas estimation failed for ${functionName}:`, error);
          setLastError(formatError(error));
          
          return {
            success: false,
            error: formatError(error),
            log: debugData
          };
        }
      } else {
        const error = `Function ${functionName} not found on contract`;
        console.error(error);
        setLastError(error);
        
        return {
          success: false,
          error,
          log: debugData
        };
      }
    } catch (error: any) {
      console.error('Debug transaction error:', error);
      const errorMessage = formatError(error);
      setLastError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        log: { error: error.message }
      };
    } finally {
      setIsBusy(false);
    }
  };

  // Format error messages
  const formatError = (error: any): string => {
    if (!error) return 'Unknown error';
    
    // Handle missing revert data
    if (error.message && error.message.includes('missing revert data')) {
      return 'Contract rejected the transaction. This could be due to incorrect parameters or incompatible contract version.';
    }
    
    // Handle user rejection
    if (error.code === 4001 || (error.message && error.message.includes('user rejected'))) {
      return 'Transaction was rejected by the user';
    }
    
    // Handle insufficient funds
    if (error.message && error.message.includes('insufficient funds')) {
      return 'Insufficient funds for this transaction';
    }
    
    // Return the error message or code
    return error.reason || error.message || `Error code: ${error.code}`;
  };

  return {
    debugTransaction,
    isBusy,
    lastError,
    lastDebugLog,
    reset: () => {
      setLastError(null);
      setLastDebugLog(null);
    }
  };
}
