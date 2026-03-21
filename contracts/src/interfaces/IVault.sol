// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IVault
/// @notice Interface for the StakeFlow Vault — the core entry point
interface IVault {
    // ═══════════════════════════════════════════════════════
    //                        STRUCTS
    // ═══════════════════════════════════════════════════════

    struct UserPosition {
        uint256 deposited;      // total ETH deposited
        uint256 shares;         // current share balance
        uint256 ethValue;       // current ETH value of shares
        uint256 lastDepositTime;
        bool canWithdraw;       // true if past cooldown
    }

    // ═══════════════════════════════════════════════════════
    //                        EVENTS
    // ═══════════════════════════════════════════════════════

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event PartialWithdrawn(address indexed user, uint256 amount, uint256 sharesRedeemed, uint256 sharesRemaining);
    event RewardsDistributed(uint256 amount, uint256 timestamp);
    event AllocationExecuted(address indexed user, uint256 totalAmount);
    event AllocationOptimized(uint256 totalAmount, uint256 validatorCount, uint256 timestamp);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);

    // ═══════════════════════════════════════════════════════
    //                        ERRORS
    // ═══════════════════════════════════════════════════════

    error InsufficientBalance();
    error InvalidAmount();
    error ValidatorNotActive();
    error AllocationExceedsLimit();
    error WithdrawalCooldown();
    error TransferFailed();

    // ═══════════════════════════════════════════════════════
    //                     CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @notice Deposit ETH into the vault
    /// @return shares The amount of shares minted
    function deposit() external payable returns (uint256 shares);

    /// @notice Withdraw all shares
    /// @param shares The amount of shares to burn
    /// @return amount The amount of ETH withdrawn
    function withdraw(uint256 shares) external returns (uint256 amount);

    /// @notice Withdraw a partial ETH amount (burns proportional shares)
    /// @param ethAmount The ETH amount to withdraw
    /// @return sharesRedeemed The shares burned
    function withdrawETH(uint256 ethAmount) external returns (uint256 sharesRedeemed);

    /// @notice Trigger allocation optimization using strategy
    function optimizeAllocation() external;

    /// @notice Get complete user position
    /// @param user The user address
    /// @return position Full position details
    function getUserPosition(address user) external view returns (UserPosition memory position);

    /// @notice Get the total value locked in the vault
    /// @return The total ETH value
    function totalValueLocked() external view returns (uint256);

    /// @notice Get user's share balance
    /// @param user The user address
    /// @return The share balance
    function sharesOf(address user) external view returns (uint256);

    /// @notice Convert shares to ETH amount
    /// @param shares The shares amount
    /// @return The ETH equivalent
    function sharesToETH(uint256 shares) external view returns (uint256);

    /// @notice Convert ETH amount to shares
    /// @param ethAmount The ETH amount
    /// @return The shares equivalent
    function ethToShares(uint256 ethAmount) external view returns (uint256);
}
