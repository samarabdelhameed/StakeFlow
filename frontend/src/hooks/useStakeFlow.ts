'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { VAULT_ADDRESS, VAULT_ABI } from '@/lib/contracts';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

export function useStakeFlow() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  // Local state for optimistic UI updates & transaction tracking
  const [isPendingTx, setIsPendingTx] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Fetch Transaction Status
  const { isLoading: isWaiting, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle Toast Notifications & States
  useEffect(() => {
    if (isWaiting) {
      toast.loading('Transaction Confirming...', { id: txHash });
    }
    if (isConfirmed) {
      toast.success('Transaction Successful! 🚀', { id: txHash });
      setIsPendingTx(false);
      setTxHash(undefined);
    }
  }, [isWaiting, isConfirmed, txHash]);

  // View: Get User Position
  const { data: rawPosition, refetch: refetchPosition } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'getUserPosition',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const position = rawPosition ? {
    deposited: formatEther((rawPosition as any).deposited),
    ethValue: formatEther((rawPosition as any).ethValue),
    shares: formatEther((rawPosition as any).shares),
    canWithdraw: (rawPosition as any).canWithdraw,
  } : null;

  // View: TVL
  const { data: totalValueLocked } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'totalValueLocked',
  });

  // ACTION: Deposit
  const deposit = async (amountEth: string) => {
    if (!isConnected) return toast.error('Please connect your wallet');
    try {
      setIsPendingTx(true);
      const hash = await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'deposit',
        value: parseEther(amountEth),
      });
      setTxHash(hash);
      return hash;
    } catch (err: any) {
      toast.error(err.shortMessage || err.message);
      setIsPendingTx(false);
    }
  };

  // ACTION: Withdraw
  const withdraw = async (amountEth: string) => {
    if (!isConnected) return toast.error('Please connect your wallet');
    try {
      setIsPendingTx(true);
      const hash = await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'withdrawETH',
        args: [parseEther(amountEth)],
      });
      setTxHash(hash);
      return hash;
    } catch (err: any) {
      toast.error(err.shortMessage || err.message);
      setIsPendingTx(false);
    }
  };

  // ACTION: Optimize Position (AI Execution)
  const optimizePosition = async () => {
    if (!isConnected) return toast.error('Please connect your wallet');
    try {
      setIsPendingTx(true);
      const toastId = toast.loading('Calculating optimal AI paths on-chain...');
      
      const hash = await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'optimizeMyPosition',
      });
      
      toast.dismiss(toastId);
      setTxHash(hash);
      return hash;
    } catch (err: any) {
      toast.error(err.shortMessage || err.message);
      setIsPendingTx(false);
    }
  };

  return {
    isConnected,
    isPendingTx: isPendingTx || isWaiting,
    txHash,
    position,
    tvl: totalValueLocked ? formatEther(totalValueLocked as bigint) : '0',
    deposit,
    withdraw,
    optimizePosition,
    refetchPosition,
  };
}
