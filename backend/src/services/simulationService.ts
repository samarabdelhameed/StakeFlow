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
     allocations: allocations.map(a => {
       const v = validators.find(val => val.id === a.validator);
       return { ...a, validatorName: v?.id, score: v?.performance, risk: v?.risk };
     }),
     expectedReturn,
     worstCaseLoss,
     diversificationScore: diversification,
     monteCarlo: monte
   };

}

export function simulateSlashing(amount: number, validators: Validator[], correlationMatrix: number[][]) {
  // Pick one random validator to slash (usually the one with highest allocation or risk)
  const slashedIdx = Math.floor(Math.random() * validators.length);
  const targetValidator = validators[slashedIdx];
  
  // Create a sub-pool without the slashed validator
  const survivingValidators = validators.filter((_, i) => i !== slashedIdx).map(v => ({
    ...v,
    volatility: v.volatility * 2.5, // Increased systemic stress
    performance: v.performance * 0.8 // Lowered yields due to network stress
  }));
  
  // Simulate a 15% loss on the slashed portion, then re-allocate the rest
  const lossOnSlashed = (amount / validators.length) * 0.15; 
  const remainingToAllocate = amount - lossOnSlashed;

  const newAllocations = optimizeAllocation(remainingToAllocate, survivingValidators);
  const monte = runAdvancedMonteCarlo(newAllocations, survivingValidators, correlationMatrix.filter((_, i) => i !== slashedIdx).map(row => row.filter((_, j) => j !== slashedIdx)), 800);

   return {
     slashedValidator: targetValidator.id,
     lossAmount: lossOnSlashed,
     allocations: newAllocations.map(a => {
       const v = survivingValidators.find(val => val.id === a.validator);
       return { ...a, validatorName: v?.id, score: v?.performance, risk: v?.risk };
     }),
     expectedReturn: calculateExpectedReturn(newAllocations, survivingValidators) * 0.85, // systemic hit
     diversificationScore: diversificationScore(newAllocations),
     monteCarlo: {
       ...monte,
       VaR: monte.VaR * 50, // Amplify for visibility in low-ETH scenarios
       CVaR: monte.CVaR * 65
     },
     isShocked: true
   };

}


