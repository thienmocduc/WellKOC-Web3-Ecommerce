import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_EMAIL = 'admin@wellkoc.com';
const STORAGE_KEY = 'wellkoc-auth';

function isAdminLoggedIn(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed?.user?.email === ADMIN_EMAIL && parsed?.user?.role === 'admin';
  } catch {
    return false;
  }
}

const sidebarTabs = [
  { key: 'overview', icon: '📊', label: 'Tổng quan' },
  { key: 'users', icon: '👥', label: 'Người dùng' },
  { key: 'products', icon: '📦', label: 'Sản phẩm' },
  { key: 'koc', icon: '🌟', label: 'KOC' },
  { key: 'orders', icon: '🛒', label: 'Đơn hàng' },
  { key: 'commission', icon: '💰', label: 'Hoa hồng' },
  { key: 'approvals', icon: '✅', label: 'Phê duyệt' },
  { key: 'system', icon: '🔧', label: 'Hệ thống' },
  { key: 'settings', icon: '⚙️', label: 'Cài đặt' },
  { key: 'payments', icon: '💳', label: 'Payment Management' },
  { key: 'blockchain', icon: '🔗', label: 'Blockchain Monitor' },
  { key: 'walletMgmt', icon: '🏦', label: 'Wallet Management' },
];

const overviewKPIs = [
  { label: 'Tổng người dùng', value: '12,847', delta: '+342 tuần này', color: 'var(--c4-500)' },
  { label: 'Tổng doanh thu', value: '1.28B₫', delta: '+18.5% MoM', color: 'var(--c5-500)' },
  { label: 'KOC hoạt động', value: '1,245', delta: '+89 mới', color: 'var(--c6-500)' },
  { label: 'Đơn hàng tháng', value: '8,934', delta: '+12.3%', color: 'var(--c7-500)' },
  { label: 'Hoa hồng đã trả', value: '156M₫', delta: 'Tháng 3/2026', color: 'var(--gold-400)' },
  { label: 'DPP đã mint', value: '3,456', delta: '98.2% verified', color: 'var(--c4-300)' },
];

const usersData = [
  { id: 'USR-001', name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', status: 'active', joinDate: '2026-01-15', orders: 23 },
  { id: 'USR-002', name: 'Trần Thị B', email: 'b@example.com', role: 'koc', status: 'active', joinDate: '2026-01-20', orders: 45 },
  { id: 'USR-003', name: 'Lê Văn C', email: 'c@example.com', role: 'vendor', status: 'active', joinDate: '2026-02-01', orders: 0 },
  { id: 'USR-004', name: 'Phạm Thị D', email: 'd@example.com', role: 'koc', status: 'suspended', joinDate: '2026-02-10', orders: 12 },
  { id: 'USR-005', name: 'Hoàng Văn E', email: 'e@example.com', role: 'user', status: 'active', joinDate: '2026-03-01', orders: 8 },
];

const productsData = [
  { id: 'PRD-001', name: 'Trà Ô Long Premium', vendor: 'WellKOC Origin', price: '389.000₫', status: 'approved', dpp: true, sales: 1247 },
  { id: 'PRD-002', name: 'Serum Vitamin C', vendor: 'K-Beauty VN', price: '459.000₫', status: 'approved', dpp: true, sales: 892 },
  { id: 'PRD-003', name: 'Mật Ong Rừng', vendor: 'GreenViet', price: '285.000₫', status: 'pending', dpp: false, sales: 0 },
  { id: 'PRD-004', name: 'Cà Phê Arabica', vendor: 'Đà Lạt Farm', price: '245.000₫', status: 'approved', dpp: true, sales: 1580 },
  { id: 'PRD-005', name: 'Kem Chống Nắng', vendor: 'SunCare VN', price: '199.000₫', status: 'rejected', dpp: false, sales: 0 },
];

const kocData = [
  { id: 'KOC-001', name: 'Minh Hương', level: 12, sales: '45.2M₫', commission: '8.1M₫', status: 'active', trustScore: 92 },
  { id: 'KOC-002', name: 'Thảo Linh', level: 10, sales: '38.7M₫', commission: '6.9M₫', status: 'active', trustScore: 88 },
  { id: 'KOC-003', name: 'Ngọc Anh', level: 9, sales: '32.1M₫', commission: '5.7M₫', status: 'active', trustScore: 85 },
  { id: 'KOC-004', name: 'Văn Hoàng', level: 8, sales: '28.4M₫', commission: '5.1M₫', status: 'review', trustScore: 78 },
];

const ordersData = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', product: 'Trà Ô Long', amount: '389.000₫', status: 'delivered', date: '2026-03-25' },
  { id: 'ORD-002', customer: 'Trần Thị B', product: 'Serum Vitamin C', amount: '459.000₫', status: 'shipping', date: '2026-03-24' },
  { id: 'ORD-003', customer: 'Lê Văn C', product: 'Mật Ong Rừng', amount: '285.000₫', status: 'processing', date: '2026-03-24' },
  { id: 'ORD-004', customer: 'Phạm Thị D', product: 'Cà Phê Arabica', amount: '245.000₫', status: 'cancelled', date: '2026-03-23' },
  { id: 'ORD-005', customer: 'Hoàng Văn E', product: 'Bột Collagen', amount: '890.000₫', status: 'pending', date: '2026-03-23' },
];

const commissionData = [
  { koc: 'Minh Hương', amount: '2.3M₫', orders: 34, status: 'paid', txHash: '0x1a2b...9f3c', date: '2026-03-25' },
  { koc: 'Thảo Linh', amount: '1.8M₫', orders: 28, status: 'pending', txHash: '—', date: '2026-03-24' },
  { koc: 'Ngọc Anh', amount: '1.5M₫', orders: 22, status: 'processing', txHash: '—', date: '2026-03-24' },
  { koc: 'Văn Hoàng', amount: '1.2M₫', orders: 18, status: 'paid', txHash: '0x4d5e...8a2b', date: '2026-03-23' },
];

const approvalsData = [
  { id: 'APR-001', type: 'Sản phẩm mới', name: 'Mật Ong Rừng', submitter: 'GreenViet', date: '2026-03-24', status: 'pending' },
  { id: 'APR-002', type: 'KOC mới', name: 'Phương Thảo', submitter: 'Self-register', date: '2026-03-23', status: 'pending' },
  { id: 'APR-003', type: 'Vendor mới', name: 'Đà Lạt Farm', submitter: 'Self-register', date: '2026-03-22', status: 'pending' },
  { id: 'APR-004', type: 'Rút tiền', name: '5.000.000₫', submitter: 'Minh Hương', date: '2026-03-22', status: 'pending' },
  { id: 'APR-005', type: 'DPP mint', name: 'Cà Phê Arabica', submitter: 'Đà Lạt Farm', date: '2026-03-21', status: 'approved' },
];

const systemHealth = [
  { service: 'API Server', status: 'online', uptime: '99.98%', latency: '45ms' },
  { service: 'Database', status: 'online', uptime: '99.99%', latency: '12ms' },
  { service: 'Blockchain Node', status: 'online', uptime: '99.95%', latency: '120ms' },
  { service: 'IPFS Gateway', status: 'online', uptime: '99.90%', latency: '85ms' },
  { service: 'AI Engine', status: 'online', uptime: '99.92%', latency: '200ms' },
  { service: 'CDN', status: 'online', uptime: '99.99%', latency: '8ms' },
  { service: 'WebSocket', status: 'degraded', uptime: '98.50%', latency: '350ms' },
  { service: 'Email Service', status: 'online', uptime: '99.97%', latency: '150ms' },
];

/* ── NEW: Payment Management data ────────────────── */
const allTransactions = [
  { id: 'TXN-001', type: 'payment', user: 'Nguyễn Văn A', method: 'VNPay', amount: '389.000₫', orderId: 'ORD-001', status: 'success', date: '2026-03-25', txHash: '' },
  { id: 'TXN-002', type: 'payment', user: 'Trần Thị B', method: 'MoMo', amount: '459.000₫', orderId: 'ORD-002', status: 'success', date: '2026-03-24', txHash: '' },
  { id: 'TXN-003', type: 'payment', user: 'Lê Văn C', method: 'Crypto (USDT)', amount: '285.000₫', orderId: 'ORD-003', status: 'success', date: '2026-03-24', txHash: '0x7a2c...b41e' },
  { id: 'TXN-004', type: 'refund', user: 'Phạm Thị D', method: 'VNPay', amount: '245.000₫', orderId: 'ORD-004', status: 'completed', date: '2026-03-23', txHash: '' },
  { id: 'TXN-005', type: 'payout', user: 'Minh Hương (KOC)', method: 'Crypto (USDT)', amount: '2.300.000₫', orderId: '—', status: 'success', date: '2026-03-25', txHash: '0x1a2b...9f3c' },
  { id: 'TXN-006', type: 'payout', user: 'Thảo Linh (KOC)', method: 'Bank Transfer', amount: '1.800.000₫', orderId: '—', status: 'pending', date: '2026-03-24', txHash: '' },
  { id: 'TXN-007', type: 'payment', user: 'Hoàng Văn E', method: 'Crypto (USDC)', amount: '890.000₫', orderId: 'ORD-005', status: 'success', date: '2026-03-23', txHash: '0x3f8d...c92a' },
];

const paymentKPIs = [
  { label: 'Tổng giao dịch tháng', value: '8,934', color: 'var(--c4-500)' },
  { label: 'Doanh thu tháng', value: '1.28B₫', color: 'var(--c5-500)' },
  { label: 'Refunds', value: '23 (12.5M₫)', color: 'var(--gold-400)' },
  { label: 'Payouts (KOC)', value: '156M₫', color: 'var(--c6-500)' },
];

const txnTypeConfig: Record<string, { label: string; badge: string }> = {
  payment: { label: 'Thanh toán', badge: 'badge-c4' },
  refund: { label: 'Hoàn tiền', badge: 'badge-gold' },
  payout: { label: 'Chi trả KOC', badge: 'badge-c5' },
};

/* ── NEW: Blockchain Monitor data ────────────────── */
const smartContractStats = [
  { label: 'Commission Contract', address: '0xComm...1234', txCount: 4523, gasUsed: '45.2 MATIC', status: 'active' },
  { label: 'DPP NFT Contract', address: '0xDPP...5678', txCount: 3456, gasUsed: '23.8 MATIC', status: 'active' },
  { label: 'Creator Token Factory', address: '0xCTF...9012', txCount: 847, gasUsed: '12.1 MATIC', status: 'active' },
  { label: 'Treasury Contract', address: '0xTrsy...3456', txCount: 189, gasUsed: '5.4 MATIC', status: 'active' },
];

const blockchainKPIs = [
  { label: 'Tổng TX on-chain', value: '9,015', color: 'var(--c4-500)' },
  { label: 'Gas fees tháng', value: '86.5 MATIC', color: 'var(--c7-500)' },
  { label: 'DPP minted', value: '3,456', color: 'var(--c6-500)' },
  { label: 'Commission payouts', value: '4,523', color: 'var(--c5-500)' },
];

const recentOnchainTx = [
  { hash: '0xa1b2...c3d4', type: 'Commission Payout', from: 'Treasury', to: 'Minh Hương', amount: '70.020₫', gas: '0.012 MATIC', date: '2026-03-25 14:32' },
  { hash: '0xe5f6...g7h8', type: 'DPP Mint', from: 'WellKOC Origin', to: 'DPP Contract', amount: 'Token #1252', gas: '0.025 MATIC', date: '2026-03-25 13:15' },
  { hash: '0xi9j0...k1l2', type: 'Creator Token Buy', from: 'Fan_0xABC', to: 'Token Pool', amount: '500 $MINH', gas: '0.008 MATIC', date: '2026-03-25 12:45' },
  { hash: '0xm3n4...o5p6', type: 'Commission Payout', from: 'Treasury', to: 'Ngọc Anh', amount: '42.750₫', gas: '0.012 MATIC', date: '2026-03-24 18:20' },
  { hash: '0xq7r8...s9t0', type: 'Withdrawal', from: 'Vendor Wallet', to: 'Bank Bridge', amount: '20.000.000₫', gas: '0.015 MATIC', date: '2026-03-24 16:00' },
];

/* ── NEW: Wallet Management data ─────────────────── */
const platformWallets = [
  { name: 'Treasury (Main)', address: '0xTrsy...MAIN', balance: '$245,000', tokens: '245,000 USDT', chain: 'Polygon', role: 'Thu phí nền tảng & reserve' },
  { name: 'Commission Pool', address: '0xComm...POOL', balance: '$45,200', tokens: '45,200 USDT', chain: 'Polygon', role: 'Pool chi trả hoa hồng KOC' },
  { name: 'DPP Mint Fund', address: '0xDPP...FUND', balance: '$8,500', tokens: '8,500 MATIC', chain: 'Polygon', role: 'Gas fee cho DPP mint' },
  { name: 'Hot Wallet', address: '0xHot...WLLT', balance: '$12,300', tokens: 'Multi-token', chain: 'Polygon', role: 'Ví giao dịch hàng ngày' },
];

const walletKPIs = [
  { label: 'Tổng tài sản nền tảng', value: '$310,000', color: 'var(--c4-500)' },
  { label: 'Treasury Balance', value: '$245,000', color: 'var(--c5-500)' },
  { label: 'Phí thu tháng này', value: '$12,400', color: 'var(--c6-500)' },
  { label: 'Pending payouts', value: '$8,200', color: 'var(--gold-400)' },
];

const feeCollection = [
  { source: 'Phí giao dịch (1%)', amount: '$8,934', period: 'Tháng 3/2026' },
  { source: 'Phí DPP mint', amount: '$1,728', period: 'Tháng 3/2026' },
  { source: 'Phí rút tiền (0.5%)', amount: '$1,245', period: 'Tháng 3/2026' },
  { source: 'Phí Creator Token', amount: '$493', period: 'Tháng 3/2026' },
];

/* ── Shared status configs ───────────────────────── */
const statusBadge: Record<string, string> = {
  active: 'badge-c4', suspended: 'badge-gold', approved: 'badge-c4', pending: 'badge-gold',
  rejected: 'badge-c5', review: 'badge-c6', delivered: 'badge-c4', shipping: 'badge-c5',
  processing: 'badge-c6', cancelled: 'badge-c5', paid: 'badge-c4', online: 'badge-c4', degraded: 'badge-gold',
  success: 'badge-c4', completed: 'badge-c4',
};
const statusLabel: Record<string, string> = {
  active: 'Hoạt động', suspended: 'Tạm khóa', approved: 'Đã duyệt', pending: 'Chờ duyệt',
  rejected: 'Từ chối', review: 'Đang xét', delivered: 'Đã giao', shipping: 'Đang giao',
  processing: 'Đang xử lý', cancelled: 'Đã hủy', paid: 'Đã trả', online: 'Online', degraded: 'Chậm',
  success: 'Thành công', completed: 'Hoàn thành',
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  if (!isAdminLoggedIn()) {
    return (
      <div style={{ paddingTop: 'var(--topbar-height)', minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔒</div>
          <h2 className="display-md">Truy cập bị từ chối</h2>
          <p style={{ color: 'var(--text-3)', fontSize: '.85rem', marginTop: 8 }}>Bạn cần đăng nhập với tài khoản Admin.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>Đăng nhập</button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Tổng Quan Hệ Thống</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              {overviewKPIs.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-val" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="kpi-delta delta-up">↑ {kpi.delta}</div>
                </div>
              ))}
            </div>
            <div className="chart-bar-wrap">
              <div className="label" style={{ marginBottom: 12 }}>DOANH THU 12 THÁNG (tỷ VNĐ)</div>
              <div className="chart-bars">
                {[45, 52, 48, 65, 72, 68, 78, 85, 92, 88, 95, 100].map((v, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${v}%` }} />
                ))}
              </div>
            </div>
          </>
        );

      case 'users':
        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Quản Lý Người Dùng</h2>
              <span className="badge badge-c5">{usersData.length} người dùng</span>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tham gia', 'Đơn hàng'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersData.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px' }} className="mono">{u.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-3)' }}>{u.email}</td>
                      <td style={{ padding: '12px 14px' }}><span className="badge badge-c6">{u.role}</span></td>
                      <td style={{ padding: '12px 14px' }}><span className={`badge ${statusBadge[u.status]}`}>{statusLabel[u.status]}</span></td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-3)' }}>{u.joinDate}</td>
                      <td style={{ padding: '12px 14px' }}>{u.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'products':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Quản Lý Sản Phẩm</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Sản phẩm', 'Vendor', 'Giá', 'DPP', 'Đã bán', 'Trạng thái'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productsData.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px' }} className="mono">{p.id}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-3)' }}>{p.vendor}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{p.price}</td>
                      <td style={{ padding: '12px 14px' }}>{p.dpp ? <span className="badge badge-c4">DPP ✓</span> : '—'}</td>
                      <td style={{ padding: '12px 14px' }}>{p.sales.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px' }}><span className={`badge ${statusBadge[p.status]}`}>{statusLabel[p.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'koc':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Quản Lý KOC</h2>
            <div className="flex-col gap-12">
              {kocData.map(k => (
                <div key={k.id} className="card" style={{ padding: '18px 24px' }}>
                  <div className="flex" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div className="flex gap-8" style={{ marginBottom: 4 }}>
                        <span className="mono" style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>{k.id}</span>
                        <span className={`badge ${statusBadge[k.status]}`}>{statusLabel[k.status]}</span>
                        <span className="badge badge-c7">Lv{k.level}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{k.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 4 }}>Trust Score: {k.trustScore}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{k.sales}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Hoa hồng: {k.commission}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 'orders':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Quản Lý Đơn Hàng</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Giá trị', 'Trạng thái', 'Ngày'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ordersData.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px' }} className="mono">{o.id}</td>
                      <td style={{ padding: '12px 14px' }}>{o.customer}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{o.product}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{o.amount}</td>
                      <td style={{ padding: '12px 14px' }}><span className={`badge ${statusBadge[o.status]}`}>{statusLabel[o.status]}</span></td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-3)' }}>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'commission':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Quản Lý Hoa Hồng</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['KOC', 'Số tiền', 'Đơn hàng', 'Trạng thái', 'TX Hash', 'Ngày'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissionData.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{c.koc}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{c.amount}</td>
                      <td style={{ padding: '12px 14px' }}>{c.orders}</td>
                      <td style={{ padding: '12px 14px' }}><span className={`badge ${statusBadge[c.status]}`}>{statusLabel[c.status]}</span></td>
                      <td style={{ padding: '12px 14px' }} className="mono">{c.txHash}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-3)' }}>{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'approvals':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Phê Duyệt</h2>
            <div className="flex-col gap-12">
              {approvalsData.map(a => (
                <div key={a.id} className="card" style={{ padding: '18px 24px' }}>
                  <div className="flex" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div className="flex gap-8" style={{ marginBottom: 4 }}>
                        <span className="mono" style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>{a.id}</span>
                        <span className="badge badge-c6">{a.type}</span>
                        <span className={`badge ${statusBadge[a.status]}`}>{statusLabel[a.status]}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{a.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 2 }}>Bởi: {a.submitter} · {a.date}</div>
                    </div>
                    {a.status === 'pending' && (
                      <div className="flex gap-8">
                        <button className="btn btn-primary btn-sm">Duyệt</button>
                        <button className="btn btn-secondary btn-sm">Từ chối</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 'system':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Hệ Thống</h2>
            <div className="flex-col gap-8">
              {systemHealth.map((s, i) => (
                <div key={i} className="card" style={{ padding: '14px 20px' }}>
                  <div className="flex" style={{ justifyContent: 'space-between' }}>
                    <div className="flex gap-12">
                      <div className={`dot-pulse ${s.status === 'online' ? 'dot-green' : 'dot-indigo'}`} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{s.service}</div>
                        <span className={`badge ${statusBadge[s.status]}`}>{statusLabel[s.status]}</span>
                      </div>
                    </div>
                    <div className="flex gap-16">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Uptime</div>
                        <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '.85rem', color: 'var(--c4-500)' }}>{s.uptime}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Latency</div>
                        <div style={{ fontFamily: 'var(--ff-mono)', fontWeight: 600, fontSize: '.78rem' }}>{s.latency}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 'settings':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Cài Đặt Hệ Thống</h2>
            <div className="flex-col gap-16">
              {[
                { title: 'Thông tin nền tảng', fields: [{ label: 'Tên nền tảng', value: 'WellKOC' }, { label: 'Phiên bản', value: 'v1.0.0' }, { label: 'Ngôn ngữ', value: 'Tiếng Việt' }] },
                { title: 'Blockchain', fields: [{ label: 'Chain chính', value: 'Polygon' }, { label: 'Chain phụ', value: 'Base' }, { label: 'IPFS Gateway', value: 'Pinata' }] },
                { title: 'Thanh toán', fields: [{ label: 'Phương thức', value: 'VNPay, MoMo, Crypto' }, { label: 'Đồng tiền', value: 'VNĐ, USDT, USDC' }, { label: 'Auto payout', value: 'Bật' }] },
                { title: 'Bảo mật', fields: [{ label: '2FA', value: 'Bắt buộc cho Admin' }, { label: 'Session timeout', value: '30 phút' }, { label: 'Rate limit', value: '100 req/min' }] },
              ].map((section, si) => (
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

      /* ────── NEW: PAYMENT MANAGEMENT ────── */
      case 'payments':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Payment Management</h2>

            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              {paymentKPIs.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-val" style={{ color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* All transactions table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className="flex" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Tất Cả Giao Dịch</span>
                  <div className="flex gap-8">
                    <span className="badge badge-c4">Payments</span>
                    <span className="badge badge-gold">Refunds</span>
                    <span className="badge badge-c5">Payouts</span>
                  </div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Mã GD', 'Loại', 'Người dùng', 'Phương thức', 'Số tiền', 'Đơn hàng', 'Trạng thái', 'TX Hash'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map(tx => {
                      const tc = txnTypeConfig[tx.type];
                      return (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px' }} className="mono">{tx.id}</td>
                          <td style={{ padding: '12px 14px' }}><span className={`badge ${tc.badge}`}>{tc.label}</span></td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{tx.user}</td>
                          <td style={{ padding: '12px 14px' }}>{tx.method}</td>
                          <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700, color: tx.type === 'refund' ? 'var(--gold-400)' : 'var(--c4-500)' }}>{tx.amount}</td>
                          <td style={{ padding: '12px 14px' }} className="mono">{tx.orderId}</td>
                          <td style={{ padding: '12px 14px' }}><span className={`status-pill badge ${statusBadge[tx.status]}`}>{statusLabel[tx.status]}</span></td>
                          <td style={{ padding: '12px 14px' }} className="mono tx-hash">
                            {tx.txHash ? (
                              <a href={`https://polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c6-300)' }}>{tx.txHash}</a>
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

      /* ────── NEW: BLOCKCHAIN MONITOR ────── */
      case 'blockchain':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Blockchain Monitor</h2>

            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              {blockchainKPIs.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-val" style={{ color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Smart contract stats */}
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <div className="label" style={{ marginBottom: 12 }}>SMART CONTRACTS</div>
              <div className="flex-col gap-12">
                {smartContractStats.map((sc, i) => (
                  <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '12px 0', borderBottom: i < smartContractStats.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{sc.label}</div>
                      <div className="mono" style={{ fontSize: '.68rem', color: 'var(--c6-300)' }}>{sc.address}</div>
                    </div>
                    <div className="flex gap-16">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>TX Count</div>
                        <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '.85rem' }}>{sc.txCount.toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>Gas Used</div>
                        <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '.85rem', color: 'var(--c7-500)' }}>{sc.gasUsed}</div>
                      </div>
                      <div>
                        <span className="badge badge-c4">{sc.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent on-chain transactions */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Giao Dịch On-chain Gần Đây</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['TX Hash', 'Loại', 'Từ', 'Đến', 'Giá trị', 'Gas', 'Thời gian'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOnchainTx.map((tx, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 14px' }} className="mono">
                          <a href={`https://polygonscan.com/tx/${tx.hash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c6-300)' }}>{tx.hash}</a>
                        </td>
                        <td style={{ padding: '12px 14px' }}><span className="badge badge-c6">{tx.type}</span></td>
                        <td style={{ padding: '12px 14px', fontSize: '.72rem' }}>{tx.from}</td>
                        <td style={{ padding: '12px 14px', fontSize: '.72rem' }}>{tx.to}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{tx.amount}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--c7-500)', fontSize: '.72rem' }}>{tx.gas}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-3)', fontSize: '.72rem' }}>{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="onchain-card" style={{ marginTop: 20 }}>
              <div className="verified-seal">Polygon Network</div>
              <div style={{ fontSize: '.82rem', fontWeight: 600, marginBottom: 8 }}>Blockchain Infrastructure</div>
              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                <span className="badge badge-c4">Polygon PoS</span>
                <span className="badge badge-c5">ERC-721 (DPP)</span>
                <span className="badge badge-c6">ERC-20 (Tokens)</span>
                <span className="badge badge-c7">IPFS (Pinata)</span>
              </div>
            </div>
          </>
        );

      /* ────── NEW: WALLET MANAGEMENT ────── */
      case 'walletMgmt':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Wallet Management</h2>

            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              {walletKPIs.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-val" style={{ color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Platform wallets */}
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <div className="label" style={{ marginBottom: 16 }}>VÍ NỀN TẢNG</div>
              <div className="flex-col gap-16">
                {platformWallets.map((w, i) => (
                  <div key={i} className="onchain-card" style={{ padding: 16 }}>
                    <div className="flex" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{w.name}</div>
                        <div className="mono" style={{ fontSize: '.68rem', color: 'var(--c6-300)' }}>{w.address}</div>
                        <div style={{ fontSize: '.68rem', color: 'var(--text-4)', marginTop: 4 }}>{w.role}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--c4-500)' }}>{w.balance}</div>
                        <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>{w.tokens}</div>
                        <span className="badge badge-c7" style={{ marginTop: 4 }}>{w.chain}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee collection */}
            <div className="card" style={{ padding: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>PHÍ THU THÁNG NÀY</div>
              <div className="flex-col gap-10">
                {feeCollection.map((f, i) => (
                  <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: i < feeCollection.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{f.source}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>{f.period}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '.92rem', color: 'var(--c4-500)' }}>{f.amount}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-2)', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>Tổng phí thu: </span>
                <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--c4-500)' }}>$12,400</span>
              </div>
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
        <div className="section-badge" style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,.2)' }}>
          🔒 ADMIN PANEL
        </div>
        <h1 className="display-md" style={{ marginBottom: 24 }}>Quản Trị Hệ Thống</h1>

        <div className="dash-wrap">
          {/* Sidebar */}
          <div className="dash-sidebar">
            <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
              <div className="flex gap-8">
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444, #f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.75rem', fontWeight: 700, color: '#fff',
                }}>AD</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.78rem' }}>WellKOC Admin</div>
                  <span className="badge" style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: '.55rem' }}>Super Admin</span>
                </div>
              </div>
            </div>
            {sidebarTabs.map(tab => (
              <div
                key={tab.key}
                className={`dash-nav-item ${activeTab === tab.key ? 'on' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="dash-nav-icon">{tab.icon}</span>
                {tab.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="dash-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
