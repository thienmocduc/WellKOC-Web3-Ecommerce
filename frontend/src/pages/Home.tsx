import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

/* ── Animated counter hook (IntersectionObserver) ── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ── Stat counter component ── */
function StatCounter({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const { count, ref } = useCounter(value);
  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-val">
        {suffix === '₫'
          ? `₫${count}B`
          : suffix === 'K'
            ? `${count}K`
            : count.toLocaleString()}
      </div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg" />

        <div className="chakra-rings">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
          <div className="ring ring-4" />
        </div>

        <div className="hero-content" style={{ maxWidth: 860, padding: '16px 24px 40px' }}>
          <div className="section-badge" style={{ marginBottom: 24 }}>
            <span className="dot-pulse dot-indigo" /> Conscious Community Commerce · Polygon
          </div>

          <h1 className="display-xl" style={{ marginBottom: 20, lineHeight: 1.15 }}>
            <span className="gradient-text">Thương mại cộng đồng</span>
            <br />
            <span style={{ fontSize: '0.55em', fontWeight: 600, color: 'var(--text-2)', lineHeight: 1.5 }}>
              Nơi mỗi giao dịch đều minh bạch, mỗi đóng góp đều được ghi nhận
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-2)',
              lineHeight: 1.8,
              maxWidth: 640,
              margin: '0 auto 36px',
            }}
          >
            Nền tảng kết nối <strong style={{ color: 'var(--text-1)' }}>Người mua</strong> ·{' '}
            <strong style={{ color: 'var(--text-1)' }}>KOC</strong> ·{' '}
            <strong style={{ color: 'var(--text-1)' }}>Vendor</strong> trên blockchain.
            Hoa hồng on-chain 100% minh bạch. 333 AI Agents phục vụ 24/7.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Link to="/marketplace" className="btn btn-primary btn-lg">
              Khám phá ngay →
            </Link>
            <Link to="/about" className="btn btn-ghost btn-lg" style={{ border: '1px solid var(--border)' }}>
              Xem câu chuyện
            </Link>
          </div>

          {/* Stats bar */}
          <div className="stats-bar" style={{ marginTop: 48 }}>
            <StatCounter value={142} suffix="₫" label="GMV · YTD" />
            <StatCounter value={12847} suffix="" label="Active KOCs" />
            <StatCounter value={890} suffix="K" label="DPP Minted" />
            <StatCounter value={333} suffix="" label="AI Agents" />
          </div>
        </div>
      </section>

      <div className="chakra-divider" />

      {/* ═══════════════════════════════════════════
          SECTION 2 — TRIẾT LÝ THIỆN LÀNH
      ═══════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-badge">
              <span className="dot-pulse dot-green" /> Triết lý nền tảng
            </div>
            <h2 className="display-lg" style={{ marginBottom: 12 }}>
              Triết lý <span className="gradient-text">Thiện Lành</span>
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-2)',
                maxWidth: 560,
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Thương mại cộng đồng trí tuệ thiện lành — nơi công nghệ phục vụ con người,
              không phải ngược lại.
            </p>
          </div>

          <div className="grid-3">
            {/* Principle 1 — Minh bạch */}
            <div className="card card-glass card-hover" style={{ padding: 36, textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--c4-500), var(--c5-500))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  margin: '0 auto 20px',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(34,197,94,.3)',
                }}
              >
                ⬡
              </div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  marginBottom: 10,
                  color: 'var(--text-1)',
                }}
              >
                Minh bạch tuyệt đối
              </h3>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--text-2)',
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                Mọi giao dịch được ghi nhận on-chain, không thể giả mạo hay can thiệp.
                Ai cũng có thể kiểm chứng bất kỳ lúc nào.
              </p>
              <div
                style={{
                  width: 40,
                  height: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--c4-500), var(--c5-500))',
                  margin: '0 auto',
                }}
              />
            </div>

            {/* Principle 2 — Công bằng */}
            <div className="card card-glass card-hover" style={{ padding: 36, textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--c5-500), var(--c6-500))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  margin: '0 auto 20px',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(6,182,212,.3)',
                }}
              >
                ⚖️
              </div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  marginBottom: 10,
                  color: 'var(--text-1)',
                }}
              >
                Công bằng cho tất cả
              </h3>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--text-2)',
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                Smart Contract phân phối hoa hồng tự động, không trung gian,
                không thiên vị. Mọi người đều nhận đúng giá trị đóng góp.
              </p>
              <div
                style={{
                  width: 40,
                  height: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--c5-500), var(--c6-500))',
                  margin: '0 auto',
                }}
              />
            </div>

            {/* Principle 3 — Trí tuệ */}
            <div className="card card-glass card-hover" style={{ padding: 36, textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--c6-500), var(--c7-500))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  margin: '0 auto 20px',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(99,102,241,.3)',
                }}
              >
                🧠
              </div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  marginBottom: 10,
                  color: 'var(--text-1)',
                }}
              >
                Trí tuệ phục vụ con người
              </h3>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--text-2)',
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                333 AI Agents hỗ trợ mọi vai trò 24/7 — phân tích, tư vấn, vận hành.
                Công nghệ phục vụ, không thay thế con người.
              </p>
              <div
                style={{
                  width: 40,
                  height: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--c6-500), var(--c7-500))',
                  margin: '0 auto',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="chakra-divider" />

      {/* ═══════════════════════════════════════════
          SECTION 3 — HỆ SINH THÁI 3 VAI TRÒ
      ═══════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-0)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-badge">
              <span className="dot-pulse dot-blue" /> Hệ sinh thái
            </div>
            <h2 className="display-lg" style={{ marginBottom: 12 }}>
              Ba vai trò · Một hệ sinh thái{' '}
              <span className="gradient-text">thiện lành</span>
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-2)',
                maxWidth: 560,
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Mỗi vai trò tạo giá trị cho nhau — tất cả minh bạch, xác thực on-chain.
            </p>
          </div>

          <div className="grid-3">
            {/* ── Buyer Card ── */}
            <div className="role-card role-buyer card-hover" style={{ padding: 32 }}>
              <div className="role-icon">🛍️</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: 10,
                  color: 'var(--text-1)',
                }}
              >
                Người mua
              </h3>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--text-2)',
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Mua hàng chính hãng với DPP xác thực on-chain. Tham gia Group Buy giá tốt,
                follow KOC yêu thích để nhận ưu đãi độc quyền.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                <span className="badge badge-c4">DPP Verify</span>
                <span className="badge badge-c5">Group Buy</span>
                <span className="badge badge-c4">Follow KOC</span>
                <span className="badge badge-c5">Copy Cart</span>
              </div>
              <div
                style={{
                  fontSize: '.72rem',
                  color: 'var(--text-3)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 14,
                  fontWeight: 600,
                  letterSpacing: '.04em',
                }}
              >
                Discover → Verify → Buy → Review
              </div>
            </div>

            {/* ── KOC Card (highlighted) ── */}
            <div
              className="role-card role-koc card-hover"
              style={{
                padding: 32,
                position: 'relative',
                transform: 'scale(1.04)',
                zIndex: 2,
                boxShadow: '0 8px 40px rgba(99,102,241,.15)',
              }}
            >
              <div
                className="badge badge-gold"
                style={{ position: 'absolute', top: 16, right: 16, fontSize: '.65rem' }}
              >
                Vai trò cốt lõi
              </div>
              <div className="role-icon">⭐</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: 10,
                  color: 'var(--text-1)',
                }}
              >
                KOC / KOL
              </h3>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--text-2)',
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Bán hàng qua livestream, review, social content. Hoa hồng T1 40%, T2 13% —
                tất cả on-chain minh bạch, nhận ngay khi giao hàng.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                <span className="badge badge-c6">T1 40%</span>
                <span className="badge badge-c7">T2 13%</span>
                <span className="badge badge-c6">Creator Token</span>
                <span className="badge badge-c7">Reputation NFT</span>
              </div>
              <div
                style={{
                  fontSize: '.72rem',
                  color: 'var(--text-3)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 14,
                  fontWeight: 600,
                  letterSpacing: '.04em',
                }}
              >
                Create → Promote → Convert → Earn
              </div>
            </div>

            {/* ── Vendor Card ── */}
            <div className="role-card role-vendor card-hover" style={{ padding: 32 }}>
              <div className="role-icon">🏪</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: 10,
                  color: 'var(--text-1)',
                }}
              >
                Vendor
              </h3>
              <p
                style={{
                  fontSize: '.9rem',
                  color: 'var(--text-2)',
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Đăng sản phẩm, mint DPP NFT xác thực nguồn gốc. Mạng lưới KOC bán hàng —
                333 AI Agents hỗ trợ vận hành 24/7.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                <span className="badge badge-c7">DPP Mint</span>
                <span className="badge badge-c6">AI Live</span>
                <span className="badge badge-c7">Analytics</span>
                <span className="badge badge-c6">333 Agents</span>
              </div>
              <div
                style={{
                  fontSize: '.72rem',
                  color: 'var(--text-3)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: 14,
                  fontWeight: 600,
                  letterSpacing: '.04em',
                }}
              >
                List → Mint DPP → KOC Sell → Earn
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="chakra-divider" />

      {/* ═══════════════════════════════════════════
          SECTION 4 — HOA HỒNG ON-CHAIN
      ═══════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-badge">
              <span className="dot-pulse dot-violet" /> On-chain Commission
            </div>
            <h2 className="display-lg" style={{ marginBottom: 12 }}>
              Hoa hồng minh bạch —{' '}
              <span className="gradient-text">từ đơn hàng đến ví KOC</span>
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                color: 'var(--text-2)',
                maxWidth: 520,
                margin: '0 auto',
              }}
            >
              Mọi khoản hoa hồng được Smart Contract xử lý tự động, minh bạch tuyệt đối.
            </p>
          </div>

          {/* Horizontal flow */}
          <div className="commission-flow" style={{ padding: '48px 32px', borderRadius: 28 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0,
                position: 'relative',
                zIndex: 1,
                flexWrap: 'wrap',
              }}
            >
              {/* Step 1 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minWidth: 100,
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c4-500), var(--c5-500))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: 12,
                    boxShadow: '0 4px 20px rgba(34,197,94,.3)',
                  }}
                >
                  🛍️
                </div>
                <span
                  style={{
                    fontSize: '.82rem',
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    marginBottom: 2,
                  }}
                >
                  Người mua đặt hàng
                </span>
                <span className="mono" style={{ color: 'var(--text-3)', fontSize: '.68rem' }}>
                  Bước 1
                </span>
              </div>

              {/* Arrow */}
              <div
                style={{
                  width: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 2,
                    background: 'var(--chakra-flow)',
                    borderRadius: 1,
                  }}
                />
                <span style={{ position: 'absolute', color: 'var(--text-3)', fontSize: '.8rem' }}>
                  →
                </span>
              </div>

              {/* Step 2 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minWidth: 100,
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c5-500), var(--c5-700))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: 12,
                    boxShadow: '0 4px 20px rgba(6,182,212,.3)',
                  }}
                >
                  📦
                </div>
                <span
                  style={{
                    fontSize: '.82rem',
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    marginBottom: 2,
                  }}
                >
                  Đơn hàng xác nhận
                </span>
                <span className="mono" style={{ color: 'var(--text-3)', fontSize: '.68rem' }}>
                  Bước 2
                </span>
              </div>

              {/* Arrow */}
              <div
                style={{
                  width: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 2,
                    background: 'var(--chakra-flow)',
                    borderRadius: 1,
                  }}
                />
                <span style={{ position: 'absolute', color: 'var(--text-3)', fontSize: '.8rem' }}>
                  →
                </span>
              </div>

              {/* Step 3 — Highlight */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minWidth: 110,
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c6-500), var(--c7-500))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    marginBottom: 12,
                    boxShadow: 'var(--chakra-glow)',
                    border: '2px solid rgba(99,102,241,.4)',
                  }}
                >
                  ⛓️
                </div>
                <span
                  style={{
                    fontSize: '.82rem',
                    fontWeight: 700,
                    color: 'var(--text-1)',
                    marginBottom: 2,
                  }}
                >
                  Smart Contract xử lý
                </span>
                <span className="mono" style={{ color: 'var(--c6-300)', fontSize: '.68rem' }}>
                  Polygon
                </span>
              </div>

              {/* Arrow */}
              <div
                style={{
                  width: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 2,
                    background: 'var(--chakra-flow)',
                    borderRadius: 1,
                  }}
                />
                <span style={{ position: 'absolute', color: 'var(--text-3)', fontSize: '.8rem' }}>
                  →
                </span>
              </div>

              {/* Step 4 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minWidth: 100,
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c6-500), var(--c7-500))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: 12,
                    boxShadow: '0 4px 20px rgba(99,102,241,.3)',
                  }}
                >
                  ⭐
                </div>
                <span
                  style={{
                    fontSize: '.82rem',
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    marginBottom: 2,
                  }}
                >
                  KOC nhận hoa hồng
                </span>
                <span className="mono" style={{ color: 'var(--text-3)', fontSize: '.68rem' }}>
                  T1 40% · T2 13%
                </span>
              </div>

              {/* Arrow */}
              <div
                style={{
                  width: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 2,
                    background: 'var(--chakra-flow)',
                    borderRadius: 1,
                  }}
                />
                <span style={{ position: 'absolute', color: 'var(--text-3)', fontSize: '.8rem' }}>
                  →
                </span>
              </div>

              {/* Step 5 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minWidth: 100,
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c7-500), var(--c4-500))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: 12,
                    boxShadow: '0 4px 20px rgba(168,85,247,.3)',
                  }}
                >
                  ✓
                </div>
                <span
                  style={{
                    fontSize: '.82rem',
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    marginBottom: 2,
                  }}
                >
                  Bằng chứng on-chain
                </span>
                <span className="mono" style={{ color: 'var(--text-3)', fontSize: '.68rem' }}>
                  Immutable
                </span>
              </div>
            </div>
          </div>

          {/* Verified strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              marginTop: 24,
              padding: '14px 24px',
              borderRadius: 14,
              background: 'var(--badge-verified-bg)',
              border: '1px solid rgba(34,197,94,.2)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '.78rem',
                fontWeight: 700,
                color: 'var(--badge-verified-clr)',
              }}
            >
              ⬡ Verified on Polygon
            </span>
            <span className="mono" style={{ color: 'var(--text-3)' }}>
              0x7A3b...2eF8::CommissionSplit
            </span>
            <span
              style={{
                fontSize: '.78rem',
                fontWeight: 700,
                color: 'var(--badge-verified-clr)',
              }}
            >
              ✓ Immutable
            </span>
          </div>
        </div>
      </section>

      <div className="chakra-divider" />

      {/* ═══════════════════════════════════════════
          SECTION 5 — CON SỐ ẤN TƯỢNG
      ═══════════════════════════════════════════ */}
      <section
        style={{
          padding: '96px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(34,197,94,.1) 0%, rgba(6,182,212,.12) 25%, rgba(99,102,241,.14) 50%, rgba(168,85,247,.1) 75%, rgba(34,197,94,.08) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-0)',
            opacity: 0.82,
          }}
        />

        <div
          className="container"
          style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
        >
          <div style={{ marginBottom: 56 }}>
            <div className="section-badge">
              <span className="dot-pulse dot-indigo" /> Social Proof
            </div>
            <h2 className="display-lg">
              Con số <span className="gradient-text">ấn tượng</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 16,
              maxWidth: 960,
              margin: '0 auto',
            }}
          >
            {[
              { value: 142, suffix: '₫', label: 'GMV (tỷ ₫)' },
              { value: 12847, suffix: '', label: 'Active KOCs' },
              { value: 890, suffix: 'K', label: 'DPP Minted' },
              { value: 333, suffix: '', label: 'AI Agents' },
              { value: 2400, suffix: '', label: 'Live Sessions' },
              { value: 38, suffix: '₫', label: 'Hoa hồng đã trả (tỷ ₫)' },
            ].map((stat, i) => (
              <MetricCounter
                key={i}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="chakra-divider" />

      {/* ═══════════════════════════════════════════
          SECTION 6 — CÔNG NGHỆ ĐÁNG TIN
      ═══════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-1)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-badge">
              <span className="dot-pulse dot-indigo" /> Công nghệ
            </div>
            <h2 className="display-lg">
              Công nghệ <span className="gradient-text">đáng tin</span>
            </h2>
          </div>

          {/* Tech badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 48,
            }}
          >
            {['Polygon', 'IPFS', 'OpenAI', 'Supabase', 'React', 'Solidity'].map(
              (tech) => (
                <div
                  key={tech}
                  className="card"
                  style={{
                    padding: '12px 24px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '.85rem',
                    fontWeight: 600,
                    color: 'var(--text-2)',
                    transition: 'var(--t-base)',
                    cursor: 'default',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--ff-mono)',
                      fontSize: '.75rem',
                      color: 'var(--text-3)',
                    }}
                  >
                    {'<>'}
                  </span>
                  {tech}
                </div>
              ),
            )}
          </div>

          {/* Trust indicators */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 28px',
                borderRadius: 16,
                background: 'var(--badge-verified-bg)',
                border: '1px solid rgba(34,197,94,.2)',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⬡</span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '.85rem',
                    color: 'var(--badge-verified-clr)',
                  }}
                >
                  100% On-chain
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>
                  Dữ liệu lưu trữ trên blockchain
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 28px',
                borderRadius: 16,
                background: 'rgba(99,102,241,.08)',
                border: '1px solid rgba(99,102,241,.2)',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⛓️</span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '.85rem',
                    color: 'var(--c6-300)',
                  }}
                >
                  Smart Contract Audited
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>
                  Audit bởi đội ngũ bảo mật chuyên nghiệp
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 28px',
                borderRadius: 16,
                background: 'rgba(168,85,247,.08)',
                border: '1px solid rgba(168,85,247,.2)',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🧠</span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '.85rem',
                    color: 'var(--c7-300)',
                  }}
                >
                  333 AI Agents 24/7
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>
                  Vận hành tự động không ngừng nghỉ
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="chakra-divider" />

      {/* ═══════════════════════════════════════════
          SECTION 7 — CTA BOTTOM
      ═══════════════════════════════════════════ */}
      <section
        style={{
          padding: '96px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Warm gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(34,197,94,.1) 0%, rgba(6,182,212,.12) 25%, rgba(99,102,241,.14) 50%, rgba(168,85,247,.1) 75%, rgba(34,197,94,.08) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-0)',
            opacity: 0.85,
          }}
        />

        <div
          className="container"
          style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
        >
          <h2 className="display-lg" style={{ marginBottom: 16 }}>
            Tham gia cộng đồng thương mại{' '}
            <span className="gradient-text">thiện lành</span>
          </h2>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-2)',
              maxWidth: 520,
              margin: '0 auto 40px',
              lineHeight: 1.7,
            }}
          >
            Chọn vai trò phù hợp và bắt đầu hành trình cùng hệ sinh thái thương mại
            on-chain thiện lành đầu tiên tại Việt Nam.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <Link to="/login" className="btn btn-primary btn-lg">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Đăng ký miễn phí
            </Link>
          </div>

          <p style={{ marginTop: 24, fontSize: '.78rem', color: 'var(--text-3)' }}>
            Miễn phí · Không cần thẻ tín dụng · Kết nối ví trong 30 giây
          </p>
        </div>
      </section>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 768px) {
          .grid-6-metrics {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}

/* ── Metric counter for Section 5 ── */
function MetricCounter({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const { count, ref } = useCounter(value);
  return (
    <div
      ref={ref}
      style={{
        textAlign: 'center',
        padding: '24px 8px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--ff-display)',
          fontWeight: 800,
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          lineHeight: 1,
          background: 'var(--chakra-text)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
        }}
      >
        {suffix === '₫'
          ? `₫${count}B`
          : suffix === 'K'
            ? `${count.toLocaleString()}K`
            : count.toLocaleString()}
      </div>
      <div
        style={{
          fontSize: '.68rem',
          fontWeight: 600,
          color: 'var(--text-3)',
          letterSpacing: '.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );
}
