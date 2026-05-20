-- ============================================
-- TaskFlow — Esquema de Base de Datos (Supabase)
-- ============================================

-- 1. Crear la tabla de tareas
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  due_date date,
  priority text check (priority in ('alta', 'media', 'baja')) default 'media',
  status text check (status in ('pendiente', 'en_progreso', 'completada')) default 'pendiente',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Habilitar Row Level Security (RLS)
alter table public.tasks enable row level security;

-- 3. Políticas RLS: cada usuario solo ve y modifica SUS tareas
create policy "Usuarios ven sus propias tareas"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Usuarios crean sus propias tareas"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Usuarios editan sus propias tareas"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Usuarios eliminan sus propias tareas"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 4. Índices para rendimiento
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_status on public.tasks(status);
