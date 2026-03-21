import { optimizeAllocation } from "./allocationService";
import { runAdvancedMonteCarlo } from "../engine/advancedMonteCarlo";
import { Validator } from "../models/types";
import {
  diversificationScore,
  calculateExpectedReturn,
  calculateWorstCaseLoss
} from "./riskService";

export function simulatePortfolio(amount: number, validators: Validator[], correlationMatrix: number[][]) {
  const allocations = optimizeAllocation(amount, validators);

  const monte = runAdvancedMonteCarlo(allocations, validators, correlationMatrix, 1000);

  const expectedReturn = calculateExpectedReturn(allocations, validators);
  const worstCaseLoss = calculateWorstCaseLoss(allocations, validators);
  const diversification = diversificationScore(allocations);

  return {
    allocations,
    expectedReturn,
    worstCaseLoss,
    diversificationScore: diversification,
    monteCarlo: monte
  };
}
