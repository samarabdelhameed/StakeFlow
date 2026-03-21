# StakeFlow — Risk-Aware Restaking Protocol

> Intelligent capital allocation for secure and optimized restaking.

---

## Overview

StakeFlow is a risk-aware restaking protocol designed to optimize how validators allocate capital across multiple services under constraints such as caps, slashing risks, and varying reward profiles.

Instead of naively concentrating stake into a single validator or service, StakeFlow introduces a structured allocation strategy that distributes capital dynamically based on risk-adjusted returns.

The system bridges academic research with practical implementation, transforming theoretical restaking models into a working, interactive decentralized application.

---

## The Problem

Restaking introduces a powerful but dangerous paradigm:

- Validators reuse the same capital across multiple services.
- This creates **compounded risk exposure**, especially under slashing conditions.
- Emerging systems impose **allocation caps** to prevent centralization.
- Traditional strategies fail under these constraints.

### Key Challenges:
- How do we maximize yield under risk?
- How do we respect caps while staying efficient?
- How do we prevent catastrophic losses from overexposure?

---

## The Solution

StakeFlow introduces a **Risk-Aware Allocation Engine** that:

- Evaluates each validator using a **risk/reward scoring model**
- Dynamically distributes capital across validators
- Respects caps and constraints
- Optimizes for **maximum risk-adjusted return**

Instead of treating stake as a single unit, StakeFlow:
> fragments capital into smaller allocations and routes them intelligently

---

## Core Concept

Each validator is defined by:

- Risk Score
- Reward Rate
- Maximum Allocation Cap

We compute:

```
Score = Reward / Risk
```

Then:

1. Rank validators by score
2. Allocate capital greedily under constraints
3. Ensure full utilization without violating caps

---

## Example

Given 100 ETH:

| Validator | Risk | Reward | Cap | Score |
|----------|------|--------|-----|-------|
| B        | 0.2  | 24%    | 50  | 120   |
| A        | 0.1  | 10%    | 40  | 100   |
| C        | 0.05 | 4%     | 30  | 80    |

### Allocation Result:

- B → 50 ETH
- A → 40 ETH
- C → 10 ETH

---

## System Architecture

StakeFlow is designed as a modular, production-grade system:

```
Frontend (Next.js + Web3)
         ↓
Backend (Bun API + Allocation Engine)
         ↓
Smart Contracts (Foundry / Solidity)
```

---

## Technical Flow

```
      ┌───────────────────────┐
      │        User UI        │
      │   (Next.js + Wallet)  │
      └─────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │  Input: Stake Amount    │
    └─────────┬───────────────┘
              │
              ▼
 ┌──────────────────────────────┐
 │  Allocation Engine (Backend) │
 │  - Score Calculation         │
 │  - Sorting                   │
 │  - Cap Enforcement           │
 └─────────┬────────────────────┘
           │
           ▼
 ┌───────────────────────────────┐
 │ Optimized Allocation Output   │
 └─────────┬─────────────────────┘
           │
           ▼
 ┌───────────────────────────────┐
 │ Smart Contracts Execution     │
 │ - Vault                       │
 │ - Strategy                    │
 │ - Registry                    │
 └─────────┬─────────────────────┘
           │
           ▼
 ┌───────────────────────────────┐
 │ Final Distribution + Metrics  │
 └───────────────────────────────┘
```

---

## Smart Contract Design

### 1. Vault
- Accepts user deposits
- Triggers allocation

### 2. Strategy
- Executes allocation logic
- Applies scoring and distribution

### 3. Validator Registry
- Stores validator parameters
- Acts as data source for strategy

---

## Deployed Contracts (Arbitrum Sepolia)

The protocol is live and verified on the Arbitrum Sepolia Testnet:

- **Vault**: [`0x5bE88f73507E46ba84Bd0b5A0aC9Ad55fBc7e236`](https://sepolia.arbiscan.io/address/0x5be88f73507e46ba84bd0b5a0ac9ad55fbc7e236)
- **RestakingStrategy**: [`0x6e3Fd967715afD552F31663E4eAa148537fCdBEa`](https://sepolia.arbiscan.io/address/0x6e3fd967715afd552f31663e4eaa148537fcdbea)
- **ValidatorRegistry**: [`0xFe7058d7cEcC499e88CcAB48f22728540329120b`](https://sepolia.arbiscan.io/address/0xfe7058d7cecc499e88ccab48f22728540329120b)

All contracts are fully verified on Arbiscan with the respective source code and ABIs.

---

## Backend (Allocation Engine)

Handles:

- Risk modeling
- Allocation simulation
- Optimization logic

Why off-chain?
- Lower gas costs
- Faster computation
- Flexibility for advanced algorithms

---

## Frontend

- Wallet connection (MetaMask)
- Stake input
- Allocation visualization
- Risk & return dashboard

---

## Hackathon Track

**DeFi, Security & Mechanism Design**

StakeFlow directly addresses:
- Restaking risk management
- Capital efficiency under constraints
- Security-aware allocation strategies

---

## Why This Matters

Restaking is rapidly evolving, but current approaches:

- Ignore systemic risk
- Overexpose capital
- Lack intelligent allocation

StakeFlow provides a foundation for:

- Safer restaking ecosystems
- More efficient capital markets
- Scalable validator strategies

---

## Future Work

- Dynamic slashing prediction
- Multi-chain restaking support
- AI-assisted allocation models
- Automated yield compounding

---

## Demo

The demo showcases:

- Live wallet interaction
- Real-time allocation computation
- Visual distribution of stake
- Risk vs reward analytics

---

## Team Vision

We are building toward a future where:

> capital allocation in decentralized systems is not guesswork — but engineered intelligence.

StakeFlow is a step toward making restaking safer, smarter, and scalable.

---

## Repository Structure

```
stakeflow/
├── contracts/
├── backend/
├── frontend/
├── scripts/
├── test/
├── docs/
```

---

## Final Note

This project is not just a prototype —
it is a foundation for production-grade restaking infrastructure.
