export function shortenAddress(address: string | undefined, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTokenBalance(balance: bigint | undefined, decimals = 18, fractionDigits = 4): string {
  if (balance === undefined) return '0.00';
  const val = Number(balance) / (10 ** decimals);
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
  }).format(val);
}
