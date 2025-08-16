import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const wagmiConfig = createConfig(
  getDefaultConfig({
    // Your dApp's chains
    chains: [base],
    transports: {
      // RPC URL for each chain
      [base.id]: http(),
    },

    // Required API Keys
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'placeholder-project-id',

    // Required App Info
    appName: "Buy Me a Coffee",

    // Optional App Info
    appDescription: "Support creators with USDC donations on Base network",
    appUrl: typeof window !== 'undefined' ? window.location.origin : "https://buymeacoffee.replit.app",
    appIcon: "https://family.co/logo.png", // Using placeholder for now
  }),
);
