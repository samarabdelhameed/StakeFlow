# TVL Display After Deposit Bugfix Design

## Overview

The bug occurs across three critical pages where users interact with staking operations - all use mock implementations instead of real smart contract integration via the `useStakeFlow` hook. This results in fake success messages with no actual blockchain transactions, undermining the application's credibility on Arbitrum Sepolia testnet.

**Affected Pages:**
1. **Deposit Page** (`/deposit`): Uses `setTimeout` mock instead of `useStakeFlow.deposit()` - no real deposits occur
2. **Withdraw Page** (`/withdraw`): Uses mock `STAKED_POSITIONS` array and `setTimeout` instead of reading real positions and calling `useStakeFlow.withdraw()`
3. **Allocation Page** (`/allocation`): Calculates optimal allocation from backend but "Optimize My Position" button doesn't execute transactions via `useStakeFlow.optimizePosition()`

Additionally, the Dashboard doesn't automatically refresh TVL after successful transactions from any source.

The fix involves:
1. Replace mock deposit flow in `/deposit` with real `useStakeFlow.deposit()`
2. Replace mock positions in `/withdraw` with real data from `useStakeFlow.position` and implement real `useStakeFlow.withdraw()`
3. Add "Optimize My Position" button to `/allocation` that executes real transactions via `useStakeFlow.optimizePosition()`
4. Implement automatic TVL refresh on Dashboard after any successful transaction

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user initiates deposit/withdraw/optimize operations from the three affected pages
- **Property (P)**: The desired behavior - all operations should interact with the smart contract and TVL should update automatically
- **Preservation**: Existing deposit behavior in `OnchainTerminal`, validation logic, Dashboard display, and Analytics page must remain unchanged
- **useStakeFlow**: The hook in `frontend/src/hooks/useStakeFlow.ts` that provides real smart contract integration via wagmi with methods: `deposit()`, `withdraw()`, `optimizePosition()`, and `position` data
- **Mock Implementation**: The current `setTimeout`-based fake flows and mock data arrays that don't interact with blockchain
- **TVL (Total Value Locked)**: The aggregate ETH staked across all validators, displayed on the Dashboard and fetched from backend API
- **Position Data**: User's staking position from smart contract containing `deposited`, `ethValue`, `shares`, and `canWithdraw` fields
- **STAKED_POSITIONS**: Mock array in withdraw page that should be replaced with real position data from `useStakeFlow.position`

## Bug Details

### Bug Condition

The bug manifests across three pages where users attempt staking operations:

**1. Deposit Page (`/deposit`)**: Uses a mock implementation that simulates a transaction with `setTimeout(2000)` instead of calling `useStakeFlow.deposit()` to interact with the smart contract.

**2. Withdraw Page (`/withdraw`)**: Uses a hardcoded mock `STAKED_POSITIONS` array instead of reading real position data from `useStakeFlow.position`, and uses `setTimeout` for confirmations instead of calling `useStakeFlow.withdraw()`.

**3. Allocation Page (`/allocation`)**: Fetches optimal allocation from backend API but has no mechanism to execute the optimization on-chain. The page lacks a button to call `useStakeFlow.optimizePosition()`.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { page: string, action: string, amount?: number }
  OUTPUT: boolean
  
  RETURN (
    (input.page == '/deposit' AND input.action == 'deposit' AND input.amount >= 0.01 AND currentImplementationUsesMockSetTimeout())
    OR
    (input.page == '/withdraw' AND input.action == 'withdraw' AND currentImplementationUsesMockPositions())
    OR
    (input.page == '/allocation' AND input.action == 'optimize' AND noOptimizeButtonExists())
  )
END FUNCTION
```

### Examples

**Deposit Page Examples:**

- **Example 1**: User enters 1 ETH on `/deposit` page and clicks "Execute"
  - **Current (Buggy)**: Shows "Restaked Successfully" after 2 seconds, no MetaMask prompt, no blockchain transaction, TVL stays 0.00 ETH
  - **Expected**: MetaMask prompts for transaction approval, transaction is sent to blockchain, "Transaction Confirming..." appears, then "Restaked Successfully" after confirmation, TVL updates to 1 ETH

- **Example 2**: User enters 5 ETH on `/deposit` page and clicks "Execute"
  - **Current (Buggy)**: Mock success message appears, Dashboard shows 0.00 ETH TVL
  - **Expected**: Real transaction occurs, Dashboard automatically refreshes and shows 5 ETH TVL

**Withdraw Page Examples:**

- **Example 3**: User opens `/withdraw` page after making a real deposit
  - **Current (Buggy)**: Shows mock `STAKED_POSITIONS` array with fake validators (Epsilon, Beta, Alpha, etc.) instead of real position data
  - **Expected**: Shows actual staked position from smart contract via `useStakeFlow.position` with real deposited amount, shares, and withdrawable balance

- **Example 4**: User selects a position and clicks "Withdraw" for 2 ETH
  - **Current (Buggy)**: Shows mock confirmation with `setTimeout`, displays fake success message, no blockchain transaction
  - **Expected**: MetaMask prompts for withdrawal transaction, "Transaction Confirming..." appears, success message only after blockchain confirmation, position data updates

- **Example 5**: User has no staked position
  - **Current (Buggy)**: Still shows mock positions with fake data
  - **Expected**: Shows empty state or "No positions found" message

**Allocation Page Examples:**

- **Example 6**: User views optimal allocation on `/allocation` page
  - **Current (Buggy)**: Shows optimal distribution calculated by backend, but no way to execute it on-chain
  - **Expected**: Shows "Optimize My Position" button that triggers `useStakeFlow.optimizePosition()` to execute the allocation on blockchain

- **Example 7**: User clicks "Optimize My Position" button (after fix)
  - **Expected**: MetaMask prompts for transaction, shows "Calculating optimal AI paths on-chain..." loading message, transaction executes, TVL and allocation update

**General Examples:**

- **Example 8**: User deposits 2 ETH via `OnchainTerminal` component (which uses real `useStakeFlow`)
  - **Current**: Transaction succeeds on blockchain, but Dashboard TVL doesn't update until page reload
  - **Expected**: Dashboard TVL should automatically refresh after successful transaction

- **Edge Case**: User enters 0.005 ETH on deposit page (below minimum)
  - **Expected**: Error message "Amount is below minimum deposit" appears, no transaction attempted (this already works correctly)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Deposits through `OnchainTerminal` component must continue to work exactly as before
- Analytics page (`/analytics`) with real backend data must remain unchanged
- Minimum deposit validation (0.01 ETH) must continue to prevent invalid deposits
- Error handling for wallet not connected must remain unchanged
- Error handling for rejected/failed transactions must remain unchanged
- Dashboard TVL display for users who haven't made deposits must remain unchanged
- All other Dashboard functionality (charts, validator lists) must remain unchanged
- Validator selection dropdown and AI optimization option on deposit page must remain unchanged
- Allocation page's backend API integration for calculating optimal distribution must remain unchanged
- All UI animations, styling, and visual effects must remain unchanged

**Scope:**
All inputs that do NOT involve the three specific operations (deposit from `/deposit`, withdraw from `/withdraw`, optimize from `/allocation`) should be completely unaffected by this fix. This includes:
- Deposits through other components (`OnchainTerminal`)
- Viewing Dashboard without making transactions
- Viewing Analytics page
- Navigation between pages
- Wallet connection/disconnection
- Validator detail pages
- Rewards page

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

**1. Deposit Page Issues (`/deposit`):**
   - **Mock Implementation**: The page (`frontend/src/app/deposit/page.tsx`) uses local state with `setTimeout` to simulate a deposit instead of calling `useStakeFlow().deposit()`
   - Lines 40-46: `handleConfirm()` function uses `setTimeout(() => { setDepositComplete(true) }, 2000)` instead of real blockchain interaction
   - The page doesn't import or use the `useStakeFlow` hook at all
   - No MetaMask integration - never calls `writeContractAsync` from wagmi
   - No transaction state tracking - doesn't track real transaction hashes or wait for blockchain confirmations

**2. Withdraw Page Issues (`/withdraw`):**
   - **Mock Position Data**: The page (`frontend/src/app/withdraw/page.tsx`) uses a hardcoded `STAKED_POSITIONS` array (lines 11-17) instead of reading from `useStakeFlow().position`
   - **Mock Withdrawal Flow**: Uses `setTimeout` in `handleConfirm()` (lines 52-59) instead of calling `useStakeFlow().withdraw()`
   - The page doesn't import or use the `useStakeFlow` hook at all
   - Shows fake validator positions (Epsilon, Beta, Alpha, Gamma, Delta) that don't reflect actual smart contract state
   - No real transaction execution - just displays fake success messages after 2.5 seconds

**3. Allocation Page Issues (`/allocation`):**
   - **Missing Execution Button**: The page (`frontend/src/app/allocation/page.tsx`) fetches optimal allocation from backend API but provides no way to execute it on-chain
   - The page doesn't import or use the `useStakeFlow` hook
   - No "Optimize My Position" button that calls `useStakeFlow().optimizePosition()`
   - Users can see the optimal allocation but cannot apply it to their actual staked position

**4. Dashboard Refresh Issues:**
   - **Missing Dashboard Refresh Logic**: The Dashboard (`frontend/src/app/page.tsx`) fetches TVL once on mount via `fetchData()` but has no mechanism to refetch when transactions complete
   - The `useStakeFlow` hook provides `refetchPosition()` but Dashboard doesn't use it
   - No event listener or state management to trigger refetch after deposits/withdrawals/optimizations

## Correctness Properties

Property 1: Bug Condition - Real Blockchain Deposit

_For any_ deposit action initiated from the `/deposit` page where the amount is >= 0.01 ETH and the user's wallet is connected, the fixed implementation SHALL use the `useStakeFlow` hook to send a real transaction to the smart contract, prompt MetaMask for approval, wait for blockchain confirmation, and only show success message after the transaction is confirmed on-chain.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Bug Condition - Real Position Data and Withdrawal

_For any_ user viewing the `/withdraw` page, the fixed implementation SHALL fetch real staked position data from the smart contract via `useStakeFlow.position` instead of showing mock data, and when the user initiates a withdrawal, SHALL use `useStakeFlow.withdraw()` to send a real transaction to the blockchain.

**Validates: Requirements 2.5, 2.6, 2.7, 2.8**

Property 3: Bug Condition - Real Position Optimization

_For any_ user viewing the `/allocation` page with an existing staked position, the fixed implementation SHALL provide an "Optimize My Position" button that calls `useStakeFlow.optimizePosition()` to execute the optimal allocation on-chain via a real blockchain transaction.

**Validates: Requirements 2.9, 2.10, 2.11**

Property 4: Bug Condition - TVL Auto-Refresh

_For any_ successful transaction (deposit, withdrawal, or optimization from any component), the Dashboard TVL SHALL automatically refetch from the backend API and display the updated value without requiring a manual page reload.

**Validates: Requirements 2.12, 2.13**

Property 5: Preservation - Existing Deposit Flows

_For any_ deposit initiated through components other than the `/deposit` page (such as `OnchainTerminal`), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing transaction handling and user experience.

**Validates: Requirements 3.1, 3.2**

Property 6: Preservation - Validation and Error Handling

_For any_ invalid transaction attempt (amount < 0.01 ETH, wallet not connected, transaction rejected), the fixed code SHALL produce exactly the same error messages and prevent transaction submission, preserving all existing validation logic.

**Validates: Requirements 3.4, 3.5, 3.6**

Property 7: Preservation - Dashboard and Analytics Display

_For any_ Dashboard or Analytics page view where no transaction action has occurred, the fixed code SHALL display TVL and all other metrics exactly as before, preserving all existing data fetching and display logic.

**Validates: Requirements 3.7, 3.8, 3.9**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

---

#### **File 1**: `frontend/src/app/deposit/page.tsx`

**Component**: `DepositPage`

**Specific Changes**:

1. **Import useStakeFlow Hook**: Add `import { useStakeFlow } from '@/hooks/useStakeFlow';` at the top
   - This provides access to real smart contract interaction

2. **Replace Local State with Hook State**: Replace mock state management with real transaction state from `useStakeFlow`
   - Remove: `const [isDepositing, setIsDepositing] = useState(false);`
   - Remove: `const [depositComplete, setDepositComplete] = useState(false);`
   - Add: `const { deposit, isPendingTx, isConnected } = useStakeFlow();`

3. **Replace handleConfirm Function**: Replace the mock `setTimeout` implementation with real blockchain call
   - Remove the entire `handleConfirm` function with `setTimeout`
   - Replace with:
   ```typescript
   async function handleConfirm() {
     const hash = await deposit(amount);
     if (hash) {
       setShowConfirm(false);
       // Success toast is handled by useStakeFlow hook
     }
   }
   ```

4. **Update Wallet Connection Check**: Use `isConnected` from hook instead of assuming connection
   - Add check in `handleDeposit`: `if (!isConnected) { toast.error('Please connect your wallet'); return; }`

5. **Update Modal UI State**: Use `isPendingTx` from hook instead of local `isDepositing` state
   - Replace all references to `isDepositing` with `isPendingTx` in the confirmation modal
   - Remove the `depositComplete` success state - let the modal close after transaction submission

6. **Simplify Success Flow**: Remove the success modal state since the hook handles toast notifications
   - Remove `depositComplete` state and related UI
   - The `useStakeFlow` hook already shows "Transaction Successful! 🚀" toast on confirmation
   - Close the modal after transaction is submitted (not after fake timeout)

---

#### **File 2**: `frontend/src/app/withdraw/page.tsx`

**Component**: `WithdrawPage`

**Specific Changes**:

1. **Import useStakeFlow Hook**: Add `import { useStakeFlow } from '@/hooks/useStakeFlow';` at the top

2. **Replace Mock Data with Real Position**: Remove `STAKED_POSITIONS` constant and use real data
   - Remove: `const STAKED_POSITIONS = [...]` (lines 11-17)
   - Add: `const { position, withdraw, isPendingTx, isConnected } = useStakeFlow();`

3. **Transform Position Data for UI**: Convert the single position object to array format for UI compatibility
   ```typescript
   const stakedPositions = position && parseFloat(position.deposited) > 0 ? [{
     validator: "Your Staked Position",
     amount: parseFloat(position.deposited),
     canWithdraw: parseFloat(position.ethValue),
     locked: Math.max(0, parseFloat(position.deposited) - parseFloat(position.ethValue)),
     apy: 5.2, // Can be fetched from backend or kept as estimate
     color: COLORS[0],
   }] : [];
   ```

4. **Update Calculations**: Use real position data instead of mock array
   - Replace `STAKED_POSITIONS.reduce(...)` with `stakedPositions.reduce(...)`
   - Update `totalStaked`, `totalAvailable`, `totalLocked` calculations

5. **Replace handleConfirm Function**: Replace mock `setTimeout` with real withdrawal
   - Remove the `setTimeout` implementation
   - Replace with:
   ```typescript
   async function handleConfirm() {
     const amountToWithdraw = withdrawType === "partial" 
       ? withdrawAmount 
       : selectedAmount.toString();
     
     const hash = await withdraw(amountToWithdraw);
     if (hash) {
       setShowConfirm(false);
       setSelectedPositions([]);
       setWithdrawAmount("");
       // Success toast is handled by useStakeFlow hook
     }
   }
   ```

6. **Update Modal UI State**: Use `isPendingTx` from hook
   - Replace `isProcessing` state with `isPendingTx` from hook
   - Remove `success` state - let the hook handle success notifications

7. **Add Wallet Connection Check**: Verify wallet is connected before allowing withdrawal
   - Add check in `handleWithdraw`: `if (!isConnected) { toast.error('Please connect your wallet'); return; }`

8. **Handle Empty State**: Show appropriate UI when user has no staked position
   - Add conditional rendering: if `stakedPositions.length === 0`, show "No staked positions found" message

---

#### **File 3**: `frontend/src/app/allocation/page.tsx`

**Component**: `AllocationPage`

**Specific Changes**:

1. **Import useStakeFlow Hook**: Add `import { useStakeFlow } from '@/hooks/useStakeFlow';` at the top

2. **Add Hook to Component**: Get optimize function and transaction state
   - Add: `const { optimizePosition, isPendingTx, isConnected, position } = useStakeFlow();`

3. **Add "Optimize My Position" Button**: Add a prominent button to execute optimization
   - Place button in the "Optimization Engine Overview" card after the allocation bars
   - Button should be disabled if user has no staked position or if transaction is pending
   ```typescript
   <Button3D
     variant="primary"
     size="lg"
     onClick={handleOptimize}
     disabled={!position || parseFloat(position.deposited) === 0 || isPendingTx}
     style={{ width: "100%", marginTop: "32px" }}
   >
     {isPendingTx ? "⚙️ Optimizing..." : "🚀 Optimize My Position"}
   </Button3D>
   ```

4. **Implement handleOptimize Function**: Call the smart contract optimization
   ```typescript
   async function handleOptimize() {
     if (!isConnected) {
       toast.error('Please connect your wallet');
       return;
     }
     
     const hash = await optimizePosition();
     if (hash) {
       // Success toast is handled by useStakeFlow hook
       // Optionally refetch allocation data after success
       fetchAllocation(amount);
     }
   }
   ```

5. **Add Conditional Rendering**: Show appropriate state based on user's position
   - If no position exists, show message: "You need to deposit first before optimizing"
   - If position exists, enable the optimize button

6. **Add Loading State**: Show loading indicator while transaction is pending
   - Use `isPendingTx` to disable button and show "Optimizing..." text

---

#### **File 4**: `frontend/src/app/page.tsx`

**Component**: `Dashboard`

**Specific Changes**:

1. **Add Polling for TVL Updates**: Implement automatic refetch of protocol stats
   - **Option A (Simpler)**: Add polling with `useEffect`:
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       fetchData(); // Refetch protocol stats including TVL
     }, 10000); // Poll every 10 seconds
     
     return () => clearInterval(interval);
   }, []);
   ```

2. **Alternative: Event-Based Refresh**: Use wagmi's contract event watching
   - **Option B (More Efficient)**: Add `useWatchContractEvent` to listen for deposit/withdraw events
   ```typescript
   import { useWatchContractEvent } from 'wagmi';
   
   useWatchContractEvent({
     address: VAULT_ADDRESS,
     abi: VAULT_ABI,
     eventName: 'Deposit', // or 'Withdraw'
     onLogs() {
       fetchData(); // Refetch when events are detected
     },
   });
   ```

3. **Recommended Approach**: Use polling (Option A) for simplicity
   - Polling ensures TVL updates regardless of transaction source
   - 10-second interval provides good balance between freshness and API load
   - Works for deposits from any component (OnchainTerminal, deposit page, etc.)

---

#### **Summary of Changes**:

| File | Lines Changed | Key Changes |
|------|---------------|-------------|
| `deposit/page.tsx` | ~20 lines | Import useStakeFlow, replace mock state, implement real deposit() |
| `withdraw/page.tsx` | ~40 lines | Import useStakeFlow, replace STAKED_POSITIONS with position data, implement real withdraw() |
| `allocation/page.tsx` | ~30 lines | Import useStakeFlow, add "Optimize My Position" button, implement optimizePosition() |
| `page.tsx` (Dashboard) | ~10 lines | Add polling interval to refetch TVL every 10 seconds |

**Total Estimated Changes**: ~100 lines across 4 files

---

## Implementation Guide

This section provides detailed code examples for implementing the fixes.

### Deposit Page Implementation

**Before (Mock Implementation):**
```typescript
const [isDepositing, setIsDepositing] = useState(false);
const [depositComplete, setDepositComplete] = useState(false);

function handleConfirm() {
  setIsDepositing(true);
  setTimeout(() => {
    setIsDepositing(false);
    setDepositComplete(true);
    toast.success("Deposit successful!");
  }, 2000);
}
```

**After (Real Implementation):**
```typescript
import { useStakeFlow } from '@/hooks/useStakeFlow';

const { deposit, isPendingTx, isConnected } = useStakeFlow();

function handleDeposit() {
  if (!isConnected) {
    toast.error('Please connect your wallet');
    return;
  }
  if (numAmount < 0.01) {
    toast.error("Amount is below minimum deposit");
    return;
  }
  setShowConfirm(true);
}

async function handleConfirm() {
  const hash = await deposit(amount);
  if (hash) {
    setShowConfirm(false);
    // Success toast is automatically shown by useStakeFlow
  }
}

// In modal JSX, replace isDepositing with isPendingTx
{isPendingTx ? "⚙️" : "🏦"}
```

### Withdraw Page Implementation

**Before (Mock Data):**
```typescript
const STAKED_POSITIONS = [
  { validator: "Validator Epsilon", amount: 21.92, ... },
  // ... more mock data
];

function handleConfirm() {
  setIsProcessing(true);
  setTimeout(() => {
    setIsProcessing(false);
    setSuccess(true);
  }, 2500);
}
```

**After (Real Data):**
```typescript
import { useStakeFlow } from '@/hooks/useStakeFlow';

const { position, withdraw, isPendingTx, isConnected } = useStakeFlow();

// Transform single position to array format for UI
const stakedPositions = position && parseFloat(position.deposited) > 0 ? [{
  validator: "Your Staked Position",
  amount: parseFloat(position.deposited),
  canWithdraw: parseFloat(position.ethValue),
  locked: Math.max(0, parseFloat(position.deposited) - parseFloat(position.ethValue)),
  apy: 5.2,
  color: COLORS[0],
}] : [];

const totalStaked = stakedPositions.reduce((sum, pos) => sum + pos.amount, 0);
const totalAvailable = stakedPositions.reduce((sum, pos) => sum + pos.canWithdraw, 0);

function handleWithdraw() {
  if (!isConnected) {
    toast.error('Please connect your wallet');
    return;
  }
  if (withdrawType === "partial" && parseFloat(withdrawAmount) > totalAvailable) {
    toast.error("Insufficient Balance");
    return;
  }
  if (withdrawType === "full" && selectedPositions.length === 0) {
    toast.error("Please select a position to withdraw");
    return;
  }
  setShowConfirm(true);
}

async function handleConfirm() {
  const amountToWithdraw = withdrawType === "partial" 
    ? withdrawAmount 
    : selectedAmount.toString();
  
  const hash = await withdraw(amountToWithdraw);
  if (hash) {
    setShowConfirm(false);
    setSelectedPositions([]);
    setWithdrawAmount("");
    // Success toast is automatically shown by useStakeFlow
  }
}

// Handle empty state in JSX
{stakedPositions.length === 0 ? (
  <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
    <p style={{ color: "var(--text-dim)" }}>No staked positions found. Make a deposit first.</p>
  </div>
) : (
  // ... existing position display code
)}
```

### Allocation Page Implementation

**Before (No Execution):**
```typescript
// No useStakeFlow import
// No optimize button
// Only displays allocation data from backend
```

**After (With Execution):**
```typescript
import { useStakeFlow } from '@/hooks/useStakeFlow';

const { optimizePosition, isPendingTx, isConnected, position } = useStakeFlow();

async function handleOptimize() {
  if (!isConnected) {
    toast.error('Please connect your wallet');
    return;
  }
  
  if (!position || parseFloat(position.deposited) === 0) {
    toast.error('You need to deposit first before optimizing');
    return;
  }
  
  const hash = await optimizePosition();
  if (hash) {
    // Success toast is automatically shown by useStakeFlow
    // Optionally refetch allocation data
    fetchAllocation(amount);
  }
}

// Add button in JSX after allocation bars
<Button3D
  variant="primary"
  size="lg"
  onClick={handleOptimize}
  disabled={!position || parseFloat(position.deposited) === 0 || isPendingTx}
  style={{ width: "100%", marginTop: "32px" }}
>
  {isPendingTx ? "⚙️ Optimizing..." : "🚀 Optimize My Position"}
</Button3D>

// Show message if no position
{(!position || parseFloat(position.deposited) === 0) && (
  <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginTop: "12px", textAlign: "center" }}>
    You need to deposit first before optimizing your position
  </p>
)}
```

### Dashboard Polling Implementation

**Before (No Auto-Refresh):**
```typescript
useEffect(() => {
  fetchData();
}, []);
```

**After (With Polling):**
```typescript
useEffect(() => {
  fetchData(); // Initial fetch
  
  const interval = setInterval(() => {
    fetchData(); // Refetch every 10 seconds
  }, 10000);
  
  return () => clearInterval(interval); // Cleanup on unmount
}, []);
```

### Transaction State Handling

All three pages will now properly handle transaction states:

1. **Pending State**: Button shows loading indicator, disabled during transaction
2. **Confirmation State**: useStakeFlow shows "Transaction Confirming..." toast
3. **Success State**: useStakeFlow shows "Transaction Successful! 🚀" toast
4. **Error State**: useStakeFlow shows error toast with message

### Key Integration Points

**useStakeFlow Hook Provides:**
- `deposit(amount)` - Send deposit transaction
- `withdraw(amount)` - Send withdrawal transaction
- `optimizePosition()` - Send optimization transaction
- `position` - User's current staked position data
- `isPendingTx` - Boolean indicating transaction in progress
- `isConnected` - Boolean indicating wallet connection status
- `txHash` - Current transaction hash (if any)

**All three pages should:**
1. Import and use `useStakeFlow` hook
2. Check `isConnected` before allowing operations
3. Use `isPendingTx` to show loading states
4. Call appropriate transaction function (deposit/withdraw/optimizePosition)
5. Let the hook handle toast notifications
6. Close modals/reset state after transaction submission

### Transaction Flow Diagram

```
User Action (Deposit/Withdraw/Optimize)
    ↓
Check isConnected
    ↓ (if false)
Show "Please connect your wallet" error
    ↓ (if true)
Call useStakeFlow function (deposit/withdraw/optimizePosition)
    ↓
MetaMask prompts user for approval
    ↓ (if rejected)
useStakeFlow shows error toast
    ↓ (if approved)
Transaction submitted to blockchain
    ↓
isPendingTx = true (button shows loading state)
    ↓
useStakeFlow shows "Transaction Confirming..." toast
    ↓
Wait for blockchain confirmation
    ↓ (if confirmed)
useStakeFlow shows "Transaction Successful! 🚀" toast
isPendingTx = false
    ↓
Dashboard polling refetches TVL within 10 seconds
    ↓
TVL updates automatically on Dashboard
```

### TVL Update Mechanism

**How TVL Updates Work:**

1. **Transaction Execution**: User completes deposit/withdraw/optimize on any page
2. **Smart Contract Update**: Transaction is confirmed on blockchain, contract state changes
3. **Backend Sync**: Backend API reads updated state from smart contract
4. **Dashboard Polling**: Dashboard polls backend every 10 seconds via `setInterval`
5. **UI Update**: Dashboard displays new TVL value

**Why Polling Instead of Events:**

- Simpler implementation (no need to listen to multiple event types)
- Works for transactions from any source (OnchainTerminal, deposit page, external wallets)
- Backend API is the single source of truth for TVL
- 10-second interval provides good balance between freshness and API load

**Alternative Approach (Event-Based):**

If polling is not desired, can use wagmi's `useWatchContractEvent`:

```typescript
import { useWatchContractEvent } from 'wagmi';
import { VAULT_ADDRESS, VAULT_ABI } from '@/lib/contracts';

useWatchContractEvent({
  address: VAULT_ADDRESS,
  abi: VAULT_ABI,
  eventName: 'Deposit',
  onLogs() {
    fetchData(); // Refetch when Deposit event detected
  },
});

useWatchContractEvent({
  address: VAULT_ADDRESS,
  abi: VAULT_ABI,
  eventName: 'Withdraw',
  onLogs() {
    fetchData(); // Refetch when Withdraw event detected
  },
});
```

However, this requires knowing all event names and may miss transactions from external sources.

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate the three buggy flows (deposit, withdraw, optimize) and verify that no real blockchain transactions occur. Run these tests on the UNFIXED code to observe the mock behavior.

**Test Cases**:

**Deposit Page Tests:**
1. **Mock Deposit Test**: Navigate to `/deposit`, enter 1 ETH, click Execute, verify no MetaMask prompt appears (will pass on unfixed code, confirming the bug)
2. **No Transaction Hash Test**: Complete mock deposit, verify no transaction hash is generated (will pass on unfixed code)
3. **TVL Unchanged Test**: Complete mock deposit, check Dashboard TVL, verify it remains 0.00 ETH (will pass on unfixed code)
4. **Timeout Verification Test**: Measure time from "Execute" click to success message, verify it's exactly 2 seconds (will pass on unfixed code, confirming setTimeout usage)

**Withdraw Page Tests:**
5. **Mock Position Data Test**: Open `/withdraw` page, verify it shows hardcoded STAKED_POSITIONS array (Epsilon, Beta, Alpha, Gamma, Delta) regardless of actual smart contract state (will pass on unfixed code)
6. **Mock Withdrawal Test**: Select a position, click Withdraw, verify no MetaMask prompt appears (will pass on unfixed code)
7. **Fake Success Test**: Complete mock withdrawal, verify success message appears after exactly 2.5 seconds without blockchain transaction (will pass on unfixed code)
8. **Position Persistence Test**: Complete mock withdrawal, verify the mock positions remain unchanged (will pass on unfixed code)

**Allocation Page Tests:**
9. **Missing Button Test**: Navigate to `/allocation` page, verify no "Optimize My Position" button exists (will pass on unfixed code)
10. **No Execution Path Test**: Verify there's no way to execute the optimal allocation on-chain (will pass on unfixed code)
11. **Backend Integration Test**: Verify the page fetches allocation from backend API but provides no execution mechanism (will pass on unfixed code)

**Expected Counterexamples**:
- No MetaMask transaction approval prompts appear for any operation
- Success messages appear after fixed timeouts regardless of blockchain state
- Dashboard TVL does not update after "successful" operations
- Withdraw page shows fake positions that don't match smart contract state
- Allocation page has no way to execute optimizations on-chain
- Possible causes: mock implementations with setTimeout, no useStakeFlow integration, no transaction state tracking, hardcoded mock data

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  IF input.page == '/deposit' THEN
    result := depositPage_fixed.handleConfirm(input.amount)
    ASSERT metaMaskPromptAppears(result)
    ASSERT transactionSentToBlockchain(result)
    ASSERT successMessageOnlyAfterConfirmation(result)
    ASSERT dashboardTVLUpdates(result)
  
  ELSE IF input.page == '/withdraw' THEN
    result := withdrawPage_fixed.handleConfirm(input.amount)
    ASSERT realPositionDataDisplayed()
    ASSERT metaMaskPromptAppears(result)
    ASSERT transactionSentToBlockchain(result)
    ASSERT positionDataUpdatesAfterConfirmation(result)
    ASSERT dashboardTVLUpdates(result)
  
  ELSE IF input.page == '/allocation' THEN
    result := allocationPage_fixed.handleOptimize()
    ASSERT optimizeButtonExists()
    ASSERT metaMaskPromptAppears(result)
    ASSERT transactionSentToBlockchain(result)
    ASSERT allocationUpdatesAfterConfirmation(result)
    ASSERT dashboardTVLUpdates(result)
  END IF
END FOR
```

**Test Cases**:

**Deposit Page Tests:**
1. **Real Transaction Test**: Deposit 1 ETH, verify MetaMask prompts for approval
2. **Blockchain Confirmation Test**: Approve transaction, verify "Transaction Confirming..." appears
3. **Success After Confirmation Test**: Wait for confirmation, verify success message only appears after blockchain confirms
4. **TVL Update Test**: After successful deposit, verify Dashboard TVL increases by deposit amount
5. **Multiple Deposits Test**: Perform 2 deposits sequentially, verify TVL accumulates correctly

**Withdraw Page Tests:**
6. **Real Position Data Test**: Open withdraw page after making a deposit, verify it shows actual position from smart contract (not mock data)
7. **Real Withdrawal Transaction Test**: Select position and withdraw 1 ETH, verify MetaMask prompts for approval
8. **Withdrawal Confirmation Test**: Approve transaction, verify "Transaction Confirming..." appears
9. **Position Update Test**: After successful withdrawal, verify position data updates to reflect new balance
10. **TVL Decrease Test**: After successful withdrawal, verify Dashboard TVL decreases by withdrawal amount
11. **Empty State Test**: Open withdraw page with no staked position, verify appropriate empty state message

**Allocation Page Tests:**
12. **Optimize Button Exists Test**: Verify "Optimize My Position" button is present on allocation page
13. **Optimize Transaction Test**: Click optimize button, verify MetaMask prompts for approval
14. **Optimize Confirmation Test**: Approve transaction, verify "Calculating optimal AI paths on-chain..." message appears
15. **Allocation Update Test**: After successful optimization, verify allocation data updates
16. **TVL Consistency Test**: After optimization, verify TVL remains consistent (optimization redistributes, doesn't change total)

**General Tests:**
17. **Cross-Component TVL Update Test**: Deposit via OnchainTerminal, verify Dashboard TVL updates automatically
18. **Polling Test**: Verify Dashboard refetches TVL every 10 seconds
19. **Transaction State Test**: Verify all three pages properly track transaction pending state

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalBehavior(input) = fixedBehavior(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-buggy interactions, then write property-based tests capturing that behavior.

**Test Cases**:

**Preservation of Existing Components:**
1. **OnchainTerminal Preservation**: Verify deposits through `OnchainTerminal` work identically before and after fix
2. **Analytics Page Preservation**: Verify `/analytics` page displays data identically before and after fix
3. **Validator Details Preservation**: Verify validator detail pages work identically before and after fix

**Preservation of Validation Logic:**
4. **Minimum Deposit Preservation**: Test deposits with amount < 0.01 ETH, verify same error message appears
5. **Wallet Disconnected Preservation**: Test operations without wallet connected, verify same error appears for all three pages
6. **Transaction Rejection Preservation**: Reject MetaMask transactions, verify same error handling occurs for all operations

**Preservation of UI and Navigation:**
7. **Dashboard View Preservation**: View Dashboard without making transactions, verify all displays remain identical
8. **Navigation Preservation**: Navigate between pages, verify routing and transitions remain unchanged
9. **Validator Selection Preservation**: Test validator dropdown on deposit page, verify it works identically
10. **Allocation Calculation Preservation**: Verify backend API integration for allocation calculation remains unchanged

**Preservation of Visual Elements:**
11. **Animation Preservation**: Verify all Framer Motion animations work identically
12. **3D Components Preservation**: Verify Card3D, Button3D, and Charts3D components render identically
13. **Styling Preservation**: Verify all CSS classes and inline styles remain unchanged

### Unit Tests

**Deposit Page:**
- Test deposit page renders correctly with all form elements
- Test amount input validation (minimum 0.01 ETH)
- Test wallet connection check before deposit
- Test MetaMask transaction approval flow
- Test transaction confirmation waiting state
- Test success toast notification after confirmation

**Withdraw Page:**
- Test withdraw page renders correctly with position data
- Test empty state when no positions exist
- Test position data fetching from useStakeFlow.position
- Test partial withdrawal amount validation
- Test full position selection logic
- Test MetaMask transaction approval for withdrawals
- Test position data refresh after successful withdrawal

**Allocation Page:**
- Test allocation page renders with backend data
- Test "Optimize My Position" button exists and is clickable
- Test button disabled state when no position exists
- Test MetaMask transaction approval for optimization
- Test loading state during optimization transaction
- Test allocation data refresh after successful optimization

**Dashboard:**
- Test Dashboard TVL fetch and display
- Test Dashboard polling mechanism (10-second interval)
- Test TVL updates after transactions from any source

**General:**
- Test useStakeFlow hook integration in all three pages
- Test error handling for failed transactions
- Test error handling for rejected transactions
- Test wallet connection state across all pages

### Property-Based Tests

**Deposit Operations:**
- Generate random deposit amounts (>= 0.01 ETH) and verify all trigger real transactions with MetaMask prompts
- Generate random invalid amounts (< 0.01 ETH) and verify all show error messages without transaction attempts
- Generate random sequences of deposits and verify TVL accumulates correctly

**Withdraw Operations:**
- Generate random withdrawal amounts within available balance and verify all trigger real transactions
- Generate random withdrawal amounts exceeding balance and verify all show error messages
- Generate random sequences of deposits and withdrawals and verify position data updates correctly

**Allocation Operations:**
- Generate random initial deposit amounts and verify optimization works for all amounts
- Test optimization with various position states (small, medium, large deposits)
- Verify optimization preserves total TVL (redistributes without changing total)

**Preservation Testing:**
- Test that all non-transaction Dashboard interactions produce identical results before and after fix
- Test that all Analytics page interactions produce identical results before and after fix
- Test that validator selection and UI interactions produce identical results before and after fix
- Generate random navigation sequences and verify all pages render identically

### Integration Tests

**Full Deposit Flow:**
- Test full deposit flow: navigate to `/deposit`, enter amount, approve MetaMask, wait for confirmation, verify success
- Test deposit then navigate to Dashboard, verify TVL displays updated value
- Test deposit then navigate to withdraw page, verify position appears with correct amount

**Full Withdraw Flow:**
- Test full withdraw flow: make deposit, navigate to `/withdraw`, verify position appears, select withdrawal, approve MetaMask, verify success
- Test withdraw then check Dashboard, verify TVL decreases correctly
- Test partial withdrawal, verify remaining position is correct
- Test full withdrawal, verify position becomes empty

**Full Allocation Flow:**
- Test full allocation flow: make deposit, navigate to `/allocation`, view optimal allocation, click "Optimize My Position", approve MetaMask, verify success
- Test allocation then check Dashboard, verify TVL remains consistent
- Test allocation multiple times, verify each optimization executes correctly

**Cross-Page Flows:**
- Test deposit from OnchainTerminal, verify Dashboard updates automatically
- Test multiple deposits from different pages, verify all update Dashboard TVL
- Test deposit → optimize → withdraw sequence, verify all operations work correctly
- Test concurrent operations (if applicable), verify state management is correct

**Error Handling Flows:**
- Test deposit with transaction failure, verify error handling and TVL unchanged
- Test withdraw with insufficient balance, verify error message and no transaction
- Test optimize with no position, verify button is disabled and shows appropriate message
- Test all operations with wallet disconnected, verify consistent error messages

**Dashboard Refresh:**
- Test Dashboard polling: make deposit, wait 10 seconds, verify TVL updates without manual refresh
- Test Dashboard updates from multiple transaction sources
- Test Dashboard displays correct data after page reload
