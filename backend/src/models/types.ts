export interface Validator {
  id: string;
  performance: number; // %
  risk: number;        // %
  commission: number;  // %
  cap: number;         // ETH
  volatility: number;  // %
}

export interface Allocation {
  validator: string;
  amount: number;
  percentage: number;
}

export interface SimulationResult {
  expectedReturn: number;
  worstCaseLoss: number;
  diversificationScore: number;
}
