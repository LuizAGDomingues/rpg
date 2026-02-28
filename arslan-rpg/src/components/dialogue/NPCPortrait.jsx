import styles from './NPCPortrait.module.css';

const MOOD_COLORS = {
  hostile: '#8b1a1a',
  suspicious: '#b8860b',
  neutral: '#4a4a3a',
  cautious: '#6b5b3a',
  friendly: '#2e5d2e',
  fearful: '#3a3a5a',
  mysterious: '#4a2a5a',
};

const MOOD_LABELS = {
  hostile: 'Hostil',
  suspicious: 'Desconfiado',
  neutral: 'Neutro',
  cautious: 'Cauteloso',
  friendly: 'Amigavel',
  fearful: 'Amedrontado',
  mysterious: 'Misterioso',
};

const portraits = {
  blacksmith: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="28" rx="18" ry="20" />
      <rect x="25" y="45" width="50" height="45" rx="5" />
      <rect x="20" y="55" width="15" height="30" rx="3" />
      <rect x="65" y="55" width="15" height="30" rx="3" />
      <rect x="30" y="90" width="16" height="25" rx="3" />
      <rect x="54" y="90" width="16" height="25" rx="3" />
      <rect x="32" y="50" width="36" height="35" rx="2" opacity="0.3" />
    </svg>
  ),
  healer: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="26" rx="16" ry="18" />
      <path d="M40 12 Q50 2 60 12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="30" y="42" width="40" height="48" rx="8" />
      <rect x="22" y="50" width="12" height="25" rx="4" />
      <rect x="66" y="50" width="12" height="25" rx="4" />
      <rect x="34" y="90" width="14" height="22" rx="3" />
      <rect x="52" y="90" width="14" height="22" rx="3" />
      <line x1="44" y1="58" x2="56" y2="58" stroke="var(--bg-dark)" strokeWidth="2" />
      <line x1="50" y1="52" x2="50" y2="64" stroke="var(--bg-dark)" strokeWidth="2" />
    </svg>
  ),
  merchant: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="26" rx="16" ry="18" />
      <path d="M30 15 Q50 5 70 15" fill="currentColor" />
      <ellipse cx="50" cy="14" rx="22" ry="6" />
      <path d="M28 42 L72 42 L68 92 L32 92 Z" />
      <rect x="20" y="48" width="14" height="28" rx="4" />
      <rect x="66" y="48" width="14" height="28" rx="4" />
      <rect x="34" y="90" width="14" height="22" rx="3" />
      <rect x="52" y="90" width="14" height="22" rx="3" />
      <ellipse cx="72" cy="78" rx="10" ry="12" opacity="0.5" />
    </svg>
  ),
  noble: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="28" rx="15" ry="18" />
      <path d="M38 10 L42 18 L50 6 L58 18 L62 10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M26 44 L74 44 L70 92 L30 92 Z" />
      <rect x="18" y="50" width="14" height="30" rx="4" />
      <rect x="68" y="50" width="14" height="30" rx="4" />
      <rect x="34" y="90" width="14" height="24" rx="3" />
      <rect x="52" y="90" width="14" height="24" rx="3" />
      <line x1="40" y1="44" x2="40" y2="88" stroke="var(--bg-dark)" strokeWidth="1" opacity="0.3" />
      <line x1="60" y1="44" x2="60" y2="88" stroke="var(--bg-dark)" strokeWidth="1" opacity="0.3" />
    </svg>
  ),
  soldier: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="28" rx="16" ry="19" />
      <path d="M34 10 L50 4 L66 10 L66 20 L34 20 Z" opacity="0.7" />
      <rect x="28" y="44" width="44" height="46" rx="4" />
      <rect x="18" y="48" width="14" height="32" rx="4" />
      <rect x="68" y="48" width="14" height="32" rx="4" />
      <rect x="34" y="90" width="14" height="24" rx="3" />
      <rect x="52" y="90" width="14" height="24" rx="3" />
      <line x1="28" y1="52" x2="72" y2="52" stroke="var(--bg-dark)" strokeWidth="2" opacity="0.3" />
    </svg>
  ),
  priest: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="26" rx="14" ry="17" />
      <circle cx="50" cy="10" r="4" opacity="0.5" />
      <path d="M28 40 L72 40 L68 100 L32 100 Z" />
      <rect x="22" y="46" width="12" height="28" rx="4" />
      <rect x="66" y="46" width="12" height="28" rx="4" />
      <rect x="36" y="98" width="12" height="18" rx="3" />
      <rect x="52" y="98" width="12" height="18" rx="3" />
      <line x1="44" y1="55" x2="56" y2="55" stroke="var(--bg-dark)" strokeWidth="2" />
      <line x1="50" y1="49" x2="50" y2="61" stroke="var(--bg-dark)" strokeWidth="2" />
    </svg>
  ),
  refugee: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="30" rx="14" ry="16" />
      <path d="M34 42 Q50 38 66 42 L62 96 L38 96 Z" />
      <rect x="24" y="52" width="12" height="24" rx="4" />
      <rect x="64" y="52" width="12" height="24" rx="4" />
      <rect x="38" y="94" width="10" height="20" rx="3" />
      <rect x="52" y="94" width="10" height="20" rx="3" />
      <path d="M36 18 Q50 8 64 18" fill="currentColor" opacity="0.5" />
    </svg>
  ),
  scholar: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="28" rx="15" ry="18" />
      <rect x="40" y="24" width="20" height="4" rx="2" opacity="0.4" />
      <path d="M30 44 L70 44 L66 92 L34 92 Z" />
      <rect x="20" y="48" width="14" height="26" rx="4" />
      <rect x="66" y="48" width="14" height="26" rx="4" />
      <rect x="36" y="90" width="12" height="22" rx="3" />
      <rect x="52" y="90" width="12" height="22" rx="3" />
      <rect x="14" y="68" width="18" height="24" rx="2" opacity="0.4" />
    </svg>
  ),
  commoner: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="28" rx="15" ry="17" />
      <path d="M32 44 L68 44 L64 92 L36 92 Z" />
      <rect x="22" y="50" width="14" height="26" rx="4" />
      <rect x="64" y="50" width="14" height="26" rx="4" />
      <rect x="38" y="90" width="12" height="22" rx="3" />
      <rect x="52" y="90" width="12" height="22" rx="3" />
    </svg>
  ),
  performer: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="26" rx="14" ry="17" />
      <path d="M44 10 Q50 4 56 10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M30 42 Q50 36 70 42 L66 92 L34 92 Z" />
      <path d="M18 48 L30 50 L26 78 L14 74 Z" />
      <path d="M82 48 L70 50 L74 78 L86 74 Z" />
      <rect x="36" y="90" width="12" height="22" rx="3" />
      <rect x="52" y="90" width="12" height="22" rx="3" />
    </svg>
  ),
  mystic: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="28" rx="14" ry="17" />
      <path d="M30 16 Q50 4 70 16 L68 22 L32 22 Z" opacity="0.6" />
      <path d="M26 40 L74 40 L70 100 L30 100 Z" />
      <rect x="18" y="46" width="12" height="28" rx="4" />
      <rect x="70" y="46" width="12" height="28" rx="4" />
      <rect x="36" y="98" width="12" height="18" rx="3" />
      <rect x="52" y="98" width="12" height="18" rx="3" />
      <circle cx="50" cy="60" r="6" opacity="0.3" />
    </svg>
  ),
  warrior: (
    <svg viewBox="0 0 100 120" fill="currentColor">
      <ellipse cx="50" cy="28" rx="17" ry="20" />
      <path d="M32 8 L50 2 L68 8 L68 22 L32 22 Z" opacity="0.7" />
      <rect x="26" y="44" width="48" height="48" rx="4" />
      <rect x="14" y="48" width="16" height="34" rx="4" />
      <rect x="70" y="48" width="16" height="34" rx="4" />
      <rect x="32" y="90" width="16" height="26" rx="3" />
      <rect x="52" y="90" width="16" height="26" rx="3" />
      <rect x="8" y="44" width="4" height="40" rx="1" opacity="0.5" />
    </svg>
  ),
};

export default function NPCPortrait({ portraitType, mood }) {
  const svg = portraits[portraitType] || portraits.commoner;
  const bgColor = MOOD_COLORS[mood] || MOOD_COLORS.neutral;
  const moodLabel = MOOD_LABELS[mood] || 'Neutro';

  return (
    <div className={styles.container}>
      <div className={styles.portrait} style={{ backgroundColor: bgColor }}>
        <div className={styles.svgWrap}>
          {svg}
        </div>
      </div>
      <div className={styles.moodIndicator} style={{ color: bgColor === '#4a4a3a' ? 'var(--text-muted)' : bgColor }}>
        <span className={styles.moodDots}>
          {['hostile', 'suspicious', 'neutral', 'friendly'].map((m) => (
            <span
              key={m}
              className={`${styles.dot} ${mood === m || (mood === 'cautious' && m === 'suspicious') || (mood === 'fearful' && m === 'suspicious') || (mood === 'mysterious' && m === 'neutral') ? styles.dotActive : ''}`}
            />
          ))}
        </span>
        <span className={styles.moodText}>{moodLabel}</span>
      </div>
    </div>
  );
}
