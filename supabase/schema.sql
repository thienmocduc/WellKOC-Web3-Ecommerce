-- ============================================================
-- WELLKOC PLATFORM — Supabase PostgreSQL Schema
-- Version: 1.0 | 2026-03
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy search

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('buyer', 'koc', 'vendor', 'admin');
create type order_status as enum ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'refunded');
create type product_status as enum ('pending', 'active', 'paused', 'rejected');
create type payment_method as enum ('wallet', 'vnpay', 'momo', 'cod', 'w3c_token');
create type commission_status as enum ('pending', 'processing', 'paid', 'failed');
create type pool_type as enum ('A', 'B', 'C'); -- monthly, annual, global
create type kyc_status as enum ('unverified', 'pending', 'verified', 'rejected');

-- ============================================================
-- 1. USERS (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  role          user_role not null default 'buyer',
  display_name  text not null,
  phone         text,
  avatar_url    text,
  kyc_status    kyc_status not null default 'unverified',
  kyc_data      jsonb default '{}',           -- CCCD, passport scan URLs
  xp            integer not null default 0,
  level         text not null default 'Starter', -- Starter/Silver/Gold/Platinum
  referral_code text unique,                  -- e.g. LINH2026
  referred_by   uuid references public.profiles(id),
  wallet_address text,                        -- Polygon wallet
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- KOC-specific profile data
create table public.koc_profiles (
  user_id         uuid references public.profiles(id) on delete cascade primary key,
  handle          text unique not null,        -- @linh.koc
  tier            text not null default 'Starter',
  total_gmv       numeric(15,2) not null default 0,
  total_t1        numeric(15,2) not null default 0,  -- lifetime T1 earned
  total_t2        numeric(15,2) not null default 0,  -- lifetime T2 earned
  current_month_orders integer not null default 0,
  team_size       integer not null default 0,
  sponsor_id      uuid references public.profiles(id), -- who recruited this KOC
  joined_at       timestamptz not null default now()
);

-- Vendor-specific profile data
create table public.vendor_profiles (
  user_id         uuid references public.profiles(id) on delete cascade primary key,
  business_name   text not null,
  business_reg    text,                        -- MST / business license
  category        text[],
  bank_account    jsonb default '{}',          -- encrypted bank details
  default_discount_pct numeric(5,2) not null default 20, -- 15-55%
  total_products  integer not null default 0,
  total_orders    integer not null default 0,
  total_revenue   numeric(15,2) not null default 0,
  rating          numeric(3,2) not null default 5.0,
  joined_at       timestamptz not null default now()
);

-- ============================================================
-- 2. WALLETS
-- ============================================================
create table public.wallets (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade unique,
  balance    numeric(15,2) not null default 0,   -- VND balance
  coins      integer not null default 0,          -- WellCoins
  w3c_tokens numeric(18,8) not null default 0,   -- W3C Token
  frozen     numeric(15,2) not null default 0,    -- locked for pending payouts
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id          uuid default uuid_generate_v4() primary key,
  wallet_id   uuid references public.wallets(id) on delete cascade,
  type        text not null,  -- deposit, withdrawal, commission, refund, fee
  amount      numeric(15,2) not null,
  currency    text not null default 'VND',
  balance_after numeric(15,2) not null,
  ref_id      uuid,           -- order_id or commission_id
  ref_type    text,           -- 'order' | 'commission' | 'manual'
  note        text,
  tx_hash     text,           -- Polygon tx hash if on-chain
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 3. CATEGORIES & PRODUCTS
-- ============================================================
create table public.categories (
  id          uuid default uuid_generate_v4() primary key,
  slug        text unique not null,   -- skincare, supplement, food
  name_vi     text not null,
  name_en     text not null,
  icon        text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true
);

create table public.products (
  id              uuid default uuid_generate_v4() primary key,
  vendor_id       uuid references public.profiles(id) on delete cascade,
  category_id     uuid references public.categories(id),
  name_vi         text not null,
  name_en         text,
  slug            text unique not null,
  description_vi  text,
  description_en  text,
  price           numeric(12,2) not null,
  original_price  numeric(12,2),              -- before discount
  discount_pct    numeric(5,2) not null,      -- vendor's platform discount: 15-55%
  stock           integer not null default 0,
  sold_count      integer not null default 0,
  images          text[] default '{}',        -- Supabase Storage URLs
  emoji           text default '🏷️',
  origin          text,                       -- 🇰🇷 Hàn Quốc
  certifications  text[],                     -- ['GMP', 'ISO22000']
  status          product_status not null default 'pending',
  is_dpp          boolean not null default false,
  dpp_token_id    text,                       -- Polygon NFT token ID
  dpp_contract    text,                       -- contract address
  rating          numeric(3,2) not null default 0,
  review_count    integer not null default 0,
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_products_vendor on public.products(vendor_id);
create index idx_products_category on public.products(category_id);
create index idx_products_status on public.products(status);
create index idx_products_search on public.products using gin(
  to_tsvector('simple', coalesce(name_vi,'') || ' ' || coalesce(name_en,''))
);

-- ============================================================
-- 4. ORDERS
-- ============================================================
create table public.orders (
  id              uuid default uuid_generate_v4() primary key,
  order_number    text unique not null,         -- ORD-2026-xxxxx
  buyer_id        uuid references public.profiles(id),
  koc_ref_id      uuid references public.profiles(id), -- KOC who referred
  status          order_status not null default 'pending',
  subtotal        numeric(12,2) not null,
  shipping_fee    numeric(10,2) not null default 0,
  discount        numeric(10,2) not null default 0,
  total           numeric(12,2) not null,
  payment_method  payment_method not null default 'wallet',
  payment_status  text not null default 'pending',
  tx_hash         text,                         -- on-chain payment hash
  shipping_address jsonb not null default '{}',
  notes           text,
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  cancelled_at    timestamptz,
  cancel_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.order_items (
  id          uuid default uuid_generate_v4() primary key,
  order_id    uuid references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id),
  vendor_id   uuid references public.profiles(id),
  quantity    integer not null,
  unit_price  numeric(12,2) not null,
  discount_pct numeric(5,2) not null,          -- vendor discount at time of order
  platform_revenue numeric(12,2) not null,     -- unit_price * discount_pct / 100
  subtotal    numeric(12,2) not null,
  product_snapshot jsonb not null default '{}' -- product data at order time
);

create index idx_orders_buyer on public.orders(buyer_id);
create index idx_orders_koc on public.orders(koc_ref_id);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order on public.order_items(order_id);
create index idx_order_items_vendor on public.order_items(vendor_id);

-- Auto-generate order number
create or replace function generate_order_number()
returns trigger as $$
begin
  new.order_number := 'ORD-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('order_seq')::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create sequence order_seq start 10001;
create trigger set_order_number before insert on public.orders
  for each row execute function generate_order_number();

-- ============================================================
-- 5. COMMISSIONS — The Core of WellKOC
-- ============================================================
create table public.commissions (
  id              uuid default uuid_generate_v4() primary key,
  order_id        uuid references public.orders(id) on delete cascade,
  order_item_id   uuid references public.order_items(id),
  koc_id          uuid references public.profiles(id),  -- who earns
  tier            text not null,              -- 'T1' | 'T2' | 'pool_a' | 'pool_b' | 'pool_c'
  pct             numeric(5,2) not null,      -- 40.00, 13.00, etc.
  base_amount     numeric(12,2) not null,     -- platform_revenue of the order
  amount          numeric(12,2) not null,     -- actual commission = base * pct/100
  status          commission_status not null default 'pending',
  paid_at         timestamptz,
  tx_hash         text,                       -- on-chain transfer hash
  wallet_id       uuid references public.wallets(id),
  created_at      timestamptz not null default now()
);

create index idx_commissions_koc on public.commissions(koc_id);
create index idx_commissions_order on public.commissions(order_id);
create index idx_commissions_status on public.commissions(status);

-- ============================================================
-- 6. POOL REWARDS (A=monthly, B=annual, C=global quarterly)
-- ============================================================
create table public.reward_pools (
  id          uuid default uuid_generate_v4() primary key,
  pool_type   pool_type not null,
  period      text not null,    -- '2026-03' for monthly, '2026' for annual, '2026-Q1' for global
  total_amount numeric(15,2) not null default 0,
  distributed  boolean not null default false,
  closed_at   timestamptz,
  created_at  timestamptz not null default now()
);

create table public.pool_contributions (
  id          uuid default uuid_generate_v4() primary key,
  pool_id     uuid references public.reward_pools(id),
  order_id    uuid references public.orders(id),
  amount      numeric(12,2) not null,
  created_at  timestamptz not null default now()
);

create table public.pool_payouts (
  id          uuid default uuid_generate_v4() primary key,
  pool_id     uuid references public.reward_pools(id),
  koc_id      uuid references public.profiles(id),
  rank        integer,             -- for pool A: 1-30
  points      numeric(12,2),       -- accumulated points for pool B/C
  pct_share   numeric(8,4),        -- % of pool they receive
  amount      numeric(12,2) not null,
  status      commission_status not null default 'pending',
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 7. DPP (Digital Product Passport)
-- ============================================================
create table public.dpp_passports (
  id              uuid default uuid_generate_v4() primary key,
  product_id      uuid references public.products(id) on delete cascade unique,
  token_id        text unique,               -- Polygon NFT token ID
  contract_addr   text,
  chain_id        integer default 137,       -- 137=Polygon mainnet, 80002=Amoy testnet
  tx_hash         text,                      -- mint transaction
  ipfs_uri        text,                      -- metadata on IPFS
  manufacturer    text,
  origin_country  text,
  certifications  jsonb default '[]',
  supply_chain    jsonb default '[]',        -- [{step, actor, date, verified}]
  carbon_score    numeric(8,2),
  batch_number    text,
  manufactured_at date,
  expires_at      date,
  is_verified     boolean not null default false,
  minted_at       timestamptz,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 8. REVIEWS
-- ============================================================
create table public.reviews (
  id          uuid default uuid_generate_v4() primary key,
  product_id  uuid references public.products(id) on delete cascade,
  order_id    uuid references public.orders(id),
  user_id     uuid references public.profiles(id),
  rating      integer not null check (rating between 1 and 5),
  title       text,
  body        text,
  images      text[] default '{}',
  is_verified boolean not null default false, -- verified purchase
  helpful_count integer not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_reviews_product on public.reviews(product_id);

-- ============================================================
-- 9. KOC AFFILIATE LINKS (tracking)
-- ============================================================
create table public.affiliate_links (
  id          uuid default uuid_generate_v4() primary key,
  koc_id      uuid references public.profiles(id) on delete cascade,
  product_id  uuid references public.products(id) on delete cascade,
  short_code  text unique not null,   -- wellkoc.com/p/1?ref=linh.koc
  clicks      integer not null default 0,
  conversions integer not null default 0,
  revenue     numeric(12,2) not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.affiliate_clicks (
  id           uuid default uuid_generate_v4() primary key,
  link_id      uuid references public.affiliate_links(id),
  ip_hash      text,              -- hashed for privacy
  user_agent   text,
  converted    boolean not null default false,
  order_id     uuid references public.orders(id),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- 10. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text not null,    -- order_confirmed, commission_paid, etc.
  title       text not null,
  body        text,
  data        jsonb default '{}',
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, is_read);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.koc_profiles       enable row level security;
alter table public.vendor_profiles    enable row level security;
alter table public.wallets            enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.products           enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.commissions        enable row level security;
alter table public.reviews            enable row level security;
alter table public.notifications      enable row level security;

-- Profiles: users see own, admins see all
create policy "profiles_own" on public.profiles for all
  using (auth.uid() = id);
create policy "profiles_admin" on public.profiles for all
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Products: vendors manage own, all can read active
create policy "products_read" on public.products for select
  using (status = 'active' or vendor_id = auth.uid());
create policy "products_vendor_write" on public.products for all
  using (vendor_id = auth.uid());

-- Orders: buyers/vendors/koc see own
create policy "orders_buyer" on public.orders for select
  using (buyer_id = auth.uid() or koc_ref_id = auth.uid());
create policy "orders_insert" on public.orders for insert
  with check (buyer_id = auth.uid());

-- Commissions: KOC see own
create policy "commissions_own" on public.commissions for select
  using (koc_id = auth.uid());

-- Wallets: own only
create policy "wallets_own" on public.wallets for all
  using (user_id = auth.uid());
create policy "wallet_tx_own" on public.wallet_transactions for select
  using (exists(select 1 from public.wallets w where w.id = wallet_id and w.user_id = auth.uid()));

-- Notifications: own only
create policy "notifications_own" on public.notifications for all
  using (user_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create wallet on profile creation
create or replace function create_wallet_for_profile()
returns trigger as $$
begin
  insert into public.wallets (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function create_wallet_for_profile();

-- Auto-update product rating on new review
create or replace function update_product_rating()
returns trigger as $$
begin
  update public.products
  set rating = (select round(avg(rating)::numeric, 2) from public.reviews where product_id = new.product_id),
      review_count = (select count(*) from public.reviews where product_id = new.product_id)
  where id = new.product_id;
  return new;
end;
$$ language plpgsql;

create trigger on_review_created
  after insert on public.reviews
  for each row execute function update_product_rating();

-- Process commission on order delivery (called by backend)
create or replace function process_order_commissions(p_order_id uuid)
returns void as $$
declare
  v_item    record;
  v_koc_id  uuid;
  v_t2_id   uuid;
begin
  -- Get KOC from order
  select koc_ref_id into v_koc_id from public.orders where id = p_order_id;
  if v_koc_id is null then return; end if;

  -- Get T2 (sponsor of KOC T1)
  select sponsor_id into v_t2_id from public.koc_profiles where user_id = v_koc_id;

  -- For each order item, create commissions
  for v_item in select * from public.order_items where order_id = p_order_id loop

    -- T1: 40% to direct KOC
    insert into public.commissions
      (order_id, order_item_id, koc_id, tier, pct, base_amount, amount)
    values
      (p_order_id, v_item.id, v_koc_id, 'T1', 40.0,
       v_item.platform_revenue, round(v_item.platform_revenue * 0.40, 2));

    -- T2: 13% to sponsor (if exists and sponsor is active this month)
    if v_t2_id is not null then
      insert into public.commissions
        (order_id, order_item_id, koc_id, tier, pct, base_amount, amount)
      values
        (p_order_id, v_item.id, v_t2_id, 'T2', 13.0,
         v_item.platform_revenue, round(v_item.platform_revenue * 0.13, 2));
    end if;

    -- Pool A contribution: 9%
    insert into public.pool_contributions (pool_id, order_id, amount)
    select id, p_order_id, round(v_item.platform_revenue * 0.09, 2)
    from public.reward_pools
    where pool_type = 'A'
      and period = to_char(now(), 'YYYY-MM')
      and not distributed
    limit 1;

    -- Pool B contribution: 5%
    insert into public.pool_contributions (pool_id, order_id, amount)
    select id, p_order_id, round(v_item.platform_revenue * 0.05, 2)
    from public.reward_pools
    where pool_type = 'B'
      and period = to_char(now(), 'YYYY')
      and not distributed
    limit 1;

    -- Pool C contribution: 3%
    insert into public.pool_contributions (pool_id, order_id, amount)
    select id, p_order_id, round(v_item.platform_revenue * 0.03, 2)
    from public.reward_pools
    where pool_type = 'C'
      and period = 'Q' || ceil(extract(month from now())/3.0)::text || '-' || to_char(now(), 'YYYY')
      and not distributed
    limit 1;

  end loop;

  -- Update commission totals in koc_profiles
  update public.koc_profiles
  set total_t1 = total_t1 + (
    select coalesce(sum(amount), 0) from public.commissions
    where order_id = p_order_id and koc_id = v_koc_id and tier = 'T1'
  )
  where user_id = v_koc_id;

end;
$$ language plpgsql security definer;

-- ============================================================
-- SEED DATA
-- ============================================================
insert into public.categories (slug, name_vi, name_en, icon, sort_order) values
  ('skincare',    'Chăm sóc da',          'Skincare',     '✨', 1),
  ('supplement',  'Thực phẩm bổ sung',    'Supplements',  '💊', 2),
  ('food',        'Thực phẩm & Đồ uống',  'Food & Drink', '🍵', 3),
  ('sports',      'Thể thao & Fitness',   'Sports',       '🏃', 4),
  ('electronics', 'Điện tử',              'Electronics',  '⌚', 5);

-- ============================================================
-- RETURN REQUESTS
-- ============================================================
create type return_status as enum ('pending', 'approved', 'rejected', 'refunded');
create type return_reason as enum ('damaged', 'wrong_item', 'not_as_described', 'other');
create type refund_method as enum ('original_payment', 'wallet_credit');

create table public.return_requests (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  buyer_id        uuid not null references public.profiles(id) on delete cascade,
  reason          return_reason not null,
  description     text,
  photo_urls      text[] default '{}',
  status          return_status not null default 'pending',
  vendor_response text,
  refund_amount   numeric(18,2),
  refund_method   refund_method,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index ix_return_requests_order_id on public.return_requests(order_id);
create index ix_return_requests_buyer_id on public.return_requests(buyer_id);
create index ix_return_requests_status   on public.return_requests(status);

-- RLS policies for return_requests
alter table public.return_requests enable row level security;

create policy "Buyers can view own return requests"
  on public.return_requests for select
  using (auth.uid() = buyer_id);

create policy "Buyers can create return requests"
  on public.return_requests for insert
  with check (auth.uid() = buyer_id);

create policy "Vendors can view returns for their orders"
  on public.return_requests for select
  using (
    order_id in (
      select oi.order_id from public.order_items oi where oi.vendor_id = auth.uid()
    )
  );

create policy "Vendors can update return requests for their orders"
  on public.return_requests for update
  using (
    order_id in (
      select oi.order_id from public.order_items oi where oi.vendor_id = auth.uid()
    )
  );

-- Create current reward pools
insert into public.reward_pools (pool_type, period) values
  ('A', to_char(now(), 'YYYY-MM')),
  ('B', to_char(now(), 'YYYY')),
  ('C', 'Q' || ceil(extract(month from now())/3.0)::text || '-' || to_char(now(), 'YYYY'));
