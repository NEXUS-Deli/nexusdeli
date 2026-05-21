-- =========================================
-- MIGRATION COMPLETA — NexusDeli
-- Ordem correta: empresas → clientes → produtos → pedidos → impressão
-- =========================================

-- =========================================
-- 0. COMPANIES (tenant)
-- =========================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Minha Loja',
  slug text unique,
  cnpj text,
  phone text,
  email text,
  address text,
  logo_url text,
  delivery_fee decimal(10,2) default 0,
  working_hours jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- 1. PRODUCT CATEGORIES
-- =========================================
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  slug text,
  description text,
  image_url text,
  display_order integer default 0,
  is_active boolean default true,
  print_sector text default 'cozinha',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- 2. PRODUCTS
-- =========================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  price decimal(10,2) not null,
  cost_price decimal(10,2) default 0,
  sku text,
  preparation_time integer default 0,
  stock_quantity integer default 999,
  is_active boolean default true,
  is_featured boolean default false,
  is_promotional boolean default false,
  promotional_price decimal(10,2),
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- 3. PRODUCT ADDONS
-- =========================================
create table if not exists public.product_addons (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  name text not null,
  description text,
  price decimal(10,2) default 0,
  max_quantity integer default 1,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =========================================
-- 4. CUSTOMERS
-- =========================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  address text,
  birth_date date,
  notes text,
  total_orders integer default 0,
  total_spent decimal(10,2) default 0,
  total_profit decimal(10,2) default 0,
  last_order_at timestamptz,
  first_order_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(company_id, phone)
);

-- =========================================
-- 5. ORDERS
-- =========================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  order_number integer not null,
  checkout_token text unique,
  status text default 'rascunho',
  print_status text default 'nao_impresso',
  source text default 'whatsapp',
  subtotal decimal(10,2) default 0,
  delivery_fee decimal(10,2) default 0,
  discount_total decimal(10,2) default 0,
  total decimal(10,2) default 0,
  cost_total decimal(10,2) default 0,
  profit_total decimal(10,2) default 0,
  payment_method text default 'dinheiro',
  payment_status text default 'pendente',
  change_for decimal(10,2),
  delivery_address text,
  delivery_reference text,
  notes text,
  coupon_code text,
  discount_type text,
  discount_value decimal(10,2),
  preparation_time integer default 0,
  confirmed_at timestamptz,
  preparing_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  whatsapp_redirected_at timestamptz,
  printed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint orders_status_check check (
    status in ('rascunho', 'aguardando_whatsapp', 'confirmado', 'preparo', 'saiu_entrega', 'entregue', 'cancelado')
  ),
  constraint orders_payment_method_check check (
    payment_method in ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'vale_refeicao')
  ),
  constraint orders_payment_status_check check (
    payment_status in ('pendente', 'pago', 'cancelado')
  ),
  constraint orders_print_status_check check (
    print_status in ('nao_impresso', 'pendente', 'imprimindo', 'impresso', 'erro')
  )
);

-- =========================================
-- 6. ORDER ITEMS
-- =========================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  cost_price decimal(10,2) default 0,
  notes text,
  created_at timestamptz default now()
);

-- =========================================
-- 7. ORDER ITEM ADDONS
-- =========================================
create table if not exists public.order_item_addons (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  addon_id uuid,
  addon_name text not null,
  quantity integer default 1,
  price decimal(10,2) default 0,
  created_at timestamptz default now()
);

-- =========================================
-- 8. PRINTER SETTINGS
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
-- 9. PRINT JOBS
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
-- 10. PRINT LOGS
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
    action in ('criado', 'iniciado', 'enviado_para_impressora', 'impresso', 'erro', 'cancelado', 'reimpresso')
  )
);

-- =========================================
-- 11. RECEIPT TEMPLATES
-- =========================================
create table if not exists public.receipt_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null default 'Modelo padrao',
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
-- 12. LOYALTY POINTS
-- =========================================
create table if not exists public.loyalty_points (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  points integer default 0,
  points_spent integer default 0,
  points_expired integer default 0,
  level text default 'bronze',
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint loyalty_points_level_check check (
    level in ('bronze', 'prata', 'ouro', 'vip')
  )
);

-- =========================================
-- 13. LOYALTY TRANSACTIONS
-- =========================================
create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  type text not null,
  points integer not null,
  description text,
  created_at timestamptz default now(),

  constraint loyalty_transactions_type_check check (
    type in ('earn', 'spend', 'expire', 'bonus')
  )
);

-- =========================================
-- 14. COMPANY_USERS (for RLS)
-- =========================================
create table if not exists public.company_users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text default 'admin',
  created_at timestamptz default now(),
  unique(company_id, user_id)
);

-- Auto-create company_user for owner
insert into public.company_users (company_id, user_id, role)
select id, owner_id, 'admin'
from public.companies
where owner_id is not null
on conflict (company_id, user_id) do nothing;

-- =========================================
-- 15. INDEXES
-- =========================================
create index if not exists idx_companies_owner on public.companies(owner_id);
create unique index if not exists idx_companies_slug on public.companies(slug) where slug is not null;
create index if not exists idx_products_company on public.products(company_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_product_categories_company on public.product_categories(company_id);
create index if not exists idx_customers_company on public.customers(company_id);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_orders_company on public.orders(company_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_print_status on public.orders(print_status);
create unique index if not exists idx_orders_checkout_token on public.orders(checkout_token) where checkout_token is not null;
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_item_addons_item on public.order_item_addons(order_item_id);
create index if not exists idx_printer_settings_company on public.printer_settings(company_id);
create index if not exists idx_print_jobs_company on public.print_jobs(company_id);
create index if not exists idx_print_jobs_order on public.print_jobs(order_id);
create index if not exists idx_print_jobs_status on public.print_jobs(status);
create index if not exists idx_print_jobs_sector on public.print_jobs(printer_sector);
create index if not exists idx_print_logs_job on public.print_logs(print_job_id);
create index if not exists idx_receipt_templates_company on public.receipt_templates(company_id);
create index if not exists idx_loyalty_points_customer on public.loyalty_points(customer_id);

-- =========================================
-- 16. UPDATED_AT TRIGGER
-- =========================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.apply_updated_at_trigger(table_name text) returns void as $$
begin
  execute format(
    'drop trigger if exists set_%s_updated_at on public.%s; create trigger set_%s_updated_at before update on public.%s for each row execute function public.set_updated_at();',
    table_name, table_name, table_name, table_name
  );
end;
$$ language plpgsql;

select public.apply_updated_at_trigger('companies');
select public.apply_updated_at_trigger('product_categories');
select public.apply_updated_at_trigger('products');
select public.apply_updated_at_trigger('customers');
select public.apply_updated_at_trigger('orders');
select public.apply_updated_at_trigger('printer_settings');
select public.apply_updated_at_trigger('print_jobs');
select public.apply_updated_at_trigger('receipt_templates');
select public.apply_updated_at_trigger('loyalty_points');

-- =========================================
-- 17. AUTO PRINT JOB ON ORDER INSERT
-- =========================================
create or replace function public.create_print_job_after_order()
returns trigger as $$
declare
  selected_printer_id uuid;
  selected_copies integer;
begin
  select ps.id, ps.copies
  into selected_printer_id, selected_copies
  from public.printer_settings ps
  where ps.company_id = new.company_id
    and ps.is_active = true
    and ps.printer_sector = 'balcao'
  order by ps.created_at asc
  limit 1;

  insert into public.print_jobs (
    company_id, order_id, printer_setting_id,
    printer_sector, status, copies,
    receipt_data
  ) values (
    new.company_id, new.id, selected_printer_id,
    'balcao', 'pendente', coalesce(selected_copies, 1),
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

  update public.orders set print_status = 'pendente' where id = new.id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_create_print_job_after_order on public.orders;
create trigger trigger_create_print_job_after_order
after insert on public.orders
for each row execute function public.create_print_job_after_order();

-- =========================================
-- 18. LOG PRINT JOB CREATION
-- =========================================
create or replace function public.log_print_job_created()
returns trigger as $$
begin
  insert into public.print_logs (company_id, print_job_id, action, status, payload)
  values (
    new.company_id, new.id, 'criado', new.status,
    jsonb_build_object('order_id', new.order_id, 'printer_sector', new.printer_sector, 'copies', new.copies)
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_log_print_job_created on public.print_jobs;
create trigger trigger_log_print_job_created
after insert on public.print_jobs
for each row execute function public.log_print_job_created();

-- =========================================
-- 19. PRINT FUNCTIONS
-- =========================================
create or replace function public.start_print_job(p_print_job_id uuid)
returns public.print_jobs as $$
declare
  job public.print_jobs;
begin
  update public.print_jobs
  set status = 'imprimindo', printing_started_at = now(), retry_count = retry_count + 1, last_retry_at = now(), error_message = null
  where id = p_print_job_id and status in ('pendente', 'erro')
  returning * into job;

  if job.id is null then raise exception 'Print job nao encontrado ou ja em processamento.'; end if;

  update public.orders set print_status = 'imprimindo' where id = job.order_id;
  insert into public.print_logs (company_id, print_job_id, action, status, payload)
  values (job.company_id, job.id, 'iniciado', 'imprimindo', jsonb_build_object('retry_count', job.retry_count));

  return job;
end;
$$ language plpgsql;

create or replace function public.mark_print_job_as_printed(p_print_job_id uuid)
returns public.print_jobs as $$
declare
  job public.print_jobs;
begin
  update public.print_jobs
  set status = 'impresso', printed_at = now(), error_message = null
  where id = p_print_job_id
  returning * into job;

  if job.id is null then raise exception 'Print job nao encontrado.'; end if;

  update public.orders set print_status = 'impresso', printed_at = now() where id = job.order_id;
  insert into public.print_logs (company_id, print_job_id, action, status)
  values (job.company_id, job.id, 'impresso', 'impresso');

  return job;
end;
$$ language plpgsql;

create or replace function public.mark_print_job_as_error(p_print_job_id uuid, p_error_message text)
returns public.print_jobs as $$
declare
  job public.print_jobs;
begin
  update public.print_jobs
  set status = 'erro', error_message = p_error_message, last_retry_at = now()
  where id = p_print_job_id
  returning * into job;

  if job.id is null then raise exception 'Print job nao encontrado.'; end if;

  update public.orders set print_status = 'erro' where id = job.order_id;
  insert into public.print_logs (company_id, print_job_id, action, status, error_message)
  values (job.company_id, job.id, 'erro', 'erro', p_error_message);

  return job;
end;
$$ language plpgsql;

create or replace function public.reprint_order(p_order_id uuid)
returns public.print_jobs as $$
declare
  original_job public.print_jobs;
  new_job public.print_jobs;
begin
  select * into original_job from public.print_jobs where order_id = p_order_id order by created_at desc limit 1;
  if original_job.id is null then raise exception 'Nenhum print job encontrado para este pedido.'; end if;

  insert into public.print_jobs (company_id, order_id, printer_setting_id, printer_sector, status, copies, receipt_text, receipt_html, receipt_data)
  values (original_job.company_id, original_job.order_id, original_job.printer_setting_id, original_job.printer_sector, 'pendente', original_job.copies, original_job.receipt_text, original_job.receipt_html, original_job.receipt_data)
  returning * into new_job;

  update public.orders set print_status = 'pendente' where id = p_order_id;
  insert into public.print_logs (company_id, print_job_id, action, status, payload)
  values (new_job.company_id, new_job.id, 'reimpresso', 'pendente', jsonb_build_object('original_print_job_id', original_job.id));

  return new_job;
end;
$$ language plpgsql;

create or replace function public.cancel_print_job(p_print_job_id uuid)
returns public.print_jobs as $$
declare
  job public.print_jobs;
begin
  update public.print_jobs set status = 'cancelado' where id = p_print_job_id returning * into job;
  if job.id is null then raise exception 'Print job nao encontrado.'; end if;
  insert into public.print_logs (company_id, print_job_id, action, status) values (job.company_id, job.id, 'cancelado', 'cancelado');
  return job;
end;
$$ language plpgsql;

-- =========================================
-- 20. VIEW — PRINT QUEUE
-- =========================================
create or replace view public.v_print_queue as
select
  pj.id as print_job_id, pj.company_id, pj.order_id, pj.status as print_status,
  pj.printer_sector, pj.copies, pj.retry_count, pj.error_message, pj.created_at as print_created_at,
  o.order_number, o.status as order_status, o.total, o.payment_method, o.payment_status,
  o.delivery_address, o.notes, o.created_at as order_created_at,
  c.name as customer_name, c.phone as customer_phone,
  ps.printer_name, ps.paper_width, ps.print_mode
from public.print_jobs pj
left join public.orders o on o.id = pj.order_id
left join public.customers c on c.id = o.customer_id
left join public.printer_settings ps on ps.id = pj.printer_setting_id;

-- =========================================
-- 21. RLS POLICIES
-- =========================================
alter table public.companies enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_addons enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_addons enable row level security;
alter table public.printer_settings enable row level security;
alter table public.print_jobs enable row level security;
alter table public.print_logs enable row level security;
alter table public.receipt_templates enable row level security;
alter table public.loyalty_points enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.company_users enable row level security;

-- Policy helper: user can access own company data
create or replace function public.user_belongs_to_company(company_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.company_users cu
    where cu.company_id = user_belongs_to_company.company_id
      and cu.user_id = auth.uid()
  );
end;
$$ language plpgsql stable;

-- Company policies (owner only)
drop policy if exists "Owner can manage company" on public.companies;
create policy "Owner can manage company" on public.companies
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Generic policies for all tenant tables
do $$
declare
  tables text[] := array[
    'product_categories', 'products', 'product_addons',
    'customers', 'orders', 'order_items', 'order_item_addons',
    'printer_settings', 'print_jobs', 'print_logs', 'receipt_templates',
    'loyalty_points', 'loyalty_transactions'
  ];
  t text;
begin
  foreach t in array tables
  loop
    execute format(
      'drop policy if exists "Users can view %s" on public.%s;
       create policy "Users can view %s" on public.%s for select
         using (public.user_belongs_to_company(company_id));',
      t, t, t, t
    );
    execute format(
      'drop policy if exists "Users can insert %s" on public.%s;
       create policy "Users can insert %s" on public.%s for insert
         with check (public.user_belongs_to_company(company_id));',
      t, t, t, t
    );
    execute format(
      'drop policy if exists "Users can update %s" on public.%s;
       create policy "Users can update %s" on public.%s for update
         using (public.user_belongs_to_company(company_id));',
      t, t, t, t
    );
    execute format(
      'drop policy if exists "Users can delete %s" on public.%s;
       create policy "Users can delete %s" on public.%s for delete
         using (public.user_belongs_to_company(company_id));',
      t, t, t, t
    );
  end loop;
end;
$$;

-- Company_users policy
drop policy if exists "Users can view their company users" on public.company_users;
create policy "Users can view their company users" on public.company_users
  for select using (user_id = auth.uid());

drop policy if exists "Users can manage their company users" on public.company_users;
create policy "Users can manage their company users" on public.company_users
  for insert with check (
    exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
  );

-- =========================================
-- 22. SEQUENCE FOR ORDER NUMBERS
-- =========================================
create sequence if not exists public.order_number_seq;
