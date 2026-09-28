import { useState, useCallback } from 'react';
import { useWriteContract, useChainId, usePublicClient } from 'wagmi';
import { toast } from 'sonner';
import { getExplorerTxUrl } from '../utils/explorer';

export type TransactionStatus = 'idle' | 'preparing' | 'confirming' | 'pending' | 'success' | 'error';

export function useTransaction() {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const execute = useCallback(async (
    contractArgs: Parameters<typeof writeContractAsync>[0],
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
      successMessage?: string;
    }
  ) => {
    let toastId: string | number | undefined;
    
    try {
      setStatus('preparing');
      toastId = toast.loading('Confirm in wallet...', {
        description: 'Please sign the transaction.'
      });
      setStatus('confirming');
      
      const hash = await writeContractAsync(contractArgs);
      setTxHash(hash);
      setStatus('pending');
      
      toast.loading('Transaction pending...', {
        id: toastId,
        description: 'Waiting for network confirmation...',
        action: {
          label: 'View on Explorer',
          onClick: () => window.open(getExplorerTxUrl(chainId, hash), '_blank')
        }
      });

      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status === 'success') {
          setStatus('success');
          toast.success(options?.successMessage || 'Transaction successful!', {
            id: toastId,
            description: 'Your transaction has been confirmed.',
            action: {
              label: 'View on Explorer',
              onClick: () => window.open(getExplorerTxUrl(chainId, hash), '_blank')
            }
          });
          options?.onSuccess?.();
        } else {
          throw new Error('Transaction reverted');
        }
      }
      return hash;
    } catch (error: any) {
      setStatus('error');
      if (error?.message?.includes('User rejected') || error?.code === 4001) {
        toast.dismiss(toastId);
        toast.info('Transaction cancelled');
      } else {
        toast.error('Transaction failed', {
          id: toastId,
          description: error.shortMessage || error.message || 'An unknown error occurred.'
        });
      }
      options?.onError?.(error);
      throw error;
    }
  }, [writeContractAsync, publicClient, chainId]);

  return { execute, status, txHash };
}
