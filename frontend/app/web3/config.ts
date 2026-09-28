import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { SUPPORTED_CHAINS } from './chains';

export const config = getDefaultConfig({
  appName: 'Financial Intelligence',
  projectId: '05220c8f955724702213f75b1c916491',
  chains: SUPPORTED_CHAINS,
  ssr: true,
});
