import "server-only";
import { parseServerEnv, type ServerEnv } from "./schema";

/** Lit et valide l'environnement serveur au moment de l'appel (jamais au build). */
export function getServerEnv(): ServerEnv {
  return parseServerEnv(process.env);
}
