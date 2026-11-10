-- ─────────────────────────────────────────────────────────────────────────────
-- DIGITAL TWIN — 05 · Durcissement des privilèges des fonctions.
--
-- PostgreSQL accorde EXECUTE à PUBLIC sur toute nouvelle fonction. Les révocations
-- « from anon, authenticated » des migrations 01 et 03 ne suffisaient donc pas :
-- les fonctions de trigger SECURITY DEFINER restaient appelables via l'API REST
-- (signalé par le conseiller de sécurité Supabase). Elles ne doivent s'exécuter
-- qu'en tant que triggers.
-- ─────────────────────────────────────────────────────────────────────────────

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.record_memory_revision() from public, anon, authenticated;
