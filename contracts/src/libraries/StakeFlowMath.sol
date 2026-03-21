// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StakeFlowMath
/// @notice Math utilities for StakeFlow protocol
library StakeFlowMath {
    uint256 internal constant BASIS_POINTS = 10_000;
    uint256 internal constant PRECISION = 1e18;

    /// @notice Calculate percentage in basis points
    /// @param amount The base amount
    /// @param bps The percentage in basis points
    /// @return result The calculated amount
    function percentOf(uint256 amount, uint256 bps) internal pure returns (uint256 result) {
        result = (amount * bps) / BASIS_POINTS;
    }

    /// @notice Calculate share amount for a deposit
    /// @param depositAmount Amount being deposited
    /// @param totalShares Current total shares
    /// @param totalAssets Current total assets
    /// @return shares The shares to mint
    function calculateShares(
        uint256 depositAmount,
        uint256 totalShares,
        uint256 totalAssets
    ) internal pure returns (uint256 shares) {
        if (totalShares == 0 || totalAssets == 0) {
            shares = depositAmount * PRECISION;
        } else {
            shares = (depositAmount * totalShares) / totalAssets;
        }
    }

    /// @notice Calculate asset amount for a withdrawal
    /// @param shareAmount Shares being redeemed
    /// @param totalShares Current total shares
    /// @param totalAssets Current total assets
    /// @return assets The assets to return
    function calculateAssets(
        uint256 shareAmount,
        uint256 totalShares,
        uint256 totalAssets
    ) internal pure returns (uint256 assets) {
        if (totalShares == 0) {
            assets = 0;
        } else {
            assets = (shareAmount * totalAssets) / totalShares;
        }
    }

    /// @notice Calculate weighted score for validator selection
    /// @param performance Performance score (0-10000)
    /// @param commission Commission in basis points
    /// @param performanceWeight Weight for performance (basis points)
    /// @return score The weighted score
    function weightedScore(
        uint256 performance,
        uint256 commission,
        uint256 performanceWeight
    ) internal pure returns (uint256 score) {
        uint256 commissionWeight = BASIS_POINTS - performanceWeight;
        uint256 invertedCommission = BASIS_POINTS - commission;
        score = (performance * performanceWeight + invertedCommission * commissionWeight) / BASIS_POINTS;
    }
}
