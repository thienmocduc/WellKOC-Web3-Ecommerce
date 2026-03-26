import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface PromoCard {
  id: string;
  emoji: string;
  type: string;
  title: string;
  description: string;
  discount: string;
  badge: string;
  badgeClass: string;
  progress?: { current: number; total: number };
  voucherCode?: string;
  bgGradient: string;
}

const promoCards: PromoCard[] = [
  {
    id: 'flash-50',
    emoji: '\u26A1',
    type: 'Flash Sale',
    title: 'Flash Sale -50%',
    description: 'Serum Vitamin C 20% - Chi con 12 san pham',
    discount: '-50%',
    badge: 'FLASH',
    badgeClass: 'badge-gold',
    progress: { current: 88, total: 100 },
    bgGradient: 'linear-gradient(135deg, rgba(251,191,36,.12), rgba(251,113,133,.08))',
  },
  {
    id: 'group-45',
    emoji: '\uD83D\uDC65',
    type: 'Group Buy',
    title: 'Group Buy -45%',
    description: 'Collagen Marine - Can them 70 nguoi nua',
    discount: '-45%',
    badge: 'GROUP',
    badgeClass: 'badge-c7',
    progress: { current: 130, total: 200 },
    bgGradient: 'linear-gradient(135deg, rgba(168,85,247,.1), rgba(99,102,241,.08))',
  },
  {
    id: 'voucher-200k',
    emoji: '\uD83C\uDF9F\uFE0F',
    type: 'Voucher',
    title: 'Voucher 200K',
    description: 'Ap dung cho don tu 500K - Het han 24h',
    discount: '200K',
    badge: 'VOUCHER',
    badgeClass: 'badge-c4',
    voucherCode: 'WK3-200K-XMAS',
    bgGradient: 'linear-gradient(135deg, rgba(34,197,94,.1), rgba(6,182,212,.08))',
  },
  {
    id: 'koc-40',
    emoji: '\uD83C\uDF1F',
    type: 'KOC Deal',
    title: 'KOC Exclusive -40%',
    description: 'Matcha Uji Premium - Chi qua link @linh.koc',
    discount: '-40%',
    badge: 'KOC',
    badgeClass: 'badge-c5',
    progress: { current: 62, total: 100 },
    bgGradient: 'linear-gradient(135deg, rgba(6,182,212,.1), rgba(34,197,94,.08))',
  },
];

function useCountdown(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev <= 0 ? targetSeconds : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetSeconds]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return { hours, minutes, seconds, remaining };
}

const Promo: React.FC = () => {
  const navigate = useNavigate();
  const { hours, minutes, seconds } = useCountdown(7 * 3600 + 23 * 60 + 45);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyVoucher = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--topbar-height) + 48px)' }}>
      <div className="container">
        {/* Flash Sale Banner */}
        <div
          className="card-glass"
          style={{
            padding: '32px',
            marginBottom: '48px',
            background: 'linear-gradient(135deg, rgba(251,191,36,.08), rgba(251,113,133,.05), rgba(168,85,247,.06))',
            border: '1px solid rgba(251,191,36,.2)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(251,191,36,.08), transparent 60%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="section-badge" style={{
              background: 'rgba(251,191,36,.15)',
              color: 'var(--gold-400)',
              borderColor: 'rgba(251,191,36,.3)',
            }}>
              <span>{'\u26A1'}</span>
              FLASH SALE
            </div>

            <h2 className="display-md" style={{ marginTop: '12px', marginBottom: '16px' }}>
              <span className="gradient-text">Khuyến mại sắp kết thúc!</span>
            </h2>

            {/* Countdown Timer */}
            <div style={{
              display: 'inline-flex', gap: '8px', alignItems: 'center',
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '12px 24px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--ff-mono)', fontWeight: 800, fontSize: '1.6rem',
                  background: 'var(--chakra-text)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {pad(hours)}
                </div>
                <div style={{ fontSize: '.58rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Gio</div>
              </div>
              <span style={{ fontSize: '1.4rem', color: 'var(--text-4)', fontWeight: 700 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--ff-mono)', fontWeight: 800, fontSize: '1.6rem',
                  background: 'var(--chakra-text)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {pad(minutes)}
                </div>
                <div style={{ fontSize: '.58rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Phut</div>
              </div>
              <span style={{ fontSize: '1.4rem', color: 'var(--text-4)', fontWeight: 700 }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--ff-mono)', fontWeight: 800, fontSize: '1.6rem',
                  background: 'var(--chakra-text)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {pad(seconds)}
                </div>
                <div style={{ fontSize: '.58rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Giay</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <h3 className="display-md" style={{ fontSize: '1.4rem' }}>
            <span className="gradient-text">Ưu đãi đang hoạt động</span>
          </h3>
        </div>

        {/* Promo Cards Grid */}
        <div className="grid-4">
          {promoCards.map((promo) => (
            <div
              key={promo.id}
              className="card card-hover"
              style={{ overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate(`/promo/${promo.id}`)}
            >
              {/* Card Header */}
              <div style={{
                background: promo.bgGradient,
                padding: '20px', textAlign: 'center',
                borderBottom: '1px solid var(--border)',
                position: 'relative',
              }}>
                <span style={{ fontSize: '2.5rem' }}>{promo.emoji}</span>
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                }}>
                  <span className={`badge ${promo.badgeClass}`}>{promo.badge}</span>
                </div>
                <div style={{
                  position: 'absolute', top: '10px', left: '10px',
                  background: 'var(--c7-500)', color: '#fff',
                  borderRadius: '6px', padding: '3px 7px',
                  fontSize: '.62rem', fontWeight: 700,
                }}>
                  {promo.discount}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px' }}>
                <div style={{
                  fontWeight: 700, fontSize: '.85rem',
                  color: 'var(--text-1)', marginBottom: '6px',
                  fontFamily: 'var(--ff-display)',
                }}>
                  {promo.title}
                </div>
                <div style={{
                  fontSize: '.72rem', color: 'var(--text-3)',
                  lineHeight: 1.5, marginBottom: '12px',
                }}>
                  {promo.description}
                </div>

                {/* Progress Bar */}
                {promo.progress && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '.6rem', color: 'var(--text-3)', marginBottom: '4px',
                    }}>
                      <span>Da ban {promo.progress.current}%</span>
                      <span>Con {promo.progress.total - promo.progress.current} san pham</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${promo.progress.current}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Voucher Code */}
                {promo.voucherCode && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'var(--bg-2)', border: '1px dashed var(--border)',
                    borderRadius: '8px', padding: '8px 12px',
                    marginBottom: '12px',
                  }}>
                    <span style={{
                      fontFamily: 'var(--ff-mono)', fontSize: '.75rem',
                      fontWeight: 700, color: 'var(--c4-300)',
                      flex: 1,
                    }}>
                      {promo.voucherCode}
                    </span>
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '.65rem', padding: '.3rem .6rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyVoucher(promo.voucherCode!);
                      }}
                    >
                      {copiedCode === promo.voucherCode ? '\u2705 Da copy' : '\uD83D\uDCCB Copy'}
                    </button>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  {promo.voucherCode ? '\uD83C\uDF9F\uFE0F Dung ngay' : '\u26A1 Mua ngay'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Promo;
