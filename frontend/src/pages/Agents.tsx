/**
 * WellKOC — 333 Agent Center
 * Row 1: Audience tabs (Buyer / KOC / Vendor)
 * Row 2: Function group pills with counts
 * Body: agent card grid — click locked → upgrade modal
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '@hooks/useTheme';
import { useI18n, LANGUAGES } from '@hooks/useI18n';
import type { Locale } from '@hooks/useI18n';

/* ─── Types ─── */
type Audience = 'buyer' | 'koc' | 'vendor';
type GroupId  = string;

interface AgentDef {
  id: string; name: string; icon: string; count: number;
  color: string; role: string; spec: string[]; desc: string;
  audiences: Audience[]; group: GroupId;
}

/* ─── Palette ─── */
const C = {
  gold:'#f0a500', cyan:'#00c9c8', purple:'#a78bfa',
  green:'#22c55e', red:'#ff6b6b', amber:'#fb923c',
  rose:'#f472b6', blue:'#60a5fa', teal:'#2dd4bf',
} as const;

/* ─── Audience tabs ─── */
const AUDIENCES: {id:Audience;label:string;icon:string;desc:string;color:string}[] = [
  { id:'buyer',  label:'Buyer',  icon:'🛒', color:C.teal,   desc:'Tìm deal, so sánh giá, hỗ trợ mua sắm' },
  { id:'koc',    label:'KOC',    icon:'⭐', color:C.purple,  desc:'Tạo nội dung, lên lịch, phân tích hiệu suất' },
  { id:'vendor', label:'Vendor', icon:'🏪', color:C.amber,   desc:'Quản lý chiến dịch, sản phẩm, KPI' },
];

/* ─── Function groups ─── */
const GROUPS: {id:GroupId;label:string;icon:string;color:string;audiences:Audience[]}[] = [
  { id:'research',     label:'Research & Intel',   icon:'🔍', color:C.blue,   audiences:['koc','vendor'] },
  { id:'content',      label:'Content Creation',   icon:'✍️',  color:C.purple, audiences:['koc','vendor'] },
  { id:'design',       label:'Design & Visual',    icon:'🎨', color:C.rose,   audiences:['koc','vendor'] },
  { id:'live',         label:'Live Commerce',      icon:'📡', color:C.red,    audiences:['koc','vendor'] },
  { id:'distribution', label:'Distribution',       icon:'📤', color:C.amber,  audiences:['koc','vendor'] },
  { id:'engagement',   label:'Engagement',         icon:'💬', color:C.cyan,   audiences:['koc','vendor'] },
  { id:'analytics',    label:'Analytics & BI',     icon:'📊', color:C.teal,   audiences:['koc','vendor'] },
  { id:'shopping',     label:'Smart Shopping',     icon:'🛍️',  color:C.green,  audiences:['buyer'] },
  { id:'deals',        label:'Deal Hunter',        icon:'🎯', color:C.gold,   audiences:['buyer'] },
  { id:'support',      label:'Customer Support',   icon:'🤖', color:C.cyan,   audiences:['buyer','vendor'] },
];

/* ─── Full agent catalogue ─── */
const AGENTS: AgentDef[] = [
  // ─ Research & Intel ─
  { id:'product_analyst',   name:'Product Analyst',       icon:'🔬', count:5,  color:C.blue,   role:'Intel Agent',    group:'research',     audiences:['koc','vendor'], spec:['USP','Target','Positioning'],      desc:'Phân tích sản phẩm: USP, target audience, price positioning và purchase triggers.' },
  { id:'market_researcher', name:'Market Researcher',      icon:'📈', count:10, color:C.blue,   role:'Intel Agent',    group:'research',     audiences:['koc','vendor'], spec:['Competitor','Trend','Whitespace'],  desc:'Research đối thủ, trend tuần, tìm whitespace opportunity chưa ai khai thác.' },
  { id:'psychology_agent',  name:'Psychology Analyst',     icon:'🧠', count:8,  color:C.purple, role:'Intel Agent',    group:'research',     audiences:['koc','vendor'], spec:['Pain/Gain','AIDA','Trigger'],       desc:'Phân tích tâm lý KH: pain/gain/fear/dream, AIDA mapping, 6 triggers Cialdini.' },
  { id:'content_strategist',name:'Content Strategist',     icon:'♟️', count:8,  color:C.blue,   role:'Strategy Agent', group:'research',     audiences:['koc','vendor'], spec:['5 Angles','Platform Map','KPI'],   desc:'Xây dựng 5 content angles, platform mapping và 4-week content calendar.' },
  { id:'campaign_planner',  name:'Campaign Planner',       icon:'📋', count:8,  color:C.teal,   role:'Strategy Agent', group:'research',     audiences:['koc','vendor'], spec:['3 Phase','Budget','KOC Mix'],       desc:'Lập kế hoạch chiến dịch 3 giai đoạn: Seeding → Amplify → Convert.' },
  { id:'insight_synth',     name:'Insight Synthesizer',    icon:'⚡', count:5,  color:C.gold,   role:'Strategy Agent', group:'research',     audiences:['koc','vendor'], spec:['Master Brief','Synthesis'],         desc:'Tổng hợp toàn bộ research thành Master Brief gửi xuống Content Factory.' },
  { id:'trend_w',           name:'Trend Watcher',          icon:'🔥', count:10, color:C.red,    role:'Intel Agent',    group:'research',     audiences:['koc','vendor'], spec:['Viral detect','Trending','Alert'],  desc:'Theo dõi trending TikTok/IG/FB, phát hiện nội dung viral, cảnh báo cơ hội.' },

  // ─ Content Creation ─
  { id:'tiktok_s',     name:'TikTok Script',       icon:'📱', count:12, color:C.amber,  role:'Video Agent',    group:'content', audiences:['koc'],          spec:['Hook 3s','Script 60s','CTA'],       desc:'Viết script TikTok 15-60s: hook gây tò mò, demo, CTA rõ ràng, caption + 20 hashtag.' },
  { id:'reels_s',      name:'Reels Script',        icon:'🎬', count:10, color:C.purple, role:'Video Agent',    group:'content', audiences:['koc'],          spec:['IG Reels','FB Reels','Audio'],       desc:'Script Reels 15-30s, đề xuất nhạc trending, text overlay từng cảnh quay.' },
  { id:'yt_script',    name:'YouTube Script',      icon:'▶️',  count:9,  color:C.red,    role:'Video Agent',    group:'content', audiences:['koc','vendor'], spec:['Intro','Chapter','Description'],     desc:'Script YouTube 3-10 phút: hook intro, unboxing, review pros/cons, outro CTA.' },
  { id:'blog_w',       name:'Blog Writer',         icon:'✍️',  count:10, color:C.blue,   role:'Content Agent',  group:'content', audiences:['koc','vendor'], spec:['SEO','Long-form','Review'],          desc:'Viết blog chuẩn SEO: keyword density tự nhiên, meta tags, internal linking.' },
  { id:'copy_social',  name:'Social Copywriter',   icon:'💬', count:8,  color:C.teal,   role:'Copy Agent',     group:'content', audiences:['koc','vendor'], spec:['TikTok','FB','IG','Zalo'],           desc:'Caption phù hợp từng nền tảng: TikTok trendy, FB story, IG aesthetic, Zalo thân.' },
  { id:'copy_ad',      name:'Ad Copywriter',       icon:'🎯', count:7,  color:C.rose,   role:'Copy Agent',     group:'content', audiences:['vendor'],       spec:['Primary text','Headline','A/B'],     desc:'Copy quảng cáo Facebook/TikTok Ads: 3 version A/B/C (emotion, logic, FOMO).' },
  { id:'copy_product', name:'Product Description', icon:'🏷️', count:5,  color:C.green,  role:'Copy Agent',     group:'content', audiences:['vendor'],       spec:['Shopee','SEO','Bullet'],             desc:'Mô tả sản phẩm Shopee/Lazada chuẩn SEO: tiêu đề, bullet, FAQ, meta description.' },
  { id:'translator',   name:'Multilingual Agent',  icon:'🌏', count:10, color:C.cyan,   role:'Lang Agent',     group:'content', audiences:['koc','vendor'], spec:['EN','ZH','TH','HI'],                desc:'Dịch nội dung sang 4 ngôn ngữ giữ nguyên brand voice, thay hashtag địa phương.' },
  { id:'influencer_b', name:'Influencer Brief',    icon:'⭐', count:10, color:C.gold,   role:'KOC Agent',      group:'content', audiences:['vendor'],       spec:['Brand voice','KPI','Guideline'],     desc:'Tạo brief KOC/Influencer: brand voice, dos & don\'ts, KPI và deliverables cụ thể.' },
  { id:'seo_hashtag',  name:'SEO & Hashtag',       icon:'#️⃣', count:6,  color:C.purple, role:'SEO Agent',      group:'content', audiences:['koc','vendor'], spec:['Trending','Niche','Local'],          desc:'Research hashtag trending + keyword tối ưu cho TikTok Search, YouTube, Facebook.' },
  { id:'seo_content',  name:'Content SEO',         icon:'🔎', count:5,  color:C.blue,   role:'SEO Agent',      group:'content', audiences:['koc','vendor'], spec:['Keyword','Alt text','Readability'],  desc:'Tối ưu nội dung đã có: keyword density, internal link, title tag, readability.' },

  // ─ Design & Visual ─
  { id:'design_product',  name:'Product Visual',    icon:'📸', count:10, color:C.rose,   role:'Design Agent',  group:'design', audiences:['koc','vendor'], spec:['Lifestyle','Detail shot','Props'],   desc:'Brief thiết kế ảnh sản phẩm: bối cảnh, góc chụp, props, màu sắc cho mọi nền tảng.' },
  { id:'design_banner',   name:'Banner Designer',   icon:'🖼️', count:8,  color:C.rose,   role:'Design Agent',  group:'design', audiences:['vendor'],       spec:['Headline','CTA','A/B'],              desc:'Copy + brief thiết kế banner quảng cáo: headline, subheadline, CTA, 2 version A/B.' },
  { id:'design_carousel', name:'Carousel Creator',  icon:'🔄', count:7,  color:C.purple, role:'Design Agent',  group:'design', audiences:['koc','vendor'], spec:['5-10 slides','Swipe hook','CTA'],    desc:'Carousel 5-10 slides IG/FB: cover gây tò mò, nội dung slide, CTA slide cuối.' },
  { id:'img_gen',         name:'Image Prompt Gen',  icon:'🎨', count:10, color:C.rose,   role:'Design Agent',  group:'design', audiences:['koc','vendor'], spec:['Midjourney','DALL-E','Stable'],      desc:'Viết prompt tạo ảnh AI: banner, thumbnail, infographic theo brand WellKOC.' },

  // ─ Live Commerce ─
  { id:'live_script',     name:'Live Script',       icon:'🎙️', count:8,  color:C.red,    role:'Live Agent',    group:'live', audiences:['koc','vendor'], spec:['60-120 min','Cue cards','Flash deal'], desc:'Kịch bản livestream 60-120 phút: warm up, demo, social proof, flash sale, chốt đơn.' },
  { id:'live_moderator',  name:'Live Moderator',    icon:'📡', count:7,  color:C.amber,  role:'Live Agent',    group:'live', audiences:['koc','vendor'], spec:['Comment reply','Q&A','Flash'],         desc:'Trả lời comment live realtime: giá, ship, mã giảm, khen/chê xử lý đúng cách.' },
  { id:'live_a',          name:'Live Commerce AI',  icon:'⚡', count:10, color:C.red,    role:'Live Agent',    group:'live', audiences:['koc','vendor'], spec:['Script RT','Auto Q&A','Deal'],         desc:'AI hỗ trợ livestream: script realtime, trả lời Q&A tự động, kích hoạt flash deal.' },

  // ─ Distribution ─
  { id:'scheduler',      name:'Content Scheduler',  icon:'📅', count:15, color:C.amber,  role:'Dist Agent',    group:'distribution', audiences:['koc','vendor'], spec:['Giờ vàng','Multi-platform'],       desc:'Lên lịch đăng theo giờ vàng từng nền tảng: TikTok 20h, FB 19h, IG 18h, Zalo 21h.' },
  { id:'ad_manager',     name:'Ad Manager',         icon:'💰', count:20, color:C.gold,   role:'Ads Agent',     group:'distribution', audiences:['vendor'],       spec:['TikTok Ads','Meta Ads','Zalo Ads'], desc:'Phân bổ budget: TikTok 40%, Meta 40%, Zalo 20%. Test 3 creatives, ramp up từ từ.' },
  { id:'platform_tiktok',name:'TikTok Specialist',  icon:'📱', count:12, color:C.cyan,   role:'Platform Agent',group:'distribution', audiences:['koc','vendor'], spec:['Algorithm','Hook rate','Audio'],    desc:'Tối ưu TikTok: watch time, completion rate, trending audio, 1-3 video/ngày.' },
  { id:'platform_fb',    name:'Facebook Specialist',icon:'👥', count:12, color:C.blue,   role:'Platform Agent',group:'distribution', audiences:['vendor'],       spec:['Reels boost','Group','Shop'],       desc:'Chiến lược Facebook: boost Reels, group commerce, tận dụng Facebook Shop.' },
  { id:'platform_ig',    name:'Instagram Specialist',icon:'📸',count:10, color:C.rose,   role:'Platform Agent',group:'distribution', audiences:['koc'],          spec:['Reels','Story','Shopping tag'],     desc:'IG strategy: Reels reach rộng, Story polls, Shopping tag, aesthetic nhất quán.' },
  { id:'platform_zalo',  name:'Zalo Specialist',    icon:'💚', count:8,  color:C.teal,   role:'Platform Agent',group:'distribution', audiences:['vendor'],       spec:['OA','ZNS','Broadcast'],             desc:'Zalo OA: open rate 80%+, article sâu, broadcast flash sale, Zalo Pay tích hợp.' },
  { id:'repurposer',     name:'Content Repurposer', icon:'♻️', count:20, color:C.green,  role:'Dist Agent',    group:'distribution', audiences:['koc','vendor'], spec:['1→7 formats','Cross-platform'],     desc:'1 video gốc → 7 pieces: TikTok, Reel, Short, Story series, Carousel, Blog, Zalo.' },
  { id:'sms_push',       name:'SMS & Push Agent',   icon:'🔔', count:14, color:C.purple, role:'Dist Agent',    group:'distribution', audiences:['vendor'],       spec:['SMS Promo','Zalo ZNS','Web push'],  desc:'SMS khuyến mại, Zalo ZNS notification, web push theo trigger tự động.' },

  // ─ Engagement ─
  { id:'comment_r',    name:'Comment Responder',    icon:'💬', count:30, color:C.cyan,   role:'Engage Agent',  group:'engagement', audiences:['koc','vendor'], spec:['Sentiment','Auto-reply','2 min'],    desc:'Trả lời comment trong 2 phút: phân loại hỏi giá/ship/mã, negative xử lý riêng.' },
  { id:'dm_handler',   name:'DM Handler',           icon:'📩', count:25, color:C.purple, role:'Engage Agent',  group:'engagement', audiences:['koc','vendor'], spec:['Tư vấn','Chốt đơn','Escalate'],     desc:'Tư vấn DM 4 bước: nắm nhu cầu → gợi ý → xử lý phản đối → chốt đơn có link.' },
  { id:'community_m',  name:'Community Manager',    icon:'🌐', count:20, color:C.teal,   role:'Engage Agent',  group:'engagement', audiences:['koc','vendor'], spec:['Daily','UGC repost','Challenge'],    desc:'Quản lý cộng đồng hàng ngày: chào buổi sáng, repost UGC hay, pin comment tốt.' },
  { id:'koc_coord',    name:'KOC Coordinator',      icon:'🤝', count:16, color:C.gold,   role:'KOC Agent',     group:'engagement', audiences:['vendor'],       spec:['Onboard','Asset kit','GMV track'],   desc:'Điều phối KOC: welcome kit, content calendar, daily GMV update, tier coaching.' },
  { id:'review_col',   name:'Review Collector',     icon:'⭐', count:10, color:C.green,  role:'Engage Agent',  group:'engagement', audiences:['koc','vendor'], spec:['Post-delivery','UGC','5★'],          desc:'Thu thập review sau giao hàng: tặng điểm đổi review, repost UGC, quản lý tiêu cực.' },
  { id:'retarget',     name:'Retargeting Agent',    icon:'🎯', count:9,  color:C.amber,  role:'Ads Agent',     group:'engagement', audiences:['vendor'],       spec:['Custom audience','Lookalike'],        desc:'Tạo custom audience từ visitor/buyer, lookalike và tối ưu retargeting ads.' },

  // ─ Analytics & BI ─
  { id:'analytics_a', name:'Marketing Analytics',   icon:'📊', count:10, color:C.teal,   role:'Analyst Agent', group:'analytics', audiences:['koc','vendor'], spec:['ROAS','GMV','CTR','Daily report'],   desc:'Đọc số mỗi giờ: reach, CTR, conversion. Daily report 8h: top content + đề xuất.' },
  { id:'bi_r',        name:'BI Reporter',           icon:'📉', count:10, color:C.cyan,   role:'Analyst Agent', group:'analytics', audiences:['vendor'],       spec:['CAC','LTV','Forecast'],              desc:'Báo cáo BI: ROAS, GMV, CAC, LTV — xuất Excel và dashboard realtime.' },
  { id:'fraud_d',     name:'Fraud Detector',        icon:'🛡️',  count:10, color:C.red,    role:'Guard Agent',   group:'analytics', audiences:['vendor'],       spec:['Bot detect','Click fraud','Safety'], desc:'Phát hiện bot traffic, click fraud, bảo vệ ngân sách ads và brand safety.' },

  // ─ Smart Shopping (Buyer) ─
  { id:'rec_engine',  name:'Recommendation AI',     icon:'💡', count:20, color:C.teal,   role:'Shopping Agent',group:'shopping', audiences:['buyer'], spec:['Personalize','Collab filter','Trending'], desc:'Gợi ý sản phẩm cá nhân hoá dựa trên lịch sử mua, sở thích và trending tuần.' },
  { id:'price_cmp',   name:'Price Comparator',      icon:'🏷️', count:10, color:C.green,  role:'Shopping Agent',group:'shopping', audiences:['buyer'], spec:['Cross-platform','History','Alert'],         desc:'So sánh giá sản phẩm trên Shopee, Lazada, TikTok Shop — cảnh báo khi xuống giá.' },
  { id:'review_flt',  name:'Review Filter',         icon:'🔍', count:10, color:C.blue,   role:'Shopping Agent',group:'shopping', audiences:['buyer'], spec:['Fake detect','Sentiment','Summary'],        desc:'Lọc review giả, phân tích sentiment, tóm tắt ý kiến thật từ KH đã mua.' },

  // ─ Deal Hunter (Buyer) ─
  { id:'deal_hunt',   name:'Deal Hunter',           icon:'🎯', count:15, color:C.gold,   role:'Deal Agent',    group:'deals', audiences:['buyer'], spec:['Flash sale','Voucher','Price drop'],    desc:'Theo dõi flash sale, mã voucher tốt nhất, cảnh báo khi sản phẩm yêu thích giảm giá.' },
  { id:'group_buy_a', name:'Group Buy Agent',       icon:'👥', count:10, color:C.amber,  role:'Deal Agent',    group:'deals', audiences:['buyer'], spec:['Group price','Join notify','Timer'],    desc:'Tìm và join group buy đang mở, thông báo khi đủ người để nhận giá nhóm.' },
  { id:'cashback_a',  name:'Cashback Optimizer',    icon:'💰', count:10, color:C.green,  role:'Deal Agent',    group:'deals', audiences:['buyer'], spec:['WK Points','Affiliate','Stack'],        desc:'Tối ưu cashback: stack voucher + WK Points + hoa hồng KOC affiliate cho đơn tối ưu.' },

  // ─ Customer Support ─
  { id:'cs_bot',      name:'CS Chatbot',            icon:'🤖', count:20, color:C.cyan,   role:'CS Agent',      group:'support', audiences:['buyer','vendor'], spec:['FAQ','Order track','Refund'],  desc:'Chatbot CSKH: trả lời FAQ, tra cứu đơn hàng, xử lý hoàn trả tự động 24/7.' },
  { id:'loyalty_e',   name:'Loyalty Engine',        icon:'💎', count:10, color:C.gold,   role:'CRM Agent',     group:'support', audiences:['buyer'],          spec:['WK Points','Tier','Gift'],     desc:'Quản lý WK Points, nhắc nâng hạng, gợi ý quà khi đến milestone tier mới.' },
];

function uid(){return Math.random().toString(36).slice(2,8);}
/* Emails granted full access regardless of plan */
const FULL_ACCESS_EMAILS = ['doanhnhancaotuan@gmail.com'];

function getAccess(role?:string, email?:string){
  if (email && FULL_ACCESS_EMAILS.includes(email.toLowerCase())) return true;
  return role==='koc'||role==='vendor'||role==='admin';
}

/* ─── Access level per audience ─── */
function canAccess(userRole:string|undefined, audience:Audience, agentAudiences:Audience[]){
  if(userRole==='admin') return true;
  if(audience==='buyer') return true; // buyer audience always visible, some locked
  if(audience==='koc' && userRole==='koc') return true;
  if(audience==='vendor' && userRole==='vendor') return true;
  return false;
}

/* ─── Upgrade Modal ─── */
function UpgradeModal({agent,onClose}:{agent:AgentDef;onClose:()=>void}) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.72)',backdropFilter:'blur(8px)'}}
      onClick={onClose}>
      <div style={{background:'#0d2137',border:'1px solid rgba(0,201,200,.25)',borderRadius:20,padding:'32px',maxWidth:460,width:'90%',boxShadow:'0 24px 60px rgba(0,0,0,.6)'}}
        onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:44,marginBottom:8}}>{agent.icon}</div>
          <div style={{fontSize:'1.15rem',fontWeight:800,color:agent.color,marginBottom:3}}>{agent.name}</div>
          <div style={{fontSize:'0.75rem',color:'#4a6a8a'}}>{agent.role} · ×{agent.count} instances</div>
        </div>
        <div style={{background:'rgba(255,255,255,.04)',borderRadius:12,padding:'14px',marginBottom:16,border:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{fontSize:'0.8rem',color:'#8ba3c1',lineHeight:1.6,marginBottom:10}}>{agent.desc}</div>
          <div style={{display:'flex',flexWrap:'wrap' as const,gap:5}}>
            {agent.spec.map(s=><span key={s} style={{padding:'2px 9px',borderRadius:20,background:`${agent.color}18`,color:agent.color,fontSize:'0.7rem',fontWeight:600,border:`1px solid ${agent.color}30`}}>{s}</span>)}
          </div>
        </div>
        <div style={{background:'rgba(0,201,200,.06)',border:'1px solid rgba(0,201,200,.2)',borderRadius:10,padding:'12px',marginBottom:18,textAlign:'center'}}>
          <div style={{fontSize:'0.78rem',color:'#8ba3c1',marginBottom:3}}>Nâng cấp để mở khóa agent này</div>
          <div style={{fontSize:'0.95rem',fontWeight:700,color:'#00c9c8'}}>KOC Pro · từ 299.000đ/tháng</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#8ba3c1',cursor:'pointer',fontSize:'0.82rem'}}>Để sau</button>
          <Link to="/pricing" onClick={onClose} style={{flex:2,padding:'10px',borderRadius:10,background:'linear-gradient(135deg,#00c9c8,#a78bfa)',color:'#fff',fontWeight:700,fontSize:'0.82rem',textDecoration:'none',textAlign:'center' as const,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            🚀 Xem gói KOC / Vendor
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Agent Detail Panel ─── */
function AgentPanel({agent,onClose}:{agent:AgentDef;onClose:()=>void}) {
  return (
    <div style={{position:'absolute',top:0,right:0,bottom:0,width:300,background:'#071525',borderLeft:'1px solid rgba(255,255,255,.07)',display:'flex',flexDirection:'column',zIndex:100,boxShadow:'-8px 0 32px rgba(0,0,0,.4)'}}>
      <div style={{padding:'18px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',gap:12,alignItems:'flex-start'}}>
        <div style={{fontSize:32}}>{agent.icon}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:'0.95rem',fontWeight:800,color:agent.color}}>{agent.name}</div>
          <div style={{fontSize:'0.68rem',color:'#4a6a8a',marginTop:2}}>{agent.role} · ×{agent.count}</div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#4a6a8a',cursor:'pointer',fontSize:'1rem',padding:4}}>✕</button>
      </div>
      <div style={{padding:'14px',flex:1,overflowY:'auto'}}>
        <div style={{fontSize:'0.78rem',color:'#8ba3c1',lineHeight:1.6,marginBottom:12}}>{agent.desc}</div>
        <div style={{display:'flex',flexWrap:'wrap' as const,gap:5,marginBottom:14}}>
          {agent.spec.map(s=><span key={s} style={{padding:'2px 8px',borderRadius:4,background:`${agent.color}14`,color:agent.color,fontSize:'0.67rem',border:`1px solid ${agent.color}22`}}>{s}</span>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[{l:'Instances',v:`×${agent.count}`},{l:'Role',v:agent.role.replace(' Agent','')},{l:'Status',v:'Standby'}].map(m=>(
            <div key={m.l} style={{background:'rgba(255,255,255,.03)',borderRadius:7,padding:'8px',border:'1px solid rgba(255,255,255,.06)'}}>
              <div style={{fontSize:'0.63rem',color:'#4a6a8a',marginBottom:2}}>{m.l}</div>
              <div style={{fontSize:'0.8rem',fontWeight:700,color:'#c0d8f0'}}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:'14px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <Link to="/pricing" style={{display:'block',padding:'10px',borderRadius:9,background:'linear-gradient(135deg,#00c9c8,#a78bfa)',color:'#fff',fontWeight:700,fontSize:'0.82rem',textDecoration:'none',textAlign:'center' as const}}>
          🚀 Xem gói để sử dụng
        </Link>
      </div>
    </div>
  );
}

/* ─── Main ─── */
/* ─── Bald Robot Logo SVG ─── */
function RobotLogo({ size=44 }:{size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Antenna */}
      <line x1="22" y1="2" x2="22" y2="8" stroke="#00c9c8" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="22" cy="2" r="2.5" fill="#00c9c8"/>
      {/* Bald round head */}
      <rect x="6" y="8" width="32" height="28" rx="10" fill="#0d2236" stroke="#00c9c8" strokeWidth="1.5"/>
      {/* Skull highlight — bald sheen */}
      <ellipse cx="22" cy="14" rx="10" ry="4" fill="rgba(255,255,255,.06)"/>
      {/* Left eye — cyan LED */}
      <rect x="10" y="17" width="9" height="8" rx="2.5" fill="#00c9c8"/>
      <rect x="11.5" y="18.5" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.55"/>
      {/* Right eye — purple LED */}
      <rect x="25" y="17" width="9" height="8" rx="2.5" fill="#a78bfa"/>
      <rect x="26.5" y="18.5" width="2.5" height="2.5" rx="0.5" fill="white" opacity="0.55"/>
      {/* Mouth — gentle smile */}
      <path d="M15 29 Q22 34 29 29" stroke="#00c9c8" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Chin bolts */}
      <circle cx="12" cy="33" r="1.5" fill="#1e3a5f" stroke="#00c9c8" strokeWidth="1"/>
      <circle cx="32" cy="33" r="1.5" fill="#1e3a5f" stroke="#00c9c8" strokeWidth="1"/>
    </svg>
  );
}

export default function Agents() {
  const { user } = useAuth() as { user:{role?:string; email?:string}|null };
  const { isDark, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const userRole  = user?.role;
  const userEmail = user?.email;
  const hasFullAccess = getAccess(userRole, userEmail);

  const currentLang = LANGUAGES.find(l=>l.code===locale) ?? LANGUAGES[0];

  // Theme-aware colors
  const BG_PAGE  = isDark ? '#05101e' : '#f0f4f8';
  const BG_ROW1  = isDark ? '#071525' : '#e8edf5';
  const BG_ROW2  = isDark ? '#08131f' : '#dde4ee';
  const TEXT_DIM = isDark ? '#4a6a8a' : '#6b7e96';
  const TEXT_MAIN= isDark ? '#d4e6ff' : '#1a2a3a';
  const BORDER   = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)';

  const [audience, setAudience] = useState<Audience>('koc');
  const [activeGroup, setActiveGroup] = useState<GroupId>('research');
  const [selAgent, setSelAgent] = useState<AgentDef|null>(null);
  const [upgradeAgent, setUpgradeAgent] = useState<AgentDef|null>(null);

  // Groups relevant to current audience
  const visibleGroups = GROUPS.filter(g=>g.audiences.includes(audience));
  // Make sure activeGroup is valid for current audience
  const effectiveGroup = visibleGroups.find(g=>g.id===activeGroup) ? activeGroup : visibleGroups[0]?.id;

  // Agents for current audience + group
  const groupAgents = AGENTS.filter(a=>a.audiences.includes(audience)&&a.group===effectiveGroup);
  const groupTotal  = (g:GroupId) => AGENTS.filter(a=>a.audiences.includes(audience)&&a.group===g).length;

  const handleAgentClick = (agent:AgentDef) => {
    if(!hasFullAccess){ setUpgradeAgent(agent); return; }
    setSelAgent(s=>s?.id===agent.id?null:agent);
  };

  return (
    <>
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:BG_PAGE,color:TEXT_MAIN,fontFamily:'Inter,system-ui,sans-serif',display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* ── Row 1: Robot logo + Audience tabs (merges with nav bar above) ── */}
        <div style={{display:'flex',alignItems:'stretch',borderBottom:`1px solid ${BORDER}`,flexShrink:0,background:BG_ROW1,height:52}}>
          {/* Bald Robot Logo */}
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 16px 0 14px',borderRight:`1px solid ${BORDER}`,flexShrink:0}}>
            <RobotLogo size={40}/>
            <div>
              <div style={{fontSize:'0.82rem',fontWeight:800,background:'linear-gradient(135deg,#00c9c8,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',whiteSpace:'nowrap' as const,lineHeight:1.1}}>333 Agents</div>
              <div style={{fontSize:'0.6rem',color:TEXT_DIM,marginTop:1,whiteSpace:'nowrap' as const}}>AI Marketing Command</div>
            </div>
          </div>

          {/* Audience tabs */}
          {AUDIENCES.map(aud=>{
            const active = audience===aud.id;
            return (
              <button key={aud.id}
                onClick={()=>{setAudience(aud.id);setSelAgent(null);setActiveGroup(GROUPS.filter(g=>g.audiences.includes(aud.id))[0]?.id||'');}}
                style={{flex:1,background:'none',border:'none',borderBottom:`2px solid ${active?aud.color:'transparent'}`,borderTop:'2px solid transparent',color:active?aud.color:TEXT_DIM,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,transition:'all .15s',fontWeight:active?700:400,fontSize:'0.84rem',padding:'0 12px',minWidth:0}}>
                <span style={{fontSize:17,flexShrink:0}}>{aud.icon}</span>
                <div style={{textAlign:'left' as const,minWidth:0}}>
                  <div style={{fontWeight:active?700:500,fontSize:'0.84rem'}}>{aud.label}</div>
                  <div style={{fontSize:'0.58rem',color:active?aud.color:TEXT_DIM,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{aud.desc}</div>
                </div>
              </button>
            );
          })}

          {/* Right controls: total count + language + theme + hamburger */}
          <div style={{display:'flex',alignItems:'center',gap:4,padding:'0 10px',borderLeft:`1px solid ${BORDER}`,flexShrink:0,marginLeft:'auto'}}>
            <span style={{fontSize:'0.68rem',color:TEXT_DIM,marginRight:4}}>
              <span style={{fontWeight:700,color:'#00c9c8',fontSize:'0.88rem'}}>{AGENTS.filter(a=>a.audiences.includes(audience)).reduce((sum,a)=>sum+a.count,0)}</span> agents
            </span>

            {/* Language toggle */}
            <div style={{position:'relative'}}>
              <button onClick={()=>setLangOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:3,padding:'5px 8px',borderRadius:7,border:`1px solid ${BORDER}`,background:'transparent',color:TEXT_DIM,fontSize:'0.72rem',cursor:'pointer'}}>
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
              </button>
              {langOpen&&(
                <div style={{position:'absolute',top:'110%',right:0,background:isDark?'#0d2035':'#fff',border:`1px solid ${BORDER}`,borderRadius:10,padding:4,zIndex:200,boxShadow:'0 8px 32px rgba(0,0,0,.3)',minWidth:140}}>
                  {LANGUAGES.map(lang=>(
                    <button key={lang.code} onClick={()=>{setLocale(lang.code as Locale);setLangOpen(false);}} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'6px 10px',borderRadius:7,border:'none',background:locale===lang.code?(isDark?'rgba(0,201,200,.1)':'rgba(0,150,180,.08)'):'transparent',color:locale===lang.code?'#00c9c8':TEXT_DIM,cursor:'pointer',fontSize:'0.78rem',fontWeight:locale===lang.code?700:400}}>
                      <span>{lang.flag}</span><span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{width:32,height:32,borderRadius:7,border:`1px solid ${BORDER}`,background:'transparent',color:TEXT_DIM,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14}}>
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Hamburger — triggers MainLayout drawer */}
            <button onClick={()=>window.dispatchEvent(new Event('wellkoc:open-drawer'))} style={{width:32,height:32,borderRadius:7,border:`1px solid ${BORDER}`,background:'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,cursor:'pointer',padding:8,flexShrink:0}}>
              <span style={{width:14,height:2,background:TEXT_DIM,borderRadius:1,display:'block'}}/>
              <span style={{width:14,height:2,background:TEXT_DIM,borderRadius:1,display:'block'}}/>
              <span style={{width:14,height:2,background:TEXT_DIM,borderRadius:1,display:'block'}}/>
            </button>
          </div>
        </div>

        {/* ── Row 2: Function group pills ── */}
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${BORDER}`,flexShrink:0,background:BG_ROW2,overflowX:'auto',scrollbarWidth:'none' as const,padding:'0 16px'}}>
          {visibleGroups.map(g=>{
            const active = effectiveGroup===g.id;
            const cnt = groupTotal(g.id);
            return (
              <button key={g.id}
                onClick={()=>{setActiveGroup(g.id);setSelAgent(null);}}
                style={{background:'none',border:'none',borderBottom:`2px solid ${active?g.color:'transparent'}`,borderTop:'2px solid transparent',color:active?g.color:'#4a6a8a',cursor:'pointer',display:'flex',alignItems:'center',gap:6,padding:'0 14px',height:40,transition:'all .15s',fontWeight:active?700:400,fontSize:'0.78rem',flexShrink:0,whiteSpace:'nowrap' as const}}>
                <span style={{fontSize:15}}>{g.icon}</span>
                <span>{g.label}</span>
                <span style={{padding:'1px 6px',borderRadius:20,background:active?`${g.color}22`:'rgba(255,255,255,.05)',color:active?g.color:'#4a6a8a',fontSize:'0.65rem',fontWeight:600}}>{cnt} agents</span>
              </button>
            );
          })}
        </div>

        {/* ── Agent grid ── */}
        <div style={{flex:1,display:'flex',overflow:'hidden',position:'relative'}}>
          <div style={{flex:1,overflowY:'auto',padding:'16px 20px',paddingRight:selAgent?'320px':'20px',transition:'padding-right .2s'}}>

            {/* Access banner */}
            {!hasFullAccess&&(
              <div style={{marginBottom:14,padding:'9px 14px',borderRadius:9,background:'rgba(0,201,200,.05)',border:'1px solid rgba(0,201,200,.18)',display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:'1rem'}}>🔒</span>
                <div style={{fontSize:'0.78rem',color:'#8ba3c1'}}>
                  <span style={{color:'#00c9c8',fontWeight:600}}>Click vào agent</span> để xem chi tiết và gói cần thiết để mở khóa
                </div>
                <div style={{marginLeft:'auto',display:'flex',gap:7}}>
                  <Link to="/login" style={{padding:'5px 12px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#8ba3c1',fontSize:'0.72rem',fontWeight:600,textDecoration:'none'}}>Đăng nhập</Link>
                  <Link to="/pricing" style={{padding:'5px 12px',borderRadius:7,background:'linear-gradient(135deg,#00c9c8,#a78bfa)',color:'#fff',fontSize:'0.72rem',fontWeight:600,textDecoration:'none'}}>Xem gói</Link>
                </div>
              </div>
            )}

            {/* Group description */}
            {(() => {
              const grp = visibleGroups.find(g=>g.id===effectiveGroup);
              if(!grp) return null;
              return (
                <div style={{marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:20}}>{grp.icon}</span>
                  <div>
                    <span style={{fontSize:'0.9rem',fontWeight:700,color:grp.color}}>{grp.label}</span>
                    <span style={{fontSize:'0.72rem',color:TEXT_DIM,marginLeft:10}}>{groupAgents.length} loại · {groupAgents.reduce((s,a)=>s+a.count,0)} instances đang chạy</span>
                  </div>
                </div>
              );
            })()}

            {/* Agent cards */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:10}}>
              {groupAgents.map(agent=>{
                const locked = !hasFullAccess;
                const isSelected = selAgent?.id===agent.id;
                return (
                  <div key={agent.id} onClick={()=>handleAgentClick(agent)}
                    style={{background:isSelected?`${agent.color}0e`:isDark?'rgba(255,255,255,.03)':'rgba(0,0,0,.03)',border:`1px solid ${isSelected?agent.color:BORDER}`,borderRadius:12,padding:'14px',cursor:'pointer',transition:'all .15s',position:'relative',boxShadow:isSelected?`0 0 0 1px ${agent.color}33`:undefined}}
                    onMouseEnter={e=>{if(!isSelected)(e.currentTarget as HTMLDivElement).style.background=isDark?'rgba(255,255,255,.055)':'rgba(0,0,0,.06)';}}
                    onMouseLeave={e=>{if(!isSelected)(e.currentTarget as HTMLDivElement).style.background=isDark?'rgba(255,255,255,.03)':'rgba(0,0,0,.03)';}}
                  >
                    {locked&&<div style={{position:'absolute',top:8,right:8,fontSize:'0.6rem',background:isDark?'rgba(0,0,0,.45)':'rgba(0,0,0,.12)',border:`1px solid ${BORDER}`,borderRadius:4,padding:'1px 5px',color:TEXT_DIM}}>🔒</div>}
                    <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                      <div style={{fontSize:26}}>{agent.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'0.83rem',fontWeight:700,color:isSelected?agent.color:TEXT_MAIN,lineHeight:1.3}}>{agent.name}</div>
                        <div style={{fontSize:'0.65rem',color:TEXT_DIM,marginTop:2}}>
                          {agent.role} <span style={{marginLeft:6,padding:'1px 5px',borderRadius:3,background:isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.06)',color:TEXT_DIM}}>×{agent.count}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{fontSize:'0.72rem',color:'#6a8aaa',lineHeight:1.4,marginBottom:8,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' as const,overflow:'hidden'}}>{agent.desc}</div>
                    <div style={{display:'flex',flexWrap:'wrap' as const,gap:4}}>
                      {agent.spec.slice(0,2).map(s=>(
                        <span key={s} style={{padding:'1px 6px',borderRadius:3,background:locked?'rgba(255,255,255,.03)':`${agent.color}10`,color:locked?'#2a3d52':agent.color,fontSize:'0.62rem',border:`1px solid ${locked?'rgba(255,255,255,.05)':`${agent.color}20`}`}}>{s}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side panel */}
          {selAgent&&hasFullAccess&&<AgentPanel agent={selAgent} onClose={()=>setSelAgent(null)}/>}
        </div>
      </div>

      {/* Upgrade modal */}
      {upgradeAgent&&<UpgradeModal agent={upgradeAgent} onClose={()=>setUpgradeAgent(null)}/>}
    </>
  );
}
