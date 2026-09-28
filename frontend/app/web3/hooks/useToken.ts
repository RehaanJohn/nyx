import { useReadContract, useAccount } from 'wagmi';
import { ERC20_ABI } from '../contracts';
import { formatTokenBalance } from '../utils/formatters';

export function useTokenBalance(tokenAddress: `0x${string}`, decimals = 18) {
  const { address } = useAccount();

  const { data: balance, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    }
  });

  const formattedBalance = formatTokenBalance(balance as bigint | undefined, decimals);

  return { balance: balance as bigint | undefined, formattedBalance, isLoading, refetch };
}

export function useTokenAllowance(tokenAddress: `0x${string}`, spenderAddress: `0x${string}`) {
  const { address } = useAccount();

  const { data: allowance, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress] : undefined,
    query: {
      enabled: !!address && !!tokenAddress && !!spenderAddress,
    }
  });

  return { allowance: allowance as bigint | undefined, isLoading, refetch };
}
