import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '@hooks/useI18n';

interface LiveStream {
  id: string;
  kocName: string;
  kocAvatar: string;
  title: string;
  viewers: number;
  revenue: string;
  emoji: string;
  bgGradient: string;
  aiInsight?: string;
}

const featuredLive: LiveStream = {
  id: 'live-linh',
  kocName: '@linh.koc',
  kocAvatar: 'LK',
  title: 'Review Serum Vitamin C - Flash Sale -50%',
  viewers: 4283,
  revenue: '\u20AB48M',
  emoji: '\uD83C\uDF1F',
  bgGradient: 'linear-gradient(135deg, rgba(99,102,241,.15), rgba(168,85,247,.1))',
  aiInsight: 'Viewer engagement tăng 340% khi demo sản phẩm. Nên pin comment "Mua ngay" để tăng conversion.',
};

const mediumLives: LiveStream[] = [
  {
    id: 'live-minh',
    kocName: '@minh.kol',
    kocAvatar: 'MK',
    title: 'Unbox Collagen Marine Japan',
    viewers: 2156,
    revenue: '\u20AB22M',
    emoji: '\uD83D\uDCA7',
    bgGradient: 'linear-gradient(135deg, rgba(6,182,212,.12), rgba(99,102,241,.08))',
  },
  {
    id: 'live-thu',
    kocName: '@thu.koc',
    kocAvatar: 'TK',
    title: 'Matcha Uji - Group Buy T3',
    viewers: 1847,
    revenue: '\u20AB15M',
    emoji: '\uD83C\uDF75',
    bgGradient: 'linear-gradient(135deg, rgba(34,197,94,.12), rgba(6,182,212,.08))',
  },
  {
    id: 'live-an',
    kocName: '@an.koc',
    kocAvatar: 'AK',
    title: 'Vitamin D3 K2 - Tu My',
    viewers: 983,
    revenue: '\u20AB8.5M',
    emoji: '\uD83D\uDCA0',
    bgGradient: 'linear-gradient(135deg, rgba(168,85,247,.1), rgba(251,191,36,.08))',
  },
];

const smallLives: LiveStream[] = [
  {
    id: 'live-s1',
    kocName: '@hana.beauty',
    kocAvatar: 'HB',
    title: 'Skincare routine buổi tối',
    viewers: 567,
    revenue: '\u20AB3.2M',
    emoji: '\u2728',
    bgGradient: 'linear-gradient(135deg, rgba(251,191,36,.1), rgba(251,113,133,.06))',
  },
  {
    id: 'live-s2',
    kocName: '@long.tech',
    kocAvatar: 'LT',
    title: 'Review tai nghe true wireless',
    viewers: 432,
    revenue: '\u20AB2.8M',
    emoji: '\uD83C\uDFA7',
    bgGradient: 'linear-gradient(135deg, rgba(99,102,241,.1), rgba(6,182,212,.06))',
  },
  {
    id: 'live-s3',
    kocName: '@mai.food',
    kocAvatar: 'MF',
    title: 'Nau an voi bot matcha',
    viewers: 389,
    revenue: '\u20AB1.5M',
    emoji: '\uD83C\uDF73',
    bgGradient: 'linear-gradient(135deg, rgba(34,197,94,.1), rgba(251,191,36,.06))',
  },
  {
    id: 'live-s4',
    kocName: '@duc.sport',
    kocAvatar: 'DS',
    title: 'Supplement cho gym',
    viewers: 298,
    revenue: '\u20AB1.2M',
    emoji: '\uD83D\uDCAA',
    bgGradient: 'linear-gradient(135deg, rgba(6,182,212,.1), rgba(34,197,94,.06))',
  },
];

function formatViewers(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

const LiveBadge: React.FC = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
    borderRadius: '6px', padding: '2px 8px',
    fontSize: '.6rem', fontWeight: 700, color: '#f87171',
  }}>
    <span className="live-dot" style={{ width: '6px', height: '6px' }}></span>
    LIVE
  </span>
);

const Live: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--topbar-height) + 12px)' }}>
      <div className="container">
        {/* Slim page header */}
        <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
          <h2 className="display-md gradient-text" style={{ margin: 0, whiteSpace: 'nowrap' }}>
            {t('live.title')}
          </h2>
        </div>

        {/* Featured Live - Large Card */}
        <div
          className="live-hud"
          style={{ marginBottom: '24px', cursor: 'pointer' }}
          onClick={() => navigate(`/live/${featuredLive.id}`)}
        >
          {/* Live Header */}
          <div className="live-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LiveBadge />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="koc-avatar" style={{
                  width: '32px', height: '32px', fontSize: '.7rem',
                  border: '2px solid #ef4444',
                }}>
                  {featuredLive.kocAvatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{featuredLive.kocName}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>{featuredLive.title}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div className="live-stat">
                <div className="live-stat-val" style={{ color: '#f87171' }}>
                  {formatViewers(featuredLive.viewers)}
                </div>
                <div className="live-stat-lbl">{t('live.viewers')}</div>
              </div>
              <div className="live-stat">
                <div className="live-stat-val gradient-text">{featuredLive.revenue}</div>
                <div className="live-stat-lbl">{t('live.revenue')}</div>
              </div>
            </div>
          </div>

          {/* Live Content Area */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: '280px',
          }}>
            {/* Video Area */}
            <div style={{
              background: featuredLive.bgGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <span style={{ fontSize: '5rem' }}>{featuredLive.emoji}</span>

              {/* Viewer count overlay */}
              <div style={{
                position: 'absolute', bottom: '12px', left: '12px',
                display: 'flex', gap: '8px',
              }}>
                <span className="badge badge-c6" style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)' }}>
                  {'\uD83D\uDC41'} {featuredLive.viewers.toLocaleString()}
                </span>
              </div>

              {/* Play button overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,.1)',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {'\u25B6\uFE0F'}
                </div>
              </div>
            </div>

            {/* Sidebar - AI Insight + Chat */}
            <div style={{
              borderLeft: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* AI Insight */}
              <div className="ai-insight" style={{ margin: '12px' }}>
                <div className="ai-chip">
                  <span>{'\uD83E\uDD16'}</span> AI INSIGHT
                </div>
                <p style={{ margin: 0, fontSize: '.72rem', lineHeight: 1.6, color: 'var(--text-2)' }}>
                  {featuredLive.aiInsight}
                </p>
              </div>

              {/* Mini chat area */}
              <div style={{
                flex: 1, padding: '12px', display: 'flex', flexDirection: 'column',
                gap: '8px', overflowY: 'auto',
              }}>
                <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>
                  <span style={{ color: 'var(--c5-300)', fontWeight: 600 }}>@user123:</span> Sản phẩm này có ship COD không?
                </div>
                <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>
                  <span style={{ color: 'var(--c4-300)', fontWeight: 600 }}>@beauty_lover:</span> Da mua 2 lan, chat luong tot lam!
                </div>
                <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>
                  <span style={{ color: 'var(--c7-300)', fontWeight: 600 }}>@newbie:</span> Flash sale con bao lau vay?
                </div>
              </div>

              {/* Chat input */}
              <div style={{
                padding: '10px 12px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: '8px',
              }}>
                <input
                  className="input-field"
                  placeholder={t('live.comment')}
                  style={{ flex: 1, fontSize: '.72rem', padding: '.4rem .7rem' }}
                />
                <button className="btn btn-primary btn-sm" style={{ fontSize: '.7rem' }}>
                  {t('live.send')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medium Live Cards */}
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          {mediumLives.map((live) => (
            <div
              key={live.id}
              className="card card-hover"
              style={{ overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate(`/live/${live.id}`)}
            >
              {/* Video thumbnail */}
              <div style={{
                height: '160px', background: live.bgGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span style={{ fontSize: '3rem' }}>{live.emoji}</span>

                {/* LIVE badge */}
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <LiveBadge />
                </div>

                {/* Viewer count */}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                  <span className="badge" style={{
                    background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
                    color: '#fff', fontSize: '.6rem',
                  }}>
                    {'\uD83D\uDC41'} {formatViewers(live.viewers)}
                  </span>
                </div>

                {/* Revenue */}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                  <span className="badge badge-c4" style={{ fontSize: '.6rem' }}>
                    {live.revenue}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div className="koc-avatar" style={{ width: '28px', height: '28px', fontSize: '.65rem' }}>
                    {live.kocAvatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.78rem' }}>{live.kocName}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>{live.title}</div>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '8px' }}>
                  {'\uD83D\uDCFA'} {t('live.watchLive')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Small Live Cards Grid */}
        <div className="grid-4">
          {smallLives.map((live) => (
            <div
              key={live.id}
              className="card card-hover"
              style={{ overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate(`/live/${live.id}`)}
            >
              <div style={{
                height: '100px', background: live.bgGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span style={{ fontSize: '2rem' }}>{live.emoji}</span>

                <div style={{ position: 'absolute', top: '6px', left: '6px' }}>
                  <LiveBadge />
                </div>

                <div style={{ position: 'absolute', bottom: '6px', right: '6px' }}>
                  <span className="badge" style={{
                    background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
                    color: '#fff', fontSize: '.55rem', padding: '1px 6px',
                  }}>
                    {'\uD83D\uDC41'} {formatViewers(live.viewers)}
                  </span>
                </div>
              </div>

              <div style={{ padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="koc-avatar" style={{ width: '22px', height: '22px', fontSize: '.55rem' }}>
                    {live.kocAvatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.7rem' }}>{live.kocName}</div>
                    <div style={{ fontSize: '.58rem', color: 'var(--text-3)', lineHeight: 1.3 }}>{live.title}</div>
                  </div>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: '6px', fontSize: '.6rem', color: 'var(--text-3)',
                }}>
                  <span>{live.revenue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Live;
