import { useState } from 'react';
import { useI18n } from '@hooks/useI18n';

interface Lesson {
  titleKey: string;
  durationMin: number;
  typeKey: string;
  descriptionKey: string;
  topicKeys: string[];
}

interface DayData {
  day: number;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

const curriculum: DayData[] = [
  {
    day: 1, titleKey: 'academy.day1.title', subtitleKey: 'academy.day1.subtitle', icon: '🌱', color: 'var(--c4-500)',
    lessons: [
      { titleKey: 'academy.d1.l1.title', durationMin: 20, typeKey: 'academy.type.video', descriptionKey: 'academy.d1.l1.desc', topicKeys: ['academy.d1.l1.t1', 'academy.d1.l1.t2', 'academy.d1.l1.t3', 'academy.d1.l1.t4'] },
      { titleKey: 'academy.d1.l2.title', durationMin: 15, typeKey: 'academy.type.video', descriptionKey: 'academy.d1.l2.desc', topicKeys: ['academy.d1.l2.t1', 'academy.d1.l2.t2', 'academy.d1.l2.t3', 'academy.d1.l2.t4'] },
      { titleKey: 'academy.d1.l3.title', durationMin: 10, typeKey: 'academy.type.quiz', descriptionKey: 'academy.d1.l3.desc', topicKeys: ['academy.d1.l3.t1', 'academy.d1.l3.t2'] },
    ]
  },
  {
    day: 2, titleKey: 'academy.day2.title', subtitleKey: 'academy.day2.subtitle', icon: '📜', color: 'var(--c5-500)',
    lessons: [
      { titleKey: 'academy.d2.l1.title', durationMin: 25, typeKey: 'academy.type.video', descriptionKey: 'academy.d2.l1.desc', topicKeys: ['academy.d2.l1.t1', 'academy.d2.l1.t2', 'academy.d2.l1.t3', 'academy.d2.l1.t4'] },
      { titleKey: 'academy.d2.l2.title', durationMin: 20, typeKey: 'academy.type.lab', descriptionKey: 'academy.d2.l2.desc', topicKeys: ['academy.d2.l2.t1', 'academy.d2.l2.t2', 'academy.d2.l2.t3', 'academy.d2.l2.t4'] },
      { titleKey: 'academy.d2.l3.title', durationMin: 10, typeKey: 'academy.type.quiz', descriptionKey: 'academy.d2.l3.desc', topicKeys: ['academy.d2.l3.t1', 'academy.d2.l3.t2'] },
    ]
  },
  {
    day: 3, titleKey: 'academy.day3.title', subtitleKey: 'academy.day3.subtitle', icon: '📢', color: 'var(--c6-500)',
    lessons: [
      { titleKey: 'academy.d3.l1.title', durationMin: 30, typeKey: 'academy.type.video', descriptionKey: 'academy.d3.l1.desc', topicKeys: ['Storytelling', 'Visual content', 'Video review', 'academy.d3.l1.t4'] },
      { titleKey: 'academy.d3.l2.title', durationMin: 25, typeKey: 'academy.type.video', descriptionKey: 'academy.d3.l2.desc', topicKeys: ['Niche selection', 'Target audience', 'Brand voice', 'Consistency'] },
      { titleKey: 'academy.d3.l3.title', durationMin: 45, typeKey: 'academy.type.lab', descriptionKey: 'academy.d3.l3.desc', topicKeys: ['Template review', 'academy.d3.l3.t2', 'academy.d3.l3.t3', '+100 XP'] },
    ]
  },
  {
    day: 4, titleKey: 'academy.day4.title', subtitleKey: 'academy.day4.subtitle', icon: '💰', color: 'var(--c7-500)',
    lessons: [
      { titleKey: 'academy.d4.l1.title', durationMin: 20, typeKey: 'academy.type.video', descriptionKey: 'academy.d4.l1.desc', topicKeys: ['Commission tiers', 'Referral bonus', 'Performance bonus', 'Smart contract payout'] },
      { titleKey: 'academy.d4.l2.title', durationMin: 25, typeKey: 'academy.type.video', descriptionKey: 'academy.d4.l2.desc', topicKeys: ['Product selection', 'Audience targeting', 'Timing strategy', 'Cross-sell & Up-sell'] },
      { titleKey: 'academy.d4.l3.title', durationMin: 15, typeKey: 'academy.type.quiz', descriptionKey: 'academy.d4.l3.desc', topicKeys: ['Case study analysis', '+100 XP'] },
    ]
  },
  {
    day: 5, titleKey: 'academy.day5.title', subtitleKey: 'academy.day5.subtitle', icon: '🤖', color: 'var(--c6-300)',
    lessons: [
      { titleKey: 'academy.d5.l1.title', durationMin: 30, typeKey: 'academy.type.video', descriptionKey: 'academy.d5.l1.desc', topicKeys: ['Content AI', 'Analytics AI', 'Customer Service AI', 'Pricing AI'] },
      { titleKey: 'academy.d5.l2.title', durationMin: 40, typeKey: 'academy.type.lab', descriptionKey: 'academy.d5.l2.desc', topicKeys: ['AI Content Generator', 'AI Hashtag Optimizer', 'AI Performance Analyzer', 'AI Customer Bot'] },
      { titleKey: 'academy.d5.l3.title', durationMin: 30, typeKey: 'academy.type.lab', descriptionKey: 'academy.d5.l3.desc', topicKeys: ['Campaign planning', 'AI-assisted content', '+150 XP'] },
    ]
  },
  {
    day: 6, titleKey: 'academy.day6.title', subtitleKey: 'academy.day6.subtitle', icon: '🎮', color: 'var(--rose-400)',
    lessons: [
      { titleKey: 'academy.d6.l1.title', durationMin: 20, typeKey: 'academy.type.video', descriptionKey: 'academy.d6.l1.desc', topicKeys: ['XP sources', 'Level benefits', 'Daily missions', 'Achievements'] },
      { titleKey: 'academy.d6.l2.title', durationMin: 25, typeKey: 'academy.type.video', descriptionKey: 'academy.d6.l2.desc', topicKeys: ['Soulbound NFT', 'Reputation score', 'Trust ranking', 'NFT marketplace'] },
      { titleKey: 'academy.d6.l3.title', durationMin: 15, typeKey: 'academy.type.video', descriptionKey: 'academy.d6.l3.desc', topicKeys: ['Daily optimization', 'Mission stacking', 'Community engagement', '+100 XP'] },
    ]
  },
  {
    day: 7, titleKey: 'academy.day7.title', subtitleKey: 'academy.day7.subtitle', icon: '🎓', color: 'var(--gold-400)',
    lessons: [
      { titleKey: 'academy.d7.l1.title', durationMin: 20, typeKey: 'academy.type.video', descriptionKey: 'academy.d7.l1.desc', topicKeys: ['Key takeaways', 'Roadmap ahead', 'Community support', 'Resources'] },
      { titleKey: 'academy.d7.l2.title', durationMin: 30, typeKey: 'academy.type.exam', descriptionKey: 'academy.d7.l2.desc', topicKeys: ['academy.d7.l2.t1', 'academy.d7.l2.t2', 'academy.d7.l2.t3', '+500 XP'] },
      { titleKey: 'academy.d7.l3.title', durationMin: 10, typeKey: 'academy.type.ceremony', descriptionKey: 'academy.d7.l3.desc', topicKeys: ['NFT Certificate mint', 'KOC Badge', 'Welcome bonus', 'Community invite'] },
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

const typeIconMap: Record<string, string> = {
  'academy.type.video': '🎬',
  'academy.type.lab': '🔬',
  'academy.type.quiz': '📋',
  'academy.type.exam': '📝',
  'academy.type.ceremony': '🎉',
};

export default function Academy() {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const { t } = useI18n();

  return (
    <div style={{ paddingTop: 'var(--topbar-height)', minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* Header */}
      <div style={{
        padding: '12px 0 40px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,.12) 0%, transparent 60%)'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
            <h1 className="display-lg gradient-text" style={{ margin: 0, whiteSpace: 'nowrap' }}>
              {t('academy.title')}
            </h1>
          </div>
          <div className="flex gap-16" style={{ justifyContent: 'center', marginTop: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c6-300)' }}>7</div>
              <div className="label">{t('academy.daysLabel')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c5-500)' }}>21</div>
              <div className="label">{t('academy.lessonsLabel')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c4-500)' }}>1,075</div>
              <div className="label">{t('academy.totalXP')}</div>
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
            <span style={{ fontWeight: 700, fontSize: '.82rem' }}>{t('academy.progress')}</span>
            <span className="badge badge-c6">{t('academy.dayLabel')} 1/7</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '14%' }} />
          </div>
          <div style={{ fontSize: '.65rem', color: 'var(--text-3)', marginTop: 6 }}>3/21 {t('academy.lessonsCompleted')}</div>
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
                  <div className="label" style={{ marginBottom: 4, color: day.color }}>{t('academy.dayLabel')} {day.day}</div>
                  <div style={{ fontWeight: 700, fontSize: '.92rem' }}>{t(day.titleKey)}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{t(day.subtitleKey)}</div>
                </div>
                <div className="flex gap-8">
                  <span className="badge badge-c5">{day.lessons.length} {t('academy.lessonsCount')}</span>
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
                              <span>{typeIconMap[lesson.typeKey] || '📄'}</span>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{t(lesson.titleKey)}</div>
                                <div className="flex gap-8" style={{ marginTop: 4 }}>
                                  <span className="badge badge-c5">{t(lesson.typeKey)}</span>
                                  <span style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>⏱ {lesson.durationMin} {t('academy.minutes')}</span>
                                </div>
                              </div>
                            </div>
                            <span style={{ fontSize: '.85rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'var(--t-base)' }}>▾</span>
                          </div>

                          {isExpanded && (
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                              <p style={{ fontSize: '.78rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>
                                {t(lesson.descriptionKey)}
                              </p>
                              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                                {lesson.topicKeys.map((topic, ti) => (
                                  <span key={ti} className="badge badge-c6">{t(topic)}</span>
                                ))}
                              </div>
                              <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
                                {t('academy.startLesson')}
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
