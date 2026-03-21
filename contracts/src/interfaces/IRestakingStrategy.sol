// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IRestakingStrategy
/// @notice Interface for the intelligent allocation engine
interface IRestakingStrategy {
    // ═══════════════════════════════════════════════════════
    //                        STRUCTS
    // ═══════════════════════════════════════════════════════

    struct Allocation {
        address validator;
        uint256 percentage; // basis points (10000 = 100%)
        uint256 amount;
    }

    struct SimulationResult {
        Allocation[] allocations;
        uint256 expectedReturn;       // estimated annual return in bps
        uint256 worstCaseLoss;        // max slashing loss
        uint256 diversificationScore; // how well diversified (0-10000)
    }

    // ═══════════════════════════════════════════════════════
    //                        EVENTS
    // ═══════════════════════════════════════════════════════

    event StrategyExecuted(uint256 totalAmount, uint256 validatorCount, uint256 timestamp);
    event RebalanceTriggered(address indexed triggeredBy, uint256 timestamp);
    event AllocationSimulated(address indexed user, uint256 amount, uint256 timestamp);
    event PerformanceWeightUpdated(uint256 oldWeight, uint256 newWeight);

    // ═══════════════════════════════════════════════════════
    //                        ERRORS
    // ═══════════════════════════════════════════════════════

    error ZeroAmount();
    error NoValidators();
    error InvalidWeight();

    // ═══════════════════════════════════════════════════════
    //                     CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @notice Calculate optimal allocation across validators
    /// @param totalAmount The total amount to allocate
    /// @return allocations Array of validator allocations
    function calculateAllocation(uint256 totalAmount) external view returns (Allocation[] memory allocations);

    /// @notice Execute the restaking strategy
    /// @param totalAmount The total amount to restake
    function executeStrategy(uint256 totalAmount) external;

    /// @notice Execute allocation on behalf of a specific user
    function executeStrategyFor(address user, uint256 amount) external;
    
    /// @notice Retrieve specific user allocation amount for a validator
    function userAllocations(address user, address validator) external view returns(uint256);
    function rebalance() external;

    /// @notice Get current allocation for a validator (in basis points)
    function getAllocation(address validator) external view returns (uint256);

    /// @notice Simulate allocation before execution (no state change)
    /// @param amount The amount to simulate with
    /// @return result Full simulation with risk analysis
    function simulateAllocation(uint256 amount) external view returns (SimulationResult memory result);

    /// @notice Preview slashing impact for current allocations
    /// @param totalStaked Total ETH at stake
    /// @return totalLoss Total worst-case loss
    /// @return maxSingleLoss Biggest single-validator loss
    function previewSlashing(
        uint256 totalStaked
    ) external view returns (uint256 totalLoss, uint256 maxSingleLoss);
}
