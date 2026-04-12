/**
 * WellKOC — Landing Page (GitHub-style informational)
 */
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

/* ── Animated counter ── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.disconnect();
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { count, ref };
}
function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const { count, ref } = useCounter(value);
  const display = suffix === 'B₫' ? `${count}B₫` : suffix === 'K' ? `${count}K` : suffix === 'M' ? `${count}M` : `${count}${suffix ?? ''}`;
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, background: 'var(--chakra-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{display}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 6, letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

const FEATURES = [
  {
    color: '#22c55e',
    icon: '⬡',
    title: 'Marketplace Web3',
    desc: 'Hàng ngàn sản phẩm được xác thực on-chain. Mỗi giao dịch minh bạch, không thể giả mạo.',
    items: ['DPP Passport cho từng sản phẩm', 'Thanh toán crypto & fiat', 'Escrow tự động qua Smart Contract'],
    to: '/marketplace',
    cta: 'Khám phá Marketplace',
  },
  {
    color: '#06b6d4',
    icon: '◉',
    title: 'Live Commerce',
    desc: 'Mua sắm qua livestream real-time. KOC review trực tiếp, người mua đặt hàng ngay trong khi xem.',
    items: ['Tích hợp TikTok, Shopee, Facebook', 'Đặt hàng 1-click trong livestream', 'Analytics real-time cho host'],
    to: '/live',
    cta: 'Xem livestream ngay',
  },
  {
    color: '#6366f1',
    icon: '⭐',
    title: 'KOC Platform',
    desc: 'Nền tảng đầu tiên tại Việt Nam trả hoa hồng on-chain. Hoa hồng T1 40%, T2 13% — tự động qua Smart Contract.',
    items: ['Hoa hồng 40% tầng 1, 13% tầng 2', 'Thanh toán tức thì, không trung gian', 'Creator Token cá nhân hóa'],
    to: '/koc',
    cta: 'Trở thành KOC',
  },
  {
    color: '#a855f7',
    icon: '⚙',
    title: '333 AI Agents',
    desc: 'Hệ thống marketing tự động hoàn toàn: từ nghiên cứu xu hướng đến xuất bản nội dung đa kênh chỉ với 1 click.',
    items: ['9-Stage pipeline tự động', 'Tích hợp TikTok, Instagram, Zalo', 'Báo cáo ROI real-time'],
    to: '/agents',
    cta: 'Khám phá AI Agents',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Đăng ký tài khoản', desc: 'Tạo hồ sơ trong 2 phút. Chọn vai trò: Người mua, KOC, hoặc Vendor.', icon: '◈', color: '#22c55e' },
  { step: '02', title: 'Khám phá & chia sẻ', desc: 'Mua sắm, review sản phẩm, chia sẻ link affiliate. Mỗi lượt mua thành công = hoa hồng on-chain.', icon: '◎', color: '#06b6d4' },
  { step: '03', title: 'Nhận hoa hồng tự động', desc: 'Smart Contract phân phối hoa hồng ngay lập tức, 100% minh bạch, không trung gian.', icon: '◆', color: '#a855f7' },
];

const TESTIMONIALS = [
  { name: 'Linh Nguyễn', role: 'KOC Top 1 · Beauty', avatar: '🌸', text: '"Tháng đầu tôi kiếm được 18 triệu chỉ từ việc review son môi. Hoa hồng vào ví ngay lập tức, không cần chờ duyệt."', earnings: '42.5M/tháng' },
  { name: 'Minh Tú', role: 'KOC Tech · 96K followers', avatar: '🔥', text: '"WellKOC là nền tảng duy nhất trả commission on-chain. Tôi có thể verify từng giao dịch trên Polygon."', earnings: '38.1M/tháng' },
  { name: 'Thy Ngọc', role: 'Vendor · Wellness', avatar: '🌿', text: '"Doanh số tăng 340% sau 3 tháng nhờ mạng lưới KOC của WellKOC. Chi phí marketing giảm 60%."', earnings: '+340% GMV' },
];

const CHAIN_STATS = [
  { label: 'Giao dịch on-chain', value: '2.4M+', color: '#22c55e' },
  { label: 'Smart Contracts deploy', value: '12', color: '#06b6d4' },
  { label: 'Hoa hồng đã chi trả', value: '48B₫', color: '#6366f1' },
  { label: 'Uptime SLA', value: '99.9%', color: '#a855f7' },
];

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div style={{ background: 'var(--bg-1)', color: 'var(--text-1)', fontFamily: 'var(--ff-body, Inter, system-ui)' }}>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.08) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,.05) 0%, transparent 70%)' }} />
        </div>

        <div style={{ maxWidth: 860, position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            border: '1px solid rgba(34,197,94,.3)',
            background: 'rgba(34,197,94,.06)',
            fontSize: '0.78rem', color: '#22c55e', fontWeight: 600,
            marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Nền tảng KOC Web3 đầu tiên tại Việt Nam
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.8rem)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 20, letterSpacing: '-0.02em',
          }}>
            <span style={{ color: 'var(--text-1)' }}>Thương mại cộng đồng</span>
            <br />
            <span style={{ background: 'var(--chakra-text, linear-gradient(135deg,#22c55e,#06b6d4,#6366f1,#a855f7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              trên Blockchain
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-3)', lineHeight: 1.65, maxWidth: 640, margin: '0 auto 36px', fontWeight: 400 }}>
            Kết nối <strong style={{ color: 'var(--text-2)' }}>Người mua · KOC · Vendor</strong> trên blockchain Polygon.
            Hoa hồng tự động qua Smart Contract. 333 AI Agents marketing 24/7.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link to="/register" style={{
              padding: '14px 32px', borderRadius: 12,
              background: 'linear-gradient(135deg,#22c55e,#06b6d4)',
              color: '#fff', fontSize: '0.95rem', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 0 24px rgba(34,197,94,.3)',
              transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(34,197,94,.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(34,197,94,.3)'; }}
            >
              Bắt đầu miễn phí →
            </Link>
            <Link to="/marketplace" style={{
              padding: '14px 28px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-2)', fontSize: '0.95rem', fontWeight: 600,
              textDecoration: 'none', transition: 'border-color .2s, color .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
            >
              Khám phá Marketplace
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32,
            padding: '28px 40px',
            background: 'var(--surface-card)', borderRadius: 20,
            border: '1px solid var(--border)',
          }}>
            <Stat value={480} suffix="B₫" label="GMV Mục tiêu" />
            <Stat value={333} label="AI Agents 24/7" />
            <Stat value={40} suffix="%" label="Hoa hồng T1 KOC" />
            <Stat value={12} label="Blockchain Networks" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>NỀN TẢNG TOÀN DIỆN</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Mọi thứ bạn cần để<br />
              <span style={{ background: 'var(--chakra-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>phát triển trong Web3</span>
            </h2>
          </div>

          {/* Feature tabs */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {FEATURES.map((f, i) => (
              <button key={f.title} onClick={() => setActiveFeature(i)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 24,
                border: `1px solid ${activeFeature === i ? f.color : 'var(--border)'}`,
                background: activeFeature === i ? `${f.color}15` : 'transparent',
                color: activeFeature === i ? f.color : 'var(--text-3)',
                fontSize: '0.88rem', fontWeight: activeFeature === i ? 700 : 500,
                cursor: 'pointer', transition: 'all .2s',
              }}>
                <span>{f.icon}</span>{f.title}
              </button>
            ))}
          </div>

          {/* Active feature panel */}
          {FEATURES.map((f, i) => i === activeFeature && (
            <div key={f.title} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
              padding: '48px', borderRadius: 20,
              border: `1px solid ${f.color}33`,
              background: `linear-gradient(135deg, ${f.color}08 0%, var(--surface-card) 100%)`,
              animation: 'fadeIn .2s ease',
            }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '6px 14px', borderRadius: 8,
                  background: `${f.color}15`, border: `1px solid ${f.color}33`,
                  fontSize: '0.78rem', fontWeight: 700, color: f.color, marginBottom: 20,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>{f.title}
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 16, lineHeight: 1.25 }}>{f.desc}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {f.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: 'var(--text-2)' }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 900, flexShrink: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to={f.to} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '11px 24px', borderRadius: 10,
                  background: f.color, color: '#fff',
                  fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
                }}>{f.cta} →</Link>
              </div>
              {/* Visual panel */}
              <div style={{
                borderRadius: 16, overflow: 'hidden',
                background: 'var(--bg-1)', border: `1px solid ${f.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 280, fontSize: '8rem',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${f.color}10 0%, transparent 70%)` }} />
                <span style={{ filter: `drop-shadow(0 0 40px ${f.color})`, position: 'relative', zIndex: 1 }}>{f.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>CÁCH HOẠT ĐỘNG</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800 }}>Bắt đầu kiếm thu nhập<br />chỉ trong 3 bước</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 32, left: '20%', right: '20%', height: 2, background: 'linear-gradient(90deg, #22c55e, #06b6d4, #a855f7)', opacity: 0.3, zIndex: 0 }} />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{
                textAlign: 'center', padding: '36px 24px',
                background: 'var(--surface-card)', borderRadius: 16,
                border: '1px solid var(--border)', position: 'relative', zIndex: 1,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `${step.color}15`, border: `2px solid ${step.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', margin: '0 auto 16px',
                  boxShadow: `0 0 20px ${step.color}33`,
                }}>{step.icon}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: step.color, letterSpacing: '0.1em', marginBottom: 8 }}>BƯỚC {step.step}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCKCHAIN STATS ── */}
      <section style={{
        padding: '60px 24px',
        background: 'linear-gradient(135deg, rgba(10,12,20,.97) 0%, rgba(15,18,30,.98) 100%)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>BLOCKCHAIN TRANSPARENCY</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Mọi số liệu đều <span style={{ color: '#22c55e' }}>on-chain</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {CHAIN_STATS.map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '24px 16px',
                borderRadius: 16, border: `1px solid ${s.color}22`,
                background: `${s.color}08`,
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>THÀNH CÔNG THỰC TẾ</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800 }}>KOC nói gì về WellKOC?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => {
              const colors = ['#22c55e', '#06b6d4', '#a855f7'];
              const c = colors[i % colors.length];
              return (
                <div key={t.name} style={{
                  padding: '28px', borderRadius: 16,
                  background: 'var(--surface-card)',
                  border: `1px solid ${c}22`,
                  display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65, fontStyle: 'italic' }}>{t.text}</div>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `${c}15`, border: `2px solid ${c}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{t.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: c }}>{t.earnings}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>thu nhập</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,.06) 0%, transparent 70%)' }} />
        </div>
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20 }}>
            Sẵn sàng tham gia<br />
            <span style={{ background: 'var(--chakra-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>cộng đồng WellKOC?</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-3)', marginBottom: 36, lineHeight: 1.6 }}>
            Hơn <strong style={{ color: 'var(--text-1)' }}>10,000+</strong> KOC và Vendor đang phát triển cùng nền tảng blockchain đầu tiên tại Việt Nam.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              padding: '16px 40px', borderRadius: 12,
              background: 'linear-gradient(135deg,#22c55e,#06b6d4)',
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 0 32px rgba(34,197,94,.35)',
            }}>Đăng ký miễn phí →</Link>
            <Link to="/koc" style={{
              padding: '16px 32px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-2)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none',
            }}>Tìm hiểu về KOC</Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.4 } }
      `}</style>
    </div>
  );
}
