/**
 * WellKOC — 333 Marketing Agent Command Center
 * Streams SSE from /api/v1/ai/marketing/run-campaign
 * Gated: requires KOC or Vendor paid plan
 * Layout: fixed viewport (no outer scroll)
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { API_BASE } from '@hooks/useAuth';

interface AgentDef { id:string; name:string; squad:string; icon:string; count:number; color:string; role:string; spec:string[]; }
interface Msg       { id:string; agentId:string; content:string; ts:string; }
interface OutItem   { icon:string; title:string; badge:string; color:string; }
type AS = 'idle'|'working'|'done';

const C={gold:'#f0a500',goldL:'#ffd166',cyan:'#00c9c8',purple:'#a78bfa',green:'#22c55e',red:'#ff6b6b',amber:'#fb923c',rose:'#f472b6',blue:'#60a5fa',muted:'#8ba3c1'} as const;

const AGENTS:AgentDef[]=[
  {id:'tiktok_s', name:'TikTok Script',    squad:'content',  icon:'📱',count:10,color:C.amber, role:'Video Agent',   spec:['Hook 3s','Script 60s','Caption','Hashtag']},
  {id:'reels_s',  name:'Reels Script',     squad:'content',  icon:'🎬',count:10,color:C.purple,role:'Video Agent',   spec:['IG Reels','FB Reels','Audio suggest']},
  {id:'blog_w',   name:'Blog Writer',      squad:'content',  icon:'✍️', count:10,color:C.blue,  role:'Content Agent', spec:['SEO','Long-form','Product review']},
  {id:'img_gen',  name:'Image Generator',  squad:'content',  icon:'🎨',count:10,color:C.rose,  role:'Design Agent',  spec:['Banner','Thumbnail','Infographic']},
  {id:'email_c',  name:'Email Copywriter', squad:'content',  icon:'📧',count:10,color:C.green, role:'Copy Agent',    spec:['Subject line','CTA','Personalize']},
  {id:'seo_opt',  name:'SEO Optimizer',    squad:'content',  icon:'🔍',count:10,color:C.cyan,  role:'SEO Agent',     spec:['Keywords','Meta tags','Backlink']},
  {id:'tiktok_d', name:'TikTok Distributor',squad:'dist',   icon:'📤',count:10,color:C.amber, role:'Dist Agent',    spec:['Best time','Auto-post','A/B test']},
  {id:'ig_d',     name:'IG Distributor',   squad:'dist',     icon:'📸',count:10,color:C.rose,  role:'Dist Agent',    spec:['Feed + Story','Carousel','Reel']},
  {id:'fb_d',     name:'FB Distributor',   squad:'dist',     icon:'👤',count:10,color:C.blue,  role:'Dist Agent',    spec:['Page + Group','Boost ready','Pixel']},
  {id:'yt_d',     name:'YouTube Scheduler',squad:'dist',     icon:'▶️', count:10,color:C.red,   role:'Dist Agent',    spec:['Thumbnail','Description','Card']},
  {id:'zalo_d',   name:'Zalo Distributor', squad:'dist',     icon:'💬',count:10,color:C.cyan,  role:'Dist Agent',    spec:['OA Post','Zalo Ad','Broadcast']},
  {id:'shopee_d', name:'Shopee Scheduler', squad:'dist',     icon:'🛍️', count:10,color:C.amber, role:'Dist Agent',    spec:['Flash deal','Feed post','Voucher']},
  {id:'comment_r',name:'Comment Responder',squad:'engage',  icon:'💬',count:10,color:C.purple,role:'Engage Agent',  spec:['Sentiment','Auto-reply','Escalate']},
  {id:'koc_m',    name:'KOC Matcher',      squad:'engage',   icon:'🤝',count:10,color:C.gold,  role:'Engage Agent',  spec:['Match score','Brief send','Track']},
  {id:'review_a', name:'Review Analyzer',  squad:'engage',   icon:'⭐',count:10,color:C.green, role:'Engage Agent',  spec:['NPS','Sentiment','Alert']},
  {id:'trend_w',  name:'Trend Watcher',    squad:'engage',   icon:'📈',count:10,color:C.blue,  role:'Intel Agent',   spec:['Trending tags','Viral detect','Alert']},
  {id:'bi_r',     name:'BI Reporter',      squad:'engage',   icon:'📊',count:10,color:C.cyan,  role:'Analyst Agent', spec:['ROAS','GMV','CAC','LTV']},
  {id:'fraud_d',  name:'Fraud Detector',   squad:'engage',   icon:'🛡️', count:10,color:C.red,   role:'Guard Agent',   spec:['Bot detect','Click fraud','Shield']},
];

const STAGES=[
  {id:'intake',   label:'Intake',   icon:'📥',color:C.blue},
  {id:'research', label:'Research', icon:'🔍',color:C.cyan},
  {id:'content',  label:'Content',  icon:'✍️', color:C.purple},
  {id:'design',   label:'Design',   icon:'🎨',color:C.rose},
  {id:'schedule', label:'Schedule', icon:'📅',color:C.amber},
  {id:'publish',  label:'Publish',  icon:'📤',color:C.green},
  {id:'engage',   label:'Engage',   icon:'💬',color:C.gold},
  {id:'analyze',  label:'Analyze',  icon:'📊',color:C.blue},
  {id:'report',   label:'Report',   icon:'📋',color:C.cyan},
];

const PRESETS=[
  {label:'Flash Sale 12/12',    brief:'Chiến dịch flash sale lớn ngày 12/12, giảm đến 70%, tất cả danh mục sản phẩm, thúc đẩy GMV tối đa trong 24h.',  platforms:['tiktok','instagram','facebook','shopee']},
  {label:'Ra mắt sản phẩm',    brief:'Ra mắt dòng sản phẩm skincare organic mới, target phụ nữ 25-35 tuổi, Hà Nội & HCM, budget 50M VND.',             platforms:['tiktok','instagram','youtube']},
  {label:'KOC Ambassador',      brief:'Tuyển dụng và kích hoạt 50 KOC tier micro, category thời trang & beauty, campaign 30 ngày.',                      platforms:['tiktok','instagram']},
  {label:'Tet Campaign',        brief:'Chiến dịch Tết Nguyên Đán, quà tặng cao cấp, voucher gia đình, livestream Tất Niên, target toàn quốc.',           platforms:['tiktok','facebook','zalo','shopee']},
  {label:'Brand Awareness',     brief:'Tăng brand awareness cho WellKOC tại thị trường Đông Nam Á, tập trung Vietnam, Thailand, Malaysia.',               platforms:['instagram','youtube','facebook']},
  {label:'Reactivation',        brief:'Tái kích hoạt 100K khách hàng cũ chưa mua trong 90 ngày, email + Zalo OA + retargeting ads.',                     platforms:['zalo','facebook']},
];

const PLATFORM_CFG:{[k:string]:{label:string;color:string}}={
  tiktok:{label:'TikTok',color:'#00c9c8'},
  instagram:{label:'Instagram',color:'#f472b6'},
  facebook:{label:'Facebook',color:'#60a5fa'},
  youtube:{label:'YouTube',color:'#ff6b6b'},
  zalo:{label:'Zalo',color:'#2563eb'},
  shopee:{label:'Shopee',color:'#f0a500'},
};

// Paywall access rules
// koc / vendor → full access
// user (buyer) → locked
// unauthenticated → locked
type AccessLevel = 'full' | 'locked';
function getAccess(role?: string): AccessLevel {
  if (role === 'koc' || role === 'vendor' || role === 'admin') return 'full';
  return 'locked';
}

function uid(){return Math.random().toString(36).slice(2,8);}
function ts(){return new Date().toLocaleTimeString('vi-VN',{hour12:false});}

/* ─── Paywall screen ─── */
function PaywallScreen({ isLoggedIn }: { isLoggedIn: boolean }) {
  const perks = [
    { icon: '🤖', title: '333 AI Agents', desc: 'Content Factory · Distribution Grid · Engagement Matrix' },
    { icon: '🚀', title: '9-Stage Auto Pipeline', desc: 'Intake → Research → Content → Design → Schedule → Publish → Engage → Analyze → Report' },
    { icon: '📊', title: 'Real-time KPI Dashboard', desc: 'Posts · Reach · ROAS · GMV cập nhật theo từng bước' },
    { icon: '💬', title: 'Multi-platform Publish', desc: 'TikTok · Instagram · Facebook · YouTube · Zalo · Shopee' },
    { icon: '🎯', title: 'KOC Matching Engine', desc: 'Tự động match KOC phù hợp, gửi brief và tracking' },
    { icon: '🛡️', title: 'Fraud Detection', desc: 'Bot detection, click fraud shield, brand safety' },
  ];

  const plans = [
    { name: 'KOC Free',     agents: 3,   workflows: 1,  color: C.muted,   highlight: false },
    { name: 'KOC Pro',      agents: 25,  workflows: 5,  color: C.cyan,    highlight: true  },
    { name: 'KOC Business', agents: 80,  workflows: -1, color: C.purple,  highlight: false },
    { name: 'Vendor Pro',   agents: 30,  workflows: 10, color: C.amber,   highlight: false },
  ];

  return (
    <div style={{
      position:'fixed' as const, top:100, left:0, right:0, bottom:0,
      background:'#05101e', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:'0 24px', overflowY:'auto',
      color:'#d4e6ff',
    }}>
      <div style={{ maxWidth: 760, width: '100%', textAlign: 'center' }}>
        {/* Lock icon */}
        <div style={{
          width:72, height:72, borderRadius:20, margin:'0 auto 20px',
          background:'linear-gradient(135deg,rgba(0,201,200,.2),rgba(167,139,250,.2))',
          border:'1px solid rgba(0,201,200,.3)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
        }}>🔒</div>

        <div style={{
          fontSize:'1.8rem', fontWeight:800, marginBottom:8,
          background:'linear-gradient(135deg,#00c9c8,#a78bfa)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
        }}>
          333 Agent Command Center
        </div>
        <div style={{ color:'#8ba3c1', fontSize:'0.9rem', marginBottom:32, lineHeight:1.6 }}>
          {isLoggedIn
            ? 'Tính năng này dành riêng cho KOC và Vendor đã đăng ký gói trả phí.\nNâng cấp để mở khóa toàn bộ 333 AI agents.'
            : 'Đăng nhập với tài khoản KOC hoặc Vendor để truy cập Command Center.'}
        </div>

        {/* Feature grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:32, textAlign:'left' }}>
          {perks.map(p=>(
            <div key={p.icon} style={{
              background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)',
              borderRadius:10, padding:'14px',
            }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{p.icon}</div>
              <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#c0d8f0', marginBottom:4 }}>{p.title}</div>
              <div style={{ fontSize:'0.72rem', color:'#4a6a8a', lineHeight:1.4 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Plan comparison */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:28 }}>
          {plans.map(p=>(
            <div key={p.name} style={{
              flex:1, maxWidth:160,
              background: p.highlight ? 'rgba(0,201,200,.08)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${p.highlight ? C.cyan : 'rgba(255,255,255,.08)'}`,
              borderRadius:10, padding:'14px 10px', textAlign:'center',
              boxShadow: p.highlight ? `0 0 16px rgba(0,201,200,.15)` : 'none',
            }}>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color: p.color, marginBottom:8 }}>{p.name}</div>
              <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#d4e6ff' }}>{p.agents}</div>
              <div style={{ fontSize:'0.65rem', color:'#4a6a8a' }}>AI Agents</div>
              <div style={{ fontSize:'0.72rem', color:'#8ba3c1', marginTop:6 }}>
                {p.workflows === -1 ? 'Unlimited' : p.workflows} workflows
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          {!isLoggedIn && (
            <Link to="/login" style={{
              padding:'12px 28px', borderRadius:10, fontWeight:700, fontSize:'0.9rem',
              background:'rgba(255,255,255,.06)', color:'#d4e6ff', textDecoration:'none',
              border:'1px solid rgba(255,255,255,.12)',
            }}>Đăng nhập</Link>
          )}
          <Link to="/pricing" style={{
            padding:'12px 28px', borderRadius:10, fontWeight:700, fontSize:'0.9rem',
            background:'linear-gradient(135deg,#00c9c8,#a78bfa)', color:'#fff',
            textDecoration:'none', boxShadow:'0 4px 20px rgba(0,201,200,.3)',
          }}>
            {isLoggedIn ? '🚀 Nâng cấp gói KOC / Vendor' : '🚀 Xem gói KOC / Vendor'}
          </Link>
          {!isLoggedIn && (
            <Link to="/register" style={{
              padding:'12px 28px', borderRadius:10, fontWeight:700, fontSize:'0.9rem',
              background:'linear-gradient(135deg,#f0a500,#fb923c)', color:'#fff',
              textDecoration:'none',
            }}>Đăng ký KOC</Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Command Center ─── */
const s:Record<string,React.CSSProperties>={
  page:{position:'fixed' as const,top:100,left:0,right:0,bottom:0,background:'#05101e',color:'#d4e6ff',fontFamily:'Inter,system-ui,sans-serif',display:'flex',flexDirection:'column',overflow:'hidden'},
  hero:{background:'linear-gradient(135deg,#071a2e 0%,#0d2137 50%,#071a2e 100%)',borderBottom:'1px solid rgba(0,201,200,.15)',padding:'16px 32px',display:'flex',alignItems:'center',gap:20,flexShrink:0},
  heroIcon:{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#00c9c8,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0},
  heroTitle:{fontSize:'1.3rem',fontWeight:800,background:'linear-gradient(135deg,#00c9c8,#a78bfa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'},
  heroSub:{fontSize:'0.78rem',color:'#8ba3c1',marginTop:2},
  heroBadge:{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'},
  badge:{padding:'3px 10px',borderRadius:20,fontSize:'0.7rem',fontWeight:600,background:'rgba(0,201,200,.15)',color:'#00c9c8',border:'1px solid rgba(0,201,200,.3)'},
  grid:{flex:1,display:'grid',gridTemplateColumns:'240px 1fr 280px',minHeight:0,overflow:'hidden'},
  // sidebar
  sidebar:{background:'#071525',borderRight:'1px solid rgba(255,255,255,.06)',overflow:'hidden',display:'flex',flexDirection:'column'},
  sideHead:{padding:'12px',borderBottom:'1px solid rgba(255,255,255,.06)',flexShrink:0},
  sideSearch:{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'7px 10px',color:'#d4e6ff',fontSize:'0.8rem',outline:'none',boxSizing:'border-box' as const},
  sideList:{flex:1,overflowY:'auto'},
  squadLabel:{padding:'8px 14px 2px',fontSize:'0.65rem',fontWeight:700,letterSpacing:1,color:'#4a6a8a',textTransform:'uppercase' as const},
  agentRow:{display:'flex',alignItems:'center',gap:8,padding:'7px 14px',cursor:'pointer',transition:'background .15s',borderLeft:'3px solid transparent'},
  agentRowActive:{background:'rgba(0,201,200,.08)',borderLeft:'3px solid #00c9c8'},
  agentIcon:{fontSize:16,width:24,textAlign:'center' as const},
  agentName:{fontSize:'0.78rem',fontWeight:600,color:'#c0d8f0'},
  agentRole:{fontSize:'0.65rem',color:'#4a6a8a'},
  agentStatus:{marginLeft:'auto',width:6,height:6,borderRadius:'50%'},
  // center
  center:{background:'#08131f',display:'flex',flexDirection:'column',overflow:'hidden'},
  kpiBar:{display:'flex',borderBottom:'1px solid rgba(255,255,255,.06)',flexShrink:0},
  kpi:{flex:1,padding:'10px 16px',borderRight:'1px solid rgba(255,255,255,.06)',textAlign:'center' as const},
  kpiVal:{fontSize:'1.2rem',fontWeight:800,color:'#00c9c8'},
  kpiLbl:{fontSize:'0.65rem',color:'#4a6a8a',marginTop:1},
  pipeline:{display:'flex',padding:'12px 20px 6px',flexShrink:0,overflowX:'auto' as const},
  stageNode:{display:'flex',flexDirection:'column',alignItems:'center',gap:3,flex:1,minWidth:60},
  stageCircle:{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,transition:'all .3s',border:'2px solid rgba(255,255,255,.08)'},
  stageName:{fontSize:'0.58rem',color:'#4a6a8a',textAlign:'center' as const},
  stageConn:{flex:1,height:2,background:'rgba(255,255,255,.06)',alignSelf:'center',marginTop:-18},
  progressWrap:{padding:'0 20px 8px',flexShrink:0},
  progressBar:{height:3,background:'rgba(255,255,255,.06)',borderRadius:2,overflow:'hidden'},
  progressFill:{height:'100%',borderRadius:2,transition:'width .6s ease',background:'linear-gradient(90deg,#00c9c8,#a78bfa)'},
  msgs:{flex:1,padding:'0 20px',overflowY:'auto',display:'flex',flexDirection:'column',gap:6},
  msgBubble:{padding:'8px 12px',borderRadius:8,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',fontSize:'0.8rem',lineHeight:1.5,flexShrink:0},
  msgAgent:{fontSize:'0.68rem',fontWeight:700,marginBottom:3},
  inputArea:{padding:'10px 20px',borderTop:'1px solid rgba(255,255,255,.06)',flexShrink:0},
  platformRow:{display:'flex',gap:5,marginBottom:7,flexWrap:'wrap' as const},
  platformChip:{padding:'3px 9px',borderRadius:20,fontSize:'0.68rem',fontWeight:600,cursor:'pointer',transition:'all .15s',border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.04)',color:'#8ba3c1'},
  platformChipOn:{border:'1px solid',background:'rgba(0,0,0,.3)'},
  inputRow:{display:'flex',gap:8},
  textarea:{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'8px 12px',color:'#d4e6ff',fontSize:'0.82rem',resize:'none' as const,outline:'none',fontFamily:'inherit'},
  btnRun:{padding:'8px 18px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:'0.82rem',background:'linear-gradient(135deg,#00c9c8,#a78bfa)',color:'#fff',flexShrink:0,transition:'opacity .2s'},
  presetRow:{display:'flex',gap:5,marginBottom:7,flexWrap:'wrap' as const},
  presetBtn:{padding:'3px 9px',borderRadius:20,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.03)',color:'#8ba3c1',fontSize:'0.67rem',cursor:'pointer'},
  // right panel
  right:{background:'#071525',borderLeft:'1px solid rgba(255,255,255,.06)',overflow:'hidden',display:'flex',flexDirection:'column'},
  rightScroll:{flex:1,overflowY:'auto'},
  panel:{padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.06)'},
  panelTitle:{fontSize:'0.67rem',fontWeight:700,letterSpacing:1,color:'#4a6a8a',textTransform:'uppercase' as const,marginBottom:10},
  metrGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6},
  metrCard:{background:'rgba(255,255,255,.04)',borderRadius:7,padding:'8px',border:'1px solid rgba(255,255,255,.07)'},
  metrVal:{fontSize:'1.1rem',fontWeight:800},
  metrLbl:{fontSize:'0.63rem',color:'#4a6a8a',marginTop:2},
  detailBox:{background:'rgba(255,255,255,.03)',borderRadius:7,padding:'10px',border:'1px solid rgba(255,255,255,.07)'},
  specChip:{display:'inline-block',padding:'2px 7px',borderRadius:4,background:'rgba(255,255,255,.06)',fontSize:'0.63rem',color:'#8ba3c1',margin:'2px 2px 2px 0'},
  outRow:{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.05)'},
  outIcon:{fontSize:16,width:22,textAlign:'center' as const},
  outTitle:{fontSize:'0.74rem',color:'#c0d8f0',flex:1},
  outBadge:{padding:'1px 7px',borderRadius:20,fontSize:'0.6rem',fontWeight:600},
  logLine:{fontSize:'0.67rem',color:'#4a6a8a',padding:'2px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontFamily:'monospace'},
};

export default function Agents() {
  const { token, user } = useAuth() as { token: string | null; user: { role?: string } | null };
  const access = getAccess(user?.role);

  const [agStatus, setAgStatus] = useState<Record<string,AS>>({});
  const [platforms, setPlatforms] = useState<string[]>(['tiktok','instagram','facebook']);
  const [brief, setBrief] = useState('');
  const [search, setSearch] = useState('');
  const [selId, setSelId] = useState<string>('tiktok_s');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [running, setRunning] = useState(false);
  const [actStage, setActStage] = useState<string|null>(null);
  const [doneStg, setDoneStg] = useState<string[]>([]);
  const [pct, setPct] = useState(0);
  const [kpiPost, setKpiPost] = useState(0);
  const [kpiReach, setKpiReach] = useState(0);
  const [kpiRoas, setKpiRoas] = useState(0);
  const [kpiGmv, setKpiGmv] = useState(0);
  const [outs, setOuts] = useState<OutItem[]>([]);
  const [logs, setLogs] = useState<string[]>(['[SYS] Command Center online','[SYS] 333 agents ready']);
  const [uptime, setUptime] = useState(0);
  const msgsRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(()=>{
    const t = setInterval(()=>setUptime(u=>u+1),1000);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    if(msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  },[msgs]);

  const addLog = useCallback((line:string)=>{
    setLogs(l=>[...l.slice(-49),`[${ts()}] ${line}`]);
  },[]);

  const addMsg = useCallback((agentId:string, content:string)=>{
    setMsgs(m=>[...m,{id:uid(),agentId,content,ts:ts()}]);
  },[]);

  const handleEv = useCallback((ev:{type:string;stage?:string;agent_id?:string;content?:string;pct?:number;done_stages?:string[];metrics?:Record<string,number>})=>{
    if(ev.type==='stage_start' && ev.stage){
      setActStage(ev.stage);
      addLog(`Stage → ${ev.stage}`);
      if(ev.agent_id) setAgStatus(s=>({...s,[ev.agent_id!]:'working'}));
    }
    if(ev.type==='stage_done' && ev.stage){
      setDoneStg(d=>[...d,ev.stage!]);
      if(ev.pct!=null) setPct(ev.pct);
      if(ev.done_stages) setDoneStg(ev.done_stages);
      if(ev.content && ev.agent_id) addMsg(ev.agent_id, ev.content);
      if(ev.agent_id) setAgStatus(s=>({...s,[ev.agent_id!]:'done'}));
      if(ev.metrics){
        if(ev.metrics.posts)  setKpiPost(p=>p+ev.metrics!.posts);
        if(ev.metrics.reach)  setKpiReach(p=>p+ev.metrics!.reach);
        if(ev.metrics.roas)   setKpiRoas(ev.metrics.roas);
        if(ev.metrics.gmv)    setKpiGmv(p=>p+ev.metrics!.gmv);
      }
      setOuts(o=>[...o,{icon:STAGES.find(st=>st.id===ev.stage)?.icon||'📄',title:`${ev.stage} output`,badge:'Ready',color:C.green}]);
    }
    if(ev.type==='complete'){
      setRunning(false);setActStage(null);setPct(100);
      addLog('Campaign complete ✓');
      AGENTS.forEach(a=>setAgStatus(s=>({...s,[a.id]:'done'})));
    }
    if(ev.type==='error'){
      setRunning(false);addLog(`ERROR: ${ev.content||'unknown'}`);
    }
  },[addLog,addMsg]);

  const runDemo = useCallback(()=>{
    timers.current.forEach(clearTimeout);timers.current=[];
    const demoStages=[
      {stage:'intake',   agent:'tiktok_s', content:'Đã phân tích brief. Xác định 6 nền tảng, budget 50M, KPI: GMV 500M.',          metrics:{posts:0,reach:0,roas:0,gmv:0}},
      {stage:'research', agent:'trend_w',  content:'Trending: #FlashSale #WellKOC #OrganicSkincare. 3 đối thủ phân tích xong.',    metrics:{posts:0,reach:5000,roas:0,gmv:0}},
      {stage:'content',  agent:'blog_w',   content:'12 scripts TikTok, 8 bài blog, 24 caption IG, 6 email chuỗi đã hoàn thiện.',   metrics:{posts:50,reach:20000,roas:0,gmv:0}},
      {stage:'design',   agent:'img_gen',  content:'48 banner đa size, 12 thumbnail YouTube, 6 infographic đã render xong.',        metrics:{posts:0,reach:0,roas:0,gmv:0}},
      {stage:'schedule', agent:'tiktok_d', content:'Lịch đăng tối ưu: TikTok 19:00, IG 20:30, FB 12:00 & 21:00 hằng ngày.',        metrics:{posts:60,reach:50000,roas:0,gmv:0}},
      {stage:'publish',  agent:'ig_d',     content:'Đã publish 60 posts lên 6 nền tảng. Rate đăng thành công 98.3%.',               metrics:{posts:60,reach:150000,roas:0,gmv:0}},
      {stage:'engage',   agent:'comment_r',content:'284 comments đã trả lời. Matched 12 KOC micro, brief đã gửi.',                 metrics:{posts:0,reach:200000,roas:0,gmv:5000000}},
      {stage:'analyze',  agent:'bi_r',     content:'CTR 4.7%, Conv 2.1%, ROAS 3.8x vượt target. Đề xuất tăng budget TikTok +20%.', metrics:{posts:0,reach:250000,roas:3.8,gmv:45000000}},
      {stage:'report',   agent:'fraud_d',  content:'Báo cáo: GMV 450M, 18.5K đơn, ROAS 3.8x, NPS +12. KOC top: 3 người.',         metrics:{posts:0,reach:300000,roas:3.8,gmv:450000000}},
    ];
    let delay=0;
    demoStages.forEach((st,i)=>{
      const pct=Math.round((i+1)/demoStages.length*100);
      timers.current.push(setTimeout(()=>handleEv({type:'stage_start',stage:st.stage,agent_id:st.agent}),delay));
      delay+=1800;
      timers.current.push(setTimeout(()=>handleEv({type:'stage_done',stage:st.stage,agent_id:st.agent,content:st.content,pct,done_stages:demoStages.slice(0,i+1).map(s=>s.stage),metrics:st.metrics}),delay));
      delay+=400;
    });
    timers.current.push(setTimeout(()=>handleEv({type:'complete'}),delay+300));
  },[handleEv]);

  const runFull = useCallback(async()=>{
    if(!brief.trim()){addLog('Brief trống — nhập brief trước');return;}
    setRunning(true);setMsgs([]);setOuts([]);setDoneStg([]);setPct(0);setActStage(null);
    setKpiPost(0);setKpiReach(0);setKpiRoas(0);setKpiGmv(0);
    AGENTS.forEach(a=>setAgStatus(s=>({...s,[a.id]:'idle'})));
    addLog('Launching campaign pipeline…');
    if(!token){addLog('No auth — demo mode');runDemo();return;}
    try{
      const res = await fetch(`${API_BASE}/api/v1/ai/marketing/run-campaign`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({brief,platforms}),
      });
      if(!res.ok||!res.body){throw new Error(`HTTP ${res.status}`);}
      const reader=res.body.getReader();const dec=new TextDecoder();let buf='';
      while(true){
        const {done,value}=await reader.read();
        if(done)break;
        buf+=dec.decode(value,{stream:true});
        const lines=buf.split('\n');buf=lines.pop()||'';
        for(const line of lines){
          if(line.startsWith('data: ')){
            try{handleEv(JSON.parse(line.slice(6)));}catch(_){/**/}
          }
        }
      }
    }catch(e){
      addLog(`Backend unavailable — demo mode (${(e as Error).message})`);
      runDemo();
    }
  },[brief,platforms,token,handleEv,runDemo,addLog]);

  const quickSend = useCallback(async(agentId:string)=>{
    if(!token){addLog(`Quick dispatch: ${agentId} (demo)`);return;}
    try{
      await fetch(`${API_BASE}/api/v1/ai/marketing/quick`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({agent_id:agentId,task:'Thực hiện nhiệm vụ mặc định',context:{}}),
      });
      addLog(`Quick → ${agentId} dispatched`);
    }catch(_){addLog(`Quick → ${agentId} (offline)`);}
  },[token,addLog]);

  // ── Paywall ──
  if (access === 'locked') {
    return <PaywallScreen isLoggedIn={!!user} />;
  }

  const selAgent = AGENTS.find(a=>a.id===selId);
  const filtered = AGENTS.filter(a=>a.name.toLowerCase().includes(search.toLowerCase())||a.squad.includes(search.toLowerCase()));
  const squads = ['content','dist','engage'];
  const squadLabel:Record<string,string>={content:'Content Factory (111)',dist:'Distribution Grid (111)',engage:'Engagement Matrix (111)'};
  const fmtUptime=`${String(Math.floor(uptime/3600)).padStart(2,'0')}:${String(Math.floor(uptime%3600/60)).padStart(2,'0')}:${String(uptime%60).padStart(2,'0')}`;

  return (
    <div style={s.page}>
      {/* Hero — compact, fixed height */}
      <div style={s.hero}>
        <div style={s.heroIcon}>🤖</div>
        <div>
          <div style={s.heroTitle}>333 Agent Command Center</div>
          <div style={s.heroSub}>Content Factory · Distribution Grid · Engagement Matrix</div>
        </div>
        <div style={s.heroBadge}>
          <span style={s.badge}>⚡ {fmtUptime}</span>
          <span style={{...s.badge,background:'rgba(34,197,94,.12)',color:'#22c55e',border:'1px solid rgba(34,197,94,.3)'}}>
            ● {running?'Running':'Standby'}
          </span>
          <span style={{...s.badge,background:'rgba(240,165,0,.12)',color:C.gold,border:'1px solid rgba(240,165,0,.3)'}}>
            333 Agents
          </span>
        </div>
      </div>

      {/* 3-col grid — fills remaining height, no scroll on outer page */}
      <div style={s.grid}>

        {/* LEFT — Agent sidebar */}
        <div style={s.sidebar}>
          <div style={s.sideHead}>
            <input style={s.sideSearch} placeholder="Tìm agent…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={s.sideList}>
            {squads.map(sq=>(
              <div key={sq}>
                <div style={s.squadLabel}>{squadLabel[sq]}</div>
                {filtered.filter(a=>a.squad===sq).map(a=>{
                  const st:AS=agStatus[a.id]||'idle';
                  const dot=st==='working'?C.amber:st==='done'?C.green:C.muted;
                  return (
                    <div
                      key={a.id}
                      style={{...s.agentRow,...(selId===a.id?s.agentRowActive:{})}}
                      onClick={()=>{setSelId(a.id);quickSend(a.id);}}
                    >
                      <div style={s.agentIcon}>{a.icon}</div>
                      <div>
                        <div style={s.agentName}>{a.name}</div>
                        <div style={s.agentRole}>{a.role} · ×{a.count}</div>
                      </div>
                      <div style={{...s.agentStatus,background:dot,boxShadow:st==='working'?`0 0 5px ${dot}`:undefined}}/>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div style={s.center}>
          {/* KPI bar */}
          <div style={s.kpiBar}>
            {[
              {val:kpiPost,lbl:'Posts',col:C.cyan},
              {val:kpiReach>=1000?`${(kpiReach/1000).toFixed(1)}K`:kpiReach,lbl:'Reach',col:C.purple},
              {val:kpiRoas?`${kpiRoas}x`:'—',lbl:'ROAS',col:C.gold},
              {val:kpiGmv>=1e6?`${(kpiGmv/1e6).toFixed(1)}M`:kpiGmv||'—',lbl:'GMV (VND)',col:C.green},
            ].map((k,i)=>(
              <div key={i} style={s.kpi}>
                <div style={{...s.kpiVal,color:k.col}}>{k.val}</div>
                <div style={s.kpiLbl}>{k.lbl}</div>
              </div>
            ))}
          </div>

          {/* Pipeline */}
          <div style={s.pipeline}>
            {STAGES.map((st,i)=>{
              const done=doneStg.includes(st.id);
              const active=actStage===st.id;
              return (
                <div key={st.id} style={{display:'flex',alignItems:'center',flex:1}}>
                  <div style={s.stageNode}>
                    <div style={{
                      ...s.stageCircle,
                      background:done?`${st.color}22`:active?`${st.color}33`:'rgba(255,255,255,.04)',
                      borderColor:done?st.color:active?st.color:'rgba(255,255,255,.1)',
                      boxShadow:active?`0 0 10px ${st.color}`:undefined,
                    }}>{st.icon}</div>
                    <div style={{...s.stageName,color:done||active?st.color:undefined}}>{st.label}</div>
                  </div>
                  {i<STAGES.length-1&&<div style={{...s.stageConn,background:done?`${STAGES[i].color}44`:'rgba(255,255,255,.06)'}}/>}
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div style={s.progressWrap}>
            <div style={s.progressBar}>
              <div style={{...s.progressFill,width:`${pct}%`}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:3,fontSize:'0.65rem',color:'#4a6a8a'}}>
              <span>{actStage?`Running: ${actStage}`:pct===100?'Complete ✓':'Waiting…'}</span>
              <span>{pct}%</span>
            </div>
          </div>

          {/* Messages */}
          <div style={s.msgs} ref={msgsRef}>
            {msgs.length===0&&(
              <div style={{textAlign:'center',color:'#4a6a8a',fontSize:'0.8rem',padding:'30px 0'}}>
                Chọn preset hoặc nhập brief → nhấn Launch để bắt đầu pipeline 333 agents
              </div>
            )}
            {msgs.map(m=>{
              const ag=AGENTS.find(a=>a.id===m.agentId);
              return(
                <div key={m.id} style={s.msgBubble}>
                  <div style={{...s.msgAgent,color:ag?.color||C.cyan}}>{ag?.icon} {ag?.name||m.agentId} · {m.ts}</div>
                  {m.content}
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={s.inputArea}>
            <div style={s.presetRow}>
              {PRESETS.map(p=>(
                <button key={p.label} style={s.presetBtn} onClick={()=>{setBrief(p.brief);setPlatforms(p.platforms);}}>
                  {p.label}
                </button>
              ))}
            </div>
            <div style={s.platformRow}>
              {Object.entries(PLATFORM_CFG).map(([k,v])=>{
                const on=platforms.includes(k);
                return(
                  <div key={k} style={{
                    ...s.platformChip,
                    ...(on?{...s.platformChipOn,borderColor:v.color,color:v.color,background:`${v.color}18`}:{}),
                  }} onClick={()=>setPlatforms(pl=>pl.includes(k)?pl.filter(x=>x!==k):[...pl,k])}>
                    {v.label}
                  </div>
                );
              })}
            </div>
            <div style={s.inputRow}>
              <textarea style={s.textarea} rows={2} placeholder="Nhập campaign brief… (hoặc chọn preset ở trên)"
                value={brief} onChange={e=>setBrief(e.target.value)}/>
              <button style={{...s.btnRun,opacity:running?0.6:1}} disabled={running} onClick={runFull}>
                {running?'Running…':'🚀 Launch'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT panel */}
        <div style={s.right}>
          <div style={s.rightScroll}>
            {/* Metrics */}
            <div style={s.panel}>
              <div style={s.panelTitle}>Live Metrics</div>
              <div style={s.metrGrid}>
                {[
                  {val:kpiPost,lbl:'Posts',col:C.cyan},
                  {val:kpiReach>=1000?`${(kpiReach/1000).toFixed(0)}K`:kpiReach||0,lbl:'Reach',col:C.purple},
                  {val:kpiRoas?`${kpiRoas}x`:'—',lbl:'ROAS',col:C.gold},
                  {val:kpiGmv>=1e6?`${(kpiGmv/1e6).toFixed(0)}M`:kpiGmv||0,lbl:'GMV',col:C.green},
                ].map((m,i)=>(
                  <div key={i} style={s.metrCard}>
                    <div style={{...s.metrVal,color:m.col}}>{m.val}</div>
                    <div style={s.metrLbl}>{m.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected agent detail */}
            {selAgent&&(
              <div style={s.panel}>
                <div style={s.panelTitle}>Agent Detail</div>
                <div style={s.detailBox}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <div style={{fontSize:24}}>{selAgent.icon}</div>
                    <div>
                      <div style={{fontSize:'0.85rem',fontWeight:700,color:selAgent.color}}>{selAgent.name}</div>
                      <div style={{fontSize:'0.67rem',color:'#4a6a8a'}}>{selAgent.role} · ×{selAgent.count}</div>
                    </div>
                  </div>
                  <div>{selAgent.spec.map(sp=><span key={sp} style={s.specChip}>{sp}</span>)}</div>
                  <div style={{marginTop:8,fontSize:'0.67rem',color:'#4a6a8a'}}>
                    Status: <span style={{color:agStatus[selAgent.id]==='working'?C.amber:agStatus[selAgent.id]==='done'?C.green:C.muted}}>
                      {agStatus[selAgent.id]||'idle'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Output queue */}
            <div style={s.panel}>
              <div style={s.panelTitle}>Output Queue ({outs.length})</div>
              {outs.length===0&&<div style={{fontSize:'0.7rem',color:'#4a6a8a'}}>Pipeline outputs will appear here…</div>}
              {outs.slice(-6).map((o,i)=>(
                <div key={i} style={s.outRow}>
                  <div style={s.outIcon}>{o.icon}</div>
                  <div style={s.outTitle}>{o.title}</div>
                  <span style={{...s.outBadge,background:`${o.color}22`,color:o.color}}>{o.badge}</span>
                </div>
              ))}
            </div>

            {/* System log */}
            <div style={s.panel}>
              <div style={s.panelTitle}>System Log</div>
              {logs.slice(-15).reverse().map((l,i)=>(
                <div key={i} style={s.logLine}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
