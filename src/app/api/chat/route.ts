import { chatRequestSchema } from "@/domain/chat/protocol";
import { ConfigurationError } from "@/lib/env/schema";
import { getServerEnv } from "@/lib/env/server";
import { getCurrentUser } from "@/server/auth/session";
import { ChatRequestError, startChatTurn } from "@/server/chat/service";

/**
 * POST /api/chat — envoie un message au Twin et reçoit la réponse en streaming (NDJSON).
 * Identité vérifiée côté serveur ; le proxy refuse déjà toute requête sans session.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Authentification requise" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide." }, { status: 400 });
  }

  try {
    const stream = await startChatTurn({ env: getServerEnv(), userId: user.id, body: parsed.data, signal: request.signal });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof ChatRequestError) return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof ConfigurationError) {
      return Response.json(
        { error: "L'intelligence artificielle n'est pas encore configurée (voir Settings)." },
        { status: 503 },
      );
    }
    console.error("[chat] erreur", error);
    return Response.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 });
  }
}
