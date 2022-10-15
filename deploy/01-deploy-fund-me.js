// function deployFunct(hre) {
// 	console.log("Hi")
// }

// module.exports.default = deployFunct

// module.exports = async (hre) {
//     const { getNamedAccounts, deployments } = hre }
//     // same as
//     // hre.getNamedAccounts
//     // hre.deployments
//

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
// setup below same as lines 7-8
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log, get } = deployments
	const { deployer } = await getNamedAccounts()
	const chainId = network.config.chainId //network object from hardhat package

	// when going for localhost or hardhat network we want to use a mock

	//const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
	let ethUsdPriceFeedAddress
	if (developmentChains.includes(network.name)) {
		const ethUsdAggregator = await get("MockV3Aggregator")
		ethUsdPriceFeedAddress = ethUsdAggregator.address
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
	}

	const args = [ethUsdPriceFeedAddress]
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	})
	log(`FundMe deployed at ${fundMe.address}`)

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, args)
	}
	log("---------------------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
