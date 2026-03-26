import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ── Helpers ─────────────────────────────────────── */
const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';
const shortenHash = (h: string) => h.length > 16 ? `${h.slice(0, 6)}...${h.slice(-4)}` : h;

const Stars = ({ count, size = '.82rem' }: { count: number; size?: string }) => (
  <span style={{ fontSize: size, letterSpacing: 1 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= count ? '#fbbf24' : 'var(--text-4)' }}>★</span>
    ))}
  </span>
);

/* ── Sidebar navigation (2 groups) ───────────────── */
const buyerItems = [
  { key: 'orders',    icon: '📦', label: 'Đơn hàng của tôi' },
  { key: 'tracking',  icon: '🚚', label: 'Theo dõi đơn hàng' },
  { key: 'history',   icon: '🕐', label: 'Lịch sử mua hàng' },
  { key: 'wkpay',     icon: '👛', label: 'Ví WK Pay' },
  { key: 'payments',  icon: '💳', label: 'Thanh toán' },
  { key: 'vouchers',  icon: '🎟️', label: 'Kho Voucher' },
  { key: 'favorites', icon: '❤️', label: 'Yêu thích' },
];

const kocItems = [
  { key: 'overview',    icon: '📊', label: 'Tổng quan KOC' },
  { key: 'content',     icon: '📝', label: 'Nội dung' },
  { key: 'campaigns',   icon: '📢', label: 'Chiến dịch' },
  { key: 'commission',  icon: '💰', label: 'Hoa hồng & Rút tiền' },
  { key: 'automkt',     icon: '🤖', label: 'Marketing tự động' },
  { key: 'affiliate',   icon: '🔗', label: 'Affiliate & CRM' },
  { key: 'community',   icon: '👥', label: 'Cộng đồng' },
  { key: 'performance', icon: '📈', label: 'Hiệu suất & Thống kê' },
  { key: 'ranking',     icon: '🏆', label: 'Xếp hạng & Giải thưởng' },
  { key: 'token',       icon: '🪙', label: 'Creator Token' },
  { key: 'missions',    icon: '🎯', label: 'Nhiệm vụ & XP' },
  { key: 'convert',     icon: '🔄', label: 'Đổi XP → WK3' },
  { key: 'settings',    icon: '⚙️', label: 'Cài đặt' },
];

/* ═══════════════════════════════════════════════════ */
/*  BUYER DATA                                        */
/* ═══════════════════════════════════════════════════ */

/* ── Order data ──────────────────────────────────── */
interface OrderItem { name: string; qty: number; price: number; }
interface Order {
  id: string; date: string; items: OrderItem[]; total: number;
  status: 'pending' | 'confirmed' | 'packing' | 'shipping' | 'delivered' | 'cancelled' | 'return';
  payment: string; trackingCode?: string; reviewed?: boolean;
}

const allOrders: Order[] = [
  { id: 'ORD-2026-0147', date: '2026-03-25', items: [{ name: 'Trà Ô Long Đài Loan Premium', qty: 2, price: 194500 }], total: 389000, status: 'shipping', payment: 'VNPay', trackingCode: 'VN26032500147' },
  { id: 'ORD-2026-0143', date: '2026-03-23', items: [{ name: 'Serum Vitamin C 20%', qty: 1, price: 459000 }], total: 459000, status: 'delivered', payment: 'MoMo', reviewed: false },
  { id: 'ORD-2026-0138', date: '2026-03-21', items: [{ name: 'Cà Phê Arabica Đà Lạt', qty: 1, price: 245000 }], total: 245000, status: 'delivered', payment: 'Crypto', reviewed: true },
  { id: 'ORD-2026-0129', date: '2026-03-18', items: [{ name: 'Mật Ong Rừng Tây Nguyên', qty: 1, price: 285000 }], total: 285000, status: 'delivered', payment: 'VNPay', reviewed: true },
  { id: 'ORD-2026-0121', date: '2026-03-15', items: [{ name: 'Bột Collagen Cá Biển', qty: 1, price: 890000 }], total: 890000, status: 'delivered', payment: 'Crypto', reviewed: false },
  { id: 'ORD-2026-0115', date: '2026-03-12', items: [{ name: 'Dầu Dừa Nguyên Chất Bến Tre', qty: 2, price: 135000 }], total: 270000, status: 'confirmed', payment: 'MoMo' },
  { id: 'ORD-2026-0108', date: '2026-03-08', items: [{ name: 'Nước Mắm Phú Quốc', qty: 3, price: 95000 }, { name: 'Tiêu Đen Phú Quốc', qty: 1, price: 120000 }], total: 405000, status: 'pending', payment: 'VNPay' },
  { id: 'ORD-2026-0099', date: '2026-03-04', items: [{ name: 'Kem Chống Nắng SPF50+', qty: 1, price: 520000 }], total: 520000, status: 'cancelled', payment: 'MoMo' },
  { id: 'ORD-2026-0091', date: '2026-02-28', items: [{ name: 'Trà Hoa Cúc Organic', qty: 1, price: 175000 }], total: 175000, status: 'return', payment: 'VNPay' },
];

const orderStatusConfig: Record<string, { label: string; badge: string }> = {
  pending: { label: 'Chờ xác nhận', badge: 'badge-c7' },
  confirmed: { label: 'Đã xác nhận', badge: 'badge-c5' },
  packing: { label: 'Đang đóng gói', badge: 'badge-c5' },
  shipping: { label: 'Đang giao', badge: 'badge-c5' },
  delivered: { label: 'Đã giao', badge: 'badge-c4' },
  cancelled: { label: 'Đã hủy', badge: 'badge-rose' },
  return: { label: 'Đổi/Trả', badge: 'badge-c7' },
};

/* ── Tracking steps ──────────────────────────────── */
const trackingSteps = ['Đặt hàng', 'Xác nhận', 'Đang đóng gói', 'Đang vận chuyển', 'Đã giao'];
const getTrackingStep = (status: string): number => {
  switch (status) {
    case 'pending': return 0;
    case 'confirmed': return 1;
    case 'packing': return 2;
    case 'shipping': return 3;
    case 'delivered': return 4;
    default: return -1;
  }
};

/* ── Payment data ────────────────────────────────── */
const savedPaymentMethods = [
  { id: 1, type: 'VNPay', label: 'VNPay - Ngân hàng Vietcombank', last4: '••••4821', isDefault: true },
  { id: 2, type: 'MoMo', label: 'MoMo - 0912 345 678', last4: '', isDefault: false },
  { id: 3, type: 'Bank', label: 'Visa •••• 6789', last4: '6789', isDefault: false },
];

const cryptoBalances = [
  { token: 'MATIC', amount: '245.50', usd: '$196.40', icon: 'M', color: 'var(--c7-500)' },
  { token: 'USDT', amount: '1,250.00', usd: '$1,250.00', icon: 'U', color: 'var(--c4-500)' },
  { token: 'WK', amount: '8,420', usd: '$842.00', icon: 'W', color: 'var(--c6-500)' },
];

/* ── WK Pay data ─────────────────────────────────── */
const wkPayData = {
  balanceVND: 2450000,
  balanceWK: 8420,
  wkPrice: 0.10,
  wkChange24h: +3.2,
  transactions: [
    { id: 'WKT-001', type: 'Nạp tiền', source: 'Vietcombank', amount: 1000000, date: '2026-03-24', status: 'success' },
    { id: 'WKT-002', type: 'Thanh toán', source: 'ORD-2026-0108', amount: -405000, date: '2026-03-08', status: 'success' },
    { id: 'WKT-003', type: 'Nhận WK Token', source: 'Reward Lv.7', amount: 200, date: '2026-03-20', status: 'success' },
    { id: 'WKT-004', type: 'Chuyển WK Token', source: 'Tới 0x8a1...f3c2', amount: -50, date: '2026-03-18', status: 'success' },
    { id: 'WKT-005', type: 'Rút tiền', source: 'Vietcombank', amount: -500000, date: '2026-03-15', status: 'success' },
  ],
};

/* ── Favorites ───────────────────────────────────── */
const favoriteProducts = [
  { id: 1, name: 'Trà Ô Long Đài Loan Premium', price: 389000, rating: 4.9, reviews: 234, vendor: 'WellKOC Origin', emoji: '🍵', alert: false },
  { id: 2, name: 'Serum Vitamin C 20%', price: 459000, rating: 4.8, reviews: 189, vendor: 'K-Beauty VN', emoji: '✨', alert: true },
  { id: 3, name: 'Mật Ong Rừng Tây Nguyên', price: 285000, rating: 4.7, reviews: 156, vendor: 'GreenViet', emoji: '🍯', alert: false },
  { id: 4, name: 'Cà Phê Arabica Đà Lạt', price: 245000, rating: 4.9, reviews: 312, vendor: 'Đà Lạt Farm', emoji: '☕', alert: true },
  { id: 5, name: 'Nước Mắm Phú Quốc Truyền Thống', price: 95000, rating: 4.6, reviews: 478, vendor: 'Phú Quốc Authentic', emoji: '🐟', alert: false },
  { id: 6, name: 'Bột Collagen Cá Biển', price: 890000, rating: 4.5, reviews: 98, vendor: 'Sea Beauty', emoji: '💎', alert: false },
];

/* ═══════════════════════════════════════════════════ */
/*  KOC PRO DATA                                      */
/* ═══════════════════════════════════════════════════ */

/* ── KPI data ────────────────────────────────────── */
const kpiData = [
  { label: 'Hoa hồng tháng', value: '12.8M₫', delta: '+18%', up: true, color: 'var(--c4-500)' },
  { label: 'Doanh thu affiliate', value: '45.2M₫', delta: '+23% MoM', up: true, color: 'var(--c5-500)' },
  { label: 'Conversions', value: '1,247', delta: '+156 tuần', up: true, color: 'var(--c6-500)' },
  { label: 'Followers', value: '12,847', delta: '+892 tháng', up: true, color: 'var(--c7-500)' },
  { label: 'XP Points', value: '24,450', delta: 'Level 18', up: true, color: 'var(--gold-400)' },
];

/* ── Overview chart data ─────────────────────────── */
const monthlyBars = [45, 62, 38, 75, 89, 52, 70, 85, 60, 95, 78, 88];
const monthLabels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const recentActivities = [
  { time: '10 phút trước', text: 'Đơn hàng #TX-092 xác nhận — hoa hồng +185.000₫', color: 'var(--c4-500)' },
  { time: '1 giờ trước', text: 'Video "Review Serum C" đạt 5.000 views', color: 'var(--c5-500)' },
  { time: '3 giờ trước', text: 'Agent Content AI hoàn thành 12 bài viết', color: 'var(--c6-500)' },
  { time: '5 giờ trước', text: 'Nhận badge "Top KOC Tuần" — +500 XP', color: 'var(--gold-400)' },
  { time: 'Hôm qua', text: 'Rút 5.000.000₫ về Vietcombank — thành công', color: 'var(--c7-500)' },
  { time: 'Hôm qua', text: 'Khách hàng mới F1: Nguyễn Thị Mai', color: 'var(--c4-500)' },
];

/* ── Content posts ───────────────────────────────── */
const contentPosts = [
  { id: 1, type: 'review', title: 'Review Trà Ô Long Đài Loan - Hương vị authentic', date: '2026-03-25', views: 3245, likes: 187, comments: 42, revenue: '1.2M₫', emoji: '🍵' },
  { id: 2, type: 'video', title: 'Unboxing Serum Vitamin C - So sánh 3 loại', date: '2026-03-23', views: 5678, likes: 312, comments: 89, revenue: '2.1M₫', emoji: '🎬' },
  { id: 3, type: 'review', title: 'Mật ong rừng Tây Nguyên có thật sự organic?', date: '2026-03-21', views: 4123, likes: 256, comments: 67, revenue: '980K₫', emoji: '🍯' },
  { id: 4, type: 'article', title: 'Top 5 sản phẩm skincare organic tốt nhất 2026', date: '2026-03-18', views: 8945, likes: 523, comments: 134, revenue: '3.5M₫', emoji: '📝' },
  { id: 5, type: 'video', title: 'Livestream Q&A - Cách bắt đầu với KOC', date: '2026-03-15', views: 12340, likes: 890, comments: 256, revenue: '0₫', emoji: '📺' },
];

/* ── Campaigns ───────────────────────────────────── */
const campaigns = [
  { id: 1, name: 'Spring Sale 2026', brand: 'WellKOC Origin', status: 'active', commission: '20%', earned: '1.2M₫', startDate: '2026-03-01', endDate: '2026-03-31' },
  { id: 2, name: 'Organic Week', brand: 'GreenViet', status: 'active', commission: '25%', earned: '890K₫', startDate: '2026-03-15', endDate: '2026-03-22' },
  { id: 3, name: 'Tết Holiday', brand: 'Multiple', status: 'completed', commission: '18%', earned: '3.4M₫', startDate: '2026-01-15', endDate: '2026-02-15' },
  { id: 4, name: 'Beauty Festival', brand: 'K-Beauty VN', status: 'upcoming', commission: '22%', earned: '—', startDate: '2026-04-01', endDate: '2026-04-15' },
];
const campaignStatusConfig: Record<string, { label: string; badge: string }> = {
  active: { label: 'Đang chạy', badge: 'badge-c4' },
  completed: { label: 'Hoàn thành', badge: 'badge-c5' },
  upcoming: { label: 'Sắp tới', badge: 'badge-gold' },
};

/* ── Commission data ─────────────────────────────── */
const commissionData = [
  { id: 'TX-001', product: 'Trà Ô Long Premium', buyer: 'Nguyễn Văn A', amount: '389.000₫', commission: '70.020₫', rate: '18%', status: 'confirmed', date: '2026-03-25', txHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12' },
  { id: 'TX-002', product: 'Serum Vitamin C', buyer: 'Trần Thị B', amount: '459.000₫', commission: '100.980₫', rate: '22%', status: 'pending', date: '2026-03-24', txHash: '' },
  { id: 'TX-003', product: 'Mật Ong Rừng', buyer: 'Lê Văn C', amount: '285.000₫', commission: '42.750₫', rate: '15%', status: 'confirmed', date: '2026-03-24', txHash: '0x7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y' },
  { id: 'TX-004', product: 'Cà Phê Arabica', buyer: 'Phạm Thị D', amount: '245.000₫', commission: '49.000₫', rate: '20%', status: 'processing', date: '2026-03-23', txHash: '' },
  { id: 'TX-005', product: 'Bột Collagen', buyer: 'Hoàng Văn E', amount: '890.000₫', commission: '222.500₫', rate: '25%', status: 'confirmed', date: '2026-03-23', txHash: '0x9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c' },
];
const commStatusConfig: Record<string, { label: string; badge: string }> = {
  confirmed: { label: 'Đã xác nhận', badge: 'badge-c4' },
  pending: { label: 'Chờ duyệt', badge: 'badge-gold' },
  processing: { label: 'Đang xử lý', badge: 'badge-c5' },
};

/* ── Withdrawal history ──────────────────────────── */
const withdrawalHistory = [
  { id: 'W-001', method: 'Vietcombank', amount: '5.000.000₫', fee: '25.000₫', status: 'completed', date: '2026-03-20', note: 'VCB **** 1234' },
  { id: 'W-002', method: 'MoMo', amount: '2.000.000₫', fee: '10.000₫', status: 'completed', date: '2026-03-15', note: '0909****567' },
  { id: 'W-003', method: 'USDT (Polygon)', amount: '150 USDT', fee: '0.5 USDT', status: 'completed', date: '2026-03-10', note: '0xA1B2...5678' },
  { id: 'W-004', method: 'VNPay', amount: '1.500.000₫', fee: '7.500₫', status: 'pending', date: '2026-03-26', note: 'VNPay Wallet' },
];

/* ── Auto MKT Agents ─────────────────────────────── */
const mktAgents = [
  { id: 1, name: 'Content AI Writer', type: 'Content AI', status: 'running', budget: '500.000₫', spent: '320.000₫', schedule: 'Hàng ngày 8:00', impressions: 45200, clicks: 3420, conversions: 187, cost: '320.000₫', roi: '+285%' },
  { id: 2, name: 'Social Engagement Bot', type: 'Social Bot', status: 'running', budget: '300.000₫', spent: '180.000₫', schedule: '24/7', impressions: 28900, clicks: 2100, conversions: 95, cost: '180.000₫', roi: '+210%' },
  { id: 3, name: 'Analytics Reporter', type: 'Analytics', status: 'paused', budget: '200.000₫', spent: '150.000₫', schedule: 'Thứ 2 hàng tuần', impressions: 0, clicks: 0, conversions: 0, cost: '150.000₫', roi: 'N/A' },
  { id: 4, name: 'Email Nurture Flow', type: 'Email AI', status: 'completed', budget: '400.000₫', spent: '400.000₫', schedule: 'Hoàn thành', impressions: 12500, clicks: 1890, conversions: 234, cost: '400.000₫', roi: '+340%' },
];
const agentTypes = ['Content AI', 'Analytics', 'Social Bot', 'Email AI', 'SEO Optimizer', 'Ad Manager'];
const agentStatusConfig: Record<string, { label: string; badge: string }> = {
  running: { label: 'Đang chạy', badge: 'badge-c4' },
  paused: { label: 'Tạm dừng', badge: 'badge-gold' },
  completed: { label: 'Hoàn thành', badge: 'badge-c5' },
};

/* ── Affiliate & CRM ─────────────────────────────── */
const affiliateLinks = [
  { id: 1, product: 'Trà Ô Long Premium', link: 'https://wellkoc.vn/r/mh-tra-001', clicks: 1245, conversions: 89, revenue: '4.2M₫' },
  { id: 2, product: 'Serum Vitamin C', link: 'https://wellkoc.vn/r/mh-serum-002', clicks: 2340, conversions: 156, revenue: '8.9M₫' },
  { id: 3, product: 'Bột Collagen Fish', link: 'https://wellkoc.vn/r/mh-collagen-003', clicks: 890, conversions: 45, revenue: '2.8M₫' },
];
const partnerStats = { f1: 47, f2: 189, totalNetwork: 1245 };
const crmCustomers = [
  { id: 1, name: 'Nguyễn Thị Mai', email: 'mai.nt@gmail.com', orders: 12, totalSpend: '3.450.000₫', lastPurchase: '2026-03-25' },
  { id: 2, name: 'Trần Văn Hùng', email: 'hung.tv@gmail.com', orders: 8, totalSpend: '2.180.000₫', lastPurchase: '2026-03-23' },
  { id: 3, name: 'Lê Thị Hoa', email: 'hoa.lt@gmail.com', orders: 15, totalSpend: '5.670.000₫', lastPurchase: '2026-03-24' },
  { id: 4, name: 'Phạm Quốc Bảo', email: 'bao.pq@gmail.com', orders: 5, totalSpend: '1.290.000₫', lastPurchase: '2026-03-20' },
  { id: 5, name: 'Hoàng Thị Lan', email: 'lan.ht@gmail.com', orders: 22, totalSpend: '8.900.000₫', lastPurchase: '2026-03-26' },
];

/* ── Community ───────────────────────────────────── */
const communityStats = { totalMembers: 4827, newThisMonth: 342, activeRate: '68.5%' };
const communityMembers = [
  { id: 1, name: 'Nguyễn Văn Anh', joinDate: '2026-01-15', tier: 'Gold', purchases: 18, status: 'active' },
  { id: 2, name: 'Trần Thị Bích', joinDate: '2026-02-08', tier: 'Silver', purchases: 9, status: 'active' },
  { id: 3, name: 'Lê Hoàng Nam', joinDate: '2025-11-20', tier: 'Platinum', purchases: 45, status: 'active' },
  { id: 4, name: 'Phạm Minh Tú', joinDate: '2026-03-01', tier: 'Bronze', purchases: 3, status: 'inactive' },
  { id: 5, name: 'Đỗ Thị Hương', joinDate: '2025-12-10', tier: 'Gold', purchases: 24, status: 'active' },
];

/* ── Performance ─────────────────────────────────── */
const perfKpis = [
  { label: 'Tổng khách hàng', value: '4,827', color: 'var(--c4-500)' },
  { label: 'Khách hàng mới', value: '342', color: 'var(--c5-500)' },
  { label: 'Số người mua hàng', value: '1,892', color: 'var(--c6-500)' },
  { label: 'Tỷ lệ chuyển đổi', value: '12.3%', color: 'var(--c7-500)' },
  { label: 'Doanh thu/khách', value: '289.000₫', color: 'var(--gold-400)' },
];
const funnelSteps = [
  { label: 'Lượt truy cập', value: 48500, pct: 100 },
  { label: 'Xem sản phẩm', value: 22400, pct: 46 },
  { label: 'Thêm giỏ hàng', value: 8900, pct: 18 },
  { label: 'Thanh toán', value: 4827, pct: 10 },
];

/* ── Ranking & Rewards ───────────────────────────── */
const myRank = { rank: 47, total: 12847, tier: 'Diamond', xp: 24450, revenue: '245.000.000₫' };
const leaderboard = [
  { rank: 1, name: 'Trần Khánh Linh', revenue: '1.2B₫', commission: '180M₫', badges: 24, tier: 'Legend' },
  { rank: 2, name: 'Nguyễn Đức Mạnh', revenue: '890M₫', commission: '134M₫', badges: 21, tier: 'Legend' },
  { rank: 3, name: 'Phạm Thu Hà', revenue: '720M₫', commission: '108M₫', badges: 19, tier: 'Diamond' },
  { rank: 4, name: 'Lê Quang Huy', revenue: '650M₫', commission: '97M₫', badges: 18, tier: 'Diamond' },
  { rank: 5, name: 'Vũ Thị Ngọc', revenue: '580M₫', commission: '87M₫', badges: 17, tier: 'Diamond' },
  { rank: 6, name: 'Đặng Minh Tuấn', revenue: '510M₫', commission: '76M₫', badges: 15, tier: 'Master' },
  { rank: 7, name: 'Hoàng Thùy Dung', revenue: '480M₫', commission: '72M₫', badges: 14, tier: 'Master' },
  { rank: 8, name: 'Bùi Văn Toàn', revenue: '420M₫', commission: '63M₫', badges: 13, tier: 'Master' },
  { rank: 9, name: 'Ngô Thị Yến', revenue: '380M₫', commission: '57M₫', badges: 12, tier: 'Master' },
  { rank: 10, name: 'Trương Công Sơn', revenue: '350M₫', commission: '52M₫', badges: 11, tier: 'Master' },
];
const gamificationBadges = [
  { icon: '🏅', name: 'Đơn Hàng Đầu Tiên', earned: true },
  { icon: '💯', name: '100 Đơn Hàng', earned: true },
  { icon: '🔥', name: 'Top KOC Tuần', earned: true },
  { icon: '⭐', name: '1000 Followers', earned: true },
  { icon: '🎯', name: 'Conversion Master', earned: true },
  { icon: '📹', name: 'Video Viral 10K', earned: true },
  { icon: '💎', name: 'Diamond KOC', earned: true },
  { icon: '🌟', name: 'Community Leader', earned: false },
  { icon: '🏆', name: 'Top 10 Tháng', earned: false },
  { icon: '👑', name: 'Legend KOC', earned: false },
];

const careerRewards = [
  {
    tier: 'Bronze', icon: '🎁', title: 'Quà tặng đặc biệt',
    description: 'Gift package trị giá 5.000.000₫ — bộ sản phẩm WellKOC Premium',
    target: 50000000, current: 245000000,
    gradient: 'linear-gradient(135deg, #cd7f32 0%, #e8a855 50%, #cd7f32 100%)',
    glow: '0 0 30px rgba(205,127,50,0.3)',
  },
  {
    tier: 'Silver', icon: '🏍️', title: 'Xe máy Honda Vision',
    description: 'Honda Vision phiên bản giới hạn — trị giá 35.000.000₫',
    target: 500000000, current: 245000000,
    gradient: 'linear-gradient(135deg, #8a9bb0 0%, #c0c8d4 40%, #dce3eb 60%, #8a9bb0 100%)',
    glow: '0 0 30px rgba(192,200,212,0.3)',
  },
  {
    tier: 'Gold', icon: '🚗', title: 'Ô tô VinFast VF5',
    description: 'VinFast VF5 Plus — trị giá 500.000.000₫',
    target: 2000000000, current: 245000000,
    gradient: 'linear-gradient(135deg, #b8860b 0%, #ffd700 40%, #fff4a3 60%, #b8860b 100%)',
    glow: '0 0 40px rgba(255,215,0,0.35)',
  },
  {
    tier: 'Platinum', icon: '🏠', title: 'Căn hộ WellKOC Residence',
    description: 'Căn hộ cao cấp WellKOC Residence — trị giá 2.000.000.000₫',
    target: 10000000000, current: 245000000,
    gradient: 'linear-gradient(135deg, #4a6741 0%, #7fb069 30%, #b8d4a3 60%, #4a6741 100%)',
    glow: '0 0 40px rgba(127,176,105,0.3)',
  },
  {
    tier: 'Diamond', icon: '💎', title: 'ESOP 0.1% cổ phần WellKOC',
    description: 'Sở hữu 0.1% cổ phần công ty WellKOC — cổ đông chính thức',
    target: 50000000000, current: 245000000,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #4a69bd 30%, #82ccdd 50%, #b8e0f0 70%, #4a69bd 100%)',
    glow: '0 0 50px rgba(74,105,189,0.4)',
  },
  {
    tier: 'Legend', icon: '👑', title: 'ESOP 0.5% + Đồng sáng lập danh dự',
    description: 'Cổ phần 0.5% WellKOC + Danh hiệu Đồng sáng lập danh dự vĩnh viễn',
    target: 200000000000, current: 245000000,
    gradient: 'linear-gradient(135deg, #1a0a2e 0%, #6c2dc7 20%, #b266ff 40%, #ffd700 60%, #ff6b6b 80%, #6c2dc7 100%)',
    glow: '0 0 60px rgba(108,45,199,0.5), 0 0 120px rgba(255,215,0,0.2)',
  },
];

/* ── Creator Token ───────────────────────────────── */
const creatorToken = {
  name: '$WK', fullName: 'WK Creator Token', symbol: 'WK',
  totalSupply: '1,000,000', circulatingSupply: '125,000',
  price: '0.045 USDT', priceChange: '+12.5%',
  holders: 847, marketCap: '$5,625', chain: 'Polygon',
  contractAddress: '0xToken...7890',
};
const tokenHolders = [
  { address: '0xFan1...A1B2', amount: '12,500', pct: '10.0%' },
  { address: '0xFan2...C3D4', amount: '8,750', pct: '7.0%' },
  { address: '0xFan3...E5F6', amount: '6,250', pct: '5.0%' },
  { address: '0xFan4...G7H8', amount: '5,000', pct: '4.0%' },
  { address: '0xPool...I9J0', amount: '92,500', pct: '74.0%' },
];

/* ── Settings ────────────────────────────────────── */
const settingsSections = [
  { title: 'Hồ sơ KOC', fields: [{ label: 'Tên', value: 'Minh Hương' }, { label: 'Handle', value: '@minhhuong.koc' }, { label: 'Bio', value: 'KOC chuyên review organic & wellness' }] },
  { title: 'Địa chỉ giao hàng', fields: [{ label: 'Mặc định', value: '123 Nguyễn Huệ, Q.1, TP.HCM' }, { label: 'SĐT', value: '0912 345 678' }] },
  { title: 'Tài khoản ngân hàng', fields: [{ label: 'Ngân hàng', value: 'Vietcombank **** 1234' }, { label: 'Chủ TK', value: 'MINH HUONG' }] },
  { title: 'WK Pay KYC', fields: [{ label: 'Trạng thái', value: 'Đã xác minh' }, { label: 'Ví', value: '0xA1B2...5678' }] },
  { title: 'Blockchain', fields: [{ label: 'Chain chính', value: 'Polygon' }, { label: 'Auto-claim', value: 'Bật' }] },
  { title: 'Bảo mật', fields: [{ label: '2FA', value: 'Đã bật' }, { label: 'Mật khẩu', value: '••••••••' }, { label: 'Session', value: '30 phút' }] },
];

/* ── Voucher data ────────────────────────────────── */
const myVouchers = [
  { code: 'WELLKOC50', desc: 'Giảm 50.000₫ cho đơn từ 200K', expires: '30/04/2026', used: false },
  { code: 'FREESHIP', desc: 'Miễn phí vận chuyển', expires: '15/04/2026', used: false },
  { code: 'DPP20', desc: 'Giảm 20% sản phẩm DPP Verified', expires: '25/04/2026', used: false },
];
const voucherRedeemOptions = [
  { xp: 50, desc: 'Voucher giảm 20.000₫', minOrder: '100K' },
  { xp: 200, desc: 'Voucher giảm 100.000₫', minOrder: '500K' },
  { xp: 500, desc: 'Voucher Free Ship', minOrder: '0₫' },
  { xp: 1000, desc: 'Voucher giảm 500.000₫', minOrder: '1M' },
];

/* ── Shared sub-components ───────────────────────── */
const TH = ({ children }: { children: string }) => (
  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{children}</th>
);
const TD = ({ children, mono, bold, color, style: s }: { children: React.ReactNode; mono?: boolean; bold?: boolean; color?: string; style?: React.CSSProperties }) => (
  <td style={{ padding: '12px 14px', fontFamily: mono ? 'var(--ff-display)' : undefined, fontWeight: bold ? 700 : undefined, color, ...s }}>{children}</td>
);

/* ══════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                   */
/* ══════════════════════════════════════════════════ */
export default function KOC() {
  const [activeNav, setActiveNav] = useState('overview');
  const [orderTab, setOrderTab] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  const [settingsTab, setSettingsTab] = useState('profile');

  /* ── Order helpers ─── */
  const orderTabMap: Record<string, string[]> = {
    all: [],
    pending: ['pending'],
    shipping: ['confirmed', 'packing', 'shipping'],
    delivered: ['delivered'],
    cancelled: ['cancelled'],
    return: ['return'],
  };
  const filteredOrders = orderTab === 'all' ? allOrders : allOrders.filter(o => orderTabMap[orderTab]?.includes(o.status));
  const activeTrackingOrders = allOrders.filter(o => ['pending', 'confirmed', 'packing', 'shipping'].includes(o.status));
  const pendingOrderCount = allOrders.filter(o => ['pending', 'confirmed', 'packing', 'shipping'].includes(o.status)).length;
  const filteredHistory = allOrders.filter(o => {
    if (!historySearch) return true;
    const q = historySearch.toLowerCase();
    return o.id.toLowerCase().includes(q) || o.items.some(it => it.name.toLowerCase().includes(q));
  });

  /* ── Tab renderer ──────────────────────────────── */
  const renderContent = () => {
    switch (activeNav) {

      /* ═══════════════════════════════════════════════ */
      /*  BUYER FEATURES                                 */
      /* ═══════════════════════════════════════════════ */

      /* ══════ 1. ĐƠN HÀNG CỦA TÔI ══════ */
      case 'orders':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Đơn Hàng Của Tôi</h2>
            <div className="flex gap-8" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'pending', label: 'Chờ xác nhận' },
                { key: 'shipping', label: 'Đang giao' },
                { key: 'delivered', label: 'Đã giao' },
                { key: 'cancelled', label: 'Đã hủy' },
                { key: 'return', label: 'Đổi/Trả' },
              ].map(t => (
                <button key={t.key} className={`btn btn-sm ${orderTab === t.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setOrderTab(t.key)}>
                  {t.label}
                  {t.key !== 'all' && <span style={{ marginLeft: 4, opacity: .7 }}>({allOrders.filter(o => orderTabMap[t.key]?.includes(o.status)).length})</span>}
                </button>
              ))}
            </div>
            {filteredOrders.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Không có đơn hàng nào</div>
            ) : (
              <div className="flex-col gap-12">
                {filteredOrders.map(order => {
                  const sc = orderStatusConfig[order.status];
                  return (
                    <div key={order.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
                        <div className="flex gap-12" style={{ alignItems: 'center' }}>
                          <span style={{ fontSize: '.78rem', fontWeight: 600 }} className="mono">{order.id}</span>
                          <span style={{ fontSize: '.68rem', color: 'var(--text-4)' }}>{order.date}</span>
                        </div>
                        <span className={`badge ${sc.badge}`}>{sc.label}</span>
                      </div>
                      <div style={{ padding: '14px 20px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex" style={{ justifyContent: 'space-between', marginBottom: idx < order.items.length - 1 ? 8 : 0 }}>
                            <div>
                              <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{item.name}</span>
                              <span style={{ fontSize: '.72rem', color: 'var(--text-3)', marginLeft: 8 }}>x{item.qty}</span>
                            </div>
                            <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{formatVND(item.price)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
                        <div className="flex gap-8">
                          {order.status === 'delivered' && !order.reviewed && (
                            <button className="btn btn-primary btn-sm">Đánh giá</button>
                          )}
                          <button className="btn btn-secondary btn-sm">Mua lại</button>
                          {order.trackingCode && (
                            <button className="btn btn-secondary btn-sm" onClick={() => setActiveNav('tracking')}>Theo dõi</button>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>Tổng: </span>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--c4-500)' }}>{formatVND(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );

      /* ══════ 2. THEO DÕI ĐƠN HÀNG ══════ */
      case 'tracking':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Theo Dõi Đơn Hàng</h2>
            {activeTrackingOrders.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Không có đơn hàng đang vận chuyển</div>
            ) : (
              <div className="flex-col gap-16">
                {activeTrackingOrders.map(order => {
                  const step = getTrackingStep(order.status);
                  return (
                    <div key={order.id} className="card" style={{ padding: 24 }}>
                      <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
                        <div>
                          <div className="mono" style={{ fontWeight: 700, fontSize: '.88rem' }}>{order.id}</div>
                          <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{order.items[0].name}{order.items.length > 1 ? ` (+${order.items.length - 1})` : ''}</div>
                        </div>
                        {order.trackingCode && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>Mã vận đơn</div>
                            <div className="mono" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--c5-400)' }}>{order.trackingCode}</div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 14, left: 20, right: 20, height: 3, background: 'var(--border)', zIndex: 0 }}>
                          <div style={{ width: `${(step / (trackingSteps.length - 1)) * 100}%`, height: '100%', background: 'var(--c4-500)', transition: 'width .4s ease' }} />
                        </div>
                        {trackingSteps.map((s, i) => {
                          const isActive = i <= step;
                          const isCurrent = i === step;
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                              <div style={{
                                width: isCurrent ? 30 : 24, height: isCurrent ? 30 : 24,
                                borderRadius: '50%',
                                background: isActive ? 'var(--c4-500)' : 'var(--bg-2)',
                                border: isCurrent ? '3px solid var(--c4-300)' : isActive ? '2px solid var(--c4-500)' : '2px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '.6rem', color: isActive ? '#fff' : 'var(--text-4)', fontWeight: 700,
                                transition: 'all .3s ease',
                              }}>
                                {isActive ? '✓' : i + 1}
                              </div>
                              <div style={{ fontSize: '.65rem', fontWeight: isCurrent ? 700 : 400, color: isActive ? 'var(--text-1)' : 'var(--text-4)', marginTop: 8, textAlign: 'center' }}>{s}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );

      /* ══════ 3. LỊCH SỬ MUA HÀNG ══════ */
      case 'history':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Lịch Sử Mua Hàng</h2>
            <div className="flex gap-8" style={{ marginBottom: 20 }}>
              <input type="text" placeholder="Tìm kiếm sản phẩm hoặc mã đơn..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: '.82rem' }} />
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <TH>Ngày</TH><TH>Mã đơn</TH><TH>Sản phẩm</TH><TH>Tổng</TH><TH>Trạng thái</TH><TH>Hành động</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map(o => {
                      const sc = orderStatusConfig[o.status];
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <TD style={{ color: 'var(--text-3)' }}>{o.date}</TD>
                          <TD mono>{o.id}</TD>
                          <TD>{o.items.map(it => it.name).join(', ')}</TD>
                          <TD bold>{formatVND(o.total)}</TD>
                          <TD><span className={`badge ${sc.badge}`}>{sc.label}</span></TD>
                          <TD><button className="btn btn-primary btn-sm">Mua lại</button></TD>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      /* ══════ 4. VÍ WK PAY ══════ */
      case 'wkpay':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Ví WK Pay</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div className="onchain-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>Số dư VND</div>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--c4-500)' }}>{formatVND(wkPayData.balanceVND)}</div>
              </div>
              <div className="onchain-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>WK Token</div>
                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--c6-500)' }}>{wkPayData.balanceWK.toLocaleString()} WK</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Nạp tiền', desc: 'Từ ngân hàng/MoMo', icon: '💰' },
                { label: 'Rút tiền', desc: 'Về ngân hàng', icon: '🏦' },
                { label: 'Chuyển WK Token', desc: 'Tới ví khác', icon: '📤' },
              ].map((a, i) => (
                <div key={i} className="card card-hover" style={{ padding: 16, textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: '.82rem', marginBottom: 2 }}>{a.label}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>{a.desc}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <div style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: 12 }}>Thông tin WK Token</div>
              <div className="flex gap-16" style={{ flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>Giá hiện tại</div>
                  <div style={{ fontWeight: 700 }}>${wkPayData.wkPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>24h thay đổi</div>
                  <div style={{ fontWeight: 700, color: wkPayData.wkChange24h > 0 ? 'var(--c4-500)' : 'var(--text-1)' }}>
                    {wkPayData.wkChange24h > 0 ? '+' : ''}{wkPayData.wkChange24h}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>Giá trị nắm giữ</div>
                  <div style={{ fontWeight: 700 }}>${(wkPayData.balanceWK * wkPayData.wkPrice).toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: 12 }}>Lịch sử giao dịch</div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <TH>Mã GD</TH><TH>Loại</TH><TH>Chi tiết</TH><TH>Số tiền</TH><TH>Ngày</TH><TH>Trạng thái</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {wkPayData.transactions.map(tx => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <TD mono>{tx.id}</TD>
                        <TD>{tx.type}</TD>
                        <TD style={{ color: 'var(--text-3)', fontSize: '.72rem' }}>{tx.source}</TD>
                        <TD bold style={{ color: tx.amount > 0 ? 'var(--c4-500)' : 'var(--text-1)' }}>
                          {tx.amount > 0 ? '+' : ''}{typeof tx.amount === 'number' && Math.abs(tx.amount) > 1000 ? formatVND(Math.abs(tx.amount)) : `${tx.amount} WK`}
                        </TD>
                        <TD style={{ color: 'var(--text-3)' }}>{tx.date}</TD>
                        <TD><span className="badge badge-c4">Thành công</span></TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      /* ══════ 5. THANH TOÁN ══════ */
      case 'payments':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Thanh Toán</h2>
            <div style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: 12 }}>Phương thức thanh toán đã lưu</div>
            <div className="flex-col gap-8" style={{ marginBottom: 24 }}>
              {savedPaymentMethods.map(m => (
                <div key={m.id} className="card" style={{ padding: '14px 20px' }}>
                  <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex gap-12" style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>{m.type === 'VNPay' ? '🏦' : m.type === 'MoMo' ? '📱' : '💳'}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{m.label}</div>
                        {m.isDefault && <span className="badge badge-c4" style={{ fontSize: '.55rem' }}>Mặc định</span>}
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: '.7rem' }}>Xóa</button>
                  </div>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>+ Thêm phương thức</button>
            </div>

            <div style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: 12 }}>Ví Crypto</div>
            <div className="kpi-grid" style={{ marginBottom: 24 }}>
              {cryptoBalances.map((b, i) => (
                <div key={i} className="kpi-card">
                  <div className="flex gap-8" style={{ marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: '#fff' }}>{b.icon}</div>
                    <div className="kpi-label">{b.token}</div>
                  </div>
                  <div className="kpi-val" style={{ color: b.color }}>{b.amount}</div>
                  <div className="kpi-delta delta-up">{b.usd}</div>
                </div>
              ))}
            </div>
          </>
        );

      /* ══════ 6. KHO VOUCHER ══════ */
      case 'vouchers':
        return (
          <>
            <div className="card" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, rgba(168,85,247,.08), rgba(99,102,241,.08))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: 4 }}>XP hiện tại</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--c7-500)' }}>24,450 XP</div>
                </div>
                <Link to="#" onClick={(e) => { e.preventDefault(); setActiveNav('convert'); }} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--c7-500)', color: '#fff', textDecoration: 'none', fontSize: '.82rem', fontWeight: 600 }}>Đổi XP →</Link>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-1)' }}>Đổi XP lấy Voucher</h3>
            <div className="grid-3" style={{ marginBottom: 24 }}>
              {voucherRedeemOptions.map((v, i) => (
                <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c6-500)', marginBottom: 4 }}>{v.xp} XP</div>
                  <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{v.desc}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text-4)', marginBottom: 10 }}>Đơn tối thiểu: {v.minOrder}</div>
                  <button className="btn btn-primary" style={{ width: '100%', padding: '6px 12px', fontSize: '.78rem' }}>Đổi ngay</button>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-1)' }}>Voucher đang có</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myVouchers.filter(v => !v.used).map((v, i) => (
                <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--c5-500)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--ff-mono)', fontSize: '.85rem', fontWeight: 700, color: 'var(--c5-500)', marginBottom: 2 }}>{v.code}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--text-2)' }}>{v.desc}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-4)', marginTop: 2 }}>HSD: {v.expires}</div>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: '.75rem', padding: '6px 12px' }}>Dùng ngay</button>
                </div>
              ))}
            </div>
          </>
        );

      /* ══════ 7. YÊU THÍCH ══════ */
      case 'favorites':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Sản Phẩm Yêu Thích</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {favoriteProducts.map(p => (
                <div key={p.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '1.2rem', cursor: 'pointer', color: '#ef4444', zIndex: 1 }}>❤️</div>
                  <div style={{ background: 'var(--bg-1)', padding: 24, textAlign: 'center', fontSize: '2.5rem' }}>{p.emoji}</div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: '.82rem', marginBottom: 4, minHeight: '2.2em' }}>{p.name}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-3)', marginBottom: 6 }}>{p.vendor}</div>
                    <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Stars count={Math.round(p.rating)} size=".72rem" />
                      <span style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>{p.reviews} đánh giá</span>
                    </div>
                    <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--c4-500)' }}>{formatVND(p.price)}</span>
                      {p.alert && <span className="badge badge-c5" style={{ fontSize: '.55rem' }}>Giá giảm!</span>}
                    </div>
                    <div className="flex gap-8">
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>Thêm vào giỏ</button>
                      <button className="btn btn-secondary btn-sm" style={{ fontSize: '.65rem' }}>Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      /* ═══════════════════════════════════════════════ */
      /*  KOC PRO FEATURES                              */
      /* ═══════════════════════════════════════════════ */

      /* ══════ 8. TỔNG QUAN KOC ══════ */
      case 'overview':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
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
            <div className="chart-bar-wrap" style={{ marginBottom: 24 }}>
              <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="label">DOANH THU 12 THÁNG GẦN ĐÂY</span>
                <span className="badge badge-c4">+23.5% YoY</span>
              </div>
              <div className="chart-bars">
                {monthlyBars.map((v, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${v}%` }} />
                ))}
              </div>
              <div className="flex" style={{ justifyContent: 'space-between', marginTop: 6 }}>
                {monthLabels.map(m => (
                  <span key={m} style={{ flex: 1, textAlign: 'center', fontSize: '.58rem', color: 'var(--text-4)' }}>{m}</span>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="label" style={{ marginBottom: 14 }}>HOẠT ĐỘNG GẦN ĐÂY</div>
              <div className="flex-col gap-10">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex gap-12" style={{ padding: '8px 0', borderBottom: i < recentActivities.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.82rem' }}>{a.text}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--text-4)', marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      /* ══════ 9. NỘI DUNG ══════ */
      case 'content':
        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Quản Lý Nội Dung</h2>
              <button className="btn btn-primary btn-sm">+ Tạo nội dung mới</button>
            </div>
            <div className="flex-col gap-12">
              {contentPosts.map(post => (
                <div key={post.id} className="card card-hover" style={{ padding: '18px 24px' }}>
                  <div className="flex" style={{ justifyContent: 'space-between', gap: 16 }}>
                    <div className="flex gap-12" style={{ flex: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>{post.emoji}</span>
                      <div>
                        <div className="flex gap-8" style={{ marginBottom: 4 }}>
                          <span className="badge badge-c6" style={{ textTransform: 'uppercase' }}>{post.type}</span>
                          <span style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>{post.date}</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '.88rem', marginBottom: 8 }}>{post.title}</div>
                        <div className="flex gap-16" style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>
                          <span>👁 {post.views.toLocaleString()}</span>
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, color: 'var(--c4-500)' }}>{post.revenue}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>Doanh thu</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      /* ══════ 10. CHIẾN DỊCH ══════ */
      case 'campaigns':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Chiến Dịch</h2>
            <div className="flex-col gap-12">
              {campaigns.map(camp => {
                const sc = campaignStatusConfig[camp.status];
                return (
                  <div key={camp.id} className="card" style={{ padding: '20px 24px' }}>
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div className="flex gap-8" style={{ marginBottom: 4 }}>
                          <span className={`badge ${sc.badge}`}>{sc.label}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{camp.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Brand: {camp.brand}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--c4-500)' }}>{camp.earned}</div>
                        <span className="badge badge-c6">Hoa hồng {camp.commission}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-4)' }}>{camp.startDate} → {camp.endDate}</div>
                    {camp.status === 'upcoming' && (
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Tham gia</button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        );

      /* ══════ 11. HOA HỒNG & RÚT TIỀN ══════ */
      case 'commission':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Hoa Hồng & Rút Tiền</h2>
            <div className="grid-3" style={{ gap: 16, marginBottom: 24 }}>
              <div className="card" style={{ padding: 20, borderLeft: '3px solid var(--c4-500)' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>Số dư khả dụng</div>
                <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--c4-500)' }}>8.450.000₫</div>
              </div>
              <div className="card" style={{ padding: 20, borderLeft: '3px solid var(--gold-400)' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>Đang chờ duyệt</div>
                <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--gold-400)' }}>3.200.000₫</div>
              </div>
              <div className="card" style={{ padding: 20, borderLeft: '3px solid var(--c5-500)' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>Tổng đã rút</div>
                <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--c5-500)' }}>45.200.000₫</div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className="flex" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Hoa Hồng Gần Đây</span>
                  <span className="badge badge-c5">{commissionData.length} giao dịch</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Mã GD', 'Sản phẩm', 'Người mua', 'Giá trị', 'Hoa hồng', '%', 'Trạng thái', 'TX Hash'].map(h => (
                        <TH key={h}>{h}</TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commissionData.map(row => {
                      const sc = commStatusConfig[row.status];
                      return (
                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <TD mono>{row.id}</TD>
                          <TD bold>{row.product}</TD>
                          <TD color="var(--text-2)">{row.buyer}</TD>
                          <TD mono bold>{row.amount}</TD>
                          <TD mono bold color="var(--c4-500)">{row.commission}</TD>
                          <TD><span className="badge badge-c6">{row.rate}</span></TD>
                          <TD><span className={`status-pill badge ${sc.badge}`}>{sc.label}</span></TD>
                          <TD mono>
                            {row.txHash ? (
                              <a href={`https://polygonscan.com/tx/${row.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c6-300)' }}>{shortenHash(row.txHash)}</a>
                            ) : '—'}
                          </TD>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '.92rem', marginBottom: 16 }}>Rút Tiền</div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="card" style={{ padding: 20, background: 'var(--bg-2)' }}>
                  <div style={{ fontWeight: 600, fontSize: '.85rem', marginBottom: 12 }}>Rút về ngân hàng / ví điện tử</div>
                  <div className="flex-col gap-8">
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>VNPay</button>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>MoMo</button>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>Chuyển khoản ngân hàng</button>
                  </div>
                </div>
                <div className="card" style={{ padding: 20, background: 'var(--bg-2)' }}>
                  <div style={{ fontWeight: 600, fontSize: '.85rem', marginBottom: 12 }}>Rút về ví crypto</div>
                  <div className="flex-col gap-8">
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>USDT (Polygon)</button>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>MATIC (Polygon)</button>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>ETH (Ethereum)</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Lịch Sử Rút Tiền</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Mã', 'Phương thức', 'Số tiền', 'Phí', 'Trạng thái', 'Ngày', 'Ghi chú'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalHistory.map(w => (
                      <tr key={w.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <TD mono>{w.id}</TD>
                        <TD bold>{w.method}</TD>
                        <TD mono bold color="var(--c4-500)">{w.amount}</TD>
                        <TD color="var(--text-3)">{w.fee}</TD>
                        <TD><span className={`badge ${w.status === 'completed' ? 'badge-c4' : 'badge-gold'}`}>{w.status === 'completed' ? 'Thành công' : 'Đang xử lý'}</span></TD>
                        <TD color="var(--text-3)">{w.date}</TD>
                        <TD mono style={{ fontSize: '.72rem' }}>{w.note}</TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="onchain-card">
              <div className="verified-seal">On-chain Verified</div>
              <div style={{ fontSize: '.82rem', fontWeight: 600, marginBottom: 8 }}>Tất cả hoa hồng được ghi nhận trên blockchain</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                Smart contract tự động tính toán và phân phối hoa hồng minh bạch. Mọi giao dịch đều có thể xác minh trên Polygon.
              </div>
              <div className="flex gap-8" style={{ marginTop: 12 }}>
                <span className="badge badge-c4">Polygon</span>
                <span className="badge badge-c5">Auto-payout</span>
                <span className="badge badge-c6">IPFS</span>
              </div>
            </div>
          </>
        );

      /* ══════ 12. MARKETING TỰ ĐỘNG ══════ */
      case 'automkt':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Marketing Tự Động (AI Agents)</h2>
            <div className="card" style={{ padding: 20, marginBottom: 20, borderLeft: '3px solid var(--c6-500)' }}>
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Tổng chi phí agents tháng này</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--c6-500)' }}>1.050.000₫</div>
                </div>
                <button className="btn btn-primary btn-sm">+ Tạo Agent mới</button>
              </div>
            </div>
            <div className="card" style={{ padding: 20, marginBottom: 20, background: 'var(--bg-2)' }}>
              <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 10 }}>Thiết lập Agent mới</div>
              <div className="grid-3" style={{ gap: 12 }}>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Loại Agent</div>
                  <div className="flex-col gap-4">
                    {agentTypes.map(t => (
                      <div key={t} className="badge badge-c6" style={{ display: 'inline-block', marginRight: 4, marginBottom: 4 }}>{t}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Ngân sách</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>100.000₫ — 5.000.000₫/tháng</div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Lịch chạy</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>Hàng ngày, Hàng tuần, 24/7, Tùy chỉnh</div>
                </div>
              </div>
            </div>
            <div className="flex-col gap-12">
              {mktAgents.map(agent => {
                const sc = agentStatusConfig[agent.status];
                return (
                  <div key={agent.id} className="card" style={{ padding: '20px 24px' }}>
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div className="flex gap-8" style={{ marginBottom: 4 }}>
                          <span className={`badge ${sc.badge}`}>{sc.label}</span>
                          <span className="badge badge-c6">{agent.type}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{agent.name}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-4)' }}>Lịch: {agent.schedule} — Ngân sách: {agent.budget}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, color: agent.roi !== 'N/A' ? 'var(--c4-500)' : 'var(--text-3)' }}>ROI: {agent.roi}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-4)' }}>Chi: {agent.spent}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {[
                        { label: 'Impressions', value: agent.impressions.toLocaleString() },
                        { label: 'Clicks', value: agent.clicks.toLocaleString() },
                        { label: 'Conversions', value: agent.conversions.toLocaleString() },
                        { label: 'Chi phí', value: agent.cost },
                      ].map((m, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-2)', borderRadius: 8 }}>
                          <div style={{ fontSize: '.6rem', color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 2 }}>{m.label}</div>
                          <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '.82rem' }}>{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );

      /* ══════ 13. AFFILIATE & CRM ══════ */
      case 'affiliate':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Affiliate & CRM</h2>
            <div className="grid-3" style={{ gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Đối tác F1 (trực tiếp)', value: partnerStats.f1, color: 'var(--c4-500)' },
                { label: 'Đối tác F2', value: partnerStats.f2, color: 'var(--c5-500)' },
                { label: 'Tổng mạng lưới', value: partnerStats.totalNetwork, color: 'var(--c6-500)' },
              ].map((s, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{s.label}</div>
                  <div className="kpi-val" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className="flex" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Link Affiliate</span>
                  <button className="btn btn-primary btn-sm">+ Tạo link mới</button>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Sản phẩm', 'Link', 'Clicks', 'Conversions', 'Doanh thu'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {affiliateLinks.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <TD bold>{l.product}</TD>
                        <TD mono style={{ fontSize: '.68rem' }}>
                          <span style={{ color: 'var(--c6-300)' }}>{l.link}</span>
                          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8, fontSize: '.55rem', padding: '2px 6px' }}>Copy</button>
                        </TD>
                        <TD mono bold>{l.clicks.toLocaleString()}</TD>
                        <TD mono bold color="var(--c4-500)">{l.conversions}</TD>
                        <TD mono bold color="var(--c4-500)">{l.revenue}</TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className="flex" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Khách Hàng (CRM)</span>
                  <span className="badge badge-c5">{crmCustomers.length} khách hàng</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Tên', 'Email', 'Đơn hàng', 'Tổng chi tiêu', 'Mua gần nhất'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {crmCustomers.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <TD bold>{c.name}</TD>
                        <TD color="var(--text-3)">{c.email}</TD>
                        <TD mono bold>{c.orders}</TD>
                        <TD mono bold color="var(--c4-500)">{c.totalSpend}</TD>
                        <TD color="var(--text-3)">{c.lastPurchase}</TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div className="label" style={{ marginBottom: 12 }}>PHÂN KHÚC KHÁCH HÀNG</div>
              <div className="grid-4" style={{ gap: 12 }}>
                {[
                  { label: 'VIP (>10 đơn)', count: 12, color: 'var(--gold-400)' },
                  { label: 'Thường xuyên (5-10)', count: 28, color: 'var(--c4-500)' },
                  { label: 'Mới (<5 đơn)', count: 156, color: 'var(--c5-500)' },
                  { label: 'Không hoạt động', count: 43, color: 'var(--text-4)' },
                ].map((seg, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: 14, background: 'var(--bg-2)', borderRadius: 8 }}>
                    <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.2rem', color: seg.color }}>{seg.count}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-3)', marginTop: 4 }}>{seg.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );

      /* ══════ 14. CỘNG ĐỒNG ══════ */
      case 'community':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Cộng Đồng</h2>
            <div className="grid-3" style={{ gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Tổng thành viên', value: communityStats.totalMembers.toLocaleString(), color: 'var(--c4-500)' },
                { label: 'Thành viên mới tháng này', value: communityStats.newThisMonth.toLocaleString(), color: 'var(--c5-500)' },
                { label: 'Tỷ lệ hoạt động', value: communityStats.activeRate, color: 'var(--c6-500)' },
              ].map((s, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{s.label}</div>
                  <div className="kpi-val" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="grid-4" style={{ gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Bài viết cộng đồng', value: '1,247' },
                { label: 'Bình luận tháng', value: '8,920' },
                { label: 'Lượt chia sẻ', value: '3,456' },
                { label: 'Phản hồi tích cực', value: '94.2%' },
              ].map((m, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-2)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--text-1)' }}>{m.value}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--text-4)', marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Danh Sách Thành Viên</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Tên', 'Ngày tham gia', 'Hạng', 'Mua hàng', 'Trạng thái'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {communityMembers.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <TD bold>{m.name}</TD>
                        <TD color="var(--text-3)">{m.joinDate}</TD>
                        <TD><span className={`badge ${m.tier === 'Platinum' ? 'badge-c7' : m.tier === 'Gold' ? 'badge-gold' : m.tier === 'Silver' ? 'badge-c5' : 'badge-c6'}`}>{m.tier}</span></TD>
                        <TD mono bold>{m.purchases}</TD>
                        <TD><span className={`badge ${m.status === 'active' ? 'badge-c4' : 'badge-gold'}`}>{m.status === 'active' ? 'Hoạt động' : 'Không HĐ'}</span></TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      /* ══════ 15. HIỆU SUẤT & THỐNG KÊ ══════ */
      case 'performance':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Hiệu Suất & Thống Kê</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
              {perfKpis.map((kpi, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-val" style={{ color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div className="label" style={{ marginBottom: 16 }}>PHỄU CHUYỂN ĐỔI</div>
              <div className="flex-col gap-12">
                {funnelSteps.map((step, i) => (
                  <div key={i}>
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{step.label}</span>
                      <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{step.value.toLocaleString()} ({step.pct}%)</span>
                    </div>
                    <div className="progress-track" style={{ height: 8, background: 'var(--bg-2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div className="progress-fill" style={{ width: `${step.pct}%`, height: '100%', background: i === 0 ? 'var(--c4-500)' : i === 1 ? 'var(--c5-500)' : i === 2 ? 'var(--c6-500)' : 'var(--c7-500)', borderRadius: 4, transition: 'width .3s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Hiệu Suất Agent</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Agent', 'Impressions', 'Clicks', 'Conversions', 'Chi phí', 'ROI'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {mktAgents.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <TD bold>{a.name}</TD>
                        <TD mono>{a.impressions.toLocaleString()}</TD>
                        <TD mono>{a.clicks.toLocaleString()}</TD>
                        <TD mono bold color="var(--c4-500)">{a.conversions.toLocaleString()}</TD>
                        <TD mono>{a.cost}</TD>
                        <TD bold color={a.roi !== 'N/A' ? 'var(--c4-500)' : 'var(--text-3)'}>{a.roi}</TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      /* ══════ 16. XẾP HẠNG & GIẢI THƯỞNG ══════ */
      case 'ranking':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Xếp Hạng & Giải Thưởng</h2>
            <div className="onchain-card" style={{ marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '6rem', opacity: 0.06 }}>🏆</div>
              <div className="flex" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>Hạng của tôi</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 900, fontSize: '2rem', color: 'var(--c4-500)' }}>
                    #{myRank.rank} <span style={{ fontSize: '.72rem', fontWeight: 400, color: 'var(--text-3)' }}>/ {myRank.total.toLocaleString()} KOCs</span>
                  </div>
                  <div className="flex gap-8" style={{ marginTop: 8 }}>
                    <span className="badge badge-c7">{myRank.tier}</span>
                    <span className="badge badge-gold">{myRank.xp.toLocaleString()} XP</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Tổng doanh thu</div>
                  <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--gold-400)' }}>{myRank.revenue}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Bảng Xếp Hạng Top 10</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Hạng', 'KOC', 'Doanh thu', 'Hoa hồng', 'Badges', 'Tier'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map(l => (
                      <tr key={l.rank} style={{ borderBottom: '1px solid var(--border)', background: l.rank <= 3 ? 'var(--bg-2)' : undefined }}>
                        <TD bold color={l.rank === 1 ? 'var(--gold-400)' : l.rank === 2 ? 'var(--text-2)' : l.rank === 3 ? 'var(--c5-500)' : undefined}>
                          {l.rank === 1 ? '🥇' : l.rank === 2 ? '🥈' : l.rank === 3 ? '🥉' : `#${l.rank}`}
                        </TD>
                        <TD bold>{l.name}</TD>
                        <TD mono bold color="var(--c4-500)">{l.revenue}</TD>
                        <TD mono>{l.commission}</TD>
                        <TD><span className="badge badge-gold">{l.badges}</span></TD>
                        <TD><span className={`badge ${l.tier === 'Legend' ? 'badge-c7' : l.tier === 'Diamond' ? 'badge-c5' : 'badge-c6'}`}>{l.tier}</span></TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 28 }}>
              <div className="label" style={{ marginBottom: 14 }}>BADGES ĐÃ ĐẠT ĐƯỢC</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {gamificationBadges.map((b, i) => (
                  <div key={i} style={{
                    textAlign: 'center', padding: 14, borderRadius: 10,
                    background: b.earned ? 'var(--bg-2)' : 'var(--bg-1)',
                    opacity: b.earned ? 1 : 0.4,
                    border: b.earned ? '1px solid var(--border)' : '1px dashed var(--border)',
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{b.icon}</div>
                    <div style={{ fontSize: '.68rem', fontWeight: 600, color: b.earned ? 'var(--text-1)' : 'var(--text-4)' }}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Achievement Rewards */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold-400)', fontWeight: 700, marginBottom: 6 }}>GIẢI THƯỞNG CỐNG HIẾN SỰ NGHIỆP</div>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-1)', marginBottom: 20 }}>Phục Hưng Cộng Đồng</div>
            </div>

            <div className="flex-col gap-16">
              {careerRewards.map((reward, i) => {
                const pct = Math.min((reward.current / reward.target) * 100, 100);
                const achieved = pct >= 100;
                return (
                  <div key={i} style={{
                    position: 'relative', borderRadius: 16, overflow: 'hidden',
                    background: 'var(--bg-1)', border: '1px solid var(--border)',
                    boxShadow: achieved ? reward.glow : 'none',
                  }}>
                    <div style={{
                      background: reward.gradient, padding: '20px 24px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div className="flex gap-12" style={{ alignItems: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>{reward.icon}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{reward.title}</div>
                          <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Hạng {reward.tier}</div>
                        </div>
                      </div>
                      {achieved && (
                        <div style={{
                          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                          padding: '6px 14px', borderRadius: 20,
                          fontWeight: 800, fontSize: '.72rem', color: '#fff',
                          border: '1px solid rgba(255,255,255,0.3)',
                        }}>ĐÃ ĐẠT ĐƯỢC</div>
                      )}
                    </div>
                    <div style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '.82rem', color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.5 }}>{reward.description}</div>
                      <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>Tiến độ</span>
                        <span style={{ fontSize: '.7rem', fontWeight: 700, color: achieved ? 'var(--c4-500)' : 'var(--text-2)' }}>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="progress-track" style={{ height: 8, background: 'var(--bg-2)', borderRadius: 4, overflow: 'hidden' }}>
                        <div className="progress-fill" style={{
                          width: `${pct}%`, height: '100%', borderRadius: 4,
                          background: achieved ? 'var(--c4-500)' : reward.gradient,
                          transition: 'width .5s ease',
                        }} />
                      </div>
                      <div className="flex" style={{ justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>Hiện tại: {formatVND(reward.current)}</span>
                        <span style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>Mục tiêu: {formatVND(reward.target)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );

      /* ══════ 17. CREATOR TOKEN ══════ */
      case 'token':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Creator Token</h2>
            <div className="onchain-card" style={{ marginBottom: 24 }}>
              <div className="flex" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                <div>
                  <div className="flex gap-8" style={{ marginBottom: 8 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'var(--chakra-flow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 800, color: '#fff',
                    }}>{creatorToken.symbol.charAt(0)}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.2rem' }}>{creatorToken.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{creatorToken.fullName}</div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c4-500)' }}>{creatorToken.price}</div>
                  <span className="badge badge-c4">{creatorToken.priceChange}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Total Supply', value: creatorToken.totalSupply },
                  { label: 'Circulating', value: creatorToken.circulatingSupply },
                  { label: 'Holders', value: creatorToken.holders.toString() },
                  { label: 'Market Cap', value: creatorToken.marketCap },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--bg-2)', borderRadius: 8 }}>
                    <div style={{ fontSize: '.65rem', color: 'var(--text-4)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '.88rem' }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-8" style={{ marginTop: 16 }}>
                <span className="badge badge-c7">{creatorToken.chain}</span>
                <span className="mono badge badge-c5" style={{ fontSize: '.6rem' }}>{creatorToken.contractAddress}</span>
              </div>
            </div>
            <div className="flex gap-8" style={{ marginBottom: 24 }}>
              <button className="btn btn-primary btn-sm">Mua {creatorToken.name}</button>
              <button className="btn btn-secondary btn-sm">Bán {creatorToken.name}</button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Top Holders</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Địa chỉ', 'Số lượng', 'Tỷ lệ'].map(h => <TH key={h}>{h}</TH>)}
                    </tr>
                  </thead>
                  <tbody>
                    {tokenHolders.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <TD mono>{h.address}</TD>
                        <TD mono bold>{h.amount}</TD>
                        <TD><span className="badge badge-c6">{h.pct}</span></TD>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      /* ══════ 18. NHIỆM VỤ & XP ══════ */
      case 'missions': {
        const dailyMissions = [
          { name: 'Đăng nhập hôm nay', xp: 5, done: true },
          { name: 'Xem 3 sản phẩm', xp: 10, progress: '2/3', done: false },
          { name: 'Mua 1 đơn hàng', xp: 20, progress: '0/1', done: false },
          { name: 'Đánh giá 1 sản phẩm', xp: 15, progress: '0/1', done: false },
          { name: 'Chia sẻ 1 sản phẩm', xp: 5, progress: '0/1', done: false },
          { name: 'Mời 1 bạn bè', xp: 50, progress: '0/1', done: false },
        ];
        const weeklyMissions = [
          { name: 'Mua 3 đơn hàng', xp: 100, progress: '1/3', done: false },
          { name: 'Review 2 sản phẩm', xp: 80, progress: '0/2', done: false },
          { name: 'Follow 5 KOC', xp: 30, progress: '2/5', done: false },
          { name: 'Đăng nhập 7 ngày liên tục', xp: 100, progress: '3/7', done: false },
        ];
        return (
          <>
            <div className="card" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, rgba(34,197,94,.08), rgba(99,102,241,.08))', border: '1px solid rgba(34,197,94,.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)' }}>Streak: 3 ngày liên tục</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-3)', marginTop: 4 }}>Đăng nhập 7 ngày liên tục = bonus 100 XP</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5,6,7].map(d => (
                    <div key={d} style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, background: d <= 3 ? 'var(--c4-500)' : 'var(--bg-2)', color: d <= 3 ? '#fff' : 'var(--text-4)' }}>{d}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 20, border: '1px solid rgba(239,68,68,.3)', background: 'linear-gradient(90deg, rgba(239,68,68,.06), transparent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '.65rem', fontWeight: 700 }}>FLASH</span>
                <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-1)' }}>2x XP Event — còn 02:45:30</span>
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>Mọi nhiệm vụ hoàn thành trong event nhận gấp đôi XP!</div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-1)' }}>Nhiệm vụ hàng ngày</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {dailyMissions.map((m, i) => (
                <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: m.done ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: m.done ? 'var(--c4-500)' : 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', color: m.done ? '#fff' : 'var(--text-3)' }}>{m.done ? '✓' : '○'}</div>
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--text-1)', textDecoration: m.done ? 'line-through' : 'none' }}>{m.name}</div>
                      {!m.done && m.progress && <div style={{ fontSize: '.7rem', color: 'var(--text-4)' }}>Tiến độ: {m.progress}</div>}
                    </div>
                  </div>
                  <span className="badge badge-c4" style={{ fontSize: '.72rem' }}>+{m.xp} XP</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-1)' }}>Nhiệm vụ tuần</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weeklyMissions.map((m, i) => (
                <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', color: 'var(--c6-500)' }}>📋</div>
                    <div>
                      <div style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--text-1)' }}>{m.name}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-4)' }}>Tiến độ: {m.progress}</div>
                    </div>
                  </div>
                  <span className="badge badge-c6" style={{ fontSize: '.72rem' }}>+{m.xp} XP</span>
                </div>
              ))}
            </div>
          </>
        );
      }

      /* ══════ 19. ĐỔI XP → WK3 ══════ */
      case 'convert': {
        const convertAmount = 500;
        const conversionRate = 100;
        const currentXP = 24450;
        const wk3Balance = 42.5;
        const convertHistory = [
          { date: '20/03/2026', xp: 500, wk3: 5, status: 'Thành công' },
          { date: '15/03/2026', xp: 1000, wk3: 10, status: 'Thành công' },
          { date: '10/03/2026', xp: 2000, wk3: 20, status: 'Thành công' },
        ];
        return (
          <>
            <div className="grid-2" style={{ marginBottom: 24 }}>
              <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(168,85,247,.08), rgba(99,102,241,.06))' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>XP Hiện tại</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--c7-500)' }}>{currentXP.toLocaleString()}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-4)' }}>= {(currentXP / conversionRate).toFixed(1)} WK3</div>
              </div>
              <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(34,197,94,.08), rgba(6,182,212,.06))' }}>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>WK3 Token</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--c4-500)' }}>{wk3Balance} WK3</div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-4)' }}>≈ {formatVND(wk3Balance * 25000)}</div>
              </div>
            </div>

            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-1)' }}>Quy đổi XP → WK3 Token</h3>
              <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginBottom: 16 }}>Tỷ lệ: <strong>100 XP = 1 WK3 Token</strong> · Tối thiểu: 100 XP</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[100, 500, 1000, 2000, 5000].map(v => (
                  <button key={v} style={{ padding: '6px 14px', borderRadius: 8, border: convertAmount === v ? '1px solid var(--c6-500)' : '1px solid var(--border)', background: convertAmount === v ? 'rgba(99,102,241,.1)' : 'transparent', color: convertAmount === v ? 'var(--c6-500)' : 'var(--text-3)', fontSize: '.78rem', cursor: 'pointer', fontWeight: 600 }}>{v} XP</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, padding: 16, borderRadius: 12, background: 'var(--bg-2)' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c7-500)' }}>{convertAmount} XP</div>
                </div>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-3)' }}>→</div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--c4-500)' }}>{(convertAmount / conversionRate).toFixed(1)} WK3</div>
                </div>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={convertAmount > currentXP}>
                {convertAmount > currentXP ? 'Không đủ XP' : `Quy đổi ${convertAmount} XP → ${(convertAmount / conversionRate).toFixed(1)} WK3`}
              </button>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-1)' }}>Lịch sử quy đổi</h3>
            <table className="data-table">
              <thead><tr><th>Ngày</th><th>XP</th><th>WK3</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {convertHistory.map((h, i) => (
                  <tr key={i}><td>{h.date}</td><td>-{h.xp}</td><td>+{h.wk3} WK3</td><td><span className="badge badge-c4">{h.status}</span></td></tr>
                ))}
              </tbody>
            </table>
          </>
        );
      }

      /* ══════ 20. CÀI ĐẶT ══════ */
      case 'settings':
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Cài Đặt</h2>

            <div className="flex gap-8" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { key: 'profile', label: 'Hồ sơ KOC' },
                { key: 'address', label: 'Địa chỉ' },
                { key: 'bank', label: 'Ngân hàng' },
                { key: 'wkpay', label: 'WK Pay KYC' },
                { key: 'password', label: 'Mật khẩu' },
                { key: 'koc', label: 'KOC Profile' },
              ].map(t => (
                <button key={t.key} className={`btn btn-sm ${settingsTab === t.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSettingsTab(t.key)}>{t.label}</button>
              ))}
            </div>

            {settingsTab === 'profile' && (
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--chakra-flow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>MH</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Minh Hương</div>
                    <span className="badge badge-c6">KOC Level 18</span>
                  </div>
                </div>
                <div className="flex-col gap-12">
                  {[
                    { label: 'Họ tên', value: 'Minh Hương' },
                    { label: 'Email', value: 'minhhuong@example.com' },
                    { label: 'Số điện thoại', value: '0912 345 678' },
                    { label: 'Handle', value: '@minhhuong.koc' },
                    { label: 'Bio', value: 'KOC chuyên review organic & wellness' },
                  ].map((f, i) => (
                    <div key={i} className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>{f.label}</span>
                      <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{f.value}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Chỉnh sửa</button>
              </div>
            )}

            {settingsTab === 'address' && (
              <div className="card" style={{ padding: 20 }}>
                <div className="flex-col gap-12">
                  <div className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>Mặc định</span>
                    <span style={{ fontSize: '.82rem', fontWeight: 600 }}>123 Nguyễn Huệ, Q.1, TP.HCM</span>
                  </div>
                  <div className="flex" style={{ justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>SĐT</span>
                    <span style={{ fontSize: '.82rem', fontWeight: 600 }}>0912 345 678</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>+ Thêm địa chỉ mới</button>
              </div>
            )}

            {settingsTab === 'bank' && (
              <div className="card" style={{ padding: 20 }}>
                <div className="flex-col gap-12">
                  <div className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>Ngân hàng</span>
                    <span style={{ fontSize: '.82rem', fontWeight: 600 }}>Vietcombank **** 1234</span>
                  </div>
                  <div className="flex" style={{ justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>Chủ TK</span>
                    <span style={{ fontSize: '.82rem', fontWeight: 600 }}>MINH HUONG</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>+ Thêm tài khoản</button>
              </div>
            )}

            {settingsTab === 'wkpay' && (
              <div className="card" style={{ padding: 20 }}>
                <div className="flex-col gap-12">
                  <div className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>KYC</span>
                    <span className="badge badge-c4">Đã xác minh</span>
                  </div>
                  <div className="flex" style={{ justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>Ví</span>
                    <span className="mono" style={{ fontSize: '.82rem', fontWeight: 600 }}>0xA1B2...5678</span>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'password' && (
              <div className="card" style={{ padding: 20 }}>
                <div className="flex-col gap-12">
                  <div>
                    <label style={{ fontSize: '.72rem', color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Mật khẩu hiện tại</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: '.82rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '.72rem', color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Mật khẩu mới</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: '.82rem' }} />
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Cập nhật mật khẩu</button>
                </div>
              </div>
            )}

            {settingsTab === 'koc' && (
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
            )}
          </>
        );

      default:
        return null;
    }
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <div style={{ paddingTop: 0, minHeight: '100vh', background: 'var(--bg-0)' }}>
      <div className="container" style={{ paddingTop: 0, paddingBottom: 64 }}>
        <div className="dash-wrap">
          {/* Sidebar */}
          <div className="dash-sidebar" style={{ width: 240, minWidth: 240 }}>
            {/* User profile header */}
            <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
              <div className="flex gap-8">
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--chakra-flow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 700,
                }}>MH</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.82rem' }}>Minh Hương</div>
                  <span className="badge badge-c6" style={{ marginTop: 2 }}>KOC Level 18</span>
                </div>
              </div>
            </div>

            {/* ── GROUP 1: MUA SẮM ── */}
            <div style={{ padding: '8px 10px 6px', marginBottom: 4, borderLeft: '3px solid var(--c4-500)', marginLeft: 4 }}>
              <span style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--c4-500)' }}>MUA SẮM</span>
            </div>
            {buyerItems.map(item => (
              <div
                key={item.key}
                className={`dash-nav-item ${activeNav === item.key ? 'on' : ''}`}
                onClick={() => setActiveNav(item.key)}
                style={{ position: 'relative' }}
              >
                <span className="dash-nav-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.key === 'orders' && pendingOrderCount > 0 && (
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '.6rem', fontWeight: 700 }}>{pendingOrderCount}</span>
                )}
              </div>
            ))}

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 8px' }} />

            {/* ── GROUP 2: KOC PRO ── */}
            <div style={{ padding: '8px 10px 6px', marginBottom: 4, borderLeft: '3px solid var(--c6-500)', marginLeft: 4 }}>
              <span style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--c6-500)' }}>KOC PRO</span>
            </div>
            {kocItems.map(item => (
              <div
                key={item.key}
                className={`dash-nav-item ${activeNav === item.key ? 'on' : ''}`}
                onClick={() => setActiveNav(item.key)}
              >
                <span className="dash-nav-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
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
