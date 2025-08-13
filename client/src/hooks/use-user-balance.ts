import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { HerdAPI } from "@/lib/herd-api";

export function useUserBalance() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["userBalance", address],
    queryFn: async () => {
      if (!address) throw new Error("No wallet address");
      return HerdAPI.getUserBalance(address);
    },
    enabled: isConnected && !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });
}