import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import { checkCondition } from '../utils/conditions';
import { rollDice } from '../engine/diceEngine';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import { OrnamentDivider } from '../components/ui/Ornament';
import LocationCard from '../components/map/LocationCard';
import LocationPanel from '../components/map/LocationPanel';
import regions from '../data/world/regions.json';
import locationsData from '../data/world/locations.json';
import travelEventsData from '../data/world/travel_events.json';
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
  const [activeTravelEvent, setActiveTravelEvent] = useState(null);
  const [travelEventResult, setTravelEventResult] = useState(null);

  const recruitedGenerals = useGameStore((s) => s.recruited_generals);
  const playerAttributes = useGameStore((s) => s.player.attributes);
  const playerHP = useGameStore((s) => s.player.hp);
  const playerHPMax = useGameStore((s) => s.player.hp_max);
  const addGold = useGameStore((s) => s.addGold);
  const addXP = useGameStore((s) => s.addXP);
  const addToInventory = useGameStore((s) => s.addToInventory);
  const setWorldFlag = useGameStore((s) => s.setWorldFlag);
  const updateCharacterScore = useGameStore((s) => s.updateCharacterScore);
  const updateFaction = useGameStore((s) => s.updateFaction);
  const updatePlayerHP = useGameStore((s) => s.updatePlayerHP);

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

  const pickTravelEvent = () => {
    const eligible = travelEventsData.filter((ev) => {
      if (ev.requires_general) return recruitedGenerals.includes(ev.requires_general);
      return true;
    });
    if (!eligible.length) return null;
    const total = eligible.reduce((sum, ev) => sum + (ev.weight || 10), 0);
    let rand = Math.random() * total;
    for (const ev of eligible) {
      rand -= ev.weight || 10;
      if (rand <= 0) return ev;
    }
    return eligible[eligible.length - 1];
  };

  const handleTravel = (regionId) => {
    const region = regions.find((r) => r.id === regionId);
    const alreadyVisited = gameState.world.world_flags?.[`region_${regionId}_visited`];
    setCurrentRegion(regionId);
    setSelectedLocation(null);
    if (region?.arrival_scene && !alreadyVisited) {
      useGameStore.getState().setWorldFlag(`region_${regionId}_visited`, true);
      useGameStore.getState().setCurrentScene(region.arrival_scene);
      navigate('/');
      return;
    }
    // 30% chance of travel event when not triggering arrival scene
    if (Math.random() < 0.3) {
      const ev = pickTravelEvent();
      if (ev) {
        setActiveTravelEvent(ev);
        setTravelEventResult(null);
      }
    }
  };

  const parseDiceValue = (expr) => {
    if (!expr) return 0;
    if (typeof expr === 'number') return expr;
    try { return rollDice(expr).total; } catch { return parseInt(expr, 10) || 0; }
  };

  const applyReward = (reward) => {
    if (!reward) return;
    if (reward.gold) addGold(parseDiceValue(reward.gold));
    if (reward.xp) addXP(reward.xp);
    if (reward.character_score) updateCharacterScore(reward.character_score);
    if (reward.hp_restore_percent && playerHPMax > 0) {
      const heal = Math.floor(playerHPMax * reward.hp_restore_percent);
      updatePlayerHP(heal);
    }
    if (reward.flags) {
      reward.flags.forEach((f) => setWorldFlag(f, true));
    }
    if (reward.items) {
      reward.items.forEach((itemRef) => {
        if (Math.random() < (itemRef.chance || 1)) {
          addToInventory({ id: itemRef.id, name: itemRef.id });
        }
      });
    }
    // Faction keys like faction_pars, faction_lusitania
    Object.entries(reward).forEach(([key, val]) => {
      if (key.startsWith('faction_')) {
        const factionId = key.replace('faction_', '');
        updateFaction(factionId, val);
      }
    });
  };

  const handleTravelEventChoice = (choice) => {
    const { action } = choice;

    if (action === 'dismiss') {
      setActiveTravelEvent(null);
      setTravelEventResult(null);
      return;
    }

    if (action === 'start_combat') {
      // Build a temporary narrative scene for the combat
      if (activeTravelEvent?.combat) {
        const store = useGameStore.getState();
        store.setCurrentScene(`tev_combat_${activeTravelEvent.id}`);
        // Store the combat data for GameScreen to pick up via world flag
        store.setWorldFlag('pending_travel_combat', JSON.stringify(activeTravelEvent.combat));
        navigate('/');
      }
      setActiveTravelEvent(null);
      return;
    }

    if (action === 'reward' || action === 'intel_then_reward') {
      applyReward(choice.reward);
      setTravelEventResult(choice.next_text || 'Missao concluida.');
      return;
    }

    if (action === 'skill_check') {
      const attr = choice.skill || 'SAB';
      const dc = choice.dc || 12;
      const attrVal = playerAttributes?.[attr] || 10;
      const mod = Math.floor((attrVal - 10) / 2);
      const roll = Math.floor(Math.random() * 20) + 1 + mod;
      const success = roll >= dc;
      if (success) {
        applyReward(choice.success_reward);
        setTravelEventResult(choice.success_text || 'Voce teve sucesso!');
      } else {
        if (choice.failure_action === 'start_combat' && activeTravelEvent?.combat) {
          setTravelEventResult(null);
          setActiveTravelEvent(null);
          const store = useGameStore.getState();
          store.setWorldFlag('pending_travel_combat', JSON.stringify(activeTravelEvent.combat));
          store.setCurrentScene(`tev_combat_${activeTravelEvent.id}`);
          navigate('/');
          return;
        }
        setTravelEventResult(choice.failure_text || 'Nao obteve sucesso.');
      }
      return;
    }

    if (action === 'open_shop') {
      setActiveTravelEvent(null);
      // Find nearest location with a shop in current region
      const shopLoc = locationsData.find((l) => l.region === currentRegion && l.has_shop);
      if (shopLoc) setSelectedLocation(shopLoc);
      return;
    }

    setActiveTravelEvent(null);
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

      {/* Travel Event Modal */}
      {activeTravelEvent && (
        <div className={styles.travelEventOverlay}>
          <Panel className={styles.travelEventPanel}>
            <h3 className={styles.travelEventTitle}>{activeTravelEvent.title}</h3>
            <OrnamentDivider />
            <p className={styles.travelEventText}>
              {travelEventResult || activeTravelEvent.text}
            </p>
            {travelEventResult ? (
              <Button variant="primary" onClick={() => { setActiveTravelEvent(null); setTravelEventResult(null); }}>
                Continuar
              </Button>
            ) : (
              <div className={styles.travelEventChoices}>
                {activeTravelEvent.choices?.map((choice, i) => (
                  <Button
                    key={i}
                    variant={choice.requires ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={choice.requires?.class && gameState.player?.class !== choice.requires.class}
                    onClick={() => handleTravelEventChoice(choice)}
                  >
                    {choice.text}
                  </Button>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
