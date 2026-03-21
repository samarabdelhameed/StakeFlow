// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import { ValidatorRegistry } from "../src/core/ValidatorRegistry.sol";
import { RestakingStrategy } from "../src/core/RestakingStrategy.sol";
import { Vault } from "../src/core/Vault.sol";
import { IValidatorRegistry } from "../src/interfaces/IValidatorRegistry.sol";
import { IRestakingStrategy } from "../src/interfaces/IRestakingStrategy.sol";
import { IVault } from "../src/interfaces/IVault.sol";

/// @title VaultTest
/// @notice Comprehensive tests for the StakeFlow Vault
contract VaultTest is Test {
    ValidatorRegistry public registry;
    RestakingStrategy public strategy;
    Vault public vault;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public validator1 = address(0x1111111111111111111111111111111111111111);
    address public validator2 = address(0x2222222222222222222222222222222222222222);

    function setUp() public {
        // Deploy contracts
        registry = new ValidatorRegistry();
        strategy = new RestakingStrategy(address(registry));
        vault = new Vault(address(strategy));

        // Register validators
        registry.registerValidator(validator1, "Validator Alpha", 500);
        registry.registerValidator(validator2, "Validator Beta", 300);

        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    // ═══════════════════════════════════════════════════════
    //                    DEPOSIT TESTS
    // ═══════════════════════════════════════════════════════

    function test_Deposit() public {
        vm.prank(alice);
        uint256 shares = vault.deposit{ value: 1 ether }();

        assertGt(shares, 0, "Should receive shares");
        assertEq(vault.totalValueLocked(), 1 ether, "TVL should be 1 ETH");
        assertEq(vault.sharesOf(alice), shares, "Should track shares");
    }

    function test_DepositMultipleUsers() public {
        vm.prank(alice);
        vault.deposit{ value: 1 ether }();

        vm.prank(bob);
        vault.deposit{ value: 2 ether }();

        assertEq(vault.totalValueLocked(), 3 ether, "TVL should be 3 ETH");
    }

    function test_RevertWhen_DepositBelowMinimum() public {
        vm.prank(alice);
        vm.expectRevert(IVault.InvalidAmount.selector);
        vault.deposit{ value: 0.001 ether }();
    }

    // ═══════════════════════════════════════════════════════
    //                   WITHDRAW TESTS
    // ═══════════════════════════════════════════════════════

    function test_Withdraw() public {
        vm.prank(alice);
        uint256 shares = vault.deposit{ value: 1 ether }();

        // Fast forward past cooldown
        vm.warp(block.timestamp + 1 days + 1);

        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        vault.withdraw(shares);

        assertGt(alice.balance, balanceBefore, "Should receive ETH back");
        assertEq(vault.sharesOf(alice), 0, "Should have 0 shares");
    }

    function test_RevertWhen_WithdrawDuringCooldown() public {
        vm.prank(alice);
        uint256 shares = vault.deposit{ value: 1 ether }();

        vm.prank(alice);
        vm.expectRevert(IVault.WithdrawalCooldown.selector);
        vault.withdraw(shares);
    }

    function test_RevertWhen_WithdrawInsufficientShares() public {
        vm.prank(alice);
        vault.deposit{ value: 1 ether }();

        vm.warp(block.timestamp + 1 days + 1);

        vm.prank(alice);
        vm.expectRevert(IVault.InsufficientBalance.selector);
        vault.withdraw(type(uint256).max);
    }

    // ═══════════════════════════════════════════════════════
    //                   REWARDS TESTS
    // ═══════════════════════════════════════════════════════

    function test_DistributeRewards() public {
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        // Owner distributes rewards
        vault.distributeRewards{ value: 1 ether }();

        // Share value should increase
        uint256 ethValue = vault.sharesToETH(vault.sharesOf(alice));
        assertEq(ethValue, 11 ether, "Should reflect rewards");
    }

    // ═══════════════════════════════════════════════════════
    //                 EXCHANGE RATE TESTS
    // ═══════════════════════════════════════════════════════

    function test_ExchangeRate() public {
        vm.prank(alice);
        vault.deposit{ value: 1 ether }();

        uint256 rate = vault.exchangeRate();
        assertGt(rate, 0, "Exchange rate should be positive");
    }

    // ═══════════════════════════════════════════════════════
    //                     FUZZ TESTS
    // ═══════════════════════════════════════════════════════

    function testFuzz_DepositWithdraw(uint256 amount) public {
        amount = bound(amount, 0.01 ether, 50 ether);

        vm.deal(alice, amount);
        vm.prank(alice);
        uint256 shares = vault.deposit{ value: amount }();

        vm.warp(block.timestamp + 1 days + 1);

        vm.prank(alice);
        uint256 withdrawn = vault.withdraw(shares);

        assertEq(withdrawn, amount, "Should get back same amount");
    }
}

/// @title ValidatorRegistryTest
/// @notice Tests for validator registration and management
contract ValidatorRegistryTest is Test {
    ValidatorRegistry public registry;

    address public validator1 = makeAddr("validator1");
    address public validator2 = makeAddr("validator2");

    function setUp() public {
        registry = new ValidatorRegistry();
    }

    function test_RegisterValidator() public {
        registry.registerValidator(validator1, "Alpha", 500);

        IValidatorRegistry.ValidatorInfo memory info = registry.getValidator(validator1);
        assertEq(info.name, "Alpha");
        assertEq(info.commission, 500);
        assertTrue(info.isActive);
        assertEq(registry.validatorCount(), 1);
    }

    function test_DeactivateValidator() public {
        registry.registerValidator(validator1, "Alpha", 500);
        registry.deactivateValidator(validator1);

        IValidatorRegistry.ValidatorInfo memory info = registry.getValidator(validator1);
        assertFalse(info.isActive);
        assertEq(registry.validatorCount(), 0);
    }

    function test_GetActiveValidators() public {
        registry.registerValidator(validator1, "Alpha", 500);
        registry.registerValidator(validator2, "Beta", 300);

        IValidatorRegistry.ValidatorInfo[] memory active = registry.getActiveValidators();
        assertEq(active.length, 2);
    }

    function test_UpdatePerformanceScore() public {
        registry.registerValidator(validator1, "Alpha", 500);
        registry.updatePerformanceScore(validator1, 9_000);

        IValidatorRegistry.ValidatorInfo memory info = registry.getValidator(validator1);
        assertEq(info.performanceScore, 9_000);
    }

    function test_RevertWhen_CommissionTooHigh() public {
        vm.expectRevert("Commission too high");
        registry.registerValidator(validator1, "Alpha", 5_000);
    }
}

/// @title RestakingStrategyTest
/// @notice Tests for the allocation algorithm
contract RestakingStrategyTest is Test {
    ValidatorRegistry public registry;
    RestakingStrategy public strategy;

    address public validator1 = address(0x1111111111111111111111111111111111111111);
    address public validator2 = address(0x2222222222222222222222222222222222222222);
    address public validator3 = address(0x3333333333333333333333333333333333333333);

    function setUp() public {
        registry = new ValidatorRegistry();
        strategy = new RestakingStrategy(address(registry));

        registry.registerValidator(validator1, "Alpha", 500);
        registry.registerValidator(validator2, "Beta", 300);
        registry.registerValidator(validator3, "Gamma", 700);

        // Set different performance scores
        registry.updatePerformanceScore(validator1, 8_000);
        registry.updatePerformanceScore(validator2, 9_000);
        registry.updatePerformanceScore(validator3, 6_000);
    }

    function test_CalculateAllocation() public view {
        IRestakingStrategy.Allocation[] memory allocs = strategy.calculateAllocation(100 ether);

        assertEq(allocs.length, 3, "Should have 3 allocations");

        uint256 totalAllocated = 0;
        for (uint256 i = 0; i < allocs.length; i++) {
            assertGt(allocs[i].amount, 0, "Each should have amount");
            assertGe(allocs[i].percentage, strategy.MIN_ALLOCATION(), "Above min");
            assertLe(allocs[i].percentage, strategy.MAX_ALLOCATION(), "Below max");
            totalAllocated += allocs[i].amount;
        }

        assertEq(totalAllocated, 100 ether, "Total should equal input");
    }

    function test_Rebalance() public {
        strategy.rebalance();

        uint256 alloc1 = strategy.getAllocation(validator1);
        uint256 alloc2 = strategy.getAllocation(validator2);

        // Validator2 has better score (9000) and lower commission (300)
        // so should get higher allocation
        assertGe(alloc2, alloc1, "Better validator should get more");
    }

    function test_ExecuteStrategy() public {
        strategy.executeStrategy(10 ether);
        // Should not revert
    }
}
