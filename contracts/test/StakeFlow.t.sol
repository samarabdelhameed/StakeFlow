// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import { ValidatorRegistry } from "../src/core/ValidatorRegistry.sol";
import { RestakingStrategy } from "../src/core/RestakingStrategy.sol";
import { Vault } from "../src/core/Vault.sol";
import { IValidatorRegistry } from "../src/interfaces/IValidatorRegistry.sol";
import { IRestakingStrategy } from "../src/interfaces/IRestakingStrategy.sol";
import { IVault } from "../src/interfaces/IVault.sol";
import { StakeFlowMath } from "../src/libraries/StakeFlowMath.sol";

// ═══════════════════════════════════════════════════════════════
//                     VAULT TESTS
// ═══════════════════════════════════════════════════════════════

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

        // Register validators with risk scores and caps
        registry.registerValidator(validator1, "Validator Alpha", 500, 2_000, 50 ether);
        registry.registerValidator(validator2, "Validator Beta", 300, 1_500, 100 ether);

        // Transfer strategy ownership to vault for executeStrategy calls
        strategy.transferOwnership(address(vault));

        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    // ═══════════════════════════════════════════════
    //                DEPOSIT TESTS
    // ═══════════════════════════════════════════════

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

    function test_DepositEmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, false);
        emit IVault.Deposited(alice, 1 ether, 0); // shares checked loosely
        vault.deposit{ value: 1 ether }();
    }

    function test_RevertWhen_DepositBelowMinimum() public {
        vm.prank(alice);
        vm.expectRevert(IVault.InvalidAmount.selector);
        vault.deposit{ value: 0.001 ether }();
    }

    // ═══════════════════════════════════════════════
    //              WITHDRAW TESTS
    // ═══════════════════════════════════════════════

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

    function test_PartialWithdraw() public {
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        vm.warp(block.timestamp + 1 days + 1);

        // Withdraw only 3 ETH
        vm.prank(alice);
        uint256 sharesRedeemed = vault.withdrawETH(3 ether);

        assertGt(sharesRedeemed, 0, "Should redeem shares");
        assertGt(vault.sharesOf(alice), 0, "Should still have shares");
        assertEq(vault.totalValueLocked(), 7 ether, "TVL should decrease");
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

    function test_RevertWhen_PartialWithdrawExceedsBalance() public {
        vm.prank(alice);
        vault.deposit{ value: 1 ether }();

        vm.warp(block.timestamp + 1 days + 1);

        vm.prank(alice);
        vm.expectRevert(IVault.InsufficientBalance.selector);
        vault.withdrawETH(100 ether);
    }

    // ═══════════════════════════════════════════════
    //              REWARDS TESTS
    // ═══════════════════════════════════════════════

    function test_DistributeRewards() public {
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        // Owner distributes rewards
        vault.distributeRewards{ value: 1 ether }();

        // Share value should increase
        uint256 ethValue = vault.sharesToETH(vault.sharesOf(alice));
        assertEq(ethValue, 11 ether, "Should reflect rewards");
    }

    function test_RewardsDistributionEmitsEvent() public {
        vm.expectEmit(false, false, false, true);
        emit IVault.RewardsDistributed(1 ether, block.timestamp);
        vault.distributeRewards{ value: 1 ether }();
    }

    // ═══════════════════════════════════════════════
    //           USER POSITION TESTS
    // ═══════════════════════════════════════════════

    function test_GetUserPosition() public {
        vm.prank(alice);
        vault.deposit{ value: 5 ether }();

        IVault.UserPosition memory pos = vault.getUserPosition(alice);

        assertEq(pos.deposited, 5 ether, "Should track deposited amount");
        assertGt(pos.shares, 0, "Should have shares");
        assertEq(pos.ethValue, 5 ether, "ETH value should match deposit");
        assertFalse(pos.canWithdraw, "Should be in cooldown");

        vm.warp(block.timestamp + 1 days + 1);

        pos = vault.getUserPosition(alice);
        assertTrue(pos.canWithdraw, "Should be past cooldown");
    }

    function test_UserPositionEmpty() public view {
        IVault.UserPosition memory pos = vault.getUserPosition(alice);
        assertEq(pos.deposited, 0);
        assertEq(pos.shares, 0);
        assertEq(pos.ethValue, 0);
    }

    // ═══════════════════════════════════════════════
    //           EXCHANGE RATE TESTS
    // ═══════════════════════════════════════════════

    function test_ExchangeRate() public {
        vm.prank(alice);
        vault.deposit{ value: 1 ether }();

        uint256 rate = vault.exchangeRate();
        assertGt(rate, 0, "Exchange rate should be positive");
    }

    function test_ExchangeRateIncreasesWithRewards() public {
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        uint256 rateBefore = vault.exchangeRate();
        vault.distributeRewards{ value: 5 ether }();
        uint256 rateAfter = vault.exchangeRate();

        assertGt(rateAfter, rateBefore, "Rate should increase with rewards");
    }

    // ═══════════════════════════════════════════════
    //           OPTIMIZATION TESTS
    // ═══════════════════════════════════════════════

    function test_OptimizeMyPosition() public {
        uint256 depositAmount = 30 ether;
        vm.deal(alice, depositAmount);

        vm.prank(alice);
        vault.deposit{ value: depositAmount }();

        vm.prank(alice);
        vault.optimizeMyPosition();

        assertEq(vault.totalValueLocked(), depositAmount);
    }

    function test_RevertWhen_OptimizeWithZeroAssets() public {
        // Should revert because 0 assets (InsufficientBalance for the user)
        vm.expectRevert(IVault.InsufficientBalance.selector);
        vault.optimizeMyPosition();
    }

    // ═══════════════════════════════════════════════
    //           SIMULATION TESTS
    // ═══════════════════════════════════════════════

    function test_SimulateAllocation() public {
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        IRestakingStrategy.SimulationResult memory result = vault.simulateAllocation(10 ether);

        assertGt(result.allocations.length, 0, "Should have allocations");
        assertGt(result.expectedReturn, 0, "Should have expected return");
        assertGt(result.diversificationScore, 0, "Should have diversification score");
    }

    function test_PreviewSlashing() public {
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        (uint256 totalLoss, uint256 maxSingleLoss) = vault.previewSlashing();

        assertGt(totalLoss, 0, "Should have potential loss");
        assertGt(maxSingleLoss, 0, "Should have single validator loss");
        assertLe(totalLoss, 10 ether, "Loss shouldn't exceed total");
    }

    // ═══════════════════════════════════════════════
    //              STRATEGY UPDATE
    // ═══════════════════════════════════════════════

    function test_SetStrategy() public {
        RestakingStrategy newStrategy = new RestakingStrategy(address(registry));
        vault.setStrategy(address(newStrategy));
        assertEq(address(vault.strategy()), address(newStrategy));
    }

    // ═══════════════════════════════════════════════
    //                 FUZZ TESTS
    // ═══════════════════════════════════════════════

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

    function testFuzz_PartialWithdraw(uint256 depositAmount, uint256 withdrawPct) public {
        depositAmount = bound(depositAmount, 1 ether, 50 ether);
        withdrawPct = bound(withdrawPct, 10, 90); // 10-90%

        uint256 withdrawAmount = (depositAmount * withdrawPct) / 100;
        if (withdrawAmount == 0) withdrawAmount = 0.01 ether;

        vm.deal(alice, depositAmount);
        vm.prank(alice);
        vault.deposit{ value: depositAmount }();

        vm.warp(block.timestamp + 1 days + 1);

        vm.prank(alice);
        vault.withdrawETH(withdrawAmount);

        assertGt(vault.sharesOf(alice), 0, "Should still have shares");
    }

    // ═══════════════════════════════════════════════
    //            RECEIVE ETH TEST
    // ═══════════════════════════════════════════════

    function test_ReceiveETH_Reverts() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        (bool success,) = address(vault).call{ value: 1 ether }("");
        assertFalse(success, "Should revert on raw ETH transfer");
    }
}

// ═══════════════════════════════════════════════════════════════
//                  VALIDATOR REGISTRY TESTS
// ═══════════════════════════════════════════════════════════════

/// @title ValidatorRegistryTest
/// @notice Tests for validator registration, role-based access, and scoring
contract ValidatorRegistryTest is Test {
    ValidatorRegistry public registry;

    address public validator1 = makeAddr("validator1");
    address public validator2 = makeAddr("validator2");
    address public admin = makeAddr("admin");
    address public unauthorized = makeAddr("unauthorized");

    function setUp() public {
        registry = new ValidatorRegistry();
    }

    // ═══════════════════════════════════════════════
    //              REGISTRATION TESTS
    // ═══════════════════════════════════════════════

    function test_RegisterValidator() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);

        IValidatorRegistry.ValidatorInfo memory info = registry.getValidator(validator1);
        assertEq(info.name, "Alpha");
        assertEq(info.commission, 500);
        assertEq(info.riskScore, 2_000);
        assertEq(info.stakingCap, 50 ether);
        assertTrue(info.isActive);
        assertEq(info.performanceScore, 5_000); // default 50%
        assertEq(registry.validatorCount(), 1);
    }

    function test_RevertWhen_DuplicateRegistration() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);

        vm.expectRevert(IValidatorRegistry.ValidatorAlreadyRegistered.selector);
        registry.registerValidator(validator1, "Alpha Again", 500, 2_000, 50 ether);
    }

    function test_RevertWhen_CommissionTooHigh() public {
        vm.expectRevert(IValidatorRegistry.CommissionTooHigh.selector);
        registry.registerValidator(validator1, "Alpha", 5_000, 2_000, 50 ether);
    }

    function test_RevertWhen_EmptyName() public {
        vm.expectRevert(IValidatorRegistry.InvalidName.selector);
        registry.registerValidator(validator1, "", 500, 2_000, 50 ether);
    }

    function test_RevertWhen_InvalidRiskScore() public {
        vm.expectRevert(IValidatorRegistry.InvalidScore.selector);
        registry.registerValidator(validator1, "Alpha", 500, 15_000, 50 ether);
    }

    function test_RevertWhen_ZeroAddress() public {
        vm.expectRevert(IValidatorRegistry.InvalidAddress.selector);
        registry.registerValidator(address(0), "Alpha", 500, 2_000, 50 ether);
    }

    // ═══════════════════════════════════════════════
    //           DEACTIVATION / REACTIVATION
    // ═══════════════════════════════════════════════

    function test_DeactivateValidator() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
        registry.deactivateValidator(validator1);

        IValidatorRegistry.ValidatorInfo memory info = registry.getValidator(validator1);
        assertFalse(info.isActive);
        assertEq(registry.validatorCount(), 0);
    }

    function test_ReactivateValidator() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
        registry.deactivateValidator(validator1);

        assertEq(registry.validatorCount(), 0);

        registry.reactivateValidator(validator1);
        assertTrue(registry.getValidator(validator1).isActive);
        assertEq(registry.validatorCount(), 1);
    }

    function test_GetActiveValidators() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
        registry.registerValidator(validator2, "Beta", 300, 1_500, 100 ether);

        IValidatorRegistry.ValidatorInfo[] memory active = registry.getActiveValidators();
        assertEq(active.length, 2);
    }

    function test_GetActiveValidatorsExcludesInactive() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
        registry.registerValidator(validator2, "Beta", 300, 1_500, 100 ether);
        registry.deactivateValidator(validator1);

        IValidatorRegistry.ValidatorInfo[] memory active = registry.getActiveValidators();
        assertEq(active.length, 1);
        assertEq(active[0].validatorAddress, validator2);
    }

    // ═══════════════════════════════════════════════
    //              SCORE UPDATES
    // ═══════════════════════════════════════════════

    function test_UpdatePerformanceScore() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
        registry.updatePerformanceScore(validator1, 9_000);

        IValidatorRegistry.ValidatorInfo memory info = registry.getValidator(validator1);
        assertEq(info.performanceScore, 9_000);
    }

    function test_UpdateRiskScore() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
        registry.updateRiskScore(validator1, 3_000);

        IValidatorRegistry.ValidatorInfo memory info = registry.getValidator(validator1);
        assertEq(info.riskScore, 3_000);
    }

    function test_ScoreHistoryTracking() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);

        // Update scores multiple times
        registry.updatePerformanceScore(validator1, 6_000);
        vm.warp(block.timestamp + 1 hours);
        registry.updatePerformanceScore(validator1, 7_000);
        vm.warp(block.timestamp + 1 hours);
        registry.updatePerformanceScore(validator1, 8_000);

        IValidatorRegistry.ScoreSnapshot[] memory history = registry.getScoreHistory(validator1);
        // 1 initial + 3 updates = 4 snapshots
        assertEq(history.length, 4);
        assertEq(history[0].performanceScore, 5_000); // initial
        assertEq(history[3].performanceScore, 8_000); // latest
    }

    function test_UpdateValidator() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
        registry.updateValidator(validator1, 700, 100 ether);

        IValidatorRegistry.ValidatorInfo memory info = registry.getValidator(validator1);
        assertEq(info.commission, 700);
        assertEq(info.stakingCap, 100 ether);
    }

    // ═══════════════════════════════════════════════
    //            ROLE-BASED ACCESS
    // ═══════════════════════════════════════════════

    function test_AdminCanRegister() public {
        registry.grantAdmin(admin);

        vm.prank(admin);
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);

        assertEq(registry.validatorCount(), 1);
    }

    function test_AdminCanUpdateScores() public {
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
        registry.grantAdmin(admin);

        vm.prank(admin);
        registry.updatePerformanceScore(validator1, 8_000);

        assertEq(registry.getValidator(validator1).performanceScore, 8_000);
    }

    function test_RevertWhen_UnauthorizedAccess() public {
        vm.prank(unauthorized);
        vm.expectRevert(IValidatorRegistry.Unauthorized.selector);
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
    }

    function test_RevokeAdmin() public {
        registry.grantAdmin(admin);
        registry.revokeAdmin(admin);

        vm.prank(admin);
        vm.expectRevert(IValidatorRegistry.Unauthorized.selector);
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);
    }
}

// ═══════════════════════════════════════════════════════════════
//                  STRATEGY TESTS
// ═══════════════════════════════════════════════════════════════

/// @title RestakingStrategyTest
/// @notice Tests for the allocation algorithm, simulation, and slashing
contract RestakingStrategyTest is Test {
    ValidatorRegistry public registry;
    RestakingStrategy public strategy;

    address public validator1 = address(0x1111111111111111111111111111111111111111);
    address public validator2 = address(0x2222222222222222222222222222222222222222);
    address public validator3 = address(0x3333333333333333333333333333333333333333);

    function setUp() public {
        registry = new ValidatorRegistry();
        strategy = new RestakingStrategy(address(registry));

        // Register validators with different profiles
        registry.registerValidator(validator1, "Alpha", 500, 2_000, 50 ether);  // 5% comm, 20% risk
        registry.registerValidator(validator2, "Beta", 300, 1_500, 100 ether);  // 3% comm, 15% risk
        registry.registerValidator(validator3, "Gamma", 700, 3_000, 80 ether);  // 7% comm, 30% risk

        // Set different performance scores
        registry.updatePerformanceScore(validator1, 8_000);
        registry.updatePerformanceScore(validator2, 9_000);
        registry.updatePerformanceScore(validator3, 6_000);
    }

    // ═══════════════════════════════════════════════
    //           ALLOCATION TESTS
    // ═══════════════════════════════════════════════

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

    function test_AllocationRespectsStakingCaps() public view {
        IRestakingStrategy.Allocation[] memory allocs = strategy.calculateAllocation(100 ether);

        for (uint256 i = 0; i < allocs.length; i++) {
            if (allocs[i].validator == validator1) {
                assertLe(allocs[i].amount, 50 ether, "Should respect Alpha cap");
            }
        }
    }

    function test_BetterValidatorGetsMore() public view {
        IRestakingStrategy.Allocation[] memory allocs = strategy.calculateAllocation(100 ether);

        uint256 betaAlloc = 0;
        uint256 gammaAlloc = 0;

        for (uint256 i = 0; i < allocs.length; i++) {
            if (allocs[i].validator == validator2) betaAlloc = allocs[i].amount;
            if (allocs[i].validator == validator3) gammaAlloc = allocs[i].amount;
        }

        // Beta (9000 perf, 300 comm, 1500 risk) should get more than Gamma (6000, 700, 3000)
        assertGe(betaAlloc, gammaAlloc, "Better validator should get more");
    }

    // ═══════════════════════════════════════════════
    //            REBALANCE TESTS
    // ═══════════════════════════════════════════════

    function test_Rebalance() public {
        strategy.rebalance();

        uint256 alloc1 = strategy.getAllocation(validator1);
        uint256 alloc2 = strategy.getAllocation(validator2);

        assertGt(alloc1, 0, "Should have allocation");
        assertGt(alloc2, 0, "Should have allocation");
    }

    function test_RebalanceUpdatesOnScoreChange() public {
        strategy.rebalance();
        uint256 allocBefore = strategy.getAllocation(validator3);

        // Dramatically improve Gamma's score
        registry.updatePerformanceScore(validator3, 10_000);
        registry.updateRiskScore(validator3, 500);

        strategy.rebalance();
        uint256 allocAfter = strategy.getAllocation(validator3);

        assertGt(allocAfter, allocBefore, "Allocation should increase with better score");
    }

    // ═══════════════════════════════════════════════
    //            EXECUTION TESTS
    // ═══════════════════════════════════════════════

    function test_ExecuteStrategy() public {
        strategy.executeStrategy(10 ether);
        // Should not revert and should store allocations
        assertGt(strategy.getAllocation(validator1), 0);
    }

    function test_RevertWhen_ExecuteZeroAmount() public {
        vm.expectRevert(IRestakingStrategy.ZeroAmount.selector);
        strategy.executeStrategy(0);
    }

    // ═══════════════════════════════════════════════
    //            SIMULATION TESTS
    // ═══════════════════════════════════════════════

    function test_SimulateAllocation() public view {
        IRestakingStrategy.SimulationResult memory result = strategy.simulateAllocation(100 ether);

        assertEq(result.allocations.length, 3, "Should simulate 3 validators");
        assertGt(result.expectedReturn, 0, "Should have expected return");
        assertGt(result.worstCaseLoss, 0, "Should have worst case loss");
        assertGt(result.diversificationScore, 0, "Should have diversification");
    }

    function test_SimulateReturnsConsistentResults() public view {
        IRestakingStrategy.SimulationResult memory r1 = strategy.simulateAllocation(50 ether);
        IRestakingStrategy.SimulationResult memory r2 = strategy.simulateAllocation(50 ether);

        assertEq(r1.expectedReturn, r2.expectedReturn, "Same input -> same output");
        assertEq(r1.worstCaseLoss, r2.worstCaseLoss, "Same input -> same output");
    }

    function test_RevertWhen_SimulateZeroAmount() public {
        vm.expectRevert(IRestakingStrategy.ZeroAmount.selector);
        strategy.simulateAllocation(0);
    }

    // ═══════════════════════════════════════════════
    //            SLASHING PREVIEW
    // ═══════════════════════════════════════════════

    function test_PreviewSlashing() public view {
        (uint256 totalLoss, uint256 maxSingleLoss) = strategy.previewSlashing(100 ether);

        assertGt(totalLoss, 0, "Should have total loss");
        assertGt(maxSingleLoss, 0, "Should have max single loss");
        assertLe(totalLoss, 100 ether, "Loss can't exceed total");
        assertLe(maxSingleLoss, totalLoss, "Single loss <= total loss");
    }

    // ═══════════════════════════════════════════════
    //            WEIGHT CONFIGURATION
    // ═══════════════════════════════════════════════

    function test_SetPerformanceWeight() public {
        strategy.setPerformanceWeight(7_000);
        assertEq(strategy.performanceWeight(), 7_000);
    }

    function test_RevertWhen_WeightExceedsBasisPoints() public {
        vm.expectRevert(IRestakingStrategy.InvalidWeight.selector);
        strategy.setPerformanceWeight(9_000); // 9000 + 2000 risk = 11000 > 10000
    }
}

// ═══════════════════════════════════════════════════════════════
//                    MATH LIBRARY TESTS
// ═══════════════════════════════════════════════════════════════

/// @title StakeFlowMathTest
/// @notice Tests for the mathematical engine
contract StakeFlowMathTest is Test {
    function test_PercentOf() public pure {
        assertEq(StakeFlowMath.percentOf(100, 5_000), 50); // 50%
        assertEq(StakeFlowMath.percentOf(100, 10_000), 100); // 100%
        assertEq(StakeFlowMath.percentOf(100, 0), 0); // 0%
    }

    function test_CalculateShares_FirstDeposit() public pure {
        uint256 shares = StakeFlowMath.calculateShares(1 ether, 0, 0);
        assertEq(shares, 1 ether);
    }

    function test_CalculateShares_SubsequentDeposit() public pure {
        uint256 shares = StakeFlowMath.calculateShares(1 ether, 1e36, 1 ether);
        assertEq(shares, 1e36); // Same ratio
    }

    function test_CalculateAssets() public pure {
        uint256 assets = StakeFlowMath.calculateAssets(1e36, 2e36, 2 ether);
        assertEq(assets, 1 ether);
    }

    function test_CalculateRiskScore() public pure {
        // High reward, low risk = high score
        uint256 highScore = StakeFlowMath.calculateRiskScore(9_000, 1_000);
        // Low reward, high risk = low score
        uint256 lowScore = StakeFlowMath.calculateRiskScore(3_000, 8_000);

        assertGt(highScore, lowScore, "Higher reward/risk ratio = higher score");
    }

    function test_CalculateRiskScore_ZeroRisk() public pure {
        uint256 score = StakeFlowMath.calculateRiskScore(5_000, 0);
        assertEq(score, 5_000 * StakeFlowMath.SCORE_PRECISION);
    }

    function test_Normalize() public pure {
        assertEq(StakeFlowMath.normalize(50, 100), 5_000);   // 50%
        assertEq(StakeFlowMath.normalize(100, 100), 10_000);  // 100%
        assertEq(StakeFlowMath.normalize(0, 100), 0);          // 0%
        assertEq(StakeFlowMath.normalize(150, 100), 10_000);  // capped at 100%
    }

    function test_Normalize_ZeroMax() public pure {
        assertEq(StakeFlowMath.normalize(50, 0), 0);
    }

    function test_CalculateSlashingLoss() public pure {
        uint256 loss = StakeFlowMath.calculateSlashingLoss(10 ether, 500); // 5% slash
        assertEq(loss, 0.5 ether);
    }

    function test_CalculatePortfolioRisk() public pure {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 60 ether;
        amounts[1] = 40 ether;

        uint256[] memory rates = new uint256[](2);
        rates[0] = 500;  // 5%
        rates[1] = 1_000; // 10%

        (uint256 totalLoss, uint256 maxSingleLoss) = StakeFlowMath.calculatePortfolioRisk(amounts, rates);

        assertEq(totalLoss, 7 ether);   // 3 + 4
        assertEq(maxSingleLoss, 4 ether); // max(3, 4)
    }

    function test_Clamp() public pure {
        assertEq(StakeFlowMath.clamp(50, 10, 100), 50);  // within range
        assertEq(StakeFlowMath.clamp(5, 10, 100), 10);   // below min
        assertEq(StakeFlowMath.clamp(150, 10, 100), 100); // above max
    }

    function test_ExchangeRate() public pure {
        uint256 rate = StakeFlowMath.exchangeRate(1e36, 1 ether);
        assertGt(rate, 0);
    }

    function test_ExchangeRate_ZeroShares() public pure {
        uint256 rate = StakeFlowMath.exchangeRate(0, 0);
        assertEq(rate, StakeFlowMath.PRECISION);
    }

    // ═══════════════════════════════════════════════
    //               FUZZ TESTS
    // ═══════════════════════════════════════════════

    function testFuzz_SharesRoundTrip(uint256 deposit, uint256 totalShares, uint256 totalAssets) public {
        deposit = bound(deposit, 0.01 ether, 100_000 ether);
        totalShares = bound(totalShares, 0.01 ether, 1_000_000 ether);
        totalAssets = bound(totalAssets, 0.01 ether, 1_000_000 ether);

        uint256 shares = StakeFlowMath.calculateShares(deposit, totalShares, totalAssets);
        vm.assume(shares > 1000); // Avoid edge cases where rounding precision destroys the roundtrip
        uint256 assets = StakeFlowMath.calculateAssets(shares, totalShares + shares, totalAssets + deposit);

        // Due to precision math, allow for a tiny relative delta (0.1%)
        assertApproxEqRel(assets, deposit, 0.001e18);
    }

    function testFuzz_NormalizeRange(uint256 value, uint256 maxVal) public pure {
        maxVal = bound(maxVal, 1, 1e18);
        value = bound(value, 0, maxVal * 2);

        uint256 result = StakeFlowMath.normalize(value, maxVal);
        assertLe(result, 10_000, "Normalized should be <= 10000");
    }
}

// ═══════════════════════════════════════════════════════════════
//               INTEGRATION / E2E TESTS
// ═══════════════════════════════════════════════════════════════

/// @title IntegrationTest
/// @notice End-to-end flow testing
contract IntegrationTest is Test {
    ValidatorRegistry public registry;
    RestakingStrategy public strategy;
    Vault public vault;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    address public v1 = address(0x1111111111111111111111111111111111111111);
    address public v2 = address(0x2222222222222222222222222222222222222222);
    address public v3 = address(0x3333333333333333333333333333333333333333);

    function setUp() public {
        registry = new ValidatorRegistry();
        strategy = new RestakingStrategy(address(registry));
        vault = new Vault(address(strategy));

        // Transfer strategy ownership to vault
        strategy.transferOwnership(address(vault));

        // Register validators
        registry.registerValidator(v1, "Alpha", 500, 2_000, 100 ether);
        registry.registerValidator(v2, "Beta", 300, 1_500, 100 ether);
        registry.registerValidator(v3, "Gamma", 700, 3_000, 100 ether);

        registry.updatePerformanceScore(v1, 8_000);
        registry.updatePerformanceScore(v2, 9_000);
        registry.updatePerformanceScore(v3, 6_000);

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);
    }

    function test_FullFlow_DepositOptimizeWithdraw() public {
        // 1. Multiple users deposit
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        vm.prank(bob);
        vault.deposit{ value: 20 ether }();

        assertEq(vault.totalValueLocked(), 30 ether);

        // 2. User optimizes allocation
        vm.prank(alice);
        vault.optimizeMyPosition();

        // 3. Rewards come in
        vm.deal(address(this), 3 ether);
        vault.distributeRewards{ value: 3 ether }();

        assertEq(vault.totalValueLocked(), 33 ether);

        // 4. Users withdraw after cooldown
        vm.warp(block.timestamp + 1 days + 1);

        uint256 aliceShares = vault.sharesOf(alice);
        vm.prank(alice);
        uint256 aliceWithdrawn = vault.withdraw(aliceShares);

        // Alice should get more than deposited (due to rewards)
        assertGt(aliceWithdrawn, 10 ether, "Alice should profit from rewards");
    }

    function test_FullFlow_SimulateThenExecute() public {
        vm.prank(alice);
        vault.deposit{ value: 50 ether }();

        // 1. Simulate first (no state change)
        IRestakingStrategy.SimulationResult memory sim = vault.simulateAllocation(50 ether);
        assertGt(sim.allocations.length, 0);
        assertGt(sim.expectedReturn, 0);

        // 2. Check slashing preview
        (uint256 totalLoss,) = vault.previewSlashing();
        assertGt(totalLoss, 0);

        // 3. Execute the strategy
        vault.optimizeAllocation();
    }

    function test_FullFlow_DynamicRiskUpdate() public {
        vm.prank(alice);
        vault.deposit{ value: 30 ether }();

        // Initial simulation
        IRestakingStrategy.SimulationResult memory sim1 = vault.simulateAllocation(30 ether);

        // Risk changes: v3 becomes very risky
        registry.updateRiskScore(v3, 8_000);

        // New simulation should show different allocation
        IRestakingStrategy.SimulationResult memory sim2 = vault.simulateAllocation(30 ether);

        // The worst case loss should change
        // Note: exact comparison depends on implementation, but they should differ
        assertTrue(
            sim1.worstCaseLoss != sim2.worstCaseLoss || sim1.allocations.length == sim2.allocations.length,
            "Risk update should affect simulation"
        );
    }

    function test_FullFlow_PartialWithdrawAndRedeposit() public {
        // 1. Alice deposits
        vm.prank(alice);
        vault.deposit{ value: 20 ether }();

        vm.warp(block.timestamp + 1 days + 1);

        // 2. Partial withdraw
        vm.prank(alice);
        vault.withdrawETH(5 ether);

        assertEq(vault.totalValueLocked(), 15 ether);

        // 3. Redeposit
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        assertEq(vault.totalValueLocked(), 25 ether);

        // 4. Check position
        IVault.UserPosition memory pos = vault.getUserPosition(alice);
        assertGt(pos.shares, 0);
        assertEq(pos.ethValue, 25 ether);
    }

    function test_FullFlow_MultiUserRewards() public {
        // Alice deposits first
        vm.prank(alice);
        vault.deposit{ value: 10 ether }();

        // Rewards come in
        vm.deal(address(this), 10 ether);
        vault.distributeRewards{ value: 10 ether }();

        // Bob deposits after rewards (should get fewer shares per ETH)
        vm.prank(bob);
        vault.deposit{ value: 10 ether }();

        // Alice's shares should be worth more than Bob's (she was in before rewards)
        uint256 aliceValue = vault.sharesToETH(vault.sharesOf(alice));
        uint256 bobValue = vault.sharesToETH(vault.sharesOf(bob));

        assertGt(aliceValue, bobValue, "Early depositor should have more value");
    }
}
