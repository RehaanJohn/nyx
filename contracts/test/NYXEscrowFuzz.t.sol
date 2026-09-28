// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/NYXEscrow.sol";
import "../src/MockUSDC.sol";

contract NYXEscrowFuzzTest is Test {
    NYXEscrow escrow;
    MockUSDC usdc;
    
    address client = address(0x1);
    address primaryWorker = address(0x2);
    address fallbackWorker = address(0x3);
    address analysisWorker = address(0x4);
    
    function setUp() public {
        usdc = new MockUSDC();
        escrow = new NYXEscrow(address(usdc), client);
        
        usdc.mint(client, type(uint128).max);
        
        vm.prank(client);
        usdc.approve(address(escrow), type(uint256).max);
    }
    
    function testFuzz_CapitalCap(
        uint128 _primaryBudget, 
        uint128 _fallbackBudget, 
        uint128 _analysisBudget
    ) public {
        // Bound inputs to prevent overflow when adding
        vm.assume(_primaryBudget < type(uint128).max / 2);
        vm.assume(_fallbackBudget < type(uint128).max / 2);
        vm.assume(_analysisBudget < type(uint128).max / 2);
        
        uint256 primaryPathCost = uint256(_primaryBudget) + _analysisBudget;
        uint256 fallbackPathCost = uint256(_fallbackBudget) + _analysisBudget;
        uint256 expectedCap = primaryPathCost > fallbackPathCost ? primaryPathCost : fallbackPathCost;
        
        vm.startPrank(client);
        escrow.createPolicy(
            _primaryBudget, _fallbackBudget, _analysisBudget,
            primaryWorker, fallbackWorker, analysisWorker,
            block.timestamp + 100, block.timestamp + 200
        );
        escrow.fund();
        vm.stopPrank();
        
        (uint256 capitalCap,,,,,,,,,) = escrow.policy();
        assertEq(capitalCap, expectedCap);
        assertEq(usdc.balanceOf(address(escrow)), expectedCap);
    }
}
