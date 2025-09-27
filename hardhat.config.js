require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28", //version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  networks: {
    celoSepolia: {
      url: "https://rpc.ankr.com/celo_sepolia",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11142220
    },
    kadenaTestnet: {
      url: "https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc",
      chainId: parseInt(5920),
      accounts: [process.env.PRIVATE_KEY]
    }
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },

  verify: {
    blockscout: {
      enabled: false,
    },
  },


  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }

};