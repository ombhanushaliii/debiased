require("@nomicfoundation/hardhat-toolbox");
require("@kadena/hardhat-chainweb"); // Add this line
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  chainweb: {
    kadenaTestnet: {
      type: 'external',
      chains: 1, // Deploy to only 1 chain
      externalHostUrl: "https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm",
      etherscan: {
        apiKey: 'noapikeyrequired',
        apiURLTemplate: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/{cid}/evm/api/',
        browserURLTemplate: 'https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/{cid}/evm/',
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
    apiKey: "noapikeyrequired"
  },

  verify: {
    blockscout: {
      enabled: false,
    },
  },

  sourcify: {
    enabled: true
  }
};