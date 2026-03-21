export const VAULT_ADDRESS = "0x5bE88f73507E46ba84Bd0b5A0aC9Ad55fBc7e236" as const;
export const STRATEGY_ADDRESS = "0x6e3Fd967715afD552F31663E4eAa148537fCdBEa" as const;

export const VAULT_ABI = [
  "function deposit() external payable returns (uint256)",
  "function withdrawETH(uint256 ethAmount) external returns (uint256)",
  "function optimizeMyPosition() external",
  "function getUserPosition(address user) external view returns (tuple(uint256 deposited, uint256 shares, uint256 ethValue, uint256 lastDepositTime, bool canWithdraw))",
  "function totalValueLocked() external view returns (uint256)",
  "function exchangeRate() external view returns (uint256)"
] as const;

export const STRATEGY_ABI = [
  "function executeStrategyFor(address user, uint256 amount) external",
  "function userAllocations(address user, address validator) external view returns (uint256)"
] as const;
