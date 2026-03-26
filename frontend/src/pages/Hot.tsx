import { useState } from 'react';

const trendingProducts = [
  { id: 1, name: 'Trà Ô Long Đài Loan Premium', price: '389.000₫', oldPrice: '520.000₫', discount: '-25%', emoji: '🍵', dpp: true, sold: 1247, koc: 'MH', commission: '18%' },
  { id: 2, name: 'Serum Vitamin C 20% Brightening', price: '459.000₫', oldPrice: '650.000₫', discount: '-30%', emoji: '✨', dpp: true, sold: 892, koc: 'TL', commission: '22%' },
  { id: 3, name: 'Mật Ong Rừng Tây Nguyên', price: '285.000₫', oldPrice: '350.000₫', discount: '-18%', emoji: '🍯', dpp: true, sold: 2103, koc: 'NA', commission: '15%' },
  { id: 4, name: 'Cà Phê Arabica Đà Lạt', price: '245.000₫', oldPrice: '320.000₫', discount: '-23%', emoji: '☕', dpp: true, sold: 1580, koc: 'VH', commission: '20%' },
  { id: 5, name: 'Tinh Dầu Tràm Huế', price: '195.000₫', oldPrice: '250.000₫', discount: '-22%', emoji: '🌿', dpp: false, sold: 756, koc: 'PT', commission: '17%' },
  { id: 6, name: 'Bột Collagen Cá Biển', price: '890.000₫', oldPrice: '1.200.000₫', discount: '-26%', emoji: '🐟', dpp: true, sold: 634, koc: 'LN', commission: '25%' },
  { id: 7, name: 'Nước Hoa Hồng Organic', price: '320.000₫', oldPrice: '420.000₫', discount: '-24%', emoji: '🌹', dpp: true, sold: 1890, koc: 'HT', commission: '19%' },
  { id: 8, name: 'Hạt Macca Đắk Lắk', price: '350.000₫', oldPrice: '450.000₫', discount: '-22%', emoji: '🥜', dpp: true, sold: 943, koc: 'KD', commission: '16%' },
];

const flashDeals = [
  { id: 101, name: 'Kem Chống Nắng SPF50+', price: '199.000₫', oldPrice: '450.000₫', discount: '-56%', emoji: '☀️', timeLeft: '02:34:18', stock: 23 },
  { id: 102, name: 'Combo 3 Mặt Nạ Tổ Yến', price: '149.000₫', oldPrice: '380.000₫', discount: '-61%', emoji: '🎭', timeLeft: '01:12:45', stock: 8 },
  { id: 103, name: 'Dầu Dừa Ép Lạnh 500ml', price: '89.000₫', oldPrice: '180.000₫', discount: '-51%', emoji: '🥥', timeLeft: '04:56:02', stock: 45 },
  { id: 104, name: 'Trà Matcha Nhật Bản 100g', price: '259.000₫', oldPrice: '520.000₫', discount: '-50%', emoji: '🍃', timeLeft: '00:45:33', stock: 5 },
];

const categories = ['Tất cả', 'Sức khỏe', 'Làm đẹp', 'Thực phẩm', 'Đồ uống', 'Organic'];

export default function Hot() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeTab, setActiveTab] = useState<'trending' | 'bestseller' | 'flash'>('trending');

  return (
    <div style={{ paddingTop: 'var(--topbar-height)', minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* Hero Banner */}
      <div style={{
        padding: '60px 0 40px',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,191,36,.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(239,68,68,.08) 0%, transparent 50%)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-badge" style={{ background: 'rgba(251,191,36,.1)', color: 'var(--gold-400)', borderColor: 'rgba(251,191,36,.2)' }}>
            🔥 HOT DEALS
          </div>
          <h1 className="display-lg gradient-text" style={{ marginBottom: 12 }}>
            Sản Phẩm Hot Nhất
          </h1>
          <p style={{ color: 'var(--text-3)', maxWidth: 520, margin: '0 auto', fontSize: '.88rem' }}>
            Khám phá những sản phẩm trending, bestseller và flash deal hấp dẫn nhất từ cộng đồng KOC
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        {/* Tabs */}
        <div className="feature-tabs" style={{ margin: '0 auto 32px', justifyContent: 'center' }}>
          <button className={`feature-tab ${activeTab === 'trending' ? 'on' : ''}`} onClick={() => setActiveTab('trending')}>
            📈 Trending
          </button>
          <button className={`feature-tab ${activeTab === 'bestseller' ? 'on' : ''}`} onClick={() => setActiveTab('bestseller')}>
            ⭐ Bestseller
          </button>
          <button className={`feature-tab ${activeTab === 'flash' ? 'on' : ''}`} onClick={() => setActiveTab('flash')}>
            ⚡ Flash Deal
          </button>
        </div>

        {/* Category Filter */}
        {activeTab !== 'flash' && (
          <div className="flex gap-8" style={{ marginBottom: 28, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Trending / Bestseller Grid */}
        {activeTab !== 'flash' && (
          <div className="grid-4" style={{ gap: 20 }}>
            {trendingProducts.map((p, i) => (
              <div key={p.id} className="prod-card card-hover" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="prod-img" style={{ background: 'var(--bg-2)' }}>
                  <span>{p.emoji}</span>
                  {p.discount && <span className="discount-badge">{p.discount}</span>}
                  {p.dpp && <span className="dpp-badge">DPP ✓</span>}
                </div>
                <div className="prod-body">
                  <div className="prod-name">{p.name}</div>
                  <div className="flex gap-8" style={{ marginBottom: 6 }}>
                    <span className="badge badge-c6">Hoa hồng {p.commission}</span>
                  </div>
                  <div className="prod-meta">
                    <div>
                      <span className="prod-price">{p.price}</span>
                      <span style={{ fontSize: '.7rem', color: 'var(--text-4)', textDecoration: 'line-through', marginLeft: 6 }}>{p.oldPrice}</span>
                    </div>
                    <div className="prod-koc">
                      <div className="koc-avatar">{p.koc}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-3)', marginTop: 8 }}>
                    Đã bán {p.sold.toLocaleString()}
                  </div>
                  <div className="progress-track" style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: `${Math.min((p.sold / 2500) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Flash Deals */}
        {activeTab === 'flash' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div className="badge badge-gold" style={{ fontSize: '.72rem', padding: '.35rem .9rem' }}>
                ⚡ Flash Deal kết thúc sau vài giờ nữa
              </div>
            </div>
            <div className="grid-4" style={{ gap: 20 }}>
              {flashDeals.map((deal, i) => (
                <div key={deal.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    height: 140,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem',
                    background: 'linear-gradient(135deg, rgba(239,68,68,.08), rgba(251,191,36,.08))',
                    position: 'relative'
                  }}>
                    <span>{deal.emoji}</span>
                    <span className="discount-badge" style={{ background: '#ef4444', color: '#fff', position: 'absolute', top: 10, left: 10 }}>
                      {deal.discount}
                    </span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: '.82rem', marginBottom: 8 }}>{deal.name}</div>
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.1rem', color: '#ef4444' }}>{deal.price}</span>
                      <span style={{ fontSize: '.7rem', color: 'var(--text-4)', textDecoration: 'line-through' }}>{deal.oldPrice}</span>
                    </div>
                    <div className="card" style={{ padding: '8px 12px', textAlign: 'center', marginBottom: 10, background: 'var(--bg-2)' }}>
                      <span className="mono" style={{ fontSize: '.85rem', fontWeight: 700, color: '#ef4444' }}>⏰ {deal.timeLeft}</span>
                    </div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text-3)', marginBottom: 6 }}>Còn lại: {deal.stock} sản phẩm</div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${100 - (deal.stock / 50) * 100}%`, background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
                      Mua Ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* KOC Rankings */}
        <div style={{ marginTop: 64 }}>
          <div className="section-header">
            <div className="section-badge">👑 TOP KOC</div>
            <h2 className="display-md">Bảng Xếp Hạng KOC Tuần Này</h2>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', fontWeight: 700, fontSize: '.7rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              <span style={{ flex: '0 0 60px' }}>Hạng</span>
              <span style={{ flex: 1 }}>KOC</span>
              <span style={{ flex: '0 0 120px', textAlign: 'right' }}>Doanh số</span>
              <span style={{ flex: '0 0 100px', textAlign: 'right' }}>Hoa hồng</span>
              <span style={{ flex: '0 0 80px', textAlign: 'right' }}>Cấp</span>
            </div>
            {[
              { rank: 1, name: 'Minh Hương', sales: '45.2M₫', commission: '8.1M₫', level: 'Diamond', badge: '🥇' },
              { rank: 2, name: 'Thảo Linh', sales: '38.7M₫', commission: '6.9M₫', level: 'Platinum', badge: '🥈' },
              { rank: 3, name: 'Ngọc Anh', sales: '32.1M₫', commission: '5.7M₫', level: 'Platinum', badge: '🥉' },
              { rank: 4, name: 'Văn Hoàng', sales: '28.4M₫', commission: '5.1M₫', level: 'Gold', badge: '4' },
              { rank: 5, name: 'Phương Thảo', sales: '24.9M₫', commission: '4.4M₫', level: 'Gold', badge: '5' },
            ].map((koc) => (
              <div key={koc.rank} className="tx-row" style={{ padding: '14px 24px' }}>
                <span style={{ flex: '0 0 60px', fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1rem' }}>{koc.badge}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '.85rem' }}>{koc.name}</span>
                <span style={{ flex: '0 0 120px', textAlign: 'right', fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '.85rem' }}>{koc.sales}</span>
                <span style={{ flex: '0 0 100px', textAlign: 'right', color: 'var(--c4-500)', fontWeight: 600, fontSize: '.82rem' }}>{koc.commission}</span>
                <span style={{ flex: '0 0 80px', textAlign: 'right' }}>
                  <span className="badge badge-c7">{koc.level}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
