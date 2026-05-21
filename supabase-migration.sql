-- =========================================
-- MÓDULO DE IMPRESSÃO TÉRMICA
-- Supabase / PostgreSQL
-- =========================================

create extension if not exists "pgcrypto";

-- =========================================
-- 1. CONFIGURAÇÕES DE IMPRESSORA
-- =========================================

create table if not exists public.printer_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,

  printer_name text,
  printer_sector text default 'balcao',
  printer_type text default 'thermal',

  paper_width text default '80mm',
  print_mode text default 'browser',

  auto_print boolean default false,
  auto_print_status text default 'novo',

  copies integer default 1,
  footer_text text,

  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint printer_settings_paper_width_check check (
    paper_width in ('58mm', '80mm')
  ),

  constraint printer_settings_print_mode_check check (
    print_mode in ('browser', 'qztray', 'printnode', 'local_agent')
  ),

  constraint printer_settings_sector_check check (
    printer_sector in ('cozinha', 'balcao', 'bar', 'delivery', 'caixa')
  )
);

-- =========================================
-- 2. FILA DE IMPRESSÃO
-- =========================================

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),

  company_id uuid not null references public.companies(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  printer_setting_id uuid references public.printer_settings(id) on delete set null,

  printer_sector text default 'balcao',

  status text default 'pendente',
  copies integer default 1,

  receipt_text text,
  receipt_html text,
  receipt_data jsonb default '{}'::jsonb,

  retry_count integer default 0,
  last_retry_at timestamptz,
  printing_started_at timestamptz,
  printed_at timestamptz,

  error_message text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint print_jobs_status_check check (
    status in ('pendente', 'imprimindo', 'impresso', 'erro', 'cancelado')
  ),

  constraint print_jobs_sector_check check (
    printer_sector in ('cozinha', 'balcao', 'bar', 'delivery', 'caixa')
  )
);

-- =========================================
-- 3. LOGS DE IMPRESSÃO
-- =========================================

create table if not exists public.print_logs (
  id uuid primary key default gen_random_uuid(),

  company_id uuid not null references public.companies(id) on delete cascade,
  print_job_id uuid references public.print_jobs(id) on delete cascade,

  action text not null,
  status text,

  payload jsonb default '{}'::jsonb,
  response jsonb default '{}'::jsonb,
  error_message text,

  created_at timestamptz default now(),

  constraint print_logs_action_check check (
    action in (
      'criado',
      'iniciado',
      'enviado_para_impressora',
      'impresso',
      'erro',
      'cancelado',
      'reimpresso'
    )
  )
);

-- =========================================
-- 4. TEMPLATES DE RECIBO
-- =========================================

create table if not exists public.receipt_templates (
  id uuid primary key default gen_random_uuid(),

  company_id uuid not null references public.companies(id) on delete cascade,

  name text not null default 'Modelo padrão',
  paper_width text default '80mm',

  show_logo boolean default false,
  show_customer_phone boolean default true,
  show_delivery_address boolean default true,
  show_payment_method boolean default true,
  show_qr_code_pix boolean default false,
  show_order_qr_code boolean default false,

  header_text text,
  footer_text text,

  template_html text,
  template_text text,

  is_default boolean default false,
  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint receipt_templates_paper_width_check check (
    paper_width in ('58mm', '80mm')
  )
);

-- =========================================
-- 5. CAMPOS EXTRAS EM TABELAS EXISTENTES
-- =========================================

alter table public.orders
add column if not exists checkout_token text;

alter table public.orders
add column if not exists print_status text default 'nao_impresso';

alter table public.orders
add column if not exists printed_at timestamptz;

alter table public.orders
add column if not exists whatsapp_redirected_at timestamptz;

alter table public.product_categories
add column if not exists print_sector text default 'cozinha';

-- =========================================
-- 6. CONSTRAINTS EXTRAS
-- =========================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_print_status_check'
  ) then
    alter table public.orders
    add constraint orders_print_status_check check (
      print_status in ('nao_impresso', 'pendente', 'imprimindo', 'impresso', 'erro')
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_categories_print_sector_check'
  ) then
    alter table public.product_categories
    add constraint product_categories_print_sector_check check (
      print_sector in ('cozinha', 'balcao', 'bar', 'delivery', 'caixa')
    );
  end if;
end $$;

-- =========================================
-- 7. ÍNDICES
-- =========================================

create unique index if not exists idx_orders_checkout_token
on public.orders(checkout_token)
where checkout_token is not null;

create index if not exists idx_orders_print_status
on public.orders(print_status);

create index if not exists idx_printer_settings_company_id
on public.printer_settings(company_id);

create index if not exists idx_printer_settings_sector
on public.printer_settings(printer_sector);

create index if not exists idx_print_jobs_company_id
on public.print_jobs(company_id);

create index if not exists idx_print_jobs_order_id
on public.print_jobs(order_id);

create index if not exists idx_print_jobs_status
on public.print_jobs(status);

create index if not exists idx_print_jobs_sector
on public.print_jobs(printer_sector);

create index if not exists idx_print_jobs_created_at
on public.print_jobs(created_at);

create index if not exists idx_print_logs_print_job_id
on public.print_logs(print_job_id);

create index if not exists idx_print_logs_company_id
on public.print_logs(company_id);

create index if not exists idx_receipt_templates_company_id
on public.receipt_templates(company_id);

create index if not exists idx_product_categories_print_sector
on public.product_categories(print_sector);

-- =========================================
-- 8. FUNÇÃO UPDATED_AT
-- =========================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_printer_settings_updated_at on public.printer_settings;
create trigger set_printer_settings_updated_at
before update on public.printer_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_print_jobs_updated_at on public.print_jobs;
create trigger set_print_jobs_updated_at
before update on public.print_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_receipt_templates_updated_at on public.receipt_templates;
create trigger set_receipt_templates_updated_at
before update on public.receipt_templates
for each row execute function public.set_updated_at();

-- =========================================
-- 9. CRIAR PRINT JOB AUTOMÁTICO AO CRIAR PEDIDO
-- =========================================

create or replace function public.create_print_job_after_order()
returns trigger as $$
declare
  selected_printer_id uuid;
  selected_sector text;
  selected_copies integer;
begin
  selected_sector := 'balcao';

  select ps.id, ps.copies
  into selected_printer_id, selected_copies
  from public.printer_settings ps
  where ps.company_id = new.company_id
    and ps.is_active = true
    and ps.printer_sector = selected_sector
  order by ps.created_at asc
  limit 1;

  insert into public.print_jobs (
    company_id,
    order_id,
    printer_setting_id,
    printer_sector,
    status,
    copies,
    receipt_data
  )
  values (
    new.company_id,
    new.id,
    selected_printer_id,
    selected_sector,
    'pendente',
    coalesce(selected_copies, 1),
    jsonb_build_object(
      'order_id', new.id,
      'order_number', new.order_number,
      'total', new.total,
      'payment_method', new.payment_method,
      'delivery_address', new.delivery_address,
      'notes', new.notes,
      'created_at', new.created_at
    )
  );

  update public.orders
  set print_status = 'pendente'
  where id = new.id;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_create_print_job_after_order on public.orders;

create trigger trigger_create_print_job_after_order
after insert on public.orders
for each row execute function public.create_print_job_after_order();

-- =========================================
-- 10. LOG AUTOMÁTICO AO CRIAR PRINT JOB
-- =========================================

create or replace function public.log_print_job_created()
returns trigger as $$
begin
  insert into public.print_logs (
    company_id,
    print_job_id,
    action,
    status,
    payload
  )
  values (
    new.company_id,
    new.id,
    'criado',
    new.status,
    jsonb_build_object(
      'order_id', new.order_id,
      'printer_sector', new.printer_sector,
      'copies', new.copies
    )
  );

  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_log_print_job_created on public.print_jobs;

create trigger trigger_log_print_job_created
after insert on public.print_jobs
for each row execute function public.log_print_job_created();

-- =========================================
-- 11. FUNÇÃO PARA BLOQUEAR JOB ANTES DE IMPRIMIR
-- =========================================

create or replace function public.start_print_job(p_print_job_id uuid)
returns public.print_jobs as $$
declare
  job public.print_jobs;
begin
  update public.print_jobs
  set
    status = 'imprimindo',
    printing_started_at = now(),
    retry_count = retry_count + 1,
    last_retry_at = now(),
    error_message = null
  where id = p_print_job_id
    and status in ('pendente', 'erro')
  returning * into job;

  if job.id is null then
    raise exception 'Print job não encontrado ou já está em processamento.';
  end if;

  update public.orders
  set print_status = 'imprimindo'
  where id = job.order_id;

  insert into public.print_logs (
    company_id,
    print_job_id,
    action,
    status,
    payload
  )
  values (
    job.company_id,
    job.id,
    'iniciado',
    'imprimindo',
    jsonb_build_object(
      'retry_count', job.retry_count,
      'started_at', now()
    )
  );

  return job;
end;
$$ language plpgsql;

-- =========================================
-- 12. FUNÇÃO PARA MARCAR COMO IMPRESSO
-- =========================================

create or replace function public.mark_print_job_as_printed(p_print_job_id uuid)
returns public.print_jobs as $$
declare
  job public.print_jobs;
begin
  update public.print_jobs
  set
    status = 'impresso',
    printed_at = now(),
    error_message = null
  where id = p_print_job_id
  returning * into job;

  if job.id is null then
    raise exception 'Print job não encontrado.';
  end if;

  update public.orders
  set
    print_status = 'impresso',
    printed_at = now()
  where id = job.order_id;

  insert into public.print_logs (
    company_id,
    print_job_id,
    action,
    status
  )
  values (
    job.company_id,
    job.id,
    'impresso',
    'impresso'
  );

  return job;
end;
$$ language plpgsql;

-- =========================================
-- 13. FUNÇÃO PARA MARCAR ERRO DE IMPRESSÃO
-- =========================================

create or replace function public.mark_print_job_as_error(
  p_print_job_id uuid,
  p_error_message text
)
returns public.print_jobs as $$
declare
  job public.print_jobs;
begin
  update public.print_jobs
  set
    status = 'erro',
    error_message = p_error_message,
    last_retry_at = now()
  where id = p_print_job_id
  returning * into job;

  if job.id is null then
    raise exception 'Print job não encontrado.';
  end if;

  update public.orders
  set print_status = 'erro'
  where id = job.order_id;

  insert into public.print_logs (
    company_id,
    print_job_id,
    action,
    status,
    error_message
  )
  values (
    job.company_id,
    job.id,
    'erro',
    'erro',
    p_error_message
  );

  return job;
end;
$$ language plpgsql;

-- =========================================
-- 14. FUNÇÃO PARA REIMPRIMIR PEDIDO
-- =========================================

create or replace function public.reprint_order(p_order_id uuid)
returns public.print_jobs as $$
declare
  original_job public.print_jobs;
  new_job public.print_jobs;
begin
  select *
  into original_job
  from public.print_jobs
  where order_id = p_order_id
  order by created_at desc
  limit 1;

  if original_job.id is null then
    raise exception 'Nenhum print job encontrado para este pedido.';
  end if;

  insert into public.print_jobs (
    company_id,
    order_id,
    printer_setting_id,
    printer_sector,
    status,
    copies,
    receipt_text,
    receipt_html,
    receipt_data
  )
  values (
    original_job.company_id,
    original_job.order_id,
    original_job.printer_setting_id,
    original_job.printer_sector,
    'pendente',
    original_job.copies,
    original_job.receipt_text,
    original_job.receipt_html,
    original_job.receipt_data
  )
  returning * into new_job;

  update public.orders
  set print_status = 'pendente'
  where id = p_order_id;

  insert into public.print_logs (
    company_id,
    print_job_id,
    action,
    status,
    payload
  )
  values (
    new_job.company_id,
    new_job.id,
    'reimpresso',
    'pendente',
    jsonb_build_object(
      'original_print_job_id', original_job.id
    )
  );

  return new_job;
end;
$$ language plpgsql;

-- =========================================
-- 15. FUNÇÃO PARA CANCELAR PRINT JOB
-- =========================================

create or replace function public.cancel_print_job(p_print_job_id uuid)
returns public.print_jobs as $$
declare
  job public.print_jobs;
begin
  update public.print_jobs
  set status = 'cancelado'
  where id = p_print_job_id
  returning * into job;

  if job.id is null then
    raise exception 'Print job não encontrado.';
  end if;

  insert into public.print_logs (
    company_id,
    print_job_id,
    action,
    status
  )
  values (
    job.company_id,
    job.id,
    'cancelado',
    'cancelado'
  );

  return job;
end;
$$ language plpgsql;

-- =========================================
-- 16. VIEW PARA FILA DE IMPRESSÃO
-- =========================================

create or replace view public.v_print_queue as
select
  pj.id as print_job_id,
  pj.company_id,
  pj.order_id,
  pj.status as print_status,
  pj.printer_sector,
  pj.copies,
  pj.retry_count,
  pj.error_message,
  pj.created_at as print_created_at,

  o.order_number,
  o.status as order_status,
  o.total,
  o.payment_method,
  o.payment_status,
  o.delivery_address,
  o.notes,
  o.created_at as order_created_at,

  c.name as customer_name,
  c.phone as customer_phone,

  ps.printer_name,
  ps.paper_width,
  ps.print_mode

from public.print_jobs pj
left join public.orders o on o.id = pj.order_id
left join public.customers c on c.id = o.customer_id
left join public.printer_settings ps on ps.id = pj.printer_setting_id;

-- =========================================
-- 17. RLS
-- =========================================

alter table public.printer_settings enable row level security;
alter table public.print_jobs enable row level security;
alter table public.print_logs enable row level security;
alter table public.receipt_templates enable row level security;

-- =========================================
-- 18. POLICIES BÁSICAS PARA ADMINS DA EMPRESA
-- =========================================

drop policy if exists "Admins can manage printer settings" on public.printer_settings;
create policy "Admins can manage printer settings"
on public.printer_settings
for all
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = printer_settings.company_id
      and cu.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = printer_settings.company_id
      and cu.user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage print jobs" on public.print_jobs;
create policy "Admins can manage print jobs"
on public.print_jobs
for all
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = print_jobs.company_id
      and cu.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = print_jobs.company_id
      and cu.user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage print logs" on public.print_logs;
create policy "Admins can manage print logs"
on public.print_logs
for all
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = print_logs.company_id
      and cu.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = print_logs.company_id
      and cu.user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage receipt templates" on public.receipt_templates;
create policy "Admins can manage receipt templates"
on public.receipt_templates
for all
using (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = receipt_templates.company_id
      and cu.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.company_users cu
    where cu.company_id = receipt_templates.company_id
      and cu.user_id = auth.uid()
  )
);
