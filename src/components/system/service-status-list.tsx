import { CheckCircle2, CircleDashed } from "lucide-react";
import { connection } from "next/server";
import { getServerEnv } from "@/lib/env/server";
import { getConfigurationStatus } from "@/server/system/configuration-status";

/**
 * État réel des services externes, lu à l'exécution (jamais figé au build).
 * N'affiche que des noms de variables, jamais leurs valeurs.
 */
export async function ServiceStatusList() {
  await connection();
  const services = getConfigurationStatus(getServerEnv());

  return (
    <ul className="divide-y divide-line">
      {services.map((service) => (
        <li key={service.key} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {service.configured ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.8} aria-hidden />
            ) : (
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.8} aria-hidden />
            )}
            <div>
              <p className="text-sm text-fg">{service.label}</p>
              <p className="mt-0.5 text-[13px] text-muted">{service.requiredFor}</p>
            </div>
          </div>
          <div className="min-w-0 pl-7 sm:max-w-[55%] sm:pl-0 sm:text-right">
            {service.configured ? (
              <span className="text-[13px] text-success">Configuré</span>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted sm:justify-end">
                À définir :
                {service.missing.map((name) => (
                  <code key={name} className="break-all rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-fg-soft">
                    {name}
                  </code>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
