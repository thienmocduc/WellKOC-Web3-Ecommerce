import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '@hooks/useI18n';
import legalData from '@data/legal-content.json';

type DocType = 'tos' | 'privacy';
type Role = 'buyer' | 'koc' | 'vendor' | 'general';

const DOC_TITLES: Record<string, Record<string, string>> = {
  tos_general:    { vi: 'Điều khoản Dịch vụ Chung',        en: 'General Terms of Service',      zh: '通用服务条款',         th: 'ข้อกำหนดการใช้บริการทั่วไป',            hi: 'सामान्य सेवा की शर्तें' },
  tos_buyer:      { vi: 'Điều khoản Dịch vụ — Người mua',  en: 'Terms of Service — Buyer',      zh: '服务条款 — 买家',      th: 'ข้อกำหนด — ผู้ซื้อ',                     hi: 'सेवा की शर्तें — खरीदार' },
  tos_koc:        { vi: 'Điều khoản Dịch vụ — KOC/KOL',   en: 'Terms of Service — KOC/KOL',   zh: '服务条款 — KOC/KOL',  th: 'ข้อกำหนด — KOC/KOL',                    hi: 'सेवा की शर्तें — KOC/KOL' },
  tos_vendor:     { vi: 'Điều khoản Dịch vụ — Vendor',     en: 'Terms of Service — Vendor',     zh: '服务条款 — 供应商',    th: 'ข้อกำหนด — ผู้ขาย',                     hi: 'सेवा की शर्तें — विक्रेता' },
  privacy_buyer:  { vi: 'Chính sách Bảo mật — Người mua',  en: 'Privacy Policy — Buyer',        zh: '隐私政策 — 买家',      th: 'นโยบายความเป็นส่วนตัว — ผู้ซื้อ',        hi: 'गोपनीयता नीति — खरीदार' },
  privacy_koc:    { vi: 'Chính sách Bảo mật — KOC/KOL',   en: 'Privacy Policy — KOC/KOL',     zh: '隐私政策 — KOC/KOL',  th: 'นโยบายความเป็นส่วนตัว — KOC/KOL',       hi: 'गोपनीयता नीति — KOC/KOL' },
  privacy_vendor: { vi: 'Chính sách Bảo mật — Vendor',     en: 'Privacy Policy — Vendor',       zh: '隐私政策 — 供应商',    th: 'นโยบายความเป็นส่วนตัว — ผู้ขาย',        hi: 'गोपनीयता नीति — विक्रेता' },
};

/* ─────────────────────────────────────────────
   Renderer helpers
───────────────────────────────────────────── */

interface LineNode {
  type:
    | 'state-header'   // CỘNG HÒA line
    | 'sub-header'     // Độc lập – Tự do – Hạnh phúc
    | 'thin-rule'      // ───────
    | 'fat-rule'       // ═══════  (signature separator)
    | 'doc-title'      // All-caps document title line
    | 'meta'           // Ngày hiệu lực: / Phiên bản: etc.
    | 'art'            // [ART]ĐIỀU N. TITLE
    | 'sec'            // [SEC]MỤC N. TITLE
    | 'cl'             // [CL]N.N. TITLE
    | 'box'            // [BOX]⚠/🔒/📌 TEXT
    | 'bullet'         // • TEXT
    | 'blank'          // empty line
    | 'para';          // everything else
  text: string;
  boxIcon?: string;    // ⚠ 🔒 📌 for box type
}

function parseLine(line: string): LineNode {
  const t = line.trim();

  if (!t) return { type: 'blank', text: '' };

  if (/^CỘNG HÒA/.test(t))
    return { type: 'state-header', text: t };

  if (/^Độc lập/.test(t))
    return { type: 'sub-header', text: t };

  if (/^─{5,}/.test(t))
    return { type: 'thin-rule', text: t };

  if (/^═{5,}/.test(t))
    return { type: 'fat-rule', text: t };

  if (t.startsWith('[ART]'))
    return { type: 'art', text: t.slice(5) };

  if (t.startsWith('[SEC]'))
    return { type: 'sec', text: t.slice(5) };

  if (t.startsWith('[CL]'))
    return { type: 'cl', text: t.slice(4) };

  if (t.startsWith('[BOX]')) {
    const inner = t.slice(5);
    const iconMatch = inner.match(/^([⚠🔒📌⛓])\s*/u);
    if (iconMatch) return { type: 'box', text: inner.slice(iconMatch[0].length), boxIcon: iconMatch[1] };
    return { type: 'box', text: inner, boxIcon: '📌' };
  }

  if (t.startsWith('•'))
    return { type: 'bullet', text: t.slice(1).trim() };

  // All-caps Vietnamese document title (no [ART] prefix)
  if (/^[A-ZĐÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ\s\(\)\/\-,]+$/.test(t) && t.length > 6 && /[A-ZĐÁÀẢÃẠ]/.test(t[0]))
    return { type: 'doc-title', text: t };

  // Meta info lines: "Key: Value"
  if (/^(Ngày hiệu lực|Phiên bản|Pháp nhân|Địa chỉ|Email pháp lý|Số ĐKKD|Cơ quan cấp)/.test(t))
    return { type: 'meta', text: t };

  return { type: 'para', text: t };
}

/* ─────────────────────────────────────────────
   Box accent colours per icon
───────────────────────────────────────────── */
function boxStyle(icon?: string): { bg: string; border: string; color: string } {
  if (icon === '⚠')  return { bg: 'rgba(251,191,36,.12)',  border: '#fbbf24', color: '#92400e' };
  if (icon === '🔒')  return { bg: 'rgba(99,102,241,.10)',  border: '#6366f1', color: 'var(--text-1)' };
  if (icon === '⛓')  return { bg: 'rgba(6,182,212,.10)',   border: '#06b6d4', color: 'var(--text-1)' };
  return              { bg: 'rgba(34,197,94,.10)',   border: '#22c55e', color: 'var(--text-1)' }; // 📌 green
}

/* ─────────────────────────────────────────────
   Single line → React element
───────────────────────────────────────────── */
function renderLine(node: LineNode, idx: number): React.ReactElement | null {
  switch (node.type) {
    case 'blank':
      return <div key={idx} style={{ height: 8 }} />;

    case 'state-header':
      return (
        <div key={idx} style={{ textAlign: 'center', fontWeight: 800, fontSize: '.95rem', color: 'var(--text-1)', letterSpacing: '.04em', marginBottom: 2 }}>
          {node.text}
        </div>
      );

    case 'sub-header':
      return (
        <div key={idx} style={{ textAlign: 'center', fontWeight: 600, fontSize: '.85rem', color: 'var(--text-2)', fontStyle: 'italic', marginBottom: 4 }}>
          {node.text}
        </div>
      );

    case 'thin-rule':
      return (
        <hr key={idx} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px auto', maxWidth: 320 }} />
      );

    case 'fat-rule':
      return (
        <hr key={idx} style={{ border: 'none', borderTop: '2px solid var(--border)', margin: '24px 0 16px' }} />
      );

    case 'doc-title':
      return (
        <div key={idx} style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-1)', marginTop: 12, marginBottom: 2, letterSpacing: '.02em' }}>
          {node.text}
        </div>
      );

    case 'meta': {
      const colonIdx = node.text.indexOf(':');
      const label = colonIdx !== -1 ? node.text.slice(0, colonIdx) : node.text;
      const value = colonIdx !== -1 ? node.text.slice(colonIdx + 1).trim() : '';
      return (
        <div key={idx} style={{ display: 'flex', gap: 8, fontSize: '.82rem', lineHeight: 1.6, color: 'var(--text-3)', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-2)', minWidth: 140, flexShrink: 0 }}>{label}:</span>
          <span>{value}</span>
        </div>
      );
    }

    case 'art':
      return (
        <div key={idx} style={{ marginTop: 28, marginBottom: 10 }}>
          <h2 style={{
            fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)',
            margin: 0, paddingBottom: 8,
            borderBottom: '2px solid var(--c6-500)',
            textTransform: 'uppercase', letterSpacing: '.03em',
          }}>
            {node.text}
          </h2>
        </div>
      );

    case 'sec':
      return (
        <div key={idx} style={{ marginTop: 20, marginBottom: 8 }}>
          <h3 style={{
            fontSize: '.92rem', fontWeight: 700, color: 'var(--c6-500)',
            margin: 0, paddingLeft: 10,
            borderLeft: '3px solid var(--c6-500)',
          }}>
            {node.text}
          </h3>
        </div>
      );

    case 'cl':
      return (
        <div key={idx} style={{ marginTop: 12, marginBottom: 4, paddingLeft: 16 }}>
          <span style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--text-1)' }}>
            {node.text}
          </span>
        </div>
      );

    case 'box': {
      const bs = boxStyle(node.boxIcon);
      return (
        <div key={idx} style={{
          background: bs.bg, borderLeft: `4px solid ${bs.border}`,
          borderRadius: '0 8px 8px 0', padding: '12px 16px',
          margin: '16px 0', fontSize: '.84rem', lineHeight: 1.7,
          color: bs.color, fontWeight: 500,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{node.boxIcon}</span>
          <span>{node.text}</span>
        </div>
      );
    }

    case 'bullet':
      return (
        <div key={idx} style={{
          display: 'flex', gap: 10, paddingLeft: 24,
          fontSize: '.84rem', lineHeight: 1.7, color: 'var(--text-2)',
          marginBottom: 4,
        }}>
          <span style={{ color: 'var(--c6-500)', flexShrink: 0, fontWeight: 700 }}>•</span>
          <span>{node.text}</span>
        </div>
      );

    case 'para':
    default:
      return (
        <p key={idx} style={{
          fontSize: '.875rem', lineHeight: 1.8, color: 'var(--text-2)',
          margin: '0 0 6px', paddingLeft: 0,
        }}>
          {node.text}
        </p>
      );
  }
}

/* ─────────────────────────────────────────────
   Signature block (everything after fat-rule)
───────────────────────────────────────────── */
function SignatureBlock({ lines }: { lines: LineNode[] }) {
  if (lines.length === 0) return null;
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 24px', marginTop: 8,
    }}>
      {lines.map((l, i) => renderLine(l, i))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function Legal() {
  const { locale } = useI18n();
  const [params] = useSearchParams();
  const docParam = params.get('doc') || 'tos';
  const roleParam = (params.get('role') || 'general') as Role;

  const [docType, setDocType] = useState<DocType>(docParam === 'privacy' ? 'privacy' : 'tos');
  const [role, setRole] = useState<Role>(roleParam);

  const getDocKey = (): string => {
    if (docType === 'tos' && role === 'general') return 'tos_general';
    return `${docType}_${role === 'general' ? 'buyer' : role}`;
  };

  const docKey = getDocKey();
  const rawContent = (legalData as Record<string, string>)[docKey] || '';
  const title = DOC_TITLES[docKey]?.[locale] || DOC_TITLES[docKey]?.vi || docKey;

  // Parse all lines
  const rawLines = rawContent.split('\n');
  const nodes = rawLines.map(parseLine);

  // Split at fat-rule to separate body from signature block
  const fatIdx = nodes.findIndex(n => n.type === 'fat-rule');
  const bodyNodes = fatIdx === -1 ? nodes : nodes.slice(0, fatIdx);
  const sigNodes  = fatIdx === -1 ? [] : nodes.slice(fatIdx + 1);

  return (
    <section style={{ minHeight: '100vh', background: 'var(--bg-0)', padding: '80px 24px 48px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{
            fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800,
            color: 'var(--text-1)', margin: '0 0 6px',
          }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '.82rem', margin: 0 }}>
            WellKOC Platform · Công ty TNHH WellKOC Việt Nam
          </p>
        </div>

        {/* Tab: TOS / Privacy */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12,
          padding: 4, borderRadius: 12, border: '1px solid var(--border)',
          background: 'var(--surface-card)', maxWidth: 380, margin: '0 auto 12px',
        }}>
          {([['tos', 'Điều khoản DV'], ['privacy', 'Chính sách BM']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setDocType(key as DocType)} style={{
              flex: 1, padding: '8px 14px', borderRadius: 8, border: 'none',
              background: docType === key ? 'var(--chakra-flow)' : 'transparent',
              color: docType === key ? '#fff' : 'var(--text-3)',
              fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Role */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 32,
          padding: 4, borderRadius: 12, border: '1px solid var(--border)',
          background: 'var(--surface-card)', maxWidth: 500, margin: '0 auto 32px',
        }}>
          {([
            ['general', 'Chung',     '📋'],
            ['buyer',   'Người mua', '🛒'],
            ['koc',     'KOC/KOL',   '⭐'],
            ['vendor',  'Vendor',    '🏪'],
          ] as const).map(([key, label, icon]) => (
            <button key={key} onClick={() => setRole(key as Role)} style={{
              flex: 1, padding: '8px 10px', borderRadius: 8, border: 'none',
              background: role === key ? 'var(--surface-hover)' : 'transparent',
              color: role === key ? 'var(--text-1)' : 'var(--text-3)',
              fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>

        {/* Document body */}
        <div className="card" style={{ padding: '32px 32px 28px', borderRadius: 16 }}>
          {bodyNodes.map((node, i) => renderLine(node, i))}
        </div>

        {/* Signature block */}
        {sigNodes.length > 0 && <SignatureBlock lines={sigNodes} />}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 28, fontSize: '.72rem', color: 'var(--text-4)' }}>
          Công ty TNHH WellKOC Việt Nam · 35 Thái Phiên, Hải Châu, Đà Nẵng · legal@wellkoc.com
        </div>
      </div>
    </section>
  );
}
