const { config } = require("@onflow/config");
const { send } = require("@onflow/fcl");
const fs = require('fs');
const path = require('path');

// Configure Flow client
config({
  "accessNode.api": "https://rest-testnet.onflow.org", // Testnet
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0xCodeStake": "0x01cf0e2f2f715450" // This will be your deployed contract address
});

async function main() {
  try {
    console.log("🚀 Deploying CodeStake contract to Flow blockchain...");
    
    // Get contract code
    const contractPath = path.join(__dirname, '../flow-contracts/CodeStake.cdc');
    const contractCode = fs.readFileSync(contractPath, 'utf8');
    
    console.log("📄 Contract code loaded successfully");
    console.log("📝 Contract size:", contractCode.length, "characters");
    
    // For now, we'll use the Flow CLI approach since direct deployment requires more setup
    console.log("\n📋 Deployment Instructions:");
    console.log("==========================");
    console.log("1. Download Flow CLI from: https://github.com/onflow/flow-cli/releases");
    console.log("2. Extract to a folder and add to PATH");
    console.log("3. Run: flow deploy --network testnet");
    console.log("4. Verify with: flow contracts get --network testnet");
    
    console.log("\n🔧 Alternative: Manual deployment");
    console.log("1. Copy the contract code from: flow-contracts/CodeStake.cdc");
    console.log("2. Use Flow Playground: https://play.onflow.org/");
    console.log("3. Paste the code and deploy");
    
    console.log("\n📝 After deployment, update the contract address in:");
    console.log("   - src/flow-config.ts");
    console.log("   - scripts/test-flow.ts");
    
  } catch (error) {
    console.error("❌ Deployment setup failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Setup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });
