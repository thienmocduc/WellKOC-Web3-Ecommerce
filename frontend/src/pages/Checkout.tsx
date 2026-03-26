import { useState } from 'react';
import { Link } from 'react-router-dom';

type CheckoutStep = 1 | 2 | 3;
type PaymentMethod = 'vnpay' | 'momo' | 'crypto';

const formatVND = (price: number): string =>
  new Intl.NumberFormat('vi-VN').format(price) + ' \u20AB';

const stepLabels = ['Dia chi', 'Thanh toan', 'Xac nhan'];

const orderItems = [
  { name: 'Tra O Long Dai Loan Premium', qty: 2, price: 389000, gradient: 'linear-gradient(135deg, #84cc16, #22c55e)' },
  { name: 'Serum Vitamin C 20% Brightening', qty: 1, price: 315000, gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  { name: 'Mat Ong Rung Tay Nguyen 500ml', qty: 1, price: 285000, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
];

const paymentOptions: { key: PaymentMethod; icon: string; label: string; desc: string; color: string }[] = [
  { key: 'vnpay', icon: '🏦', label: 'VNPay', desc: 'The ATM / Visa / Mastercard', color: 'var(--c5-500, #3b82f6)' },
  { key: 'momo', icon: '📱', label: 'Vi MoMo', desc: 'Thanh toan qua vi dien tu MoMo', color: '#d63384' },
  { key: 'crypto', icon: '⛓️', label: 'Crypto — USDT/USDC', desc: 'Thanh toan bang stablecoin tren Polygon', color: 'var(--c4-500, #22c55e)' },
];

export default function Checkout() {
  const [step, setStep] = useState<CheckoutStep>(1);
  const [payment, setPayment] = useState<PaymentMethod>('vnpay');
  const [useW3CToken, setUseW3CToken] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Shipping form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailAddr, setEmailAddr] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = 0;
  const w3cDiscount = useW3CToken ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + shipping - w3cDiscount;
  const totalXP = orderItems.reduce((s, i) => s + i.qty * 10, 0);

  const orderNumber = `ORD-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
  const txHash = '0x7a3f8c2e1d5b9f4a6e3c7d8b2a1f5e9c4d6b8a3f7e2c1d5b9a4f6e3c7d8b2a1f';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    borderRadius: 12, border: '1px solid var(--border)',
    background: 'var(--bg-2)', color: 'var(--text-1)',
    fontSize: '.85rem', outline: 'none',
    fontFamily: 'var(--ff-body, system-ui)',
    transition: 'border-color .2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '.68rem', fontWeight: 600, color: 'var(--text-4)',
    marginBottom: 4, display: 'block', letterSpacing: '.02em',
    textTransform: 'uppercase' as const,
  };

  // Success State
  if (submitted) {
    return (
      <div style={{
        paddingTop: 'var(--topbar-height, 64px)', minHeight: '100vh',
        background: 'var(--bg-0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 500 }}>
          {/* Checkmark animation */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, rgba(34,197,94,.15), rgba(6,182,212,.1))',
            border: '3px solid var(--c4-500, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem',
          }}>
            ✅
          </div>

          <h1 className="display-lg gradient-text" style={{ marginBottom: 8 }}>
            Dat Hang Thanh Cong!
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '.88rem', marginBottom: 24, lineHeight: 1.6 }}>
            Don hang cua ban da duoc xac nhan. Ban se nhan duoc email xac nhan chi tiet.
          </p>

          {/* Order details */}
          <div className="card" style={{ padding: 20, background: 'var(--bg-2)', marginBottom: 16, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '.82rem' }}>
              <span style={{ color: 'var(--text-3)' }}>Ma don hang</span>
              <span style={{ fontWeight: 700, fontFamily: 'var(--ff-display, monospace)' }}>{orderNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '.82rem' }}>
              <span style={{ color: 'var(--text-3)' }}>Tong tien</span>
              <span style={{
                fontFamily: 'var(--ff-display, system-ui)', fontWeight: 800,
                color: 'var(--c6-300, #06b6d4)',
              }}>
                {formatVND(total)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
              <span style={{ color: 'var(--text-3)' }}>XP nhan duoc</span>
              <span className="badge badge-gold">+{totalXP} XP</span>
            </div>
          </div>

          {/* TX Hash for crypto */}
          {payment === 'crypto' && (
            <div className="onchain-card" style={{ padding: 14, marginBottom: 16, textAlign: 'left' }}>
              <div className="verified-seal" style={{ marginBottom: 6, fontSize: '.75rem' }}>On-chain Receipt</div>
              <div style={{ fontSize: '.65rem', color: 'var(--c4-300, #22c55e)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                TX: {txHash.slice(0, 20)}...{txHash.slice(-8)}
              </div>
              <a href="#" style={{
                fontSize: '.68rem', color: 'var(--c6-300, #06b6d4)',
                textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: 4,
              }}>
                Xem tren PolygonScan →
              </a>
            </div>
          )}

          {/* XP earned highlight */}
          <div style={{
            padding: '12px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(6,182,212,.08), rgba(99,102,241,.08))',
            border: '1px solid rgba(6,182,212,.15)',
            marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: '1.2rem' }}>🎮</span>
            <span style={{ fontWeight: 700, color: 'var(--c6-300, #06b6d4)' }}>+{totalXP} XP</span>
            <span style={{ color: 'var(--text-3)', fontSize: '.82rem' }}>da duoc cong vao tai khoan</span>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', padding: '10px 24px' }}>
              Ve trang chu
            </Link>
            <Link to="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '10px 24px' }}>
              Xem don hang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'var(--topbar-height, 64px)', minHeight: '100vh', background: 'var(--bg-0)' }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className="section-badge">💳 THANH TOAN</div>
        <h1 className="display-md" style={{ marginBottom: 4 }}>Thanh Toan Don Hang</h1>

        {/* Step Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '24px 0 36px', maxWidth: 400 }}>
          {stepLabels.map((label, i) => {
            const sNum = (i + 1) as CheckoutStep;
            const isActive = step === sNum;
            const isDone = step > sNum;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.78rem', fontWeight: 700,
                    background: isDone ? 'var(--c4-500, #22c55e)' : isActive ? 'var(--c7-500, #6366f1)' : 'var(--bg-2)',
                    color: isDone || isActive ? '#fff' : 'var(--text-4)',
                    border: `2px solid ${isDone ? 'var(--c4-500, #22c55e)' : isActive ? 'var(--c7-500, #6366f1)' : 'var(--border)'}`,
                    transition: 'all .3s', cursor: isDone ? 'pointer' : 'default',
                  }} onClick={() => isDone && setStep(sNum)}>
                    {isDone ? '✓' : sNum}
                  </div>
                  <span style={{ fontSize: '.62rem', fontWeight: 600, color: isActive ? 'var(--text-1)' : 'var(--text-4)', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 10px', marginBottom: 18,
                    background: isDone ? 'var(--c4-500, #22c55e)' : 'var(--border)',
                    borderRadius: 1, transition: 'background .3s',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
          {/* Left - Step Content */}
          <div>
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>
                  Thong tin giao hang
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Ho va ten *</label>
                      <input type="text" placeholder="Nguyen Van A" value={fullName} onChange={e => setFullName(e.target.value)} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>So dien thoai *</label>
                      <input type="tel" placeholder="0912 345 678" value={phone} onChange={e => setPhone(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" placeholder="email@example.com" value={emailAddr} onChange={e => setEmailAddr(e.target.value)} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Dia chi *</label>
                    <input type="text" placeholder="So nha, ten duong" value={address} onChange={e => setAddress(e.target.value)} required style={inputStyle} />
                  </div>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Quan / Huyen *</label>
                      <input type="text" placeholder="Quan 1" value={district} onChange={e => setDistrict(e.target.value)} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tinh / Thanh pho *</label>
                      <input type="text" placeholder="TP. Ho Chi Minh" value={city} onChange={e => setCity(e.target.value)} required style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Ghi chu</label>
                    <textarea
                      placeholder="Ghi chu cho don hang (khong bat buoc)"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={2}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setStep(2)}
                  style={{ width: '100%', marginTop: 20, padding: '14px 24px' }}
                >
                  Tiep tuc chon thanh toan
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card" style={{ padding: 28 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--c6-300, #06b6d4)', fontSize: '.82rem', fontWeight: 600,
                    fontFamily: 'var(--ff-body, system-ui)', marginBottom: 16, padding: 0,
                  }}
                >
                  ← Quay lai
                </button>

                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>
                  Phuong thuc thanh toan
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {paymentOptions.map(pm => (
                    <div
                      key={pm.key}
                      onClick={() => setPayment(pm.key)}
                      style={{
                        padding: '16px 20px', borderRadius: 14, cursor: 'pointer',
                        border: '2px solid',
                        borderColor: payment === pm.key ? pm.color : 'var(--border)',
                        background: payment === pm.key ? `${pm.color}08` : 'var(--bg-2)',
                        display: 'flex', alignItems: 'center', gap: 14,
                        transition: 'all .2s',
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{pm.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{pm.label}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{pm.desc}</div>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: `2px solid ${payment === pm.key ? pm.color : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {payment === pm.key && (
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: pm.color }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Crypto wallet input */}
                {payment === 'crypto' && (
                  <div className="onchain-card" style={{ padding: 16, marginBottom: 16 }}>
                    <div className="verified-seal" style={{ marginBottom: 8, fontSize: '.75rem' }}>
                      Web3 Payment
                    </div>
                    <label style={labelStyle}>Dia chi vi (Polygon) *</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={e => setWalletAddress(e.target.value)}
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '.78rem' }}
                    />
                    <div style={{ fontSize: '.68rem', color: 'var(--text-4)', marginTop: 6 }}>
                      Gas fee thap, xac nhan nhanh tren Polygon Network
                    </div>
                  </div>
                )}

                {/* W3C Token option */}
                <div
                  onClick={() => setUseW3CToken(!useW3CToken)}
                  style={{
                    padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                    border: '2px solid',
                    borderColor: useW3CToken ? 'var(--c7-500, #6366f1)' : 'var(--border)',
                    background: useW3CToken ? 'rgba(99,102,241,.06)' : 'var(--bg-2)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginBottom: 20, transition: 'all .2s',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: `2px solid ${useW3CToken ? 'var(--c7-500, #6366f1)' : 'var(--border)'}`,
                    background: useW3CToken ? 'var(--c7-500, #6366f1)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '.7rem', fontWeight: 700,
                  }}>
                    {useW3CToken && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.85rem' }}>
                      Thanh toan bang W3C Token
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--c4-500, #22c55e)', fontWeight: 600 }}>
                      Giam 5% tong don hang ({formatVND(Math.round(subtotal * 0.05))})
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setStep(3)}
                  style={{ width: '100%', padding: '14px 24px' }}
                >
                  Xac nhan don hang
                </button>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="card" style={{ padding: 28 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--c6-300, #06b6d4)', fontSize: '.82rem', fontWeight: 600,
                    fontFamily: 'var(--ff-body, system-ui)', marginBottom: 16, padding: 0,
                  }}
                >
                  ← Quay lai
                </button>

                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>
                  Xac nhan don hang
                </h3>

                {/* Shipping Summary */}
                <div style={{
                  padding: '14px 18px', borderRadius: 12, background: 'var(--bg-2)',
                  marginBottom: 16,
                }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>
                    Giao den
                  </div>
                  <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{fullName || 'Nguyen Van A'}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: 2 }}>
                    {phone || '0912 345 678'} · {emailAddr || 'email@example.com'}
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: 2 }}>
                    {address || '123 Nguyen Hue'}, {district || 'Quan 1'}, {city || 'TP.HCM'}
                  </div>
                </div>

                {/* Payment Summary */}
                <div style={{
                  padding: '14px 18px', borderRadius: 12, background: 'var(--bg-2)',
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>
                    Thanh toan
                  </div>
                  <div style={{ fontSize: '.85rem', fontWeight: 600 }}>
                    {paymentOptions.find(pm => pm.key === payment)?.icon}{' '}
                    {paymentOptions.find(pm => pm.key === payment)?.label}
                  </div>
                  {useW3CToken && (
                    <div style={{ fontSize: '.75rem', color: 'var(--c4-500, #22c55e)', marginTop: 4 }}>
                      + W3C Token (giam 5%)
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {orderItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < orderItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                        background: item.gradient,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '.68rem', color: 'var(--text-3)' }}>x{item.qty}</div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '.82rem' }}>
                        {formatVND(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setSubmitted(true)}
                  style={{
                    width: '100%', padding: '16px 24px', fontSize: '1rem',
                  }}
                >
                  Dat hang
                </button>
              </div>
            )}
          </div>

          {/* Right - Order Summary (sticky) */}
          <div style={{ position: 'sticky', top: 'calc(var(--topbar-height, 64px) + 32px)', alignSelf: 'start' }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{
                fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)',
                textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16,
              }}>
                DON HANG CUA BAN
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {orderItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: item.gradient,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600, fontSize: '.75rem',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{item.name}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>x{item.qty}</div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '.78rem', flexShrink: 0 }}>
                      {formatVND(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 14px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>Tam tinh</span>
                  <span style={{ fontWeight: 600 }}>{formatVND(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>Van chuyen</span>
                  <span style={{ fontWeight: 600, color: 'var(--c4-500, #22c55e)' }}>Mien phi</span>
                </div>
                {w3cDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                    <span style={{ color: 'var(--c7-500, #6366f1)' }}>W3C Token -5%</span>
                    <span style={{ fontWeight: 600, color: 'var(--c4-500, #22c55e)' }}>-{formatVND(w3cDiscount)}</span>
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '0 0 14px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: '.95rem' }}>Tong cong</span>
                <span style={{
                  fontFamily: 'var(--ff-display, system-ui)', fontWeight: 800,
                  fontSize: '1.2rem', color: 'var(--c6-300, #06b6d4)',
                }}>
                  {formatVND(total)}
                </span>
              </div>

              <div className="card" style={{
                padding: '10px 14px', background: 'var(--bg-2)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>🎮 XP nhan duoc</span>
                  <span className="badge badge-gold" style={{ fontSize: '.68rem' }}>+{totalXP} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
