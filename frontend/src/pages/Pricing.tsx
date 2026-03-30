import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ── Types ── */
type Tab = 'buyer' | 'koc' | 'vendor';

interface PlanFeature {
  label: string;
  values: string[];
}

interface PricingPlan {
  name: string;
  badge: string;
  monthlyUSD: number | null; // null = "Liên hệ"
  monthlyVND: number | null;
  popular?: boolean;
  isCustom?: boolean;
  features: string[];
  cta: string;
  gradient: string;
}

/* ── Exchange rate ── */
const USD_TO_VND = 25_500;
const fmtVND = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' \u20AB';
const fmtUSD = (v: number) => `$${v}`;

/* ══════════════════════════════════════════════════════════════
   BUYER PLANS — 2 tiers + Custom
   ══════════════════════════════════════════════════════════════ */
const BUYER_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    badge: '🛒',
    monthlyUSD: 0,
    monthlyVND: 0,
    features: [
      '✅ Mua sắm trên nền tảng',
      '⚡ 10 XP mỗi đơn hàng',
      '🎫 1 voucher 20K / tháng',
      '❌ Không ưu tiên flash sale',
      '📦 Free ship đơn từ 500K',
      '💰 Hoàn xu 1%',
      '❌ Không có badge VIP',
      '📞 Hỗ trợ tiêu chuẩn',
      '✅ Tham gia Group Buy',
    ],
    cta: 'Bắt đầu miễn phí',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
  },
  {
    name: 'VIP',
    badge: '👑',
    monthlyUSD: 5,
    monthlyVND: 5 * USD_TO_VND,
    popular: true,
    features: [
      '✅ Mua sắm trên nền tảng',
      '⚡ 20 XP mỗi đơn (gấp đôi)',
      '🎫 5 voucher (20K + 50K + 100K + FreeShip + DPP)',
      '🔥 Truy cập flash sale sớm 30 phút',
      '📦 Free ship mọi đơn từ 200K',
      '💰 Hoàn xu 3%',
      '✅ Huy hiệu vàng VIP',
      '📞 Hỗ trợ ưu tiên 24/7',
      '✅ Group Buy + Giá VIP riêng',
    ],
    cta: 'Nâng cấp VIP',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
  {
    name: 'Custom',
    badge: '🎨',
    monthlyUSD: null,
    monthlyVND: null,
    isCustom: true,
    features: [
      '🎯 Gói VIP tùy chỉnh cho doanh nghiệp',
      '🤖 AI Shopping Assistant cá nhân hóa',
      '🔥 Ưu tiên truy cập mọi flash sale',
      '💰 Hoàn xu rate tùy chỉnh',
      '👥 Group Buy với giá riêng',
      '📦 Free ship mọi đơn hàng',
      '🎫 Voucher bundle tùy chọn',
      '📞 Hỗ trợ riêng + SLA',
      '⛓️ On-chain loyalty rewards',
    ],
    cta: 'Thiết kế gói riêng',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
];

const BUYER_COMPARISON: PlanFeature[] = [
  { label: 'Mua sắm', values: ['✅', '✅', '✅'] },
  { label: 'XP mỗi đơn', values: ['10 XP', '20 XP (gấp đôi)', 'Tùy chỉnh'] },
  { label: 'Voucher hàng tháng', values: ['1 voucher 20K', '5 voucher (20K+50K+100K+FreeShip+DPP)', 'Bundle tùy chọn'] },
  { label: 'Ưu tiên flash sale', values: ['❌', '✅ Sớm 30 phút', '✅ Mọi flash sale'] },
  { label: 'Free ship', values: ['Đơn từ 500K', 'Mọi đơn từ 200K', 'Mọi đơn hàng'] },
  { label: 'Hoàn xu', values: ['1%', '3%', 'Tùy chỉnh'] },
  { label: 'AI Shopping Assistant', values: ['❌', '❌', '✅ Cá nhân hóa'] },
  { label: 'Hỗ trợ', values: ['Tiêu chuẩn', 'Ưu tiên 24/7', 'SLA riêng'] },
  { label: 'Group Buy', values: ['✅', '✅ + Giá VIP', '✅ + Giá riêng'] },
];

/* ══════════════════════════════════════════════════════════════
   KOC/KOL PLANS — 3 tiers + Custom
   ══════════════════════════════════════════════════════════════ */
const KOC_PLANS: PricingPlan[] = [
  {
    name: 'Starter',
    badge: '⭐',
    monthlyUSD: 0,
    monthlyVND: 0,
    features: [
      '🤖 3 AI Agents',
      '💳 100 AI Credits / tháng',
      '🔄 1 Agent Workflow (auto-post)',
      '📝 Script cơ bản',
      '💸 Affiliate T1 (13%)',
      '📊 Commission cơ bản',
      '👥 100 contacts CRM',
      '📈 Basic Analytics',
      '❌ Không Creator Token',
      '🎥 Live Commerce (không giới hạn)',
      '💾 1 GB Storage',
      '📞 Community support',
    ],
    cta: 'Bắt đầu miễn phí',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
  },
  {
    name: 'Pro',
    badge: '🌟',
    monthlyUSD: 19,
    monthlyVND: 499_000,
    popular: true,
    features: [
      '🤖 25 AI Agents',
      '💳 3,000 AI Credits / tháng',
      '🔄 5 Agent Workflows (marketing, content, trend, schedule, engagement)',
      '📝 Video script + Caption + Hashtag + SEO',
      '💸 Affiliate T1+T2 (13%+5%) + 5% bonus',
      '🚀 3 chiến dịch auto marketing',
      '👥 2,000 contacts CRM',
      '📈 Advanced Analytics + Export',
      '❌ Không Creator Token',
      '🎥 Live + AI Live Assistant (gợi ý SP, auto coupon, analytics)',
      '💾 10 GB Storage',
      '📞 Email 24h support',
    ],
    cta: 'Nâng cấp Pro',
    gradient: 'linear-gradient(135deg, #06b6d4, #6366f1)',
  },
  {
    name: 'Business',
    badge: '💎',
    monthlyUSD: 79,
    monthlyVND: 1_999_000,
    features: [
      '🤖 80 AI Agents',
      '💳 20,000 AI Credits / tháng',
      '🔄 Unlimited Agent Workflows',
      '📝 + Competitor analysis + Trend + Custom AI training',
      '💸 Affiliate T1+T2+T3 (40%+13%+5%) + 10% bonus',
      '🚀 Unlimited auto marketing',
      '👥 20,000 contacts CRM',
      '📈 Premium Analytics + API',
      '🪙 Creator Token + Launchpad',
      '🎥 Live + AI Assistant + Multi-stream + Replay AI',
      '💾 100 GB Storage',
      '📞 Priority + Dedicated onboarding',
    ],
    cta: 'Chọn Business',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
  },
  {
    name: 'Custom',
    badge: '🎨',
    monthlyUSD: null,
    monthlyVND: null,
    isCustom: true,
    features: [
      '🤖 Tùy chỉnh đến 333 AI Agents',
      '💳 AI Credits theo nhu cầu',
      '🔄 Workflows thiết kế riêng theo ngành',
      '📝 Custom AI training trên data riêng',
      '💸 Affiliate rates tùy chỉnh',
      '🚀 White-label marketing suite',
      '👥 Unlimited CRM + API',
      '📈 Enterprise Analytics + Forecast',
      '🪙 Creator Token + Custom Launchpad',
      '🎥 Unlimited Live + Multi-stream',
      '💾 Dung lượng tùy chỉnh',
      '📞 Dedicated manager + SLA',
    ],
    cta: 'Thiết kế gói riêng',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
];

const KOC_COMPARISON: PlanFeature[] = [
  { label: 'Agent Workflows', values: ['1 workflow', '5 workflows', 'Unlimited', 'Tùy chỉnh theo ngành'] },
  { label: 'AI Agents', values: ['3', '25', '80', 'Đến 333'] },
  { label: 'AI Credits / tháng', values: ['100', '3,000', '20,000', 'Tùy chỉnh'] },
  { label: 'Content AI', values: ['Script cơ bản', 'Video + Caption + Hashtag + SEO', '+ Competitor + Trend + Custom training', 'Full + Custom AI'] },
  { label: 'Auto Marketing', values: ['❌', '3 chiến dịch', 'Unlimited', 'White-label suite'] },
  { label: 'Affiliate tiers', values: ['T1 (13%)', 'T1+T2 (13%+5%)', 'T1+T2+T3 (40%+13%+5%)', 'Custom rates'] },
  { label: 'Bonus commission', values: ['—', '+5%', '+10%', 'Tùy chỉnh'] },
  { label: 'CRM', values: ['100 contacts', '2,000 contacts', '20,000 contacts', 'Unlimited + API'] },
  { label: 'Analytics', values: ['Basic', 'Advanced + Export', 'Premium + API', 'Enterprise + Forecast'] },
  { label: 'Creator Token', values: ['❌', '❌', '✅ + Launchpad', '✅ + Custom Launchpad'] },
  { label: 'Live Commerce', values: ['✅ Không giới hạn', '✅ + AI Live Assistant', '✅ + AI + Multi-stream + Replay', '✅ Full + Custom'] },
  { label: 'Storage', values: ['1 GB', '10 GB', '100 GB', 'Tùy chỉnh'] },
  { label: 'Support', values: ['Community', 'Email 24h', 'Priority + Dedicated', 'Dedicated + SLA'] },
];

/* ══════════════════════════════════════════════════════════════
   VENDOR PLANS — 3 tiers + Custom
   ══════════════════════════════════════════════════════════════ */
const VENDOR_PLANS: PricingPlan[] = [
  {
    name: 'Basic',
    badge: '🏪',
    monthlyUSD: 0,
    monthlyVND: 0,
    features: [
      '📦 20 sản phẩm',
      '🤖 3 AI Agents',
      '💳 200 AI Credits / tháng',
      '🔄 1 Agent Workflow (auto order notification)',
      '⛓️ 5 DPP Mint / tháng',
      '⭐ 10 KOC Network',
      '📊 1 tier commission',
      '📈 Basic Analytics',
      '❌ Không API access',
      '🎥 Live Commerce (không giới hạn)',
      '💾 5 GB Storage',
      '💸 5% transaction fee',
      '📞 Community support',
    ],
    cta: 'Bắt đầu miễn phí',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
  },
  {
    name: 'Growth',
    badge: '📦',
    monthlyUSD: 39,
    monthlyVND: 999_000,
    popular: true,
    features: [
      '📦 500 sản phẩm',
      '🤖 30 AI Agents',
      '💳 10,000 AI Credits / tháng',
      '🔄 10 Agent Workflows (marketing, KOC match, inventory, pricing, CS...)',
      '⛓️ 100 DPP Mint / tháng',
      '⭐ 200 KOC Network',
      '📊 3 tiers commission',
      '📈 Advanced Analytics + Export',
      '🔌 API Read/Write',
      '🎥 Live + AI Live Assistant (analytics, auto coupon)',
      '💾 50 GB Storage',
      '💸 2.5% transaction fee',
      '📞 Email + Chat support',
    ],
    cta: 'Chọn Growth',
    gradient: 'linear-gradient(135deg, #22c55e, #06b6d4)',
  },
  {
    name: 'Scale',
    badge: '🚀',
    monthlyUSD: 149,
    monthlyVND: 3_799_000,
    features: [
      '📦 Unlimited sản phẩm',
      '🤖 80 AI Agents',
      '💳 30,000 AI Credits / tháng',
      '🔄 Unlimited Agent Workflows',
      '⛓️ Unlimited DPP Mint',
      '⭐ 1,000 KOC Network',
      '📊 5 tiers + custom commission',
      '📈 Premium Analytics + AI Forecast',
      '🔌 Full API + Webhooks',
      '🎥 Live + AI Assistant + Multi-stream + Replay AI',
      '💾 500 GB Storage',
      '💸 1% transaction fee',
      '📞 Priority + Dedicated support',
    ],
    cta: 'Chọn Scale',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
  },
  {
    name: 'Custom',
    badge: '🎨',
    monthlyUSD: null,
    monthlyVND: null,
    isCustom: true,
    features: [
      '📦 Unlimited sản phẩm',
      '🤖 Tùy chỉnh đến 333 AI Agents',
      '💳 AI Credits theo nhu cầu',
      '🔄 Workflows thiết kế riêng theo ngành',
      '⛓️ Unlimited DPP + White-label',
      '⭐ Unlimited KOC Network',
      '📊 Smart commission + Custom rules',
      '📈 Enterprise Analytics + Forecast + BI',
      '🔌 Full API + Webhooks + Custom SDK',
      '🎥 Unlimited Live + Multi-stream',
      '💾 Dung lượng tùy chỉnh',
      '💸 Custom fee (từ 0.5%)',
      '📞 Dedicated manager + SLA',
    ],
    cta: 'Thiết kế gói riêng',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
];

const VENDOR_COMPARISON: PlanFeature[] = [
  { label: 'Agent Workflows', values: ['1 workflow', '10 workflows', 'Unlimited', 'Tùy chỉnh theo ngành'] },
  { label: 'Sản phẩm', values: ['20', '500', 'Unlimited', 'Unlimited'] },
  { label: 'AI Agents', values: ['3', '30', '80', 'Đến 333'] },
  { label: 'AI Credits / tháng', values: ['200', '10,000', '30,000', 'Tùy chỉnh'] },
  { label: 'DPP Mint / tháng', values: ['5', '100', 'Unlimited', 'Unlimited + White-label'] },
  { label: 'KOC Network', values: ['10 KOC', '200 KOC', '1,000 KOC', 'Unlimited'] },
  { label: 'Commission rules', values: ['1 tier', '3 tiers', '5 tiers + custom', 'Smart + Custom rules'] },
  { label: 'Analytics', values: ['Basic', 'Advanced + Export', 'Premium + AI Forecast', 'Enterprise + BI'] },
  { label: 'Auto marketing', values: ['❌', '10 workflows', 'Unlimited', 'White-label suite'] },
  { label: 'Live Commerce', values: ['✅ Không giới hạn', '✅ + AI Live Assistant', '✅ + AI + Multi-stream + Replay', '✅ Full + Custom'] },
  { label: 'API access', values: ['❌', 'Read/Write', 'Full + Webhooks', 'Full + SDK'] },
  { label: 'Storage', values: ['5 GB', '50 GB', '500 GB', 'Tùy chỉnh'] },
  { label: 'Transaction fee', values: ['5%', '2.5%', '1%', 'Custom (từ 0.5%)'] },
  { label: 'Support', values: ['Community', 'Email + Chat', 'Priority + Dedicated', 'Dedicated + SLA'] },
];

/* ── FAQ ── */
const FAQ_ITEMS = [
  {
    q: 'Agent Workflow Automation là gì?',
    a: 'Agent Workflow là quy trình tự động hóa nhiều bước do AI Agent thực hiện. Ví dụ: KOC Workflow tự động tạo content → tối ưu SEO → lên lịch đăng → phân tích hiệu suất → điều chỉnh chiến lược. Vendor Workflow tự động quản lý tồn kho → match KOC phù hợp → tối ưu giá → chăm sóc khách hàng. Mỗi bước tiêu tốn AI Credits.',
  },
  {
    q: 'AI Credits hoạt động ra sao?',
    a: 'AI Credits là đơn vị tính cho việc sử dụng các AI Agent và Workflow trên nền tảng. Mỗi thao tác AI (tạo script, phân tích, dự đoán trend, chạy workflow...) tiêu tốn một lượng credits nhất định. Credits được reset mỗi tháng. Gói cao hơn = nhiều credits hơn = chạy nhiều workflow tự động hơn.',
  },
  {
    q: 'Tôi có thể thay đổi gói bất cứ lúc nào không?',
    a: 'Có! Bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. Khi nâng cấp, phần chênh lệch sẽ được tính pro-rata. Khi hạ cấp, credit còn lại sẽ được chuyển sang chu kỳ tiếp theo.',
  },
  {
    q: 'Thanh toán bằng phương thức nào?',
    a: 'Chúng tôi hỗ trợ thanh toán qua VISA, Mastercard, MoMo, ZaloPay, chuyển khoản ngân hàng và các loại tiền mã hóa (USDT, USDC, ETH). Tất cả giao dịch được ghi nhận on-chain.',
  },
  {
    q: 'Gói Custom hoạt động như thế nào?',
    a: 'Bạn liên hệ đội sales, mô tả nhu cầu cụ thể (số agents, credits, loại workflows, quy mô KOC network...). Chúng tôi sẽ thiết kế gói riêng phù hợp ngân sách và mục tiêu kinh doanh. Bao gồm onboarding cá nhân hóa, dedicated manager, SLA cam kết uptime 99.9%.',
  },
  {
    q: 'Chính sách hoàn tiền như thế nào?',
    a: 'Hoàn tiền 100% trong 7 ngày đầu nếu không hài lòng, không cần lý do. Sau 7 ngày, chúng tôi sẽ hoàn trả pro-rata cho phần thời gian chưa sử dụng.',
  },
  {
    q: '"On-chain, minh bạch" nghĩa là gì?',
    a: 'Mọi giao dịch subscription, commission, và token đều được ghi nhận trên blockchain (Polygon). Bạn có thể verify bất cứ lúc nào qua blockchain explorer — hoàn toàn minh bạch, không chỉnh sửa được.',
  },
];

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function Pricing() {
  const [tab, setTab] = useState<Tab>('koc');
  const [yearly, setYearly] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const plans = tab === 'buyer' ? BUYER_PLANS : tab === 'koc' ? KOC_PLANS : VENDOR_PLANS;
  const comparison = tab === 'buyer' ? BUYER_COMPARISON : tab === 'koc' ? KOC_COMPARISON : VENDOR_COMPARISON;
  const planNames = plans.map((p) => p.name);

  const getPrice = (plan: PricingPlan) => {
    if (plan.monthlyUSD === null) return null;
    if (plan.monthlyUSD === 0) return { usd: 0, vnd: 0 };
    const multiplier = yearly ? 0.8 : 1;
    return {
      usd: Math.round(plan.monthlyUSD * multiplier * (yearly ? 12 : 1)),
      vnd: Math.round(plan.monthlyVND! * multiplier * (yearly ? 12 : 1)),
      monthly: Math.round(plan.monthlyUSD * multiplier),
      monthlyVnd: Math.round(plan.monthlyVND! * multiplier),
    };
  };

  return (
    <section style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* ═══ HERO ═══ */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '32px 24px 24px',
          textAlign: 'center',
        }}
      >
        {/* Background energy orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.08) 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '10%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,.06) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', bottom: '-5%', left: '40%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.06) 0%, transparent 70%)', animation: 'pulse 7s ease-in-out infinite 1s' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <span className="section-badge" style={{ marginBottom: 16, display: 'inline-block' }}>
            Pricing
          </span>
          <h1
            className="display-lg gradient-text"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}
          >
            333 AI Agents — Workflow tự động hóa
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: 'var(--text-3)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Từ miễn phí đến doanh nghiệp. Agent Workflow Automation giúp bạn tự động hóa mọi quy trình — on-chain, minh bạch.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px 8px', borderRadius: 50, border: '1px solid var(--border)', background: 'var(--surface-card)' }}>
            <button
              onClick={() => setYearly(false)}
              style={{ padding: '8px 20px', borderRadius: 50, border: 'none', background: !yearly ? 'var(--chakra-flow)' : 'transparent', color: !yearly ? '#fff' : 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all .25s' }}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{ padding: '8px 20px', borderRadius: 50, border: 'none', background: yearly ? 'var(--chakra-flow)' : 'transparent', color: yearly ? '#fff' : 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all .25s', position: 'relative' }}
            >
              Hàng năm
              <span style={{ position: 'absolute', top: -8, right: -12, padding: '2px 8px', borderRadius: 50, background: 'linear-gradient(135deg, #22c55e, #06b6d4)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                -20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ TAB SELECTOR ═══ */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 48, padding: '4px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface-card)', maxWidth: 480, margin: '0 auto 24px' }}>
          {([
            { key: 'buyer' as Tab, label: 'Người mua', icon: '🛒' },
            { key: 'koc' as Tab, label: 'KOC / KOL', icon: '⭐' },
            { key: 'vendor' as Tab, label: 'Vendor', icon: '🏪' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: tab === t.key ? 'var(--chakra-flow)' : 'transparent', color: tab === t.key ? '#fff' : 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ PRICING CARDS ═══ */}
        <div
          className="pricing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: tab === 'buyer' ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginBottom: 64,
            maxWidth: tab === 'buyer' ? 960 : undefined,
            margin: tab === 'buyer' ? '0 auto 64px' : undefined,
          }}
        >
          {plans.map((plan) => {
            const price = getPrice(plan);
            const isPopular = plan.popular;
            const isCustom = plan.isCustom;
            const isFree = price && price.usd === 0;

            return (
              <div
                key={plan.name}
                className="card card-glass"
                style={{
                  position: 'relative',
                  padding: 0,
                  borderRadius: 20,
                  border: isCustom
                    ? '2px dashed rgba(168,85,247,.4)'
                    : isPopular
                      ? '2px solid transparent'
                      : '1px solid var(--border)',
                  background: isCustom
                    ? 'linear-gradient(135deg, rgba(168,85,247,.04), rgba(236,72,153,.04))'
                    : isPopular
                      ? undefined
                      : 'var(--surface-card)',
                  backgroundImage: isPopular && !isCustom
                    ? 'linear-gradient(var(--surface-card), var(--surface-card)), var(--chakra-flow)'
                    : undefined,
                  backgroundOrigin: isPopular && !isCustom ? 'border-box' : undefined,
                  backgroundClip: isPopular && !isCustom ? 'padding-box, border-box' : undefined,
                  transform: isPopular ? 'scale(1.04)' : undefined,
                  zIndex: isPopular ? 2 : 1,
                  overflow: 'visible',
                  transition: 'transform .3s, box-shadow .3s',
                  boxShadow: isPopular
                    ? '0 8px 40px rgba(99,102,241,.15), 0 0 80px rgba(168,85,247,.08)'
                    : isCustom
                      ? '0 4px 20px rgba(168,85,247,.08)'
                      : undefined,
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', borderRadius: 50, background: 'var(--chakra-flow)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(99,102,241,.3)', zIndex: 3 }}>
                    Phổ biến nhất
                  </div>
                )}

                {/* Custom badge */}
                {isCustom && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', borderRadius: 50, background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(168,85,247,.3)', zIndex: 3 }}>
                    Thiết kế riêng
                  </div>
                )}

                {/* Card header */}
                <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: 4 }}>
                    {plan.badge}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>
                    {plan.name}
                  </h3>

                  {/* Price */}
                  {isCustom ? (
                    <div style={{ marginBottom: 4 }}>
                      <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, backgroundImage: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Liên hệ
                      </span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4 }}>
                        Thiết kế theo nhu cầu
                      </div>
                    </div>
                  ) : isFree ? (
                    <div style={{ marginBottom: 4 }}>
                      <span className="gradient-text" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                        Miễn phí
                      </span>
                    </div>
                  ) : price ? (
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)' }}>
                        {fmtUSD(yearly ? (price.monthly ?? plan.monthlyUSD!) : plan.monthlyUSD!)}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginLeft: 4 }}>
                        /tháng
                      </span>
                      {yearly && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--c4-500, #22c55e)', marginTop: 2 }}>
                          {fmtUSD(price.usd)} /năm — tiết kiệm {fmtUSD(plan.monthlyUSD! * 12 - price.usd)} /năm
                        </div>
                      )}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4 }}>
                        ≈ {fmtVND(yearly ? (price.monthlyVnd ?? plan.monthlyVND!) : plan.monthlyVND!)} /tháng
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Feature list */}
                <div style={{ padding: '20px 24px 24px' }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: '0.83rem',
                          color: f.startsWith('❌') ? 'var(--text-3)' : f.includes('Workflow') || f.includes('workflow') ? 'var(--c6-500)' : 'var(--text-2)',
                          lineHeight: 1.5,
                          opacity: f.startsWith('❌') ? 0.6 : 1,
                          fontWeight: f.includes('Workflow') || f.includes('workflow') ? 600 : 400,
                        }}
                      >
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to={plan.isCustom || plan.cta === 'Liên hệ' || plan.cta === 'Thiết kế gói riêng' ? '#contact' : '/register'}
                    className={isPopular ? 'btn-primary btn-lg' : 'btn-secondary btn-lg'}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '14px 24px',
                      borderRadius: 14,
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      background: isCustom
                        ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                        : isPopular
                          ? 'var(--chakra-flow)'
                          : undefined,
                      color: isPopular || isCustom ? '#fff' : undefined,
                      border: !isPopular && !isCustom ? '1px solid var(--border)' : undefined,
                      transition: 'all .25s',
                      cursor: 'pointer',
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ COMPARISON TABLE ═══ */}
        <div style={{ marginBottom: 80 }}>
          <button
            onClick={() => setShowComparison(!showComparison)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto 24px', padding: '12px 32px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-card)', color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all .25s' }}
          >
            {showComparison ? 'Ẩn bảng so sánh' : 'Xem bảng so sánh chi tiết'}
            <span style={{ display: 'inline-block', transform: showComparison ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .3s' }}>
              ▼
            </span>
          </button>

          {showComparison && (
            <div className="card card-glass" style={{ borderRadius: 16, overflow: 'auto', border: '1px solid var(--border)' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface-hover)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-1)', position: 'sticky', left: 0, background: 'var(--surface-hover)', zIndex: 2, minWidth: 160 }}>
                      Tính năng
                    </th>
                    {planNames.map((name, i) => (
                      <th
                        key={name}
                        style={{
                          padding: '14px 16px',
                          textAlign: 'center',
                          fontWeight: 700,
                          color: plans[i].popular ? 'var(--c6-500, #6366f1)' : plans[i].isCustom ? '#a855f7' : 'var(--text-1)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {plans[i].badge} {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, ri) => (
                    <tr
                      key={row.label}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: ri % 2 === 0 ? 'transparent' : 'var(--surface-card)',
                      }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          fontWeight: row.label === 'Agent Workflows' ? 700 : 600,
                          color: row.label === 'Agent Workflows' ? 'var(--c6-500)' : 'var(--text-2)',
                          position: 'sticky',
                          left: 0,
                          background: ri % 2 === 0 ? 'var(--bg-0)' : 'var(--surface-card)',
                          zIndex: 1,
                        }}
                      >
                        {row.label}
                      </td>
                      {row.values.map((val, vi) => (
                        <td
                          key={vi}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            color: val === '❌' ? 'var(--text-3)' : plans[vi]?.popular ? 'var(--text-1)' : plans[vi]?.isCustom ? '#a855f7' : 'var(--text-2)',
                            fontWeight: plans[vi]?.popular || row.label === 'Agent Workflows' ? 600 : 400,
                            opacity: val === '❌' ? 0.5 : 1,
                          }}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ═══ FAQ ═══ */}
        <div style={{ maxWidth: 800, margin: '0 auto 40px', padding: '0 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="section-badge" style={{ marginBottom: 12, display: 'inline-block' }}>
              FAQ
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--text-1)' }}>
              Câu hỏi thường gặp
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQ_ITEMS.map((faq, i) => {
              const isOpen = expandedFaq === i;
              return (
                <div key={i} className="card card-glass" style={{ borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', transition: 'all .25s' }}>
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : i)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '18px 24px', border: 'none', background: 'transparent', color: 'var(--text-1)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', gap: 16 }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-hover)', fontSize: '0.8rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .3s' }}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 18px', fontSize: '0.88rem', color: 'var(--text-3)', lineHeight: 1.7 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ BOTTOM CTA ═══ */}
        <div style={{ textAlign: 'center', padding: '32px 24px 32px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', borderRadius: 24 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.06) 0%, transparent 60%)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="gradient-text" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
              Bắt đầu với 3 AI Agents miễn phí — Tự động hóa khi sẵn sàng
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-3)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Không cần thẻ tín dụng. Trải nghiệm Agent Workflow Automation ngay. Nâng cấp bất kỳ lúc nào.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                className="btn-primary btn-lg"
                style={{ padding: '16px 40px', borderRadius: 14, background: 'var(--chakra-flow)', color: '#fff', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', transition: 'all .25s', boxShadow: '0 4px 20px rgba(99,102,241,.25)' }}
              >
                Đăng ký miễn phí
              </Link>
              <Link
                to="#contact"
                className="btn-secondary btn-lg"
                style={{ padding: '16px 40px', borderRadius: 14, border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', transition: 'all .25s' }}
              >
                Thiết kế gói Custom
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SCOPED STYLES ═══ */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 900px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
