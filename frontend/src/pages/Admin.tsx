import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@hooks/useTheme';
import AdminOverview from '@components/admin/AdminOverview';
import AdminKYC from '@components/admin/AdminKYC';

const STORAGE_KEY = 'wellkoc-auth';

function isAdminLoggedIn(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return parsed?.user?.role === 'admin';
  } catch {
    return false;
  }
}

type SidebarSection = { title: string; color: string; groupIcon: string; items: { key: string; icon: string; label: string; badge?: string }[] };

const sidebarSections: SidebarSection[] = [
  { title: 'TỔNG QUAN', color: '#22c55e', groupIcon: '📊', items: [
    { key: 'overview', icon: '📊', label: 'Dashboard' },
    { key: 'analytics', icon: '📈', label: 'Analytics & BI' },
    { key: 'reports', icon: '📋', label: 'Báo cáo' },
  ]},
  { title: 'CRM & NGƯỜI DÙNG', color: '#6366f1', groupIcon: '👥', items: [
    { key: 'users', icon: '👥', label: 'Người dùng', badge: '12,847' },
    { key: 'kyc', icon: '🪪', label: 'KYC / Xác minh', badge: '23' },
    { key: 'membership', icon: '💎', label: 'Membership' },
    { key: 'notifications', icon: '🔔', label: 'Thông báo CRM' },
    { key: 'referralTree', icon: '🌳', label: 'Cây cộng đồng' },
  ]},
  { title: 'THƯƠNG MẠI', color: '#06b6d4', groupIcon: '🛒', items: [
    { key: 'products', icon: '📦', label: 'Sản phẩm', badge: '2,341' },
    { key: 'orders', icon: '🛒', label: 'Đơn hàng', badge: '8,934' },
    { key: 'returns', icon: '↩️', label: 'Đổi trả / Hoàn tiền', badge: '12' },
    { key: 'payments', icon: '💳', label: 'Thanh toán' },
    { key: 'shipping', icon: '🚚', label: 'Vận chuyển' },
    { key: 'promotions', icon: '🎁', label: 'Khuyến mại / Voucher' },
    { key: 'groupbuy', icon: '👥', label: 'Mua nhóm' },
  ]},
  { title: 'KOC & VENDOR', color: '#f59e0b', groupIcon: '⭐', items: [
    { key: 'koc', icon: '⭐', label: 'KOC Management', badge: '1,245' },
    { key: 'vendor', icon: '🏪', label: 'Vendor Management' },
    { key: 'approvals', icon: '✅', label: 'Phê duyệt', badge: '5' },
    { key: 'commission', icon: '💰', label: 'Hoa hồng' },
    { key: 'affiliate', icon: '🔗', label: 'Affiliate Links' },
  ]},
  { title: 'CONTENT & SOCIAL', color: '#ec4899', groupIcon: '📝', items: [
    { key: 'content', icon: '📝', label: 'Content Moderation' },
    { key: 'reviews', icon: '⭐', label: 'Reviews / Đánh giá' },
    { key: 'live', icon: '🔴', label: 'Live Commerce' },
    { key: 'feed', icon: '📡', label: 'Social Feed' },
    { key: 'academy', icon: '🎓', label: 'KOC Academy' },
  ]},
  { title: 'WEB3 & BLOCKCHAIN', color: '#a855f7', groupIcon: '⛓️', items: [
    { key: 'blockchain', icon: '⛓️', label: 'Blockchain Monitor' },
    { key: 'dpp', icon: '🛡️', label: 'DPP NFT', badge: '3,456' },
    { key: 'walletMgmt', icon: '🏦', label: 'Ví / Wallet' },
    { key: 'token', icon: '🪙', label: 'WK Token' },
    { key: 'reputation', icon: '🏅', label: 'Reputation NFT' },
  ]},
  { title: 'AI & AUTOMATION', color: '#14b8a6', groupIcon: '🤖', items: [
    { key: 'aiAgents', icon: '🤖', label: '333 AI Agents' },
    { key: 'aiCaption', icon: '✍️', label: 'AI Caption / Hashtag' },
    { key: 'aiScheduler', icon: '📅', label: 'Content Calendar' },
    { key: 'fraud', icon: '🚨', label: 'Fraud Detection' },
  ]},
  { title: 'GAMIFICATION', color: '#f97316', groupIcon: '🎮', items: [
    { key: 'gamification', icon: '🎮', label: 'XP & Missions' },
    { key: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { key: 'achievements', icon: '🎖️', label: 'Achievements' },
  ]},
  { title: 'HỆ THỐNG', color: '#64748b', groupIcon: '🔧', items: [
    { key: 'system', icon: '🔧', label: 'Hệ thống & Health' },
    { key: 'logs', icon: '📜', label: 'Audit Logs' },
    { key: 'settings', icon: '⚙️', label: 'Cài đặt' },
  ]},
];

// Flatten for backward compat
const sidebarTabs = sidebarSections.flatMap(s => s.items);

const overviewKPIs = [
  { label: 'Tổng người dùng', value: '12,847', delta: '+342 tuần này', color: 'var(--c4-500)' },
  { label: 'Tổng doanh thu', value: '1.28B₫', delta: '+18.5% MoM', color: 'var(--c5-500)' },
  { label: 'KOC hoạt động', value: '1,245', delta: '+89 mới', color: 'var(--c6-500)' },
  { label: 'Đơn hàng tháng', value: '8,934', delta: '+12.3%', color: 'var(--c7-500)' },
  { label: 'Hoa hồng đã trả', value: '156M₫', delta: 'Tháng 3/2026', color: 'var(--gold-400)' },
  { label: 'DPP đã mint', value: '3,456', delta: '98.2% verified', color: 'var(--c4-300)' },
];

const usersData = [
  { id: 'USR-001', name: 'Nguyễn Văn A', email: 'a@example.com', role: 'user', status: 'active', joinDate: '2026-01-15', orders: 23, referredBy: 'Minh Hương', referrals: 3 },
  { id: 'USR-002', name: 'Trần Thị B', email: 'b@example.com', role: 'koc', status: 'active', joinDate: '2026-01-20', orders: 45, referredBy: '—', referrals: 8 },
  { id: 'USR-003', name: 'Lê Văn C', email: 'c@example.com', role: 'vendor', status: 'active', joinDate: '2026-02-01', orders: 0, referredBy: 'Ngọc Anh', referrals: 0 },
  { id: 'USR-004', name: 'Phạm Thị D', email: 'd@example.com', role: 'koc', status: 'suspended', joinDate: '2026-02-10', orders: 12, referredBy: 'Minh Hương', referrals: 2 },
  { id: 'USR-005', name: 'Hoàng Văn E', email: 'e@example.com', role: 'user', status: 'active', joinDate: '2026-03-01', orders: 8, referredBy: 'Thảo Linh', referrals: 1 },
  { id: 'USR-006', name: 'Vũ Thị F', email: 'f@example.com', role: 'admin', status: 'active', joinDate: '2025-12-01', orders: 0, referredBy: '—', referrals: 0 },
  { id: 'USR-007', name: 'Đỗ Văn G', email: 'g@example.com', role: 'user', status: 'active', joinDate: '2026-03-10', orders: 3, referredBy: 'Minh Hương', referrals: 0 },
];

const productsData = [
  { id: 'PRD-001', name: 'Trà Ô Long Premium', vendor: 'WellKOC Origin', price: '389.000₫', status: 'approved', dpp: true, sales: 1247 },
  { id: 'PRD-002', name: 'Serum Vitamin C', vendor: 'K-Beauty VN', price: '459.000₫', status: 'approved', dpp: true, sales: 892 },
  { id: 'PRD-003', name: 'Mật Ong Rừng', vendor: 'GreenViet', price: '285.000₫', status: 'pending', dpp: false, sales: 0 },
  { id: 'PRD-004', name: 'Cà Phê Arabica', vendor: 'Đà Lạt Farm', price: '245.000₫', status: 'approved', dpp: true, sales: 1580 },
  { id: 'PRD-005', name: 'Kem Chống Nắng', vendor: 'SunCare VN', price: '199.000₫', status: 'rejected', dpp: false, sales: 0 },
  { id: 'PRD-006', name: 'Bột Collagen', vendor: 'HealthPlus VN', price: '890.000₫', status: 'pending', dpp: false, sales: 0 },
];

const socialIcons: Record<string, string> = { tiktok: '🎵', instagram: '📸', youtube: '▶️', facebook: '📘' };

const kocData = [
  { id: 'KOC-001', name: 'Minh Hương', level: 12, tier: 'Diamond', sales: '45.2M₫', commission: '8.1M₫', status: 'active', trustScore: 92, socialLinks: ['tiktok', 'instagram', 'youtube'], affiliateLinks: 23 },
  { id: 'KOC-002', name: 'Thảo Linh', level: 10, tier: 'Gold', sales: '38.7M₫', commission: '6.9M₫', status: 'active', trustScore: 88, socialLinks: ['tiktok', 'facebook'], affiliateLinks: 15 },
  { id: 'KOC-003', name: 'Ngọc Anh', level: 9, tier: 'Gold', sales: '32.1M₫', commission: '5.7M₫', status: 'active', trustScore: 85, socialLinks: ['instagram', 'youtube', 'facebook'], affiliateLinks: 19 },
  { id: 'KOC-004', name: 'Văn Hoàng', level: 8, tier: 'Silver', sales: '28.4M₫', commission: '5.1M₫', status: 'review', trustScore: 78, socialLinks: ['tiktok'], affiliateLinks: 8 },
  { id: 'KOC-005', name: 'Phương Thảo', level: 5, tier: 'Bronze', sales: '12.3M₫', commission: '2.2M₫', status: 'suspended', trustScore: 65, socialLinks: ['instagram', 'tiktok'], affiliateLinks: 5 },
];

const ordersData = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', product: 'Trà Ô Long', amount: '389.000₫', status: 'delivered', date: '2026-03-25', payMethod: 'VNPay' },
  { id: 'ORD-002', customer: 'Trần Thị B', product: 'Serum Vitamin C', amount: '459.000₫', status: 'shipping', date: '2026-03-24', payMethod: 'MoMo' },
  { id: 'ORD-003', customer: 'Lê Văn C', product: 'Mật Ong Rừng', amount: '285.000₫', status: 'pending', date: '2026-03-24', payMethod: 'Crypto' },
  { id: 'ORD-004', customer: 'Phạm Thị D', product: 'Cà Phê Arabica', amount: '245.000₫', status: 'cancelled', date: '2026-03-23', payMethod: 'VNPay' },
  { id: 'ORD-005', customer: 'Hoàng Văn E', product: 'Bột Collagen', amount: '890.000₫', status: 'pending', date: '2026-03-23', payMethod: 'MoMo' },
  { id: 'ORD-006', customer: 'Vũ Thị F', product: 'Kem Chống Nắng', amount: '199.000₫', status: 'confirmed', date: '2026-03-26', payMethod: 'VNPay' },
  { id: 'ORD-007', customer: 'Đỗ Văn G', product: 'Trà Ô Long', amount: '389.000₫', status: 'packing', date: '2026-03-27', payMethod: 'Crypto' },
];

const orderStatusFlow = ['pending', 'confirmed', 'packing', 'shipping', 'delivered', 'completed'];

const commissionData = [
  { koc: 'Minh Hương', amount: '2.3M₫', orders: 34, status: 'paid', txHash: '0x1a2b...9f3c', date: '2026-03-25' },
  { koc: 'Thảo Linh', amount: '1.8M₫', orders: 28, status: 'pending', txHash: '—', date: '2026-03-24' },
  { koc: 'Ngọc Anh', amount: '1.5M₫', orders: 22, status: 'pending', txHash: '—', date: '2026-03-24' },
  { koc: 'Văn Hoàng', amount: '1.2M₫', orders: 18, status: 'paid', txHash: '0x4d5e...8a2b', date: '2026-03-23' },
  { koc: 'Phương Thảo', amount: '0.8M₫', orders: 12, status: 'processing', txHash: '—', date: '2026-03-22' },
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

/* -- Payment Management data -- */
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

/* -- Blockchain Monitor data -- */
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

/* -- Wallet Management data -- */
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

/* -- Vendor Management data -- */
const vendorsData = [
  { id: 'VND-001', shopName: 'WellKOC Origin', owner: 'Nguyễn Minh', taxCode: '0123456789', products: 12, revenue: '234M₫', status: 'active' },
  { id: 'VND-002', shopName: 'K-Beauty VN', owner: 'Trần Hà', taxCode: '0234567890', products: 8, revenue: '156M₫', status: 'active' },
  { id: 'VND-003', shopName: 'GreenViet', owner: 'Lê Hoàng', taxCode: '0345678901', products: 5, revenue: '89M₫', status: 'pending' },
  { id: 'VND-004', shopName: 'Đà Lạt Farm', owner: 'Phạm Tuấn', taxCode: '0456789012', products: 3, revenue: '45M₫', status: 'active' },
  { id: 'VND-005', shopName: 'SunCare VN', owner: 'Hoàng Mai', taxCode: '0567890123', products: 6, revenue: '67M₫', status: 'suspended' },
];

/* -- Notifications data -- */
const recentNotifications = [
  { id: 'NTF-001', title: 'Flash Sale 30% - Hôm nay!', target: 'All', channel: 'Push', sentAt: '2026-03-27 09:00', readRate: '68%', status: 'sent' },
  { id: 'NTF-002', title: 'Chào mừng KOC mới tháng 3', target: 'KOC', channel: 'Email', sentAt: '2026-03-26 14:00', readRate: '82%', status: 'sent' },
  { id: 'NTF-003', title: 'Cập nhật chính sách vendor', target: 'Vendor', channel: 'Email, Push', sentAt: '2026-03-25 10:00', readRate: '91%', status: 'sent' },
  { id: 'NTF-004', title: 'Khuyến mại cuối tuần', target: 'Buyer', channel: 'Push, SMS', sentAt: '—', readRate: '—', status: 'scheduled' },
];

/* -- Shared status configs -- */
const statusBadge: Record<string, string> = {
  active: 'badge-c4', suspended: 'badge-gold', approved: 'badge-c4', pending: 'badge-gold',
  rejected: 'badge-c5', review: 'badge-c6', delivered: 'badge-c4', shipping: 'badge-c5',
  processing: 'badge-c6', cancelled: 'badge-c5', paid: 'badge-c4', online: 'badge-c4', degraded: 'badge-gold',
  success: 'badge-c4', completed: 'badge-c4', confirmed: 'badge-c6', packing: 'badge-c7',
  sent: 'badge-c4', scheduled: 'badge-c6',
};
const statusLabel: Record<string, string> = {
  active: 'Hoạt động', suspended: 'Tạm khóa', approved: 'Đã duyệt', pending: 'Chờ duyệt',
  rejected: 'Từ chối', review: 'Đang xét', delivered: 'Đã giao', shipping: 'Đang giao',
  processing: 'Đang xử lý', cancelled: 'Đã hủy', paid: 'Đã trả', online: 'Online', degraded: 'Chậm',
  success: 'Thành công', completed: 'Hoàn thành', confirmed: 'Đã xác nhận', packing: 'Đang đóng gói',
  sent: 'Đã gửi', scheduled: 'Lên lịch',
};

/* -- Action button style helpers -- */
const btnSm: React.CSSProperties = { padding: '4px 10px', fontSize: '.68rem', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-1)', fontWeight: 600 };
const btnPrimSm: React.CSSProperties = { ...btnSm, background: 'var(--c4-500)', color: '#fff', border: '1px solid var(--c4-500)' };
const btnDangerSm: React.CSSProperties = { ...btnSm, background: '#ef4444', color: '#fff', border: '1px solid #ef4444' };
const btnSuccessSm: React.CSSProperties = { ...btnSm, background: '#22c55e', color: '#fff', border: '1px solid #22c55e' };
const btnWarnSm: React.CSSProperties = { ...btnSm, background: 'var(--gold-400)', color: '#000', border: '1px solid var(--gold-400)' };
const searchInputStyle: React.CSSProperties = { padding: '8px 14px', fontSize: '.82rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-1)', color: 'var(--text-1)', outline: 'none', minWidth: 200 };
const filterSelectStyle: React.CSSProperties = { padding: '8px 12px', fontSize: '.78rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-1)', color: 'var(--text-1)', outline: 'none', cursor: 'pointer' };
const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left' as const, fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' as const };
const tdStyle: React.CSSProperties = { padding: '12px 14px' };

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [openAdminGroups, setOpenAdminGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    sidebarSections.forEach((s, i) => { init[s.title] = i === 0; }); // Only first group open
    return init;
  });
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ root: true, 'minh-huong': true, 'ngoc-anh': true, 'nguyen-a': true, 'thao-linh': true });
  const [treeSearch, setTreeSearch] = useState('');
  const navigate = useNavigate();
  const [adminToast, setAdminToast] = useState('');
  const showToast = (msg: string) => { setAdminToast(msg); setTimeout(() => setAdminToast(''), 5000); };
  // Admin CRUD state
  const [adminUsers, setAdminUsers] = useState(usersData);
  const [adminProducts, setAdminProducts] = useState(productsData);
  const [adminOrders, setAdminOrders] = useState(ordersData);
  const [adminKocs, setAdminKocs] = useState(kocData);
  const [adminVendors, setAdminVendors] = useState(vendorsData);
  // Track status overrides for default CRM sections (key = "tab-rowIndex")
  const [rowOverrides, setRowOverrides] = useState<Record<string, string>>({});
  const overrideRow = (tab: string, rowIdx: number, newStatus: string) => {
    setRowOverrides(prev => ({ ...prev, [`${tab}-${rowIdx}`]: newStatus }));
  };
  // Detail panel state for default sections
  const [detailRow, setDetailRow] = useState<{ tab: string; row: string[]; headers: string[]; title: string; ri: number } | null>(null);
  const [editingField, setEditingField] = useState<Record<string, string>>({});
  const { isDark, toggleTheme } = useTheme();

  const toggleAdminGroup = (title: string) => setOpenAdminGroups(prev => ({ ...prev, [title]: !prev[title] }));
  const handleAdminNavClick = (groupTitle: string, itemKey: string) => {
    setActiveTab(itemKey);
    if (!openAdminGroups[groupTitle]) setOpenAdminGroups(prev => ({ ...prev, [groupTitle]: true }));
  };

  // Search & filter state for upgraded tabs
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [kocSearch, setKocSearch] = useState('');
  const [kocStatusFilter, setKocStatusFilter] = useState('all');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');
  const [crmSearch, setCrmSearch] = useState<Record<string, string>>({});
  // Notification compose state
  const [ntfTitle, setNtfTitle] = useState('');
  const [ntfMessage, setNtfMessage] = useState('');
  const [ntfTarget, setNtfTarget] = useState('All');
  const [ntfChannels, setNtfChannels] = useState<Record<string, boolean>>({ Push: true, Email: false, SMS: false });

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin/login');
    }
  }, [navigate]);

  if (!isAdminLoggedIn()) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: 32, textAlign: 'center', maxWidth: 400, background: 'rgba(15,23,42,.8)', borderRadius: 16, border: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔒</div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>Truy cập bị từ chối</h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.85rem', marginTop: 8 }}>Bạn cần đăng nhập với tài khoản Admin.</p>
          <button onClick={() => navigate('/admin/login')} style={{ marginTop: 16, padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #ef4444, #f97316)', color: '#fff', fontWeight: 700, fontSize: '.88rem' }}>Đăng nhập Admin</button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview kpis={overviewKPIs} users={adminUsers} orders={adminOrders} kocs={adminKocs} vendors={adminVendors} products={adminProducts} commissions={commissionData} onNavigate={setActiveTab} />;

      /* ====== UPGRADED: USERS ====== */
      case 'users': {
        const filteredUsers = adminUsers.filter(u => {
          const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.id.toLowerCase().includes(userSearch.toLowerCase());
          const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
          return matchSearch && matchRole;
        });
        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Quản Lý Người Dùng</h2>
              <div className="flex gap-8" style={{ alignItems: 'center' }}>
                <span className="badge badge-c5" style={{ fontSize: '.75rem', padding: '4px 12px' }}>Tổng: {usersData.length} người dùng</span>
                <button style={btnPrimSm} onClick={() => showToast('Thêm user mới')}>+ Thêm user</button>
              </div>
            </div>
            {/* Search & Filter bar */}
            <div className="flex gap-8" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Tìm theo tên, email, ID..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={searchInputStyle} />
              <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} style={filterSelectStyle}>
                <option value="all">Tất cả vai trò</option>
                <option value="user">Buyer</option>
                <option value="koc">KOC</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
              <span style={{ fontSize: '.75rem', color: 'var(--text-3)', alignSelf: 'center' }}>Hiển thị {filteredUsers.length}/{adminUsers.length}</span>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tham gia', 'Đơn hàng', 'Referrals', 'Hành động'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle} className="mono">{u.id}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{u.name}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-3)' }}>{u.email}</td>
                        <td style={tdStyle}><span className="badge badge-c6">{u.role}</span></td>
                        <td style={tdStyle}><span className={`badge ${statusBadge[u.status]}`}>{statusLabel[u.status]}</span></td>
                        <td style={{ ...tdStyle, color: 'var(--text-3)' }}>{u.joinDate}</td>
                        <td style={tdStyle}>{u.orders}</td>
                        <td style={tdStyle}>{u.referrals > 0 ? <span className="badge badge-c4">{u.referrals}</span> : <span style={{ color: 'var(--text-4)' }}>0</span>}</td>
                        <td style={tdStyle}>
                          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                            <button style={btnSm} onClick={() => showToast(`Đang chỉnh sửa user ${u.name}`)}>Chỉnh sửa</button>
                            <button style={u.status === 'suspended' ? btnSuccessSm : btnWarnSm} onClick={() => (() => { setAdminUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === 'suspended' ? 'active' : 'suspended' } : x)); showToast(`${u.status === 'suspended' ? 'Đã mở khóa' : 'Đã tạm khóa'} user ${u.name}`); })()}>
                              {u.status === 'suspended' ? 'Mở khóa' : 'Tạm khóa'}
                            </button>
                            <button style={btnSm} onClick={() => showToast(`Đang xem tree user ${u.name}`)}>Xem tree</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }

      /* ====== UPGRADED: PRODUCTS ====== */
      case 'products': {
        const filteredProducts = adminProducts.filter(p => {
          const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.id.toLowerCase().includes(productSearch.toLowerCase()) || p.vendor.toLowerCase().includes(productSearch.toLowerCase());
          const matchStatus = productStatusFilter === 'all' || p.status === productStatusFilter;
          return matchSearch && matchStatus;
        });
        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Quản Lý Sản Phẩm</h2>
              <button style={btnPrimSm} onClick={() => showToast('Thêm sản phẩm mới')}>+ Thêm SP</button>
            </div>
            <div className="flex gap-8" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Tìm sản phẩm, vendor, ID..." value={productSearch} onChange={e => setProductSearch(e.target.value)} style={searchInputStyle} />
              <select value={productStatusFilter} onChange={e => setProductStatusFilter(e.target.value)} style={filterSelectStyle}>
                <option value="all">Tất cả trạng thái</option>
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
              <span style={{ fontSize: '.75rem', color: 'var(--text-3)', alignSelf: 'center' }}>Hiển thị {filteredProducts.length}/{adminProducts.length}</span>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'Sản phẩm', 'Vendor', 'Giá', 'DPP', 'Đã bán', 'Trạng thái', 'Hành động'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle} className="mono">{p.id}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{p.name}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-3)' }}>{p.vendor}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{p.price}</td>
                        <td style={tdStyle}>
                          {p.dpp
                            ? <span className="badge badge-c4">DPP ✓</span>
                            : <button style={{ ...btnSm, color: 'var(--c6-500)', borderColor: 'var(--c6-500)' }} onClick={() => showToast(`Đang mint DPP cho ${p.name}`)}>Mint DPP</button>
                          }
                        </td>
                        <td style={tdStyle}>{p.sales.toLocaleString()}</td>
                        <td style={tdStyle}><span className={`badge ${statusBadge[p.status]}`}>{statusLabel[p.status]}</span></td>
                        <td style={tdStyle}>
                          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                            <button style={btnSm} onClick={() => showToast(`Đang sửa sản phẩm ${p.name}`)}>Sửa</button>
                            {p.status === 'pending' && (
                              <>
                                <button style={btnSuccessSm} onClick={() => (() => { setAdminProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: 'active' } : x)); showToast(`Đã duyệt sản phẩm ${p.name}`); })()}>Duyệt</button>
                                <button style={btnWarnSm} onClick={() => (() => { setAdminProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: 'rejected' } : x)); showToast(`Đã từ chối sản phẩm ${p.name}`); })()}>Từ chối</button>
                              </>
                            )}
                            <button style={btnDangerSm} onClick={() => (() => { setAdminProducts(prev => prev.filter(x => x.id !== p.id)); showToast(`Đã xoá sản phẩm ${p.name}`); })()}>Xóa</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }

      /* ====== UPGRADED: ORDERS ====== */
      case 'orders': {
        const filteredOrders = adminOrders.filter(o => {
          const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
          const matchDateFrom = !orderDateFrom || o.date >= orderDateFrom;
          const matchDateTo = !orderDateTo || o.date <= orderDateTo;
          return matchStatus && matchDateFrom && matchDateTo;
        });
        const orderStats = [
          { label: 'Tổng đơn', value: String(adminOrders.length), color: 'var(--c4-500)' },
          { label: 'Chờ xử lý', value: String(adminOrders.filter(o => o.status === 'pending').length), color: 'var(--gold-400)' },
          { label: 'Đang giao', value: String(adminOrders.filter(o => o.status === 'shipping').length), color: 'var(--c6-500)' },
          { label: 'Đã giao', value: String(adminOrders.filter(o => o.status === 'delivered').length), color: 'var(--c5-500)' },
          { label: 'Đã hủy', value: String(adminOrders.filter(o => o.status === 'cancelled').length), color: '#ef4444' },
        ];
        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Quản Lý Đơn Hàng</h2>
            {/* Order stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
              {orderStats.map((s, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{s.label}</div>
                  <div className="kpi-val" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            {/* Filters */}
            <div className="flex gap-8" style={{ marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} style={filterSelectStyle}>
                <option value="all">Tất cả trạng thái</option>
                {orderStatusFlow.map(s => <option key={s} value={s}>{statusLabel[s] || s}</option>)}
                <option value="cancelled">Đã hủy</option>
              </select>
              <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Từ:</span>
              <input type="date" value={orderDateFrom} onChange={e => setOrderDateFrom(e.target.value)} style={{ ...searchInputStyle, minWidth: 140 }} />
              <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Đến:</span>
              <input type="date" value={orderDateTo} onChange={e => setOrderDateTo(e.target.value)} style={{ ...searchInputStyle, minWidth: 140 }} />
              <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>Hiển thị {filteredOrders.length}/{adminOrders.length}</span>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Giá trị', 'Thanh toán', 'Trạng thái', 'Ngày', 'Hành động'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle} className="mono">{o.id}</td>
                        <td style={tdStyle}>{o.customer}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{o.product}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{o.amount}</td>
                        <td style={tdStyle}><span className="badge badge-c7">{o.payMethod}</span></td>
                        <td style={tdStyle}>
                          {o.status !== 'cancelled' ? (
                            <select
                              value={o.status}
                              onChange={e => (() => { setAdminOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: e.target.value } : x)); showToast(`Đã đổi trạng thái đơn ${o.id} thành ${e.target.value}`); })()}
                              style={{ ...filterSelectStyle, padding: '4px 8px', fontSize: '.72rem', minWidth: 120 }}
                            >
                              {orderStatusFlow.map(s => (
                                <option key={s} value={s}>{statusLabel[s] || s}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`badge ${statusBadge[o.status]}`}>{statusLabel[o.status]}</span>
                          )}
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-3)' }}>{o.date}</td>
                        <td style={tdStyle}>
                          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                            <button style={btnSm} onClick={() => showToast(`Đang xem chi tiết đơn ${o.id}`)}>Xem chi tiết</button>
                            {o.status !== 'cancelled' && (
                              <button style={btnWarnSm} onClick={() => showToast(`Đã hoàn tiền đơn ${o.id}`)}>Hoàn tiền</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }

      /* ====== UPGRADED: COMMISSION ====== */
      case 'commission': {
        const commissionStats = [
          { label: 'Tổng pending', value: commissionData.filter(c => c.status === 'pending').reduce((s, c) => s + parseFloat(c.amount), 0).toFixed(1) + 'M₫', color: 'var(--gold-400)' },
          { label: 'Tổng đã trả', value: commissionData.filter(c => c.status === 'paid').reduce((s, c) => s + parseFloat(c.amount), 0).toFixed(1) + 'M₫', color: 'var(--c4-500)' },
          { label: 'Tổng tháng này', value: commissionData.reduce((s, c) => s + parseFloat(c.amount), 0).toFixed(1) + 'M₫', color: 'var(--c6-500)' },
          { label: 'Gas cost ước tính', value: '0.15 MATIC', color: 'var(--c7-500)' },
        ];
        const pendingCount = commissionData.filter(c => c.status === 'pending').length;
        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Quản Lý Hoa Hồng</h2>
              {pendingCount > 0 && (
                <button style={btnPrimSm} onClick={() => showToast(`Đang thanh toán ${pendingCount} commissions...`)}>
                  Thanh toán hàng loạt ({pendingCount})
                </button>
              )}
            </div>
            {/* Commission stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {commissionStats.map((s, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{s.label}</div>
                  <div className="kpi-val" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['KOC', 'Số tiền', 'Đơn hàng', 'Trạng thái', 'TX Hash', 'Ngày', 'Hành động'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commissionData.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{c.koc}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{c.amount}</td>
                        <td style={tdStyle}>{c.orders}</td>
                        <td style={tdStyle}><span className={`badge ${statusBadge[c.status]}`}>{statusLabel[c.status]}</span></td>
                        <td style={tdStyle} className="mono">
                          {c.txHash !== '—' ? (
                            <a href={`https://polygonscan.com/tx/${c.txHash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c6-300)' }}>{c.txHash}</a>
                          ) : '—'}
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-3)' }}>{c.date}</td>
                        <td style={tdStyle}>
                          <div className="flex gap-4">
                            {c.status === 'pending' && (
                              <button style={btnPrimSm} onClick={() => showToast(`Đã thanh toán commission cho ${c.koc}`)}>Thanh toán</button>
                            )}
                            {c.status === 'paid' && c.txHash !== '—' && (
                              <a href={`https://polygonscan.com/tx/${c.txHash}`} target="_blank" rel="noreferrer" style={{ ...btnSm, textDecoration: 'none', color: 'var(--c6-300)', borderColor: 'var(--c6-300)' }}>Xem TX</a>
                            )}
                            {c.status === 'processing' && (
                              <span style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Đang xử lý...</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }

      /* ====== UPGRADED: KOC ====== */
      case 'koc': {
        const filteredKoc = adminKocs.filter(k => {
          const matchSearch = !kocSearch || k.name.toLowerCase().includes(kocSearch.toLowerCase()) || k.id.toLowerCase().includes(kocSearch.toLowerCase());
          const matchStatus = kocStatusFilter === 'all' || k.status === kocStatusFilter;
          return matchSearch && matchStatus;
        });
        // Tier distribution
        const tierCounts: Record<string, number> = {};
        adminKocs.forEach(k => { tierCounts[k.tier] = (tierCounts[k.tier] || 0) + 1; });
        const maxTierCount = Math.max(...Object.values(tierCounts), 1);
        const tierColors: Record<string, string> = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: 'var(--gold-400)', Diamond: 'var(--c4-500)' };

        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Quản Lý KOC</h2>
              <button style={btnPrimSm} onClick={() => showToast('Mời KOC mới')}>+ Mời KOC</button>
            </div>
            <div className="flex gap-8" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Tìm KOC..." value={kocSearch} onChange={e => setKocSearch(e.target.value)} style={searchInputStyle} />
              <select value={kocStatusFilter} onChange={e => setKocStatusFilter(e.target.value)} style={filterSelectStyle}>
                <option value="all">Tất cả</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="review">Review</option>
              </select>
            </div>
            {/* Tier distribution mini chart */}
            <div className="card" style={{ padding: '14px 20px', marginBottom: 16 }}>
              <div className="label" style={{ marginBottom: 10 }}>PHÂN BỐ TIER KOC</div>
              <div className="flex gap-16" style={{ alignItems: 'flex-end' }}>
                {Object.entries(tierCounts).map(([tier, count]) => (
                  <div key={tier} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ height: `${(count / maxTierCount) * 60}px`, minHeight: 8, background: tierColors[tier] || 'var(--c4-500)', borderRadius: '4px 4px 0 0', margin: '0 auto', width: 32, transition: 'height .3s' }} />
                    <div style={{ fontSize: '.68rem', fontWeight: 700, marginTop: 4 }}>{count}</div>
                    <div style={{ fontSize: '.6rem', color: 'var(--text-3)' }}>{tier}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-col gap-12">
              {filteredKoc.map(k => (
                <div key={k.id} className="card" style={{ padding: '18px 24px' }}>
                  <div className="flex" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div className="flex gap-8" style={{ marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="mono" style={{ fontSize: '.65rem', color: 'var(--text-4)' }}>{k.id}</span>
                        <span className={`badge ${statusBadge[k.status]}`}>{statusLabel[k.status]}</span>
                        <span className="badge badge-c7">Lv{k.level}</span>
                        <span className="badge" style={{ background: tierColors[k.tier] ? `${tierColors[k.tier]}22` : 'var(--bg-2)', color: tierColors[k.tier] || 'var(--text-1)', fontSize: '.6rem', border: `1px solid ${tierColors[k.tier] || 'var(--border)'}` }}>{k.tier}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{k.name}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 4 }}>Trust Score: {k.trustScore}</div>
                      <div className="flex gap-4" style={{ marginTop: 6 }}>
                        {k.socialLinks.map(s => (
                          <span key={s} title={s} style={{ fontSize: '.85rem', cursor: 'pointer' }}>{socialIcons[s] || s}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{k.sales}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Hoa hồng: {k.commission}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--c6-500)', marginTop: 4 }}>🔗 {k.affiliateLinks} affiliate links</div>
                      {/* Action buttons */}
                      <div className="flex gap-4" style={{ marginTop: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <select
                          defaultValue={k.tier}
                          onChange={e => (() => { setAdminKocs(prev => prev.map(x => x.id === k.id ? { ...x, tier: e.target.value } : x)); showToast(`Đã nâng cấp tier KOC ${k.name} thành ${e.target.value}`); })()}
                          style={{ ...filterSelectStyle, padding: '4px 8px', fontSize: '.68rem' }}
                        >
                          <option value="Bronze">Bronze</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                          <option value="Diamond">Diamond</option>
                        </select>
                        <button style={k.status === 'suspended' ? btnSuccessSm : btnWarnSm} onClick={() => (() => { setAdminKocs(prev => prev.map(x => x.id === k.id ? { ...x, status: x.status === 'suspended' ? 'active' : 'suspended' } : x)); showToast(`${k.status === 'suspended' ? 'Đã mở khóa' : 'Đã tạm khóa'} KOC ${k.name}`); })()}>
                          {k.status === 'suspended' ? 'Mở khóa' : 'Tạm khóa'}
                        </button>
                        <button style={btnSm} onClick={() => showToast(`Đang xem chi tiết KOC ${k.name}`)}>Xem chi tiết</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      }

      /* ====== NEW: VENDOR MANAGEMENT ====== */
      case 'vendor': {
        const filteredVendors = adminVendors.filter(v => {
          const matchSearch = !vendorSearch || v.shopName.toLowerCase().includes(vendorSearch.toLowerCase()) || v.owner.toLowerCase().includes(vendorSearch.toLowerCase()) || v.id.toLowerCase().includes(vendorSearch.toLowerCase());
          const matchStatus = vendorStatusFilter === 'all' || v.status === vendorStatusFilter;
          return matchSearch && matchStatus;
        });
        const vendorStats = [
          { label: 'Total Vendors', value: String(adminVendors.length), color: 'var(--c4-500)' },
          { label: 'Pending Review', value: String(adminVendors.filter(v => v.status === 'pending').length), color: 'var(--gold-400)' },
          { label: 'Active', value: String(adminVendors.filter(v => v.status === 'active').length), color: 'var(--c5-500)' },
          { label: 'GMV tổng', value: vendorsData.reduce((s, v) => s + parseInt(v.revenue), 0) + 'M₫', color: 'var(--c6-500)' },
        ];
        return (
          <>
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Quản Lý Vendor</h2>
              <button style={btnPrimSm} onClick={() => showToast('Thêm vendor mới')}>+ Thêm Vendor</button>
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {vendorStats.map((s, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{s.label}</div>
                  <div className="kpi-val" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            {/* Search & Filter */}
            <div className="flex gap-8" style={{ marginBottom: 14, flexWrap: 'wrap' }}>
              <input type="text" placeholder="Tìm vendor, owner, ID..." value={vendorSearch} onChange={e => setVendorSearch(e.target.value)} style={searchInputStyle} />
              <select value={vendorStatusFilter} onChange={e => setVendorStatusFilter(e.target.value)} style={filterSelectStyle}>
                <option value="all">Tất cả</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'Tên shop', 'Owner', 'Mã số thuế', 'Sản phẩm', 'Doanh thu', 'Trạng thái', 'Hành động'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle} className="mono">{v.id}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{v.shopName}</td>
                        <td style={tdStyle}>{v.owner}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--ff-mono)', fontSize: '.72rem', color: 'var(--text-3)' }}>{v.taxCode}</td>
                        <td style={tdStyle}>{v.products}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c4-500)' }}>{v.revenue}</td>
                        <td style={tdStyle}><span className={`badge ${statusBadge[v.status]}`}>{statusLabel[v.status]}</span></td>
                        <td style={tdStyle}>
                          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                            {v.status === 'pending' && (
                              <>
                                <button style={btnSuccessSm} onClick={() => (() => { setAdminVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: 'active' } : x)); showToast(`Đã duyệt vendor ${v.shopName}`); })()}>Duyệt</button>
                                <button style={btnWarnSm} onClick={() => (() => { setAdminVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: 'rejected' } : x)); showToast(`Đã từ chối vendor ${v.shopName}`); })()}>Từ chối</button>
                              </>
                            )}
                            {v.status === 'active' && (
                              <button style={btnWarnSm} onClick={() => (() => { setAdminVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: 'suspended' } : x)); showToast(`Đã tạm khóa vendor ${v.shopName}`); })()}>Tạm khóa</button>
                            )}
                            {v.status === 'suspended' && (
                              <button style={btnSuccessSm} onClick={() => (() => { setAdminVendors(prev => prev.map(x => x.id === v.id ? { ...x, status: 'active' } : x)); showToast(`Đã mở khóa vendor ${v.shopName}`); })()}>Mở khóa</button>
                            )}
                            <button style={btnSm} onClick={() => showToast(`Đang xem chi tiết vendor ${v.shopName}`)}>Xem chi tiết</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }

      /* ====== NEW: NOTIFICATIONS ====== */
      case 'notifications': {
        const ntfStats = [
          { label: 'Đã gửi hôm nay', value: '1,234', color: 'var(--c4-500)' },
          { label: 'Tỉ lệ đọc', value: '72%', color: 'var(--c6-500)' },
          { label: 'Đang chờ', value: '3', color: 'var(--gold-400)' },
          { label: 'Đã lên lịch', value: '5', color: 'var(--c5-500)' },
        ];

        const toggleChannel = (ch: string) => {
          setNtfChannels(prev => ({ ...prev, [ch]: !prev[ch] }));
        };

        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>Quản Lý Thông Báo</h2>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {ntfStats.map((s, i) => (
                <div key={i} className="kpi-card">
                  <div className="kpi-label">{s.label}</div>
                  <div className="kpi-val" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            {/* Compose form */}
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div className="label" style={{ marginBottom: 14 }}>SOẠN THÔNG BÁO MỚI</div>
              <div className="flex-col gap-12">
                <div>
                  <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Tiêu đề</label>
                  <input type="text" placeholder="Nhập tiêu đề thông báo..." value={ntfTitle} onChange={e => setNtfTitle(e.target.value)} style={{ ...searchInputStyle, width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Nội dung</label>
                  <textarea placeholder="Nhập nội dung thông báo..." value={ntfMessage} onChange={e => setNtfMessage(e.target.value)} rows={3} style={{ ...searchInputStyle, width: '100%', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <div className="flex gap-16" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Đối tượng</label>
                    <select value={ntfTarget} onChange={e => setNtfTarget(e.target.value)} style={filterSelectStyle}>
                      <option value="All">Tất cả</option>
                      <option value="Buyer">Buyer</option>
                      <option value="KOC">KOC</option>
                      <option value="Vendor">Vendor</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>Kênh gửi</label>
                    <div className="flex gap-8">
                      {['Push', 'Email', 'SMS'].map(ch => (
                        <label key={ch} className="flex gap-4" style={{ cursor: 'pointer', fontSize: '.78rem', alignItems: 'center' }}>
                          <input type="checkbox" checked={ntfChannels[ch] || false} onChange={() => toggleChannel(ch)} />
                          {ch}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    style={btnPrimSm}
                    onClick={() => {
                      const channels = Object.entries(ntfChannels).filter(([, v]) => v).map(([k]) => k).join(', ');
                      showToast(`Đã gửi thông báo '${ntfTitle}' đến ${ntfTarget}`);
                    }}
                  >
                    Gửi ngay
                  </button>
                </div>
              </div>
            </div>
            {/* Recent notifications table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Thông Báo Gần Đây</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'Tiêu đề', 'Đối tượng', 'Kênh', 'Gửi lúc', 'Tỉ lệ đọc', 'Trạng thái'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentNotifications.map(n => (
                      <tr key={n.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle} className="mono">{n.id}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{n.title}</td>
                        <td style={tdStyle}><span className="badge badge-c6">{n.target}</span></td>
                        <td style={tdStyle}>{n.channel}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-3)' }}>{n.sentAt}</td>
                        <td style={tdStyle}>{n.readRate}</td>
                        <td style={tdStyle}><span className={`badge ${statusBadge[n.status] || 'badge-c6'}`}>{statusLabel[n.status] || n.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      }

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
                        <button className="btn btn-primary btn-sm" onClick={() => showToast(`Đã duyệt xác minh #${a.id}`)}>Duyệt</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Đã từ chối xác minh #${a.id}`)}>Từ chối</button>
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

      /* ────── PAYMENT MANAGEMENT ────── */
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
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.map(tx => {
                      const tc = txnTypeConfig[tx.type];
                      return (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={tdStyle} className="mono">{tx.id}</td>
                          <td style={tdStyle}><span className={`badge ${tc.badge}`}>{tc.label}</span></td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{tx.user}</td>
                          <td style={tdStyle}>{tx.method}</td>
                          <td style={{ ...tdStyle, fontFamily: 'var(--ff-display)', fontWeight: 700, color: tx.type === 'refund' ? 'var(--gold-400)' : 'var(--c4-500)' }}>{tx.amount}</td>
                          <td style={tdStyle} className="mono">{tx.orderId}</td>
                          <td style={tdStyle}><span className={`status-pill badge ${statusBadge[tx.status]}`}>{statusLabel[tx.status]}</span></td>
                          <td style={tdStyle} className="mono tx-hash">
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

      /* ────── BLOCKCHAIN MONITOR ────── */
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

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem' }}>Giao Dịch On-chain Gần Đây</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['TX Hash', 'Loại', 'Từ', 'Đến', 'Giá trị', 'Gas', 'Thời gian'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOnchainTx.map((tx, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle} className="mono">
                          <a href={`https://polygonscan.com/tx/${tx.hash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--c6-300)' }}>{tx.hash}</a>
                        </td>
                        <td style={tdStyle}><span className="badge badge-c6">{tx.type}</span></td>
                        <td style={{ ...tdStyle, fontSize: '.72rem' }}>{tx.from}</td>
                        <td style={{ ...tdStyle, fontSize: '.72rem' }}>{tx.to}</td>
                        <td style={{ ...tdStyle, fontFamily: 'var(--ff-display)', fontWeight: 700 }}>{tx.amount}</td>
                        <td style={{ ...tdStyle, color: 'var(--c7-500)', fontSize: '.72rem' }}>{tx.gas}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-3)', fontSize: '.72rem' }}>{tx.date}</td>
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

      /* ────── WALLET MANAGEMENT ────── */
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

      /* ────── REFERRAL TREE VISUALIZATION ────── */
      case 'referralTree': {
        type TreeNode = { id: string; name: string; role: 'KOC' | 'Buyer' | 'Vendor' | 'Root'; level: number; commission: string; referrals: number; children: TreeNode[] };
        const treeData: TreeNode = {
          id: 'root', name: 'CEO / Root', role: 'Root', level: 0, commission: '—', referrals: 3,
          children: [
            { id: 'minh-huong', name: 'Minh Hương', role: 'KOC', level: 1, commission: '45.2M₫', referrals: 12, children: [
              { id: 'nguyen-a', name: 'Nguyễn A', role: 'Buyer', level: 2, commission: '2.3M₫', referrals: 3, children: [
                { id: 'pham-d', name: 'Phạm D', role: 'Buyer', level: 3, commission: '0₫', referrals: 0, children: [] },
                { id: 'van-hoang', name: 'Văn Hoàng', role: 'KOC', level: 3, commission: '1.2M₫', referrals: 2, children: [] },
              ]},
              { id: 'thao-linh', name: 'Thảo Linh', role: 'KOC', level: 2, commission: '38.7M₫', referrals: 8, children: [
                { id: 'le-c', name: 'Lê C', role: 'Buyer', level: 3, commission: '0₫', referrals: 0, children: [] },
              ]},
            ]},
            { id: 'ngoc-anh', name: 'Ngọc Anh', role: 'KOC', level: 1, commission: '32.1M₫', referrals: 5, children: [
              { id: 'tran-b', name: 'Trần B', role: 'Buyer', level: 2, commission: '0₫', referrals: 1, children: [] },
            ]},
            { id: 'dalat-farm', name: 'Đà Lạt Farm', role: 'Vendor', level: 1, commission: '0₫', referrals: 0, children: [] },
          ],
        };

        const roleColors: Record<string, { bg: string; text: string; border: string }> = {
          Root: { bg: 'rgba(239,68,68,.1)', text: '#ef4444', border: '#ef4444' },
          KOC: { bg: 'rgba(6,182,212,.1)', text: '#06b6d4', border: '#06b6d4' },
          Buyer: { bg: 'rgba(34,197,94,.1)', text: '#22c55e', border: '#22c55e' },
          Vendor: { bg: 'rgba(168,85,247,.1)', text: '#a855f7', border: '#a855f7' },
        };

        const toggleNode = (nodeId: string) => {
          setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
        };

        const countNodes = (node: TreeNode): number => {
          return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
        };

        const sumCommission = (node: TreeNode): number => {
          const val = parseFloat(node.commission.replace(/[^\d.]/g, '')) || 0;
          return val + node.children.reduce((sum, c) => sum + sumCommission(c), 0);
        };

        const getMaxLevel = (node: TreeNode): number => {
          if (node.children.length === 0) return node.level;
          return Math.max(node.level, ...node.children.map(c => getMaxLevel(c)));
        };

        const renderTreeNode = (node: TreeNode, _isLast: boolean = false): JSX.Element => {
          const colors = roleColors[node.role];
          const isExpanded = expandedNodes[node.id] !== false;
          const hasChildren = node.children.length > 0;
          const initials = node.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

          const matchesSearch = !treeSearch || node.name.toLowerCase().includes(treeSearch.toLowerCase()) || node.role.toLowerCase().includes(treeSearch.toLowerCase()) || node.id.toLowerCase().includes(treeSearch.toLowerCase());

          return (
            <div key={node.id} style={{ marginLeft: node.level * 24 }}>
              {node.level > 0 && (
                <div style={{ borderLeft: `2px solid ${colors.border}`, height: 12, marginLeft: 18, opacity: 0.4 }} />
              )}
              <div
                onClick={() => hasChildren && toggleNode(node.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                  background: matchesSearch || !treeSearch ? colors.bg : 'var(--bg-1)',
                  border: `1px solid ${matchesSearch && treeSearch ? colors.border : 'var(--border)'}`,
                  borderRadius: 10, marginBottom: 2, cursor: hasChildren ? 'pointer' : 'default',
                  opacity: !treeSearch || matchesSearch ? 1 : 0.4,
                  transition: 'all .2s',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.text}, ${colors.border})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.68rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>{initials}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex gap-8" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '.85rem' }}>{node.name}</span>
                    <span className="badge" style={{ background: colors.bg, color: colors.text, fontSize: '.6rem', border: `1px solid ${colors.border}` }}>{node.role}</span>
                    <span className="badge badge-c7" style={{ fontSize: '.6rem' }}>Level {node.level}</span>
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 2 }}>
                    Commission: <strong style={{ color: colors.text }}>{node.commission}</strong> · {node.referrals} referral{node.referrals !== 1 ? 's' : ''}
                  </div>
                </div>

                {hasChildren && (
                  <span style={{ fontSize: '.85rem', color: 'var(--text-3)', transition: 'transform .2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                )}
              </div>

              {hasChildren && isExpanded && (
                <div style={{ borderLeft: `2px solid ${colors.border}`, marginLeft: 18, paddingLeft: 0, opacity: 0.9 }}>
                  {node.children.map((child, i) => renderTreeNode(child, i === node.children.length - 1))}
                </div>
              )}
            </div>
          );
        };

        return (
          <>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Cây Cộng Đồng — Referral Network</h2>

            <div className="card" style={{ padding: '12px 20px', marginBottom: 20 }}>
              <div className="flex gap-12" style={{ alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Tìm user theo tên, email, mã..."
                  value={treeSearch}
                  onChange={e => setTreeSearch(e.target.value)}
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontSize: '.85rem', color: 'var(--text-1)', padding: '6px 0',
                  }}
                />
                {treeSearch && (
                  <button onClick={() => setTreeSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '.85rem' }}>✕</button>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div className="label" style={{ marginBottom: 16 }}>REFERRAL TREE</div>
              {renderTreeNode(treeData)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="kpi-card">
                <div className="kpi-label">Total nodes</div>
                <div className="kpi-val" style={{ color: 'var(--c4-500)' }}>{countNodes(treeData)}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Total commission</div>
                <div className="kpi-val" style={{ color: 'var(--gold-400)' }}>{sumCommission(treeData).toFixed(1)}M₫</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Deepest level</div>
                <div className="kpi-val" style={{ color: 'var(--c6-500)' }}>{getMaxLevel(treeData)}</div>
              </div>
            </div>
          </>
        );
      }

      case 'kyc':
        return <AdminKYC showToast={showToast} />;

      default: {
        const currentTab = sidebarTabs.find(t => t.key === activeTab);
        const tabName = currentTab?.label || activeTab;
        const tabIcon = currentTab?.icon || '📋';

        const crmSections: Record<string, { title: string; stats: { label: string; value: string; delta: string; color: string }[]; tableHeaders: string[]; tableRows: string[][] }> = {
          kyc: {
            title: 'KYC / Xác Minh Tài Khoản',
            stats: [
              { label: 'Chờ xác minh', value: '23', delta: '+5 hôm nay', color: 'var(--gold-400)' },
              { label: 'Đã duyệt', value: '8,412', delta: '98.2%', color: 'var(--c4-500)' },
              { label: 'Từ chối', value: '156', delta: '1.8%', color: '#ef4444' },
              { label: 'TB thời gian duyệt', value: '4.2h', delta: '-15% tuần này', color: 'var(--c6-500)' },
            ],
            tableHeaders: ['ID', 'Họ tên', 'CCCD', 'Ngày nộp', 'Trạng thái', 'Hành động'],
            tableRows: [
              ['KYC-089', 'Nguyễn Thị Lan', '001***4567', '2026-03-27', 'pending', 'Review'],
              ['KYC-088', 'Trần Văn Minh', '024***8901', '2026-03-27', 'pending', 'Review'],
              ['KYC-087', 'Lê Hoàng Nam', '036***2345', '2026-03-26', 'approved', '—'],
            ],
          },
          membership: {
            title: 'Membership & Subscription',
            stats: [
              { label: 'Free', value: '9,234', delta: '71.9%', color: 'var(--text-3)' },
              { label: 'Bronze', value: '1,892', delta: '14.7%', color: '#cd7f32' },
              { label: 'Silver', value: '1,024', delta: '8.0%', color: '#c0c0c0' },
              { label: 'Gold+Diamond', value: '697', delta: '5.4%', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['User', 'Gói', 'Giá/tháng', 'Bắt đầu', 'Hết hạn', 'Trạng thái'],
            tableRows: [
              ['Minh Hương', 'Diamond', '₫1,999K', '2026-02-01', '2026-04-01', 'active'],
              ['Thảo Linh', 'Gold', '₫999K', '2026-03-15', '2026-04-15', 'active'],
              ['Ngọc Anh', 'Silver', '₫599K', '2026-03-01', '2026-04-01', 'active'],
            ],
          },
          returns: {
            title: 'Đổi Trả / Hoàn Tiền',
            stats: [
              { label: 'Yêu cầu mới', value: '12', delta: '+3 hôm nay', color: 'var(--gold-400)' },
              { label: 'Đang xử lý', value: '8', delta: 'TB 2.1 ngày', color: 'var(--c6-500)' },
              { label: 'Đã hoàn tiền', value: '234', delta: 'Tháng này', color: 'var(--c4-500)' },
              { label: 'Tỉ lệ đổi trả', value: '2.6%', delta: '-0.3% MoM', color: 'var(--c5-500)' },
            ],
            tableHeaders: ['Mã', 'Khách hàng', 'Sản phẩm', 'Lý do', 'Số tiền', 'Trạng thái'],
            tableRows: [
              ['RTN-045', 'Nguyễn Văn A', 'Serum Vitamin C', 'Hàng lỗi', '459K₫', 'pending'],
              ['RTN-044', 'Trần Thị B', 'Trà Ô Long', 'Không đúng mô tả', '389K₫', 'approved'],
              ['RTN-043', 'Lê Văn C', 'Kem chống nắng', 'Dị ứng', '199K₫', 'processing'],
            ],
          },
          shipping: {
            title: 'Quản Lý Vận Chuyển',
            stats: [
              { label: 'Đang giao', value: '456', delta: 'GHN: 312, GHTK: 144', color: 'var(--c6-500)' },
              { label: 'Giao thành công', value: '7,823', delta: '96.8%', color: 'var(--c4-500)' },
              { label: 'Giao thất bại', value: '89', delta: '1.1%', color: '#ef4444' },
              { label: 'TB thời gian giao', value: '2.4 ngày', delta: '-8% MoM', color: 'var(--c5-500)' },
            ],
            tableHeaders: ['Mã đơn', 'Đơn vị', 'Mã tracking', 'Trạng thái', 'Ngày gửi', 'Dự kiến'],
            tableRows: [
              ['ORD-892', 'GHN', 'GHN23456789', 'Đang giao', '2026-03-26', '2026-03-28'],
              ['ORD-891', 'GHTK', 'GHTK34567890', 'Đã lấy hàng', '2026-03-26', '2026-03-29'],
            ],
          },
          promotions: {
            title: 'Khuyến Mại & Voucher',
            stats: [
              { label: 'Voucher đang chạy', value: '18', delta: '+3 mới', color: 'var(--c7-500)' },
              { label: 'Đã sử dụng', value: '4,567', delta: 'Tháng này', color: 'var(--c4-500)' },
              { label: 'Tổng giảm giá', value: '89M₫', delta: '+23% MoM', color: 'var(--gold-400)' },
              { label: 'Conversion rate', value: '12.4%', delta: '+2.1%', color: 'var(--c5-500)' },
            ],
            tableHeaders: ['Mã', 'Tên', 'Loại', 'Giá trị', 'Đã dùng', 'Hết hạn'],
            tableRows: [
              ['WELCOME50', 'Chào mừng thành viên mới', 'Giảm giá', '50K₫', '1,234/∞', '2026-12-31'],
              ['FLASH30', 'Flash Sale 30%', 'Phần trăm', '30%', '89/200', '2026-03-31'],
            ],
          },
          groupbuy: {
            title: 'Mua Nhóm (Group Buy)',
            stats: [
              { label: 'Đang diễn ra', value: '8', delta: '+2 hôm nay', color: 'var(--c7-500)' },
              { label: 'Hoàn thành', value: '156', delta: 'Tháng này', color: 'var(--c4-500)' },
              { label: 'Tổng người tham gia', value: '3,421', delta: '+45% MoM', color: 'var(--c6-500)' },
              { label: 'GMV nhóm mua', value: '234M₫', delta: '+67%', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['ID', 'Sản phẩm', 'Mục tiêu', 'Đã tham gia', 'Giảm', 'Hết hạn'],
            tableRows: [
              ['GB-034', 'Serum Vitamin C', '100', '67/100', '-30%', '2026-03-29'],
              ['GB-033', 'Trà Ô Long Premium', '50', '50/50', '-25%', 'Hoàn thành'],
            ],
          },
          affiliate: {
            title: 'Affiliate Links & UTM',
            stats: [
              { label: 'Link đang hoạt động', value: '8,923', delta: '+234 tuần này', color: 'var(--c6-500)' },
              { label: 'Tổng clicks', value: '1.2M', delta: '+18% MoM', color: 'var(--c5-500)' },
              { label: 'CVR trung bình', value: '4.8%', delta: '+0.3%', color: 'var(--c4-500)' },
              { label: 'Doanh thu affiliate', value: '456M₫', delta: 'Tháng này', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['KOC', 'Link', 'Clicks', 'Orders', 'CVR', 'Revenue'],
            tableRows: [
              ['Minh Hương', 'wk.co/mh-serum', '12,345', '592', '4.8%', '45.2M₫'],
              ['Thảo Linh', 'wk.co/tl-tea', '8,901', '401', '4.5%', '38.7M₫'],
            ],
          },
          content: {
            title: 'Content Moderation',
            stats: [
              { label: 'Chờ duyệt', value: '34', delta: '+8 hôm nay', color: 'var(--gold-400)' },
              { label: 'Đã duyệt', value: '12,456', delta: 'Tổng', color: 'var(--c4-500)' },
              { label: 'Bị gắn cờ', value: '23', delta: 'Cần review', color: '#ef4444' },
              { label: 'Auto-reject', value: '89', delta: 'AI phát hiện', color: 'var(--c5-500)' },
            ],
            tableHeaders: ['ID', 'Loại', 'Tác giả', 'Nội dung', 'Ngày', 'Trạng thái'],
            tableRows: [
              ['CNT-234', 'Review', 'user_abc', 'Sản phẩm tuyệt vời...', '2026-03-27', 'pending'],
              ['CNT-233', 'Bình luận', 'user_xyz', 'Spam detected...', '2026-03-27', 'rejected'],
            ],
          },
          reviews: {
            title: 'Reviews & Đánh Giá',
            stats: [
              { label: 'Tổng reviews', value: '18,234', delta: '+456 tuần này', color: 'var(--c6-500)' },
              { label: 'TB đánh giá', value: '4.3⭐', delta: 'Ổn định', color: 'var(--gold-400)' },
              { label: 'Bị flag', value: '12', delta: 'Cần review', color: '#ef4444' },
              { label: 'On-chain verified', value: '15,678', delta: '86%', color: 'var(--c4-500)' },
            ],
            tableHeaders: ['Product', 'User', 'Rating', 'Nội dung', 'On-chain', 'Trạng thái'],
            tableRows: [
              ['Serum Vitamin C', 'Nguyễn A', '⭐⭐⭐⭐⭐', 'Sản phẩm rất tốt...', '✅', 'active'],
              ['Trà Ô Long', 'Trần B', '⭐⭐', 'Không như mong đợi...', '✅', 'flagged'],
            ],
          },
          live: {
            title: 'Live Commerce',
            stats: [
              { label: 'Đang phát sóng', value: '3', delta: 'Real-time', color: '#ef4444' },
              { label: 'Tổng viewers', value: '1,234', delta: 'Đang xem', color: 'var(--c6-500)' },
              { label: 'Đơn từ Live', value: '89', delta: 'Hôm nay', color: 'var(--c4-500)' },
              { label: 'GMV Live', value: '34M₫', delta: '+56% MoM', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['KOC', 'Tiêu đề', 'Viewers', 'Đơn hàng', 'GMV', 'Trạng thái'],
            tableRows: [
              ['Minh Hương', 'Flash Sale Serum', '456', '23', '8.9M₫', '🔴 LIVE'],
              ['Thảo Linh', 'Unbox Trà Premium', '312', '15', '5.2M₫', '🔴 LIVE'],
            ],
          },
          dpp: {
            title: 'DPP NFT Management',
            stats: [
              { label: 'DPP đã mint', value: '3,456', delta: '+89 tuần này', color: 'var(--c4-500)' },
              { label: 'Verified scans', value: '14,203', delta: 'Hôm nay', color: 'var(--c6-500)' },
              { label: 'Tỉ lệ verified', value: '98.2%', delta: '+0.3%', color: 'var(--c5-500)' },
              { label: 'Gas cost', value: '12.3 MATIC', delta: 'Tháng này', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Token ID', 'Product', 'Vendor', 'TX Hash', 'Scans', 'Ngày mint'],
            tableRows: [
              ['#3456', 'Trà Ô Long Premium', 'WellKOC Origin', '0x1a2b...9f3c', '1,247', '2026-03-25'],
              ['#3455', 'Serum Vitamin C', 'K-Beauty VN', '0x4d5e...8a2b', '892', '2026-03-24'],
            ],
          },
          token: {
            title: 'WK Token Management',
            stats: [
              { label: 'Tổng supply', value: '1B WK', delta: 'ERC-20', color: 'var(--c7-500)' },
              { label: 'Circulating', value: '234M WK', delta: '23.4%', color: 'var(--c6-500)' },
              { label: 'Staked', value: '89M WK', delta: 'APY 8%', color: 'var(--c4-500)' },
              { label: 'Giá hiện tại', value: '$0.042', delta: '+12.5% 24h', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Event', 'Amount', 'User', 'Type', 'TX Hash', 'Thời gian'],
            tableRows: [
              ['Stake', '10,000 WK', 'Minh Hương', 'Lock 30d', '0xab12...ef56', '2026-03-27'],
              ['Reward', '500 WK', 'Commission Pool A', 'Auto', '0xcd34...gh78', '2026-03-27'],
            ],
          },
          aiAgents: {
            title: '333 AI Agents Dashboard',
            stats: [
              { label: 'Agents online', value: '325/333', delta: '97.3%', color: 'var(--c4-500)' },
              { label: 'Tasks hôm nay', value: '2,345', delta: '+18%', color: 'var(--c6-500)' },
              { label: 'Tokens used', value: '4.5M', delta: 'Claude API', color: 'var(--c5-500)' },
              { label: 'TB response', value: '1.2s', delta: '-0.3s', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Agent', 'Type', 'Tasks', 'Success Rate', 'Avg Time', 'Status'],
            tableRows: [
              ['A01 Caption Gen', 'Content', '456', '98.2%', '1.1s', 'online'],
              ['A03 Hashtag AI', 'Content', '892', '97.8%', '0.8s', 'online'],
              ['B03 Dynamic Pricing', 'Commerce', '123', '95.4%', '2.3s', 'online'],
              ['B13 Fraud Detect', 'Security', '1,234', '99.1%', '0.05s', 'online'],
            ],
          },
          fraud: {
            title: 'Fraud Detection & Security',
            stats: [
              { label: 'Cảnh báo mới', value: '7', delta: 'Hôm nay', color: '#ef4444' },
              { label: 'Self-referral blocked', value: '23', delta: 'Tháng này', color: 'var(--gold-400)' },
              { label: 'Orders flagged', value: '45', delta: '0.5% tổng', color: 'var(--c5-500)' },
              { label: 'False positive', value: '0.08%', delta: 'Rất tốt', color: 'var(--c4-500)' },
            ],
            tableHeaders: ['Alert', 'Type', 'User', 'Risk Score', 'Amount', 'Action'],
            tableRows: [
              ['FRD-078', 'Self-referral', 'user_suspicious', '92/100', '2.3M₫', 'Auto-blocked'],
              ['FRD-077', 'Unusual pattern', 'user_abc', '67/100', '890K₫', 'Review'],
            ],
          },
          gamification: {
            title: 'Gamification & XP System',
            stats: [
              { label: 'Daily active users', value: '3,456', delta: '+12%', color: 'var(--c6-500)' },
              { label: 'XP earned hôm nay', value: '234K', delta: '+8%', color: 'var(--c4-500)' },
              { label: 'Missions completed', value: '1,892', delta: 'Tuần này', color: 'var(--c5-500)' },
              { label: 'Check-in streak avg', value: '4.2 ngày', delta: '+0.5', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['User', 'Level', 'XP', 'Tier', 'Streak', 'Achievements'],
            tableRows: [
              ['Minh Hương', '12', '45,200', 'Diamond', '15 ngày', '23/50'],
              ['Thảo Linh', '10', '38,700', 'Gold', '8 ngày', '19/50'],
            ],
          },
          analytics: {
            title: 'Analytics & Business Intelligence',
            stats: [
              { label: 'GMV tháng', value: '1.28B₫', delta: '+18.5%', color: 'var(--c4-500)' },
              { label: 'AOV', value: '143K₫', delta: '+5.2%', color: 'var(--c6-500)' },
              { label: 'Conversion Rate', value: '3.8%', delta: '+0.4%', color: 'var(--c5-500)' },
              { label: 'Customer LTV', value: '1.2M₫', delta: '+15%', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Metric', 'Tuần này', 'Tuần trước', 'Thay đổi', 'Trend'],
            tableRows: [
              ['Doanh thu', '320M₫', '285M₫', '+12.3%', '📈'],
              ['Đơn hàng', '2,234', '1,987', '+12.4%', '📈'],
              ['Người dùng mới', '342', '289', '+18.3%', '📈'],
              ['KOC active', '1,245', '1,156', '+7.7%', '📈'],
            ],
          },
          referralTree: {
            title: 'Cây Cộng Đồng (Referral Network)',
            stats: [
              { label: 'Tổng network', value: '12,847', delta: 'Tất cả users', color: 'var(--c4-500)' },
              { label: 'Cấp sâu nhất', value: '5', delta: 'Max depth', color: 'var(--c6-500)' },
              { label: 'Tổng commission network', value: '456M₫', delta: '+23% MoM', color: 'var(--gold-400)' },
              { label: 'Active members', value: '8,234', delta: '64.1%', color: 'var(--c5-500)' },
            ],
            tableHeaders: ['User', 'Người giới thiệu', 'Cấp', 'Số referral trực tiếp', 'Commission', 'Trạng thái'],
            tableRows: [
              ['Minh Hương', '— (Root)', '1', '12', '45.2M₫', 'active'],
              ['Nguyễn A', 'Minh Hương', '2', '3', '2.3M₫', 'active'],
              ['Thảo Linh', 'Minh Hương', '2', '8', '38.7M₫', 'active'],
              ['Ngọc Anh', '— (Root)', '1', '5', '32.1M₫', 'active'],
              ['Trần B', 'Ngọc Anh', '2', '1', '0₫', 'active'],
              ['Văn Hoàng', 'Nguyễn A', '3', '2', '1.2M₫', 'review'],
            ],
          },
          reports: {
            title: 'Báo Cáo Tổng Hợp',
            stats: [
              { label: 'Báo cáo tháng', value: '12', delta: 'Auto-gen', color: 'var(--c4-500)' },
              { label: 'Báo cáo tuần', value: '52', delta: 'Năm 2026', color: 'var(--c6-500)' },
              { label: 'Download tháng', value: '234', delta: 'Admin team', color: 'var(--c5-500)' },
              { label: 'Scheduled', value: '5', delta: 'Auto-email', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Báo cáo', 'Loại', 'Kỳ', 'Tạo lúc', 'Kích thước', 'Trạng thái'],
            tableRows: [
              ['Doanh thu tháng 3/2026', 'Revenue', 'Tháng', '2026-03-28', '2.4MB', 'active'],
              ['KOC Performance Q1', 'KOC', 'Quý', '2026-03-25', '5.1MB', 'active'],
              ['Commission Audit', 'Finance', 'Tháng', '2026-03-20', '1.8MB', 'active'],
            ],
          },
          feed: {
            title: 'Social Feed Management',
            stats: [
              { label: 'Bài đăng hôm nay', value: '456', delta: '+12%', color: 'var(--c6-500)' },
              { label: 'Tổng engagement', value: '23.4K', delta: 'Likes+Comments', color: 'var(--c4-500)' },
              { label: 'Video views', value: '89K', delta: 'Hôm nay', color: 'var(--c5-500)' },
              { label: 'Trending hashtags', value: '15', delta: 'Đang hot', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['ID', 'KOC', 'Loại', 'Engagement', 'Views', 'Trạng thái'],
            tableRows: [
              ['POST-2345', 'Minh Hương', 'Video review', '1,234', '12.3K', 'active'],
              ['POST-2344', 'Thảo Linh', 'Ảnh sản phẩm', '892', '5.6K', 'active'],
              ['POST-2343', 'user_abc', 'Spam content', '2', '34', 'pending'],
            ],
          },
          academy: {
            title: 'KOC Academy Management',
            stats: [
              { label: 'Tổng khóa học', value: '24', delta: '6 mới tháng này', color: 'var(--c6-500)' },
              { label: 'Học viên', value: '3,456', delta: '+234 tuần', color: 'var(--c4-500)' },
              { label: 'Hoàn thành', value: '1,892', delta: '54.7%', color: 'var(--c5-500)' },
              { label: 'Đánh giá TB', value: '4.7⭐', delta: 'Rất tốt', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Khóa học', 'Giảng viên', 'Học viên', 'Hoàn thành', 'Đánh giá', 'Trạng thái'],
            tableRows: [
              ['KOC 101: Bắt đầu', 'Minh Hương', '1,234', '89%', '4.8⭐', 'active'],
              ['Content Marketing Pro', 'Thảo Linh', '567', '72%', '4.6⭐', 'active'],
              ['Live Commerce Mastery', 'Ngọc Anh', '234', '45%', '4.9⭐', 'active'],
            ],
          },
          reputation: {
            title: 'Reputation NFT System',
            stats: [
              { label: 'NFT đã mint', value: '8,234', delta: 'Soulbound', color: 'var(--c7-500)' },
              { label: 'TB Trust Score', value: '78.3', delta: '+2.1 tháng', color: 'var(--c4-500)' },
              { label: 'Badges issued', value: '12,456', delta: '15 loại', color: 'var(--c6-500)' },
              { label: 'On-chain proofs', value: '45K', delta: 'Polygon', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['User', 'Trust Score', 'Level', 'Badges', 'NFT ID', 'Trạng thái'],
            tableRows: [
              ['Minh Hương', '92/100', 'Diamond', '12', '#REP-001', 'active'],
              ['Thảo Linh', '88/100', 'Gold', '9', '#REP-002', 'active'],
              ['Ngọc Anh', '85/100', 'Gold', '7', '#REP-003', 'active'],
            ],
          },
          aiCaption: {
            title: 'AI Caption & Hashtag Generator',
            stats: [
              { label: 'Captions hôm nay', value: '1,234', delta: '+23%', color: 'var(--c6-500)' },
              { label: 'Hashtags generated', value: '5,678', delta: 'Auto', color: 'var(--c4-500)' },
              { label: 'Avg quality score', value: '8.7/10', delta: '+0.3', color: 'var(--c5-500)' },
              { label: 'Languages', value: '5', delta: 'vi/en/zh/hi/th', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Thời gian', 'KOC', 'Product', 'Caption (preview)', 'Score', 'Trạng thái'],
            tableRows: [
              ['16:30', 'Minh Hương', 'Serum Vitamin C', 'Da sáng mịn sau 7 ngày...', '9.2', 'active'],
              ['16:25', 'Thảo Linh', 'Trà Ô Long', 'Trà ngon từ đỉnh núi...', '8.8', 'active'],
            ],
          },
          aiScheduler: {
            title: 'Content Calendar & Scheduler',
            stats: [
              { label: 'Scheduled posts', value: '89', delta: 'Tuần này', color: 'var(--c6-500)' },
              { label: 'Auto-published', value: '234', delta: 'Tháng này', color: 'var(--c4-500)' },
              { label: 'Best time AI', value: '19:00-21:00', delta: 'Peak engagement', color: 'var(--c5-500)' },
              { label: 'Platforms', value: '8', delta: 'Multi-channel', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Post', 'KOC', 'Platform', 'Scheduled', 'Trạng thái', 'Engagement dự kiến'],
            tableRows: [
              ['Review Serum mới', 'Minh Hương', 'TikTok + IG', '2026-03-29 19:00', 'pending', '~5K views'],
              ['Unbox Trà Premium', 'Thảo Linh', 'YouTube + FB', '2026-03-29 20:30', 'pending', '~3K views'],
            ],
          },
          leaderboard: {
            title: 'Leaderboard & Rankings',
            stats: [
              { label: 'Top KOC tháng', value: 'Minh Hương', delta: '45.2M₫ revenue', color: 'var(--gold-400)' },
              { label: 'Top Vendor', value: 'WellKOC Origin', delta: '89.5M₫', color: 'var(--c4-500)' },
              { label: 'Rising Star', value: 'Phương Thảo', delta: '+340% MoM', color: 'var(--c6-500)' },
              { label: 'Total prizes', value: '12M₫', delta: 'Tháng này', color: 'var(--c5-500)' },
            ],
            tableHeaders: ['Rank', 'KOC', 'Revenue', 'Orders', 'CVR', 'Prize'],
            tableRows: [
              ['🥇 1', 'Minh Hương', '45.2M₫', '592', '4.8%', '5M₫'],
              ['🥈 2', 'Thảo Linh', '38.7M₫', '401', '4.5%', '3M₫'],
              ['🥉 3', 'Ngọc Anh', '32.1M₫', '356', '4.2%', '2M₫'],
              ['4', 'Văn Hoàng', '18.9M₫', '198', '3.8%', '1M₫'],
              ['5', 'Phương Thảo', '12.4M₫', '145', '3.5%', '1M₫'],
            ],
          },
          achievements: {
            title: 'Achievements & Badges System',
            stats: [
              { label: 'Loại badges', value: '15', delta: '5 mới Q1', color: 'var(--c7-500)' },
              { label: 'Badges issued', value: '12,456', delta: 'Tổng', color: 'var(--c4-500)' },
              { label: 'Users có badge', value: '4,567', delta: '35.5%', color: 'var(--c6-500)' },
              { label: 'Rare badges', value: '234', delta: '<1% users', color: 'var(--gold-400)' },
            ],
            tableHeaders: ['Badge', 'Tên', 'Điều kiện', 'Đã cấp', 'Rarity', 'Trạng thái'],
            tableRows: [
              ['🏆', 'Top KOC', 'Revenue > 10M₫/tháng', '45', '0.35%', 'active'],
              ['⭐', 'First Sale', 'Đơn hàng đầu tiên', '8,234', '64%', 'active'],
              ['🔥', 'Streak Master', 'Check-in 30 ngày liên tục', '123', '0.96%', 'active'],
              ['💎', 'Diamond KOC', 'Level 10+ & Trust > 90', '12', '0.09%', 'active'],
            ],
          },
          logs: {
            title: 'Audit Logs',
            stats: [
              { label: 'Events hôm nay', value: '12,345', delta: 'All actions', color: 'var(--c6-500)' },
              { label: 'Admin actions', value: '89', delta: '3 admins', color: 'var(--c5-500)' },
              { label: 'Security events', value: '12', delta: 'Login fails', color: '#ef4444' },
              { label: 'API calls', value: '456K', delta: 'p95: 45ms', color: 'var(--c4-500)' },
            ],
            tableHeaders: ['Thời gian', 'User', 'Action', 'Target', 'IP', 'Status'],
            tableRows: [
              ['16:41:23', 'admin@wellkoc', 'KYC_APPROVE', 'user_089', '192.168.1.1', 'success'],
              ['16:38:12', 'admin@wellkoc', 'ORDER_REFUND', 'ORD-892', '192.168.1.1', 'success'],
              ['16:35:01', 'system', 'COMMISSION_BATCH', '50 records', '—', 'completed'],
            ],
          },
        };

        const section = crmSections[activeTab];
        if (section) {
          const currentCrmSearch = crmSearch[activeTab] || '';
          const statusColIdx = section.tableHeaders.findIndex(h => h.toLowerCase().includes('trạng thái') || h.toLowerCase() === 'status' || h.toLowerCase() === 'action');
          const actionColIdx = section.tableHeaders.findIndex(h => h.toLowerCase().includes('hành động') || h.toLowerCase() === 'action');

          const filteredRows = section.tableRows.filter(row => {
            if (!currentCrmSearch) return true;
            return row.some(cell => cell.toLowerCase().includes(currentCrmSearch.toLowerCase()));
          });

          return (
            <>
              <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{section.title}</h2>
                <button style={btnSm} onClick={() => {
                  const csv = [section.tableHeaders.join(','), ...section.tableRows.map(r => r.join(','))].join('\n');
                  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `wellkoc-${activeTab}-${new Date().toISOString().slice(0,10)}.csv`; a.click();
                  URL.revokeObjectURL(url);
                  showToast(`Đã tải xuống file CSV cho ${section.title}`);
                }}>Xuất Excel</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {section.stats.map((s, i) => (
                  <div key={i} className="kpi-card">
                    <div className="kpi-label">{s.label}</div>
                    <div className="kpi-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="kpi-delta delta-up">↑ {s.delta}</div>
                  </div>
                ))}
              </div>
              {/* Search bar */}
              <div className="flex gap-8" style={{ marginBottom: 14 }}>
                <input
                  type="text"
                  placeholder={`Tìm trong ${section.title}...`}
                  value={currentCrmSearch}
                  onChange={e => setCrmSearch(prev => ({ ...prev, [activeTab]: e.target.value }))}
                  style={searchInputStyle}
                />
                <span style={{ fontSize: '.75rem', color: 'var(--text-3)', alignSelf: 'center' }}>Hiển thị {filteredRows.length}/{section.tableRows.length}</span>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {section.tableHeaders.map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                        <th style={thStyle}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, ri) => {
                        const overrideKey = `${activeTab}-${ri}`;
                        const overriddenStatus = rowOverrides[overrideKey];
                        const effectiveStatus = overriddenStatus || (statusColIdx >= 0 ? row[statusColIdx] : '');
                        const isPending = effectiveStatus === 'pending' || effectiveStatus === 'Review';
                        return (
                          <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                            {row.map((cell, ci) => {
                              const displayCell = (ci === statusColIdx && overriddenStatus) ? overriddenStatus : cell;
                              return (
                                <td key={ci} style={{ ...tdStyle, fontWeight: ci === 0 ? 600 : 400, color: ci === 0 ? 'var(--text-1)' : 'var(--text-2)' }}>
                                  {statusLabel[displayCell] ? <span className={`badge ${statusBadge[displayCell] || 'badge-c6'}`}>{statusLabel[displayCell]}</span> : displayCell}
                                </td>
                              );
                            })}
                            <td style={tdStyle}>
                              <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                                {isPending && (
                                  <>
                                    <button style={btnSuccessSm} onClick={() => { overrideRow(activeTab, ri, 'approved'); showToast(`✅ Đã duyệt ${row[0]}`); }}>Duyệt</button>
                                    <button style={btnDangerSm} onClick={() => { overrideRow(activeTab, ri, 'rejected'); showToast(`❌ Đã từ chối ${row[0]}`); }}>Từ chối</button>
                                  </>
                                )}
                                <button style={btnSm} onClick={() => { setDetailRow({ tab: activeTab, row: [...row], headers: section.tableHeaders, title: section.title, ri }); setEditingField({}); }}>Xem</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ═══ DETAIL PANEL — read-only drill-down ═══ */}
              {detailRow && detailRow.tab === activeTab && (() => {
                const effectiveStatus = rowOverrides[`${activeTab}-${detailRow.ri}`] || (statusColIdx >= 0 ? detailRow.row[statusColIdx] : '');
                const isPendingDetail = effectiveStatus === 'pending' || effectiveStatus === 'Review';
                return (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setDetailRow(null)}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} />
                  <div style={{ position: 'relative', width: '55%', maxWidth: 680, minWidth: 380, height: '100%', background: 'var(--bg-1)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', animation: 'slideInRight .25s ease' }} onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Chi tiết: {detailRow.row[0]}</h3>
                          <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: 4 }}>{detailRow.title}</div>
                        </div>
                        <button onClick={() => setDetailRow(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
                      </div>
                    </div>

                    {/* Content — read-only info cards */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Summary grid: show key fields as read-only cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        {detailRow.headers.map((header, ci) => {
                          const cellValue = detailRow.row[ci];
                          const isStatus = statusLabel[cellValue] !== undefined;
                          const overriddenStatus = rowOverrides[`${activeTab}-${detailRow.ri}`];
                          const displayValue = (ci === statusColIdx && overriddenStatus) ? overriddenStatus : cellValue;
                          return (
                            <div key={ci} style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                              <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, marginBottom: 4 }}>{header}</div>
                              {(isStatus || statusLabel[displayValue]) ? (
                                <span className={`badge ${statusBadge[displayValue] || 'badge-c6'}`} style={{ fontSize: '.72rem' }}>{statusLabel[displayValue] || displayValue}</span>
                              ) : (
                                <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{displayValue}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Contextual related data based on tab */}
                      {activeTab === 'analytics' && (() => {
                        const metric = detailRow.row[0];
                        if (metric === 'Doanh thu') return (
                          <div style={{ marginTop: 8 }}>
                            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Chi tiết doanh thu theo sản phẩm</h4>
                            <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ background: 'var(--bg-0)' }}>
                                  {['Sản phẩm', 'Vendor', 'Doanh số', 'Giá'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: '.62rem', color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                  {adminProducts.filter(p => p.sales > 0).sort((a, b) => b.sales - a.sales).map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', fontWeight: 600 }}>{p.name}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', color: 'var(--text-3)' }}>{p.vendor}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', fontWeight: 700, color: 'var(--c4-500)' }}>{p.sales.toLocaleString()}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem' }}>{p.price}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                              {adminVendors.map(v => (
                                <div key={v.id} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                  <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>{v.shopName}</div>
                                  <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--c4-500)', marginTop: 2 }}>{v.revenue}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                        if (metric === 'Đơn hàng') return (
                          <div style={{ marginTop: 8 }}>
                            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Pipeline đơn hàng</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                              {[
                                { label: 'Chờ xác nhận', count: adminOrders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
                                { label: 'Đang xử lý', count: adminOrders.filter(o => ['confirmed', 'packing', 'shipping'].includes(o.status)).length, color: 'var(--c6-500)' },
                                { label: 'Hoàn thành', count: adminOrders.filter(o => o.status === 'delivered').length, color: 'var(--c4-500)' },
                              ].map((s, i) => (
                                <div key={i} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                                  <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>{s.label}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ background: 'var(--bg-0)' }}>
                                  {['Mã', 'Khách hàng', 'Sản phẩm', 'Số tiền', 'Trạng thái'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: '.62rem', color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                  {adminOrders.map(o => (
                                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', background: o.status === 'cancelled' ? 'rgba(239,68,68,.06)' : 'transparent' }}>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', fontWeight: 600 }}>{o.id}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem' }}>{o.customer}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem' }}>{o.product}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', fontWeight: 700, color: 'var(--c4-500)' }}>{o.amount}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem' }}><span className={`badge ${statusBadge[o.status] || 'badge-c6'}`} style={{ fontSize: '.6rem' }}>{statusLabel[o.status] || o.status}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                        if (metric === 'Người dùng mới') return (
                          <div style={{ marginTop: 8 }}>
                            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Phân loại người dùng mới</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                              {[
                                { label: 'Buyer', count: adminUsers.filter(u => u.role === 'user').length, color: 'var(--c4-500)' },
                                { label: 'KOC', count: adminUsers.filter(u => u.role === 'koc').length, color: 'var(--c6-500)' },
                                { label: 'Vendor', count: adminUsers.filter(u => u.role === 'vendor').length, color: '#f59e0b' },
                              ].map((r, i) => (
                                <div key={i} style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: r.color }}>{r.count}</div>
                                  <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>{r.label}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ background: 'var(--bg-0)' }}>
                                  {['ID', 'Tên', 'Vai trò', 'Đơn hàng', 'Trạng thái'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: '.62rem', color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                  {adminUsers.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', fontWeight: 600 }}>{u.id}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', fontWeight: 600 }}>{u.name}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem' }}><span className={`badge badge-${u.role === 'koc' ? 'c6' : u.role === 'vendor' ? 'gold' : 'c4'}`} style={{ fontSize: '.58rem' }}>{u.role}</span></td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', fontWeight: 700, color: 'var(--c4-500)' }}>{u.orders}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem' }}><span className={`badge ${statusBadge[u.status] || 'badge-c6'}`} style={{ fontSize: '.6rem' }}>{statusLabel[u.status]}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                        return null;
                      })()}

                      {/* For orders tab: show related product info */}
                      {(activeTab === 'orders' || activeTab === 'returns') && (() => {
                        const productName = detailRow.row[detailRow.headers.indexOf('Sản phẩm')] || detailRow.row[detailRow.headers.indexOf('Product')] || '';
                        const customerName = detailRow.row[detailRow.headers.indexOf('Khách hàng')] || detailRow.row[detailRow.headers.indexOf('Customer')] || '';
                        const matchedProduct = adminProducts.find(p => productName && p.name.includes(productName));
                        const matchedUser = adminUsers.find(u => customerName && u.name.includes(customerName));
                        return (
                          <div style={{ marginTop: 8 }}>
                            {matchedProduct && (
                              <>
                                <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Thông tin sản phẩm</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
                                  <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Vendor</div>
                                    <div style={{ fontSize: '.82rem', fontWeight: 600, marginTop: 2 }}>{matchedProduct.vendor}</div>
                                  </div>
                                  <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Tổng đã bán</div>
                                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--c4-500)', marginTop: 2 }}>{matchedProduct.sales.toLocaleString()}</div>
                                  </div>
                                  <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Giá</div>
                                    <div style={{ fontSize: '.82rem', fontWeight: 600, marginTop: 2 }}>{matchedProduct.price}</div>
                                  </div>
                                  <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>DPP</div>
                                    <div style={{ fontSize: '.82rem', fontWeight: 600, marginTop: 2, color: matchedProduct.dpp ? 'var(--c4-500)' : '#f59e0b' }}>{matchedProduct.dpp ? 'Verified' : 'Chưa có'}</div>
                                  </div>
                                </div>
                              </>
                            )}
                            {matchedUser && (
                              <>
                                <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Thông tin khách hàng</h4>
                                <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{matchedUser.name}</div>
                                      <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>{matchedUser.email} · {matchedUser.id}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <div style={{ fontWeight: 700, color: 'var(--c4-500)', fontSize: '.85rem' }}>{matchedUser.orders} đơn</div>
                                      <span className={`badge badge-${matchedUser.role === 'koc' ? 'c6' : 'c4'}`} style={{ fontSize: '.55rem' }}>{matchedUser.role}</span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}

                      {/* For commission tab: show KOC info */}
                      {activeTab === 'commission' && (() => {
                        const kocName = detailRow.row[0];
                        const matchedKoc = adminKocs.find(k => k.name === kocName);
                        return matchedKoc ? (
                          <div style={{ marginTop: 8 }}>
                            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Thông tin KOC</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                              <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Tier</div>
                                <div style={{ fontSize: '.82rem', fontWeight: 600, marginTop: 2 }}>{matchedKoc.tier}</div>
                              </div>
                              <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Level</div>
                                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--c6-500)', marginTop: 2 }}>Lv.{matchedKoc.level}</div>
                              </div>
                              <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Tổng doanh số</div>
                                <div style={{ fontSize: '.82rem', fontWeight: 800, color: 'var(--c4-500)', marginTop: 2 }}>{matchedKoc.sales}</div>
                              </div>
                              <div style={{ padding: 10, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '.65rem', color: 'var(--text-4)', textTransform: 'uppercase', fontWeight: 700 }}>Trust Score</div>
                                <div style={{ fontSize: '.82rem', fontWeight: 700, marginTop: 2, color: matchedKoc.trustScore >= 80 ? 'var(--c4-500)' : '#f59e0b' }}>{matchedKoc.trustScore}/100</div>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}

                      {/* For KOC/vendor related tabs: show relevant stats */}
                      {(activeTab === 'koc' || activeTab === 'leaderboard') && (() => {
                        const kocName = detailRow.row[detailRow.headers.indexOf('KOC')] || detailRow.row[detailRow.headers.indexOf('Name')] || detailRow.row[0];
                        const kocCommissions = commissionData.filter(c => c.koc === kocName);
                        return kocCommissions.length > 0 ? (
                          <div style={{ marginTop: 8 }}>
                            <h4 style={{ fontSize: '.82rem', fontWeight: 700, marginBottom: 8 }}>Lịch sử hoa hồng</h4>
                            <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ background: 'var(--bg-0)' }}>
                                  {['Số tiền', 'Đơn hàng', 'Ngày', 'Trạng thái'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left' as const, fontWeight: 700, fontSize: '.62rem', color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                  {kocCommissions.map((c, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', fontWeight: 700, color: 'var(--c4-500)' }}>{c.amount}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem' }}>{c.orders}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem', color: 'var(--text-3)' }}>{c.date}</td>
                                      <td style={{ padding: '8px 10px', fontSize: '.75rem' }}><span className={`badge ${statusBadge[c.status] || 'badge-c6'}`} style={{ fontSize: '.6rem' }}>{statusLabel[c.status] || c.status}</span></td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null;
                      })()}

                      {/* Action buttons for pending items */}
                      {isPendingDetail && !rowOverrides[`${activeTab}-${detailRow.ri}`] && (
                        <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                          <button style={{ ...btnSuccessSm, padding: '10px 20px', fontSize: '.82rem' }} onClick={() => { overrideRow(activeTab, detailRow.ri, 'approved'); showToast(`Approved ${detailRow.row[0]}`); setDetailRow(null); }}>Duyệt</button>
                          <button style={{ ...btnDangerSm, padding: '10px 20px', fontSize: '.82rem' }} onClick={() => { overrideRow(activeTab, detailRow.ri, 'rejected'); showToast(`Rejected ${detailRow.row[0]}`); setDetailRow(null); }}>Từ chối</button>
                        </div>
                      )}

                      {/* Close */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
                        <button style={{ ...btnSm, padding: '10px 20px', fontSize: '.82rem' }} onClick={() => setDetailRow(null)}>Đóng</button>
                      </div>
                    </div>
                  </div>
                  <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
                </div>
                );
              })()}
            </>
          );
        }

        // Fallback
        return (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>{tabIcon}</div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{tabName}</h2>
            <p style={{ color: 'var(--text-3)', fontSize: '.85rem' }}>Module đang được phát triển. Sắp ra mắt!</p>
          </div>
        );
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-0)' }}>
        <div className="dash-wrap" style={{ flex: 1, minHeight: 0 }}>
          {/* Sidebar */}
          <div className="dash-sidebar">
            {/* Sidebar header — fixed */}
            <div className="dash-sidebar-header">
              <div style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border)' }}>
                <div className="flex gap-8" style={{ alignItems: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.75rem', fontWeight: 700, color: '#fff',
                  }}>AD</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.78rem' }}>WellKOC Admin</div>
                    <span className="badge" style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', fontSize: '.55rem' }}>Super Admin</span>
                  </div>
                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--bg-2)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.9rem', transition: 'all .2s',
                    }}
                  >{isDark ? '☀️' : '🌙'}</button>
                </div>
              </div>
            </div>

            {/* Sidebar nav — scrollable */}
            <div className="dash-sidebar-nav">
              {sidebarSections.map(section => {
                const isOpen = openAdminGroups[section.title];
                const hasActive = section.items.some(i => i.key === activeTab);
                return (
                  <div key={section.title} style={{ marginBottom: 2 }}>
                    {/* Accordion header */}
                    <div
                      onClick={() => toggleAdminGroup(section.title)}
                      style={{
                        padding: '9px 10px 9px 8px', display: 'flex', alignItems: 'center', gap: 8,
                        cursor: 'pointer', borderLeft: `3px solid ${section.color}`, marginLeft: 4,
                        borderRadius: '0 8px 8px 0',
                        background: hasActive ? `${section.color}15` : 'transparent',
                        transition: 'background .2s',
                      }}
                    >
                      <span style={{ fontSize: '.85rem' }}>{section.groupIcon}</span>
                      <span style={{ flex: 1, fontSize: '.65rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: section.color }}>{section.title}</span>
                      <span style={{ fontSize: '.55rem', color: 'var(--text-4)', transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                    </div>

                    {/* Collapsible items */}
                    <div style={{
                      maxHeight: isOpen ? `${section.items.length * 38 + 8}px` : '0',
                      overflow: 'hidden', transition: 'max-height .25s ease-in-out',
                    }}>
                      {section.items.map(tab => (
                        <div
                          key={tab.key}
                          className={`dash-nav-item ${activeTab === tab.key ? 'on' : ''}`}
                          onClick={() => handleAdminNavClick(section.title, tab.key)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 20 }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="dash-nav-icon">{tab.icon}</span>
                            {tab.label}
                          </div>
                          {tab.badge && <span style={{ fontSize: '.58rem', padding: '1px 6px', borderRadius: 8, background: 'var(--bg-2)', color: 'var(--text-4)', fontWeight: 600 }}>{tab.badge}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar footer — fixed */}
            <div className="dash-sidebar-footer">
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              <div
                className="dash-nav-item"
                onClick={() => { localStorage.removeItem(STORAGE_KEY); navigate('/admin/login'); }}
                style={{ color: '#ef4444', cursor: 'pointer' }}
              >
                <span className="dash-nav-icon">🚪</span>
                <span style={{ flex: 1 }}>Đăng xuất</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="dash-content">
            {adminToast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '14px 24px', borderRadius: 12, fontSize: '.85rem', fontWeight: 600, background: 'var(--c4-500)', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,.3)', maxWidth: 400, animation: 'fadeIn .3s ease' }}>✅ {adminToast}</div>}
            {renderContent()}
          </div>
        </div>
    </div>
  );
}
