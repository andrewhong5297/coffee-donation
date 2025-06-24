import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HerdAPI, type EvaluationRequest, type ExecutionRequest } from '@/lib/herd-api';
import { useAccount } from 'wagmi';

export function useExecutionHistory() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['execution-history', address],
    queryFn: () => address ? HerdAPI.getExecutionHistory(address) : Promise.resolve({ executions: [] }),
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
    },
  });
}
