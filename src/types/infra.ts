export type Severity = "low" | "medium" | "high" | "critical";
export type NodeType = "gpu" | "api" | "compute" | "storage" | "db";

export interface WorkloadNode {
  id: string;
  label: string;
  type: NodeType;
  cpuUsage: number;
  memoryUsage: number;
  trafficIn: number;
  trafficOut: number;
  status: "healthy" | "warning" | "critical";
}

export interface InfraEdge {
  from: string;
  to: string;
  intensity: number;
}

export interface InfraSnapshot {
  nodes: WorkloadNode[];
  edges: InfraEdge[];
  scannedAt: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  service: string;
  severity: Severity;
  savings: number;
  recommendation: string;
  confidence: number;
  createdAt: number;
  dismissed?: boolean;
}

export interface SavingsSnapshot {
  monthlySavings: number;
  projectedAnnual: number;
  optimizationConfidence: number;
  history: { t: number; value: number }[];
}

export interface TimelineEvent {
  id: string;
  at: number;
  kind: "scan" | "incident" | "optimization";
  label: string;
}