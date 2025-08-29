import { config } from "@onflow/config";
import { send, getAccount, getBlock } from "@onflow/fcl";
import { deployContractByName } from "@onflow/fcl";

// Configure Flow client
config({
  "accessNode.api": "https://rest-testnet.onflow.org", // Testnet
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0xCodeStake": "0x01cf0e2f2f715450" // This will be your deployed contract address
});

async function main() {
  try {
    console.log("🚀 Deploying CodeStake contract to Flow blockchain...");
    
    // Deploy the contract
    const result = await send([
      deployContractByName({
        name: "CodeStake",
        code: await getContractCode(),
        args: []
      })
    ]);
    
    console.log("✅ Contract deployed successfully!");
    console.log("Transaction ID:", result.transactionId);
    console.log("Contract Address:", result.events[0].address);
    
    // Update the config with the new contract address
    console.log("📝 Update your config with the new contract address:");
    console.log(`"0xCodeStake": "${result.events[0].address}"`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function getContractCode(): Promise<string> {
  const fs = require('fs');
  const path = require('path');
  
  const contractPath = path.join(__dirname, '../flow-contracts/CodeStake.cdc');
  return fs.readFileSync(contractPath, 'utf8');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
