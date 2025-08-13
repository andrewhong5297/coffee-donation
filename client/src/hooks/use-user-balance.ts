import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { HerdAPI } from "@/lib/herd-api";

export function useUserBalance() {
  const { address, status } = useAccount();

  return useQuery({
    queryKey: ["userBalance", address],
    queryFn: async () => {
      if (!address) throw new Error("No wallet address");
      return HerdAPI.getUserBalance(address);
    },
    enabled: status === 'connected' && !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
}