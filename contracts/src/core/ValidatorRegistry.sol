// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IValidatorRegistry } from "../interfaces/IValidatorRegistry.sol";

/// @title ValidatorRegistry
/// @author StakeFlow Team
/// @notice Registry for managing validators in the StakeFlow protocol
contract ValidatorRegistry is IValidatorRegistry, Ownable, ReentrancyGuard {
    // ═══════════════════════════════════════════════════════
    //                        STORAGE
    // ═══════════════════════════════════════════════════════

    mapping(address => ValidatorInfo) private _validators;
    address[] private _validatorList;
    uint256 private _activeCount;

    uint256 public constant MAX_COMMISSION = 3_000; // 30% max
    uint256 public constant MAX_SCORE = 10_000;

    // ═══════════════════════════════════════════════════════
    //                      CONSTRUCTOR
    // ═══════════════════════════════════════════════════════

    constructor() Ownable(msg.sender) { }

    // ═══════════════════════════════════════════════════════
    //                     WRITE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @inheritdoc IValidatorRegistry
    function registerValidator(
        address validator,
        string calldata name,
        uint256 commission
    ) external onlyOwner {
        require(validator != address(0), "Invalid address");
        require(!_validators[validator].isActive, "Already registered");
        require(commission <= MAX_COMMISSION, "Commission too high");
        require(bytes(name).length > 0, "Empty name");

        _validators[validator] = ValidatorInfo({
            validatorAddress: validator,
            name: name,
            totalStaked: 0,
            commission: commission,
            performanceScore: 5_000, // Start at 50%
            isActive: true,
            registeredAt: block.timestamp
        });

        _validatorList.push(validator);
        _activeCount++;

        emit ValidatorRegistered(validator, name, commission);
    }

    /// @inheritdoc IValidatorRegistry
    function deactivateValidator(address validator) external onlyOwner {
        require(_validators[validator].isActive, "Not active");

        _validators[validator].isActive = false;
        _activeCount--;

        emit ValidatorDeactivated(validator);
    }

    /// @inheritdoc IValidatorRegistry
    function updatePerformanceScore(
        address validator,
        uint256 newScore
    ) external onlyOwner {
        require(_validators[validator].isActive, "Not active");
        require(newScore <= MAX_SCORE, "Score too high");

        _validators[validator].performanceScore = newScore;

        emit ValidatorScoreUpdated(validator, newScore);
    }

    /// @notice Update total staked amount for a validator
    function updateStaked(address validator, uint256 amount) external onlyOwner {
        require(_validators[validator].isActive, "Not active");
        _validators[validator].totalStaked = amount;
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
}
