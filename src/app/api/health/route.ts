import { connection } from "next/server";

/**
 * Sonde de disponibilité (monitoring, Vercel). Volontairement minimale :
 * n'expose aucune information de configuration.
 */
export async function GET() {
  await connection();
  return Response.json(
    { status: "ok", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
