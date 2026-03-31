import { useState } from 'react';
import { useI18n } from '@hooks/useI18n';

const levels = [
  { level: 1, name: 'Newcomer', xpRequired: 0, xpNext: 500, color: 'var(--c4-500)', perks: ['Truy cập marketplace', 'XP cơ bản'] },
  { level: 5, name: 'Explorer', xpRequired: 2500, xpNext: 5000, color: 'var(--c5-500)', perks: ['Hoa hồng +2%', 'Badge Explorer'] },
  { level: 10, name: 'Contributor', xpRequired: 8000, xpNext: 15000, color: 'var(--c6-500)', perks: ['Hoa hồng +5%', 'AI Agent access', 'Priority support'] },
  { level: 15, name: 'Influencer', xpRequired: 20000, xpNext: 35000, color: 'var(--c7-500)', perks: ['Hoa hồng +8%', 'Creator Token', 'Live Commerce'] },
  { level: 20, name: 'Champion', xpRequired: 45000, xpNext: 70000, color: 'var(--gold-400)', perks: ['Hoa hồng +12%', 'Governance vote', 'VIP events'] },
  { level: 25, name: 'Legend', xpRequired: 80000, xpNext: 120000, color: 'var(--rose-400)', perks: ['Hoa hồng +15%', 'Revenue share', 'Custom NFT', 'Advisory board'] },
];

const dailyMissions = [
  { id: 1, title: 'Đăng 1 bài review sản phẩm', xp: 50, progress: 1, total: 1, completed: true, icon: '📝' },
  { id: 2, title: 'Chia sẻ link affiliate 3 lần', xp: 30, progress: 2, total: 3, completed: false, icon: '🔗' },
  { id: 3, title: 'Tương tác 5 bài viết cộng đồng', xp: 25, progress: 3, total: 5, completed: false, icon: '💬' },
  { id: 4, title: 'Hoàn thành 1 bài học Academy', xp: 75, progress: 0, total: 1, completed: false, icon: '🎓' },
  { id: 5, title: 'Bán được 1 đơn hàng', xp: 100, progress: 0, total: 1, completed: false, icon: '🛒' },
  { id: 6, title: 'Đăng nhập streak (7 ngày liên tiếp)', xp: 150, progress: 5, total: 7, completed: false, icon: '🔥' },
];

const achievements = [
  { id: 1, name: 'Bước Chân Đầu Tiên', description: 'Hoàn thành đơn hàng đầu tiên', icon: '🎯', unlocked: true, date: '2026-01-20', xp: 200 },
  { id: 2, name: 'Review Master', description: 'Viết 50 bài review sản phẩm', icon: '✍️', unlocked: true, date: '2026-02-15', xp: 500 },
  { id: 3, name: 'Blockchain Pioneer', description: 'Kết nối ví Web3 đầu tiên', icon: '⛓️', unlocked: true, date: '2026-01-22', xp: 300 },
  { id: 4, name: 'Social Butterfly', description: 'Có 100 followers trên platform', icon: '🦋', unlocked: true, date: '2026-03-01', xp: 400 },
  { id: 5, name: 'Top Seller', description: 'Đạt 10M doanh số trong 1 tháng', icon: '💎', unlocked: false, date: null, xp: 1000 },
  { id: 6, name: 'Academy Graduate', description: 'Hoàn thành khóa học 7 ngày', icon: '🎓', unlocked: true, date: '2026-02-28', xp: 500 },
  { id: 7, name: 'DPP Verifier', description: 'Xác minh 20 sản phẩm DPP', icon: '🔍', unlocked: false, date: null, xp: 600 },
  { id: 8, name: 'Live Star', description: 'Livestream 10 phiên bán hàng', icon: '📺', unlocked: false, date: null, xp: 800 },
  { id: 9, name: 'Community Leader', description: 'Giới thiệu 50 thành viên mới', icon: '👑', unlocked: false, date: null, xp: 1500 },
  { id: 10, name: 'Diamond Hands', description: 'Stake token 6 tháng liên tục', icon: '💠', unlocked: false, date: null, xp: 2000 },
];

const leaderboard = [
  { rank: 1, name: 'Minh Hương', level: 23, xp: 78450, badge: '🥇', avatar: 'MH' },
  { rank: 2, name: 'Thảo Linh', level: 21, xp: 65200, badge: '🥈', avatar: 'TL' },
  { rank: 3, name: 'Ngọc Anh', level: 19, xp: 52800, badge: '🥉', avatar: 'NA' },
  { rank: 4, name: 'Văn Hoàng', level: 18, xp: 48300, badge: '4', avatar: 'VH' },
  { rank: 5, name: 'Phương Thảo', level: 17, xp: 43700, badge: '5', avatar: 'PT' },
  { rank: 6, name: 'Đức Minh', level: 16, xp: 39200, badge: '6', avatar: 'DM' },
  { rank: 7, name: 'Hải Yến', level: 15, xp: 35600, badge: '7', avatar: 'HY' },
  { rank: 8, name: 'Tuấn Anh', level: 14, xp: 31400, badge: '8', avatar: 'TA' },
  { rank: 9, name: 'Mai Linh', level: 13, xp: 28900, badge: '9', avatar: 'ML' },
  { rank: 10, name: 'Quang Huy', level: 12, xp: 25100, badge: '10', avatar: 'QH' },
];

export default function Gamification() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements' | 'leaderboard' | 'nft'>('missions');

  const currentXP = 8450;
  const currentLevel = 12;
  const nextLevelXP = 15000;
  const prevLevelXP = 8000;
  const progressPercent = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  return (
    <div style={{ paddingTop: 'var(--topbar-height)', minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* Header */}
      <div style={{
        padding: '12px 0 40px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,191,36,.1) 0%, transparent 60%)',
      }}>
        <div className="container">
          <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
            <h1 className="display-lg gradient-text" style={{ margin: 0, whiteSpace: 'nowrap' }}>
              {t('gamification.title')}
            </h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {/* XP Progress Card */}
        <div className="card card-glow" style={{ padding: 28, marginBottom: 32 }}>
          <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
            <div className="flex gap-16">
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--chakra-flow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                boxShadow: '0 0 0 3px var(--bg-1), 0 0 0 5px var(--c6-500)',
              }}>
                {currentLevel}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Contributor</div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>Level {currentLevel} · {currentXP.toLocaleString()} XP</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>{t('gamification.nextLevel')}</div>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, color: 'var(--c6-300)' }}>
                {(nextLevelXP - currentXP).toLocaleString()} {t('gamification.xpRemaining')}
              </div>
            </div>
          </div>
          <div className="progress-track" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex" style={{ justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '.62rem', color: 'var(--text-4)' }}>Lv{currentLevel}: {prevLevelXP.toLocaleString()} XP</span>
            <span style={{ fontSize: '.62rem', color: 'var(--text-4)' }}>Lv15: {nextLevelXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Level Tiers */}
        <div className="flex gap-8" style={{ marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
          {levels.map(lv => (
            <div key={lv.level} className="card" style={{
              padding: '14px 18px', minWidth: 160, flexShrink: 0, textAlign: 'center',
              borderColor: lv.level <= currentLevel ? lv.color + '40' : undefined,
              opacity: lv.level <= currentLevel ? 1 : 0.5,
            }}>
              <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.1rem', color: lv.color }}>Lv{lv.level}</div>
              <div style={{ fontWeight: 700, fontSize: '.78rem', marginBottom: 4 }}>{lv.name}</div>
              <div style={{ fontSize: '.62rem', color: 'var(--text-3)' }}>{lv.xpRequired.toLocaleString()} XP</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="feature-tabs" style={{ marginBottom: 28 }}>
          {[
            { key: 'missions', label: `📋 ${t('gamification.tabMissions')}` },
            { key: 'achievements', label: `🏆 ${t('gamification.tabAchievements')}` },
            { key: 'leaderboard', label: `🏅 ${t('gamification.tabLeaderboard')}` },
            { key: 'nft', label: '🎖️ Reputation NFT' },
          ].map(tab => (
            <button key={tab.key} className={`feature-tab ${activeTab === tab.key ? 'on' : ''}`} onClick={() => setActiveTab(tab.key as typeof activeTab)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Daily Missions */}
        {activeTab === 'missions' && (
          <div className="flex-col gap-8">
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="label">{t('gamification.dailyMissions')}</span>
              <span className="badge badge-c4">{dailyMissions.filter(m => m.completed).length}/{dailyMissions.length} {t('gamification.completed')}</span>
            </div>
            {dailyMissions.map(mission => (
              <div key={mission.id} className="card" style={{
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                opacity: mission.completed ? 0.6 : 1,
                borderColor: mission.completed ? 'rgba(34,197,94,.2)' : undefined,
              }}>
                <span style={{ fontSize: '1.4rem' }}>{mission.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.85rem', textDecoration: mission.completed ? 'line-through' : 'none' }}>{mission.title}</div>
                  <div className="progress-track" style={{ marginTop: 6, height: 4 }}>
                    <div className="progress-fill" style={{ width: `${(mission.progress / mission.total) * 100}%`, background: mission.completed ? 'var(--c4-500)' : undefined }} />
                  </div>
                  <div style={{ fontSize: '.62rem', color: 'var(--text-3)', marginTop: 4 }}>
                    {mission.progress}/{mission.total}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-gold">+{mission.xp} XP</span>
                  {mission.completed && <div style={{ fontSize: '.65rem', color: 'var(--c4-500)', marginTop: 4 }}>✓ Done</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {activeTab === 'achievements' && (
          <div className="grid-2" style={{ gap: 12 }}>
            {achievements.map(ach => (
              <div key={ach.id} className="card" style={{
                padding: '18px 20px', opacity: ach.unlocked ? 1 : 0.45,
                borderColor: ach.unlocked ? 'rgba(251,191,36,.2)' : undefined,
              }}>
                <div className="flex gap-12">
                  <span style={{ fontSize: '1.8rem' }}>{ach.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{ach.name}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 2 }}>{ach.description}</div>
                    <div className="flex gap-8" style={{ marginTop: 8 }}>
                      <span className="badge badge-gold">+{ach.xp} XP</span>
                      {ach.unlocked && ach.date && <span className="badge badge-c4">{t('gamification.unlocked')} {ach.date}</span>}
                      {!ach.unlocked && <span className="badge badge-c5">{t('gamification.locked')}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{t('gamification.leaderboardTitle')}</span>
            </div>
            {leaderboard.map(user => (
              <div key={user.rank} className="tx-row" style={{ padding: '14px 24px' }}>
                <span style={{ flex: '0 0 40px', fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: user.rank <= 3 ? '1.2rem' : '.9rem' }}>{user.badge}</span>
                <div className="flex gap-8" style={{ flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: user.rank <= 3 ? 'var(--chakra-flow)' : 'var(--bg-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.65rem', fontWeight: 700, color: user.rank <= 3 ? '#fff' : 'var(--text-2)',
                  }}>{user.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{user.name}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--text-3)' }}>Level {user.level}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '.88rem', color: 'var(--c6-300)' }}>
                  {user.xp.toLocaleString()} XP
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reputation NFT */}
        {activeTab === 'nft' && (
          <div>
            <div className="rep-nft" style={{ maxWidth: 400, margin: '0 auto' }}>
              <div className="nft-avatar">
                👤
                <div className="nft-level">{currentLevel}</div>
              </div>
              <div className="verified-seal">✅ Soulbound NFT</div>
              <h3 style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>
                Minh Hương
              </h3>
              <p style={{ fontSize: '.75rem', color: 'var(--text-3)', marginBottom: 14 }}>
                KOC Contributor · {t('gamification.memberSince')} 01/2026
              </p>
              <div className="nft-stats">
                <div className="nft-stat">
                  <div className="nft-stat-val" style={{ color: 'var(--c6-300)' }}>{currentXP.toLocaleString()}</div>
                  <div className="nft-stat-lbl">Total XP</div>
                </div>
                <div className="nft-stat">
                  <div className="nft-stat-val" style={{ color: 'var(--c4-500)' }}>92</div>
                  <div className="nft-stat-lbl">Trust Score</div>
                </div>
                <div className="nft-stat">
                  <div className="nft-stat-val" style={{ color: 'var(--c7-500)' }}>4</div>
                  <div className="nft-stat-lbl">Achievements</div>
                </div>
              </div>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div className="label" style={{ marginBottom: 8 }}>ON-CHAIN DATA</div>
                <div className="flex-col gap-8" style={{ fontSize: '.72rem' }}>
                  <div className="flex" style={{ justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)' }}>Token ID</span>
                    <span className="mono" style={{ color: 'var(--c4-300)' }}>#0847</span>
                  </div>
                  <div className="flex" style={{ justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)' }}>Chain</span>
                    <span className="badge badge-c7">Polygon</span>
                  </div>
                  <div className="flex" style={{ justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-3)' }}>Contract</span>
                    <span className="mono" style={{ color: 'var(--c5-300)' }}>0x9a2f...d83e</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
                {t('gamification.viewExplorer')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
