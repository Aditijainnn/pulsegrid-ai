import { getAlerts } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tick = Number(url.searchParams.get("tick") ?? 0);
  const data = await getAlerts(tick);
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}