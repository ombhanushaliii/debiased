const hre = require('hardhat')

async function main() {
  // console.log("Deploying Contract to Celo Sepolia Testnet...");

  const ProofOfHuman = await hre.ethers.getContractFactory('ProofOfHuman')
  const Verify = await ProofOfHuman.deploy(
    '0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74',
    'proof-of-human'
  ) //HubV2, scope-seed

  await Verify.waitForDeployment()
  const address = await Verify.getAddress()

  console.log('Contract address:', address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
