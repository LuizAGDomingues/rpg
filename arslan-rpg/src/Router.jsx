import { Routes, Route, Navigate } from 'react-router-dom';
import useGameStore from './store/useGameStore';
import TitleScreen from './screens/TitleScreen';
import ClassSelectScreen from './screens/ClassSelectScreen';
import GameScreen from './screens/GameScreen';
import MapScreen from './screens/MapScreen';
import InventoryScreen from './screens/InventoryScreen';
import PartyScreen from './screens/PartyScreen';
import FactionsScreen from './screens/FactionsScreen';
import JournalScreen from './screens/JournalScreen';

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
    default:
      return <TitleScreen />;
  }
}
