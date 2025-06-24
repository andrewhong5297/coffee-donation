import { useExecutionHistory } from '@/hooks/use-herd-trail';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Check, Coffee, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ExecutionHistory() {
  const { data, isLoading, error } = useExecutionHistory();

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

  const executions = data?.executions || [];

  return (
    <Card>
      <CardContent className="p-6">
        <h4 className="font-semibold coffee-text-800 mb-4 flex items-center">
          <Clock className="coffee-text-500 mr-2 w-4 h-4" />
          Your Donations
        </h4>
        
        {executions.length === 0 ? (
          <div className="text-center py-8 coffee-text-500">
            <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No donations yet</p>
            <p className="text-xs">Your donation history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => (
              <div key={execution.id} className="flex items-center justify-between p-3 coffee-bg-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="text-green-600 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium coffee-text-800">
                      {execution.finalInputValues?.amount ? 
                        `$${execution.finalInputValues.amount} USDC` : 
                        'USDC Donation'
                      }
                    </p>
                    <p className="text-xs coffee-text-500">
                      {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://basescan.org/tx/${execution.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
