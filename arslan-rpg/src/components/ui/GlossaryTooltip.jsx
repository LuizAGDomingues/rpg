import { useMemo } from 'react';
import glossaryData from '../../data/glossary.json';
import styles from './GlossaryTooltip.module.css';

// Build lookup: lowercased term/alias → definition
const GLOSSARY_MAP = {};
const ALL_TERMS = [];

for (const entry of glossaryData) {
  const terms = [entry.term, ...(entry.aliases || [])];
  for (const t of terms) {
    GLOSSARY_MAP[t.toLowerCase()] = entry.definition;
    ALL_TERMS.push(t);
  }
}

// Sort longest first to prevent partial matches (e.g. "Mascara de Prata" before "Prata")
ALL_TERMS.sort((a, b) => b.length - a.length);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build a single regex from all terms
const GLOSSARY_REGEX = ALL_TERMS.length
  ? new RegExp(`\\b(${ALL_TERMS.map(escapeRegex).join('|')})\\b`, 'gi')
  : null;

function parseText(text) {
  if (!GLOSSARY_REGEX || !text) return [{ type: 'text', value: text || '' }];

  const parts = [];
  let lastIndex = 0;
  GLOSSARY_REGEX.lastIndex = 0;
  let match;

  while ((match = GLOSSARY_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const definition = GLOSSARY_MAP[match[0].toLowerCase()] || '';
    parts.push({ type: 'keyword', value: match[0], definition });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
}

export default function GlossaryTooltip({ text }) {
  const parts = useMemo(() => parseText(text), [text]);

  return (
    <>
      {parts.map((part, i) =>
        part.type === 'keyword' ? (
          <span key={i} className={styles.keyword} data-tooltip={part.definition}>
            {part.value}
          </span>
        ) : (
          part.value
        )
      )}
    </>
  );
}
