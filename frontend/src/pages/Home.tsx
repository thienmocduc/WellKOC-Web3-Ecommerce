/**
 * WellKOC Home — TikTok-style social entertainment feed
 * For You · Following · Live Now · Trending
 */
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ──────────────────────────────────────────────────
   MOCK DATA
────────────────────────────────────────────────── */
const STORIES = [
  { id: 1, name: 'Linh KOC', avatar: '🌸', ring: '#22c55e', live: true  },
  { id: 2, name: 'Minh Tú',   avatar: '🔥', ring: '#ef4444', live: true  },
  { id: 3, name: 'Hà Anh',    avatar: '💎', ring: '#6366f1', live: false },
  { id: 4, name: 'Khánh',     avatar: '⭐', ring: '#f0a500', live: false },
  { id: 5, name: 'Thy Thy',   avatar: '🌿', ring: '#06b6d4', live: false },
  { id: 6, name: 'Nam VN',    avatar: '🚀', ring: '#a855f7', live: false },
  { id: 7, name: 'Jade',      avatar: '💫', ring: '#ec4899', live: false },
  { id: 8, name: 'Bảo Châu',  avatar: '🎯', ring: '#22c55e', live: false },
  { id: 9, name: 'Tony B',    avatar: '🎵', ring: '#06b6d4', live: false },
  { id:10, name: 'Nhi NB',    avatar: '🌙', ring: '#f0a500', live: false },
];

const LIVE_NOW = [
  { id:1, host:'Linh KOC', avatar:'🌸', title:'Review son dưỡng Laneige siêu hot',  viewers:4821, product:'Son dưỡng môi', price:'185.000đ', tag:'beauty',   bg:'#1a0a2e' },
  { id:2, host:'Minh Tú',  avatar:'🔥', title:'Unbox thiết bị gaming giảm 40%',     viewers:3102, product:'Tai nghe JBL', price:'1.250.000đ', tag:'tech',  bg:'#0a1a2e' },
  { id:3, host:'Ngọc Hà',  avatar:'💄', title:'Skincare routine buổi sáng + deal',   viewers:2744, product:'Set dưỡng da', price:'650.000đ',   tag:'skin',  bg:'#1a1a0a' },
  { id:4, host:'Bảo Châu', avatar:'🎯', title:'Flash sale thời trang cuối tuần',     viewers:1987, product:'Áo croptop',  price:'210.000đ',   tag:'fashion',bg:'#1a0a1a' },
];

const FEED_VIDEOS = [
  { id:1,  author:'@linhkoc',   avatar:'🌸', name:'Linh KOC',    badge:'TOP KOC',  color:'#22c55e', title:'Dưỡng da ban đêm ĐÚNG CÁCH mà 99% chị em đang bỏ qua 😱',              thumb:'🧴', bg:'#0f1a2e', plays:'2.4M', likes:'182K', comments:'8.2K', shares:'47K', tags:['#skincare','#beauty','#wellkoc'], product:'Serum Retinol Pro',  price:'420.000đ' },
  { id:2,  author:'@minhtuu',   avatar:'🔥', name:'Minh Tú',     badge:'KOC Mới',  color:'#ef4444', title:'Thử thách: setup bàn làm việc dưới 2 triệu cho dân văn phòng',           thumb:'💻', bg:'#0a1a1a', plays:'1.8M', likes:'141K', comments:'6.1K', shares:'29K', tags:['#tech','#setup','#wellkoc'],    product:'Đèn LED desk',       price:'299.000đ' },
  { id:3,  author:'@thythy',    avatar:'🌿', name:'Thy Thy',     badge:'Verified', color:'#06b6d4', title:'5 món ăn vặt healthy mà không tốn tiền — cách mình duy trì cân nặng',   thumb:'🥗', bg:'#0a2e0a', plays:'3.1M', likes:'267K', comments:'14K', shares:'88K', tags:['#healthy','#food','#wellness'],  product:'Hạt Chia Organic',   price:'125.000đ' },
  { id:4,  author:'@jade_vn',   avatar:'💫', name:'Jade',        badge:'KOC Pro',  color:'#a855f7', title:'Review túi hiệu dupe cực xịn — ai cũng tưởng mua đồ chính hãng 😂',      thumb:'👜', bg:'#1a0a2e', plays:'986K', likes:'98K',  comments:'5.4K', shares:'22K', tags:['#fashion','#dupe','#style'],    product:'Túi tote canvas',    price:'350.000đ' },
  { id:5,  author:'@baochau',   avatar:'🎯', name:'Bảo Châu',    badge:'Rising',   color:'#f0a500', title:'Cách mình kiếm được 15 triệu/tháng với WellKOC từ con số 0',              thumb:'💰', bg:'#2e1a0a', plays:'5.7M', likes:'412K', comments:'31K', shares:'156K',tags:['#koc','#earning','#wellkoc'],   product:'Khóa KOC Academy',   price:'Free'     },
  { id:6,  author:'@khanh_fit', avatar:'⭐', name:'Khánh',       badge:'KOC',      color:'#ec4899', title:'Workout 15 phút mỗi ngày — kết quả sau 30 ngày không dùng gym',           thumb:'💪', bg:'#2e0a1a', plays:'2.2M', likes:'198K', comments:'9.7K', shares:'63K', tags:['#fitness','#health','#wellkoc'], product:'Dây kháng lực set',  price:'180.000đ' },
];

const TRENDING_TAGS = [
  { tag:'#WellKOC',     posts:'12.4K', color:'#22c55e' },
  { tag:'#KOCEarnings', posts:'8.7K',  color:'#f0a500' },
  { tag:'#Web3Fashion', posts:'6.1K',  color:'#6366f1' },
  { tag:'#SkincareVN',  posts:'15.2K', color:'#ec4899' },
  { tag:'#NFTWearable', posts:'3.4K',  color:'#a855f7' },
  { tag:'#FlashSale',   posts:'9.8K',  color:'#ef4444' },
];

const TOP_KOCS = [
  { rank:1, name:'Linh KOC',  avatar:'🌸', earnings:'42.5M',  followers:'128K', badge:'#22c55e' },
  { rank:2, name:'Bảo Châu',  avatar:'🎯', earnings:'38.1M',  followers:'96K',  badge:'#f0a500' },
  { rank:3, name:'Thy Thy',   avatar:'🌿', earnings:'31.8M',  followers:'84K',  badge:'#6366f1' },
  { rank:4, name:'Jade',      avatar:'💫', earnings:'27.4M',  followers:'73K',  badge:'#a855f7' },
  { rank:5, name:'Minh Tú',   avatar:'🔥', earnings:'22.9M',  followers:'61K',  badge:'#ef4444' },
];

const TABS = ['Dành cho bạn', 'Đang theo dõi', '🔴 Live now', '🔥 Trending'];

/* ──────────────────────────────────────────────────
   VIDEO CARD
────────────────────────────────────────────────── */
function VideoCard({ v }: { v: typeof FEED_VIDEOS[0] }) {
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      background: 'var(--surface-card, #161b2e)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      transition: 'transform .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Thumbnail */}
      <div style={{
        height: 200, background: v.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 72, position: 'relative', cursor: 'pointer',
      }}>
        {v.thumb}
        {/* Play overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0)',
          transition: 'background .2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,.35)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
        >
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(255,255,255,.25)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, opacity: 0, transition: 'opacity .2s',
          }}
            className="play-btn"
          >▶</div>
        </div>
        {/* Plays badge */}
        <div style={{
          position: 'absolute', bottom: 8, right: 10,
          background: 'rgba(0,0,0,.6)', borderRadius: 6, padding: '2px 7px',
          fontSize: 11, color: '#e2e8f0', backdropFilter: 'blur(4px)',
        }}>▶ {v.plays}</div>
        {/* Product tag */}
        <div style={{
          position: 'absolute', bottom: 8, left: 10,
          background: 'var(--chakra-flow, linear-gradient(135deg,#22c55e,#06b6d4))',
          borderRadius: 6, padding: '2px 8px',
          fontSize: 10, color: '#fff', fontWeight: 700,
        }}>🛍 {v.price}</div>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px' }}>
        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: `${v.color}22`, border: `2px solid ${v.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>{v.avatar}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{v.name}</span>
              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: `${v.color}22`, color: v.color, fontWeight: 700 }}>{v.badge}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{v.author}</div>
          </div>
          <button style={{
            marginLeft: 'auto', padding: '4px 12px', borderRadius: 20,
            border: `1px solid ${v.color}`, background: 'transparent',
            color: v.color, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>+ Follow</button>
        </div>

        {/* Title */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.45, marginBottom: 8 }}>
          {v.title}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {v.tags.map(tag => (
            <span key={tag} style={{ fontSize: 11, color: '#6366f1', cursor: 'pointer' }}>{tag}</span>
          ))}
        </div>

        {/* Product CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-2, #0f1724)', borderRadius: 10, padding: '8px 10px',
          marginBottom: 10,
        }}>
          <span style={{ fontSize: 18 }}>🛍</span>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.product}</div>
            <div style={{ fontSize: 11, color: '#f0a500', fontWeight: 700 }}>{v.price}</div>
          </div>
          <button style={{
            padding: '5px 12px', borderRadius: 8,
            background: 'var(--chakra-flow, linear-gradient(135deg,#22c55e,#06b6d4))',
            color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
          }}>Mua ngay</button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={() => setLiked(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#ef4444' : 'var(--text-3)', fontSize: 12 }}
          >
            {liked ? '❤️' : '🤍'} {v.likes}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12 }}>
            💬 {v.comments}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12 }}>
            ↗ {v.shares}
          </button>
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 16 }}>⋯</button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   HOME PAGE
────────────────────────────────────────────────── */
export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const storiesRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-1)',
      color: 'var(--text-1)',
      fontFamily: 'var(--ff-body, Inter, system-ui)',
    }}>

      {/* ── STORIES ── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-1)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Stories scroll */}
        <div
          ref={storiesRef}
          style={{
            display: 'flex', gap: 16, overflowX: 'auto',
            scrollbarWidth: 'none', paddingBottom: 2,
          }}
        >
          {/* Add story */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0, cursor: 'pointer' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--bg-2)', border: '2px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>+</div>
            <span style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>Thêm story</span>
          </div>
          {STORIES.map(s => (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0, cursor: 'pointer' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', padding: 2,
                background: s.live ? '#ef4444' : `${s.ring}`,
                boxShadow: s.live ? '0 0 0 2px #ef4444, 0 0 10px #ef444466' : `0 0 0 2px ${s.ring}44`,
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'var(--bg-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, border: '2px solid var(--bg-1)',
                }}>{s.avatar}</div>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ fontSize: 10, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{s.name}</span>
                {s.live && <span style={{
                  position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                  background: '#ef4444', color: '#fff', fontSize: 8, fontWeight: 800,
                  padding: '1px 4px', borderRadius: 4,
                }}>LIVE</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-1)',
        overflowX: 'auto', scrollbarWidth: 'none',
        position: 'sticky', top: 86, zIndex: 99,
      }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '11px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === i ? 700 : 500,
              color: activeTab === i ? 'var(--text-1)' : 'var(--text-3)',
              borderBottom: `2px solid ${activeTab === i ? 'var(--primary, #22c55e)' : 'transparent'}`,
              whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'all .15s',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 300px',
        gap: 20,
        maxWidth: 1100,
        margin: '0 auto',
        padding: '20px 20px 40px',
      }}>

        {/* ── LEFT: Feed ── */}
        <div>
          {/* Live Now section */}
          {(activeTab === 0 || activeTab === 2) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Đang Live</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', background: '#ef44440f', border: '1px solid #ef444433', borderRadius: 6, color: '#ef4444' }}>{LIVE_NOW.length} phòng</span>
                </div>
                <Link to="/live" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>Xem tất cả →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {LIVE_NOW.map(lv => (
                  <Link key={lv.id} to="/live" style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: lv.bg,
                      borderRadius: 12, padding: 14,
                      border: '1px solid #ef444422',
                      cursor: 'pointer', transition: 'border-color .2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#ef444466')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#ef444422')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 24 }}>{lv.avatar}</span>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lv.host}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>{lv.viewers.toLocaleString()} đang xem</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4, marginBottom: 8 }}>{lv.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: '#f0a500', fontWeight: 700 }}>🛍 {lv.product} · {lv.price}</span>
                        <button style={{ fontSize: 10, padding: '3px 9px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                          Vào xem
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Video Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FEED_VIDEOS.map(v => <VideoCard key={v.id} v={v} />)}
          </div>

          {/* Load more */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button style={{
              padding: '10px 32px', borderRadius: 24,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-2)', fontSize: 13, cursor: 'pointer',
            }}>
              Tải thêm
            </button>
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Top KOC */}
          <div style={{ background: 'var(--surface-card, #161b2e)', borderRadius: 16, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>🏆 Top KOC tuần này</span>
              <Link to="/koc" style={{ fontSize: 11, color: 'var(--text-3)', textDecoration: 'none' }}>Xem thêm</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TOP_KOCS.map(k => (
                <div key={k.rank} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: k.rank <= 3 ? k.badge : 'transparent',
                    border: k.rank > 3 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: '#fff',
                  }}>{k.rank}</span>
                  <span style={{ fontSize: 20 }}>{k.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{k.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{k.followers} followers</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0a500' }}>{k.earnings}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-3)' }}>hoa hồng</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/koc" style={{
              display: 'block', textAlign: 'center', marginTop: 14,
              padding: '8px', borderRadius: 10, border: '1px solid var(--border)',
              color: 'var(--text-2)', fontSize: 12, textDecoration: 'none',
            }}>
              🚀 Trở thành KOC ngay
            </Link>
          </div>

          {/* Trending tags */}
          <div style={{ background: 'var(--surface-card, #161b2e)', borderRadius: 16, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🔥 Xu hướng hôm nay</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TRENDING_TAGS.map(t => (
                <div key={t.tag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, color: t.color, fontWeight: 600 }}>{t.tag}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.posts} bài</span>
                </div>
              ))}
            </div>
          </div>

          {/* KOC earnings CTA */}
          <div style={{
            borderRadius: 16, padding: 18,
            background: 'linear-gradient(135deg, #0f2a1a 0%, #0a1a2e 100%)',
            border: '1px solid #22c55e33',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>💰</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 6 }}>
              Kiếm thu nhập cùng WellKOC
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>
              Hoa hồng T1 <strong style={{ color: '#22c55e' }}>40%</strong> · T2 <strong style={{ color: '#22c55e' }}>13%</strong> · On-chain 100% minh bạch
            </div>
            <Link to="/koc" style={{
              display: 'block', textAlign: 'center', padding: '9px',
              borderRadius: 10, background: 'linear-gradient(135deg,#22c55e,#06b6d4)',
              color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}>
              Đăng ký KOC ngay →
            </Link>
          </div>

          {/* Flash sale countdown */}
          <div style={{
            borderRadius: 16, padding: 14,
            background: 'linear-gradient(135deg, #2e0a0a 0%, #1a0a0a 100%)',
            border: '1px solid #ef444433',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>⚡</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#ef4444' }}>Flash Sale đang diễn ra</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
              {['02', '47', '13'].map((n, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ background: '#1a0a0a', border: '1px solid #ef444433', borderRadius: 8, padding: '6px 12px', fontSize: 20, fontWeight: 800, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>{n}</div>
                  <div style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>{['GIỜ','PHÚT','GIÂY'][i]}</div>
                </div>
              ))}
            </div>
            <Link to="/promo" style={{
              display: 'block', textAlign: 'center', padding: '8px',
              borderRadius: 10, background: '#ef4444',
              color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}>
              Xem deals ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
