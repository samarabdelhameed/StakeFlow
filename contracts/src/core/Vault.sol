// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IVault } from "../interfaces/IVault.sol";
import { IRestakingStrategy } from "../interfaces/IRestakingStrategy.sol";
import { StakeFlowMath } from "../libraries/StakeFlowMath.sol";

/// @title Vault
/// @author StakeFlow Team
/// @notice Core vault for ETH staking with share-based accounting
contract Vault is IVault, Ownable, ReentrancyGuard {
    using StakeFlowMath for uint256;

    // ═══════════════════════════════════════════════════════
    //                        STORAGE
    // ═══════════════════════════════════════════════════════

    IRestakingStrategy public strategy;

    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _lastDepositTime;

    uint256 private _totalShares;
    uint256 private _totalAssets;

    uint256 public constant MIN_DEPOSIT = 0.01 ether;
    uint256 public constant WITHDRAWAL_COOLDOWN = 1 days;

    // ═══════════════════════════════════════════════════════
    //                      CONSTRUCTOR
    // ═══════════════════════════════════════════════════════

    constructor(address _strategy) Ownable(msg.sender) {
        require(_strategy != address(0), "Invalid strategy");
        strategy = IRestakingStrategy(_strategy);
    }

    // ═══════════════════════════════════════════════════════
    //                     WRITE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @inheritdoc IVault
    function deposit() external payable nonReentrant returns (uint256 shares) {
        if (msg.value < MIN_DEPOSIT) revert InvalidAmount();

        shares = StakeFlowMath.calculateShares(msg.value, _totalShares, _totalAssets);

        _shares[msg.sender] += shares;
        _totalShares += shares;
        _totalAssets += msg.value;
        _lastDepositTime[msg.sender] = block.timestamp;

        emit Deposited(msg.sender, msg.value, shares);
    }

    /// @inheritdoc IVault
    function withdraw(uint256 shares) external nonReentrant returns (uint256 amount) {
        if (shares == 0) revert InvalidAmount();
        if (_shares[msg.sender] < shares) revert InsufficientBalance();
        if (block.timestamp < _lastDepositTime[msg.sender] + WITHDRAWAL_COOLDOWN) {
            revert WithdrawalCooldown();
        }

        amount = StakeFlowMath.calculateAssets(shares, _totalShares, _totalAssets);

        _shares[msg.sender] -= shares;
        _totalShares -= shares;
        _totalAssets -= amount;

        (bool success, ) = msg.sender.call{ value: amount }("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount, shares);
    }

    /// @notice Distribute rewards to the vault (increases share value)
    function distributeRewards() external payable onlyOwner {
        if (msg.value == 0) revert InvalidAmount();
        _totalAssets += msg.value;
        emit RewardsDistributed(msg.value, block.timestamp);
    }

    /// @notice Update the restaking strategy
    function setStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy");
        strategy = IRestakingStrategy(_strategy);
    }

    /// @notice Execute the restaking strategy with vault funds
    function executeRestaking() external onlyOwner nonReentrant {
        strategy.executeStrategy(_totalAssets);
    }

    // ═══════════════════════════════════════════════════════
    //                     READ FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @inheritdoc IVault
    function totalValueLocked() external view returns (uint256) {
        return _totalAssets;
    }

    /// @inheritdoc IVault
    function sharesOf(address user) external view returns (uint256) {
        return _shares[user];
    }

    /// @inheritdoc IVault
    function sharesToETH(uint256 shares) external view returns (uint256) {
        return StakeFlowMath.calculateAssets(shares, _totalShares, _totalAssets);
    }

    /// @inheritdoc IVault
    function ethToShares(uint256 ethAmount) external view returns (uint256) {
        return StakeFlowMath.calculateShares(ethAmount, _totalShares, _totalAssets);
    }

    /// @notice Get the exchange rate (ETH per share, scaled by 1e18)
    function exchangeRate() external view returns (uint256) {
        if (_totalShares == 0) return StakeFlowMath.PRECISION;
        return (_totalAssets * StakeFlowMath.PRECISION) / _totalShares;
    }

    /// @notice Receive ETH
    receive() external payable {
        _totalAssets += msg.value;
    }
}
