import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import { OrnamentDivider } from '../components/ui/Ornament';
import ItemCard from '../components/inventory/ItemCard';
import EquipmentSlots from '../components/inventory/EquipmentSlots';
import styles from './InventoryScreen.module.css';

export default function InventoryScreen() {
  const navigate = useNavigate();
  const inventory = useGameStore((s) => s.inventory);
  const player = useGameStore((s) => s.player);
  const store = useGameStore();

  const handleEquip = (item) => {
    let slot = null;
    if (item.type === 'weapon') slot = 'weapon';
    else if (item.type === 'armor') slot = 'armor';
    else if (item.type === 'shield') slot = 'shield';
    if (!slot) return;

    // If something already equipped in this slot, swap it back to inventory
    const current = player.equipment?.[slot];
    if (current) {
      store.addToInventory(current);
    }
    store.equipItem(slot, item);
    store.removeFromInventory(item.uid || item.id);
  };

  const handleUnequip = (slot) => {
    const item = player.equipment?.[slot];
    if (!item) return;
    store.addToInventory(item);
    store.equipItem(slot, null);
  };

  const handleUse = (item) => {
    if (item.effect === 'heal') {
      const healMatch = item.value_range?.match(/(\d+)d(\d+)\+?(\d+)?/);
      let healAmount = 8;
      if (healMatch) {
        const [, qty, sides, bonus] = healMatch;
        healAmount = 0;
        for (let d = 0; d < parseInt(qty); d++) {
          healAmount += Math.floor(Math.random() * parseInt(sides)) + 1;
        }
        healAmount += parseInt(bonus || 0);
      }
      store.updatePlayerHP(Math.min(healAmount, player.hp_max - player.hp));
    }
    store.removeFromInventory(item.uid || item.id);
  };

  // Check which items are equipped to mark them
  const equippedIds = new Set();
  ['weapon', 'armor', 'shield'].forEach((slot) => {
    const e = player.equipment?.[slot];
    if (e) equippedIds.add(e.uid || e.id || e.name);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Inventario</h1>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>Voltar</Button>
      </div>
      <OrnamentDivider />
      <div className={styles.goldBar}>
        <span className={styles.goldLabel}>Ouro:</span>
        <span className={styles.goldValue}>{inventory.gold}</span>
      </div>

      <Panel title="Equipamento">
        <EquipmentSlots equipment={player.equipment} onUnequip={handleUnequip} />
      </Panel>

      <Panel title="Itens">
        {inventory.items.length === 0 ? (
          <p className={styles.empty}>Nenhum item no inventario.</p>
        ) : (
          <div className={styles.itemList}>
            {inventory.items.map((item) => (
              <ItemCard
                key={item.uid || item.id || item.name}
                item={item}
                onEquip={handleEquip}
                onUse={item.type === 'consumable' ? handleUse : undefined}
                equipped={equippedIds.has(item.uid || item.id || item.name)}
              />
            ))}
          </div>
        )}
      </Panel>

      {inventory.key_items.length > 0 && (
        <Panel title="Itens Chave">
          <div className={styles.itemList}>
            {inventory.key_items.map((item, i) => (
              <div key={i} className={styles.keyItem}>
                <span className={styles.keyItemIcon}>🔑</span>
                <span className={styles.keyItemName}>{item.name}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
