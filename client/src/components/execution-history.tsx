import { useExecutionHistory } from '@/hooks/use-herd-trail';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Check, Coffee, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ExecutionHistory() {
  const { data, isLoading, error } = useExecutionHistory();
  const { address } = useAccount();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold coffee-text-800 mb-4 flex items-center">
            <Clock className="coffee-text-500 mr-2 w-4 h-4" />
            Your Donations
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
            <Clock className="coffee-text-500 mr-2 w-4 h-4" />
            Your Donations
          </h4>
          <div className="text-center py-8 coffee-text-500">
            <p className="text-sm">Failed to load donation history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract executions for the connected wallet - normalize address to lowercase
  const normalizedAddress = address?.toLowerCase();
  const addressKey = normalizedAddress && data?.executions ? 
    Object.keys(data.executions).find(key => key.toLowerCase() === normalizedAddress) : null;
  
  const userExecutions = addressKey && data?.executions?.[addressKey] 
    ? data.executions[addressKey].executions 
    : [];
  
  const userFarcasterData = addressKey && data?.executions?.[addressKey] 
    ? data.executions[addressKey].farcasterData 
    : null;



  return (
    <Card>
      <CardContent className="p-6">
        <h4 className="font-semibold coffee-text-800 mb-4 flex items-center">
          <Clock className="coffee-text-500 mr-2 w-4 h-4" />
          Your Donations
        </h4>
        
{(() => {
          // Get all actual donation steps across user's executions
          const allDonationSteps = userExecutions.flatMap((execution) => 
            (execution.steps || []).filter(step => 
              step.stepNumber > 0 && 
              step.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
            )
          );

          return allDonationSteps.length === 0 ? (
            address ? (
              <div className="text-center py-8 coffee-text-500">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No donations yet</p>
                <p className="text-xs">Your donations will appear here</p>
              </div>
            ) : (
              <div className="text-center py-8 coffee-text-500">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Connect wallet to see your donations</p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {allDonationSteps.map((step) => (
                <div key={step.id} className="flex items-center justify-between p-3 coffee-bg-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {userFarcasterData?.pfp_url ? (
                      <img 
                        src={userFarcasterData.pfp_url} 
                        alt={userFarcasterData.username || 'User'}
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
                        {userFarcasterData?.username ? (
                          <>
                            <a 
                              href={`https://farcaster.com/${userFarcasterData.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:coffee-text-600 transition-colors"
                            >
                              {userFarcasterData.username}
                            </a>
                            <span>•</span>
                            <a 
                              href={`https://herd.eco/base/wallet/${address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:coffee-text-600 transition-colors"
                            >
                              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                            </a>
                          </>
                        ) : (
                          <a 
                            href={`https://herd.eco/base/wallet/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:coffee-text-600 transition-colors"
                          >
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
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
