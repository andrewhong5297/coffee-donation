import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, Check } from 'lucide-react';

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.type === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnected && address) {
    return (
      <Button
        onClick={handleDisconnect}
        className="coffee-bg-500 hover:coffee-bg-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
      >
        <Check className="w-4 h-4" />
        <span>Connected</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isPending}
      className="coffee-bg-500 hover:coffee-bg-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
    >
      <Wallet className="w-4 h-4" />
      <span>{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
    </Button>
  );
}
