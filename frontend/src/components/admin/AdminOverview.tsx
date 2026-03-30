import { useState } from 'react';
import AdminDetailPanel from './shared/AdminDetailPanel';

interface Props {
  kpis: { label: string; value: string; delta: string; color: string }[];
  users: { id: string; name: string; role: string; status: string; orders: number }[];
  orders: { id: string; customer: string; product: string; amount: string; status: string; date: string }[];
  kocs: { id: string; name: string; tier: string; sales: string; commission: string; status: string }[];
  vendors: { id: string; shopName: string; revenue: string; products: number; status: string }[];
  products: { id: string; name: string; vendor: string; price: string; status: string; sales: number }[];
  commissions: { koc: string; amount: string; orders: number; status: string; txHash: string; date: string }[];
  onNavigate: (tab: string) => void;
}

const thSm: React.CSSProperties = { padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: '.62rem', color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase' as const };
const tdSm: React.CSSProperties = { padding: '8px 10px', fontSize: '.75rem' };
const filterInput: React.CSSProperties = { padding: '6px 10px', fontSize: '.75rem', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-0)', color: 'var(--text-1)', outline: 'none', width: 130 };
const statusBadge: Record<string, string> = { active: 'badge-c4', suspended: 'badge-gold', approved: 'badge-c4', pending: 'badge-gold', rejected: 'badge-c5', delivered: 'badge-c4', shipping: 'badge-c5', processing: 'badge-c6', cancelled: 'badge-c5', paid: 'badge-c4', confirmed: 'badge-c6', packing: 'badge-c7', review: 'badge-c6' };
const statusLabel: Record<string, string> = { active: 'Hoạt động', suspended: 'Tạm khóa', approved: 'Đã duyệt', pending: 'Chờ duyệt', rejected: 'Từ chối', delivered: 'Đã giao', shipping: 'Đang giao', processing: 'Đang xử lý', cancelled: 'Đã hủy', paid: 'Đã trả', confirmed: 'Đã xác nhận', packing: 'Đang đóng gói', review: 'Đang xét' };

function StatusBadge({ s }: { s: string }) {
  return <span className={`badge ${statusBadge[s] || 'badge-c6'}`} style={{ fontSize: '.6rem' }}>{statusLabel[s] || s}</span>;
}

function MiniTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: 'var(--bg-0)' }}>{headers.map(h => <th key={h} style={thSm}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function DateFilter({ from, to, onFrom, onTo }: { from: string; to: string; onFrom: (v: string) => void; onTo: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
      <span style={{ fontSize: '.7rem', color: 'var(--text-3)', fontWeight: 600 }}>Lọc ngày:</span>
      <input type="date" value={from} onChange={e => onFrom(e.target.value)} style={filterInput} />
      <span style={{ fontSize: '.7rem', color: 'var(--text-4)' }}>→</span>
      <input type="date" value={to} onChange={e => onTo(e.target.value)} style={filterInput} />
    </div>
  );
}

function StatGrid({ items }: { items: { label: string; value: string | number; color: string; pct?: string; onClick?: () => void }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: 10, marginBottom: 16 }}>
      {items.map((r, i) => (
        <div key={i} style={{ padding: 14, borderRadius: 10, background: 'var(--bg-2)', textAlign: 'center', cursor: r.onClick ? 'pointer' : 'default', border: '1px solid var(--border)', transition: 'all .15s' }} onClick={r.onClick}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: r.color }}>{r.value}</div>
          <div style={{ fontSize: '.68rem', color: 'var(--text-3)', marginTop: 2 }}>{r.label}</div>
          {r.pct && <div style={{ height: 3, borderRadius: 2, background: 'var(--bg-0)', marginTop: 6 }}><div style={{ height: '100%', width: `${Math.min(parseFloat(r.pct), 100)}%`, background: r.color, borderRadius: 2 }} /></div>}
        </div>
      ))}
    </div>
  );
}

export default function AdminOverview({ kpis, users, orders, kocs, vendors, products, commissions, onNavigate }: Props) {
  const [drillDown, setDrillDown] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const usersByRole = { buyer: users.filter(u => u.role === 'user').length, koc: users.filter(u => u.role === 'koc').length, vendor: users.filter(u => u.role === 'vendor').length, admin: users.filter(u => u.role === 'admin').length };
  const ordersByStatus = { pending: orders.filter(o => o.status === 'pending').length, confirmed: orders.filter(o => o.status === 'confirmed').length, packing: orders.filter(o => o.status === 'packing').length, shipping: orders.filter(o => o.status === 'shipping').length, delivered: orders.filter(o => o.status === 'delivered').length, cancelled: orders.filter(o => o.status === 'cancelled').length };

  // Revenue by vendor
  const revenueByVendor = vendors.map(v => ({ name: v.shopName, revenue: v.revenue, products: v.products, status: v.status }));
  // Revenue by product (top sellers)
  const revenueByProduct = [...products].filter(p => p.sales > 0).sort((a, b) => b.sales - a.sales);

  // Filter helper
  const filterByDate = <T extends { date?: string }>(items: T[]) => {
    if (!dateFrom && !dateTo) return items;
    return items.filter(item => {
      const d = (item as any).date || (item as any).joinDate || '';
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  };

  const filteredOrders = filterByDate(orders);

  const drillDownConfig: Record<string, { title: string; subtitle: string; tabs: { key: string; label: string; icon: string; content: JSX.Element }[] }> = {
    /* ═══════ DOANH THU ═══════ */
    'Tổng doanh thu': {
      title: 'Phân tích Doanh thu',
      subtitle: `Tổng: ${kpis.find(k => k.label === 'Tổng doanh thu')?.value || '—'}`,
      tabs: [
        { key: 'byProduct', label: 'Theo sản phẩm', icon: '📦', content: (
          <div>
            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Doanh thu theo sản phẩm</h4>
            <MiniTable headers={['Sản phẩm', 'Vendor', 'Giá', 'Đã bán', 'Trạng thái']}>
              {revenueByProduct.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdSm, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ ...tdSm, color: 'var(--text-3)' }}>{p.vendor}</td>
                  <td style={tdSm}>{p.price}</td>
                  <td style={{ ...tdSm, fontWeight: 700, color: 'var(--c4-500)' }}>{p.sales.toLocaleString()}</td>
                  <td style={tdSm}><StatusBadge s={p.status} /></td>
                </tr>
              ))}
            </MiniTable>
            <button style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--c6-500)', background: 'transparent', color: 'var(--c6-500)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }} onClick={() => { setDrillDown(null); onNavigate('products'); }}>Xem tất cả sản phẩm →</button>
          </div>
        )},
        { key: 'byVendor', label: 'Theo Vendor', icon: '🏪', content: (
          <div>
            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Doanh thu theo Vendor</h4>
            {revenueByVendor.map((v, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, marginBottom: 6, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{v.name}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>{v.products} sản phẩm · <StatusBadge s={v.status} /></div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--c4-500)' }}>{v.revenue}</div>
              </div>
            ))}
            <button style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--c6-500)', background: 'transparent', color: 'var(--c6-500)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }} onClick={() => { setDrillDown(null); onNavigate('vendor'); }}>Quản lý Vendor →</button>
          </div>
        )},
        { key: 'trend', label: 'Trend', icon: '📈', content: (
          <div>
            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 12 }}>Trend doanh thu 12 tháng (tỷ VNĐ)</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, padding: '0 4px' }}>
              {[
                { m: 'T4', v: 0.6 }, { m: 'T5', v: 0.7 }, { m: 'T6', v: 0.8 }, { m: 'T7', v: 0.75 },
                { m: 'T8', v: 0.9 }, { m: 'T9', v: 0.85 }, { m: 'T10', v: 1.0 }, { m: 'T11', v: 0.95 },
                { m: 'T12', v: 1.1 }, { m: 'T1', v: 1.05 }, { m: 'T2', v: 1.2 }, { m: 'T3', v: 1.28 },
              ].map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: '.55rem', color: 'var(--text-2)', fontWeight: 600 }}>{d.v}B</span>
                  <div style={{ width: '100%', height: `${d.v * 90}px`, background: i === 11 ? 'var(--c4-500)' : `linear-gradient(180deg, var(--c6-500), var(--c7-500))`, borderRadius: '3px 3px 0 0', opacity: 0.6 + (i * 0.03) }} />
                  <span style={{ fontSize: '.5rem', color: 'var(--text-4)' }}>{d.m}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Tháng cao nhất: <strong style={{ color: 'var(--c4-500)' }}>T3/2026 — 1.28B₫</strong></div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 4 }}>Tăng trưởng TB: <strong style={{ color: 'var(--c4-500)' }}>+6.7% MoM</strong></div>
            </div>
          </div>
        )},
      ],
    },

    /* ═══════ NGƯỜI DÙNG ═══════ */
    'Tổng người dùng': {
      title: 'Phân tích Người dùng',
      subtitle: `Tổng: ${users.length} người dùng`,
      tabs: [
        { key: 'breakdown', label: 'Phân bổ', icon: '📊', content: (
          <div>
            <StatGrid items={[
              { label: 'Buyer', value: usersByRole.buyer, color: 'var(--c4-500)', pct: ((usersByRole.buyer / users.length) * 100).toFixed(1) },
              { label: 'KOC/KOL', value: usersByRole.koc, color: 'var(--c6-500)', pct: ((usersByRole.koc / users.length) * 100).toFixed(1) },
              { label: 'Vendor', value: usersByRole.vendor, color: '#f59e0b', pct: ((usersByRole.vendor / users.length) * 100).toFixed(1) },
              { label: 'Admin', value: usersByRole.admin, color: '#ef4444', pct: ((usersByRole.admin / users.length) * 100).toFixed(1) },
            ]} />
            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Danh sách người dùng</h4>
            <MiniTable headers={['ID', 'Tên', 'Vai trò', 'Đơn hàng', 'Trạng thái']}>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdSm, fontWeight: 600 }} className="mono">{u.id}</td>
                  <td style={{ ...tdSm, fontWeight: 600 }}>{u.name}</td>
                  <td style={tdSm}><span className={`badge badge-${u.role === 'koc' ? 'c6' : u.role === 'vendor' ? 'gold' : u.role === 'admin' ? 'c5' : 'c4'}`} style={{ fontSize: '.58rem' }}>{u.role}</span></td>
                  <td style={{ ...tdSm, fontWeight: 700, color: 'var(--c4-500)' }}>{u.orders}</td>
                  <td style={tdSm}><StatusBadge s={u.status} /></td>
                </tr>
              ))}
            </MiniTable>
            <button style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--c6-500)', background: 'transparent', color: 'var(--c6-500)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }} onClick={() => { setDrillDown(null); onNavigate('users'); }}>Xem tất cả người dùng →</button>
          </div>
        )},
      ],
    },

    /* ═══════ ĐƠN HÀNG ═══════ */
    'Đơn hàng tháng': {
      title: 'Pipeline Đơn hàng',
      subtitle: `Tổng: ${orders.length} đơn hàng`,
      tabs: [
        { key: 'pipeline', label: 'Pipeline', icon: '📦', content: (
          <div>
            <StatGrid items={[
              { label: 'Chờ xác nhận', value: ordersByStatus.pending, color: '#f59e0b' },
              { label: 'Đã xác nhận', value: ordersByStatus.confirmed, color: 'var(--c6-500)' },
              { label: 'Đang đóng gói', value: ordersByStatus.packing, color: 'var(--c7-500)' },
              { label: 'Đang giao', value: ordersByStatus.shipping, color: 'var(--c5-500)' },
            ]} />
            <StatGrid items={[
              { label: 'Đã giao', value: ordersByStatus.delivered, color: 'var(--c4-500)' },
              { label: 'Đã hủy', value: ordersByStatus.cancelled, color: '#ef4444' },
            ]} />

            <DateFilter from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />

            <h4 style={{ fontSize: '.82rem', fontWeight: 700, margin: '14px 0 8px' }}>Chi tiết đơn hàng</h4>
            <MiniTable headers={['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Số tiền', 'Trạng thái', 'Ngày']}>
              {filteredOrders.map(o => {
                const isError = o.status === 'cancelled';
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', background: isError ? 'rgba(239,68,68,.06)' : 'transparent' }}>
                    <td style={{ ...tdSm, fontWeight: 600 }} className="mono">{o.id}</td>
                    <td style={tdSm}>{o.customer}</td>
                    <td style={tdSm}>{o.product}</td>
                    <td style={{ ...tdSm, fontWeight: 700, color: 'var(--c4-500)' }}>{o.amount}</td>
                    <td style={tdSm}><StatusBadge s={o.status} /></td>
                    <td style={{ ...tdSm, color: 'var(--text-3)' }}>{o.date}</td>
                  </tr>
                );
              })}
            </MiniTable>
            <button style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--c6-500)', background: 'transparent', color: 'var(--c6-500)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }} onClick={() => { setDrillDown(null); onNavigate('orders'); }}>Xem tất cả đơn hàng →</button>
          </div>
        )},
      ],
    },

    /* ═══════ KOC ═══════ */
    'KOC hoạt động': {
      title: 'KOC Performance',
      subtitle: `${kocs.length} KOC đang hoạt động`,
      tabs: [
        { key: 'ranking', label: 'Bảng xếp hạng', icon: '🏆', content: (
          <div>
            {kocs.map((k, i) => (
              <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, marginBottom: 6, background: 'var(--bg-2)', border: `1px solid ${i < 3 ? 'var(--gold-400)' : 'var(--border)'}` }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: i < 3 ? 'var(--gold-400)' : 'var(--text-3)', width: 22, textAlign: 'center' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{k.name}</div>
                    <span className={`badge badge-${k.tier === 'Diamond' ? 'c7' : k.tier === 'Gold' ? 'gold' : k.tier === 'Silver' ? 'c5' : 'c6'}`} style={{ fontSize: '.55rem' }}>{k.tier}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--c4-500)', fontSize: '.82rem' }}>{k.sales}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>HH: {k.commission}</div>
                </div>
                <StatusBadge s={k.status} />
              </div>
            ))}
            <button style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--c6-500)', background: 'transparent', color: 'var(--c6-500)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }} onClick={() => { setDrillDown(null); onNavigate('koc'); }}>Quản lý KOC →</button>
          </div>
        )},
      ],
    },

    /* ═══════ HOA HỒNG ═══════ */
    'Hoa hồng đã trả': {
      title: 'Chi tiết Hoa hồng',
      subtitle: `Tổng: ${kpis.find(k => k.label === 'Hoa hồng đã trả')?.value || '—'}`,
      tabs: [
        { key: 'list', label: 'Danh sách', icon: '💰', content: (
          <div>
            <StatGrid items={[
              { label: 'Đã trả', value: commissions.filter(c => c.status === 'paid').length, color: 'var(--c4-500)' },
              { label: 'Chờ trả', value: commissions.filter(c => c.status === 'pending').length, color: '#f59e0b' },
              { label: 'Đang xử lý', value: commissions.filter(c => c.status === 'processing').length, color: 'var(--c6-500)' },
            ]} />
            <MiniTable headers={['KOC', 'Số tiền', 'Đơn hàng', 'TX Hash', 'Ngày', 'Trạng thái']}>
              {commissions.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdSm, fontWeight: 600 }}>{c.koc}</td>
                  <td style={{ ...tdSm, fontWeight: 700, color: 'var(--c4-500)' }}>{c.amount}</td>
                  <td style={tdSm}>{c.orders}</td>
                  <td style={{ ...tdSm, fontFamily: 'monospace', fontSize: '.65rem', color: 'var(--text-3)' }}>{c.txHash}</td>
                  <td style={{ ...tdSm, color: 'var(--text-3)' }}>{c.date}</td>
                  <td style={tdSm}><StatusBadge s={c.status} /></td>
                </tr>
              ))}
            </MiniTable>
            <button style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--c6-500)', background: 'transparent', color: 'var(--c6-500)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }} onClick={() => { setDrillDown(null); onNavigate('commission'); }}>Quản lý Hoa hồng →</button>
          </div>
        )},
      ],
    },

    /* ═══════ DPP ═══════ */
    'DPP đã mint': {
      title: 'DPP NFT Overview',
      subtitle: `Tổng: ${kpis.find(k => k.label === 'DPP đã mint')?.value || '—'} DPP`,
      tabs: [
        { key: 'products', label: 'Sản phẩm DPP', icon: '🛡️', content: (
          <div>
            <StatGrid items={[
              { label: 'Có DPP', value: products.filter(p => (p as any).dpp).length, color: 'var(--c4-500)' },
              { label: 'Chưa có DPP', value: products.filter(p => !(p as any).dpp).length, color: '#f59e0b' },
            ]} />
            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Sản phẩm đã mint DPP</h4>
            <MiniTable headers={['Sản phẩm', 'Vendor', 'Đã bán', 'DPP']}>
              {products.filter(p => (p as any).dpp).map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdSm, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ ...tdSm, color: 'var(--text-3)' }}>{p.vendor}</td>
                  <td style={{ ...tdSm, fontWeight: 700, color: 'var(--c4-500)' }}>{p.sales.toLocaleString()}</td>
                  <td style={tdSm}><span className="badge badge-c4" style={{ fontSize: '.55rem' }}>Verified</span></td>
                </tr>
              ))}
            </MiniTable>
            <button style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--c6-500)', background: 'transparent', color: 'var(--c6-500)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }} onClick={() => { setDrillDown(null); onNavigate('dpp'); }}>Quản lý DPP →</button>
          </div>
        )},
      ],
    },
  };

  const kpiDrillMap: Record<string, string> = {
    'Tổng người dùng': 'Tổng người dùng',
    'Tổng doanh thu': 'Tổng doanh thu',
    'KOC hoạt động': 'KOC hoạt động',
    'Đơn hàng tháng': 'Đơn hàng tháng',
    'Hoa hồng đã trả': 'Hoa hồng đã trả',
    'DPP đã mint': 'DPP đã mint',
  };

  return (
    <>
      <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Tổng Quan Hệ Thống</h2>

      {/* KPI Cards — clickable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="card card-hover" style={{ padding: 20, cursor: 'pointer', border: '1px solid var(--border)', transition: 'all .2s' }}
            onClick={() => { setDrillDown(kpiDrillMap[kpi.label] || kpi.label); setDateFrom(''); setDateTo(''); }}>
            <div style={{ fontSize: '.68rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.6rem', color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--c4-500)', marginTop: 4 }}>↑ {kpi.delta}</div>
            <div style={{ fontSize: '.6rem', color: 'var(--text-4)', marginTop: 6 }}>Bấm để xem chi tiết →</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 16 }}>DOANH THU 12 THÁNG (TỶ VNĐ)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {[0.6, 0.7, 0.8, 0.75, 0.9, 0.85, 1.0, 0.95, 1.1, 1.05, 1.2, 1.28].map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: `${v * 90}px`, background: `linear-gradient(180deg, var(--c6-500), var(--c7-500))`, borderRadius: '4px 4px 0 0', opacity: 0.7 + (i * 0.025) }} />
              <span style={{ fontSize: '.5rem', color: 'var(--text-4)' }}>T{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Quản lý người dùng', icon: '👥', tab: 'users' },
          { label: 'Quản lý đơn hàng', icon: '📦', tab: 'orders' },
          { label: 'KYC chờ duyệt', icon: '🪪', tab: 'kyc' },
          { label: 'Hoa hồng', icon: '💰', tab: 'commission' },
        ].map(link => (
          <div key={link.tab} className="card card-hover" style={{ padding: 16, cursor: 'pointer', textAlign: 'center' }} onClick={() => onNavigate(link.tab)}>
            <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{link.icon}</div>
            <div style={{ fontSize: '.75rem', fontWeight: 600 }}>{link.label}</div>
          </div>
        ))}
      </div>

      {/* Drill-down panel */}
      {drillDown && drillDownConfig[drillDown] && (
        <AdminDetailPanel
          title={drillDownConfig[drillDown].title}
          subtitle={drillDownConfig[drillDown].subtitle}
          tabs={drillDownConfig[drillDown].tabs}
          onClose={() => setDrillDown(null)}
        />
      )}
    </>
  );
}
