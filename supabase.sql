-- Cole TUDO isto no Supabase: menu "SQL Editor" > New query > Run
-- (pode rodar de novo com segurança, se já tiver rodado uma versão anterior)

create table if not exists participantes (
  id         uuid primary key default gen_random_uuid(),
  criado_em  timestamptz not null default now(),
  pontuacao  int  not null,
  nivel      text not null,
  grupo      text not null check (grupo in ('A', 'B')),
  respostas  jsonb
);

-- Configuração editável pela página /admin (links dos formulários dos grupos A e B)
create table if not exists configuracao (
  id          int primary key default 1 check (id = 1),
  video_a     text not null default '',
  video_b     text not null default '',
  link_etapa2 text not null default '',
  form_a      text not null default '',   -- formulário do Grupo A (com vídeos 1 e 2)
  form_b      text not null default ''    -- formulário do Grupo B (com vídeos 1 e 2)
);
alter table configuracao add column if not exists form_a text not null default '';
alter table configuracao add column if not exists form_b text not null default '';
insert into configuracao (id) values (1) on conflict (id) do nothing;

-- Bloqueia acesso público direto às tabelas (só o servidor acessa)
alter table participantes enable row level security;
alter table configuracao  enable row level security;

-- Sorteia o grupo equilibrando DENTRO de cada nível:
-- entra no grupo que tem menos gente naquele nível (empate = sorteio).
-- O "lock" evita que duas pessoas simultâneas quebrem o equilíbrio.
create or replace function atribuir_grupo(
  p_pontuacao int,
  p_nivel     text,
  p_respostas jsonb
)
returns table (out_id uuid, out_grupo text)
language plpgsql
security definer
as $$
declare
  qa int;
  qb int;
  g  text;
  novo uuid;
begin
  perform pg_advisory_xact_lock(hashtext('atribuir_grupo'));

  select count(*) filter (where p.grupo = 'A'),
         count(*) filter (where p.grupo = 'B')
    into qa, qb
    from participantes p
   where p.nivel = p_nivel;

  if qa < qb then g := 'A';
  elsif qb < qa then g := 'B';
  else g := case when random() < 0.5 then 'A' else 'B' end;
  end if;

  insert into participantes (pontuacao, nivel, grupo, respostas)
  values (p_pontuacao, p_nivel, g, p_respostas)
  returning participantes.id into novo;

  return query select novo, g;
end;
$$;

revoke execute on function atribuir_grupo(int, text, jsonb) from public, anon, authenticated;

-- Permissões para a chave do servidor (service_role). Necessário em projetos novos do Supabase.
grant usage on schema public to service_role;
grant all on table public.participantes to service_role;
grant all on table public.configuracao to service_role;
grant execute on function public.atribuir_grupo(int, text, jsonb) to service_role;
