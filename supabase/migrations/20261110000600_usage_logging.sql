-- ─────────────────────────────────────────────────────────────────────────────
-- DIGITAL TWIN — 06 · Journalisation de l'usage IA.
--
-- La table usage_events est en lecture seule pour les utilisateurs (migration 04).
-- Le serveur y écrit via cette fonction, qui impose l'identité (auth.uid()) :
-- un appelant ne peut qu'AJOUTER de l'usage à son propre compte, jamais en retirer
-- ni en attribuer à quelqu'un d'autre. Aucune clé secrète n'est donc nécessaire.
-- ─────────────────────────────────────────────────────────────────────────────

create function public.record_usage_event(
  p_provider text,
  p_model text,
  p_operation text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_cost_usd numeric default 0,
  p_latency_ms integer default null
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise' using errcode = 'insufficient_privilege';
  end if;
  insert into public.usage_events (
    user_id, provider, model, operation, input_tokens, output_tokens, cost_usd, latency_ms
  ) values (
    auth.uid(), left(p_provider, 40), left(p_model, 100), p_operation,
    greatest(coalesce(p_input_tokens, 0), 0), greatest(coalesce(p_output_tokens, 0), 0),
    greatest(coalesce(p_cost_usd, 0), 0), p_latency_ms
  );
end;
$$;

revoke execute on function public.record_usage_event(text, text, text, integer, integer, numeric, integer)
  from public, anon;
grant execute on function public.record_usage_event(text, text, text, integer, integer, numeric, integer)
  to authenticated;
