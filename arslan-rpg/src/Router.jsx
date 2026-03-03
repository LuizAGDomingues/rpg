import { Routes, Route, Navigate } from 'react-router-dom';
import useGameStore from './store/useGameStore';
import TitleScreen from './screens/TitleScreen';
import ClassSelectScreen from './screens/ClassSelectScreen';
import GameScreen from './screens/GameScreen';
import GameOverScreen from './screens/GameOverScreen';
import MapScreen from './screens/MapScreen';
import InventoryScreen from './screens/InventoryScreen';
import PartyScreen from './screens/PartyScreen';
import FactionsScreen from './screens/FactionsScreen';
import JournalScreen from './screens/JournalScreen';
import SettingsScreen from './screens/SettingsScreen';
import CreditsScreen from './screens/CreditsScreen';

export default function Router() {
  const gamePhase = useGameStore((s) => s.gamePhase);

  return (
    <Routes>
      <Route path="/" element={<PhaseRouter phase={gamePhase} />} />
      <Route path="/map" element={<MapScreen />} />
      <Route path="/inventory" element={<InventoryScreen />} />
      <Route path="/party" element={<PartyScreen />} />
      <Route path="/factions" element={<FactionsScreen />} />
      <Route path="/journal" element={<JournalScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/credits" element={<CreditsScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function PhaseRouter({ phase }) {
  switch (phase) {
    case 'title':
      return <TitleScreen />;
    case 'class_select':
      return <ClassSelectScreen />;
    case 'playing':
    case 'combat':
    case 'dialogue':
      return <GameScreen />;
    case 'game_over':
      return <GameOverScreen />;
    default:
      return <TitleScreen />;
  }
}
