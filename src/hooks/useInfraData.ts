import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { getInfra } from "@/lib/api";

export function useInfraData() {
  const tick = useAppStore((s) => s.tick);
  return useQuery({
    queryKey: ["infra", tick],
    queryFn: () => getInfra(tick),
    refetchInterval: 5000,
  });
}