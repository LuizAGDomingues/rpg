import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import { OrnamentDivider } from '../components/ui/Ornament';
import styles from './GameOverScreen.module.css';

export default function GameOverScreen() {
  const store = useGameStore();
  const saveInfo = store.getSaveInfo();

  const handleLoadAuto = () => {
    const ok = store.loadFromSlot('auto');
    if (!ok) alert('Sem autosave disponivel.');
  };

  const handleLoadSlot = (slot) => {
    const ok = store.loadFromSlot(slot);
    if (!ok) alert(`Sem save no Slot ${slot}.`);
  };

  const handleMenu = () => {
    store.resetGame();
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Arslan caiu.</h1>
        <p className={styles.subtitle}>A esperanca de Pars se apaga... por ora.</p>
        <OrnamentDivider />

        <div className={styles.options}>
          {saveInfo.auto && (
            <button className={styles.saveSlot} onClick={handleLoadAuto}>
              <span className={styles.slotLabel}>Carregar Autosave</span>
              <span className={styles.slotInfo}>
                Ato {saveInfo.auto.act} · Nv. {saveInfo.auto.playerLevel} · {formatTime(saveInfo.auto.timestamp)}
              </span>
            </button>
          )}
          {['1', '2', '3'].map((slot) => saveInfo[slot] && (
            <button key={slot} className={styles.saveSlot} onClick={() => handleLoadSlot(slot)}>
              <span className={styles.slotLabel}>Slot {slot}</span>
              <span className={styles.slotInfo}>
                Ato {saveInfo[slot].act} · Nv. {saveInfo[slot].playerLevel} · {formatTime(saveInfo[slot].timestamp)}
              </span>
            </button>
          ))}
          {!saveInfo.auto && !saveInfo['1'] && !saveInfo['2'] && !saveInfo['3'] && (
            <p className={styles.noSave}>Nenhum save disponivel.</p>
          )}

          <OrnamentDivider />
          <Button variant="secondary" onClick={handleMenu}>Voltar ao Menu Principal</Button>
        </div>
      </div>
    </div>
  );
}
