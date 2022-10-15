// SPDX-License-Identifier: MIT
// Pragma
pragma solidity ^0.8.8;
// Imports
import "./PriceConverter.sol";
import "hardhat/console.sol";
// Error Codes
error FundMe__NotOwner();

// Interfaces, Libraries, Contracts

/** @title A contract for crowd funding
 *  @author Laurent Mescudi
 * 	@notice This contract is to demo a sample funding contract
 *  @dev this implements price feeds as our library
 */
contract FundMe {
	// Type Declarations
	using PriceConverter for uint256;

	// State Variables
	uint256 public constant MINIMUM_USD = 50 * 1e18; // 1 * 10 ** 18
	address[] private s_funders;
	mapping(address => uint256) private s_addressToAmountFunded;
	address private immutable i_owner;
	AggregatorV3Interface private s_priceFeed;

	// Events

	// Modifiers
	modifier onlyOwner() {
		//require(msg.sender == i_owner, "Not Owner");
		//for gas saving, custom error
		console.log("hit onlyOwner error");
		if (msg.sender != i_owner) revert FundMe__NotOwner();
		_;
	}

	// Function Order
	//// constructor
	//// receive
	//// fallback
	//// external
	//// public
	//// internal
	//// private
	//// view / pure
	constructor(address priceFeedAddress) {
		i_owner = msg.sender;
		s_priceFeed = AggregatorV3Interface(priceFeedAddress);
	}

	receive() external payable {
		fund();
	}

	fallback() external payable {
		fund();
	}

	function fund() public payable {
		require(msg.sender == tx.origin, "No bots grr");
		console.log("Checking if value sent greater than 50 USD");
		require(
			msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
			"Not enough ETH :( !"
		); //1e18 == 1* 10 ** 18 == 1000000000000000000
		s_funders.push(msg.sender);
		s_addressToAmountFunded[msg.sender] += msg.value;
	}

	function withdraw() public onlyOwner {
		console.log("starting to withdraw");
		for (
			uint256 funderIndex = 0;
			funderIndex < s_funders.length;
			funderIndex++
		) {
			address funder = s_funders[funderIndex];
			s_addressToAmountFunded[funder] = 0;
		}
		// reset array
		s_funders = new address[](0);

		(bool callSuccess, ) = payable(msg.sender).call{
			value: address(this).balance
		}("");
		require(callSuccess, "Transfer failed");
		//call is recc for sending/rec eth
	}

	function cheaperWithdraw() public payable onlyOwner {
		address[] memory funders = s_funders;
		// mappings cant be in memory
		for (
			uint256 funderIndex = 0;
			funderIndex < funders.length;
			funderIndex++
		) {
			address funder = funders[funderIndex];
			s_addressToAmountFunded[funder] = 0;
		}
		s_funders = new address[](0);
		(bool success, ) = i_owner.call{value: address(this).balance}("");
		require(success);
	}

	function getOwner() public view returns (address) {
		return i_owner;
	}

	function getFunder(uint256 index) public view returns (address) {
		return s_funders[index];
	}

	function getAddressToAmountFunded(address funder)
		public
		view
		returns (uint256)
	{
		return s_addressToAmountFunded[funder];
	}

	function getPriceFeed() public view returns (AggregatorV3Interface) {
		return s_priceFeed;
	}
}
