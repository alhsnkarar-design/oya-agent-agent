-- بنّاء — مخطط قاعدة البيانات (يُطبّق تلقائياً عند أول اتصال، ويمكن تنفيذه يدوياً)
create table if not exists bannaa_users (
  id text primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);
create table if not exists bannaa_projects (
  id text primary key,
  user_id text not null references bannaa_users(id) on delete cascade,
  name text not null,
  data jsonb not null,
  published_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table bannaa_users add column if not exists google_sub text unique;
create index if not exists bannaa_projects_user_idx on bannaa_projects(user_id, updated_at desc);
create table if not exists bannaa_sites (
  slug text primary key,
  project_id text not null unique references bannaa_projects(id) on delete cascade,
  user_id text not null references bannaa_users(id) on delete cascade,
  files jsonb not null,
  assets jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists bannaa_usage (
  user_id text not null references bannaa_users(id) on delete cascade,
  day text not null,
  count integer not null default 0,
  primary key (user_id, day)
);
