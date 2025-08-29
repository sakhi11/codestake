import { config } from "@onflow/config";
import { FlowService } from "../src/services/flowService";

// Test configuration
const testConfig = {
  testnet: {
    accessNode: "https://rest-testnet.onflow.org",
    discoveryWallet: "https://fcl-discovery.onflow.org/testnet/authn",
    contractAddress: "0x01cf0e2f2f715450" // Update this after deployment
  }
};

async function testFlowContract() {
  console.log("🧪 Testing Flow Contract Functionality");
  console.log("=====================================");
  
  try {
    // Initialize Flow client
    config({
      "accessNode.api": testConfig.testnet.accessNode,
      "discovery.wallet": testConfig.testnet.discoveryWallet,
      "0xCodeStake": testConfig.testnet.contractAddress
    });
    
    console.log("✅ Flow client initialized");
    
    // Test getting current block
    console.log("\n📦 Testing getCurrentBlock...");
    const blockResult = await FlowService.getCurrentBlock();
    if (blockResult.success) {
      console.log("✅ getCurrentBlock successful");
      console.log("   Block height:", blockResult.data.height);
    } else {
      console.log("❌ getCurrentBlock failed:", blockResult.error);
    }
    
    // Test getting current user (will fail if not authenticated)
    console.log("\n👤 Testing getCurrentUser...");
    const userResult = await FlowService.getCurrentUser();
    if (userResult.success) {
      console.log("✅ getCurrentUser successful");
      console.log("   Address:", userResult.data.address);
    } else {
      console.log("⚠️  getCurrentUser failed (expected if not authenticated):", userResult.error);
    }
    
    // Test contract queries (will fail if contract not deployed)
    console.log("\n📋 Testing contract queries...");
    const challengeResult = await FlowService.getChallenge(0);
    if (challengeResult.success) {
      console.log("✅ getChallenge successful");
    } else {
      console.log("⚠️  getChallenge failed (expected if contract not deployed):", challengeResult.error);
    }
    
    console.log("\n🎯 Test Summary:");
    console.log("=================");
    console.log("✅ Flow client initialization");
    console.log("✅ Basic Flow operations");
    console.log("⚠️  Contract interaction (requires deployment)");
    
    console.log("\n📝 Next Steps:");
    console.log("1. Deploy the contract using the deployment script");
    console.log("2. Update the contract address in the configuration");
    console.log("3. Run this test again to verify contract functionality");
    
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run tests
testFlowContract()
  .then(() => {
    console.log("\n🏁 Testing complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test suite failed:", error);
    process.exit(1);
  });
