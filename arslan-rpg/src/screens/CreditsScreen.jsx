import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { OrnamentDivider } from '../components/ui/Ornament';
import { playTheme } from '../engine/audioEngine';
import styles from './CreditsScreen.module.css';

const CREDITS = [
  { role: 'Historia Original', names: ['Yoshiki Tanaka'] },
  { role: 'Arte (Manga)', names: ['Hiromu Arakawa'] },
  { role: 'Design & Desenvolvimento', names: ['Projeto Arslan RPG'] },
  { role: 'Motor de Narrativa', names: ['React + Zustand + Vite'] },
  { role: 'Audio Procedural', names: ['Web Audio API'] },
  { role: 'Personagens Principais', names: ['Arslan', 'Daryun', 'Narsus', 'Elam', 'Farangis', 'Gieve', 'Jaswant', 'Alfarid'] },
  { role: 'Antagonistas', names: ['Silvermask (Hermes)', 'Kharlan', 'Rajendra'] },
  { role: 'Baseado na obra', names: ['Arslan Senki — O Heroico Lendario'] },
];

export default function CreditsScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    playTheme('exploration');

    const handleKey = (e) => {
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.scrollWrapper}>
        <div className={styles.scrollContent}>
          <h1 className={styles.mainTitle}>ARSLAN</h1>
          <h2 className={styles.mainSubtitle}>O Principe do Deserto</h2>

          <OrnamentDivider />

          {CREDITS.map((section, i) => (
            <div key={i} className={styles.section}>
              <p className={styles.role}>{section.role}</p>
              {section.names.map((name, j) => (
                <p key={j} className={styles.name}>{name}</p>
              ))}
            </div>
          ))}

          <OrnamentDivider />

          <p className={styles.thanks}>
            Agradecimentos especiais a todos os fas de Arslan Senki
            que tornaram esta aventura possivel.
          </p>

          <p className={styles.version}>v1.0.0</p>
        </div>
      </div>

      <div className={styles.backBtn}>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          ← Voltar ao Menu
        </Button>
        <span className={styles.escHint}>ESC</span>
      </div>
    </div>
  );
}
