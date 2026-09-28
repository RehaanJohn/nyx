import React from 'react';
import { useTokenBalance } from '../../web3/hooks/useToken';

interface BalanceDisplayProps {
  tokenAddress: `0x${string}`;
  decimals?: number;
  symbol: string;
}

export function BalanceDisplay({ tokenAddress, decimals = 18, symbol }: BalanceDisplayProps) {
  const { formattedBalance, isLoading } = useTokenBalance(tokenAddress, decimals);

  return (
    <div className="flex items-center gap-2 p-4 bg-[#13111c] border border-gray-800 rounded-xl">
      <div className="flex-1">
        <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Available Balance</div>
        <div className="text-xl font-bold text-white">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            formattedBalance
          )} <span className="text-indigo-400 text-sm ml-1">{symbol}</span>
        </div>
      </div>
    </div>
  );
}
