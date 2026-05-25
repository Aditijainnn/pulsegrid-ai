import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAlerts } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export function useAlerts() {
  const tick = useAppStore((s) => s.tick);
  const merge = useAppStore((s) => s.mergeAlerts);
  const dismissed = useAppStore((s) => s.dismissedIds);
  const alerts = useAppStore((s) => s.alerts);

  const q = useQuery({
    queryKey: ["alerts", tick],
    queryFn: () => getAlerts(tick),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (q.data) merge(q.data);
  }, [q.data, merge]);

  return {
    ...q,
    alerts: alerts.filter((a) => !dismissed.includes(a.id)),
  };
}