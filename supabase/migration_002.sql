-- ============================================================
-- WELLKOC — Migration 002: New features
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ── 1. PLATFORM POLICIES (admin configures) ──────────────────
create table public.platform_policies (
  id           uuid default uuid_generate_v4() primary key,
  key          text unique not null,   -- 't1_pct', 't2_pct', 'pool_a_pct', etc.
  value        numeric(15,4) not null,
  label_vi     text not null,
  label_en     text not null,
  description  text,
  min_val      numeric(15,4) not null default 0,
  max_val      numeric(15,4) not null default 100,
  updated_by   uuid references public.profiles(id),
  updated_at   timestamptz not null default now()
);

-- Seed default policy values
insert into public.platform_policies (key, value, label_vi, label_en, description, min_val, max_val) values
  ('t1_pct',           40.0,  'Hoa hồng T1 (%)',         'T1 Commission (%)',         'KOC trực tiếp bán hàng',           1,   60),
  ('t2_pct',           13.0,  'Hoa hồng T2 (%)',         'T2 Commission (%)',         'Người giới thiệu KOC',             0,   30),
  ('pool_a_pct',        9.0,  'Pool A - Hàng tháng (%)', 'Pool A - Monthly (%)',      'Top 30 KOC xếp hạng tháng',        0,   20),
  ('pool_b_pct',        5.0,  'Pool B - Hàng năm (%)',   'Pool B - Annual (%)',       'Giải thưởng hiện vật',             0,   15),
  ('pool_c_pct',        3.0,  'Pool C - Toàn cầu (%)',   'Pool C - Global (%)',       'Chia đều KOC active mỗi quý',      0,   10),
  ('platform_pct',     30.0,  'Phí nền tảng (%)',        'Platform fee (%)',          'Vận hành WellKOC',                 0,   50),
  ('min_vendor_disc',  15.0,  'CK Vendor tối thiểu (%)', 'Min vendor discount (%)',   'Chiết khấu tối thiểu Vendor',      5,   30),
  ('max_vendor_disc',  55.0,  'CK Vendor tối đa (%)',    'Max vendor discount (%)',   'Chiết khấu tối đa Vendor',        30,   70),
  ('free_ship_min', 500000.0, 'Miễn ship từ (đ)',        'Free ship from (VND)',      'Miễn phí vận chuyển',             0, 2000000),
  ('ship_fee',       30000.0, 'Phí vận chuyển mặc định', 'Default shipping fee',      'Khi chưa đủ free ship',           0,  200000),
  ('t2_min_orders',     1.0,  'Đơn tối thiểu T2/tháng', 'Min T2 orders/month',       'Cần đặt ≥ X đơn/tháng để nhận T2',1,   20),
  ('pool_a_top_n',     30.0,  'Top N KOC Pool A',        'Pool A top N KOCs',         'Số KOC nhận Pool A mỗi tháng',     1,  100),
  ('xp_per_order',    100.0,  'XP mỗi đơn hàng',        'XP per order',              'Điểm kinh nghiệm khi mua',         0, 1000),
  ('commission_delay', 48.0,  'Delay hoa hồng (giờ)',    'Commission delay (hours)',  'T+ giờ sau giao hàng mới trả',     0,  168);

-- ── 2. KYC SUBMISSIONS ───────────────────────────────────────
create table public.kyc_submissions (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references public.profiles(id) on delete cascade unique,
  full_name        text not null,
  dob              date,
  id_number        text not null,          -- CCCD/CMND
  id_type          text not null default 'cccd',
  id_front_url     text,
  id_back_url      text,
  selfie_url       text,
  business_license text,
  tax_code         text,
  status           kyc_status not null default 'pending',
  reviewed_by      uuid references public.profiles(id),
  review_note      text,
  submitted_at     timestamptz not null default now(),
  reviewed_at      timestamptz
);

-- ── 3. PRODUCT IMAGES (Supabase Storage) ─────────────────────
-- Products already have images text[] — we add a proper table for management
create table public.product_images (
  id           uuid default uuid_generate_v4() primary key,
  product_id   uuid references public.products(id) on delete cascade,
  url          text not null,
  storage_path text not null,      -- supabase storage path for deletion
  is_primary   boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ── 4. PRODUCT APPROVAL LOG ───────────────────────────────────
create table public.product_approvals (
  id           uuid default uuid_generate_v4() primary key,
  product_id   uuid references public.products(id) on delete cascade,
  admin_id     uuid references public.profiles(id),
  action       text not null,      -- 'approved' | 'rejected' | 'paused'
  reason       text,
  created_at   timestamptz not null default now()
);

-- ── 5. RETURNS & EXCHANGES ────────────────────────────────────
create type return_status as enum ('pending', 'approved', 'rejected', 'completed');
create type return_type   as enum ('return', 'exchange', 'refund');

create table public.returns (
  id              uuid default uuid_generate_v4() primary key,
  order_id        uuid references public.orders(id) on delete cascade,
  order_item_id   uuid references public.order_items(id),
  buyer_id        uuid references public.profiles(id),
  type            return_type not null default 'return',
  reason          text not null,
  description     text,
  images          text[] default '{}',
  status          return_status not null default 'pending',
  refund_amount   numeric(12,2),
  reviewed_by     uuid references public.profiles(id),
  review_note     text,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── 6. ORDER TRACKING (realtime) ─────────────────────────────
create table public.order_tracking (
  id         uuid default uuid_generate_v4() primary key,
  order_id   uuid references public.orders(id) on delete cascade,
  status     text not null,
  note       text,
  location   text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_order_tracking_order on public.order_tracking(order_id);

-- ── 7. POOL PAYOUT SCHEDULE ───────────────────────────────────
create table public.payout_jobs (
  id            uuid default uuid_generate_v4() primary key,
  pool_type     pool_type not null,
  period        text not null,
  status        text not null default 'pending', -- pending|running|done|failed
  total_amount  numeric(15,2),
  recipients    integer,
  run_at        timestamptz not null,
  started_at    timestamptz,
  finished_at   timestamptz,
  error         text,
  created_at    timestamptz not null default now()
);

-- Schedule initial pool payouts
-- Pool A: mùng 5 hàng tháng
-- Pool B: ngày 15/1 hàng năm
-- Pool C: ngày 15 đầu mỗi quý
insert into public.payout_jobs (pool_type, period, run_at) values
  ('A', to_char(now(), 'YYYY-MM'),
   date_trunc('month', now()) + interval '1 month' + interval '4 days'),
  ('B', to_char(now(), 'YYYY'),
   date_trunc('year', now()) + interval '1 year' + interval '14 days'),
  ('C', 'Q' || ceil(extract(month from now())/3.0)::text || '-' || to_char(now(), 'YYYY'),
   date_trunc('quarter', now()) + interval '3 months' + interval '14 days');

-- ── 8. SHIPPER ASSIGNMENTS (COD) ─────────────────────────────
create table public.shipper_assignments (
  id          uuid default uuid_generate_v4() primary key,
  order_id    uuid references public.orders(id) on delete cascade,
  shipper_id  text,           -- external shipper ID (GHN, GHTK)
  carrier     text,           -- 'GHN' | 'GHTK' | 'manual'
  tracking_no text,
  estimated_at timestamptz,
  assigned_at  timestamptz not null default now(),
  confirmed_at timestamptz,   -- COD confirmed by shipper
  confirmed_by text            -- shipper code/signature
);

-- ── 9. RLS for new tables ─────────────────────────────────────
alter table public.platform_policies    enable row level security;
alter table public.kyc_submissions      enable row level security;
alter table public.product_images       enable row level security;
alter table public.product_approvals    enable row level security;
alter table public.returns              enable row level security;
alter table public.order_tracking       enable row level security;
alter table public.payout_jobs          enable row level security;
alter table public.shipper_assignments  enable row level security;

-- Policies: platform_policies readable by all, writable by admin only
create policy "policies_read_all" on public.platform_policies for select using (true);
create policy "policies_admin_write" on public.platform_policies for all
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- KYC: users see own, admin sees all
create policy "kyc_own" on public.kyc_submissions for all
  using (user_id = auth.uid());
create policy "kyc_admin" on public.kyc_submissions for all
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Product images: vendors see own
create policy "product_images_read" on public.product_images for select using (true);
create policy "product_images_vendor" on public.product_images for all
  using (exists(select 1 from public.products p where p.id = product_id and p.vendor_id = auth.uid()));

-- Returns: buyers see own, vendors see their orders
create policy "returns_buyer" on public.returns for all using (buyer_id = auth.uid());

-- Order tracking: all can read own orders
create policy "tracking_read" on public.order_tracking for select
  using (exists(select 1 from public.orders o where o.id = order_id and (o.buyer_id = auth.uid() or o.koc_ref_id = auth.uid())));

-- Payout jobs: admin only
create policy "payout_admin" on public.payout_jobs for all
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── 10. HELPER FUNCTIONS ─────────────────────────────────────

-- Get policy value by key
create or replace function get_policy(p_key text)
returns numeric as $$
  select value from public.platform_policies where key = p_key limit 1;
$$ language sql stable;

-- Decrement stock safely
create or replace function decrement_stock(p_product_id uuid, p_qty integer)
returns void as $$
begin
  update public.products
  set stock = greatest(0, stock - p_qty),
      sold_count = sold_count + p_qty
  where id = p_product_id;
end;
$$ language plpgsql;

-- Calculate commissions using policy table values (not hardcoded)
create or replace function process_order_commissions_v2(p_order_id uuid)
returns void as $$
declare
  v_item     record;
  v_koc_id   uuid;
  v_t2_id    uuid;
  v_t1_pct   numeric := get_policy('t1_pct');
  v_t2_pct   numeric := get_policy('t2_pct');
  v_pool_a   numeric := get_policy('pool_a_pct');
  v_pool_b   numeric := get_policy('pool_b_pct');
  v_pool_c   numeric := get_policy('pool_c_pct');
begin
  select koc_ref_id into v_koc_id from public.orders where id = p_order_id;
  if v_koc_id is null then return; end if;

  select sponsor_id into v_t2_id from public.koc_profiles where user_id = v_koc_id;

  for v_item in select * from public.order_items where order_id = p_order_id loop
    insert into public.commissions (order_id, order_item_id, koc_id, tier, pct, base_amount, amount)
    values (p_order_id, v_item.id, v_koc_id, 'T1', v_t1_pct,
            v_item.platform_revenue, round(v_item.platform_revenue * v_t1_pct / 100, 2));

    if v_t2_id is not null then
      insert into public.commissions (order_id, order_item_id, koc_id, tier, pct, base_amount, amount)
      values (p_order_id, v_item.id, v_t2_id, 'T2', v_t2_pct,
              v_item.platform_revenue, round(v_item.platform_revenue * v_t2_pct / 100, 2));
    end if;

    -- Pool contributions
    insert into public.pool_contributions (pool_id, order_id, amount)
    select id, p_order_id, round(v_item.platform_revenue * v_pool_a / 100, 2)
    from public.reward_pools where pool_type='A' and not distributed
    and period = to_char(now(), 'YYYY-MM') limit 1;

    insert into public.pool_contributions (pool_id, order_id, amount)
    select id, p_order_id, round(v_item.platform_revenue * v_pool_b / 100, 2)
    from public.reward_pools where pool_type='B' and not distributed
    and period = to_char(now(), 'YYYY') limit 1;

    insert into public.pool_contributions (pool_id, order_id, amount)
    select id, p_order_id, round(v_item.platform_revenue * v_pool_c / 100, 2)
    from public.reward_pools where pool_type='C' and not distributed limit 1;
  end loop;
end;
$$ language plpgsql security definer;

-- Enable Supabase Realtime for order_tracking
alter publication supabase_realtime add table public.order_tracking;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.commissions;
