import { useExecutionHistory, useDonationAmounts } from '@/hooks/use-herd-trail';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Check, Coffee, ExternalLink, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Generate random background color for avatars without Farcaster profiles
const getRandomAvatarColor = (walletAddress: string) => {
  const colors = [
    'bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100',
    'bg-pink-100', 'bg-indigo-100', 'bg-orange-100', 'bg-teal-100', 'bg-cyan-100'
  ];
  const textColors = [
    'text-red-600', 'text-blue-600', 'text-green-600', 'text-yellow-600', 'text-purple-600',
    'text-pink-600', 'text-indigo-600', 'text-orange-600', 'text-teal-600', 'text-cyan-600'
  ];
  
  // Use wallet address to consistently generate the same color for the same address
  const index = parseInt(walletAddress.slice(-1), 16) % colors.length;
  return { bgColor: colors[index], textColor: textColors[index] };
};

export function ExecutionHistory() {
  const { data, isLoading, error } = useExecutionHistory();
  const { address } = useAccount();
  const { data: donationAmounts } = useDonationAmounts();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
  const userWalletData = normalizedAddress && data?.walletExecutions ? 
    data.walletExecutions.find(wallet => wallet.walletAddress.toLowerCase() === normalizedAddress) : null;
  
  const userExecutions = userWalletData?.executions || [];
  const userFarcasterData = userWalletData?.farcasterData || null;



  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h4 className="font-semibold coffee-text-800 mb-4 flex items-center">
          <Clock className="coffee-text-500 mr-2 w-4 h-4" />
          Your Donations
        </h4>
        
{(() => {
          // Get all actual donation steps across user's executions
          const allDonationSteps = userExecutions.flatMap((execution: any) => 
            (execution.steps || [])
              .filter((step: any) => 
                step.stepNumber > 0 && 
                step.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
              )
              .map((step: any) => ({
                ...step,
                executionId: execution.id
              }))
          );

          // Sort by creation date, most recent first
          const sortedSteps = allDonationSteps.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Calculate pagination
          const totalSteps = sortedSteps.length;
          const totalPages = Math.ceil(totalSteps / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const currentSteps = sortedSteps.slice(startIndex, endIndex);

          return totalSteps === 0 ? (
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
            <>
              <div className="space-y-3">
                {currentSteps.map((step: any, index: number) => (
                <div key={`${step.txHash}-${index}`} className="flex items-center justify-between p-3 coffee-bg-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {userFarcasterData?.pfp_url ? (
                      <img 
                        src={userFarcasterData.pfp_url} 
                        alt={userFarcasterData.username || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      (() => {
                        const { bgColor, textColor } = getRandomAvatarColor(normalizedAddress || '');
                        return (
                          <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
                            <User className={`${textColor} w-4 h-4`} />
                          </div>
                        );
                      })()
                    )}
                    <div>
                      <p className="text-sm font-medium coffee-text-800">
                        Donated ${donationAmounts?.[`${normalizedAddress}-${step.executionId}`]?.toFixed(2) || '5.00'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs coffee-text-500">
                        <span>{formatDistanceToNow(new Date(step.createdAt), { addSuffix: true })}</span>
                        {userFarcasterData?.username && (
                          <>
                            <span>•</span>
                            <a 
                              href={`https://farcaster.xyz/${userFarcasterData.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:coffee-text-600 transition-colors"
                            >
                              {userFarcasterData.username}
                            </a>
                          </>
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
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t coffee-border-200">
                  <div className="text-xs coffee-text-500">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalSteps)} of {totalSteps} donations
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3"
                    >
                      Next
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </CardContent>
    </Card>
  );
}
