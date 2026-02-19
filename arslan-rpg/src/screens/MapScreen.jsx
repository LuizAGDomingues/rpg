import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import { OrnamentDivider } from '../components/ui/Ornament';
import regions from '../data/world/regions.json';
import styles from './MapScreen.module.css';

export default function MapScreen() {
  const navigate = useNavigate();
  const unlockedRegions = useGameStore((s) => s.world.unlocked_regions);
  const currentRegion = useGameStore((s) => s.world.current_region);
  const setCurrentRegion = useGameStore((s) => s.setCurrentRegion);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Mapa de Pars</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />
      <div className={styles.grid}>
        {regions.map((region) => {
          const unlocked = unlockedRegions.includes(region.id) || !region.unlock_condition;
          const isCurrent = currentRegion === region.id;
          return (
            <Panel key={region.id} className={`${styles.regionCard} ${isCurrent ? styles.current : ''} ${!unlocked ? styles.locked : ''}`}>
              <h3 className={styles.regionName}>{region.name} {isCurrent && '(Atual)'}</h3>
              <p className={styles.regionDesc}>{region.description}</p>
              {unlocked ? (
                <div className={styles.locations}>
                  {region.locations.map((loc) => (
                    <span key={loc} className={styles.location}>{loc.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              ) : (
                <p className={styles.lockText}>Bloqueado</p>
              )}
              {unlocked && !isCurrent && (
                <Button variant="primary" size="sm" onClick={() => setCurrentRegion(region.id)}>
                  Viajar
                </Button>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
