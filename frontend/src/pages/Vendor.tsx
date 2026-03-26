import { useState } from 'react';

/* ── Sidebar ─────────────────────────────────────── */
const sidebarItems = [
  { key: 'overview', icon: '📊', label: 'Tổng quan' },
  { key: 'products', icon: '📦', label: 'Sản phẩm' },
  { key: 'orders', icon: '🛒', label: 'Đơn hàng' },
  { key: 'koc', icon: '🌟', label: 'KOC Network' },
  { key: 'dpp', icon: '🔐', label: 'DPP Management' },
  { key: 'commission', icon: '💰', label: 'Commission Rules' },
  { key: 'wallet', icon: '🔗', label: 'Ví blockchain' },
  { key: 'analytics', icon: '📈', label: 'Analytics' },
  { key: 'settings', icon: '⚙️', label: 'Cài đặt' },
];

/* ── KPI data ────────────────────────────────────── */
const kpiData = [
  { label: 'Doanh thu tháng', value: '89.5M₫', delta: '+28% MoM', up: true, color: 'var(--c4-500)' },
  { label: 'Đơn hàng', value: '1,247', delta: '+156 tuần này', up: true, color: 'var(--c5-500)' },
  { label: 'Sản phẩm', value: '48', delta: '6 mới tháng này', up: true, color: 'var(--c6-500)' },
  { label: 'KOC Partners', value: '156', delta: '+23 mới', up: true, color: 'var(--c7-500)' },
];

/* ── Products ────────────────────────────────────── */
const products = [
  { id: 1, name: 'Trà Ô Long Đài Loan Premium', price: '389.000₫', stock: 234, sold: 1247, status: 'active', dppStatus: 'minted', commission: '18%', emoji: '🍵', dppTokenId: '#1247' },
  { id: 2, name: 'Serum Vitamin C 20%', price: '459.000₫', stock: 156, sold: 892, status: 'active', dppStatus: 'minted', commission: '22%', emoji: '✨', dppTokenId: '#1248' },
  { id: 3, name: 'Mật Ong Rừng Tây Nguyên', price: '285.000₫', stock: 89, sold: 2103, status: 'active', dppStatus: 'minted', commission: '15%', emoji: '🍯', dppTokenId: '#1249' },
  { id: 4, name: 'Cà Phê Arabica Đà Lạt', price: '245.000₫', stock: 312, sold: 1580, status: 'active', dppStatus: 'pending', commission: '20%', emoji: '☕', dppTokenId: '—' },
  { id: 5, name: 'Bột Collagen Cá Biển', price: '890.000₫', stock: 45, sold: 634, status: 'low_stock', dppStatus: 'minted', commission: '25%', emoji: '🐟', dppTokenId: '#1251' },
  { id: 6, name: 'Nước Hoa Hồng Organic', price: '320.000₫', stock: 0, sold: 1890, status: 'out_of_stock', dppStatus: 'pending', commission: '19%', emoji: '🌹', dppTokenId: '—' },
];

const productStatusConfig: Record<string, { label: string; badge: string }> = {
  active: { label: 'Đang bán', badge: 'badge-c4' },
  low_stock: { label: 'Sắp hết', badge: 'badge-gold' },
  out_of_stock: { label: 'Hết hàng', badge: 'badge-c5' },
};

const dppStatusConfig: Record<string, { label: string; badge: string }> = {
  minted: { label: 'Minted', badge: 'badge-c4' },
  pending: { label: 'Pending', badge: 'badge-gold' },
};

/* ── Orders ──────────────────────────────────────── */
const orders = [
  { id: 'ORD-2026-001', customer: 'Nguyễn Văn A', product: 'Trà Ô Long Premium', amount: '389.000₫', koc: 'Minh Hương', commission: '70.020₫', status: 'delivered', date: '2026-03-25', txHash: '0x1a2b...9f3c' },
  { id: 'ORD-2026-002', customer: 'Trần Thị B', product: 'Serum Vitamin C', amount: '459.000₫', koc: 'Thảo Linh', commission: '100.980₫', status: 'shipping', date: '2026-03-24', txHash: '' },
  { id: 'ORD-2026-003', customer: 'Lê Văn C', product: 'Mật Ong Rừng', amount: '285.000₫', koc: 'Ngọc Anh', commission: '42.750₫', status: 'processing', date: '2026-03-24', txHash: '' },
  { id: 'ORD-2026-004', customer: 'Phạm Thị D', product: 'Cà Phê Arabica', amount: '245.000₫', koc: 'Văn Hoàng', commission: '49.000₫', status: 'delivered', date: '2026-03-23', txHash: '0x4d5e...8a2b' },
  { id: 'ORD-2026-005', customer: 'Hoàng Văn E', product: 'Bột Collagen', amount: '890.000₫', koc: 'Phương Thảo', commission: '222.500₫', status: 'pending', date: '2026-03-23', txHash: '' },
];

const orderStatusConfig: Record<string, { label: string; badge: string }> = {
  delivered: { label: 'Đã giao', badge: 'badge-c4' },
  shipping: { label: 'Đang giao', badge: 'badge-c5' },
  processing: { label: 'Đang xử lý', badge: 'badge-c6' },
  pending: { label: 'Chờ xác nhận', badge: 'badge-gold' },
};

/* ── KOC Network ─────────────────────────────────── */
const kocNetwork = [
  { id: 'KOC-001', name: 'Minh Hương', level: 12, tier: 'T1', sales: '12.8M₫', commission: '2.3M₫', orders: 142, conversion: '12.3%', status: 'active', trustScore: 92 },
  { id: 'KOC-002', name: 'Thảo Linh', level: 10, tier: 'T1', sales: '10.2M₫', commission: '1.8M₫', orders: 98, conversion: '10.8%', status: 'active', trustScore: 88 },
  { id: 'KOC-003', name: 'Ngọc Anh', level: 9, tier: 'T2', sales: '7.5M₫', commission: '975K₫', orders: 67, conversion: '9.2%', status: 'active', trustScore: 85 },
  { id: 'KOC-004', name: 'Văn Hoàng', level: 8, tier: 'T2', sales: '5.1M₫', commission: '663K₫', orders: 45, conversion: '8.1%', status: 'active', trustScore: 78 },
  { id: 'KOC-005', name: 'Phương Thảo', level: 6, tier: 'T3', sales: '2.4M₫', commission: '120K₫', orders: 18, conversion: '6.5%', status: 'review', trustScore: 72 },
];

const tierConfig: Record<string, { label: string; badge: string; rate: string }> = {
  T1: { label: 'Tier 1', badge: 'badge-c4', rate: '40%' },
  T2: { label: 'Tier 2', badge: 'badge-c5', rate: '13%' },
  T3: { label: 'Tier 3', badge: 'badge-c6', rate: '5%' },
};

/* ── DPP Management ──────────────────────────────── */
const dppMints = [
  { tokenId: '#1247', product: 'Trà Ô Long Đài Loan Premium', mintDate: '2026-02-15', chain: 'Polygon', txHash: '0xdpp1...aaaa', status: 'verified', ipfsHash: 'Qm...abc1' },
  { tokenId: '#1248', product: 'Serum Vitamin C 20%', mintDate: '2026-02-18', chain: 'Polygon', txHash: '0xdpp2...bbbb', status: 'verified', ipfsHash: 'Qm...abc2' },
  { tokenId: '#1249', product: 'Mật Ong Rừng Tây Nguyên', mintDate: '2026-02-20', chain: 'Polygon', txHash: '0xdpp3...cccc', status: 'verified', ipfsHash: 'Qm...abc3' },
  { tokenId: '#1251', product: 'Bột Collagen Cá Biển', mintDate: '2026-03-01', chain: 'Polygon', txHash: '0xdpp5...eeee', status: 'verified', ipfsHash: 'Qm...abc5' },
];

/* ── Commission Rules ────────────────────────────── */
const commissionTiers = [
  { tier: 'Tier 1 (T1)', description: 'KOC bán trực tiếp', rate: '40%', minSales: '10M₫+/tháng', color: 'var(--c4-500)', smartContract: true },
  { tier: 'Tier 2 (T2)', description: 'KOC giới thiệu bởi T1', rate: '13%', minSales: '5M₫+/tháng', color: 'var(--c5-500)', smartContract: true },
  { tier: 'Tier 3 (T3)', description: 'KOC giới thiệu bởi T2', rate: '5%', minSales: 'Không yêu cầu', color: 'var(--c6-500)', smartContract: true },
];

/* ── Wallet data ─────────────────────────────────── */
const walletData = {
  address: '0xVendor1234567890ABCDEF1234567890ABCDEF12',
  shortAddress: '0xVend...EF12',
  balances: [
    { token: 'USDT', amount: '45,230.00', usd: '$45,230.00', icon: 'U', color: 'var(--c4-500)' },
    { token: 'MATIC', amount: '8,500.00', usd: '$6,800.00', icon: 'M', color: 'var(--c7-500)' },
    { token: 'ETH', amount: '1.85', usd: '$4,810.00', icon: 'E', color: 'var(--c5-500)' },
  ],
  totalUsd: '$56,840.00',
  pendingRevenue: '12.450.000₫',
};

const walletTxHistory = [
  { hash: '0xrev1...1111', type: 'Doanh thu đơn hàng', amount: '+389.000₫', token: 'USDT', date: '2026-03-25', status: 'confirmed' },
  { hash: '0xrev2...2222', type: 'Doanh thu đơn hàng', amount: '+459.000₫', token: 'USDT', date: '2026-03-24', status: 'confirmed' },
  { hash: '0xcom1...3333', type: 'Commission payout (KOC)', amount: '-70.020₫', token: 'USDT', date: '2026-03-25', status: 'confirmed' },
  { hash: '0xwd01...4444', type: 'Rút về ngân hàng', amount: '-20.000.000₫', token: 'USDT', date: '2026-03-20', status: 'confirmed' },
  { hash: '0xdpp1...5555', type: 'DPP Mint Fee', amount: '-0.5 MATIC', token: 'MATIC', date: '2026-03-15', status: 'confirmed' },
];

/* ── Settings ────────────────────────────────────── */
const settingsSections = [
  { title: 'Thông tin cửa hàng', fields: [{ label: 'Tên', value: 'WellKOC Origin' }, { label: 'Loại', value: 'Official Brand' }, { label: 'Đánh giá', value: '4.8 / 5.0' }] },
  { title: 'Blockchain', fields: [{ label: 'Chain', value: 'Polygon' }, { label: 'Ví', value: '0xVend...EF12' }, { label: 'DPP Contract', value: '0xDPP...7890' }] },
  { title: 'Thanh toán', fields: [{ label: 'Rút tiền về', value: 'Vietcombank **** 5678' }, { label: 'Auto payout KOC', value: 'Bật' }, { label: 'Min withdraw', value: '1.000.000₫' }] },
  { title: 'Commission', fields: [{ label: 'Smart contract', value: 'Active' }, { label: 'Tiers', value: 'T1: 40% / T2: 13% / T3: 5%' }, { label: 'Auto-distribute', value: 'Bật' }] },
];

/* ── Component ───────────────────────────────────── */
export default function Vendor() {
  const [activeNav, setActiveNav] = useState('overview');

  const renderContent = () => {
    switch (activeNav) {
      /* ────── TỔNG QUAN ────── */
      case 'overview':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Tổng Quan Cửa Hàng</h2>

            <div className="chart-bar-wrap" style={{ marginBottom: 24 }}>
              <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="label">DOANH THU 12 THÁNG</span>
                <span className="badge badge-c4">+28% YoY</span>
              </div>
              <div className="chart-bars">
                {[55, 68, 48, 82, 95, 72, 88, 105, 78, 112, 98, 120].map((v, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${Math.min(v, 100)}%` }} />
                ))}
              </div>
              <div className="flex" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map(m => (
                  <span key={m} style={{ flex: 1, textAlign: 'center', fontSize: '.58rem', color: 'var(--text-4)' }}>{m}</span>
                ))}
              </div>
            </div>

            <div className="grid-2" style={{ gap: 20 }}>
              <div className="card" style={{ padding: 20 }}>
                <div className="label" style={{ marginBottom: 12 }}>TOP SẢN PHẨM</div>
                <div className="flex-col gap-10">
                  {products.slice(0, 4).map((p, i) => (
                    <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                      <div className="flex gap-8">
                        <span>{p.emoji}</span>
                        <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{p.name}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{p.sold.toLocaleString()} sold</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div className="label" style={{ marginBottom: 12 }}>TOP KOC</div>
                <div className="flex-col gap-10">
                  {kocNetwork.slice(0, 4).map((k, i) => (
                    <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                      <div>
                        <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{k.name}</span>
                        <span className={`badge ${tierConfig[k.tier].badge}`} style={{ marginLeft: 8 }}>{k.tier}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{k.sales}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );

      /* ────── SẢN PHẨM ────── */
      case 'products':
        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Quản Lý Sản Phẩm</h2>
              <button className="btn btn-primary btn-sm">+ Thêm sản phẩm</button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['', 'Sản phẩm', 'Giá', 'Tồn kho', 'Đã bán', 'Hoa hồng', 'DPP', 'Trạng thái'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const sc = productStatusConfig[p.status];
                      const dsc = dppStatusConfig[p.dppStatus];
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px', fontSize: '1.3rem' }}>{p.emoji}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name}</td>
                          <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{p.price}</td>
                          <td style={{ padding: '12px 14px', color: p.stock <= 50 ? 'var(--rose-400)' : 'var(--text-2)' }}>{p.stock}</td>
                          <td style={{ padding: '12px 14px' }}>{p.sold.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px' }}><span className="badge badge-c6">{p.commission}</span></td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`status-pill badge ${dsc.badge}`}>{dsc.label}</span>
                            {p.dppTokenId !== '—' && <span className="mono" style={{ fontSize: '.6rem', color: 'var(--text-4)', marginLeft: 4 }}>{p.dppTokenId}</span>}
                          </td>
                          <td style={{ padding: '12px 14px' }}><span className={`badge ${sc.badge}`}>{sc.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      /* ────── ĐƠN HÀNG ────── */
      case 'orders':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Quản Lý Đơn Hàng</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Giá trị', 'KOC', 'Hoa hồng', 'Trạng thái', 'TX Hash'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const sc = orderStatusConfig[o.status];
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px' }} className="mono">{o.id}</td>
                          <td style={{ padding: '12px 14px' }}>{o.customer}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{o.product}</td>
                          <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{o.amount}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--c6-300)' }}>{o.koc}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--c4-500)', fontWeight: 600 }}>{o.commission}</td>
                          <td style={{ padding: '12px 14px' }}><span className={`status-pill badge ${sc.badge}`}>{sc.label}</span></td>
                          <td style={{ padding: '12px 14px' }} className="mono tx-hash">
                            {o.txHash ? (
                              <a href={`https://polygonscan.com/tx/${o.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c6-300)' }}>{o.txHash}</a>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      /* ────── KOC NETWORK ────── */
      case 'koc':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>KOC Network</h2>

            {/* Tier summary */}
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              {[
                { tier: 'Tier 1', count: 12, rate: '40%', revenue: '45.2M₫', color: 'var(--c4-500)' },
                { tier: 'Tier 2', count: 48, rate: '13%', revenue: '28.7M₫', color: 'var(--c5-500)' },
                { tier: 'Tier 3', count: 96, rate: '5%', revenue: '12.1M₫', color: 'var(--c6-500)' },
              ].map((t, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{t.tier} ({t.rate})</div>
                  <div className="kpi-val" style={{ color: t.color }}>{t.count} KOC</div>
                  <div className="kpi-delta delta-up">Doanh thu: {t.revenue}</div>
                </div>
              ))}
            </div>

            {/* KOC list */}
            <div className="flex-col gap-12">
              {kocNetwork.map(k => {
                const tc = tierConfig[k.tier];
                return (
                  <div key={k.id} className="card" style={{ padding: '18px 24px' }}>
                    <div className="flex" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div className="flex gap-8" style={{ marginBottom: 4 }}>
                          <span className="mono" style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>{k.id}</span>
                          <span className={`badge ${tc.badge}`}>{tc.label} ({tc.rate})</span>
                          <span className="badge badge-c7">Lv{k.level}</span>
                          <span className="badge badge-gold">Trust {k.trustScore}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{k.name}</div>
                        <div className="flex gap-16" style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 6 }}>
                          <span>{k.orders} đơn</span>
                          <span>Conv: {k.conversion}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{k.sales}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Hoa hồng: {k.commission}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );

      /* ────── DPP MANAGEMENT ────── */
      case 'dpp':
        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>DPP Management (Digital Product Passport)</h2>
              <button className="btn btn-primary btn-sm">+ Mint DPP NFT</button>
            </div>

            {/* DPP Stats */}
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              {[
                { label: 'DPP đã mint', value: '42', color: 'var(--c4-500)' },
                { label: 'Đang chờ mint', value: '6', color: 'var(--gold-400)' },
                { label: 'Verified on-chain', value: '42', color: 'var(--c6-500)' },
                { label: 'Gas fees tháng', value: '12.5 MATIC', color: 'var(--c7-500)' },
              ].map((s, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{s.label}</div>
                  <div className="kpi-val" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Pending DPP mints */}
            <div className="card" style={{ padding: 20, marginBottom: 20, borderLeft: '3px solid var(--gold-400)' }}>
              <div className="label" style={{ marginBottom: 12 }}>SẢN PHẨM CHỜ MINT DPP</div>
              {products.filter(p => p.dppStatus === 'pending').map(p => (
                <div key={p.id} className="flex" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex gap-8">
                    <span>{p.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{p.name}</span>
                  </div>
                  <button className="btn btn-primary btn-sm">Mint DPP NFT</button>
                </div>
              ))}
            </div>

            {/* Minted DPPs table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>DPP NFTs Đã Mint</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Token ID', 'Sản phẩm', 'Ngày mint', 'Chain', 'TX Hash', 'IPFS', 'Trạng thái'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dppMints.map((d, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{d.tokenId}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{d.product}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-3)' }}>{d.mintDate}</td>
                        <td style={{ padding: '12px 14px' }}><span className="badge badge-c7">{d.chain}</span></td>
                        <td style={{ padding: '12px 14px' }} className="mono">
                          <a href={`https://polygonscan.com/tx/${d.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c6-300)' }}>{d.txHash}</a>
                        </td>
                        <td style={{ padding: '12px 14px' }} className="mono" style={{ padding: '12px 14px', fontSize: '.7rem', color: 'var(--text-3)' }}>{d.ipfsHash}</td>
                        <td style={{ padding: '12px 14px' }}><span className="badge badge-c4">Verified</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="onchain-card" style={{ marginTop: 20 }}>
              <div className="verified-seal">On-chain DPP</div>
              <div style={{ fontSize: '.82rem', fontWeight: 600, marginBottom: 8 }}>Digital Product Passport trên blockchain</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                Mỗi sản phẩm được gắn DPP NFT chứa thông tin xuất xứ, thành phần, chứng nhận. Dữ liệu lưu trữ trên IPFS, hash ghi trên Polygon.
              </div>
              <div className="flex gap-8" style={{ marginTop: 12 }}>
                <span className="badge badge-c4">ERC-721</span>
                <span className="badge badge-c5">IPFS</span>
                <span className="badge badge-c7">Polygon</span>
              </div>
            </div>
          </>
        );

      /* ────── COMMISSION RULES ────── */
      case 'commission':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Commission Rules (Smart Contract)</h2>

            <div className="flex-col gap-12" style={{ marginBottom: 32 }}>
              {commissionTiers.map((rule, i) => (
                <div key={i} className="card" style={{ padding: '18px 24px', borderLeft: `3px solid ${rule.color}` }}>
                  <div className="flex" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.92rem', color: rule.color }}>{rule.tier}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 2 }}>{rule.description}</div>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-4)', marginTop: 4 }}>Min doanh số: {rule.minSales}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: rule.color }}>{rule.rate}</div>
                      {rule.smartContract && <span className="badge badge-c4" style={{ fontSize: '.55rem' }}>Smart Contract</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="onchain-card" style={{ padding: 24 }}>
              <div className="verified-seal">Smart Contract Commission</div>
              <p style={{ fontSize: '.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                Hoa hồng được tự động tính toán và phân phối qua smart contract trên Polygon. Tỷ lệ T1: 40%, T2: 13%, T3: 5% được hardcode trong contract, đảm bảo minh bạch tuyệt đối.
              </p>
              <div className="flex gap-8" style={{ marginTop: 12 }}>
                <span className="badge badge-c4">Auto payout</span>
                <span className="badge badge-c5">Transparent</span>
                <span className="badge badge-c6">On-chain verified</span>
                <span className="badge badge-c7">Immutable</span>
              </div>
            </div>
          </>
        );

      /* ────── VÍ BLOCKCHAIN ────── */
      case 'wallet':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Ví Blockchain</h2>

            {/* Wallet address */}
            <div className="onchain-card" style={{ marginBottom: 20 }}>
              <div className="flex" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>Địa chỉ ví Vendor (Polygon)</div>
                  <div className="mono" style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--c6-300)' }}>{walletData.shortAddress}</div>
                  <div className="mono" style={{ fontSize: '.65rem', color: 'var(--text-4)', marginTop: 2 }}>{walletData.address}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Tổng giá trị</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--c4-500)' }}>{walletData.totalUsd}</div>
                </div>
              </div>
            </div>

            {/* Token balances */}
            <div className="kpi-grid" style={{ marginBottom: 20 }}>
              {walletData.balances.map((b, i) => (
                <div key={i} className="kpi-card">
                  <div className="flex gap-8" style={{ marginBottom: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: b.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.7rem', fontWeight: 800, color: '#fff',
                    }}>{b.icon}</div>
                    <div className="kpi-label">{b.token}</div>
                  </div>
                  <div className="kpi-val" style={{ color: b.color }}>{b.amount}</div>
                  <div className="kpi-delta delta-up">{b.usd}</div>
                </div>
              ))}
            </div>

            {/* Pending revenue */}
            <div className="card" style={{ padding: 20, marginBottom: 20, borderLeft: '3px solid var(--gold-400)' }}>
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>Doanh thu chờ rút</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--gold-400)' }}>{walletData.pendingRevenue}</div>
                </div>
                <button className="btn btn-primary btn-sm">Rút tiền (Withdraw)</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-8" style={{ marginBottom: 24 }}>
              <button className="btn btn-secondary btn-sm">Rút về ngân hàng</button>
              <button className="btn btn-secondary btn-sm">Chuyển token</button>
            </div>

            {/* Transaction history */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Lịch Sử Giao Dịch On-chain</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['TX Hash', 'Loại', 'Số tiền', 'Token', 'Ngày', 'Trạng thái'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {walletTxHistory.map((tx, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 14px' }} className="mono">
                          <a href={`https://polygonscan.com/tx/${tx.hash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c6-300)' }}>{tx.hash}</a>
                        </td>
                        <td style={{ padding: '12px 14px' }}>{tx.type}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700, color: tx.amount.startsWith('+') ? 'var(--c4-500)' : 'var(--text-1)' }}>{tx.amount}</td>
                        <td style={{ padding: '12px 14px' }}><span className="badge badge-c7">{tx.token}</span></td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-3)' }}>{tx.date}</td>
                        <td style={{ padding: '12px 14px' }}><span className="badge badge-c4">Confirmed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      /* ────── ANALYTICS ────── */
      case 'analytics':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Analytics</h2>
            <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
              <div className="card" style={{ padding: 20 }}>
                <div className="label" style={{ marginBottom: 12 }}>DOANH THU THEO KÊNH</div>
                <div className="flex-col gap-10">
                  {[
                    { label: 'KOC Tier 1', value: '45.2M₫', pct: '52%', color: 'var(--c4-500)' },
                    { label: 'KOC Tier 2', value: '28.7M₫', pct: '33%', color: 'var(--c5-500)' },
                    { label: 'KOC Tier 3', value: '12.1M₫', pct: '14%', color: 'var(--c6-500)' },
                    { label: 'Direct', value: '3.5M₫', pct: '1%', color: 'var(--c7-500)' },
                  ].map((ch, i) => (
                    <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: '.82rem' }}>{ch.label} ({ch.pct})</span>
                      <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, color: ch.color }}>{ch.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div className="label" style={{ marginBottom: 12 }}>COMMISSION ĐÃ TRẢ</div>
                <div className="flex-col gap-10">
                  {[
                    { label: 'Tier 1 (40%)', value: '18.08M₫', color: 'var(--c4-500)' },
                    { label: 'Tier 2 (13%)', value: '3.73M₫', color: 'var(--c5-500)' },
                    { label: 'Tier 3 (5%)', value: '605K₫', color: 'var(--c6-500)' },
                    { label: 'Tổng commission', value: '22.42M₫', color: 'var(--gold-400)' },
                  ].map((ch, i) => (
                    <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: '.82rem' }}>{ch.label}</span>
                      <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, color: ch.color }}>{ch.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-bar-wrap">
              <div className="label" style={{ marginBottom: 12 }}>ĐƠN HÀNG 7 NGÀY</div>
              <div className="chart-bars">
                {[78, 92, 65, 110, 95, 88, 102].map((v, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${Math.min(v, 100)}%` }} />
                ))}
              </div>
              <div className="flex" style={{ justifyContent: 'space-between', marginTop: 6 }}>
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                  <span key={d} style={{ flex: 1, textAlign: 'center', fontSize: '.58rem', color: 'var(--text-4)' }}>{d}</span>
                ))}
              </div>
            </div>
          </>
        );

      /* ────── CÀI ĐẶT ────── */
      case 'settings':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Cài Đặt</h2>
            <div className="flex-col gap-16">
              {settingsSections.map((section, si) => (
                <div key={si} className="card" style={{ padding: 20 }}>
                  <div className="label" style={{ marginBottom: 12 }}>{section.title.toUpperCase()}</div>
                  <div className="flex-col gap-10">
                    {section.fields.map((f, fi) => (
                      <div key={fi} className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: fi < section.fields.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>{f.label}</span>
                        <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ paddingTop: 'var(--topbar-height)', minHeight: '100vh', background: 'var(--bg-0)' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <div className="section-badge">🏪 VENDOR DASHBOARD</div>
        <h1 className="display-md" style={{ marginBottom: 24 }}>Quản Lý Cửa Hàng</h1>

        <div className="dash-wrap">
          {/* Sidebar */}
          <div className="dash-sidebar">
            <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
              <div className="flex gap-8">
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--chakra-flow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.8rem', fontWeight: 700,
                }}>WO</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.82rem' }}>WellKOC Origin</div>
                  <span className="badge badge-c4" style={{ marginTop: 2 }}>Official Brand</span>
                </div>
              </div>
            </div>
            {sidebarItems.map(item => (
              <div
                key={item.key}
                className={`dash-nav-item ${activeNav === item.key ? 'on' : ''}`}
                onClick={() => setActiveNav(item.key)}
              >
                <span className="dash-nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="dash-content">
            {/* KPI Cards — always visible */}
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              {kpiData.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-val" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className={`kpi-delta ${kpi.up ? 'delta-up' : 'delta-down'}`}>
                    {kpi.up ? '↑' : '↓'} {kpi.delta}
                  </div>
                </div>
              ))}
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
