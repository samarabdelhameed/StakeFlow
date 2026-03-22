// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IVault } from "../interfaces/IVault.sol";
import { IRestakingStrategy } from "../interfaces/IRestakingStrategy.sol";
import { StakeFlowMath } from "../libraries/StakeFlowMath.sol";

/// @title Vault
/// @author StakeFlow Team
/// @notice Core vault for ETH staking with share-based accounting,
///         partial withdrawals, re-optimization, and simulation support
contract Vault is IVault, Ownable, ReentrancyGuard {
    using StakeFlowMath for uint256;

    // ═══════════════════════════════════════════════════════
    //                        STORAGE
    // ═══════════════════════════════════════════════════════

    IRestakingStrategy public strategy;

    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _depositedETH;    // track original deposits
    mapping(address => uint256) private _lastDepositTime;

    uint256 private _totalShares;
    uint256 private _totalAssets;

    uint256 public constant MIN_DEPOSIT = 0.0001 ether;
    uint256 public constant WITHDRAWAL_COOLDOWN = 1 minutes;


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
        _depositedETH[msg.sender] += msg.value;
        _totalShares += shares;
        _totalAssets += msg.value;
        _lastDepositTime[msg.sender] = block.timestamp;

        emit Deposited(msg.sender, msg.value, shares);
    }

    /// @inheritdoc IVault
    function withdraw(uint256 shares) external nonReentrant returns (uint256 amount) {
        if (shares == 0) revert InvalidAmount();
        if (_shares[msg.sender] < shares) revert InsufficientBalance();
        _enforceWithdrawalCooldown();

        amount = StakeFlowMath.calculateAssets(shares, _totalShares, _totalAssets);

        _shares[msg.sender] -= shares;
        _totalShares -= shares;
        _totalAssets -= amount;

        // Update deposited ETH tracker proportionally
        uint256 proportionalDeposit = (_depositedETH[msg.sender] * shares) /
            (_shares[msg.sender] + shares); // pre-subtraction total
        _depositedETH[msg.sender] -= proportionalDeposit;

        _safeTransferETH(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, shares);
    }

    /// @inheritdoc IVault
    function withdrawETH(uint256 ethAmount) external nonReentrant returns (uint256 sharesRedeemed) {
        if (ethAmount == 0) revert InvalidAmount();
        _enforceWithdrawalCooldown();

        // Calculate shares needed for this ETH amount
        sharesRedeemed = StakeFlowMath.calculateShares(ethAmount, _totalShares, _totalAssets);
        if (_shares[msg.sender] < sharesRedeemed) revert InsufficientBalance();

        uint256 remainingShares = _shares[msg.sender] - sharesRedeemed;

        _shares[msg.sender] = remainingShares;
        _totalShares -= sharesRedeemed;
        _totalAssets -= ethAmount;

        // Update deposited ETH tracker
        if (_depositedETH[msg.sender] >= ethAmount) {
            _depositedETH[msg.sender] -= ethAmount;
        } else {
            _depositedETH[msg.sender] = 0;
        }

        _safeTransferETH(msg.sender, ethAmount);

        emit PartialWithdrawn(msg.sender, ethAmount, sharesRedeemed, remainingShares);
    }

    /// @notice Distribute rewards to the vault (increases share value for everyone)
    function distributeRewards() external payable onlyOwner {
        if (msg.value == 0) revert InvalidAmount();
        _totalAssets += msg.value;
        emit RewardsDistributed(msg.value, block.timestamp);
    }

    /// @notice Update the restaking strategy
    function setStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy");
        address oldStrategy = address(strategy);
        strategy = IRestakingStrategy(_strategy);
        emit StrategyUpdated(oldStrategy, _strategy);
    }

    function optimizeAllocation() external onlyOwner nonReentrant {
        if (_totalAssets == 0) revert InvalidAmount();

        IRestakingStrategy.Allocation[] memory allocs = strategy.calculateAllocation(_totalAssets);

        // Execute the strategy on-chain globally
        strategy.executeStrategy(_totalAssets);

        emit AllocationOptimized(_totalAssets, allocs.length, block.timestamp);
    }

    /// @inheritdoc IVault
    function optimizeMyPosition() external nonReentrant {
        uint256 userShares = _shares[msg.sender];
        if (userShares == 0) revert InsufficientBalance();
        
        uint256 userEth = StakeFlowMath.calculateAssets(userShares, _totalShares, _totalAssets);
        
        IRestakingStrategy.Allocation[] memory allocs = strategy.calculateAllocation(userEth);
        strategy.executeStrategyFor(msg.sender, userEth);

        address[] memory vals = new address[](allocs.length);
        uint256[] memory amts = new uint256[](allocs.length);
        
        for(uint256 i = 0; i < allocs.length; i++) {
            vals[i] = allocs[i].validator;
            amts[i] = allocs[i].amount;
        }
        
        emit PositionOptimized(msg.sender, userEth, vals, amts);
    }

    /// @inheritdoc IVault
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert InvalidAmount();
        _safeTransferETH(owner(), balance);
    }

    /// @notice Trigger a rebalance through the strategy
    function rebalance() external onlyOwner nonReentrant {
        strategy.rebalance();
    }

    // ═══════════════════════════════════════════════════════
    //                     READ FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @inheritdoc IVault
    function getUserPosition(address user) external view returns (UserPosition memory position) {
        uint256 userShares = _shares[user];
        uint256 ethValue = StakeFlowMath.calculateAssets(userShares, _totalShares, _totalAssets);
        bool canWithdraw = block.timestamp >= _lastDepositTime[user] + WITHDRAWAL_COOLDOWN;

        position = UserPosition({
            deposited: _depositedETH[user],
            shares: userShares,
            ethValue: ethValue,
            lastDepositTime: _lastDepositTime[user],
            canWithdraw: canWithdraw
        });
    }

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
        return StakeFlowMath.exchangeRate(_totalShares, _totalAssets);
    }

    /// @notice Preview a simulation of allocation before committing
    function simulateAllocation(
        uint256 amount
    ) external view returns (IRestakingStrategy.SimulationResult memory) {
        return strategy.simulateAllocation(amount);
    }

    /// @notice Preview worst-case slashing impact
    function previewSlashing() external view returns (uint256 totalLoss, uint256 maxSingleLoss) {
        return strategy.previewSlashing(_totalAssets);
    }

    /// @notice Get total shares in circulation
    function totalShares() external view returns (uint256) {
        return _totalShares;
    }

    // ═══════════════════════════════════════════════════════
    //                   INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @dev Enforce withdrawal cooldown period
    function _enforceWithdrawalCooldown() internal view {
        if (block.timestamp < _lastDepositTime[msg.sender] + WITHDRAWAL_COOLDOWN) {
            revert WithdrawalCooldown();
        }
    }

    /// @dev Safe ETH transfer with error handling
    function _safeTransferETH(address to, uint256 amount) internal {
        (bool success,) = to.call{ value: amount }("");
        if (!success) revert TransferFailed();
    }

    receive() external payable { 
        revert("Use deposit() or distributeRewards()");
    }
}
