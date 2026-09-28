import React from 'react';

export interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
}

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token;
  onSelect: (token: Token) => void;
}

export function TokenSelector({ tokens, selectedToken, onSelect }: TokenSelectorProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-sm text-gray-400 px-1">Select Asset</span>
      <div className="relative bg-[#13111c] border border-gray-800 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
        <select
          value={selectedToken.symbol}
          onChange={(e) => {
            const tk = tokens.find(t => t.symbol === e.target.value);
            if (tk) onSelect(tk);
          }}
          className="w-full bg-transparent text-white px-4 py-3 outline-none text-lg appearance-none cursor-pointer"
        >
          {tokens.map((token) => (
            <option key={token.symbol} value={token.symbol} className="bg-[#13111c]">
              {token.symbol} - {token.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          ▼
        </div>
      </div>
    </div>
  );
}
