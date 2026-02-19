import styles from './StatRow.module.css';
import { formatModifier } from '../../utils/formatters';
import { ATTRIBUTE_NAMES } from '../../utils/constants';

export default function StatRow({ attr, value, showModifier = true, compact = false }) {
  return (
    <div className={`${styles.row} ${compact ? styles.compact : ''}`}>
      <span className={styles.name}>{ATTRIBUTE_NAMES[attr] || attr}</span>
      <span className={styles.value}>{value}</span>
      {showModifier && <span className={styles.mod}>({formatModifier(value)})</span>}
    </div>
  );
}
