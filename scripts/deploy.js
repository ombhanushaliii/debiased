const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const ZVASP = await hre.ethers.getContractFactory("ZVASP");
  const zvasp = await ZVASP.deploy(
    process.env.TEST_TOKEN_ADDRESS
  );
  await zvasp.waitForDeployment();
  console.log("ZVASP deployed to:", await zvasp.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});