-- =========================================================
-- STOCKROOM INVENTORY TRACKING SYSTEM — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- =========================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "uuid-ossp";

-- ---------- PROFILES (extends auth.users) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'staff' check (role in ('admin', 'manager', 'staff')),
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

-- ---------- SUPPLIERS ----------
create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  created_at timestamptz default now()
);

-- ---------- WAREHOUSES / LOCATIONS ----------
create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  created_at timestamptz default now()
);

-- ---------- PRODUCTS ----------
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  sku text not null unique,
  name text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  supplier_id uuid references suppliers(id) on delete set null,
  unit_price numeric(12,2) default 0 check (unit_price >= 0),
  cost_price numeric(12,2) default 0 check (cost_price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  reorder_level integer not null default 10 check (reorder_level >= 0),
  location_id uuid references locations(id) on delete set null,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_supplier on products(supplier_id);
create index if not exists idx_products_sku on products(sku);

-- ---------- STOCK TRANSACTIONS (audit trail of every stock movement) ----------
create table if not exists stock_transactions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('in', 'out', 'adjustment')),
  quantity integer not null,
  reason text,
  reference_no text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create index if not exists idx_txn_product on stock_transactions(product_id);
create index if not exists idx_txn_created_at on stock_transactions(created_at desc);

-- ---------- FUNCTION: apply a stock transaction and update product quantity ----------
create or replace function apply_stock_transaction(
  p_product_id uuid,
  p_type text,
  p_quantity integer,
  p_reason text,
  p_reference_no text
) returns void as $$
declare
  v_delta integer;
begin
  if p_type = 'in' then
    v_delta := p_quantity;
  elsif p_type = 'out' then
    v_delta := -p_quantity;
  else
    v_delta := p_quantity; -- adjustment can be positive or negative
  end if;

  update products
  set quantity = greatest(0, quantity + v_delta),
      updated_at = now()
  where id = p_product_id;

  insert into stock_transactions (product_id, type, quantity, reason, reference_no, created_by)
  values (p_product_id, p_type, p_quantity, p_reason, p_reference_no, auth.uid());
end;
$$ language plpgsql security definer;

-- ---------- updated_at auto-touch ----------
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_touch_updated_at on products;
create trigger products_touch_updated_at
  before update on products
  for each row execute procedure touch_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- Any authenticated user in this Supabase project can read/write.
-- Tighten these policies further (e.g. by role) if you need
-- stricter multi-tenant access control.
-- =========================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table suppliers enable row level security;
alter table locations enable row level security;
alter table products enable row level security;
alter table stock_transactions enable row level security;

-- Profiles: users can read all profiles, but only update their own
create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Categories
create policy "categories_select" on categories for select using (auth.role() = 'authenticated');
create policy "categories_insert" on categories for insert with check (auth.role() = 'authenticated');
create policy "categories_update" on categories for update using (auth.role() = 'authenticated');
create policy "categories_delete" on categories for delete using (auth.role() = 'authenticated');

-- Suppliers
create policy "suppliers_select" on suppliers for select using (auth.role() = 'authenticated');
create policy "suppliers_insert" on suppliers for insert with check (auth.role() = 'authenticated');
create policy "suppliers_update" on suppliers for update using (auth.role() = 'authenticated');
create policy "suppliers_delete" on suppliers for delete using (auth.role() = 'authenticated');

-- Locations
create policy "locations_select" on locations for select using (auth.role() = 'authenticated');
create policy "locations_insert" on locations for insert with check (auth.role() = 'authenticated');
create policy "locations_update" on locations for update using (auth.role() = 'authenticated');
create policy "locations_delete" on locations for delete using (auth.role() = 'authenticated');

-- Products
create policy "products_select" on products for select using (auth.role() = 'authenticated');
create policy "products_insert" on products for insert with check (auth.role() = 'authenticated');
create policy "products_update" on products for update using (auth.role() = 'authenticated');
create policy "products_delete" on products for delete using (auth.role() = 'authenticated');

-- Stock transactions
create policy "txn_select" on stock_transactions for select using (auth.role() = 'authenticated');
create policy "txn_insert" on stock_transactions for insert with check (auth.role() = 'authenticated');

-- =========================================================
-- SEED DATA (optional — comment out if you don't want demo data)
-- =========================================================
insert into categories (name, description) values
  ('Electronics', 'Gadgets, cables, and components'),
  ('Office Supplies', 'Stationery and office consumables'),
  ('Packaging', 'Boxes, tape, and shipping materials')
on conflict (name) do nothing;

insert into locations (name, address) values
  ('Main Warehouse', 'Jodhpur, Rajasthan'),
  ('Retail Store', 'Jodhpur, Rajasthan')
on conflict do nothing;
