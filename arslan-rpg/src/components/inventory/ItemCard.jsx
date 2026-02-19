import Button from '../ui/Button';
import styles from './ItemCard.module.css';

export default function ItemCard({ item, onEquip, onUse, onDrop, equipped }) {
    const isWeapon = item.type === 'weapon';
    const isArmor = item.type === 'armor';
    const isShield = item.type === 'shield';
    const isConsumable = item.type === 'consumable';
    const isEquippable = isWeapon || isArmor || isShield;

    return (
        <div className={`${styles.card} ${equipped ? styles.equipped : ''}`}>
            <div className={styles.info}>
                <h4 className={styles.name}>
                    {item.name}
                    {equipped && <span className={styles.equippedBadge}>Equipado</span>}
                </h4>
                <span className={styles.type}>
                    {isWeapon && '⚔ Arma'}
                    {isArmor && '🛡 Armadura'}
                    {isShield && '🔰 Escudo'}
                    {isConsumable && '🧪 Consumível'}
                    {!isEquippable && !isConsumable && `📦 ${item.type}`}
                </span>
                {item.damage && <span className={styles.stat}>Dano: {item.damage}</span>}
                {item.bonus_atk != null && <span className={styles.stat}>Ataque: +{item.bonus_atk}</span>}
                {item.ca_bonus != null && <span className={styles.stat}>CA: +{item.ca_bonus}</span>}
                {item.description && <p className={styles.desc}>{item.description}</p>}
            </div>
            <div className={styles.actions}>
                {isEquippable && !equipped && onEquip && (
                    <Button variant="primary" size="sm" onClick={() => onEquip(item)}>Equipar</Button>
                )}
                {isConsumable && onUse && (
                    <Button variant="secondary" size="sm" onClick={() => onUse(item)}>Usar</Button>
                )}
                {onDrop && (
                    <Button variant="secondary" size="sm" onClick={() => onDrop(item)}>Descartar</Button>
                )}
            </div>
        </div>
    );
}
