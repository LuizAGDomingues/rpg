import { useState } from 'react';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import StatRow from '../components/ui/StatRow';
import { OrnamentDivider } from '../components/ui/Ornament';
import warriorData from '../data/classes/warrior.json';
import diplomatData from '../data/classes/diplomat.json';
import strategistData from '../data/classes/strategist.json';
import { getSkillById } from '../engine/skillEngine';
import daryunData from '../data/characters/daryun.json';
import styles from './ClassSelectScreen.module.css';

const classes = [warriorData, diplomatData, strategistData];

const STARTING_EQUIPMENT = {
  warrior: {
    weapon: { id: 'sword_iron', name: 'Espada de Ferro', type: 'weapon', damage: '1d8+1', bonus_atk: 1 },
    armor: { id: 'armor_chain', name: 'Cota de Malha', type: 'armor', ca_bonus: 4 },
    shield: { id: 'shield_wooden', name: 'Escudo de Madeira', type: 'shield', ca_bonus: 1 },
  },
  diplomat: {
    weapon: { id: 'sword_light', name: 'Espada Leve', type: 'weapon', damage: '1d6+1', bonus_atk: 1 },
    armor: { id: 'armor_leather', name: 'Armadura de Couro', type: 'armor', ca_bonus: 2 },
    shield: null,
  },
  strategist: {
    weapon: { id: 'sword_light', name: 'Espada Leve', type: 'weapon', damage: '1d6+1', bonus_atk: 1 },
    armor: { id: 'armor_leather', name: 'Armadura de Couro', type: 'armor', ca_bonus: 2 },
    shield: null,
  },
};

export default function ClassSelectScreen() {
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const store = useGameStore();

  const handleConfirm = () => {
    if (!selected) return;
    store.setPlayerClass(selected);

    // Equip starting gear
    const gear = STARTING_EQUIPMENT[selected.id];
    if (gear) {
      if (gear.weapon) store.equipItem('weapon', gear.weapon);
      if (gear.armor) store.equipItem('armor', gear.armor);
      if (gear.shield) store.equipItem('shield', gear.shield);
    }

    // Auto-recruit Daryun at the start (he's with Arslan from the beginning)
    store.recruitGeneral({ ...daryunData, hp_base: daryunData.hp });
    store.setNarrativeFlag('daryun_recruited', true);

    store.setCurrentScene('prologue_start');
    store.setGamePhase('playing');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Escolha sua Classe</h1>
        <p className={styles.subtitle}>
          Esta escolha moldara os atributos, habilidades e dialogos de Arslan ao longo da jornada.
          <br />
          <strong>Irreversivel.</strong>
        </p>
      </div>

      <OrnamentDivider />

      <div className={styles.grid}>
        {classes.map((cls) => (
          <div
            key={cls.id}
            className={`${styles.classCard} ${selected?.id === cls.id ? styles.selected : ''}`}
            onClick={() => { setSelected(cls); setConfirming(false); }}
          >
            <div className={styles.classIcon}>
              <ClassIcon classId={cls.id} />
            </div>
            <h2 className={styles.className}>{cls.name}</h2>
            <p className={styles.classDesc}>{cls.description}</p>

            <div className={styles.statsSection}>
              {Object.entries(cls.attributes).map(([attr, val]) => (
                <StatRow key={attr} attr={attr} value={val} compact />
              ))}
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>HP Base</span>
                <span className={styles.infoValue}>{cls.hp_base}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>PA/turno</span>
                <span className={styles.infoValue}>{cls.pa_base}</span>
              </div>
            </div>

            <div className={styles.skillsSection}>
              <span className={styles.skillsLabel}>Habilidades Iniciais:</span>
              <ul className={styles.skillsList}>
                {cls.starting_skills.map((skillId) => {
                  const skill = getSkillById(skillId);
                  if (!skill) return <li key={skillId}>{skillId}</li>;
                  return (
                    <li key={skillId} className={styles.skillCard}>
                      <span className={styles.skillCardName}>{skill.name} <span className={styles.skillCardPA}>({skill.pa_cost} PA)</span></span>
                      <span className={styles.skillCardDesc}>{skill.description}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className={styles.flavor}>{cls.flavor}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.confirmSection}>
          <OrnamentDivider />
          {!confirming ? (
            <Button variant="gold" size="lg" onClick={() => setConfirming(true)}>
              Escolher {selected.name}
            </Button>
          ) : (
            <div className={styles.confirmDialog}>
              <p>Confirmar <strong>{selected.name}</strong>? Esta escolha e irreversivel.</p>
              <div className={styles.confirmButtons}>
                <Button variant="gold" size="md" onClick={handleConfirm}>
                  Confirmar
                </Button>
                <Button variant="secondary" size="md" onClick={() => setConfirming(false)}>
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClassIcon({ classId }) {
  const icons = {
    warrior: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M24 4 L24 32 M18 8 L30 8 M16 32 L32 32 M20 32 L20 44 M28 32 L28 44 M16 44 L32 44" />
      </svg>
    ),
    diplomat: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="24" cy="16" r="8" />
        <path d="M12 44 Q12 28 24 28 Q36 28 36 44" />
        <path d="M20 16 L28 16 M24 12 L24 20" />
      </svg>
    ),
    strategist: (
      <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="8" width="32" height="32" rx="2" />
        <line x1="8" y1="24" x2="40" y2="24" />
        <line x1="24" y1="8" x2="24" y2="40" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <circle cx="32" cy="32" r="3" />
        <path d="M16 16 L32 32" strokeDasharray="2 2" />
      </svg>
    ),
  };
  return icons[classId] || null;
}
