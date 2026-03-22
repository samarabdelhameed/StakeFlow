import { parseAbi } from "viem";

export const VAULT_ADDRESS = "0x0b9EE64DA1a6B2B1eD8B682c5e5E27D87A81092F" as const;
export const STRATEGY_ADDRESS = "0x2dcA7aa9920E4aF949EFff2FE0CBB1C6C790286c" as const;
export const REGISTRY_ADDRESS = "0xb52C12Ed2Bd1e6f7807452b7cfBB2B1BCD6BBB3C" as const;


export const VAULT_ABI = parseAbi([
  "function deposit() external payable returns (uint256)",
  "function withdrawETH(uint256 ethAmount) external returns (uint256)",
  "function optimizeMyPosition() external",
  "function getUserPosition(address user) external view returns (uint256 deposited, uint256 shares, uint256 ethValue, uint256 lastDepositTime, bool canWithdraw)",
  "function totalValueLocked() external view returns (uint256)",
  "function exchangeRate() external view returns (uint256)"
]);

export const STRATEGY_ABI = parseAbi([
  "function executeStrategyFor(address user, uint256 amount) external",
  "function userAllocations(address user, address validator) external view returns (uint256)"
]);

export const REGISTRY_ABI = parseAbi([
  "function getValidatorList() external view returns (address[])",
  "function getValidatorData(address validator) external view returns (string name, uint256 commission, uint256 riskScore, uint256 performanceScore, uint256 stakedCap, bool isActive)",
  "function registerValidator(address validator, string name, uint256 commission, uint256 riskScore, uint256 stakedCap) external"
]);

