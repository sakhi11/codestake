
import { ethers } from "hardhat";

async function main() {
  const ChallengeManager = await ethers.getContractFactory("ChallengeManager");
  const challengeManager = await ChallengeManager.deploy();
  await challengeManager.deployed();

  console.log("ChallengeManager deployed to:", challengeManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
