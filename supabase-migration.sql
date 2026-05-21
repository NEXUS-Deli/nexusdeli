-- ============================================================
-- MÓDULO DE IMPRESSÃO TÉRMICA — NexusDeli
-- Execute este SQL no SQL Editor do Supabase
-- ============================================================

-- 0. COMPANIES (empresas / tenant)
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

-- 1. PRODUCT CATEGORIES
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

-- 2. PRODUCTS
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

-- 3. PRODUCT ADDONS
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

-- 4. CUSTOMERS
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

-- 5. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  order_number integer not null,
  checkout_token text unique,
  status text default 'rascunho',
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
  )
);

-- Sequence for order numbers per company
create sequence if not exists public.order_number_seq;

-- 6. ORDER ITEMS
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

-- 7. ORDER ITEM ADDONS
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

-- 8. PRINTER SETTINGS
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
  )
);

-- 9. PRINT JOBS
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

  constraint print_jobs_status_check check (
    status in ('pendente', 'imprimindo', 'impresso', 'erro', 'cancelado')
  )
);

-- 10. PRINT LOGS
create table if not exists public.print_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  print_job_id uuid references public.print_jobs(id) on delete cascade,
  action text not null,
  status text,
  payload jsonb default '{}'::jsonb,
  response jsonb default '{}'::jsonb,
  error_message text,
  created_at timestamptz default now()
);

-- 11. RECEIPT TEMPLATES
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

-- 12. LOYALTY POINTS
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

-- 13. LOYALTY TRANSACTIONS
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

-- 14. COUPONS (extended from existing)
alter table public.coupons add column if not exists company_id uuid references public.companies(id) on delete cascade;
alter table public.coupons add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.coupons add column if not exists max_uses integer default 1;
alter table public.coupons add column if not exists used_count integer default 0;
alter table public.coupons add column if not exists min_order_value decimal(10,2) default 0;
alter table public.coupons add column if not exists discount_type text default 'percentual';
alter table public.coupons add column if not exists discount_value decimal(10,2) default 0;
alter table public.coupons add column if not exists expires_at timestamptz;
alter table public.coupons add column if not exists is_active boolean default true;

-- Indexes
create unique index if not exists idx_companies_slug on public.companies(slug) where slug is not null;
create index if not exists idx_products_company_id on public.products(company_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_product_categories_company_id on public.product_categories(company_id);
create index if not exists idx_customers_company_id on public.customers(company_id);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_orders_company_id on public.orders(company_id);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_checkout_token on public.orders(checkout_token) where checkout_token is not null;
create index if not exists idx_orders_created_at on public.orders(created_at);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_item_addons_order_item_id on public.order_item_addons(order_item_id);
create index if not exists idx_printer_settings_company_id on public.printer_settings(company_id);
create index if not exists idx_print_jobs_company_id on public.print_jobs(company_id);
create index if not exists idx_print_jobs_status on public.print_jobs(status);
create index if not exists idx_print_jobs_order_id on public.print_jobs(order_id);
create index if not exists idx_print_logs_print_job_id on public.print_logs(print_job_id);
create index if not exists idx_receipt_templates_company_id on public.receipt_templates(company_id);
create index if not exists idx_loyalty_points_customer_id on public.loyalty_points(customer_id);

-- Enable RLS
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

-- RLS Policies (simplified — owner access by company_id)
create policy "Users can view their own company"
  on public.companies for select
  using (owner_id = auth.uid());

create policy "Users can insert their own company"
  on public.companies for insert
  with check (owner_id = auth.uid());

create policy "Users can update their own company"
  on public.companies for update
  using (owner_id = auth.uid());

-- Helper function to get user's company_id
create or replace function public.get_user_company_id()
returns uuid
language sql
stable
as $$
  select id from public.companies where owner_id = auth.uid() limit 1;
$$;

-- Generic policy using company ownership for all tenant tables
create or replace function public.company_belongs_to_user(company_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.companies
    where id = company_id and owner_id = auth.uid()
  );
$$;

-- Apply RLS policies for all tenant-scoped tables
do $$
declare
  tables_list text[] := array[
    'product_categories', 'products', 'product_addons',
    'customers', 'orders', 'order_items', 'order_item_addons',
    'printer_settings', 'print_jobs', 'print_logs', 'receipt_templates',
    'loyalty_points', 'loyalty_transactions'
  ];
  t text;
begin
  foreach t in array tables_list
  loop
    execute format(
      'create policy "Users can view their own %1$s" on public.%1$s for select
        using (public.company_belongs_to_user(company_id))',
      t
    );
    execute format(
      'create policy "Users can insert their own %1$s" on public.%1$s for insert
        with check (public.company_belongs_to_user(company_id))',
      t
    );
    execute format(
      'create policy "Users can update their own %1$s" on public.%1$s for update
        using (public.company_belongs_to_user(company_id))',
      t
    );
    execute format(
      'create policy "Users can delete their own %1$s" on public.%1$s for delete
        using (public.company_belongs_to_user(company_id))',
      t
    );
  end loop;
end;
$$;
