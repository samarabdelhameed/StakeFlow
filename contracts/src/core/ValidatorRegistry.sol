// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IValidatorRegistry } from "../interfaces/IValidatorRegistry.sol";

/// @title ValidatorRegistry
/// @author StakeFlow Team
/// @notice Production-grade validator data layer with role-based access,
///         scoring history, risk tracking, and staking caps
contract ValidatorRegistry is IValidatorRegistry, Ownable, ReentrancyGuard {
    // ═══════════════════════════════════════════════════════
    //                        STORAGE
    // ═══════════════════════════════════════════════════════

    mapping(address => ValidatorInfo) private _validators;
    address[] private _validatorList;
    uint256 private _activeCount;

    /// @notice Role-based access: admins can update scores
    mapping(address => bool) public isAdmin;

    /// @notice Score history per validator for trend analysis
    mapping(address => ScoreSnapshot[]) private _scoreHistory;

    uint256 public constant MAX_COMMISSION = 3_000;   // 30% max
    uint256 public constant MAX_SCORE = 10_000;
    uint256 public constant MAX_HISTORY_LENGTH = 50;  // keep last 50 snapshots

    // ═══════════════════════════════════════════════════════
    //                       MODIFIERS
    // ═══════════════════════════════════════════════════════

    modifier onlyAdminOrOwner() {
        if (msg.sender != owner() && !isAdmin[msg.sender]) {
            revert Unauthorized();
        }
        _;
    }

    modifier validatorExists(address validator) {
        if (_validators[validator].registeredAt == 0) {
            revert ValidatorNotFound();
        }
        _;
    }

    modifier validatorActive(address validator) {
        if (!_validators[validator].isActive) {
            revert ValidatorNotActive();
        }
        _;
    }

    // ═══════════════════════════════════════════════════════
    //                      CONSTRUCTOR
    // ═══════════════════════════════════════════════════════

    constructor() Ownable(msg.sender) {}

    // ═══════════════════════════════════════════════════════
    //                   ADMIN MANAGEMENT
    // ═══════════════════════════════════════════════════════

    /// @notice Grant admin role to an address
    function grantAdmin(address admin) external onlyOwner {
        if (admin == address(0)) revert InvalidAddress();
        isAdmin[admin] = true;
        emit AdminGranted(admin);
    }

    /// @notice Revoke admin role from an address
    function revokeAdmin(address admin) external onlyOwner {
        isAdmin[admin] = false;
        emit AdminRevoked(admin);
    }

    // ═══════════════════════════════════════════════════════
    //                     WRITE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @inheritdoc IValidatorRegistry
    function registerValidator(
        address validator,
        string calldata name,
        uint256 commission,
        uint256 riskScore,
        uint256 stakingCap
    ) external onlyAdminOrOwner {
        if (validator == address(0)) revert InvalidAddress();
        if (_validators[validator].registeredAt != 0) revert ValidatorAlreadyRegistered();
        if (commission > MAX_COMMISSION) revert CommissionTooHigh();
        if (bytes(name).length == 0) revert InvalidName();
        if (riskScore > MAX_SCORE) revert InvalidScore();

        _validators[validator] = ValidatorInfo({
            validatorAddress: validator,
            name: name,
            totalStaked: 0,
            commission: commission,
            performanceScore: 5_000, // Start at 50%
            riskScore: riskScore,
            stakingCap: stakingCap,
            isActive: true,
            registeredAt: block.timestamp,
            lastUpdated: block.timestamp
        });

        _validatorList.push(validator);
        _activeCount++;

        // Record initial score snapshot
        _recordSnapshot(validator, 5_000, riskScore);

        emit ValidatorRegistered(validator, name, commission, stakingCap);
    }

    /// @inheritdoc IValidatorRegistry
    function deactivateValidator(
        address validator
    ) external onlyAdminOrOwner validatorActive(validator) {
        _validators[validator].isActive = false;
        _validators[validator].lastUpdated = block.timestamp;
        _activeCount--;

        emit ValidatorDeactivated(validator);
    }

    /// @inheritdoc IValidatorRegistry
    function reactivateValidator(
        address validator
    ) external onlyAdminOrOwner validatorExists(validator) {
        if (_validators[validator].isActive) revert ValidatorAlreadyRegistered();

        _validators[validator].isActive = true;
        _validators[validator].lastUpdated = block.timestamp;
        _activeCount++;

        emit ValidatorReactivated(validator);
    }

    /// @inheritdoc IValidatorRegistry
    function updatePerformanceScore(
        address validator,
        uint256 newScore
    ) external onlyAdminOrOwner validatorActive(validator) {
        if (newScore > MAX_SCORE) revert InvalidScore();

        uint256 oldScore = _validators[validator].performanceScore;
        _validators[validator].performanceScore = newScore;
        _validators[validator].lastUpdated = block.timestamp;

        _recordSnapshot(validator, newScore, _validators[validator].riskScore);

        emit PerformanceScoreUpdated(validator, oldScore, newScore);
    }

    /// @inheritdoc IValidatorRegistry
    function updateRiskScore(
        address validator,
        uint256 newScore
    ) external onlyAdminOrOwner validatorActive(validator) {
        if (newScore > MAX_SCORE) revert InvalidScore();

        uint256 oldScore = _validators[validator].riskScore;
        _validators[validator].riskScore = newScore;
        _validators[validator].lastUpdated = block.timestamp;

        _recordSnapshot(validator, _validators[validator].performanceScore, newScore);

        emit RiskScoreUpdated(validator, oldScore, newScore);
    }

    /// @inheritdoc IValidatorRegistry
    function updateValidator(
        address validator,
        uint256 commission,
        uint256 stakingCap
    ) external onlyAdminOrOwner validatorActive(validator) {
        if (commission > MAX_COMMISSION) revert CommissionTooHigh();

        _validators[validator].commission = commission;
        _validators[validator].stakingCap = stakingCap;
        _validators[validator].lastUpdated = block.timestamp;

        emit ValidatorUpdated(validator, commission, stakingCap);
    }

    /// @notice Update total staked amount for a validator
    function updateStaked(
        address validator,
        uint256 amount
    ) external onlyAdminOrOwner validatorActive(validator) {
        _validators[validator].totalStaked = amount;
        _validators[validator].lastUpdated = block.timestamp;
    }

    // ═══════════════════════════════════════════════════════
    //                     READ FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @inheritdoc IValidatorRegistry
    function getValidator(address validator) external view returns (ValidatorInfo memory) {
        return _validators[validator];
    }

    /// @inheritdoc IValidatorRegistry
    function getActiveValidators() external view returns (ValidatorInfo[] memory) {
        ValidatorInfo[] memory active = new ValidatorInfo[](_activeCount);
        uint256 idx = 0;

        for (uint256 i = 0; i < _validatorList.length; i++) {
            if (_validators[_validatorList[i]].isActive) {
                active[idx] = _validators[_validatorList[i]];
                idx++;
            }
        }

        return active;
    }

    /// @inheritdoc IValidatorRegistry
    function validatorCount() external view returns (uint256) {
        return _activeCount;
    }

    /// @inheritdoc IValidatorRegistry
    function getScoreHistory(address validator) external view returns (ScoreSnapshot[] memory) {
        return _scoreHistory[validator];
    }

    /// @notice Get total number of registered validators (including inactive)
    function totalRegistered() external view returns (uint256) {
        return _validatorList.length;
    }

    // ═══════════════════════════════════════════════════════
    //                   INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @dev Record a score snapshot for historical tracking
    function _recordSnapshot(address validator, uint256 perfScore, uint256 riskScore_) internal {
        ScoreSnapshot[] storage history = _scoreHistory[validator];

        // Enforce max history length to bound gas costs
        if (history.length >= MAX_HISTORY_LENGTH) {
            // Shift left (remove oldest)
            for (uint256 i = 0; i < history.length - 1; i++) {
                history[i] = history[i + 1];
            }
            history.pop();
        }

        history.push(ScoreSnapshot({
            performanceScore: perfScore,
            riskScore: riskScore_,
            timestamp: block.timestamp
        }));
    }
}
