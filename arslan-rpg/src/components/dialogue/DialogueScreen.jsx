import { useState, useCallback, useMemo, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import {
  getDialogueNode,
  getDialogueOptions,
  getNodeText,
  getNPCMood,
  processDialogueChoice,
  applyNodeEffects,
} from '../../engine/dialogueEngine';
import NPCPortrait from './NPCPortrait';
import DialogueBox from './DialogueBox';
import Button from '../ui/Button';
import { OrnamentDivider } from '../ui/Ornament';
import styles from './DialogueScreen.module.css';

// Import all NPC data
import npcsData from '../../data/npcs/npcs.json';

// Import item catalogs for shop rendering
import consumablesData from '../../data/items/consumables.json';
import weaponsData from '../../data/items/weapons.json';
import armorData from '../../data/items/armor.json';

// Build unified item lookup by ID (price = value || price)
const ALL_ITEMS = [...consumablesData, ...weaponsData, ...armorData].reduce((map, item) => {
  map[item.id] = { ...item, price: item.price ?? item.value ?? 20 };
  return map;
}, {});

// Dynamic dialogue imports
const dialogueModules = import.meta.glob('../../data/dialogues/*.json', { eager: true });

const loadDialogueTree = (dialogueTreeId) => {
  for (const [path, mod] of Object.entries(dialogueModules)) {
    const data = mod.default || mod;
    if (data.id === dialogueTreeId) return data;
  }
  return null;
};

export default function DialogueScreen() {
  const dialogue = useGameStore((s) => s.dialogue);
  const gameState = useGameStore();
  const store = useGameStore();
  const inventory = useGameStore((s) => s.inventory);

  const [results, setResults] = useState([]);
  const [skillResult, setSkillResult] = useState(null);
  const [nodeEffectsApplied, setNodeEffectsApplied] = useState(new Set());
  const [buyMsg, setBuyMsg] = useState('');

  // Load NPC data
  const npcData = useMemo(() => {
    if (!dialogue?.npcId) return null;
    return npcsData.find((n) => n.id === dialogue.npcId) || null;
  }, [dialogue?.npcId]);

  // Load dialogue tree
  const dialogueTree = useMemo(() => {
    if (!npcData?.dialogue_tree) return null;
    return loadDialogueTree(npcData.dialogue_tree);
  }, [npcData?.dialogue_tree]);

  // Current node
  const currentNodeId = dialogue?.currentNodeId || 'start';
  const node = useMemo(
    () => dialogueTree ? getDialogueNode(dialogueTree, currentNodeId) : null,
    [dialogueTree, currentNodeId]
  );

  // NPC mood
  const mood = useMemo(
    () => npcData ? getNPCMood(npcData, gameState) : 'neutral',
    [npcData, gameState]
  );

  // Node text (mood-aware)
  const displayText = useMemo(
    () => node ? getNodeText(node, mood) : '',
    [node, mood]
  );

  // Available options (filtered by conditions)
  const options = useMemo(
    () => node ? getDialogueOptions(node, gameState) : [],
    [node, gameState]
  );

  // Apply node-level effects (set_flags, faction_effect) once per node visit
  useEffect(() => {
    if (node && !nodeEffectsApplied.has(currentNodeId)) {
      const nodeResults = applyNodeEffects(node, store);
      if (nodeResults.length > 0) {
        setResults((prev) => [...prev, ...nodeResults]);
      }
      setNodeEffectsApplied((prev) => new Set(prev).add(currentNodeId));
    }
  }, [node, currentNodeId, store, nodeEffectsApplied]);

  // Handle option selection
  const handleOption = useCallback((option) => {
    // Clear previous skill result
    setSkillResult(null);

    // Exit dialogue
    if (option.leads_to === 'exit') {
      store.endDialogue();
      return;
    }

    // Shop node
    if (option.leads_to === 'shop') {
      store.updateDialogueNode('shop');
      return;
    }

    // Process the choice (skill checks, effects, etc.)
    const { results: choiceResults, nextNodeId, skillCheckResult } = processDialogueChoice(
      option, gameState, store
    );

    if (skillCheckResult) {
      setSkillResult(skillCheckResult);
    }

    setResults(choiceResults);

    // Handle scene transition
    const sceneResult = choiceResults.find((r) => r.type === 'scene');
    if (sceneResult) {
      store.setCurrentScene(sceneResult.sceneId);
      store.endDialogue();
      return;
    }

    // Navigate to next dialogue node
    if (nextNodeId && nextNodeId !== 'exit') {
      store.updateDialogueNode(nextNodeId);
    } else if (nextNodeId === 'exit') {
      store.endDialogue();
    }
  }, [gameState, store]);

  // Shop items for current node (when is_shop: true)
  const shopItems = useMemo(() => {
    if (!node?.is_shop || !npcData?.shop_items) return [];
    return npcData.shop_items
      .map((id) => ALL_ITEMS[id])
      .filter(Boolean);
  }, [node, npcData]);

  // Handle buying a shop item
  const handleBuyItem = useCallback((item) => {
    if (inventory.gold < item.price) {
      setBuyMsg('Ouro insuficiente.');
      setTimeout(() => setBuyMsg(''), 2500);
      return;
    }
    store.addGold(-item.price);
    if (item.type === 'consumable' && item.effect === 'heal') {
      store.addToInventory(item);
    } else if (item.id === 'ration' || item.type === 'ration') {
      store.addRations(1);
    } else {
      store.addToInventory(item);
    }
    setBuyMsg(`Comprou: ${item.name}`);
    setTimeout(() => setBuyMsg(''), 2500);
  }, [inventory.gold, store]);

  // Handle close
  const handleClose = useCallback(() => {
    store.endDialogue();
  }, [store]);

  // Guards
  if (!dialogue || !npcData) {
    return (
      <div className={styles.container}>
        <p>Nenhum dialogo ativo.</p>
        <Button variant="secondary" onClick={handleClose}>Voltar</Button>
      </div>
    );
  }

  if (!dialogueTree || !node) {
    return (
      <div className={styles.container}>
        <p>Dialogo nao encontrado: {npcData.dialogue_tree}</p>
        <Button variant="secondary" onClick={handleClose}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <NPCPortrait portraitType={npcData.portrait_type} mood={mood} npcId={npcData.id} />
        <p className={styles.description}>{npcData.description}</p>
      </div>

      <OrnamentDivider />

      <DialogueBox npcName={npcData.name} npcTitle={npcData.title} text={displayText}>
        {/* Skill check result */}
        {skillResult && (
          <div className={`${styles.skillCheck} ${skillResult.success ? styles.skillSuccess : styles.skillFail}`}>
            <span className={styles.skillDice}>
              d20: {skillResult.roll} + {skillResult.modifier} = {skillResult.total}
            </span>
            <span className={styles.skillDC}>DC {skillResult.dc}</span>
            <span className={styles.skillOutcome}>
              {skillResult.isCrit ? '💥 CRITICO! ' : ''}
              {skillResult.isFumble ? '❌ FALHA CRITICA! ' : ''}
              {skillResult.success ? '✓ Sucesso!' : '✗ Falha!'}
            </span>
          </div>
        )}

        {/* Results badges */}
        {results.length > 0 && (
          <div className={styles.results}>
            {results.map((r, i) => (
              <DialogueResult key={i} result={r} />
            ))}
          </div>
        )}
      </DialogueBox>

      {/* Shop panel (when is_shop: true) */}
      {node.is_shop && (
        <div className={styles.shopPanel}>
          <div className={styles.shopGold}>Ouro: {inventory.gold}</div>
          {buyMsg && <div className={styles.buyMsg}>{buyMsg}</div>}
          {shopItems.length === 0 && (
            <p className={styles.shopEmpty}>Sem estoque disponivel.</p>
          )}
          {shopItems.map((item) => (
            <div key={item.id} className={styles.shopRow}>
              <div className={styles.shopItemInfo}>
                <span className={styles.shopItemName}>{item.name}</span>
                <span className={styles.shopItemDesc}>{item.description}</span>
              </div>
              <div className={styles.shopItemRight}>
                <span className={styles.shopItemPrice}>{item.price} ouro</span>
                <button
                  className={styles.buyBtn}
                  onClick={() => handleBuyItem(item)}
                  disabled={inventory.gold < item.price}
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogue options */}
      <div className={styles.options}>
        {options.map((opt) => (
          <button
            key={opt.id}
            className={styles.optionBtn}
            onClick={() => handleOption(opt)}
          >
            <span className={styles.optionArrow}>▸</span>
            <span className={styles.optionText}>{opt.text}</span>
            {opt.roll && (
              <span className={styles.optionBadge}>
                {opt.roll.attribute} {opt.roll.dc}
              </span>
            )}
            {opt.start_quest && (
              <span className={styles.optionQuestBadge}>Quest</span>
            )}
          </button>
        ))}

        {options.length === 0 && (
          <Button variant="secondary" onClick={handleClose}>
            Encerrar conversa
          </Button>
        )}
      </div>
    </div>
  );
}

function DialogueResult({ result }) {
  const labels = {
    faction: `⚜ ${result.faction}: ${result.delta > 0 ? '+' : ''}${result.delta}`,
    xp: `✨ +${result.amount} XP`,
    quest: `📜 Nova quest: ${result.quest?.name || '???'}`,
    quest_complete: `✅ Quest concluida!`,
    flag: null, // flags are invisible to player
  };
  const text = labels[result.type];
  if (!text) return null;
  return <span className={styles.resultBadge}>{text}</span>;
}
