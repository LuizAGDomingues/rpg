import styles from './ChoiceBox.module.css';

export default function ChoiceBox({ choices, onChoice }) {
  if (!choices || choices.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.divider}>
        <span className={styles.dividerText}>O que fazer?</span>
      </div>
      <div className={styles.choices}>
        {choices.map((choice, i) => (
          <button
            key={choice.id}
            className={styles.choice}
            onClick={() => onChoice(choice)}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className={styles.choiceNumber}>{i + 1}</span>
            <span className={styles.choiceText}>{choice.text}</span>
            {choice.condition && (
              <span className={styles.choiceCondition}>
                {choice.roll ? `[DC ${choice.roll.dc}]` : ''}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
