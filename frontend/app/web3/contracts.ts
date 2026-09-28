import { arbitrumSepolia, arbitrum } from 'wagmi/chains';

export const CONTRACTS = {
  [arbitrumSepolia.id]: {
    protocol: '0x0000000000000000000000000000000000000000',
    usdc: '0x0000000000000000000000000000000000000000',
    usdg: '0x0000000000000000000000000000000000000000',
  },
  [arbitrum.id]: {
    protocol: '0x0000000000000000000000000000000000000000',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Native USDC on Arb One
    usdg: '0x0000000000000000000000000000000000000000',
  },
} as const;

export const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address","name": "account","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "spender","type": "address"},
      {"internalType": "uint256","name": "amount","type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "owner","type": "address"},
      {"internalType": "address","name": "spender","type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
