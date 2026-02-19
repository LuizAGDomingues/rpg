import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import { OrnamentDivider, PersianPattern } from '../components/ui/Ornament';
import styles from './TitleScreen.module.css';

export default function TitleScreen() {
  const setGamePhase = useGameStore((s) => s.setGamePhase);
  const resetGame = useGameStore((s) => s.resetGame);
  const playerClass = useGameStore((s) => s.player.class);
  const [showCredits, setShowCredits] = useState(false);

  const hasSave = !!playerClass;

  const handleNewGame = () => {
    resetGame();
    setGamePhase('class_select');
  };

  const handleContinue = () => {
    setGamePhase('playing');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.titleSection}>
          <PersianPattern />
          <h1 className={styles.title}>Arslan</h1>
          <h2 className={styles.subtitle}>A Lenda do Principe</h2>
          <PersianPattern />
        </div>

        <p className={styles.tagline}>
          Um RPG de texto baseado na epopeia de Arslan Senki
        </p>

        <OrnamentDivider />

        <div className={styles.menu}>
          {hasSave && (
            <Button variant="gold" size="lg" fullWidth onClick={handleContinue}>
              Continuar
            </Button>
          )}
          <Button variant="primary" size="lg" fullWidth onClick={handleNewGame}>
            Novo Jogo
          </Button>
          <Button variant="secondary" size="md" fullWidth onClick={() => setShowCredits(!showCredits)}>
            Creditos
          </Button>
        </div>

        {showCredits && (
          <div className={styles.credits}>
            <OrnamentDivider />
            <p>Baseado no manga/anime <strong>Arslan Senki</strong></p>
            <p>de Yoshiki Tanaka e Hiromu Arakawa</p>
            <p className={styles.creditsMuted}>
              Desenvolvido com React + Zustand
            </p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.version}>v1.0.0</span>
      </div>
    </div>
  );
}
