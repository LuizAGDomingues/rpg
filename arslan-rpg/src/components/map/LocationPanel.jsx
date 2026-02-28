import { useMemo, useState } from 'react';
import useGameStore from '../../store/useGameStore';
import Button from '../ui/Button';
import { OrnamentDivider } from '../ui/Ornament';
import npcsData from '../../data/npcs/npcs.json';
import styles from './LocationPanel.module.css';

// Default shop catalog — items any merchant can sell
const DEFAULT_SHOP_ITEMS = [
  { id: 'potion_hp', name: 'Pocao de Cura', type: 'consumable', effect: 'heal', value_range: '2d6+4', price: 30, description: 'Recupera HP.' },
  { id: 'potion_hp_lg', name: 'Pocao de Cura Maior', type: 'consumable', effect: 'heal', value_range: '4d6+8', price: 60, description: 'Recupera mais HP.' },
  { id: 'antidote', name: 'Antidoto', type: 'consumable', effect: 'cure_poison', price: 25, description: 'Remove veneno.' },
  { id: 'bandage', name: 'Atadura', type: 'consumable', effect: 'cure_bleed', price: 15, description: 'Estanca sangramento.' },
  { id: 'ration', name: 'Mantimento', type: 'ration', price: 20, description: 'Necessario para Descanso Longo.' },
];

export default function LocationPanel({ location, onClose }) {
  const store = useGameStore();
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore((s) => s.inventory);
  const [shopOpen, setShopOpen] = useState(false);
  const [restMsg, setRestMsg] = useState('');

  const locationNPCs = useMemo(() => {
    if (!location?.npcs) return [];
    return location.npcs
      .map((npcId) => npcsData.find((n) => n.id === npcId))
      .filter(Boolean);
  }, [location?.npcs]);

  const handleTalkToNPC = (npc) => {
    store.startDialogue({ npcId: npc.id, currentNodeId: 'start', location: location.id });
  };

  // --- Rest ---
  const handleShortRest = () => {
    const heal = Math.floor(player.hp_max / 4);
    store.updatePlayerHP(heal);
    setRestMsg(`Descanso Curto: recuperou ${heal} HP.`);
    setTimeout(() => setRestMsg(''), 3000);
  };

  const handleLongRest = () => {
    if ((inventory.rations || 0) < 1) {
      setRestMsg('Sem mantimentos. Compre mantimentos primeiro.');
      setTimeout(() => setRestMsg(''), 3000);
      return;
    }
    store.useRation();
    const heal = player.hp_max - player.hp;
    store.updatePlayerHP(heal);
    setRestMsg(`Descanso Longo: HP totalmente recuperado. Mantimentos restantes: ${(inventory.rations || 1) - 1}.`);
    setTimeout(() => setRestMsg(''), 4000);
  };

  // --- Shop ---
  const handleBuy = (item) => {
    if (inventory.gold < item.price) return;
    store.addGold(-item.price);
    if (item.type === 'ration') {
      store.addRations(1);
    } else {
      store.addToInventory(item);
    }
  };

  if (!location) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{location.name}</h2>
        <Button variant="secondary" size="sm" onClick={onClose}>Fechar</Button>
      </div>
      <p className={styles.description}>{location.description}</p>

      <OrnamentDivider />

      {/* NPCs */}
      {locationNPCs.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Pessoas</h4>
          <div className={styles.npcList}>
            {locationNPCs.map((npc) => (
              <button key={npc.id} className={styles.npcCard} onClick={() => handleTalkToNPC(npc)}>
                <div className={styles.npcInfo}>
                  <span className={styles.npcName}>{npc.name}</span>
                  <span className={styles.npcTitle}>{npc.title}</span>
                </div>
                <span className={styles.talkBtn}>Conversar</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rest */}
      {location.rest && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Descanso</h4>
          <p className={styles.actionHint}>
            HP: {player.hp}/{player.hp_max} &nbsp;|&nbsp; Mantimentos: {inventory.rations || 0}
          </p>
          <div className={styles.restButtons}>
            <Button variant="secondary" size="sm" onClick={handleShortRest} disabled={player.hp >= player.hp_max}>
              💤 Descanso Curto (+{Math.floor(player.hp_max / 4)} HP)
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLongRest} disabled={player.hp >= player.hp_max || (inventory.rations || 0) < 1}>
              🛏 Descanso Longo (HP total, 1 Mantimento)
            </Button>
          </div>
          {restMsg && <p className={styles.restMsg}>{restMsg}</p>}
        </div>
      )}

      {/* Shop */}
      {location.shop && (
        <div className={styles.section}>
          <div className={styles.shopHeader}>
            <h4 className={styles.sectionTitle}>Loja</h4>
            <Button variant="secondary" size="sm" onClick={() => setShopOpen(!shopOpen)}>
              {shopOpen ? 'Fechar' : `🛒 Abrir (${inventory.gold} ouro)`}
            </Button>
          </div>
          {shopOpen && (
            <div className={styles.shopList}>
              {DEFAULT_SHOP_ITEMS.map((item) => (
                <div key={item.id} className={styles.shopItem}>
                  <div className={styles.shopItemInfo}>
                    <span className={styles.shopItemName}>{item.name}</span>
                    <span className={styles.shopItemDesc}>{item.description}</span>
                  </div>
                  <div className={styles.shopItemRight}>
                    <span className={styles.shopItemPrice}>{item.price} ouro</span>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleBuy(item)}
                      disabled={inventory.gold < item.price}
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {locationNPCs.length === 0 && !location.shop && !location.rest && (
        <p className={styles.empty}>Nada de especial aqui por enquanto.</p>
      )}
    </div>
  );
}
