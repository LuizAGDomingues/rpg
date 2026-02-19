import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/useGameStore';
import Button from '../components/ui/Button';
import Panel from '../components/ui/Panel';
import { OrnamentDivider } from '../components/ui/Ornament';
import styles from './InventoryScreen.module.css';

export default function InventoryScreen() {
  const navigate = useNavigate();
  const inventory = useGameStore((s) => s.inventory);
  const player = useGameStore((s) => s.player);

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
        <div className={styles.equipSlots}>
          <div className={styles.slot}>
            <span className={styles.slotLabel}>Arma</span>
            <span className={styles.slotValue}>{player.equipment.weapon?.name || 'Nenhuma'}</span>
          </div>
          <div className={styles.slot}>
            <span className={styles.slotLabel}>Armadura</span>
            <span className={styles.slotValue}>{player.equipment.armor?.name || 'Nenhuma'}</span>
          </div>
          <div className={styles.slot}>
            <span className={styles.slotLabel}>Escudo</span>
            <span className={styles.slotValue}>{player.equipment.shield?.name || 'Nenhum'}</span>
          </div>
        </div>
      </Panel>
      <Panel title="Itens">
        {inventory.items.length === 0 ? (
          <p className={styles.empty}>Nenhum item no inventario.</p>
        ) : (
          <div className={styles.itemList}>
            {inventory.items.map((item) => (
              <div key={item.uid} className={styles.item}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemType}>{item.type}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
      {inventory.key_items.length > 0 && (
        <Panel title="Itens Chave">
          <div className={styles.itemList}>
            {inventory.key_items.map((item, i) => (
              <div key={i} className={styles.item}>
                <span className={styles.itemName}>{item.name}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
