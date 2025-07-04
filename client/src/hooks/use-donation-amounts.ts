import { useQuery } from '@tanstack/react-query';
import { HerdAPI } from '@/lib/herd-api';

interface DonationAmount {
  stepId: string;
  walletAddress: string;
  amount: string; // USDC amount in readable format
}

export function useDonationAmount(walletAddress: string, stepId: string) {
  return useQuery({
    queryKey: ['donation-amount', walletAddress, stepId],
    queryFn: async (): Promise<string> => {
      try {
        const nodeData = await HerdAPI.getExecutionNodeData(walletAddress, { type: "latest" });
        
        // Parse the donation amount from the node data
        // The amount should be in the outputs for the executed transaction
        if (nodeData?.outputs?.inputs?.value) {
          // Convert from wei to USDC (6 decimals)
          const amountWei = BigInt(nodeData.outputs.inputs.value);
          const amount = Number(amountWei) / 1000000; // USDC has 6 decimals
          return amount.toFixed(2);
        }
        
        return "0.00";
      } catch (error) {
        console.error('Failed to fetch donation amount:', error);
        return "0.00";
      }
    },
    enabled: !!walletAddress && !!stepId,
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useDonationAmounts(steps: Array<{ id: string; walletAddress: string }>) {
  return useQuery({
    queryKey: ['donation-amounts', steps.map(s => `${s.walletAddress}-${s.id}`).join(',')],
    queryFn: async (): Promise<Record<string, string>> => {
      const amounts: Record<string, string> = {};
      
      // Process each step to get its donation amount
      for (const step of steps) {
        try {
          const nodeData = await HerdAPI.getExecutionNodeData(step.walletAddress, { type: "latest" });
          
          if (nodeData?.outputs?.inputs?.value) {
            const amountWei = BigInt(nodeData.outputs.inputs.value);
            const amount = Number(amountWei) / 1000000; // USDC has 6 decimals
            amounts[`${step.walletAddress}-${step.id}`] = amount.toFixed(2);
          } else {
            amounts[`${step.walletAddress}-${step.id}`] = "0.00";
          }
        } catch (error) {
          console.error(`Failed to fetch donation amount for ${step.walletAddress}-${step.id}:`, error);
          amounts[`${step.walletAddress}-${step.id}`] = "0.00";
        }
      }
      
      return amounts;
    },
    enabled: steps.length > 0,
    staleTime: 60000, // Cache for 1 minute
  });
}