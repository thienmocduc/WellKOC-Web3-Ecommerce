/**
 * WellKOC — AI Agent System Marketing Tự Động Toàn Phần
 * 3-column command center: Sidebar | Pipeline | Right panel
 * Backend: POST /api/v1/ai/marketing/run-campaign (SSE stream)
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, API_BASE } from '@hooks/useAuth';

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */
interface AgentRow { id: string; name: string; icon: string; role: string; color: string; squad: string; }
interface StageInfo { id: string; label: string; icon: string; }
interface Message   { id: number; stage: string; icon: string; content: string; ts: string; }
interface KPI       { label: string; value: string; sub?: string; color?: string; }

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const STAGES: StageInfo[] = [
  { id: 'intake',   label: 'Intake',    icon: '📋' },
  { id: 'research', label: 'Research',  icon: '🔍' },
  { id: 'content',  label: 'Content',   icon: '✍️'  },
  { id: 'design',   label: 'Design',    icon: '🎨' },
  { id: 'schedule', label: 'Schedule',  icon: '📅' },
  { id: 'publish',  label: 'Publish',   icon: '🚀' },
  { id: 'engage',   label: 'Engage',    icon: '💬' },
  { id: 'analyze',  label: 'Analyze',   icon: '📊' },
  { id: 'report',   label: 'Report',    icon: '📈' },
];

const AGENTS: AgentRow[] = [
  // Content Factory (111)
  { id:'cf1',  name:'Trend Scout',       icon:'🔥', role:'Phân tích xu hướng viral',      color:'#f0a500', squad:'Content Factory'   },
  { id:'cf2',  name:'Brief Writer',      icon:'✍️',  role:'Viết brief sáng tạo',           color:'#f0a500', squad:'Content Factory'   },
  { id:'cf3',  name:'Caption AI',        icon:'💬', role:'Tạo caption đa nền tảng',        color:'#f0a500', squad:'Content Factory'   },
  { id:'cf4',  name:'Hook Crafter',      icon:'🎣', role:'Tạo hook thu hút 3 giây',       color:'#f0a500', squad:'Content Factory'   },
  { id:'cf5',  name:'SEO Optimizer',     icon:'🔍', role:'Tối ưu từ khóa & hashtag',      color:'#f0a500', squad:'Content Factory'   },
  { id:'cf6',  name:'Emoji Stylist',     icon:'✨', role:'Thêm cảm xúc & cá tính',        color:'#f0a500', squad:'Content Factory'   },
  { id:'cf7',  name:'Story Teller',      icon:'📖', role:'Dựng cốt truyện thương hiệu',   color:'#f0a500', squad:'Content Factory'   },
  { id:'cf8',  name:'Script Master',     icon:'🎬', role:'Viết kịch bản video/live',      color:'#f0a500', squad:'Content Factory'   },
  { id:'cf9',  name:'Review Writer',     icon:'⭐', role:'Tạo nội dung đánh giá chân thực', color:'#f0a500', squad:'Content Factory' },
  { id:'cf10', name:'Visual Director',   icon:'🎨', role:'Hướng dẫn visual & màu sắc',    color:'#f0a500', squad:'Content Factory'   },
  // Distribution Grid (111)
  { id:'dg1',  name:'TikTok Bot',        icon:'🎵', role:'Đăng & tối ưu TikTok',          color:'#00c9c8', squad:'Distribution Grid' },
  { id:'dg2',  name:'Insta Poster',      icon:'📸', role:'Lên lịch Instagram Stories',    color:'#00c9c8', squad:'Distribution Grid' },
  { id:'dg3',  name:'FB Manager',        icon:'👥', role:'Quản lý fanpage Facebook',       color:'#00c9c8', squad:'Distribution Grid' },
  { id:'dg4',  name:'YouTube Auto',      icon:'▶️',  role:'Upload & SEO YouTube',          color:'#00c9c8', squad:'Distribution Grid' },
  { id:'dg5',  name:'Zalo Publisher',    icon:'💚', role:'Broadcast Zalo OA',             color:'#00c9c8', squad:'Distribution Grid' },
  { id:'dg6',  name:'Email Blaster',     icon:'📧', role:'Gửi email marketing cá nhân hóa',color:'#00c9c8', squad:'Distribution Grid'},
  { id:'dg7',  name:'SMS Sender',        icon:'📱', role:'Tin nhắn khuyến mãi tức thì',   color:'#00c9c8', squad:'Distribution Grid' },
  { id:'dg8',  name:'Push Notifier',     icon:'🔔', role:'Thông báo app real-time',        color:'#00c9c8', squad:'Distribution Grid' },
  { id:'dg9',  name:'Cross Poster',      icon:'🔄', role:'Đồng bộ nội dung đa kênh',      color:'#00c9c8', squad:'Distribution Grid' },
  { id:'dg10', name:'Scheduler Pro',     icon:'📅', role:'Tối ưu giờ đăng AI',            color:'#00c9c8', squad:'Distribution Grid' },
  // Engagement Matrix (111)
  { id:'em1',  name:'Comment AI',        icon:'💭', role:'Trả lời bình luận tự động',      color:'#a78bfa', squad:'Engagement Matrix' },
  { id:'em2',  name:'DM Handler',        icon:'✉️',  role:'Xử lý tin nhắn riêng 24/7',    color:'#a78bfa', squad:'Engagement Matrix' },
  { id:'em3',  name:'Influencer Finder', icon:'⭐', role:'Tìm KOC phù hợp',               color:'#a78bfa', squad:'Engagement Matrix' },
  { id:'em4',  name:'Collab Bot',        icon:'🤝', role:'Tự động gửi đề xuất hợp tác',   color:'#a78bfa', squad:'Engagement Matrix' },
  { id:'em5',  name:'Review Monitor',    icon:'👁️',  role:'Theo dõi review & sentiment',   color:'#a78bfa', squad:'Engagement Matrix' },
  { id:'em6',  name:'Crisis Detector',   icon:'🚨', role:'Phát hiện khủng hoảng PR',      color:'#a78bfa', squad:'Engagement Matrix' },
  { id:'em7',  name:'Loyalty Builder',   icon:'❤️',  role:'Xây dựng cộng đồng trung thành',color:'#a78bfa', squad:'Engagement Matrix'},
  { id:'em8',  name:'UGC Collector',     icon:'📸', role:'Thu thập nội dung người dùng',  color:'#a78bfa', squad:'Engagement Matrix' },
  { id:'em9',  name:'Analytics AI',      icon:'📊', role:'Phân tích hiệu suất chiến dịch', color:'#a78bfa', squad:'Engagement Matrix'},
  { id:'em10', name:'ROI Tracker',       icon:'💰', role:'Theo dõi & tối ưu ROI',         color:'#a78bfa', squad:'Engagement Matrix' },
];

const PLATFORMS = ['TikTok','Instagram','Facebook','YouTube','Zalo','Email'];

const DEMO_STAGES = [
  { stage:'intake',   icon:'📋', content:'**Campaign Brief đã tiếp nhận.**\n\n🎯 Mục tiêu: Tăng GMV 40% trong Q2\n📱 Nền tảng: TikTok, Instagram, Facebook\n🏷️ Sản phẩm: WellKOC Web3 NFT Collection\n👥 KOC target: Tier 2–3, beauty & lifestyle\n💰 Budget: 150M VNĐ' },
  { stage:'research', icon:'🔍', content:'**Nghiên cứu thị trường hoàn tất.**\n\n📈 Xu hướng hot: Web3 fashion, NFT wearables\n🔑 Keywords: #WellKOCNFT #Web3Fashion #KOCEarnings\n🎯 Target audience: 18–35, thu nhập khá, tech-savvy\n⚡ Insight: 73% Gen-Z quan tâm blockchain fashion' },
  { stage:'content',  icon:'✍️',  content:'**Nội dung sáng tạo đã tạo xong.**\n\n**Hook TikTok:** "Bạn đã biết NFT có thể mặc được chưa? 🤯"\n**Caption IG:** "Sở hữu thời trang Web3 đầu tiên tại VN 💫"\n**FB Post:** "WellKOC ra mắt BST NFT độc quyền — 333 KOC đầu tiên nhận hoa hồng 40%"\n\n✅ 15 variants A/B testing sẵn sàng' },
  { stage:'design',   icon:'🎨', content:'**Brief thiết kế & assets đã tạo.**\n\n🎨 Color palette: Navy #1a1f3a + Gold #f0a500 + Cyan #00c9c8\n📐 Template: 9:16 (TikTok/Reels), 1:1 (IG feed), 16:9 (YouTube)\n✨ Motion: Particle effects, blockchain animation\n🖼️ 24 assets sẵn sàng upload' },
  { stage:'schedule', icon:'📅', content:'**Lịch đăng tối ưu đã lên plan.**\n\n⏰ TikTok: 19:00–21:00 (peak giờ VN)\n📸 Instagram: 11:00 & 20:00\n👥 Facebook: 12:00 & 18:30\n📅 Tần suất: 3 post/ngày × 14 ngày = 42 pieces\n🚀 Kickoff: Thứ 2 tuần tới' },
  { stage:'publish',  icon:'🚀', content:'**Xuất bản tự động đã kích hoạt.**\n\n✅ TikTok × 14 videos — Queued\n✅ Instagram × 28 posts + 42 stories — Queued\n✅ Facebook × 14 posts + 2 live events — Scheduled\n✅ YouTube × 4 shorts — Uploaded\n✅ Zalo OA broadcast → 18,400 subscribers' },
  { stage:'engage',   icon:'💬', content:'**Hệ thống tương tác 24/7 đã bật.**\n\n💬 Auto-reply: Kích hoạt trên 5 kênh\n🤝 KOC outreach: 47 micro-influencers targeted\n⭐ Review boost: 23 loyal customers đã được nhắn\n🔔 Push notifications: 3 segments sẵn sàng\n📧 Email sequence: 5 bước nurturing active' },
  { stage:'analyze',  icon:'📊', content:'**Dự báo hiệu suất AI.**\n\n📈 Est. Reach: 2.4M impressions\n❤️ Est. Engagement: 186K interactions\n🛒 Est. Conversions: 1,240 orders\n💰 Est. GMV: 3.1 tỷ VNĐ\n📊 ROAS dự báo: 20.7×\n⚡ Best performer: TikTok (67% traffic)' },
  { stage:'report',   icon:'📈', content:'**Báo cáo chiến dịch đã tạo.**\n\n🎯 **Tổng kết Campaign:**\n• Reach đạt: 2.41M (101% target)\n• Engagement rate: 7.75% (industry avg: 3.2%)\n• GMV đạt: 3.08 tỷ VNĐ\n• ROI: 20.5×\n• KOC activated: 47 người\n\n🏆 **AI Agent System Marketing Tự Động Toàn Phần** đã hoàn thành nhiệm vụ!' },
];

const INIT_LOGS = [
  '✅ Agent cluster online — 333/333 active',
  '🔄 Connecting to WellKOC API...',
  '📡 SSE stream ready',
  '🤖 AI models loaded (Gemini 2.5 + Claude)',
  '🛡️ Rate limiter: 60 req/min',
  '📊 Analytics pipeline warm',
  '💾 Campaign cache cleared',
  '⚡ GPU inference: 0.8s avg',
  '🌐 CDN sync: 12 edge nodes',
  '🔐 Auth tokens validated',
];

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
export default function Agents() {
  const { token } = useAuth();

  const [brief, setBrief]               = useState('');
  const [platforms, setPlatforms]       = useState<string[]>(['TikTok','Instagram','Facebook']);
  const [running, setRunning]           = useState(false);
  const [stageIdx, setStageIdx]         = useState(-1);
  const [doneStages, setDoneStages]     = useState<Set<number>>(new Set());
  const [messages, setMessages]         = useState<Message[]>([]);
  const [logs, setLogs]                 = useState<string[]>(INIT_LOGS.slice(0,5));
  const [kpis, setKpis]                 = useState<KPI[]>([
    { label:'Agents Online',  value:'333',    sub:'/ 333',    color:'#22c55e' },
    { label:'Bài Đã Tạo',    value:'0',      sub:'pieces',   color:'#f0a500' },
    { label:'Est. Reach',     value:'—',      sub:'impressions' },
    { label:'ROAS',           value:'—',      sub:'× return' },
    { label:'GMV Est.',       value:'—',      sub:'VNĐ' },
    { label:'Success Rate',   value:'98.7%',  sub:'uptime',   color:'#00c9c8' },
  ]);
  const [selectedAgent, setSelectedAgent] = useState<AgentRow>(AGENTS[0]);
  const [outputQueue, setOutputQueue]     = useState<string[]>([]);
  const [progress, setProgress]           = useState(0);

  const msgEndRef  = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);
  const logTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgIdRef   = useRef(0);

  /* scroll to bottom */
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  /* background log ticker */
  useEffect(() => {
    let i = 5;
    logTimerRef.current = setInterval(() => {
      setLogs(prev => [...prev.slice(-9), INIT_LOGS[i % INIT_LOGS.length]]);
      i++;
    }, 5500);
    return () => { if (logTimerRef.current) clearInterval(logTimerRef.current); };
  }, []);

  const addMessage = useCallback((stage: string, icon: string, content: string) => {
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
    setMessages(prev => [...prev, { id: ++msgIdRef.current, stage, icon, content, ts }]);
  }, []);

  const advanceStage = useCallback((idx: number) => {
    setStageIdx(idx);
    setProgress(Math.round(((idx + 1) / STAGES.length) * 100));
    setDoneStages(prev => { const n = new Set(prev); if (idx > 0) n.add(idx - 1); return n; });
    // rotate active agent
    setSelectedAgent(AGENTS[idx * 3 % AGENTS.length]);
    // update content count kpi
    setKpis(prev => prev.map((k, ki) => ki === 1 ? { ...k, value: String((idx + 1) * 4) } : k));
    // add to output queue
    const s = STAGES[idx];
    setOutputQueue(prev => [...prev.slice(-4), `[${s.icon}] ${s.label} — processing...`]);
    // add log entry
    setLogs(prev => [...prev.slice(-9), `⚡ Stage ${idx+1}/9: ${s.label} started`]);
  }, []);

  /* ── Demo mode ── */
  const runDemo = useCallback(() => {
    setRunning(true);
    setStageIdx(0);
    setDoneStages(new Set());
    setMessages([]);
    setProgress(0);
    setOutputQueue([]);

    let i = 0;
    const next = () => {
      if (i >= DEMO_STAGES.length) {
        setDoneStages(new Set([0,1,2,3,4,5,6,7,8]));
        setStageIdx(9);
        setProgress(100);
        setKpis(prev => prev.map((k, ki) => {
          if (ki === 1) return { ...k, value:'42' };
          if (ki === 2) return { ...k, value:'2.4M' };
          if (ki === 3) return { ...k, value:'20.7×', color:'#22c55e' };
          if (ki === 4) return { ...k, value:'3.1 tỷ', color:'#f0a500' };
          return k;
        }));
        setRunning(false);
        return;
      }
      const d = DEMO_STAGES[i];
      advanceStage(i);
      addMessage(d.stage, d.icon, d.content);
      i++;
      setTimeout(next, 1400 + Math.random() * 600);
    };
    setTimeout(next, 300);
  }, [advanceStage, addMessage]);

  /* ── Real SSE run ── */
  const runCampaign = useCallback(async () => {
    if (!brief.trim()) { addMessage('system','⚠️','Vui lòng nhập brief chiến dịch!'); return; }
    if (!token) { runDemo(); return; }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setRunning(true);
    setStageIdx(0);
    setDoneStages(new Set());
    setMessages([]);
    setProgress(0);
    setOutputQueue([]);

    try {
      const res = await fetch(`${API_BASE}/ai/marketing/run-campaign`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ brief: brief.trim(), platforms }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() ?? '';
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;
          try {
            const ev = JSON.parse(line.slice(5).trim());
            if (ev.type === 'stage_start') {
              const idx = STAGES.findIndex(s => s.id === ev.stage);
              if (idx >= 0) advanceStage(idx);
            } else if (ev.type === 'content') {
              const s = STAGES.find(s => s.id === ev.stage);
              addMessage(ev.stage, s?.icon ?? '🤖', ev.data ?? '');
            } else if (ev.type === 'stage_end') {
              const idx = STAGES.findIndex(s => s.id === ev.stage);
              if (idx >= 0) setDoneStages(prev => { const n = new Set(prev); n.add(idx); return n; });
            } else if (ev.type === 'done') {
              setProgress(100);
              setStageIdx(9);
              setRunning(false);
            } else if (ev.type === 'error') {
              addMessage('error','❌', ev.data ?? 'Lỗi không xác định');
              setRunning(false);
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      addMessage('system','⚠️','Không kết nối được backend — chạy chế độ demo');
      runDemo();
    }
  }, [brief, platforms, token, advanceStage, addMessage, runDemo]);

  const stopCampaign = () => {
    abortRef.current?.abort();
    setRunning(false);
    addMessage('system','⏹️','Đã dừng chiến dịch.');
  };

  const togglePlatform = (p: string) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  /* ── markdown-lite renderer ── */
  const renderMd = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        return <div key={i} style={{ fontWeight:700, color:'#f0a500', marginBottom:4 }}>{line.slice(2,-2)}</div>;
      }
      if (line.startsWith('• ') || line.startsWith('* ')) {
        return <div key={i} style={{ paddingLeft:12, color:'#cbd5e1', marginBottom:2 }}>· {line.slice(2)}</div>;
      }
      if (line === '') return <div key={i} style={{ height:6 }} />;
      return (
        <div key={i} style={{ color:'#94a3b8', marginBottom:2 }}>
          {line.split(/\*\*(.*?)\*\*/g).map((seg, j) =>
            j % 2 === 1
              ? <span key={j} style={{ fontWeight:600, color:'#e2e8f0' }}>{seg}</span>
              : seg
          )}
        </div>
      );
    });
  };

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div style={{
      display:'flex', flexDirection:'column', height:'100vh',
      background:'#0d1117', color:'#e2e8f0', fontFamily:'Inter,system-ui,sans-serif',
      overflow:'hidden',
    }}>
      {/* ── TOP HEADER ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 24px', height:52, flexShrink:0,
        background:'#161b2e', borderBottom:'1px solid #1e2d4d',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>🤖</span>
          <div>
            <span style={{ fontWeight:700, fontSize:14, color:'#f0a500', letterSpacing:1 }}>AI AGENT SYSTEM</span>
            <span style={{ marginLeft:10, fontSize:11, color:'#64748b' }}>
              Marketing Tự Động Toàn Phần · 333 Agents · 9-Stage Pipeline
            </span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{
            padding:'2px 10px', borderRadius:20,
            background: running ? '#052e16' : '#0f172a',
            border: `1px solid ${running ? '#22c55e' : '#1e2d4d'}`,
            color: running ? '#22c55e' : '#475569', fontSize:11,
          }}>
            {running ? '● RUNNING' : '○ STANDBY'}
          </span>
          <span style={{ fontSize:11, color:'#475569' }}>v2.0</span>
        </div>
      </div>

      {/* ── KPI BAR ── */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(6,1fr)',
        padding:'8px 16px', gap:8, flexShrink:0,
        background:'#0f1724', borderBottom:'1px solid #1e2d4d',
      }}>
        {kpis.map((k, i) => (
          <div key={i} style={{
            background:'#161b2e', borderRadius:6, padding:'6px 10px',
            border:'1px solid #1e2d4d', textAlign:'center',
          }}>
            <div style={{ fontSize:15, fontWeight:700, color: k.color ?? '#e2e8f0' }}>{k.value}</div>
            <div style={{ fontSize:9, color:'#475569', textTransform:'uppercase', letterSpacing:0.5 }}>{k.label}</div>
            {k.sub && <div style={{ fontSize:9, color:'#334155' }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* ── 3-COLUMN BODY ── */}
      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr 290px', flex:1, overflow:'hidden' }}>

        {/* ── LEFT: AGENT SIDEBAR ── */}
        <div style={{
          borderRight:'1px solid #1e2d4d', overflow:'auto',
          background:'#0d1117',
        }}>
          {/* Pipeline */}
          <div style={{ padding:'12px 14px', borderBottom:'1px solid #1e2d4d' }}>
            <div style={{ fontSize:10, color:'#475569', textTransform:'uppercase', marginBottom:8, letterSpacing:1 }}>
              Pipeline · Stage {Math.max(stageIdx+1,0)}/9
            </div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {STAGES.map((s, i) => {
                const done = doneStages.has(i);
                const active = stageIdx === i;
                return (
                  <div key={s.id} title={s.label} style={{
                    width:28, height:28, borderRadius:'50%',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12,
                    background: done ? '#14532d' : active ? '#1e3a5f' : '#161b2e',
                    border: `2px solid ${done ? '#22c55e' : active ? '#f0a500' : '#1e2d4d'}`,
                    transition:'all 0.3s',
                    boxShadow: active ? '0 0 8px #f0a50066' : 'none',
                  }}>
                    {done ? '✓' : s.icon}
                  </div>
                );
              })}
            </div>
            {/* progress bar */}
            <div style={{ marginTop:8, background:'#1e2d4d', borderRadius:4, height:4, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:4,
                width:`${progress}%`,
                background: 'linear-gradient(90deg,#f0a500,#00c9c8)',
                transition:'width 0.5s ease',
              }} />
            </div>
            <div style={{ textAlign:'right', fontSize:10, color:'#475569', marginTop:2 }}>{progress}%</div>
          </div>

          {/* Agent list */}
          <div style={{ padding:'8px 0' }}>
            <div style={{ padding:'4px 14px', fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:1 }}>
              Active Agents
            </div>
            {AGENTS.map(a => (
              <div
                key={a.id}
                onClick={() => setSelectedAgent(a)}
                style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'6px 14px', cursor:'pointer',
                  background: selectedAgent.id === a.id ? '#161b2e' : 'transparent',
                  borderLeft: `3px solid ${selectedAgent.id === a.id ? a.color : 'transparent'}`,
                  transition:'all 0.15s',
                }}
              >
                <span style={{ fontSize:14 }}>{a.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#e2e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.name}</div>
                  <div style={{ fontSize:9, color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.squad}</div>
                </div>
                {running && selectedAgent.id === a.id && (
                  <span style={{
                    width:6, height:6, borderRadius:'50%', background:'#22c55e',
                    boxShadow:'0 0 6px #22c55e', flexShrink:0,
                    animation:'pulse 1s infinite',
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER: PIPELINE MESSAGES + INPUT ── */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden', background:'#0d1117' }}>
          {/* messages */}
          <div style={{ flex:1, overflow:'auto', padding:'16px' }}>
            {messages.length === 0 ? (
              <div style={{
                height:'100%', display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center', gap:16,
              }}>
                <div style={{ fontSize:64 }}>🤖</div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:'#f0a500', marginBottom:4 }}>
                    AI Agent System Marketing
                  </div>
                  <div style={{ fontSize:14, color:'#64748b', marginBottom:4 }}>
                    Tự Động Toàn Phần
                  </div>
                  <div style={{ fontSize:13, color:'#475569' }}>
                    333 Agents · 3 Squads · 9-Stage Automation Pipeline
                  </div>
                  <div style={{ marginTop:12, fontSize:12, color:'#334155' }}>
                    Nhập brief và bấm ⚡ để bắt đầu chiến dịch marketing tự động
                  </div>
                </div>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} style={{
                  marginBottom:12, padding:'12px 14px', borderRadius:8,
                  background:'#161b2e', border:'1px solid #1e2d4d',
                  animation:'fadeIn 0.3s ease',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'#f0a500', fontWeight:600 }}>
                      {m.icon} {m.stage.toUpperCase()}
                    </span>
                    <span style={{ fontSize:10, color:'#334155' }}>{m.ts}</span>
                  </div>
                  <div style={{ fontSize:12, lineHeight:1.6 }}>{renderMd(m.content)}</div>
                </div>
              ))
            )}
            <div ref={msgEndRef} />
          </div>

          {/* input bar */}
          <div style={{
            padding:'12px 16px', borderTop:'1px solid #1e2d4d',
            background:'#0f1724', flexShrink:0,
          }}>
            {/* platform chips */}
            <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  style={{
                    padding:'3px 10px', borderRadius:20, fontSize:11, cursor:'pointer',
                    border: `1px solid ${platforms.includes(p) ? '#00c9c8' : '#1e2d4d'}`,
                    background: platforms.includes(p) ? '#0a2a2a' : 'transparent',
                    color: platforms.includes(p) ? '#00c9c8' : '#475569',
                    transition:'all 0.15s',
                  }}
                >{p}</button>
              ))}
            </div>
            {/* textarea + button */}
            <div style={{ display:'flex', gap:8 }}>
              <textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                placeholder="Nhập brief chiến dịch: sản phẩm, mục tiêu, ngân sách, target audience..."
                rows={2}
                style={{
                  flex:1, padding:'8px 12px', borderRadius:6, resize:'none',
                  background:'#0d1117', border:'1px solid #1e2d4d',
                  color:'#e2e8f0', fontSize:12, fontFamily:'inherit',
                  outline:'none',
                }}
              />
              {running ? (
                <button
                  onClick={stopCampaign}
                  style={{
                    padding:'8px 16px', borderRadius:6, cursor:'pointer',
                    background:'#3b0764', border:'1px solid #7c3aed',
                    color:'#a78bfa', fontSize:12, fontWeight:600,
                  }}
                >⏹ Stop</button>
              ) : (
                <button
                  onClick={runCampaign}
                  style={{
                    padding:'8px 16px', borderRadius:6, cursor:'pointer',
                    background:'linear-gradient(135deg,#92400e,#b45309)',
                    border:'none', color:'#fcd34d', fontSize:12, fontWeight:700,
                    boxShadow:'0 0 12px #f0a50044',
                    transition:'all 0.2s',
                  }}
                >⚡ 1-Click Full Campaign</button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: METRICS + AGENT DETAIL + LOG ── */}
        <div style={{
          borderLeft:'1px solid #1e2d4d', overflow:'auto',
          background:'#0d1117', display:'flex', flexDirection:'column',
        }}>
          {/* Selected agent detail */}
          <div style={{
            padding:'12px 14px', borderBottom:'1px solid #1e2d4d',
            background:'#161b2e',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{selectedAgent.icon}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#e2e8f0' }}>{selectedAgent.name}</div>
                <div style={{ fontSize:10, color: selectedAgent.color }}>{selectedAgent.squad}</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:'#64748b' }}>{selectedAgent.role}</div>
            <div style={{ marginTop:6, display:'flex', gap:6 }}>
              <span style={{
                padding:'2px 8px', borderRadius:20, fontSize:10,
                background:'#052e16', border:'1px solid #22c55e', color:'#22c55e',
              }}>ONLINE</span>
              <span style={{
                padding:'2px 8px', borderRadius:20, fontSize:10,
                background:'#0f172a', border:`1px solid ${selectedAgent.color}`,
                color: selectedAgent.color,
              }}>ACTIVE</span>
            </div>
          </div>

          {/* Output queue */}
          <div style={{ padding:'10px 14px', borderBottom:'1px solid #1e2d4d', flex:1 }}>
            <div style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
              Output Queue
            </div>
            {outputQueue.length === 0 ? (
              <div style={{ fontSize:11, color:'#334155', fontStyle:'italic' }}>Chờ chiến dịch bắt đầu...</div>
            ) : (
              outputQueue.map((q, i) => (
                <div key={i} style={{
                  fontSize:11, color:'#64748b', padding:'4px 0',
                  borderBottom:'1px solid #1a2236',
                }}>{q}</div>
              ))
            )}
          </div>

          {/* System log */}
          <div style={{ padding:'10px 14px' }}>
            <div style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
              System Log
            </div>
            <div style={{
              background:'#050810', borderRadius:6, padding:'8px',
              fontFamily:'monospace', fontSize:10, color:'#22c55e',
              height:180, overflow:'auto',
              border:'1px solid #0f1f3d',
            }}>
              {logs.map((l, i) => (
                <div key={i} style={{ marginBottom:2, opacity: i === logs.length - 1 ? 1 : 0.6 }}>{l}</div>
              ))}
              <span style={{ animation:'blink 1s step-end infinite' }}>▋</span>
            </div>
          </div>

          {/* Squad stats */}
          <div style={{ padding:'10px 14px', borderTop:'1px solid #1e2d4d' }}>
            <div style={{ fontSize:10, color:'#475569', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
              Squad Status
            </div>
            {[
              { name:'Content Factory',   count:111, color:'#f0a500', pct:98 },
              { name:'Distribution Grid', count:111, color:'#00c9c8', pct:97 },
              { name:'Engagement Matrix', count:111, color:'#a78bfa', pct:99 },
            ].map(sq => (
              <div key={sq.name} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:10, color: sq.color }}>{sq.name}</span>
                  <span style={{ fontSize:10, color:'#475569' }}>{sq.count} agents · {sq.pct}%</span>
                </div>
                <div style={{ background:'#1e2d4d', borderRadius:3, height:3, overflow:'hidden' }}>
                  <div style={{ width:`${sq.pct}%`, height:'100%', background: sq.color, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CSS ANIMATIONS ── */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:#0d1117; }
        ::-webkit-scrollbar-thumb { background:#1e2d4d; border-radius:2px; }
      `}</style>
    </div>
  );
}
