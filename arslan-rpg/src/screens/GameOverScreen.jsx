import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import { OrnamentDivider } from '../components/ui/Ornament';
import styles from './GameOverScreen.module.css';

const BATTLE_LABELS = {
  tunnel_escape: 'Fuga pelo Tunel',
  forest_patrol: 'Patrulha na Floresta',
  ruins_looters: 'Saqueadores nas Ruinas',
  bridge_battle: 'Batalha da Ponte',
  bridge_night: 'Emboscada Noturna',
  road_ambush: 'Emboscada na Estrada',
  messenger_escort: 'Escolta do Mensageiro',
  kashan_road_scouts: 'Batedores de Kashan',
  kashan_siege: 'Cerco de Kashan',
  road_bandits: 'Bandidos na Estrada',
  kashan_escape: 'Fuga de Kashan',
  turan_duel_scene: 'Duelo com Bahram de Turan',
  slave_caravan_scene: 'Caravana de Escravos',
  sindhura_north_battle: 'Batalha ao Norte de Sindhura',
  wall_breach: 'Brecha na Muralha de Ecbatana',
  kharlan_boss_dramatic: 'Confronto com Kharlan',
  final_boss_p1: 'Batalha Final — Silvermask',
  final_boss_p2: 'O Despertar de Silvermask',
};

export default function GameOverScreen() {
  const store = useGameStore();
  const saveInfo = store.getSaveInfo();
  const currentScene = useGameStore((s) => s.currentScene);
  const lastBattle = BATTLE_LABELS[currentScene] || null;

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
        {lastBattle && (
          <p className={styles.lastBattle}>Ultima batalha: <strong>{lastBattle}</strong></p>
        )}
        <OrnamentDivider />

        <div className={styles.options}>
          {saveInfo.auto && (
            <button className={styles.saveSlot} onClick={handleLoadAuto}>
              <span className={styles.slotLabel}>Tentar Novamente — Autosave</span>
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
