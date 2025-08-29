const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log("🚀 CodeStake Flow Contract Deployment Setup");
    console.log("==========================================");
    
    // Get contract code
    const contractPath = path.join(__dirname, '../flow-contracts/CodeStake.cdc');
    const contractCode = fs.readFileSync(contractPath, 'utf8');
    
    console.log("✅ Contract code loaded successfully");
    console.log("📝 Contract size:", contractCode.length, "characters");
    console.log("📄 Contract path:", contractPath);
    
    // Display contract preview
    console.log("\n📋 Contract Preview (first 200 chars):");
    console.log("=====================================");
    console.log(contractCode.substring(0, 200) + "...");
    
    console.log("\n📋 Deployment Instructions:");
    console.log("==========================");
    console.log("1. Download Flow CLI from: https://github.com/onflow/flow-cli/releases");
    console.log("2. Extract to a folder and add to PATH");
    console.log("3. Run: flow deploy --network testnet");
    console.log("4. Verify with: flow contracts get --network testnet");
    
    console.log("\n🔧 Alternative: Manual deployment via Flow Playground");
    console.log("1. Go to: https://play.onflow.org/");
    console.log("2. Switch to Testnet network");
    console.log("3. Copy the contract code from: flow-contracts/CodeStake.cdc");
    console.log("4. Paste and deploy");
    
    console.log("\n📝 After deployment, update these files:");
    console.log("   - src/flow-config.ts (contract address)");
    console.log("   - scripts/test-flow.ts (contract address)");
    
    console.log("\n🔑 Your Account Details:");
    console.log("   Address: 0x1cf42ad65f227d9d");
    console.log("   Network: Testnet");
    console.log("   Access Node: https://rest-testnet.onflow.org");
    
    console.log("\n✅ Setup complete! Follow the deployment instructions above.");
    console.log("📚 For more help, visit: https://docs.onflow.org/");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n🏁 Ready for deployment!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });
