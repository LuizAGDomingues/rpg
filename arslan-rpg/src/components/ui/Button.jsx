import styles from './Button.module.css';

export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, fullWidth = false, className = '' }) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
