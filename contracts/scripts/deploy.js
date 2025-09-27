const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying ZVASP contract to Kadena Chainweb EVM...");

  const proofOfHumanAddress = process.env.PROOF_OF_HUMAN_ADDRESS;
  
  // console.log("Using ProofOfHuman contract at:", proofOfHumanAddress);

  // Deploy ZVASP contract
  console.log("Deploying ZVASP...");
  const ZVASP = await hre.ethers.getContractFactory("ZVASP");
  const zvasp = await ZVASP.deploy(proofOfHumanAddress);
  await zvasp.waitForDeployment();
  
  const zvaspAddress = await zvasp.getAddress();
  console.log("ZVASP deployed to:", zvaspAddress);

  // Verify deployment
  console.log("\n=== Deployment Summary ===");
  // console.log("ProofOfHuman Contract (existing):", proofOfHumanAddress);
  console.log("ZVASP Contract (newly deployed):", zvaspAddress);
  // console.log("Network: Kadena Chainweb EVM Testnet");
  
  // // Save addresses to file for frontend integration
  // const fs = require('fs');
  // const addresses = {
  //   proofOfHuman: proofOfHumanAddress,
  //   zvasp: zvaspAddress,
  //   network: "kadena-testnet"
  // };
  
  // fs.writeFileSync('./deployed-addresses.json', JSON.stringify(addresses, null, 2));
  // console.log("Contract addresses saved to deployed-addresses.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});