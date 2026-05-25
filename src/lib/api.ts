import type {
  Alert,
  InfraSnapshot,
  SavingsSnapshot,
  Severity,
  WorkloadNode,
} from "@/types/infra";

/**
 * "API routes" — these mirror the spec'd Next.js endpoints
 * (/api/infra, /api/alerts, /api/savings) but run client-side
 * against dummyjson.com so the project works in the static preview.
 */

const NODE_TEMPLATES: Array<Pick<WorkloadNode, "label" | "type">> = [
  { label: "GPU Training Cluster", type: "gpu" },
  { label: "API Gateway", type: "api" },
  { label: "Compute Pod EU-1", type: "compute" },
  { label: "Compute Pod US-2", type: "compute" },
  { label: "Object Storage", type: "storage" },
  { label: "Vector DB", type: "db" },
  { label: "Inference Service", type: "gpu" },
  { label: "Edge Worker", type: "api" },
];

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619;
  return Math.abs(h);
}

function severityFromCpu(cpu: number): Severity {
  if (cpu < 15) return "critical";
  if (cpu < 35) return "high";
  if (cpu < 60) return "medium";
  return "low";
}

async function fetchProducts() {
  const res = await fetch("https://dummyjson.com/products?limit=20");
  if (!res.ok) throw new Error("Failed to load infra source data");
  return (await res.json()) as {
    products: Array<{
      id: number;
      title: string;
      price: number;
      rating: number;
      stock: number;
    }>;
  };
}

export async function getInfra(tick = 0): Promise<InfraSnapshot> {
  const { products } = await fetchProducts();
  const nodes: WorkloadNode[] = NODE_TEMPLATES.map((tpl, i) => {
    const p = products[i % products.length];
    const seed = hashSeed(tpl.label + ":" + tick);
    const jitter = (seed % 30) - 15;
    const baseCpu = Math.max(4, Math.min(95, p.stock + jitter));
    const cpuUsage = Math.round(baseCpu);
    const memoryUsage = Math.max(
      8,
      Math.min(98, Math.round(p.rating * 18 + (seed % 25))),
    );
    const status: WorkloadNode["status"] =
      cpuUsage < 18 ? "critical" : cpuUsage < 40 ? "warning" : "healthy";
    return {
      id: `node-${i}`,
      label: tpl.label,
      type: tpl.type,
      cpuUsage,
      memoryUsage,
      trafficIn: (seed % 900) + 50,
      trafficOut: ((seed >> 3) % 900) + 50,
      status,
    };
  });

  const edges = [
    { from: "node-1", to: "node-0", intensity: 0.9 },
    { from: "node-1", to: "node-2", intensity: 0.7 },
    { from: "node-1", to: "node-3", intensity: 0.6 },
    { from: "node-2", to: "node-4", intensity: 0.5 },
    { from: "node-3", to: "node-5", intensity: 0.5 },
    { from: "node-0", to: "node-6", intensity: 0.8 },
    { from: "node-7", to: "node-1", intensity: 0.4 },
    { from: "node-6", to: "node-4", intensity: 0.45 },
  ];

  return { nodes, edges, scannedAt: Date.now() };
}

export async function getAlerts(tick = 0): Promise<Alert[]> {
  const snap = await getInfra(tick);
  const candidates = snap.nodes.filter((n) => n.cpuUsage < 45);
  return candidates.slice(0, 5).map((n, i) => {
    const sev = severityFromCpu(n.cpuUsage);
    const savings = Math.round(
      ((100 - n.cpuUsage) / 100) * (n.type === "gpu" ? 1850 : 620),
    );
    const recs: Record<string, string> = {
      gpu: "Right-size to a smaller GPU SKU and enable autoscaling.",
      api: "Consolidate replicas behind a regional load balancer.",
      compute: "Switch to spot instances during off-peak hours.",
      storage: "Move cold objects to infrequent-access tier.",
      db: "Enable query cache and reduce idle connection pool.",
    };
    return {
      id: `alert-${tick}-${i}-${n.id}`,
      title:
        n.type === "gpu"
          ? "Idle GPU Cluster"
          : n.type === "storage"
            ? "Cold Storage Overprovisioned"
            : n.type === "db"
              ? "Underused Database Pool"
              : "Underutilized Workload",
      description: `Utilization at ${n.cpuUsage}% for the last 3 hours on ${n.label}.`,
      service: n.label,
      severity: sev,
      savings,
      recommendation: recs[n.type],
      confidence: Math.min(0.98, 0.7 + (45 - n.cpuUsage) / 100),
      createdAt: Date.now(),
    };
  });
}

export async function getSavings(tick = 0): Promise<SavingsSnapshot> {
  const alerts = await getAlerts(tick);
  const monthly = alerts.reduce((sum, a) => sum + a.savings, 0);
  const conf = alerts.length
    ? alerts.reduce((s, a) => s + a.confidence, 0) / alerts.length
    : 0.85;
  return {
    monthlySavings: monthly,
    projectedAnnual: monthly * 12,
    optimizationConfidence: Math.round(conf * 100),
    history: [],
  };
}