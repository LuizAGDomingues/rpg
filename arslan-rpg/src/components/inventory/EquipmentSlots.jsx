import styles from './EquipmentSlots.module.css';

export default function EquipmentSlots({ equipment, onUnequip }) {
    const slots = [
        { key: 'weapon', label: '⚔ Arma', icon: '🗡' },
        { key: 'armor', label: '🛡 Armadura', icon: '🛡' },
        { key: 'shield', label: '🔰 Escudo', icon: '🔰' },
    ];

    return (
        <div className={styles.container}>
            {slots.map((slot) => {
                const item = equipment?.[slot.key];
                return (
                    <div
                        key={slot.key}
                        className={`${styles.slot} ${item ? styles.filled : styles.empty}`}
                        onClick={() => item && onUnequip && onUnequip(slot.key)}
                        title={item ? `Clique para desequipar ${item.name}` : ''}
                    >
                        <span className={styles.slotIcon}>{slot.icon}</span>
                        <span className={styles.slotLabel}>{slot.label}</span>
                        <span className={styles.slotValue}>
                            {item ? item.name : 'Vazio'}
                        </span>
                        {item?.damage && <span className={styles.slotStat}>Dano: {item.damage}</span>}
                        {item?.ca_bonus != null && <span className={styles.slotStat}>CA: +{item.ca_bonus}</span>}
                    </div>
                );
            })}
        </div>
    );
}
