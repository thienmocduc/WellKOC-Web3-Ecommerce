import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, ChevronDown, Menu, X } from 'lucide-react';
import { useTheme } from '@hooks/useTheme';
import { useI18n } from '@hooks/useI18n';
import type { Locale } from '@hooks/useI18n';
import { useAuth } from '@hooks/useAuth';
import ChatWidget from '@components/ChatWidget';

/* ── WK Logo SVG ── */
function WKLogo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="33%" stopColor="#06b6d4"/>
          <stop offset="66%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
        <filter id="wkGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <circle cx="19" cy="19" r="17.5" stroke="url(#wkGrad)" strokeWidth="1" opacity={0.6}/>
      <circle cx="19" cy="19" r="13" stroke="url(#wkGrad)" strokeWidth="0.5" opacity={0.35}/>
      <path d="M7 11L10.5 24L14 16L17.5 24L21 11" stroke="url(#wkGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 11V27M23 19L31 11M23 19L31 27" stroke="url(#wkGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="19" cy="19" r="2.5" fill="url(#wkGrad)" filter="url(#wkGlow)"/>
      <path d="M19 19 L23 19" stroke="url(#wkGrad)" strokeWidth="0.8" strokeDasharray="2 1" opacity={0.5}/>
    </svg>
  );
}

/* ── Per-route sub-navigation ── */
const SUB_NAV_CONFIG: Record<string, Array<{ label: string; to: string; isLive?: boolean }>> = {
  '/marketplace': [
    { label: 'Tất cả', to: '/marketplace' },
    { label: 'Skincare', to: '/marketplace?cat=skincare' },
    { label: 'Thực phẩm', to: '/marketplace?cat=food' },
    { label: 'Công nghệ', to: '/marketplace?cat=tech' },
    { label: 'Thời trang', to: '/marketplace?cat=fashion' },
    { label: 'Sức khoẻ', to: '/marketplace?cat=health' },
  ],
  '/feed': [
    { label: 'Trending 🔥', to: '/feed' },
    { label: 'Mới nhất', to: '/feed?sort=new' },
    { label: 'DPP Review', to: '/feed?filter=dpp' },
    { label: 'Đang theo dõi', to: '/feed?filter=following' },
  ],
  '/live': [
    { label: 'Đang Live', to: '/live', isLive: true },
    { label: 'Sắp diễn ra', to: '/live?tab=upcoming' },
    { label: 'Đã phát', to: '/live?tab=past' },
  ],
  '/academy': [
    { label: 'Tổng quan', to: '/academy' },
    { label: 'Khóa học', to: '/academy?tab=courses' },
    { label: 'Thách thức', to: '/academy?tab=challenges' },
    { label: 'Leaderboard', to: '/academy?tab=leaderboard' },
    { label: 'Huy hiệu', to: '/academy?tab=badges' },
  ],
  '/koc': [
    { label: 'KOC Hub', to: '/koc' },
    { label: 'Top KOC', to: '/koc?tab=ranking' },
    { label: 'Cộng đồng', to: '/koc?tab=community' },
    { label: 'Creator Token', to: '/koc?tab=token' },
  ],
  '/dpp': [
    { label: 'DPP Scanner', to: '/dpp' },
    { label: 'Sản phẩm', to: '/dpp?tab=products' },
    { label: 'Xác minh', to: '/dpp?tab=verify' },
    { label: 'On-Chain', to: '/dpp?tab=chain' },
  ],
  '/vendor': [
    { label: 'Tổng quan', to: '/vendor' },
    { label: 'Sản phẩm', to: '/vendor?tab=products' },
    { label: 'Đơn hàng', to: '/vendor?tab=orders' },
    { label: 'Analytics', to: '/vendor?tab=analytics' },
  ],
  '/dashboard': [
    { label: 'Tổng quan', to: '/dashboard' },
    { label: 'Đơn hàng', to: '/dashboard?tab=orders' },
    { label: 'Thanh toán', to: '/dashboard?tab=payments' },
    { label: 'Cài đặt', to: '/dashboard?tab=settings' },
  ],
  '/gamification': [
    { label: 'Tổng quan', to: '/gamification' },
    { label: 'Leaderboard', to: '/gamification?tab=leaderboard' },
    { label: 'Thách thức', to: '/gamification?tab=challenges' },
    { label: 'Huy hiệu', to: '/gamification?tab=badges' },
  ],
};

/* ── Sidebar nav sections (same content as old drawer) ── */
const SIDEBAR_SECTIONS = [
  {
    titleKey: 'drawer.platform',
    color: '#22c55e',
    items: [
      { to: '/', key: 'nav.home', icon: '◈' },
      { to: '/marketplace', key: 'drawer.marketplace', icon: '⬡' },
      { to: '/live', key: 'nav.live', icon: '◉', isLive: true },
      { to: '/feed', key: 'nav.feed', icon: '◎' },
      { to: '/promo', key: 'nav.promo', icon: '⚡' },
      { to: '/hot', key: 'nav.hot', icon: '✦' },
      { to: '/dashboard', key: 'drawer.dashboard', icon: '▣' },
    ],
  },
  {
    titleKey: 'drawer.community',
    color: '#06b6d4',
    items: [
      { to: '/koc', key: 'drawer.kocHub', icon: '⭐' },
      { to: '/vendor', key: 'drawer.vendorHub', icon: '◆' },
      { to: '/academy', key: 'drawer.academy', icon: '◇' },
      { to: '/gamification', key: 'drawer.gamification', icon: '⬢' },
    ],
  },
  {
    titleKey: 'drawer.web3',
    color: '#6366f1',
    items: [
      { to: '/dpp', key: 'drawer.dpp', icon: '⬡' },
      { to: '/pricing', key: 'drawer.pricing', icon: '💰' },
      { to: '/dashboard?tab=payments', key: 'drawer.commission', icon: '◈' },
      { to: '/koc', key: 'drawer.creatorToken', icon: '◎' },
      { to: '/wk-token', key: 'drawer.wallet', icon: '◆' },
    ],
  },
  {
    titleKey: 'drawer.ai',
    color: '#a855f7',
    items: [
      { to: '/agents', key: 'drawer.agents', icon: '⚙' },
      { to: '/marketplace', key: 'drawer.groupBuy', icon: '⬢' },
      { to: '/live', key: 'drawer.liveCommerce', icon: '◉' },
      { to: '/feed', key: 'drawer.socialGraph', icon: '◎' },
    ],
  },
  {
    titleKey: 'drawer.account',
    color: '#ec4899',
    items: [
      { to: '/dashboard?tab=settings', key: 'drawer.profile', icon: '◈' },
      { to: '/dashboard?tab=notifications', key: 'drawer.notifications', icon: '◎' },
      { to: '/dashboard?tab=settings', key: 'drawer.settings', icon: '⚙' },
    ],
  },
];

/* ── Footer link columns ── */
const FOOTER_LINKS = [
  {
    titleKey: 'footer.product',
    links: [
      { to: '/marketplace', label: 'Marketplace' },
      { to: '/live', label: 'Live Commerce' },
      { to: '/dpp', label: 'Blockchain DPP' },
      { to: '/agents', label: 'AI Agents' },
      { to: '/academy', label: 'KOC Academy' },
    ],
  },
  {
    titleKey: 'footer.community',
    links: [
      { to: '/koc', label: 'KOC Hub' },
      { to: '/vendor', label: 'Vendor Hub' },
      { to: '/feed', label: 'Social Feed' },
      { to: '/gamification', label: 'Gamification' },
    ],
  },
  {
    titleKey: 'footer.legal',
    links: [
      { to: '/legal?doc=tos&role=general', labelKey: 'layout.footer.terms' },
      { to: '/legal?doc=privacy&role=general', labelKey: 'layout.footer.privacy' },
      { to: '/legal?doc=tos&role=general', label: 'Cookie Policy' },
      { to: '/pricing', labelKey: 'layout.footer.contact' },
    ],
  },
];

const CHAIN_BADGES = ['Polygon', 'BNB Chain', 'Ethereum', 'Solana'];

const TOPBAR_H = 48;
const SIDEBAR_W = 240;

export default function MainLayout() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t, locale, setLocale, currentLanguage, languages } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* Responsive: track desktop breakpoint */
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  /* Close sidebar on route change (mobile) */
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    setNavSearch(new URLSearchParams(location.search).get('q') || '');
  }, [location.pathname]);

  /* Debounce navSearch → URL ?q= */
  useEffect(() => {
    const SEARCH_ROUTES = ['/marketplace', '/feed', '/academy', '/koc'];
    if (!SEARCH_ROUTES.includes(location.pathname)) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      if (navSearch.trim()) params.set('q', navSearch.trim());
      else params.delete('q');
      const newQ = params.toString();
      const curQ = location.search.replace(/^\?/, '');
      if (newQ !== curQ) navigate(`${location.pathname}${newQ ? '?' + newQ : ''}`, { replace: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [navSearch]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangDropdownOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Prevent body scroll when mobile sidebar open */
  useEffect(() => {
    document.body.style.overflow = (!isDesktop && sidebarOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, isDesktop]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email ? user.email[0].toUpperCase() : 'U';

  const subNav = SUB_NAV_CONFIG[location.pathname] ?? null;
  const isAgentsPage = location.pathname === '/agents';
  const isDashPage = ['/dashboard', '/koc', '/vendor', '/admin'].some(p => location.pathname.startsWith(p));
  const showSidebar = !isAgentsPage && (isDesktop || sidebarOpen);
  const showFooter = !isAgentsPage && !isDashPage;

  function isSubLinkActive(to: string): boolean {
    const qIdx = to.indexOf('?');
    const toPath = qIdx >= 0 ? to.slice(0, qIdx) : to;
    const toQ = qIdx >= 0 ? to.slice(qIdx + 1) : '';
    if (toPath !== location.pathname) return false;
    if (!toQ) return !location.search;
    const lp = new URLSearchParams(toQ);
    const cp = new URLSearchParams(location.search);
    for (const [k, v] of lp.entries()) {
      if (cp.get(k) !== v) return false;
    }
    return true;
  }

  /* ── Agents page: full-screen own UI ── */
  if (isAgentsPage) {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        <Outlet />
        <ChatWidget />
      </div>
    );
  }

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: TOPBAR_H,
    left: isDesktop ? 0 : (sidebarOpen ? 0 : -SIDEBAR_W),
    width: SIDEBAR_W,
    bottom: 0,
    zIndex: 900,
    background: 'var(--nav-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: isDesktop ? 'none' : 'left 280ms cubic-bezier(.4,0,.2,1)',
    scrollbarWidth: 'thin' as const,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ═══ TOPBAR ═══ */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: TOPBAR_H,
        zIndex: 1000,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
      }}>
        {/* Logo (always visible in topbar) */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', flexShrink: 0 }}>
          <WKLogo size={28} />
          <span style={{
            fontFamily: "'Noto Sans', sans-serif",
            fontSize: '1rem',
            fontWeight: 800,
            background: 'var(--chakra-text)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.01em',
          }}>WellKOC</span>
        </Link>

        {/* Hamburger (mobile only) */}
        {!isDesktop && (
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        )}

        {/* Search (shown on search-enabled pages) */}
        {['/marketplace', '/feed', '/academy', '/koc'].includes(location.pathname) && (
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <input
              type="text"
              value={navSearch}
              onChange={e => setNavSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              style={{
                width: '100%', padding: '5px 12px 5px 30px',
                borderRadius: 20, fontSize: '.8rem',
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                color: 'var(--text-1)', outline: 'none',
                fontFamily: 'var(--ff-body, system-ui)',
              }}
            />
            <span style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: '.72rem', color: 'var(--text-3)', pointerEvents: 'none',
            }}>🔍</span>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Language dropdown */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 8px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-2)', fontSize: '0.75rem', cursor: 'pointer',
            }}
          >
            <span>{currentLanguage.flag}</span>
            <span>{currentLanguage.code.toUpperCase()}</span>
            <ChevronDown size={11} />
          </button>
          {langDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: 'var(--surface-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 6, minWidth: 160,
              boxShadow: 'var(--shadow-float)', zIndex: 1010,
            }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLocale(lang.code as Locale); setLangDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none',
                    background: locale === lang.code ? 'var(--surface-hover)' : 'transparent',
                    color: locale === lang.code ? 'var(--text-1)' : 'var(--text-2)',
                    fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left' as const,
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Light mode' : 'Dark mode'}
          style={{
            width: 34, height: 34, borderRadius: 8,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-2)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* User menu / auth */}
        {isAuthenticated && user ? (
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px 4px 4px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--chakra-flow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.65rem', fontWeight: 700, color: '#fff',
              }}>{userInitials}</div>
              {isDesktop && (
                <>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                  <ChevronDown size={12} style={{ color: 'var(--text-3)' }} />
                </>
              )}
            </button>
            {userMenuOpen && (
              <div style={{
                position: 'fixed', top: 52, right: 12,
                background: 'var(--surface-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: 6, minWidth: 180,
                boxShadow: 'var(--shadow-float)', zIndex: 9999,
              }}>
                <Link to="/dashboard?tab=profile" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-2)', textDecoration: 'none' }}>
                  <span>👤</span> {t('layout.profile')}
                </Link>
                <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-2)', textDecoration: 'none' }}>
                  <span>📊</span> Dashboard
                </Link>
                <Link to="/dashboard?tab=settings" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-2)', textDecoration: 'none' }}>
                  <span>⚙️</span> {t('layout.settings')}
                </Link>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 8px' }} />
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
                  <span>🚪</span> {t('layout.logout')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link to="/login" style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('login.loginBtn') || 'Đăng nhập'}
            </Link>
            <Link to="/register" style={{ padding: '7px 14px', borderRadius: 10, background: 'var(--chakra-flow)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t('login.registerNow') || 'Đăng ký'}
            </Link>
          </div>
        )}
      </header>

      {/* ═══ SIDEBAR ═══ */}
      <nav style={sidebarStyle}>
        {/* Chakra energy glows */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '8%', left: '-40%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,.1) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '40%', right: '-30%', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.08) 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite 2s' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '-20%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,.07) 0%, transparent 70%)', animation: 'pulse 7s ease-in-out infinite 3s' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 3, width: 2, background: 'linear-gradient(180deg, #22c55e, #06b6d4, #6366f1, #a855f7)', opacity: 0.12, borderRadius: 2 }} />
        </div>

        {/* Nav sections */}
        <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', zIndex: 1 }}>
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.titleKey}>
              <div style={{
                fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: section.color,
                marginBottom: 5, paddingLeft: 10,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ width: 14, height: 2, borderRadius: 1, background: section.color, opacity: 0.6, flexShrink: 0 }} />
                {t(section.titleKey)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to.split('?')[0]));
                  return (
                    <Link
                      key={`${item.key}-${item.to}`}
                      to={item.to}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '7px 10px', borderRadius: 8,
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#fff' : 'var(--text-3)',
                        background: isActive ? `linear-gradient(90deg, ${section.color}22, transparent)` : 'transparent',
                        borderLeft: `2px solid ${isActive ? section.color : 'transparent'}`,
                        textDecoration: 'none',
                        transition: 'all .18s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <span style={{
                        fontSize: '0.9rem', width: 24, height: 24, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 6,
                        background: isActive ? `${section.color}20` : 'rgba(255,255,255,.04)',
                        filter: isActive ? `drop-shadow(0 0 5px ${section.color})` : 'none',
                      }}>{(item as any).icon || '◈'}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{t(item.key)}</span>
                      {(item as any).isLive && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0, animation: 'pulse 2s infinite' }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar bottom: user info */}
        <div style={{
          padding: '14px 12px',
          borderTop: '1px solid var(--border)',
          position: 'relative', zIndex: 1,
        }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--chakra-flow)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '.72rem', fontWeight: 700,
              }}>{userInitials}</div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '.8rem', color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
              </div>
            </div>
          ) : (
            <Link to="/register" style={{
              display: 'block', textAlign: 'center', padding: '10px 16px',
              borderRadius: 10, background: 'var(--chakra-flow)', color: '#fff',
              fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
            }}>
              {t('login.registerNow') || 'Đăng ký'}
            </Link>
          )}
        </div>
      </nav>

      {/* Sidebar overlay (mobile) */}
      {!isDesktop && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 850 }}
        />
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{
        marginTop: TOPBAR_H,
        marginLeft: isDesktop ? SIDEBAR_W : 0,
        minHeight: `calc(100vh - ${TOPBAR_H}px)`,
        display: 'flex', flexDirection: 'column',
        flex: 1,
      }}>
        {/* Sub-nav bar (horizontal tabs under topbar) */}
        {subNav && (
          <div style={{
            position: 'sticky', top: TOPBAR_H, zIndex: 800,
            background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center',
            padding: '0 20px', gap: 2,
            overflowX: 'auto', scrollbarWidth: 'none',
          }}>
            {subNav.map((link) => {
              const isActive = isSubLinkActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '10px 12px', fontSize: '0.8rem', fontWeight: 600,
                    color: link.isLive ? 'var(--rose-400)' : isActive ? 'var(--primary, #22c55e)' : 'var(--text-3)',
                    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                    borderBottom: `2px solid ${isActive ? 'var(--primary, #22c55e)' : 'transparent'}`,
                    transition: 'all .15s',
                  }}
                >
                  {link.isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />}
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Page outlet */}
        {isDashPage ? (
          <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </main>
        ) : (
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
        )}

        {/* Footer */}
        {showFooter && (
          <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-1)', padding: '64px 24px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
                {/* Brand column */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <WKLogo size={34} />
                    <span style={{ fontFamily: 'var(--ff-display)', fontSize: '1.15rem', fontWeight: 700, background: 'var(--chakra-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {t('footer.brand')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 320 }}>
                    {t('footer.tagline')}
                  </p>
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.78rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-2)', fontSize: '0.82rem' }}>Công ty Cổ phần Công nghệ WellNexus</div>
                    <div style={{ fontWeight: 600, fontSize: '0.76rem' }}>Công ty TNHH WellKOC Việt Nam</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}><span>📍</span><span>35 Thái Phiên, Phường Hải Châu, Đà Nẵng, Việt Nam</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span>📞</span><a href="tel:0913156676" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Hotline: 0913 156 676</a></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span>✉️</span><a href="mailto:support@wellkoc.com" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>support@wellkoc.com</a></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    {CHAIN_BADGES.map(chain => (
                      <span key={chain} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--ff-mono)' }}>{chain}</span>
                    ))}
                  </div>
                </div>
                {/* Link columns */}
                {FOOTER_LINKS.map(col => (
                  <div key={col.titleKey}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
                      {t(col.titleKey)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {col.links.map((link: any) => (
                        <Link key={link.to + (link.label || link.labelKey)} to={link.to} style={{ fontSize: '0.85rem', color: 'var(--text-3)', textDecoration: 'none', transition: 'color .15s' }}>
                          {link.label || t(link.labelKey)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Copyright */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                  © 2025 WellKOC. {t('footer.rights')}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['🐦', '💬', '📺', '📘'].map((icon, i) => (
                    <button key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</button>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>

      <ChatWidget />
    </div>
  );
}
