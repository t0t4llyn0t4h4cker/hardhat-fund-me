const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

// let variable = false
// let someVar = variable ? "yes" : "no"
// if (variable) { someVar = "yes"} else {someVar = "no"}
// lines 5 and 6 are the samething

developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", async function () {
			let fundMe
			let deployer
			const sendValue = ethers.utils.parseEther("0.5")

			beforeEach(async function () {
				deployer = (await getNamedAccounts()).deployer
				fundMe = await ethers.getContract("FundMe", deployer)
			})

			it("allows people to fund and withdraw", async function () {
				const fundResponse = await fundMe.fund({ value: sendValue })
				// fundResponse.wait(1)
				const withdrawResponse = await fundMe.withdraw()
				await withdrawResponse.wait(1)

				const endingBalance = await fundMe.provider.getBalance(
					fundMe.address
				)
				assert.equal(endingBalance.toString(), "0")
			})
	  })
