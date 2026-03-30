import type { CSSProperties } from 'react';

/* ── Button styles ── */
export const btnSm: CSSProperties = { padding: '4px 10px', fontSize: '.68rem', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' };
export const btnPrimSm: CSSProperties = { ...btnSm, background: 'var(--c4-500)', color: '#fff', border: 'none' };
export const btnDangerSm: CSSProperties = { ...btnSm, background: '#ef4444', color: '#fff', border: 'none' };
export const btnSuccessSm: CSSProperties = { ...btnSm, background: '#22c55e', color: '#fff', border: 'none' };
export const btnWarnSm: CSSProperties = { ...btnSm, background: '#f59e0b', color: '#fff', border: 'none' };

/* ── Table styles ── */
export const thStyle: CSSProperties = { padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '.65rem', color: 'var(--text-3)', letterSpacing: '.06em', textTransform: 'uppercase' };
export const tdStyle: CSSProperties = { padding: '12px 14px', fontSize: '.78rem' };
export const searchInputStyle: CSSProperties = { padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: '.82rem', flex: 1 };
export const filterSelectStyle: CSSProperties = { padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: '.82rem' };

/* ── Status badges ── */
export const statusBadge: Record<string, string> = {
  active: 'badge-c4', approved: 'badge-c4', success: 'badge-c4', online: 'badge-c4', verified: 'badge-c4',
  pending: 'badge-gold', processing: 'badge-c6', review: 'badge-gold',
  suspended: 'badge-c7', rejected: 'badge-rose', flagged: 'badge-rose',
  inactive: 'badge-c5',
};
export const statusLabel: Record<string, string> = {
  active: 'Hoạt động', approved: 'Đã duyệt', success: 'Thành công', online: 'Online', verified: 'Verified',
  pending: 'Chờ duyệt', processing: 'Đang xử lý', review: 'Review',
  suspended: 'Tạm khóa', rejected: 'Từ chối', flagged: 'Bị gắn cờ',
  inactive: 'Không hoạt động',
};

/* ── Format helpers ── */
export const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';
