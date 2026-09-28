import React, { useState } from 'react';

interface TokenAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  maxBalance?: string;
  symbol: string;
  disabled?: boolean;
}

export function TokenAmountInput({ value, onChange, maxBalance, symbol, disabled }: TokenAmountInputProps) {
  const handleMaxClick = () => {
    if (maxBalance) {
      onChange(maxBalance);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-sm text-gray-400 px-1">
        <span>Amount</span>
        {maxBalance && (
          <span className="cursor-pointer hover:text-indigo-400 transition-colors" onClick={handleMaxClick}>
            Balance: {maxBalance}
          </span>
        )}
      </div>
      <div className="relative flex items-center bg-[#13111c] border border-gray-800 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
        <input
          type="number"
          placeholder="0.0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-transparent text-white px-4 py-3 outline-none text-lg placeholder-gray-600 disabled:opacity-50"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {maxBalance && (
            <button
              onClick={handleMaxClick}
              disabled={disabled}
              className="text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
            >
              MAX
            </button>
          )}
          <span className="font-semibold text-gray-300 px-2">{symbol}</span>
        </div>
      </div>
    </div>
  );
}
