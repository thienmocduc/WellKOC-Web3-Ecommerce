import { useState, type ReactNode } from 'react';

interface Tab { key: string; label: string; icon: string; content: ReactNode; }

interface Props {
  title: string;
  subtitle?: string;
  badge?: { label: string; className: string };
  tabs: Tab[];
  onClose: () => void;
  actions?: ReactNode;
}

export default function AdminDetailPanel({ title, subtitle, badge, tabs, onClose, actions }: Props) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key || '');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} />

      {/* Panel */}
      <div
        style={{ position: 'relative', width: '60%', maxWidth: 720, minWidth: 400, height: '100%', background: 'var(--bg-1)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', animation: 'slideInRight .25s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{title}</h2>
                {badge && <span className={`badge ${badge.className}`} style={{ fontSize: '.6rem' }}>{badge.label}</span>}
              </div>
              {subtitle && <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: 4 }}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>✕</button>
          </div>
          {actions && <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>{actions}</div>}
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: '10px 16px', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
                background: 'transparent', border: 'none', borderBottom: activeTab === t.key ? '2px solid var(--c6-500)' : '2px solid transparent',
                color: activeTab === t.key ? 'var(--c6-500)' : 'var(--text-3)',
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {tabs.find(t => t.key === activeTab)?.content}
        </div>
      </div>

      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}
