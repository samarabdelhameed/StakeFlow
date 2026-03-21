// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IRestakingStrategy } from "../interfaces/IRestakingStrategy.sol";
import { IValidatorRegistry } from "../interfaces/IValidatorRegistry.sol";
import { StakeFlowMath } from "../libraries/StakeFlowMath.sol";

/// @title RestakingStrategy
/// @author StakeFlow Team
/// @notice Intelligent allocation strategy for distributing stake across validators
contract RestakingStrategy is IRestakingStrategy, Ownable, ReentrancyGuard {
    using StakeFlowMath for uint256;

    // ═══════════════════════════════════════════════════════
    //                        STORAGE
    // ═══════════════════════════════════════════════════════

    IValidatorRegistry public validatorRegistry;
    mapping(address => uint256) private _allocations; // validator → percentage in basis points

    uint256 public performanceWeight = 6_000; // 60% weight for performance
    uint256 public constant MIN_ALLOCATION = 500;   // 5% minimum per validator
    uint256 public constant MAX_ALLOCATION = 4_000;  // 40% maximum per validator

    // ═══════════════════════════════════════════════════════
    //                      CONSTRUCTOR
    // ═══════════════════════════════════════════════════════

    constructor(address _registry) Ownable(msg.sender) {
        require(_registry != address(0), "Invalid registry");
        validatorRegistry = IValidatorRegistry(_registry);
    }

    // ═══════════════════════════════════════════════════════
    //                     WRITE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @inheritdoc IRestakingStrategy
    function executeStrategy(uint256 totalAmount) external onlyOwner nonReentrant {
        require(totalAmount > 0, "Zero amount");

        Allocation[] memory allocs = _calculateOptimalAllocation(totalAmount);
        require(allocs.length > 0, "No validators");

        emit StrategyExecuted(totalAmount, allocs.length, block.timestamp);
    }

    /// @inheritdoc IRestakingStrategy
    function rebalance() external onlyOwner nonReentrant {
        IValidatorRegistry.ValidatorInfo[] memory validators = validatorRegistry.getActiveValidators();
        require(validators.length > 0, "No validators");

        // Recalculate allocations based on current performance
        uint256 totalScore = 0;
        uint256[] memory scores = new uint256[](validators.length);

        for (uint256 i = 0; i < validators.length; i++) {
            scores[i] = StakeFlowMath.weightedScore(
                validators[i].performanceScore,
                validators[i].commission,
                performanceWeight
            );
            totalScore += scores[i];
        }

        for (uint256 i = 0; i < validators.length; i++) {
            uint256 allocation = (scores[i] * StakeFlowMath.BASIS_POINTS) / totalScore;
            // Clamp to min/max bounds
            if (allocation < MIN_ALLOCATION) allocation = MIN_ALLOCATION;
            if (allocation > MAX_ALLOCATION) allocation = MAX_ALLOCATION;
            _allocations[validators[i].validatorAddress] = allocation;
        }

        emit RebalanceTriggered(msg.sender, block.timestamp);
    }

    /// @notice Update the performance weight
    /// @param newWeight New weight in basis points
    function setPerformanceWeight(uint256 newWeight) external onlyOwner {
        require(newWeight <= StakeFlowMath.BASIS_POINTS, "Invalid weight");
        performanceWeight = newWeight;
    }

    // ═══════════════════════════════════════════════════════
    //                     READ FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @inheritdoc IRestakingStrategy
    function calculateAllocation(
        uint256 totalAmount
    ) external view returns (Allocation[] memory) {
        return _calculateOptimalAllocation(totalAmount);
    }

    /// @inheritdoc IRestakingStrategy
    function getAllocation(address validator) external view returns (uint256) {
        return _allocations[validator];
    }

    // ═══════════════════════════════════════════════════════
    //                   INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════

    function _calculateOptimalAllocation(
        uint256 totalAmount
    ) internal view returns (Allocation[] memory) {
        IValidatorRegistry.ValidatorInfo[] memory validators = validatorRegistry.getActiveValidators();
        uint256 count = validators.length;

        if (count == 0) return new Allocation[](0);

        // Calculate weighted scores
        uint256 totalScore = 0;
        uint256[] memory scores = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            scores[i] = StakeFlowMath.weightedScore(
                validators[i].performanceScore,
                validators[i].commission,
                performanceWeight
            );
            totalScore += scores[i];
        }

        // Build allocations
        Allocation[] memory allocations = new Allocation[](count);
        uint256 allocated = 0;

        for (uint256 i = 0; i < count; i++) {
            uint256 pct = (scores[i] * StakeFlowMath.BASIS_POINTS) / totalScore;

            // Clamp to bounds
            if (pct < MIN_ALLOCATION) pct = MIN_ALLOCATION;
            if (pct > MAX_ALLOCATION) pct = MAX_ALLOCATION;

            uint256 amount = StakeFlowMath.percentOf(totalAmount, pct);

            allocations[i] = Allocation({
                validator: validators[i].validatorAddress,
                percentage: pct,
                amount: amount
            });
            allocated += amount;
        }

        // Assign remainder to top performer
        if (allocated < totalAmount && count > 0) {
            allocations[0].amount += (totalAmount - allocated);
        }

        return allocations;
    }
}
