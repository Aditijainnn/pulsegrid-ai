export function ScanBeam({ active }: { active: boolean }) {
  if (!active) return null;
  return <div className="scan-beam" aria-hidden />;
}
