-- KASIRKU ONLINE - SUPABASE SCHEMA
-- Jalankan file ini di Supabase SQL Editor.
-- Stack: GitHub Pages + Supabase Free.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  password text not null,
  name text not null,
  role text not null check (role in ('master', 'owner', 'customer')),
  phone text,
  address text,
  status text default 'Aktif' check (status in ('Aktif', 'Nonaktif')),
  created_at timestamp with time zone default now()
);

create table if not exists public.stores (
  id uuid primary key default uuid_generate_v4(),
  owner_username text not null,
  name text not null,
  address text,
  phone text,
  logo_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.employees (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references public.stores(id) on delete cascade,
  name text not null,
  position text not null,
  phone text,
  email text,
  shift text,
  salary numeric default 0,
  status text default 'Aktif',
  address text,
  created_at timestamp with time zone default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references public.stores(id) on delete cascade,
  sku text,
  barcode text,
  name text not null,
  category text default 'Umum',
  price numeric not null default 0,
  cost_price numeric default 0,
  stock integer default 0,
  min_stock integer default 0,
  icon text default '📦',
  image_url text,
  description text,
  weight numeric default 0,
  condition text default 'Baru',
  status text default 'Aktif',
  rating numeric default 4.8,
  sold integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  trx_code text unique not null,
  store_id uuid references public.stores(id) on delete cascade,
  customer_username text,
  cashier_username text,
  channel text default 'Online',
  customer_name text,
  payment text,
  note text,
  shipping_address text,
  voucher_code text,
  subtotal numeric default 0,
  discount numeric default 0,
  service_fee numeric default 0,
  total numeric default 0,
  paid numeric default 0,
  change_amount numeric default 0,
  status text default 'Dikemas',
  trx_date date default current_date,
  created_at timestamp with time zone default now()
);

create table if not exists public.transaction_items (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid references public.transactions(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  qty integer not null,
  price numeric not null,
  subtotal numeric generated always as (qty * price) stored
);

create table if not exists public.carts (
  id uuid primary key default uuid_generate_v4(),
  customer_username text not null,
  product_id uuid references public.products(id) on delete cascade,
  qty integer default 1,
  created_at timestamp with time zone default now()
);

create table if not exists public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  customer_username text not null,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists public.vouchers (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references public.stores(id) on delete cascade,
  code text not null,
  title text,
  description text,
  type text check (type in ('percent', 'fixed')),
  value numeric default 0,
  max_discount numeric default 0,
  min_spend numeric default 0,
  active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.stock_logs (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references public.stores(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  product_name text,
  type text,
  qty integer,
  note text,
  created_at timestamp with time zone default now()
);

create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references public.stores(id) on delete cascade,
  message text not null,
  created_at timestamp with time zone default now()
);

-- DATA AWAL DEMO
insert into public.profiles (username, password, name, role, status)
values
  ('master', 'master123', 'Akun Master', 'master', 'Aktif'),
  ('pemilik', 'toko123', 'Pemilik Toko', 'owner', 'Aktif'),
  ('pelanggan', 'pelanggan123', 'Pelanggan', 'customer', 'Aktif')
on conflict (username) do nothing;

insert into public.stores (owner_username, name, address, phone)
select 'pemilik', 'Toko Demo KasirKu', 'Indonesia', '0800000000'
where not exists (select 1 from public.stores where owner_username = 'pemilik');

-- Catatan keamanan tahap belajar:
-- Untuk prototype gratis dan mudah, tabel dibuat public-access dulu.
-- Untuk produksi, aktifkan Row Level Security dan policy per role.

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.employees enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.carts enable row level security;
alter table public.wishlists enable row level security;
alter table public.vouchers enable row level security;
alter table public.stock_logs enable row level security;
alter table public.activities enable row level security;

-- Policy prototype: izinkan semua operasi menggunakan anon key.
-- Ini hanya untuk belajar/prototype. Setelah login auth siap, policy harus diperketat.
create policy "prototype all profiles" on public.profiles for all using (true) with check (true);
create policy "prototype all stores" on public.stores for all using (true) with check (true);
create policy "prototype all employees" on public.employees for all using (true) with check (true);
create policy "prototype all products" on public.products for all using (true) with check (true);
create policy "prototype all transactions" on public.transactions for all using (true) with check (true);
create policy "prototype all transaction_items" on public.transaction_items for all using (true) with check (true);
create policy "prototype all carts" on public.carts for all using (true) with check (true);
create policy "prototype all wishlists" on public.wishlists for all using (true) with check (true);
create policy "prototype all vouchers" on public.vouchers for all using (true) with check (true);
create policy "prototype all stock_logs" on public.stock_logs for all using (true) with check (true);
create policy "prototype all activities" on public.activities for all using (true) with check (true);
