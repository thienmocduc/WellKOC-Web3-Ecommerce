import { useState } from 'react';
import { btnPrimSm, btnDangerSm, btnSuccessSm, btnSm, thStyle, tdStyle, searchInputStyle, statusBadge, statusLabel } from './shared/constants';
import AdminDetailPanel from './shared/AdminDetailPanel';

interface KYCRecord {
  id: string; name: string; cccd: string; dob: string; submittedDate: string; status: string;
  submittedName: string; submittedDob: string; submittedCccd: string;
  aiMatchScore: number; aiNotes: string;
  selfieUrl?: string; cccdFrontUrl?: string; cccdBackUrl?: string;
}

const initialKycData: KYCRecord[] = [
  { id: 'KYC-089', name: 'Nguyễn Thị Lan', cccd: '001***4567', dob: '1995-05-12', submittedDate: '2026-03-27', status: 'pending', submittedName: 'Nguyễn Thị Lan', submittedDob: '1995-05-12', submittedCccd: '001204564567', aiMatchScore: 98, aiNotes: 'Tên, ngày sinh, số CCCD khớp hoàn toàn' },
  { id: 'KYC-088', name: 'Trần Văn Minh', cccd: '024***8901', dob: '1990-08-23', submittedDate: '2026-03-27', status: 'pending', submittedName: 'Trần Văn Minh', submittedDob: '1990-08-23', submittedCccd: '024038918901', aiMatchScore: 95, aiNotes: 'Tất cả thông tin khớp, ảnh selfie rõ nét' },
  { id: 'KYC-087', name: 'Lê Hoàng Nam', cccd: '036***2345', dob: '1998-11-30', submittedDate: '2026-03-26', status: 'approved', submittedName: 'Lê Hoàng Nam', submittedDob: '1998-11-30', submittedCccd: '036052342345', aiMatchScore: 99, aiNotes: 'Auto-approved: match 99%' },
  { id: 'KYC-086', name: 'Phạm Thị Hoa', cccd: '079***6789', dob: '1992-03-15', submittedDate: '2026-03-25', status: 'pending', submittedName: 'Phạm Thị Hòa', submittedDob: '1992-03-15', submittedCccd: '079126786789', aiMatchScore: 62, aiNotes: '⚠️ Tên không khớp: "Hoa" vs "Hòa" — cần kiểm tra thủ công' },
  { id: 'KYC-085', name: 'Đặng Quốc Bảo', cccd: '045***3456', dob: '1988-07-08', submittedDate: '2026-03-24', status: 'rejected', submittedName: 'Đặng Quốc Bảo', submittedDob: '1989-07-08', submittedCccd: '045123453456', aiMatchScore: 45, aiNotes: '❌ Ngày sinh không khớp: 1988 vs 1989' },
];

interface Props {
  showToast: (msg: string) => void;
}

export default function AdminKYC({ showToast }: Props) {
  const [kycRecords, setKycRecords] = useState(initialKycData);
  const [selectedKyc, setSelectedKyc] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRecords = kycRecords.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: kycRecords.filter(r => r.status === 'pending').length,
    approved: kycRecords.filter(r => r.status === 'approved').length,
    rejected: kycRecords.filter(r => r.status === 'rejected').length,
  };

  const handleApprove = (id: string) => {
    setKycRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', aiNotes: r.aiNotes + ' | Admin approved' } : r));
    showToast(`✅ Đã duyệt KYC ${id}`);
  };
  const handleReject = (id: string, reason?: string) => {
    setKycRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', aiNotes: r.aiNotes + ` | Admin rejected: ${reason || 'Thông tin không khớp'}` } : r));
    showToast(`❌ Đã từ chối KYC ${id}`);
  };
  const handleAutoProcess = () => {
    let approved = 0, rejected = 0;
    setKycRecords(prev => prev.map(r => {
      if (r.status !== 'pending') return r;
      if (r.aiMatchScore >= 90) { approved++; return { ...r, status: 'approved', aiNotes: r.aiNotes + ' | Auto-approved by AI' }; }
      if (r.aiMatchScore < 50) { rejected++; return { ...r, status: 'rejected', aiNotes: r.aiNotes + ' | Auto-rejected by AI' }; }
      return r;
    }));
    showToast(`🤖 AI đã xử lý: ${approved} approved, ${rejected} rejected, ${stats.pending - approved - rejected} cần review thủ công`);
  };

  const selected = kycRecords.find(r => r.id === selectedKyc);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>KYC / Xác Minh Tài Khoản</h2>
        <button style={{ ...btnPrimSm, background: 'linear-gradient(135deg, var(--c6-500), var(--c7-500))', padding: '8px 16px', fontSize: '.78rem' }} onClick={handleAutoProcess}>
          🤖 AI Auto-Process ({stats.pending} pending)
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Chờ xác minh', value: stats.pending, color: 'var(--gold-400)' },
          { label: 'Đã duyệt', value: stats.approved, color: 'var(--c4-500)' },
          { label: 'Từ chối', value: stats.rejected, color: '#ef4444' },
          { label: 'Tổng', value: kycRecords.length, color: 'var(--c6-500)' },
        ].map((s, i) => (
          <div key={i} className="kpi-card" style={{ padding: 16 }}>
            <div style={{ fontSize: '.68rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="Tìm theo tên, ID..." value={search} onChange={e => setSearch(e.target.value)} style={searchInputStyle} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...searchInputStyle, flex: 'none', width: 150 }}>
          <option value="all">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Họ tên', 'CCCD', 'Ngày nộp', 'AI Score', 'Trạng thái', 'Thao tác'].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{r.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{r.name}</td>
                  <td style={tdStyle}>{r.cccd}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-3)' }}>{r.submittedDate}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '.7rem', fontWeight: 700,
                      background: r.aiMatchScore >= 90 ? 'rgba(34,197,94,.15)' : r.aiMatchScore >= 70 ? 'rgba(245,158,11,.15)' : 'rgba(239,68,68,.15)',
                      color: r.aiMatchScore >= 90 ? '#22c55e' : r.aiMatchScore >= 70 ? '#f59e0b' : '#ef4444',
                    }}>
                      {r.aiMatchScore}%
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span className={`badge ${statusBadge[r.status] || 'badge-c6'}`}>{statusLabel[r.status] || r.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.status === 'pending' && (
                        <>
                          <button style={btnSuccessSm} onClick={() => handleApprove(r.id)}>Duyệt</button>
                          <button style={btnDangerSm} onClick={() => handleReject(r.id)}>Từ chối</button>
                        </>
                      )}
                      <button style={btnSm} onClick={() => setSelectedKyc(r.id)}>Xem</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <AdminDetailPanel
          title={`KYC — ${selected.name}`}
          subtitle={`ID: ${selected.id} · Ngày nộp: ${selected.submittedDate}`}
          badge={{ label: statusLabel[selected.status] || selected.status, className: statusBadge[selected.status] || 'badge-c6' }}
          onClose={() => setSelectedKyc(null)}
          actions={selected.status === 'pending' ? (
            <>
              <button style={{ ...btnSuccessSm, padding: '8px 20px', fontSize: '.82rem' }} onClick={() => { handleApprove(selected.id); setSelectedKyc(null); }}>✅ Duyệt</button>
              <button style={{ ...btnDangerSm, padding: '8px 20px', fontSize: '.82rem' }} onClick={() => { handleReject(selected.id); setSelectedKyc(null); }}>❌ Từ chối</button>
            </>
          ) : undefined}
          tabs={[
            { key: 'verify', label: 'Xác minh', icon: '🪪', content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* AI Match Score */}
                <div style={{ padding: 20, borderRadius: 12, background: selected.aiMatchScore >= 90 ? 'rgba(34,197,94,.08)' : selected.aiMatchScore >= 70 ? 'rgba(245,158,11,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${selected.aiMatchScore >= 90 ? 'rgba(34,197,94,.2)' : selected.aiMatchScore >= 70 ? 'rgba(245,158,11,.2)' : 'rgba(239,68,68,.2)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 4 }}>🤖 AI Verification Score</div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: selected.aiMatchScore >= 90 ? '#22c55e' : selected.aiMatchScore >= 70 ? '#f59e0b' : '#ef4444' }}>{selected.aiMatchScore}%</div>
                    </div>
                    <div style={{ fontSize: '2.5rem' }}>{selected.aiMatchScore >= 90 ? '✅' : selected.aiMatchScore >= 70 ? '⚠️' : '❌'}</div>
                  </div>
                  <div style={{ fontSize: '.78rem', marginTop: 8, color: 'var(--text-2)' }}>{selected.aiNotes}</div>
                  {selected.aiMatchScore >= 90 && selected.status === 'pending' && (
                    <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(34,197,94,.1)', fontSize: '.75rem', color: '#22c55e', fontWeight: 600 }}>
                      💡 Khuyến nghị: Tự động duyệt — AI match score cao
                    </div>
                  )}
                  {selected.aiMatchScore < 70 && selected.status === 'pending' && (
                    <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,.1)', fontSize: '.75rem', color: '#ef4444', fontWeight: 600 }}>
                      ⚠️ Cảnh báo: Score thấp — cần kiểm tra kỹ thông tin
                    </div>
                  )}
                </div>

                {/* Info Comparison Table */}
                <div>
                  <h4 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 12 }}>So sánh thông tin</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ ...thStyle, width: '25%' }}>Trường</th>
                        <th style={thStyle}>Khai báo</th>
                        <th style={thStyle}>Trên CCCD (OCR)</th>
                        <th style={{ ...thStyle, width: '15%' }}>Kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { field: 'Họ tên', submitted: selected.submittedName, ocr: selected.name, match: selected.submittedName === selected.name },
                        { field: 'Ngày sinh', submitted: selected.submittedDob, ocr: selected.dob, match: selected.submittedDob === selected.dob },
                        { field: 'Số CCCD', submitted: selected.submittedCccd.slice(0, 3) + '***' + selected.submittedCccd.slice(-4), ocr: selected.cccd, match: true },
                      ].map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{row.field}</td>
                          <td style={tdStyle}>{row.submitted}</td>
                          <td style={tdStyle}>{row.ocr}</td>
                          <td style={tdStyle}>
                            <span style={{ color: row.match ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                              {row.match ? '✅ Khớp' : '❌ Sai'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Document Preview */}
                <div>
                  <h4 style={{ fontSize: '.88rem', fontWeight: 700, marginBottom: 12 }}>Tài liệu đã nộp</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { label: 'CCCD Mặt trước', icon: '📄' },
                      { label: 'CCCD Mặt sau', icon: '📄' },
                      { label: 'Ảnh Selfie + CCCD', icon: '🤳' },
                    ].map((doc, i) => (
                      <div key={i} style={{ padding: 24, textAlign: 'center', borderRadius: 12, background: 'var(--bg-2)', border: '2px dashed var(--border)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>{doc.icon}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{doc.label}</div>
                        <div style={{ fontSize: '.6rem', color: 'var(--text-4)', marginTop: 4 }}>Đã upload ✅</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )},
            { key: 'history', label: 'Lịch sử', icon: '📜', content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '12px 16px', borderRadius: 8, borderLeft: '3px solid var(--c6-500)', background: 'var(--bg-2)', fontSize: '.78rem' }}>
                  <div style={{ fontWeight: 700 }}>Nộp hồ sơ KYC</div>
                  <div style={{ color: 'var(--text-3)', marginTop: 2 }}>{selected.submittedDate} · Upload CCCD + Selfie</div>
                </div>
                <div style={{ padding: '12px 16px', borderRadius: 8, borderLeft: '3px solid #f59e0b', background: 'var(--bg-2)', fontSize: '.78rem' }}>
                  <div style={{ fontWeight: 700 }}>AI Verification</div>
                  <div style={{ color: 'var(--text-3)', marginTop: 2 }}>{selected.submittedDate} · Score: {selected.aiMatchScore}% · {selected.aiNotes.split('|')[0]}</div>
                </div>
                {selected.status !== 'pending' && (
                  <div style={{ padding: '12px 16px', borderRadius: 8, borderLeft: `3px solid ${selected.status === 'approved' ? '#22c55e' : '#ef4444'}`, background: 'var(--bg-2)', fontSize: '.78rem' }}>
                    <div style={{ fontWeight: 700 }}>{selected.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}</div>
                    <div style={{ color: 'var(--text-3)', marginTop: 2 }}>{selected.aiNotes.split('|').pop()?.trim()}</div>
                  </div>
                )}
              </div>
            )},
          ]}
        />
      )}
    </>
  );
}
