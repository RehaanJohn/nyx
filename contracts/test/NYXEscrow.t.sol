// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/NYXEscrow.sol";
import "../src/MockUSDC.sol";

contract NYXEscrowTest is Test {
    NYXEscrow escrow;
    MockUSDC usdc;
    
    address client = address(0x1);
    address primaryWorker = address(0x2);
    address fallbackWorker = address(0x3);
    address analysisWorker = address(0x4);
    
    function setUp() public {
        usdc = new MockUSDC();
        escrow = new NYXEscrow(address(usdc), client);
        
        usdc.mint(client, 1000 * 10**6);
        
        vm.startPrank(client);
        usdc.approve(address(escrow), type(uint256).max);
        vm.stopPrank();
    }
    
    function testPrimarySuccess() public {
        vm.startPrank(client);
        escrow.createPolicy(
            1500000, 1200000, 500000, // 1.5 USDC, 1.2 USDC, 0.5 USDC
            primaryWorker, fallbackWorker, analysisWorker,
            block.timestamp + 100, block.timestamp + 200
        );
        escrow.fund();
        escrow.startExecution();
        vm.stopPrank();
        
        assertEq(usdc.balanceOf(address(escrow)), 2000000); // Max(1.5+0.5, 1.2+0.5) = 2.0 USDC
        
        // Primary passes
        vm.prank(primaryWorker);
        escrow.submitPrimaryReport(block.number); // fresh
        
        // Analysis passes
        vm.prank(analysisWorker);
        escrow.submitAnalysisReport();
        
        // Resolve
        escrow.resolve();
        
        assertEq(usdc.balanceOf(primaryWorker), 1500000);
        assertEq(usdc.balanceOf(analysisWorker), 500000);
        assertEq(usdc.balanceOf(client), 1000 * 10**6 - 2000000); // 2.0 used completely
    }

    function testPrimaryFailFallbackSuccess() public {
        vm.startPrank(client);
        escrow.createPolicy(
            1500000, 1200000, 500000,
            primaryWorker, fallbackWorker, analysisWorker,
            block.timestamp + 100, block.timestamp + 200
        );
        escrow.fund();
        escrow.startExecution();
        vm.stopPrank();
        
        // Primary fails due to stale data
        vm.roll(block.number + 30);
        
        vm.prank(primaryWorker);
        escrow.submitPrimaryReport(block.number - 25); // stale (> 20)
        
        // Check credit
        (address src, address target, uint256 amt, NYXEscrow.CreditState st) = escrow.contingentCredit();
        assertEq(src, primaryWorker);
        assertEq(target, fallbackWorker);
        assertEq(amt, 1500000);
        assertTrue(st == NYXEscrow.CreditState.AVAILABLE);
        
        // Fallback uses credit
        vm.prank(fallbackWorker);
        escrow.consumeCreditAndSubmitFallback(block.number); // fresh
        
        // Analysis passes
        vm.prank(analysisWorker);
        escrow.submitAnalysisReport();
        
        // Resolve
        escrow.resolve();
        
        assertEq(usdc.balanceOf(primaryWorker), 0);
        assertEq(usdc.balanceOf(fallbackWorker), 1200000);
        assertEq(usdc.balanceOf(analysisWorker), 500000);
        assertEq(usdc.balanceOf(client), 1000 * 10**6 - 2000000 + 300000); // 1.7 used, 0.3 returned
    }
}
