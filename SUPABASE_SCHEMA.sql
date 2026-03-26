-- =====================================================
-- Psico Agenda — Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- =====================================================

-- Perfis dos psicólogos (extends auth.users)
create table if not exists psicologos (
  id uuid references auth.users primary key,
  nome text,
  crp text,
  cpf text,
  email text,
  telefone text,
  endereco text,
  cidade text,
  estado text,
  created_at timestamptz default now()
);

-- Pacientes
create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  psicologo_id uuid references psicologos not null,
  nome text not null,
  cpf text,
  email text,
  telefone text,
  valor_sessao numeric(10,2) default 150,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Sessões
create table if not exists sessoes (
  id uuid primary key default gen_random_uuid(),
  psicologo_id uuid references psicologos not null,
  paciente_id uuid references pacientes not null,
  data_hora timestamptz not null,
  duracao_min int default 50,
  valor numeric(10,2) not null,
  status text default 'agendado' check (status in ('agendado','realizado','cancelado')),
  observacoes text,
  created_at timestamptz default now()
);

-- Recibos
create table if not exists recibos (
  id uuid primary key default gen_random_uuid(),
  psicologo_id uuid references psicologos not null,
  paciente_id uuid references pacientes not null,
  sessao_id uuid references sessoes,
  numero int not null,
  data_emissao date default current_date,
  valor numeric(10,2) not null,
  descricao text default 'Consulta Psicológica',
  created_at timestamptz default now()
);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

alter table psicologos enable row level security;
alter table pacientes enable row level security;
alter table sessoes enable row level security;
alter table recibos enable row level security;

-- Políticas: cada psicólogo só acessa seus próprios dados
create policy "own data" on psicologos
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "own data" on pacientes
  for all using (auth.uid() = psicologo_id)
  with check (auth.uid() = psicologo_id);

create policy "own data" on sessoes
  for all using (auth.uid() = psicologo_id)
  with check (auth.uid() = psicologo_id);

create policy "own data" on recibos
  for all using (auth.uid() = psicologo_id)
  with check (auth.uid() = psicologo_id);

-- =====================================================
-- Trigger: criar perfil ao registrar novo usuário
-- =====================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.psicologos (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
