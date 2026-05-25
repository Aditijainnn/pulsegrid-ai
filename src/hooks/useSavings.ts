import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSavings } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export function useSavings() {
  const tick = useAppStore((s) => s.tick);
  const pushHistory = useAppStore((s) => s.pushSavings);
  const q = useQuery({
    queryKey: ["savings", tick],
    queryFn: () => getSavings(tick),
    refetchInterval: 5000,
  });
  useEffect(() => {
    if (q.data) pushHistory(q.data.monthlySavings);
  }, [q.data, pushHistory]);
  return q;
}
