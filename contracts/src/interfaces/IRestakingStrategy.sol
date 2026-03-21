// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRestakingStrategy {
    // ═══════════════════════════════════════════════════════
    //                        STRUCTS
    // ═══════════════════════════════════════════════════════

    struct Allocation {
        address validator;
        uint256 percentage; // basis points (10000 = 100%)
        uint256 amount;
    }

    // ═══════════════════════════════════════════════════════
    //                        EVENTS
    // ═══════════════════════════════════════════════════════

    event StrategyExecuted(uint256 totalAmount, uint256 validatorCount, uint256 timestamp);
    event RebalanceTriggered(address indexed triggeredBy, uint256 timestamp);

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

    /// @notice Trigger a rebalance of existing allocations
    function rebalance() external;

    /// @notice Get current allocation for a validator
    function getAllocation(address validator) external view returns (uint256);
}
