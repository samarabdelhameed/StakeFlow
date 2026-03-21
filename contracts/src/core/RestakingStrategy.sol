// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IRestakingStrategy } from "../interfaces/IRestakingStrategy.sol";
import { IValidatorRegistry } from "../interfaces/IValidatorRegistry.sol";
import { StakeFlowMath } from "../libraries/StakeFlowMath.sol";

/// @title RestakingStrategy
/// @author StakeFlow Team
/// @notice Intelligent allocation engine with risk-adjusted scoring,
///         simulation mode, slashing preview, and dynamic rebalancing
contract RestakingStrategy is IRestakingStrategy, Ownable, ReentrancyGuard {
    using StakeFlowMath for uint256;

    // ═══════════════════════════════════════════════════════
    //                        STORAGE
    // ═══════════════════════════════════════════════════════

    IValidatorRegistry public validatorRegistry;
    mapping(address => uint256) private _allocations; // global (for vault total)
    
    // WOW Factor: Track user portfolio allocations on-chain
    mapping(address => mapping(address => uint256)) public userAllocations;

    uint256 public performanceWeight = 6_000; // 60% weight for performance
    uint256 public riskWeight = 2_000;        // 20% weight for risk
    // Remaining 20% goes to commission consideration

    uint256 public constant MIN_ALLOCATION = 500;    // 5% minimum per validator
    uint256 public constant MAX_ALLOCATION = 4_000;   // 40% maximum per validator
    uint256 public constant DEFAULT_SLASHING_RATE = 500; // 5% default slashing penalty

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
        if (totalAmount == 0) revert ZeroAmount();

        Allocation[] memory allocs = _calculateOptimalAllocation(totalAmount);
        if (allocs.length == 0) revert NoValidators();

        // Store allocations on-chain
        for (uint256 i = 0; i < allocs.length; i++) {
            _allocations[allocs[i].validator] = allocs[i].percentage;
        }

        emit StrategyExecuted(totalAmount, allocs.length, block.timestamp);
    }

    /// @inheritdoc IRestakingStrategy
    function executeStrategyFor(address user, uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0) revert ZeroAmount();

        Allocation[] memory allocs = _calculateOptimalAllocation(amount);
        if (allocs.length == 0) revert NoValidators();

        for (uint256 i = 0; i < allocs.length; i++) {
            userAllocations[user][allocs[i].validator] = allocs[i].amount;
        }

        // We emit the global executed event for compatibility, but the Vault emits the detailed one
    }

    /// @inheritdoc IRestakingStrategy
    function rebalance() external onlyOwner nonReentrant {
        IValidatorRegistry.ValidatorInfo[] memory validators = validatorRegistry.getActiveValidators();
        if (validators.length == 0) revert NoValidators();

        // Recalculate allocations based on current performance & risk
        uint256 totalScore = 0;
        uint256[] memory scores = new uint256[](validators.length);

        for (uint256 i = 0; i < validators.length; i++) {
            scores[i] = _compositeScore(validators[i]);
            totalScore += scores[i];
        }

        if (totalScore == 0) revert NoValidators();

        for (uint256 i = 0; i < validators.length; i++) {
            uint256 allocation = (scores[i] * StakeFlowMath.BASIS_POINTS) / totalScore;
            allocation = StakeFlowMath.clamp(allocation, MIN_ALLOCATION, MAX_ALLOCATION);
            _allocations[validators[i].validatorAddress] = allocation;
        }

        emit RebalanceTriggered(msg.sender, block.timestamp);
    }

    /// @notice Update the performance weight
    /// @param newWeight New weight in basis points (max 10000 - riskWeight)
    function setPerformanceWeight(uint256 newWeight) external onlyOwner {
        if (newWeight + riskWeight > StakeFlowMath.BASIS_POINTS) revert InvalidWeight();
        uint256 oldWeight = performanceWeight;
        performanceWeight = newWeight;
        emit PerformanceWeightUpdated(oldWeight, newWeight);
    }

    /// @notice Update the risk weight
    /// @param newWeight New weight in basis points (max 10000 - performanceWeight)
    function setRiskWeight(uint256 newWeight) external onlyOwner {
        if (newWeight + performanceWeight > StakeFlowMath.BASIS_POINTS) revert InvalidWeight();
        riskWeight = newWeight;
    }

    /// @notice Update the validator registry address
    function setRegistry(address _registry) external onlyOwner {
        require(_registry != address(0), "Invalid registry");
        validatorRegistry = IValidatorRegistry(_registry);
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

    /// @inheritdoc IRestakingStrategy
    function simulateAllocation(
        uint256 amount
    ) external view returns (SimulationResult memory result) {
        if (amount == 0) revert ZeroAmount();

        Allocation[] memory allocs = _calculateOptimalAllocation(amount);

        // Calculate expected return
        IValidatorRegistry.ValidatorInfo[] memory validators = validatorRegistry.getActiveValidators();
        uint256 weightedReturn = 0;

        for (uint256 i = 0; i < allocs.length; i++) {
            // Find the matching validator for reward estimate
            for (uint256 j = 0; j < validators.length; j++) {
                if (validators[j].validatorAddress == allocs[i].validator) {
                    // expectedReturn ≈ performance * allocation weight
                    weightedReturn += (validators[j].performanceScore * allocs[i].percentage) / StakeFlowMath.BASIS_POINTS;
                    break;
                }
            }
        }

        // Calculate slashing risk
        (uint256 totalLoss, uint256 maxSingleLoss) = _calculateSlashingRisk(allocs, validators);

        // Diversification score: inverse of concentration
        uint256 diversification = _calculateDiversification(allocs);

        result = SimulationResult({
            allocations: allocs,
            expectedReturn: weightedReturn,
            worstCaseLoss: totalLoss,
            diversificationScore: diversification
        });
    }

    /// @inheritdoc IRestakingStrategy
    function previewSlashing(
        uint256 totalStaked
    ) external view returns (uint256 totalLoss, uint256 maxSingleLoss) {
        Allocation[] memory allocs = _calculateOptimalAllocation(totalStaked);
        IValidatorRegistry.ValidatorInfo[] memory validators = validatorRegistry.getActiveValidators();
        return _calculateSlashingRisk(allocs, validators);
    }

    // ═══════════════════════════════════════════════════════
    //                   INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @dev Calculate the composite score for a validator
    ///      score = perfWeight * performance + (commWeight * invertedCommission) + riskWeight * invertedRisk
    function _compositeScore(
        IValidatorRegistry.ValidatorInfo memory v
    ) internal view returns (uint256 score) {
        uint256 commWeight = StakeFlowMath.BASIS_POINTS - performanceWeight - riskWeight;

        uint256 invertedCommission = StakeFlowMath.BASIS_POINTS - v.commission;
        uint256 invertedRisk = StakeFlowMath.BASIS_POINTS - v.riskScore;

        score = (
            v.performanceScore * performanceWeight +
            invertedCommission * commWeight +
            invertedRisk * riskWeight
        ) / StakeFlowMath.BASIS_POINTS;
    }

    /// @dev Core allocation algorithm with cap enforcement
    function _calculateOptimalAllocation(
        uint256 totalAmount
    ) internal view returns (Allocation[] memory) {
        IValidatorRegistry.ValidatorInfo[] memory validators = validatorRegistry.getActiveValidators();
        uint256 count = validators.length;

        if (count == 0) return new Allocation[](0);

        // ── Step 1: Calculate composite scores ──
        uint256 totalScore = 0;
        uint256[] memory scores = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            scores[i] = _compositeScore(validators[i]);
            totalScore += scores[i];
        }

        if (totalScore == 0) return new Allocation[](0);

        // ── Step 2: Calculate raw allocations ──
        Allocation[] memory allocations = new Allocation[](count);
        uint256 allocated = 0;

        for (uint256 i = 0; i < count; i++) {
            uint256 pct = (scores[i] * StakeFlowMath.BASIS_POINTS) / totalScore;

            // Clamp to min/max bounds
            pct = StakeFlowMath.clamp(pct, MIN_ALLOCATION, MAX_ALLOCATION);

            uint256 amount = StakeFlowMath.percentOf(totalAmount, pct);

            // ── Step 3: Enforce staking cap ──
            if (validators[i].stakingCap > 0 && amount > validators[i].stakingCap) {
                amount = validators[i].stakingCap;
                pct = (amount * StakeFlowMath.BASIS_POINTS) / totalAmount;
            }

            allocations[i] = Allocation({
                validator: validators[i].validatorAddress,
                percentage: pct,
                amount: amount
            });
            allocated += amount;
        }

        // ── Step 4: Distribute remainder to top performer ──
        if (allocated < totalAmount && count > 0) {
            // Find the best scored validator that hasn't hit its cap
            uint256 bestIdx = 0;
            uint256 bestScore = 0;
            for (uint256 i = 0; i < count; i++) {
                bool underCap = validators[i].stakingCap == 0 ||
                    allocations[i].amount < validators[i].stakingCap;
                if (scores[i] > bestScore && underCap) {
                    bestScore = scores[i];
                    bestIdx = i;
                }
            }
            allocations[bestIdx].amount += (totalAmount - allocated);
        }

        return allocations;
    }

    /// @dev Calculate slashing risk across all allocations
    function _calculateSlashingRisk(
        Allocation[] memory allocs,
        IValidatorRegistry.ValidatorInfo[] memory validators
    ) internal pure returns (uint256 totalLoss, uint256 maxSingleLoss) {
        for (uint256 i = 0; i < allocs.length; i++) {
            uint256 slashRate = DEFAULT_SLASHING_RATE;

            // Find the matching validator's risk score for slashing rate
            for (uint256 j = 0; j < validators.length; j++) {
                if (validators[j].validatorAddress == allocs[i].validator) {
                    // Use risk score as slashing rate proxy (higher risk = higher potential slash)
                    slashRate = validators[j].riskScore > 0 ? validators[j].riskScore : DEFAULT_SLASHING_RATE;
                    break;
                }
            }

            uint256 loss = StakeFlowMath.calculateSlashingLoss(allocs[i].amount, slashRate);
            totalLoss += loss;
            if (loss > maxSingleLoss) {
                maxSingleLoss = loss;
            }
        }
    }

    /// @dev Calculate diversification score (higher = better diversified)
    ///      Based on Herfindahl-Hirschman Index (inverse)
    function _calculateDiversification(
        Allocation[] memory allocs
    ) internal pure returns (uint256 score) {
        if (allocs.length <= 1) return 0;

        uint256 sumSquared = 0;
        for (uint256 i = 0; i < allocs.length; i++) {
            sumSquared += (allocs[i].percentage * allocs[i].percentage);
        }

        // Perfect diversification: each has equal share
        // HHI = sum of squared market shares
        // We invert it so higher = better
        // Max HHI = 10000^2 = 1e8 (one validator gets 100%)
        // Min HHI = (10000/n)^2 * n (equally distributed)
        uint256 maxHHI = StakeFlowMath.BASIS_POINTS * StakeFlowMath.BASIS_POINTS;
        if (sumSquared >= maxHHI) return 0;

        score = ((maxHHI - sumSquared) * StakeFlowMath.BASIS_POINTS) / maxHHI;
    }
}
