import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Simple configuration focusing on injected wallet connections
export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    injected({
      target: 'injected',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});
