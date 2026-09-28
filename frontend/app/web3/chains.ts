import { arbitrumSepolia, arbitrum } from 'wagmi/chains';

export const SUPPORTED_CHAINS = [arbitrumSepolia, arbitrum] as const;

export const DEFAULT_CHAIN = arbitrumSepolia;

export function getExplorerUrl(chainId: number) {
  if (chainId === arbitrum.id) return arbitrum.blockExplorers.default.url;
  if (chainId === arbitrumSepolia.id) return arbitrumSepolia.blockExplorers.default.url;
  return arbitrumSepolia.blockExplorers.default.url;
}
