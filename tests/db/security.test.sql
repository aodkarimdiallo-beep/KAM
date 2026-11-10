-- ─────────────────────────────────────────────────────────────────────────────
-- Tests de sécurité de la base : isolation entre utilisateurs (RLS), privilèges,
-- garde-fous de la mémoire, stockage privé.
-- Exécuté dans une transaction annulée à la fin : aucune donnée ne subsiste.
-- Lancement : scripts/test-db.sh (voir docs/ROADMAP.md).
-- ─────────────────────────────────────────────────────────────────────────────
\set ON_ERROR_STOP 1
\set QUIET 1
begin;

create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.ok(condition boolean, label text) returns void
language plpgsql as $$
begin
  if condition is not true then
    raise exception 'ÉCHEC : %', label;
  end if;
  raise notice 'ok — %', label;
end;
$$;

-- Vérifie qu'une instruction est REFUSÉE par la base.
create function tests.rejects(statement text, label text) returns void
language plpgsql as $$
begin
  begin
    execute statement;
  exception when others then
    raise notice 'ok — % (refusé : %)', label, sqlerrm;
    return;
  end;
  raise exception 'ÉCHEC : % — l''instruction a été acceptée', label;
end;
$$;

create function tests.login(user_id uuid) returns void
language sql as $$
  select set_config('request.jwt.claim.sub', user_id::text, true);
$$;

grant execute on all functions in schema tests to anon, authenticated;

-- Deux utilisateurs : Alice et Bob.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.test', '{"display_name": "Alice"}'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.test', '{}');

select tests.ok((select count(*) from public.profiles) = 2, 'un profil est créé à chaque inscription');
select tests.ok((select count(*) from public.user_settings) = 2, 'des réglages sont créés à chaque inscription');
select tests.ok(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 'Alice',
  'le nom choisi à l''inscription est repris dans le profil');

-- ── Fonctions internes (triggers SECURITY DEFINER) ──────────────────────────
select tests.ok(
  not has_function_privilege('anon', 'public.handle_new_user()', 'execute')
  and not has_function_privilege('authenticated', 'public.handle_new_user()', 'execute')
  and not has_function_privilege('anon', 'public.record_memory_revision()', 'execute')
  and not has_function_privilege('authenticated', 'public.record_memory_revision()', 'execute'),
  'les fonctions internes ne sont pas appelables via l''API');
select tests.ok(
  not has_function_privilege('anon', 'public.record_audit_event(text, text, text, jsonb)', 'execute')
  and not has_function_privilege('anon', 'public.record_usage_event(text, text, text, integer, integer, numeric, integer)', 'execute'),
  'un visiteur non connecté ne peut écrire ni dans le journal ni dans l''usage');

-- ── Visiteur non connecté ───────────────────────────────────────────────────
set local role anon;
select tests.rejects('select * from public.profiles', 'anon ne peut pas lire les profils');
select tests.rejects('select * from public.memories', 'anon ne peut pas lire la mémoire');
reset role;

-- ── Alice ───────────────────────────────────────────────────────────────────
set local role authenticated;
select tests.login('00000000-0000-0000-0000-00000000000a');

select tests.ok((select count(*) from public.profiles) = 1, 'Alice ne voit que son propre profil');
select tests.rejects($$update public.profiles set role = 'admin'$$, 'Alice ne peut pas se promouvoir administratrice');
select tests.rejects($$update public.user_settings set plan = 'enterprise'$$, 'Alice ne peut pas changer sa formule');
update public.profiles set display_name = 'Alice L.' where id = '00000000-0000-0000-0000-00000000000a';
update public.profiles set display_name = 'piraté' where id = '00000000-0000-0000-0000-00000000000b';

insert into public.projects (id, name) values ('10000000-0000-0000-0000-00000000000a', 'Projet d''Alice');
insert into public.conversations (id, title) values ('20000000-0000-0000-0000-00000000000a', 'Conversation d''Alice');
insert into public.messages (conversation_id, role, content)
  values ('20000000-0000-0000-0000-00000000000a', 'user', 'Je prépare le lancement de mon entreprise');

-- Garde-fous de la mémoire
select tests.rejects(
  $$insert into public.memories (category, content, epistemic_status, validation_status, origin, validated_at)
    values ('semantic', 'x', 'confirmed_fact', 'validated', 'system', now())$$,
  'le système ne peut pas créer un fait confirmé');
select tests.rejects(
  $$insert into public.memories (category, content, epistemic_status, validation_status, origin, validated_at)
    values ('semantic', 'x', 'ai_inference', 'validated', 'system', now())$$,
  'le système ne peut pas créer un souvenir déjà validé');
select tests.rejects(
  $$insert into public.memories (category, content, epistemic_status, origin)
    values ('semantic', 'x', 'confirmed_fact', 'user')$$,
  'un fait confirmé exige une validation explicite');

insert into public.memories (id, category, content, epistemic_status, origin, confidence)
  values ('30000000-0000-0000-0000-00000000000a', 'prospective', 'Alice veut lancer son entreprise en 2027',
          'ai_inference', 'system', 0.6);
insert into public.memory_sources (memory_id, source_type, conversation_id)
  values ('30000000-0000-0000-0000-00000000000a', 'conversation', '20000000-0000-0000-0000-00000000000a');

-- Correction par Alice → révision enregistrée automatiquement
update public.memories
  set content = 'Alice veut lancer son entreprise au premier semestre 2027',
      epistemic_status = 'confirmed_fact', validation_status = 'corrected', validated_at = now()
  where id = '30000000-0000-0000-0000-00000000000a';
select tests.ok((select count(*) from public.memory_revisions) = 1, 'une correction crée une révision');
select tests.ok(
  (select previous_epistemic_status::text from public.memory_revisions) = 'ai_inference',
  'la révision conserve l''ancien statut');
select tests.rejects(
  $$insert into public.memory_revisions (user_id, memory_id, previous_content, previous_category, previous_epistemic_status, previous_validation_status)
    values ('00000000-0000-0000-0000-00000000000a', '30000000-0000-0000-0000-00000000000a', 'x', 'semantic', 'opinion', 'pending')$$,
  'l''historique des révisions ne peut pas être falsifié');
select tests.rejects(
  $$update public.memories set origin = 'user' where id = '30000000-0000-0000-0000-00000000000a'$$,
  'l''origine d''un souvenir est immuable');

-- Journal d'audit et usage
select tests.rejects($$insert into public.audit_logs (action) values ('fake.event')$$, 'écriture directe dans le journal interdite');
select public.record_audit_event('auth.sign_in');
select tests.ok((select count(*) from public.audit_logs) = 1, 'le journal est alimenté via la fonction dédiée');
select tests.rejects(
  $$insert into public.usage_events (user_id, provider, model, operation) values ('00000000-0000-0000-0000-00000000000a', 'gemini', 'm', 'chat')$$,
  'l''utilisateur ne peut pas écrire son propre usage');

-- Usage IA : écrit uniquement via la fonction dédiée, toujours au nom de l'appelant
select public.record_usage_event('gemini', 'modele-test', 'chat', 120, 80, 0.0001, 900);
select tests.ok(
  (select count(*) from public.usage_events where user_id = '00000000-0000-0000-0000-00000000000a') = 1,
  'l''usage IA est enregistré au nom de l''utilisateur connecté');
select tests.rejects(
  $$select public.record_usage_event('gemini', 'm', 'inconnu', 1, 1)$$,
  'une opération d''usage inconnue est refusée');
select public.record_usage_event('gemini', 'm', 'chat', -500, -500, -1);
select tests.ok(
  (select min(input_tokens) from public.usage_events) >= 0 and (select min(cost_usd) from public.usage_events) >= 0,
  'l''usage ne peut pas être diminué avec des valeurs négatives');

-- Agents : un seul Master Agent
insert into public.agents (slug, name, is_master) values ('master', 'Master Agent', true);
select tests.rejects($$insert into public.agents (slug, name, is_master) values ('master-2', 'Autre', true)$$, 'un seul Master Agent par utilisateur');

-- Stockage
insert into storage.objects (bucket_id, name) values ('documents', '00000000-0000-0000-0000-00000000000a/doc/cv.pdf');
select tests.rejects(
  $$insert into storage.objects (bucket_id, name) values ('documents', '00000000-0000-0000-0000-00000000000b/doc/x.pdf')$$,
  'Alice ne peut pas déposer de fichier dans le dossier de Bob');
select tests.rejects(
  $$insert into public.documents (filename, storage_path, mime_type, size_bytes)
    values ('x.pdf', '00000000-0000-0000-0000-00000000000b/doc/x.pdf', 'application/pdf', 1)$$,
  'un document doit être rangé dans le dossier de son propriétaire');
reset role;

-- ── Bob ─────────────────────────────────────────────────────────────────────
set local role authenticated;
select tests.login('00000000-0000-0000-0000-00000000000b');

select tests.ok((select count(*) from public.projects) = 0, 'Bob ne voit pas les projets d''Alice');
select tests.ok((select count(*) from public.conversations) = 0, 'Bob ne voit pas les conversations d''Alice');
select tests.ok((select count(*) from public.messages) = 0, 'Bob ne voit pas les messages d''Alice');
select tests.ok((select count(*) from public.memories) = 0, 'Bob ne voit pas la mémoire d''Alice');
select tests.ok((select count(*) from public.memory_revisions) = 0, 'Bob ne voit pas les révisions d''Alice');
select tests.ok((select count(*) from public.audit_logs) = 0, 'Bob ne voit pas le journal d''Alice');
select tests.ok((select count(*) from public.usage_events) = 0, 'Bob ne voit pas l''usage IA d''Alice');
select tests.ok((select count(*) from storage.objects) = 0, 'Bob ne voit pas les fichiers d''Alice');

update public.memories set content = 'piraté';
delete from public.projects;

select tests.rejects(
  $$insert into public.projects (name, user_id) values ('Intrus', '00000000-0000-0000-0000-00000000000a')$$,
  'Bob ne peut pas créer de données au nom d''Alice');
select tests.rejects(
  $$insert into public.conversations (title, project_id) values ('Intrus', '10000000-0000-0000-0000-00000000000a')$$,
  'Bob ne peut pas rattacher une conversation au projet d''Alice');
select tests.rejects(
  $$insert into public.messages (conversation_id, role, content) values ('20000000-0000-0000-0000-00000000000a', 'user', 'intrus')$$,
  'Bob ne peut pas écrire dans une conversation d''Alice');
reset role;

-- ── Vérifications finales (administrateur) ──────────────────────────────────
select tests.ok(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000b') is null,
  'Alice n''a pas pu modifier le profil de Bob');
select tests.ok(
  (select content from public.memories where id = '30000000-0000-0000-0000-00000000000a') like 'Alice veut%',
  'Bob n''a pas pu modifier la mémoire d''Alice');
select tests.ok((select count(*) from public.projects) = 1, 'Bob n''a pas pu supprimer le projet d''Alice');

delete from auth.users where id = '00000000-0000-0000-0000-00000000000a';
select tests.ok(
  (select count(*) from public.memories) + (select count(*) from public.projects)
    + (select count(*) from public.conversations) + (select count(*) from public.profiles
       where id = '00000000-0000-0000-0000-00000000000a') = 0,
  'la suppression du compte efface toutes ses données');

rollback;
\echo 'Tous les tests de sécurité de la base sont passés.'
