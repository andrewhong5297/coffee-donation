import { useQuery } from '@tanstack/react-query';
import { HerdAPI } from '@/lib/herd-api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Check, Coffee, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AllExecutions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['all-executions'],
    queryFn: () => HerdAPI.getAllExecutions(),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold coffee-text-800 mb-4 flex items-center">
            <Coffee className="coffee-text-500 mr-2 w-4 h-4" />
            Recent Community Donations
          </h4>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 coffee-bg-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold coffee-text-800 mb-4 flex items-center">
            <Coffee className="coffee-text-500 mr-2 w-4 h-4" />
            Recent Community Donations
          </h4>
          <div className="text-center py-8 coffee-text-500">
            <p className="text-sm">Failed to load community donations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract all executions from all wallets
  const allWalletExecutions = data?.executions ? Object.entries(data.executions) : [];

  return (
    <Card>
      <CardContent className="p-6">
        <h4 className="font-semibold coffee-text-800 mb-4 flex items-center">
          <Coffee className="coffee-text-500 mr-2 w-4 h-4" />
          Recent Community Donations
        </h4>
        
        {(() => {
          // Get all actual donation steps across all wallets and executions
          const allDonationSteps = allWalletExecutions.flatMap(([walletAddress, walletData]) => 
            walletData.executions.flatMap((execution) =>
              (execution.steps || [])
                .filter(step => 
                  step.stepNumber > 0 && 
                  step.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
                )
                .map(step => ({
                  ...step,
                  walletAddress,
                  farcasterData: walletData.farcasterData
                }))
            )
          );

          // Sort by creation date, most recent first
          const sortedSteps = allDonationSteps.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Take only the most recent 10 donations
          const recentSteps = sortedSteps.slice(0, 10);

          return recentSteps.length === 0 ? (
            <div className="text-center py-8 coffee-text-500">
              <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No community donations yet</p>
              <p className="text-xs">Community donations will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSteps.map((step, index) => (
                <div key={`${step.id}-${index}`} className="flex items-center justify-between p-3 coffee-bg-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {step.farcasterData?.pfp_url ? (
                      <img 
                        src={step.farcasterData.pfp_url} 
                        alt={step.farcasterData.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="text-green-600 w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium coffee-text-800">
                        USDC Donation
                      </p>
                      <div className="flex items-center space-x-2 text-xs coffee-text-500">
                        <span>{formatDistanceToNow(new Date(step.createdAt), { addSuffix: true })}</span>
                        <span>•</span>
                        {step.farcasterData?.username ? (
                          <>
                            <a 
                              href={`https://farcaster.com/${step.farcasterData.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:coffee-text-600 transition-colors"
                            >
                              {step.farcasterData.username}
                            </a>
                            <span>•</span>
                            <a 
                              href={`https://herd.eco/base/wallet/${step.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:coffee-text-600 transition-colors"
                            >
                              {step.walletAddress.slice(0, 6)}...{step.walletAddress.slice(-4)}
                            </a>
                          </>
                        ) : (
                          <a 
                            href={`https://herd.eco/base/wallet/${step.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:coffee-text-600 transition-colors"
                          >
                            {step.walletAddress.slice(0, 6)}...{step.walletAddress.slice(-4)}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://herd.eco/base/tx/${step.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}