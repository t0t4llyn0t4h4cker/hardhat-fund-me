require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const LOCALHOST_RPC_URL = process.env.LOCALHOST_RPC_URL
// const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

module.exports = {
	// solidity: "0.8.8",
	solidity: {
		compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
	},
	defaultNetwork: "hardhat",
	networks: {
		goerli: {
			url: GOERLI_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 5,
			blockConfirmations: 3,
		},
		localhost: {
			url: LOCALHOST_RPC_URL,
			chainId: 31337,
		},
	},
	etherscan: { apiKey: ETHERSCAN_API_KEY },
	gasReporter: {
		enabled: true,
		outputFile: "gas-report.txt",
		noColors: true,
		currency: "USD",
		token: "Matic",
		// coinmarketcap: COINMARKETCAP_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0, // here this will by default take the first account as deployer
			1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
		},
	},
}
