const hre = require("hardhat");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying ZVASP contract to Kadena Chainweb EVM...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    // Configuration
    const treasuryAddress = deployer.address; // or your treasury wallet
    const relayServerAddress = deployer.address; // or dedicated relay wallet

    console.log("🏦 Treasury address:", treasuryAddress);
    console.log("🔗 Relay server address:", relayServerAddress);

    // Deploy ZVASP contract
    console.log("📄 Deploying ZVASP...");
    const ZVASP = await hre.ethers.getContractFactory("ZVASP");
    const zvasp = await ZVASP.deploy(treasuryAddress, relayServerAddress);
    
    await zvasp.waitForDeployment();
    const zvaspAddress = await zvasp.getAddress();
    
    console.log("✅ ZVASP deployed to:", zvaspAddress);

    // Save addresses
    const fs = require('fs');
    const addresses = {
        zvasp: zvaspAddress,
        treasury: treasuryAddress,
        relayServer: relayServerAddress,
        network: "kadena-testnet"
    };
    
    fs.writeFileSync('./deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("💾 Contract addresses saved to deployed-addresses.json");

    console.log("\n=== 🚀 Next Steps ===");
    console.log("1. Update relay-server/.env with ZVASP address:", zvaspAddress);
    console.log("2. Fund relay server wallet with KDA");
    console.log("3. Start relay server");
}

main().catch((error) => {
    console.error("💥 Deployment failed:", error);
    process.exitCode = 1;
});