import { getExplorerUrl } from '../chains';

export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const baseUrl = getExplorerUrl(chainId);
  return `${baseUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(chainId: number, address: string): string {
  const baseUrl = getExplorerUrl(chainId);
  return `${baseUrl}/address/${address}`;
}

export function getExplorerTokenUrl(chainId: number, tokenAddress: string): string {
  const baseUrl = getExplorerUrl(chainId);
  return `${baseUrl}/token/${tokenAddress}`;
}
