import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HerdAPI, type EvaluationRequest, type ExecutionRequest, type ReadNodeRequest } from '@/lib/herd-api';
import { useAccount } from 'wagmi';

export function useExecutionHistory() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['execution-history', address],
    queryFn: () => address ? HerdAPI.getExecutionHistory(address) : Promise.resolve({ totals: { transactions: 0, wallets: 0 }, walletExecutions: [] }),
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
      
      // Count successful donation transactions and fetch actual amounts
      let totalTransactions = 0;
      let totalAmount = 0;
      
      for (const walletExecution of allExecutions.walletExecutions) {
        for (const execution of walletExecution.executions) {
          for (const step of execution.steps) {
            if (step.stepNumber > 0 && step.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
              totalTransactions++;
              
              try {
                // Use read API to get the actual donation amount
                const readRequest: ReadNodeRequest = {
                  walletAddress: walletExecution.walletAddress,
                  userInputs: {}, // No user inputs needed for read
                  execution: { type: 'manual', executionId: execution.id }
                };
                
                const readResponse = await HerdAPI.readNode(HerdAPI.getTrailConfig().primaryNodeId, readRequest);
                
                // Extract the donation amount from the read response
                let donationAmount = 5; // Default fallback
                
                if (readResponse.inputs && readResponse.inputs.value && readResponse.inputs.value.value) {
                  // Convert from USDC wei (6 decimals) to dollars
                  donationAmount = parseFloat(readResponse.inputs.value.value) / 1000000;
                }
                
                totalAmount += donationAmount;
              } catch (error) {
                console.error(`Failed to fetch donation amount for total: ${walletExecution.walletAddress}-${execution.id}`, error);
                // Use fallback amount of $5 for failed requests
                totalAmount += 5;
              }
            }
          }
        }
      }
      
      return {
        totalTransactions,
        totalAmount
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useDonationAmounts() {
  return useQuery({
    queryKey: ['donation-amounts'],
    queryFn: async () => {
      // Get all executions to fetch donation amounts
      const allExecutions = await HerdAPI.getAllExecutions();
      const donationAmounts: Record<string, number> = {};
      
      for (const walletExecution of allExecutions.walletExecutions) {
        for (const execution of walletExecution.executions) {
          for (const step of execution.steps) {
            if (step.stepNumber > 0 && step.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
              try {
                // Use read API to get the transaction details
                // Based on the documentation, for write_function nodes we need to provide the execution context
                const readRequest: ReadNodeRequest = {
                  walletAddress: walletExecution.walletAddress,
                  userInputs: {}, // No user inputs needed for read according to step data
                  execution: { type: 'manual', executionId: execution.id }
                };
                
                const readResponse = await HerdAPI.readNode(HerdAPI.getTrailConfig().primaryNodeId, readRequest);
                
                // console.log(`Read API response for ${walletExecution.walletAddress}-${execution.id}:`, readResponse);
                
                // Extract the donation amount from the read response
                // For write_function node type, response format is: { inputs: nested_json, outputs: nested_json }
                let donationAmount = 5; // Default fallback
                
                if (readResponse.inputs) {
                  // console.log('Inputs structure:', readResponse.inputs);
                  
                  // The API returns the exact format we need: inputs.value.value contains the USDC amount
                  if (readResponse.inputs.value && readResponse.inputs.value.value) {
                    // Convert from USDC wei (6 decimals) to dollars
                    donationAmount = parseFloat(readResponse.inputs.value.value) / 1000000;
                    // console.log( 'Found donation amount:', donationAmount, 'USDC');
                  } else {
                    // console.log('Value field not found in expected location');
                  }
                }
                
                // Store amount with key as walletAddress-executionId for lookup
                donationAmounts[`${walletExecution.walletAddress}-${execution.id}`] = Math.max(donationAmount, 0.01); // Minimum 1 cent
              } catch (error) {
                console.error(`Failed to fetch donation amount for ${walletExecution.walletAddress}-${execution.id}:`, error);
                console.error('Error details:', error);
                // Use fallback amount
                donationAmounts[`${walletExecution.walletAddress}-${execution.id}`] = 5;
              }
            }
          }
        }
      }
      
      return donationAmounts;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
