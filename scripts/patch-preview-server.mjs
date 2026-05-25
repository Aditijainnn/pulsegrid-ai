/**
 * TanStack Start preview expects dist/server/server.js (from server entry name).
 * Cloudflare build emits dist/server/index.js. Copy so `npm run preview` works.
 */
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const serverDir = join(process.cwd(), "dist", "server");
const indexPath = join(serverDir, "index.js");
const serverPath = join(serverDir, "server.js");

if (!existsSync(indexPath)) {
  console.error("[patch-preview-server] Missing dist/server/index.js — run npm run build first.");
  process.exit(1);
}

copyFileSync(indexPath, serverPath);
console.log("[patch-preview-server] Created dist/server/server.js for preview.");
