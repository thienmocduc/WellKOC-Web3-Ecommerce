import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

function WKLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wkGradL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="33%" stopColor="#06b6d4"/>
          <stop offset="66%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
        <filter id="wkGlowL"><feGaussianBlur stdDeviation="1.5" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
      </defs>
      <circle cx="19" cy="19" r="17.5" stroke="url(#wkGradL)" strokeWidth="1" opacity={0.6}/>
      <circle cx="19" cy="19" r="13" stroke="url(#wkGradL)" strokeWidth="0.5" opacity={0.35}/>
      <path d="M7 11L10.5 24L14 16L17.5 24L21 11" stroke="url(#wkGradL)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 11V27M23 19L31 11M23 19L31 27" stroke="url(#wkGradL)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="19" cy="19" r="2.5" fill="url(#wkGradL)" filter="url(#wkGlowL)"/>
      <path d="M19 19 L23 19" stroke="url(#wkGradL)" strokeWidth="0.8" strokeDasharray="2 1" opacity={0.5}/>
    </svg>
  );
}

type RoleTab = 'buyer' | 'koc' | 'vendor';

const roleTabs: { key: RoleTab; label: string; icon: string }[] = [
  { key: 'buyer', label: 'Người mua', icon: '🛒' },
  { key: 'koc', label: 'KOC/KOL', icon: '🌟' },
  { key: 'vendor', label: 'Vendor', icon: '🏪' },
];

export default function Login() {
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [activeRole, setActiveRole] = useState<RoleTab>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const role = isAdminMode ? 'admin' : activeRole === 'koc' ? 'koc' : activeRole === 'vendor' ? 'vendor' : 'user';
      const result = loginWithCredentials(email, password, role as any);
      setLoading(false);
      if (result.success) {
        if (redirectTo) {
          navigate(redirectTo);
        } else if (isAdminMode) {
          navigate('/admin');
        } else if (activeRole === 'vendor') {
          navigate('/vendor');
        } else if (activeRole === 'koc') {
          navigate('/koc');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    }, 600);
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Social login:', provider);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Side - Brand Visual */}
      {!isMobile && <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Mesh gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99,102,241,.3) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,.25) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(6,182,212,.2) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        {/* Floating orbs */}
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)',
          top: '10%', left: '10%', filter: 'blur(40px)',
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 150, height: 150, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,.2) 0%, transparent 70%)',
          bottom: '20%', right: '15%', filter: 'blur(30px)',
          animation: 'float 6s ease-in-out infinite reverse',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Logo brand chuẩn */}
          <div style={{ margin: '0 auto 20px', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <WKLogo size={72} />
          </div>

          <h1 style={{
            fontFamily: "'Noto Sans', sans-serif", fontWeight: 800, fontSize: '2rem',
            background: 'var(--chakra-text, linear-gradient(90deg, #22c55e, #06b6d4, #6366f1, #a855f7))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 12,
          }}>
            WellKOC
          </h1>

          <p style={{
            color: 'rgba(255,255,255,.6)', fontSize: '1rem',
            lineHeight: 1.6, maxWidth: 320,
          }}>
            Nền tảng Web3 Social Commerce
            <br />
            hàng đầu Việt Nam
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            {['DPP Verified', 'KOC Network', 'Blockchain', 'XP Rewards'].map(f => (
              <span key={f} style={{
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(255,255,255,.08)',
                border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(255,255,255,.5)', fontSize: '.72rem',
                backdropFilter: 'blur(10px)',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>}

      {/* Right Side - Form */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-0)',
        padding: '32px 24px',
        position: 'relative',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h2 className="display-lg" style={{ marginBottom: 6 }}>
              {isAdminMode ? 'Đăng nhập Admin' : 'Chào mừng trở lại'}
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: '.88rem' }}>
              {isAdminMode
                ? 'Nhap thong tin quan tri vien'
                : 'Đăng nhập vào tài khoản của bạn để tiếp tục'}
            </p>
          </div>

          {/* Role Tabs (hidden in admin mode) */}
          {!isAdminMode && (
            <div style={{
              display: 'flex', gap: 4, padding: 4, borderRadius: 14,
              background: 'var(--bg-2)', marginBottom: 28,
            }}>
              {roleTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveRole(tab.key)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10,
                    border: 'none', cursor: 'pointer',
                    background: activeRole === tab.key ? 'var(--surface-card)' : 'transparent',
                    boxShadow: activeRole === tab.key ? 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,.1))' : 'none',
                    color: activeRole === tab.key ? 'var(--text-1)' : 'var(--text-3)',
                    fontWeight: activeRole === tab.key ? 700 : 500,
                    fontSize: '.78rem',
                    fontFamily: 'var(--ff-body, system-ui)',
                    transition: 'all .2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(239,68,68,.08)', color: '#ef4444',
              fontSize: '.82rem', border: '1px solid rgba(239,68,68,.15)',
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email Field with Floating Label */}
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
                placeholder=" "
                style={{
                  width: '100%', padding: '20px 16px 8px',
                  borderRadius: 12, border: '1px solid',
                  borderColor: emailFocused ? 'var(--c7-500, #6366f1)' : 'var(--border)',
                  background: 'var(--bg-2)', color: 'var(--text-1)',
                  fontSize: '.88rem', outline: 'none',
                  fontFamily: 'var(--ff-body, system-ui)',
                  transition: 'border-color .2s',
                }}
              />
              <label className="input-label" style={{
                position: 'absolute', left: 16, top: email || emailFocused ? 6 : 14,
                fontSize: email || emailFocused ? '.65rem' : '.82rem',
                color: emailFocused ? 'var(--c7-500, #6366f1)' : 'var(--text-4)',
                transition: 'all .2s', pointerEvents: 'none',
                fontWeight: 600, letterSpacing: '.02em',
              }}>
                Email
              </label>
            </div>

            {/* Password Field with Floating Label + Eye Toggle */}
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                placeholder=" "
                style={{
                  width: '100%', padding: '20px 48px 8px 16px',
                  borderRadius: 12, border: '1px solid',
                  borderColor: passwordFocused ? 'var(--c7-500, #6366f1)' : 'var(--border)',
                  background: 'var(--bg-2)', color: 'var(--text-1)',
                  fontSize: '.88rem', outline: 'none',
                  fontFamily: 'var(--ff-body, system-ui)',
                  transition: 'border-color .2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-3)', fontSize: '1rem', padding: 4,
                  display: 'flex', alignItems: 'center',
                }}
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
              <label className="input-label" style={{
                position: 'absolute', left: 16, top: password || passwordFocused ? 6 : 14,
                fontSize: password || passwordFocused ? '.65rem' : '.82rem',
                color: passwordFocused ? 'var(--c7-500, #6366f1)' : 'var(--text-4)',
                transition: 'all .2s', pointerEvents: 'none',
                fontWeight: 600, letterSpacing: '.02em',
              }}>
                Mật khẩu
              </label>
            </div>

            {/* Forgot Password */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="#" style={{
                color: 'var(--c6-300, #06b6d4)', textDecoration: 'none',
                fontSize: '.78rem', fontWeight: 600,
              }}>
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{
                width: '100%', padding: '14px 24px',
                opacity: loading ? 0.7 : 1,
                fontSize: '.92rem',
              }}
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '.72rem', color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              hoac
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleSocialLogin('google')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, padding: '12px 16px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Đăng nhập với Google
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => handleSocialLogin('facebook')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, padding: '12px 16px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Đăng nhập với Facebook
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => handleSocialLogin('wallet')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10, padding: '12px 16px',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>🔗</span>
              Wallet Connect
            </button>
          </div>

          {/* Register Link */}
          <p style={{
            textAlign: 'center', marginTop: 28,
            fontSize: '.85rem', color: 'var(--text-3)',
          }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{
              color: 'var(--c6-300, #06b6d4)', textDecoration: 'none', fontWeight: 700,
            }}>
              Đăng ký ngay
            </Link>
          </p>

          {/* Admin Access Link */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            {!isAdminMode ? (
              <button
                onClick={() => {
                  setIsAdminMode(true);
                  setShowAdminLink(true);
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-4)', fontSize: '.68rem',
                  textDecoration: 'underline', fontFamily: 'var(--ff-body, system-ui)',
                  opacity: 0.5,
                }}
              >
                Đăng nhập với tư cách Admin
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  setShowAdminLink(false);
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--c6-300, #06b6d4)', fontSize: '.75rem',
                  fontFamily: 'var(--ff-body, system-ui)', fontWeight: 600,
                }}
              >
                ← Quay lai dang nhap thuong
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
