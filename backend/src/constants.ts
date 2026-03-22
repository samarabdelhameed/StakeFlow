export const REGISTRY_ADDRESS = "0xb52C12Ed2Bd1e6f7807452b7cfBB2B1BCD6BBB3C";
export const VAULT_ADDRESS = "0x0b9EE64DA1a6B2B1eD8B682c5e5E27D87A81092F";
export const STRATEGY_ADDRESS = "0x2dcA7aa9920E4aF949EFff2FE0CBB1C6C790286c";


export const REGISTRY_ABI = [
  "function getValidatorList() external view returns (address[])",
  "function getValidatorData(address validator) external view returns (tuple(string name, uint256 commission, uint256 riskScore, uint256 performanceScore, uint256 stakedCap, bool isActive))",
  "function getActiveValidators() external view returns (tuple(address validatorAddress, string name, uint256 totalStaked, uint256 commission, uint256 performanceScore, uint256 riskScore, uint256 stakingCap, bool isActive, uint256 registeredAt, uint256 lastUpdated)[])",
  "function totalStaked() external view returns (uint256)"
];


export const VAULT_ABI = [
  "function totalValueLocked() external view returns (uint256)",
  "function exchangeRate() external view returns (uint256)"
];
