import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import { checkCondition } from '../utils/conditions';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import { OrnamentDivider } from '../components/ui/Ornament';
import LocationCard from '../components/map/LocationCard';
import LocationPanel from '../components/map/LocationPanel';
import regions from '../data/world/regions.json';
import locationsData from '../data/world/locations.json';
import styles from './MapScreen.module.css';

export default function MapScreen() {
  const navigate = useNavigate();
  const gameState = useGameStore();
  const unlockedRegions = useGameStore((s) => s.world.unlocked_regions);
  const currentRegion = useGameStore((s) => s.world.current_region);
  const currentLocation = useGameStore((s) => s.world.current_location);
  const visitedLocations = useGameStore((s) => s.world.visited_locations);
  const setCurrentRegion = useGameStore((s) => s.setCurrentRegion);
  const setCurrentLocation = useGameStore((s) => s.setCurrentLocation);

  const [selectedLocation, setSelectedLocation] = useState(null);

  // Get locations for the current region
  const regionLocations = useMemo(() => {
    return locationsData.filter((loc) => loc.region === currentRegion);
  }, [currentRegion]);

  const handleSelectLocation = (location) => {
    setCurrentLocation(location.id);
    if (location.arrival_scene) {
      useGameStore.getState().setCurrentScene(location.arrival_scene);
      navigate('/');
      return;
    }
    setSelectedLocation(location);
  };

  const handleCloseLocation = () => {
    setSelectedLocation(null);
  };

  const handleTravel = (regionId) => {
    setCurrentRegion(regionId);
    setSelectedLocation(null);
  };

  const isLocationLocked = (loc) => {
    if (!loc.unlock_condition) return false;
    return !checkCondition(loc.unlock_condition, gameState);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Mapa de Pars</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />

      {/* Regions Grid */}
      <div className={styles.grid}>
        {regions.map((region) => {
          const unlocked = unlockedRegions.includes(region.id) || !region.unlock_condition;
          const isCurrent = currentRegion === region.id;
          return (
            <Panel key={region.id} className={`${styles.regionCard} ${isCurrent ? styles.current : ''} ${!unlocked ? styles.locked : ''}`}>
              <h3 className={styles.regionName}>{region.name} {isCurrent && '(Atual)'}</h3>
              <p className={styles.regionDesc}>{region.description}</p>
              {!unlocked && <p className={styles.lockText}>Bloqueado</p>}
              {unlocked && !isCurrent && (
                <Button variant="primary" size="sm" onClick={() => handleTravel(region.id)}>
                  Viajar
                </Button>
              )}
            </Panel>
          );
        })}
      </div>

      <OrnamentDivider />

      {/* Current Region Locations */}
      <div className={styles.locationsSection}>
        <h2 className={styles.locationsTitle}>
          Locais em {regions.find((r) => r.id === currentRegion)?.name || currentRegion}
        </h2>
        <div className={styles.locationsList}>
          {regionLocations.map((loc) => {
            const locked = isLocationLocked(loc);
            return (
              <LocationCard
                key={loc.id}
                location={loc}
                isCurrent={currentLocation === loc.id}
                isVisited={visitedLocations.includes(loc.id)}
                isLocked={locked}
                onClick={() => !locked && handleSelectLocation(loc)}
              />
            );
          })}
          {regionLocations.length === 0 && (
            <p className={styles.noLocations}>Nenhum local conhecido nesta regiao.</p>
          )}
        </div>
      </div>

      {/* Selected Location Panel */}
      {selectedLocation && (
        <LocationPanel
          location={selectedLocation}
          onClose={handleCloseLocation}
        />
      )}
    </div>
  );
}
