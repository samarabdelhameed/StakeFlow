// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IValidatorRegistry
/// @notice Interface for the validator data layer
interface IValidatorRegistry {
    // ═══════════════════════════════════════════════════════
    //                        STRUCTS
    // ═══════════════════════════════════════════════════════

    struct ValidatorInfo {
        address validatorAddress;
        string name;
        uint256 totalStaked;
        uint256 commission;        // basis points (e.g., 500 = 5%)
        uint256 performanceScore;  // 0-10000
        uint256 riskScore;         // 0-10000 (higher = riskier)
        uint256 stakingCap;        // max ETH this validator can accept
        bool isActive;
        uint256 registeredAt;
        uint256 lastUpdated;
    }

    struct ScoreSnapshot {
        uint256 performanceScore;
        uint256 riskScore;
        uint256 timestamp;
    }

    // ═══════════════════════════════════════════════════════
    //                        EVENTS
    // ═══════════════════════════════════════════════════════

    event ValidatorRegistered(address indexed validator, string name, uint256 commission, uint256 stakingCap);
    event ValidatorDeactivated(address indexed validator);
    event ValidatorReactivated(address indexed validator);
    event ValidatorUpdated(address indexed validator, uint256 commission, uint256 stakingCap);
    event PerformanceScoreUpdated(address indexed validator, uint256 oldScore, uint256 newScore);
    event RiskScoreUpdated(address indexed validator, uint256 oldScore, uint256 newScore);
    event AdminGranted(address indexed admin);
    event AdminRevoked(address indexed admin);

    // ═══════════════════════════════════════════════════════
    //                        ERRORS
    // ═══════════════════════════════════════════════════════

    error InvalidAddress();
    error ValidatorAlreadyRegistered();
    error ValidatorNotActive();
    error ValidatorNotFound();
    error CommissionTooHigh();
    error InvalidName();
    error InvalidScore();
    error Unauthorized();

    // ═══════════════════════════════════════════════════════
    //                     CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @notice Register a new validator
    function registerValidator(
        address validator,
        string calldata name,
        uint256 commission,
        uint256 riskScore,
        uint256 stakingCap
    ) external;

    /// @notice Deactivate a validator
    function deactivateValidator(address validator) external;

    /// @notice Reactivate a validator
    function reactivateValidator(address validator) external;

    /// @notice Update validator performance score
    function updatePerformanceScore(address validator, uint256 newScore) external;

    /// @notice Update validator risk score
    function updateRiskScore(address validator, uint256 newScore) external;

    /// @notice Update validator commission and cap
    function updateValidator(address validator, uint256 commission, uint256 stakingCap) external;

    /// @notice Get validator info
    function getValidator(address validator) external view returns (ValidatorInfo memory);

    /// @notice Get all active validators
    function getActiveValidators() external view returns (ValidatorInfo[] memory);

    /// @notice Get total number of active validators
    function validatorCount() external view returns (uint256);

    /// @notice Get score history for a validator
    function getScoreHistory(address validator) external view returns (ScoreSnapshot[] memory);
}
