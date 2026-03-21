// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StakeFlowMath
/// @author StakeFlow Team
/// @notice Advanced mathematical engine for StakeFlow protocol
/// @dev Pure library — no storage, fully reusable & gas-efficient
library StakeFlowMath {
    // ═══════════════════════════════════════════════════════
    //                      CONSTANTS
    // ═══════════════════════════════════════════════════════

    uint256 internal constant BASIS_POINTS = 10_000;
    uint256 internal constant PRECISION = 1e18;
    uint256 internal constant SCORE_PRECISION = 1e6;

    // ═══════════════════════════════════════════════════════
    //                     CORE MATH
    // ═══════════════════════════════════════════════════════

    /// @notice Calculate percentage of an amount in basis points
    /// @param amount The base amount
    /// @param bps The percentage in basis points (10000 = 100%)
    /// @return result The calculated amount
    function percentOf(uint256 amount, uint256 bps) internal pure returns (uint256 result) {
        result = (amount * bps) / BASIS_POINTS;
    }

    /// @notice Calculate share amount for a deposit (ERC4626-style)
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
            // First deposit: 1:1 ratio
            shares = depositAmount;
        } else {
            shares = (depositAmount * totalShares) / totalAssets;
        }
    }

    /// @notice Calculate asset amount for a share redemption
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

    // ═══════════════════════════════════════════════════════
    //                  SCORING ENGINE
    // ═══════════════════════════════════════════════════════

    /// @notice Calculate weighted score for validator ranking
    /// @dev score = (performance * perfWeight + invertedCommission * commWeight) / BASIS_POINTS
    /// @param performance Performance score (0-10000)
    /// @param commission Commission in basis points
    /// @param performanceWeight Weight for performance component (basis points)
    /// @return score The weighted composite score
    function weightedScore(
        uint256 performance,
        uint256 commission,
        uint256 performanceWeight
    ) internal pure returns (uint256 score) {
        uint256 commissionWeight = BASIS_POINTS - performanceWeight;
        uint256 invertedCommission = BASIS_POINTS - commission;
        score = (performance * performanceWeight + invertedCommission * commissionWeight) / BASIS_POINTS;
    }

    /// @notice Calculate risk-adjusted score: reward / risk
    /// @dev Uses SCORE_PRECISION to avoid truncation. Returns 0 if risk is 0.
    /// @param reward The reward value (0-10000)
    /// @param risk The risk value (0-10000)
    /// @return score Risk-adjusted score scaled by SCORE_PRECISION
    function calculateRiskScore(uint256 reward, uint256 risk) internal pure returns (uint256 score) {
        if (risk == 0) return reward * SCORE_PRECISION; // Perfect score if no risk
        score = (reward * SCORE_PRECISION) / risk;
    }

    /// @notice Normalize a value to the range [0, BASIS_POINTS]
    /// @param value The value to normalize
    /// @param maxValue The maximum possible value
    /// @return normalized Value scaled to [0, 10000]
    function normalize(uint256 value, uint256 maxValue) internal pure returns (uint256 normalized) {
        if (maxValue == 0) return 0;
        if (value >= maxValue) return BASIS_POINTS;
        normalized = (value * BASIS_POINTS) / maxValue;
    }

    // ═══════════════════════════════════════════════════════
    //               SLASHING SIMULATION
    // ═══════════════════════════════════════════════════════

    /// @notice Simulate worst-case slashing loss for a given allocation
    /// @param stakedAmount The amount staked with a validator
    /// @param slashingRateBps Slashing penalty rate in basis points (e.g., 500 = 5%)
    /// @return loss The potential loss amount
    function calculateSlashingLoss(
        uint256 stakedAmount,
        uint256 slashingRateBps
    ) internal pure returns (uint256 loss) {
        loss = percentOf(stakedAmount, slashingRateBps);
    }

    /// @notice Calculate total portfolio slashing exposure
    /// @param amounts Array of amounts staked per validator
    /// @param slashingRates Array of slashing rates per validator (basis points)
    /// @return totalLoss Total worst-case loss
    /// @return maxSingleLoss Maximum loss from a single validator
    function calculatePortfolioRisk(
        uint256[] memory amounts,
        uint256[] memory slashingRates
    ) internal pure returns (uint256 totalLoss, uint256 maxSingleLoss) {
        require(amounts.length == slashingRates.length, "Length mismatch");

        for (uint256 i = 0; i < amounts.length; i++) {
            uint256 loss = calculateSlashingLoss(amounts[i], slashingRates[i]);
            totalLoss += loss;
            if (loss > maxSingleLoss) {
                maxSingleLoss = loss;
            }
        }
    }

    // ═══════════════════════════════════════════════════════
    //               ALLOCATION HELPERS
    // ═══════════════════════════════════════════════════════

    /// @notice Clamp a value between a minimum and maximum
    /// @param value The value to clamp
    /// @param minVal Minimum bound
    /// @param maxVal Maximum bound
    /// @return clamped The clamped value
    function clamp(uint256 value, uint256 minVal, uint256 maxVal) internal pure returns (uint256 clamped) {
        if (value < minVal) return minVal;
        if (value > maxVal) return maxVal;
        return value;
    }

    /// @notice Calculate the exchange rate (assets per share, scaled by PRECISION)
    /// @param totalShares Current total shares
    /// @param totalAssets Current total assets
    /// @return rate The exchange rate
    function exchangeRate(uint256 totalShares, uint256 totalAssets) internal pure returns (uint256 rate) {
        if (totalShares == 0) return PRECISION;
        rate = (totalAssets * PRECISION) / totalShares;
    }
}
