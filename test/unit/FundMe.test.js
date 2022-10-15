const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
	? describe.skip
	: describe("FundMe", async function () {
			let fundMe
			let deployer
			let mockV3Aggregator
			const sendValue = ethers.utils.parseEther("1") // 1 eth
			beforeEach(async function () {
				// const accounts = await ethers.getSigners()
				// const accountZero = accounts[0]
				// if on hardhat, 10 default accounts. if not, pulls from the accounts listed in hardhat.config for that network

				// const { deployer } = await getNamedAccounts()
				deployer = (await getNamedAccounts()).deployer
				await deployments.fixture(["all"])
				fundMe = await ethers.getContract("FundMe", deployer)
				mockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					deployer
				)
			})
			describe("constructor", async function () {
				it("sets the aggregator addresses correctly", async function () {
					const response = await fundMe.getPriceFeed()
					// deployer.sendTransaction({ value: "1000" })
					assert.equal(response, mockV3Aggregator.address)
				})
			})

			describe("fund", async function () {
				it("Fails if you don't send enough ETH", async function () {
					await expect(fundMe.fund()).to.be.revertedWith(
						"Not enough ETH :( !"
					)
				})
				it("Updated the amount funded data structure", async function () {
					await fundMe.fund({ value: sendValue })
					const response = await fundMe.getAddressToAmountFunded(
						deployer
					)
					assert.equal(response.toString(), sendValue.toString())
				})
				it("adds funder to getFunder array", async function () {
					await fundMe.fund({ value: sendValue })
					const response = await fundMe.getFunder(0)
					assert.equal(response, deployer)
				})
			})

			describe("withdraw", async function () {
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue })
				})
				it("withdraw ETH from a single funder", async function () {
					// Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// Act
					const transactionResponse = await fundMe.withdraw()
					const transactionReceipt = await transactionResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// Assert
					assert.equal(endingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)
				})
				it("allows us to withdraw with multiple getFunder", async function () {
					// arrange
					const accounts = await ethers.getSigners()
					for (let i = 1; i < 6; i++) {
						// start with 1st index since 0 is the deployer
						const fundMeConnectedContract = await fundMe.connect(
							// create new object to connect to new accounts, since fundMe is connected to deployer
							accounts[i]
						)
						await fundMeConnectedContract.fund({ value: sendValue })
					}

					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// act
					const transactionResponse = await fundMe.withdraw()
					const transactionReceipt = await transactionResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)
					// assert
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					assert.equal(endingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)
					// make sure getFunder are reset
					await expect(fundMe.getFunder(0)).to.be.reverted

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						)
					}
				})
				it("only allows the owner to withdraw", async function () {
					const accounts = await ethers.getSigners()
					const attacker = accounts[1]
					const attackerConnectedContract = await fundMe.connect(
						attacker
					)

					await expect(
						attackerConnectedContract.withdraw()
					).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
				})

				it("cheaperWithdraw ETH from a single funder", async function () {
					// Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// Act
					const transactionResponse = await fundMe.cheaperWithdraw()
					const transactionReceipt = await transactionResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// Assert
					assert.equal(endingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)
				})
				it("allows us to cheaperWithdraw with multiple getFunder", async function () {
					// arrange
					const accounts = await ethers.getSigners()
					for (let i = 1; i < 6; i++) {
						// start with 1st index since 0 is the deployer
						const fundMeConnectedContract = await fundMe.connect(
							// create new object to connect to new accounts, since fundMe is connected to deployer
							accounts[i]
						)
						await fundMeConnectedContract.fund({ value: sendValue })
					}

					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// act
					const transactionResponse = await fundMe.cheaperWithdraw()
					const transactionReceipt = await transactionResponse.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice)
					// assert
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					assert.equal(endingFundMeBalance, 0)
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(),
						endingDeployerBalance.add(gasCost).toString()
					)
					// make sure getFunder are reset
					await expect(fundMe.getFunder(0)).to.be.reverted

					for (i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						)
					}
				})
				it("only allows the owner to cheaperWithdraw", async function () {
					const accounts = await ethers.getSigners()
					const attacker = accounts[1]
					const attackerConnectedContract = await fundMe.connect(
						attacker
					)

					await expect(
						attackerConnectedContract.cheaperWithdraw()
					).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
				})
			})
	  })
