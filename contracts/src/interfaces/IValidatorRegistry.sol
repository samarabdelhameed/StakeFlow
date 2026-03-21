// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IValidatorRegistry {
    // ═══════════════════════════════════════════════════════
    //                        STRUCTS
    // ═══════════════════════════════════════════════════════

    struct ValidatorInfo {
        address validatorAddress;
        string name;
        uint256 totalStaked;
        uint256 commission;     // basis points (e.g., 500 = 5%)
        uint256 performanceScore; // 0-10000
        bool isActive;
        uint256 registeredAt;
    }

    // ═══════════════════════════════════════════════════════
    //                        EVENTS
    // ═══════════════════════════════════════════════════════

    event ValidatorRegistered(address indexed validator, string name, uint256 commission);
    event ValidatorDeactivated(address indexed validator);
    event ValidatorScoreUpdated(address indexed validator, uint256 newScore);

    // ═══════════════════════════════════════════════════════
    //                     CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @notice Register a new validator
    function registerValidator(address validator, string calldata name, uint256 commission) external;

    /// @notice Deactivate a validator
    function deactivateValidator(address validator) external;

    /// @notice Update validator performance score
    function updatePerformanceScore(address validator, uint256 newScore) external;

    /// @notice Get validator info
    function getValidator(address validator) external view returns (ValidatorInfo memory);

    /// @notice Get all active validators
    function getActiveValidators() external view returns (ValidatorInfo[] memory);

    /// @notice Get total number of validators
    function validatorCount() external view returns (uint256);
}
