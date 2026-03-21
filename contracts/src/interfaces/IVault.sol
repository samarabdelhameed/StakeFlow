// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVault {
    // ═══════════════════════════════════════════════════════
    //                        EVENTS
    // ═══════════════════════════════════════════════════════

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event RewardsDistributed(uint256 amount, uint256 timestamp);
    event AllocationUpdated(address indexed validator, uint256 newAllocation);

    // ═══════════════════════════════════════════════════════
    //                        ERRORS
    // ═══════════════════════════════════════════════════════

    error InsufficientBalance();
    error InvalidAmount();
    error ValidatorNotActive();
    error AllocationExceedsLimit();
    error WithdrawalCooldown();

    // ═══════════════════════════════════════════════════════
    //                     CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /// @notice Deposit ETH into the vault
    /// @return shares The amount of shares minted
    function deposit() external payable returns (uint256 shares);

    /// @notice Withdraw ETH from the vault
    /// @param shares The amount of shares to burn
    /// @return amount The amount of ETH withdrawn
    function withdraw(uint256 shares) external returns (uint256 amount);

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
