// Next.js-style API route (structural reference).
// The live app calls getInfra() directly from src/lib/api.ts via TanStack Query
// because this project runs on TanStack Start, not Next.js.
import { getInfra } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tick = Number(url.searchParams.get("tick") ?? 0);
  const data = await getInfra(tick);
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}