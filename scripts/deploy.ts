import { ethers } from "hardhat";

async function main() {
  const CodeStake = await ethers.getContractFactory("CodeStake");
  const codeStake = await CodeStake.deploy();
  await codeStake.deployed();

  console.log("CodeStake deployed to:", codeStake.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 