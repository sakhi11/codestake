import { useCallback, useState } from "react";
import { useWeb3 } from "@/context/Web3Provider";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/utils";
import { ethers } from "ethers";

export function useContractDebugger() {
  const { provider, address, isConnected } = useWeb3();
  const [logs, setLogs] = useState<string[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);

  // Return a boolean value instead of void to fix type error
  const enableDebugging = useCallback(() => {
    setIsDebugging(true);
    return true;
  }, []);

  const logEvent = useCallback((message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const executeContractFunction = useCallback(
    async (functionName: string, ...args: any[]) => {
      if (!provider || !address || !isConnected) {
        logEvent("Not connected to the wallet.");
        return;
      }

      if (!isDebugging) {
        logEvent("Debugging is not enabled.");
        return;
      }

      try {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        logEvent(`Executing function: ${functionName} with args: ${JSON.stringify(args)}`);

        const transaction = await contract[functionName](...args);
        logEvent(`Transaction sent: ${transaction.hash}`);

        const receipt = await transaction.wait();
        logEvent(`Transaction confirmed in block: ${receipt.blockNumber}`);
        logEvent(`Gas used: ${receipt.gasUsed.toString()}`);

        if (receipt.events) {
          receipt.events.forEach((event) => {
            logEvent(`Event: ${event.event}, Args: ${JSON.stringify(event.args)}`);
          });
        }
      } catch (error: any) {
        logEvent(`Error executing function: ${error.message}`);
      }
    },
    [provider, address, isConnected, isDebugging, logEvent]
  );

  return {
    logs,
    isDebugging,
    enableDebugging,
    logEvent,
    clearLogs,
    executeContractFunction,
  };
}
