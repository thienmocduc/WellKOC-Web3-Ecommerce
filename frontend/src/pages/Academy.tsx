import { useState } from 'react';

interface Lesson {
  title: string;
  duration: string;
  type: string;
  description: string;
  topics: string[];
}

interface DayData {
  day: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

const curriculum: DayData[] = [
  {
    day: 1, title: 'Nhập Môn Web3 Commerce', subtitle: 'Nền tảng kiến thức blockchain & social commerce', icon: '🌱', color: 'var(--c4-500)',
    lessons: [
      { title: 'Web3 là gì? Tại sao quan trọng?', duration: '20 phút', type: 'Video', description: 'Tổng quan về Web3, blockchain, và cách nó thay đổi thương mại điện tử truyền thống.', topics: ['Blockchain cơ bản', 'Smart Contract', 'DeFi & NFT', 'So sánh Web2 vs Web3'] },
      { title: 'Giới thiệu WellKOC Platform', duration: '15 phút', type: 'Video', description: 'Hướng dẫn tổng quan về nền tảng WellKOC và cách tham gia.', topics: ['Tạo tài khoản', 'Kết nối ví', 'Giao diện platform', 'Vai trò trong hệ sinh thái'] },
      { title: 'Quiz Ngày 1', duration: '10 phút', type: 'Quiz', description: 'Kiểm tra kiến thức cơ bản về Web3 và WellKOC.', topics: ['10 câu hỏi trắc nghiệm', '+50 XP khi hoàn thành'] },
    ]
  },
  {
    day: 2, title: 'Digital Product Passport (DPP)', subtitle: 'Hiểu về chứng nhận sản phẩm blockchain', icon: '📜', color: 'var(--c5-500)',
    lessons: [
      { title: 'DPP là gì và tại sao cần thiết?', duration: '25 phút', type: 'Video', description: 'Tìm hiểu về Digital Product Passport và cách nó đảm bảo nguồn gốc sản phẩm.', topics: ['EU DPP Regulation', 'Supply chain transparency', 'QR Code verification', 'On-chain vs Off-chain'] },
      { title: 'Thực hành: Đọc DPP sản phẩm', duration: '20 phút', type: 'Lab', description: 'Hướng dẫn cách đọc và xác minh DPP của một sản phẩm thực tế.', topics: ['Scan QR code', 'Xác minh on-chain', 'Đọc supply chain', 'ZKP verification'] },
      { title: 'Quiz Ngày 2', duration: '10 phút', type: 'Quiz', description: 'Kiểm tra kiến thức về DPP.', topics: ['8 câu hỏi', '+75 XP khi hoàn thành'] },
    ]
  },
  {
    day: 3, title: 'KOC Marketing Fundamentals', subtitle: 'Kỹ năng tạo nội dung và tiếp thị', icon: '📢', color: 'var(--c6-500)',
    lessons: [
      { title: 'Content Marketing cho KOC', duration: '30 phút', type: 'Video', description: 'Chiến lược tạo nội dung hấp dẫn để quảng bá sản phẩm hiệu quả.', topics: ['Storytelling', 'Visual content', 'Video review', 'SEO cơ bản'] },
      { title: 'Xây dựng thương hiệu cá nhân', duration: '25 phút', type: 'Video', description: 'Cách xây dựng và phát triển personal brand trên social media.', topics: ['Niche selection', 'Target audience', 'Brand voice', 'Consistency'] },
      { title: 'Bài tập: Tạo content đầu tiên', duration: '45 phút', type: 'Lab', description: 'Thực hành tạo bài review sản phẩm đầu tiên.', topics: ['Template review', 'Chụp ảnh sản phẩm', 'Viết caption', '+100 XP'] },
    ]
  },
  {
    day: 4, title: 'Hệ Thống Hoa Hồng', subtitle: 'Cách tính và tối ưu thu nhập', icon: '💰', color: 'var(--c7-500)',
    lessons: [
      { title: 'Cấu trúc hoa hồng WellKOC', duration: '20 phút', type: 'Video', description: 'Chi tiết về các mức hoa hồng, tier system, và cách tối ưu thu nhập.', topics: ['Commission tiers', 'Referral bonus', 'Performance bonus', 'Smart contract payout'] },
      { title: 'Chiến lược tối ưu thu nhập', duration: '25 phút', type: 'Video', description: 'Các chiến lược để tăng tỷ lệ chuyển đổi và thu nhập.', topics: ['Product selection', 'Audience targeting', 'Timing strategy', 'Cross-sell & Up-sell'] },
      { title: 'Quiz & Case Study', duration: '15 phút', type: 'Quiz', description: 'Phân tích case study thực tế từ top KOC.', topics: ['Case study analysis', '+100 XP khi hoàn thành'] },
    ]
  },
  {
    day: 5, title: 'AI Agents & Automation', subtitle: 'Sử dụng 333 AI agents hỗ trợ', icon: '🤖', color: 'var(--c6-300)',
    lessons: [
      { title: 'Giới thiệu 333 AI Agents', duration: '30 phút', type: 'Video', description: 'Tổng quan về hệ thống 333 AI agents và cách chúng hỗ trợ KOC.', topics: ['Content AI', 'Analytics AI', 'Customer Service AI', 'Pricing AI'] },
      { title: 'Thực hành sử dụng AI tools', duration: '40 phút', type: 'Lab', description: 'Hands-on với các AI agent phổ biến nhất.', topics: ['AI Content Generator', 'AI Hashtag Optimizer', 'AI Performance Analyzer', 'AI Customer Bot'] },
      { title: 'Bài tập: Tạo chiến dịch với AI', duration: '30 phút', type: 'Lab', description: 'Sử dụng AI để lên kế hoạch và tạo nội dung cho chiến dịch.', topics: ['Campaign planning', 'AI-assisted content', '+150 XP'] },
    ]
  },
  {
    day: 6, title: 'Gamification & Reputation', subtitle: 'XP, NFT và hệ thống danh tiếng', icon: '🎮', color: 'var(--rose-400)',
    lessons: [
      { title: 'Hệ thống XP & Level', duration: '20 phút', type: 'Video', description: 'Cách hoạt động của hệ thống XP, level, và benefits tại mỗi cấp.', topics: ['XP sources', 'Level benefits', 'Daily missions', 'Achievements'] },
      { title: 'Reputation NFT', duration: '25 phút', type: 'Video', description: 'NFT danh tiếng - cách nhận, ý nghĩa, và lợi ích.', topics: ['Soulbound NFT', 'Reputation score', 'Trust ranking', 'NFT marketplace'] },
      { title: 'Chiến lược leo rank', duration: '15 phút', type: 'Video', description: 'Chiến lược để leo rank nhanh và hiệu quả.', topics: ['Daily optimization', 'Mission stacking', 'Community engagement', '+100 XP'] },
    ]
  },
  {
    day: 7, title: 'Tốt Nghiệp & Khởi Động', subtitle: 'Tổng kết và bắt đầu hành trình KOC', icon: '🎓', color: 'var(--gold-400)',
    lessons: [
      { title: 'Tổng kết 7 ngày', duration: '20 phút', type: 'Video', description: 'Review toàn bộ kiến thức đã học và lộ trình phát triển tiếp theo.', topics: ['Key takeaways', 'Roadmap ahead', 'Community support', 'Resources'] },
      { title: 'Bài thi tốt nghiệp', duration: '30 phút', type: 'Exam', description: 'Bài thi cuối khóa để nhận chứng chỉ KOC Academy.', topics: ['30 câu hỏi', 'Yêu cầu 70% đúng', 'Nhận NFT Certificate', '+500 XP'] },
      { title: 'Nhận chứng chỉ & NFT', duration: '10 phút', type: 'Ceremony', description: 'Nhận chứng chỉ hoàn thành và Reputation NFT đầu tiên.', topics: ['NFT Certificate mint', 'KOC Badge', 'Welcome bonus', 'Community invite'] },
    ]
  },
];

const typeIcons: Record<string, string> = {
  Video: '🎬',
  Lab: '🔬',
  Quiz: '📋',
  Exam: '📝',
  Ceremony: '🎉',
};

export default function Academy() {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  return (
    <div style={{ paddingTop: 'var(--topbar-height)', minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* Header */}
      <div style={{
        padding: '60px 0 40px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,.12) 0%, transparent 60%)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-badge">🎓 KOC ACADEMY</div>
          <h1 className="display-lg gradient-text" style={{ marginBottom: 12 }}>
            Khóa Học 7 Ngày
          </h1>
          <p style={{ color: 'var(--text-3)', maxWidth: 580, margin: '0 auto', fontSize: '.88rem' }}>
            Từ zero đến KOC chuyên nghiệp. Học blockchain, marketing, AI tools
            và bắt đầu kiếm thu nhập từ social commerce.
          </p>
          <div className="flex gap-16" style={{ justifyContent: 'center', marginTop: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c6-300)' }}>7</div>
              <div className="label">Ngày học</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c5-500)' }}>21</div>
              <div className="label">Bài học</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c4-500)' }}>1,075</div>
              <div className="label">XP tổng</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c7-500)' }}>1</div>
              <div className="label">NFT Certificate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 860 }}>
        {/* Progress */}
        <div className="card" style={{ padding: '16px 24px', marginBottom: 32 }}>
          <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: '.82rem' }}>Tiến độ khóa học</span>
            <span className="badge badge-c6">Ngày 1/7</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '14%' }} />
          </div>
          <div style={{ fontSize: '.65rem', color: 'var(--text-3)', marginTop: 6 }}>3/21 bài học hoàn thành</div>
        </div>

        {/* Day Cards */}
        <div className="flex-col gap-16">
          {curriculum.map((day) => (
            <div key={day.day} className="card" style={{ overflow: 'hidden', borderColor: expandedDay === day.day ? 'var(--border-glow)' : undefined }}>
              {/* Day Header */}
              <div
                style={{
                  padding: '20px 24px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 16,
                  borderBottom: expandedDay === day.day ? '1px solid var(--border)' : 'none',
                }}
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${day.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', flexShrink: 0
                }}>
                  {day.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 4, color: day.color }}>NGÀY {day.day}</div>
                  <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{day.title}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{day.subtitle}</div>
                </div>
                <div className="flex gap-8">
                  <span className="badge badge-c5">{day.lessons.length} bài</span>
                  <span style={{ fontSize: '1.1rem', transform: expandedDay === day.day ? 'rotate(180deg)' : 'rotate(0)', transition: 'var(--t-base)' }}>▾</span>
                </div>
              </div>

              {/* Lessons */}
              {expandedDay === day.day && (
                <div style={{ padding: '12px 24px 20px' }}>
                  {day.lessons.map((lesson, li) => {
                    const lessonKey = `${day.day}-${li}`;
                    const isExpanded = expandedLesson === lessonKey;
                    return (
                      <div key={li} style={{ marginBottom: li < day.lessons.length - 1 ? 8 : 0 }}>
                        <div
                          className="card"
                          style={{
                            padding: '14px 18px', cursor: 'pointer',
                            background: 'var(--bg-2)',
                            borderColor: isExpanded ? 'var(--border-glow)' : undefined,
                          }}
                          onClick={() => setExpandedLesson(isExpanded ? null : lessonKey)}
                        >
                          <div className="flex" style={{ justifyContent: 'space-between' }}>
                            <div className="flex gap-12">
                              <span>{typeIcons[lesson.type] || '📄'}</span>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{lesson.title}</div>
                                <div className="flex gap-8" style={{ marginTop: 4 }}>
                                  <span className="badge badge-c5">{lesson.type}</span>
                                  <span style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>⏱ {lesson.duration}</span>
                                </div>
                              </div>
                            </div>
                            <span style={{ fontSize: '.85rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'var(--t-base)' }}>▾</span>
                          </div>

                          {isExpanded && (
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                              <p style={{ fontSize: '.78rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>
                                {lesson.description}
                              </p>
                              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                                {lesson.topics.map((topic, ti) => (
                                  <span key={ti} className="badge badge-c6">{topic}</span>
                                ))}
                              </div>
                              <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
                                Bắt đầu học
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
