import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HerdAPI, type EvaluationRequest, type ExecutionRequest, type ReadNodeRequest } from '@/lib/herd-api';
import { useAccount } from 'wagmi';

export function useExecutionHistory() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['execution-history', address],
    queryFn: () => address ? HerdAPI.getExecutionHistory(address) : Promise.resolve({ totals: { transactions: 0, wallets: 0 }, executions: {} }),
    enabled: !!address,
  });
}

export function useEvaluateInputs() {
  return useMutation({
    mutationFn: (request: EvaluationRequest) => HerdAPI.evaluateInputs(request),
  });
}

export function useCreateExecution() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  return useMutation({
    mutationFn: (request: ExecutionRequest) => HerdAPI.createExecution(request),
    onSuccess: () => {
      // Invalidate execution history to refresh the list
      queryClient.invalidateQueries({ queryKey: ['execution-history', address] });
      queryClient.invalidateQueries({ queryKey: ['all-executions'] });
      queryClient.invalidateQueries({ queryKey: ['total-donations'] });
    },
  });
}

export function useTotalDonations() {
  return useQuery({
    queryKey: ['total-donations'],
    queryFn: async () => {
      // Get all executions to count successful donations
      const allExecutions = await HerdAPI.getAllExecutions();
      
      // Count successful donation transactions
      let totalTransactions = 0;
      const executionEntries = Object.entries(allExecutions.executions);
      
      for (const [walletAddress, walletData] of executionEntries) {
        for (const execution of walletData.executions) {
          for (const step of execution.steps) {
            if (step.stepNumber > 0 && step.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
              totalTransactions++;
            }
          }
        }
      }
      
      // For now, return count of transactions
      // Later we can enhance this with read API to get actual amounts
      return {
        totalTransactions,
        totalAmount: totalTransactions * 5 // Placeholder: assume $5 average donation
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
