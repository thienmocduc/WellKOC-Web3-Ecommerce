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
  monthlyUSD: number | null; // null = "Lien he"
  monthlyVND: number | null;
  popular?: boolean;
  features: string[];
  cta: string;
  gradient: string;
}

/* ── Exchange rate ── */
const USD_TO_VND = 25_500;
const fmtVND = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' \u20AB';
const fmtUSD = (v: number) => `$${v}`;

/* ══════════════════════════════════════════════════════════════
   BUYER PLANS
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
];

const BUYER_COMPARISON: PlanFeature[] = [
  { label: 'Mua sắm', values: ['✅', '✅'] },
  { label: 'XP mỗi đơn', values: ['10 XP', '20 XP (gấp đôi)'] },
  { label: 'Voucher hàng tháng', values: ['1 voucher 20K', '5 voucher (20K+50K+100K+FreeShip+DPP)'] },
  { label: 'Ưu tiên flash sale', values: ['❌', '✅ Truy cập sớm 30 phút'] },
  { label: 'Free ship', values: ['Đơn từ 500K', 'Mọi đơn từ 200K'] },
  { label: 'Hoàn xu', values: ['1%', '3%'] },
  { label: 'Badge VIP', values: ['❌', '✅ Huy hiệu vàng'] },
  { label: 'Hỗ trợ', values: ['Tiêu chuẩn', 'Ưu tiên 24/7'] },
  { label: 'Group Buy', values: ['✅', '✅ + Giá VIP riêng'] },
];

/* ══════════════════════════════════════════════════════════════
   KOC/KOL PLANS
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
      '📝 Script cơ bản',
      '❌ Không auto marketing',
      '💸 Affiliate T1 (13%)',
      '📊 Commission cơ bản',
      '👥 100 contacts CRM',
      '📈 Basic Analytics',
      '❌ Không Creator Token',
      '❌ Không Live Commerce',
      '💾 1 GB Storage',
      '📞 Community support',
    ],
    cta: 'Bắt đầu miễn phí',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
  },
  {
    name: 'Pro',
    badge: '🌟',
    monthlyUSD: 20,
    monthlyVND: 20 * USD_TO_VND,
    popular: true,
    features: [
      '🤖 15 AI Agents',
      '💳 2,000 AI Credits / tháng',
      '📝 Video script + Caption + Hashtag',
      '🚀 3 chiến dịch auto marketing',
      '💸 Affiliate T1+T2 (13%+5%)',
      '📊 +5% bonus commission',
      '👥 2,000 contacts CRM',
      '📈 Advanced Analytics',
      '❌ Không Creator Token',
      '🎥 5 phiên Live / tháng',
      '💾 10 GB Storage',
      '📞 Email 24h support',
    ],
    cta: 'Nâng cấp Pro',
    gradient: 'linear-gradient(135deg, #06b6d4, #6366f1)',
  },
  {
    name: 'Business',
    badge: '💎',
    monthlyUSD: 100,
    monthlyVND: 100 * USD_TO_VND,
    features: [
      '🤖 50 AI Agents',
      '💳 10,000 AI Credits / tháng',
      '📝 + Competitor analysis + Trend prediction',
      '🚀 15 chiến dịch auto marketing',
      '💸 Affiliate T1+T2+T3 (40%+13%+5%)',
      '📊 +10% bonus commission',
      '👥 20,000 contacts CRM',
      '📈 Premium Analytics + Export',
      '🪙 Tạo Creator Token riêng',
      '🎥 30 phiên Live / tháng',
      '💾 100 GB Storage',
      '📞 Priority + Chat support',
    ],
    cta: 'Chọn Business',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
  },
  {
    name: 'Enterprise',
    badge: '👑',
    monthlyUSD: 200,
    monthlyVND: 200 * USD_TO_VND,
    features: [
      '🤖 111 AI Agents (full)',
      '💳 Unlimited AI Credits',
      '📝 + Custom AI training',
      '🚀 Unlimited auto marketing',
      '💸 Custom affiliate rates',
      '📊 +15% bonus commission',
      '👥 Unlimited contacts CRM',
      '📈 Enterprise Analytics + API',
      '🪙 Creator Token + Launchpad',
      '🎥 Unlimited Live Commerce',
      '💾 1 TB Storage',
      '📞 Dedicated manager',
    ],
    cta: 'Liên hệ',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
];

const KOC_COMPARISON: PlanFeature[] = [
  { label: 'AI Agents', values: ['3', '15', '50', '111 (full)'] },
  { label: 'AI Credits / tháng', values: ['100', '2,000', '10,000', 'Unlimited'] },
  { label: 'Content AI', values: ['Script cơ bản', 'Video script + Caption + Hashtag', '+ Competitor analysis + Trend', '+ Custom AI training'] },
  { label: 'Auto Marketing', values: ['❌', '3 chiến dịch', '15 chiến dịch', 'Unlimited'] },
  { label: 'Affiliate tiers', values: ['T1 (13%)', 'T1+T2 (13%+5%)', 'T1+T2+T3 (40%+13%+5%)', 'Custom rates'] },
  { label: 'Commission rate', values: ['Cơ bản', '+5% bonus', '+10% bonus', '+15% bonus'] },
  { label: 'CRM', values: ['100 contacts', '2,000 contacts', '20,000 contacts', 'Unlimited'] },
  { label: 'Analytics', values: ['Basic', 'Advanced', 'Premium + Export', 'Enterprise + API'] },
  { label: 'Creator Token', values: ['❌', '❌', '✅ Tạo token riêng', '✅ + Launchpad'] },
  { label: 'Live Commerce', values: ['❌', '5 phiên/tháng', '30 phiên/tháng', 'Unlimited'] },
  { label: 'Storage', values: ['1 GB', '10 GB', '100 GB', '1 TB'] },
  { label: 'Support', values: ['Community', 'Email 24h', 'Priority + Chat', 'Dedicated manager'] },
  { label: 'Badge', values: ['⭐', '🌟 Pro', '💎 Business', '👑 Enterprise'] },
];

/* ══════════════════════════════════════════════════════════════
   VENDOR PLANS
   ══════════════════════════════════════════════════════════════ */
const VENDOR_PLANS: PricingPlan[] = [
  {
    name: 'Basic',
    badge: '🏪',
    monthlyUSD: 0,
    monthlyVND: 0,
    features: [
      '📦 20 sản phẩm',
      '⛓️ 5 DPP Mint / tháng',
      '⭐ 10 KOC Network',
      '🤖 3 AI Agents',
      '💳 200 AI Credits / tháng',
      '📊 1 tier commission',
      '📈 Basic Analytics',
      '❌ Không auto marketing',
      '❌ Không Live Commerce',
      '❌ Không API access',
      '💾 5 GB Storage',
      '📞 Community support',
      '💸 5% transaction fee',
    ],
    cta: 'Bắt đầu miễn phí',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
  },
  {
    name: 'Growth',
    badge: '📦',
    monthlyUSD: 50,
    monthlyVND: 50 * USD_TO_VND,
    popular: true,
    features: [
      '📦 200 sản phẩm',
      '⛓️ 50 DPP Mint / tháng',
      '⭐ 100 KOC Network',
      '🤖 20 AI Agents',
      '💳 5,000 AI Credits / tháng',
      '📊 3 tiers commission',
      '📈 Advanced Analytics',
      '🚀 5 chiến dịch marketing',
      '🎥 10 phiên Live',
      '🔌 API Read only',
      '💾 50 GB Storage',
      '📞 Email support',
      '💸 3% transaction fee',
    ],
    cta: 'Chọn Growth',
    gradient: 'linear-gradient(135deg, #22c55e, #06b6d4)',
  },
  {
    name: 'Scale',
    badge: '🚀',
    monthlyUSD: 150,
    monthlyVND: 150 * USD_TO_VND,
    features: [
      '📦 2,000 sản phẩm',
      '⛓️ 500 DPP Mint / tháng',
      '⭐ 1,000 KOC Network',
      '🤖 60 AI Agents',
      '💳 25,000 AI Credits / tháng',
      '📊 5 tiers + custom commission',
      '📈 Premium + AI insights',
      '🚀 30 chiến dịch marketing',
      '🎥 50 phiên Live',
      '🔌 API Read/Write',
      '💾 500 GB Storage',
      '📞 Priority + Chat support',
      '💸 1.5% transaction fee',
    ],
    cta: 'Chọn Scale',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
  },
  {
    name: 'Enterprise',
    badge: '🏢',
    monthlyUSD: 300,
    monthlyVND: 300 * USD_TO_VND,
    features: [
      '📦 Unlimited sản phẩm',
      '⛓️ Unlimited DPP Mint',
      '⭐ Unlimited KOC Network',
      '🤖 111 AI Agents (full)',
      '💳 Unlimited AI Credits',
      '📊 Unlimited + Smart commission',
      '📈 Enterprise + Forecast',
      '🚀 Unlimited marketing',
      '🎥 Unlimited Live Commerce',
      '🔌 Full API + Webhooks',
      '💾 5 TB Storage',
      '📞 Dedicated + SLA',
      '💸 Custom fee (từ 0.5%)',
    ],
    cta: 'Liên hệ',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
];

const VENDOR_COMPARISON: PlanFeature[] = [
  { label: 'Sản phẩm', values: ['20', '200', '2,000', 'Unlimited'] },
  { label: 'DPP Mint / tháng', values: ['5', '50', '500', 'Unlimited'] },
  { label: 'KOC Network', values: ['10 KOC', '100 KOC', '1,000 KOC', 'Unlimited'] },
  { label: 'AI Agents', values: ['3', '20', '60', '111 (full)'] },
  { label: 'AI Credits / tháng', values: ['200', '5,000', '25,000', 'Unlimited'] },
  { label: 'Commission rules', values: ['1 tier', '3 tiers', '5 tiers + custom', 'Unlimited + Smart'] },
  { label: 'Analytics', values: ['Basic', 'Advanced', 'Premium + AI insights', 'Enterprise + Forecast'] },
  { label: 'Auto marketing', values: ['❌', '5 chiến dịch', '30 chiến dịch', 'Unlimited'] },
  { label: 'Live Commerce', values: ['❌', '10 phiên', '50 phiên', 'Unlimited'] },
  { label: 'API access', values: ['❌', 'Read only', 'Read/Write', 'Full + Webhooks'] },
  { label: 'Storage', values: ['5 GB', '50 GB', '500 GB', '5 TB'] },
  { label: 'Support', values: ['Community', 'Email', 'Priority + Chat', 'Dedicated + SLA'] },
  { label: 'Transaction fee', values: ['5%', '3%', '1.5%', 'Custom (từ 0.5%)'] },
  { label: 'Badge', values: ['🏪', '📦 Growth', '🚀 Scale', '🏢 Enterprise'] },
];

/* ── FAQ ── */
const FAQ_ITEMS = [
  {
    q: 'Tôi có thể thay đổi gói bất cứ lúc nào không?',
    a: 'Có! Bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. Khi nâng cấp, phần chênh lệch sẽ được tính pro-rata. Khi hạ cấp, credit còn lại sẽ được chuyển sang chu kỳ tiếp theo.',
  },
  {
    q: 'Thanh toán bằng phương thức nào?',
    a: 'Chúng tôi hỗ trợ thanh toán qua VISA, Mastercard, MoMo, ZaloPay, chuyển khoản ngân hàng và các loại tiền mã hóa (USDT, USDC, ETH). Tất cả giao dịch được ghi nhận on-chain.',
  },
  {
    q: 'Chính sách hoàn tiền như thế nào?',
    a: 'Hoàn tiền 100% trong 7 ngày đầu nếu không hài lòng, không cần lý do. Sau 7 ngày, chúng tôi sẽ hoàn trả pro-rata cho phần thời gian chưa sử dụng.',
  },
  {
    q: 'AI Credits là gì và hoạt động ra sao?',
    a: 'AI Credits là đơn vị tính cho việc sử dụng các AI Agent trên nền tảng. Mỗi thao tác AI (tạo script, phân tích, dự đoán trend...) tiêu tốn một lượng credits nhất định. Credits được reset mỗi tháng.',
  },
  {
    q: 'Gói Enterprise có bao gồm onboarding không?',
    a: 'Có! Enterprise bao gồm onboarding cá nhân hóa, dedicated account manager, SLA cam kết uptime 99.9%, và training team trực tiếp. Liên hệ sales để tùy chỉnh theo nhu cầu.',
  },
  {
    q: '"On-chain, minh bạch" nghĩa là gì?',
    a: 'Mọi giao dịch subscription, commission, và token đều được ghi nhận trên blockchain (Polygon/BNB Chain). Bạn có thể verify bất cứ lúc nào qua blockchain explorer — hoàn toàn minh bạch, không chỉnh sửa được.',
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
    };
  };

  const gridClass = tab === 'buyer' ? 'grid-2' : 'grid-4';

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
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '20%',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,.08) 0%, transparent 70%)',
              animation: 'pulse 6s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '10%',
              right: '15%',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168,85,247,.06) 0%, transparent 70%)',
              animation: 'pulse 8s ease-in-out infinite 2s',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-5%',
              left: '40%',
              width: 350,
              height: 350,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6,182,212,.06) 0%, transparent 70%)',
              animation: 'pulse 7s ease-in-out infinite 1s',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <span className="section-badge" style={{ marginBottom: 16, display: 'inline-block' }}>
            Pricing
          </span>
          <h1
            className="display-lg gradient-text"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            Chọn gói phù hợp — Phát triển không giới hạn
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              color: 'var(--text-3)',
              maxWidth: 600,
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Từ miễn phí đến Enterprise. Tất cả đều on-chain, minh bạch, AI-powered.
          </p>

          {/* Billing toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '6px 8px',
              borderRadius: 50,
              border: '1px solid var(--border)',
              background: 'var(--surface-card)',
            }}
          >
            <button
              onClick={() => setYearly(false)}
              style={{
                padding: '8px 20px',
                borderRadius: 50,
                border: 'none',
                background: !yearly ? 'var(--chakra-flow)' : 'transparent',
                color: !yearly ? '#fff' : 'var(--text-3)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .25s',
              }}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{
                padding: '8px 20px',
                borderRadius: 50,
                border: 'none',
                background: yearly ? 'var(--chakra-flow)' : 'transparent',
                color: yearly ? '#fff' : 'var(--text-3)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .25s',
                position: 'relative',
              }}
            >
              Hàng năm
              <span
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -12,
                  padding: '2px 8px',
                  borderRadius: 50,
                  background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ TAB SELECTOR ═══ */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            marginBottom: 48,
            padding: '4px',
            borderRadius: 14,
            border: '1px solid var(--border)',
            background: 'var(--surface-card)',
            maxWidth: 480,
            margin: '0 auto 24px',
          }}
        >
          {(
            [
              { key: 'buyer' as Tab, label: 'Người mua', icon: '🛒' },
              { key: 'koc' as Tab, label: 'KOC / KOL', icon: '⭐' },
              { key: 'vendor' as Tab, label: 'Vendor', icon: '🏪' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: tab === t.key ? 'var(--chakra-flow)' : 'transparent',
                color: tab === t.key ? '#fff' : 'var(--text-3)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .25s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ PRICING CARDS ═══ */}
        <div
          className={gridClass}
          style={{
            display: 'grid',
            gridTemplateColumns:
              tab === 'buyer'
                ? 'repeat(2, 1fr)'
                : 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginBottom: 64,
            maxWidth: tab === 'buyer' ? 700 : undefined,
            margin: tab === 'buyer' ? '0 auto 64px' : undefined,
          }}
        >
          {plans.map((plan) => {
            const price = getPrice(plan);
            const isPopular = plan.popular;
            const isEnterprise = plan.name === 'Enterprise';
            const isFree = price && price.usd === 0;

            return (
              <div
                key={plan.name}
                className="card card-glass"
                style={{
                  position: 'relative',
                  padding: 0,
                  borderRadius: 20,
                  border: isPopular
                    ? '2px solid transparent'
                    : '1px solid var(--border)',
                  background: isPopular
                    ? undefined
                    : 'var(--surface-card)',
                  backgroundImage: isPopular
                    ? 'linear-gradient(var(--surface-card), var(--surface-card)), var(--chakra-flow)'
                    : undefined,
                  backgroundOrigin: isPopular ? 'border-box' : undefined,
                  backgroundClip: isPopular
                    ? 'padding-box, border-box'
                    : undefined,
                  transform: isPopular ? 'scale(1.04)' : undefined,
                  zIndex: isPopular ? 2 : 1,
                  overflow: 'visible',
                  transition: 'transform .3s, box-shadow .3s',
                  boxShadow: isPopular
                    ? '0 8px 40px rgba(99,102,241,.15), 0 0 80px rgba(168,85,247,.08)'
                    : undefined,
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '6px 20px',
                      borderRadius: 50,
                      background: 'var(--chakra-flow)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 15px rgba(99,102,241,.3)',
                      zIndex: 3,
                    }}
                  >
                    Phổ biến nhất
                  </div>
                )}

                {/* Card header */}
                <div
                  style={{
                    padding: '20px 16px 16px',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: 4 }}>
                    {plan.badge}
                  </span>
                  <h3
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: 'var(--text-1)',
                      marginBottom: 12,
                    }}
                  >
                    {plan.name}
                  </h3>

                  {/* Price */}
                  {isFree ? (
                    <div style={{ marginBottom: 4 }}>
                      <span
                        className="gradient-text"
                        style={{ fontSize: '1.6rem', fontWeight: 800 }}
                      >
                        Miễn phí
                      </span>
                    </div>
                  ) : isEnterprise && plan.monthlyUSD && plan.monthlyUSD >= 200 ? (
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)' }}>
                        {yearly
                          ? fmtUSD(Math.round(plan.monthlyUSD * 0.8 * 12))
                          : fmtUSD(plan.monthlyUSD)}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginLeft: 4 }}>
                        /{yearly ? 'năm' : 'tháng'}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4 }}>
                        {'\u2248'} {fmtVND(yearly ? Math.round(plan.monthlyVND! * 0.8 * 12) : plan.monthlyVND!)}
                      </div>
                    </div>
                  ) : price ? (
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-1)' }}>
                        {fmtUSD(yearly ? price.usd : plan.monthlyUSD!)}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginLeft: 4 }}>
                        /{yearly ? 'năm' : 'tháng'}
                      </span>
                      {yearly && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--c4-500, #22c55e)', marginTop: 2 }}>
                          {fmtUSD(price.monthly!)} /tháng — tiết kiệm {fmtUSD(plan.monthlyUSD! * 12 - price.usd)} /năm
                        </div>
                      )}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 4 }}>
                        {'\u2248'} {fmtVND(yearly ? price.vnd : plan.monthlyVND!)}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)' }}>
                        Liên hệ
                      </span>
                    </div>
                  )}
                </div>

                {/* Feature list */}
                <div style={{ padding: '20px 24px 24px' }}>
                  <ul
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      marginBottom: 24,
                    }}
                  >
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: '0.83rem',
                          color: f.startsWith('❌') ? 'var(--text-3)' : 'var(--text-2)',
                          lineHeight: 1.5,
                          opacity: f.startsWith('❌') ? 0.6 : 1,
                        }}
                      >
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    to={plan.cta === 'Liên hệ' ? '#contact' : '/register'}
                    className={isPopular ? 'btn-primary btn-lg' : 'btn-secondary btn-lg'}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '14px 24px',
                      borderRadius: 14,
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      background: isPopular ? 'var(--chakra-flow)' : undefined,
                      color: isPopular ? '#fff' : undefined,
                      border: !isPopular ? '1px solid var(--border)' : undefined,
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
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              margin: '0 auto 24px',
              padding: '12px 32px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--surface-card)',
              color: 'var(--text-2)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all .25s',
            }}
          >
            {showComparison ? 'Ẩn bảng so sánh' : 'Xem bảng so sánh chi tiết'}
            <span
              style={{
                display: 'inline-block',
                transform: showComparison ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform .3s',
              }}
            >
              ▼
            </span>
          </button>

          {showComparison && (
            <div
              className="card card-glass"
              style={{
                borderRadius: 16,
                overflow: 'auto',
                border: '1px solid var(--border)',
              }}
            >
              <table
                className="data-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.83rem',
                  minWidth: tab === 'buyer' ? 500 : 700,
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '2px solid var(--border)',
                      background: 'var(--surface-hover)',
                    }}
                  >
                    <th
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: 'var(--text-1)',
                        position: 'sticky',
                        left: 0,
                        background: 'var(--surface-hover)',
                        zIndex: 2,
                        minWidth: 160,
                      }}
                    >
                      Tính năng
                    </th>
                    {planNames.map((name, i) => (
                      <th
                        key={name}
                        style={{
                          padding: '14px 16px',
                          textAlign: 'center',
                          fontWeight: 700,
                          color:
                            plans[i].popular
                              ? 'var(--c6-500, #6366f1)'
                              : 'var(--text-1)',
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
                        background:
                          ri % 2 === 0 ? 'transparent' : 'var(--surface-card)',
                      }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          fontWeight: 600,
                          color: 'var(--text-2)',
                          position: 'sticky',
                          left: 0,
                          background:
                            ri % 2 === 0
                              ? 'var(--bg-0)'
                              : 'var(--surface-card)',
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
                            color:
                              val === '❌'
                                ? 'var(--text-3)'
                                : plans[vi]?.popular
                                  ? 'var(--text-1)'
                                  : 'var(--text-2)',
                            fontWeight: plans[vi]?.popular ? 600 : 400,
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

        {/* ═══ CUSTOM ENTERPRISE / SME ═══ */}
        <div className="card" style={{ maxWidth: 900, margin: '0 auto 40px', padding: 32, background: 'linear-gradient(135deg, rgba(34,197,94,.06), rgba(99,102,241,.06), rgba(168,85,247,.06))', border: '1px solid rgba(99,102,241,.2)', borderRadius: 20, textAlign: 'center' }}>
          <span className="section-badge" style={{ marginBottom: 12, display: 'inline-block' }}>🏢 DOANH NGHIỆP</span>
          <h3 className="display-md gradient-text" style={{ marginBottom: 8 }}>Gói Custom cho Doanh nghiệp vừa & nhỏ</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '.88rem', marginBottom: 20, maxWidth: 600, margin: '0 auto 20px' }}>
            Thiết kế gói riêng phù hợp quy mô doanh nghiệp. Tùy chỉnh số lượng agents, credits, KOC network, DPP và mọi tính năng theo nhu cầu thực tế.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Agents', desc: 'Chọn 10-111 agents' },
              { label: 'Credits', desc: 'Từ 1K-100K/tháng' },
              { label: 'KOC Network', desc: 'Từ 50-10K KOC' },
              { label: 'Phí giao dịch', desc: 'Từ 0.5%-3%' },
            ].map((f, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '10px 24px' }}>Tư vấn miễn phí</button>
            <button className="btn btn-secondary" style={{ padding: '10px 24px' }}>Xem case study</button>
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--text-4)', marginTop: 12 }}>Phản hồi trong 24h · Hỗ trợ onboarding · SLA cam kết</div>
        </div>

        {/* ═══ FAQ ═══ */}
        <div style={{ maxWidth: 800, margin: '0 auto 40px', padding: '0 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="section-badge" style={{ marginBottom: 12, display: 'inline-block' }}>
              FAQ
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: 'var(--text-1)',
              }}
            >
              Câu hỏi thường gặp
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQ_ITEMS.map((faq, i) => {
              const isOpen = expandedFaq === i;
              return (
                <div
                  key={i}
                  className="card card-glass"
                  style={{
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'all .25s',
                  }}
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : i)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: '18px 24px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-1)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: 16,
                    }}
                  >
                    <span>{faq.q}</span>
                    <span
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--surface-hover)',
                        fontSize: '0.8rem',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform .3s',
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 24px 18px',
                        fontSize: '0.88rem',
                        color: 'var(--text-3)',
                        lineHeight: 1.7,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ BOTTOM CTA ═══ */}
        <div
          style={{
            textAlign: 'center',
            padding: '32px 24px 32px',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              borderRadius: 24,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                height: 600,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,.06) 0%, transparent 60%)',
              }}
            />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              className="gradient-text"
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              Bắt đầu miễn phí — Nâng cấp bất kỳ lúc nào
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-3)',
                maxWidth: 500,
                margin: '0 auto 32px',
                lineHeight: 1.6,
              }}
            >
              Không cần thẻ tín dụng. Trải nghiệm ngay tất cả tính năng cơ bản.
              On-chain, minh bạch, AI-powered.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                className="btn-primary btn-lg"
                style={{
                  padding: '16px 40px',
                  borderRadius: 14,
                  background: 'var(--chakra-flow)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all .25s',
                  boxShadow: '0 4px 20px rgba(99,102,241,.25)',
                }}
              >
                Đăng ký miễn phí
              </Link>
              <Link
                to="#contact"
                className="btn-secondary btn-lg"
                style={{
                  padding: '16px 40px',
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all .25s',
                }}
              >
                Liên hệ Sales
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
          .${gridClass} {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
