import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import StatRow from '../components/ui/StatRow';
import ProgressBar from '../components/ui/ProgressBar';
import { OrnamentDivider } from '../components/ui/Ornament';
import styles from './PartyScreen.module.css';

export default function PartyScreen() {
  const navigate = useNavigate();
  const player = useGameStore((s) => s.player);
  const generals = useGameStore((s) => s.recruited_generals);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Grupo</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />

      <Panel title="Arslan">
        <div className={styles.charInfo}>
          <div className={styles.charMeta}>
            <span>Classe: {player.class === 'warrior' ? 'Guerreiro' : player.class === 'diplomat' ? 'Diplomata' : player.class === 'strategist' ? 'Estrategista' : '-'}</span>
            <span>Nivel: {player.level}</span>
          </div>
          <ProgressBar current={player.hp} max={player.hp_max} color="var(--hp-green)" label="HP" />
          <ProgressBar current={player.xp} max={player.xp_next} color="var(--gold)" label="XP" height={4} />
          <div className={styles.stats}>
            {Object.entries(player.attributes).map(([attr, val]) => (
              <StatRow key={attr} attr={attr} value={val} compact />
            ))}
          </div>
          {player.skills.length > 0 && (
            <div className={styles.skills}>
              <h4>Habilidades</h4>
              {player.skills.map((s, i) => <span key={i} className={styles.skillTag}>{s}</span>)}
            </div>
          )}
        </div>
      </Panel>

      {generals.length === 0 ? (
        <p className={styles.empty}>Nenhum general recrutado ainda.</p>
      ) : (
        generals.map((gen) => (
          <Panel key={gen.id} title={`${gen.name} — ${gen.title}`}>
            <div className={styles.charInfo}>
              <span className={styles.role}>{gen.role}</span>
              <ProgressBar current={gen.current_hp} max={gen.hp_max} color="var(--hp-green)" label="HP" />
              <div className={styles.stats}>
                {Object.entries(gen.attributes).map(([attr, val]) => (
                  <StatRow key={attr} attr={attr} value={val} compact />
                ))}
              </div>
            </div>
          </Panel>
        ))
      )}
    </div>
  );
}
