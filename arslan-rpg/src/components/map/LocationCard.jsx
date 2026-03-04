import { useState } from 'react';
import styles from './LocationCard.module.css';

export default function LocationCard({ location, isCurrent, isVisited, isLocked, onClick }) {
  const [imgError, setImgError] = useState(false);
  const hasNPCs = location.npcs && location.npcs.length > 0;

  return (
    <button
      className={[
        styles.card,
        isCurrent ? styles.current : '',
        isVisited ? styles.visited : '',
        isLocked ? styles.locked : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={isLocked}
    >
      {!imgError && (
        <img
          src={`/images/locations/${location.id}.jpg`}
          alt={location.name}
          className={styles.locationImg}
          onError={() => setImgError(true)}
        />
      )}
      <div className={styles.header}>
        <h4 className={styles.name}>{location.name}</h4>
        <div className={styles.icons}>
          {location.shop && <span title="Loja">🛒</span>}
          {location.rest && <span title="Descanso">💤</span>}
          {hasNPCs && <span title="NPCs">👤</span>}
        </div>
      </div>
      <p className={styles.desc}>{location.description}</p>
      {isCurrent && <span className={styles.badge}>Voce esta aqui</span>}
      {isLocked && <span className={styles.lockBadge}>Bloqueado</span>}
    </button>
  );
}
