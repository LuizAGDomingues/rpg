import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGameStore = create(
  persist(
    (set, get) => ({
      gamePhase: 'title',
      currentAct: 1,
      currentScene: 'prologue_start',

      player: {
        class: null, name: 'Arslan', level: 1, xp: 0, xp_next: 100,
        attributes: {}, hp: 0, hp_max: 0, pa: 3, ca: 10,
        equipment: { weapon: null, armor: null, shield: null },
        skills: [], legendary_skills: [], status_effects: [],
      },

      party: [],
      recruited_generals: [],

      factions: {
        nobreza_pars: 20, lusitanos_moderados: -60, sindhura: 0,
        turan: -10, escravos_libertos: 0, clero_mithra: 30,
      },

      inventory: { gold: 50, items: [], key_items: [] },
      quests: { active: [], completed: [], failed: [] },

      world: {
        current_region: 'atropatene', current_location: null,
        unlocked_regions: ['atropatene'], visited_locations: [], world_flags: {},
      },

      narrative: { log: [], flags: {}, choices_made: [] },
      combat: null,
      dialogue: null,

      setGamePhase: (phase) => set({ gamePhase: phase }),
      setCurrentScene: (scene) => set({ currentScene: scene }),
      setCurrentAct: (act) => set({ currentAct: act }),

      setPlayerClass: (classData) => set((state) => ({
        player: {
          ...state.player, class: classData.id, attributes: classData.attributes,
          hp: classData.hp_base, hp_max: classData.hp_base, pa: classData.pa_base,
          ca: 10 + Math.floor((classData.attributes.DES - 10) / 2),
          skills: classData.starting_skills,
        },
        factions: Object.entries(classData.faction_bonus || {}).reduce(
          (facs, [fid, bonus]) => ({ ...facs, [fid]: Math.max(-100, Math.min(100, (facs[fid] || 0) + bonus)) }),
          { ...state.factions }
        ),
      })),

      updatePlayerHP: (delta) => set((state) => ({
        player: { ...state.player, hp: Math.max(0, Math.min(state.player.hp_max, state.player.hp + delta)) },
      })),

      equipItem: (slot, item) => set((state) => ({
        player: { ...state.player, equipment: { ...state.player.equipment, [slot]: item } },
      })),

      addSkill: (skill) => set((state) => ({
        player: { ...state.player, skills: [...state.player.skills, skill] },
      })),

      levelUpAttribute: (attr) => set((state) => ({
        player: { ...state.player, attributes: { ...state.player.attributes, [attr]: state.player.attributes[attr] + 1 } },
      })),

      recruitGeneral: (generalData) => set((state) => ({
        recruited_generals: [...state.recruited_generals, { ...generalData, current_hp: generalData.hp_base, hp_max: generalData.hp_base, status_effects: [] }],
      })),

      setParty: (partyIds) => set({ party: partyIds }),

      updateGeneralHP: (generalId, delta) => set((state) => ({
        recruited_generals: state.recruited_generals.map((g) =>
          g.id === generalId ? { ...g, current_hp: Math.max(0, Math.min(g.hp_max, g.current_hp + delta)) } : g
        ),
      })),

      updateFaction: (factionId, delta) => set((state) => ({
        factions: { ...state.factions, [factionId]: Math.max(-100, Math.min(100, (state.factions[factionId] || 0) + delta)) },
      })),

      addToInventory: (item) => set((state) => ({
        inventory: { ...state.inventory, items: [...state.inventory.items, { ...item, uid: Date.now() + Math.random() }] },
      })),

      removeFromInventory: (uid) => set((state) => ({
        inventory: { ...state.inventory, items: state.inventory.items.filter((i) => i.uid !== uid) },
      })),

      addKeyItem: (item) => set((state) => ({
        inventory: { ...state.inventory, key_items: [...state.inventory.key_items, item] },
      })),

      addGold: (amount) => set((state) => ({
        inventory: { ...state.inventory, gold: state.inventory.gold + amount },
      })),

      startCombat: (combatData) => set({ combat: combatData, gamePhase: 'combat' }),
      endCombat: () => set({ combat: null, gamePhase: 'playing' }),
      updateCombat: (updates) => set((state) => ({ combat: state.combat ? { ...state.combat, ...updates } : null })),

      startDialogue: (dialogueData) => set({ dialogue: dialogueData, gamePhase: 'dialogue' }),
      endDialogue: () => set({ dialogue: null, gamePhase: 'playing' }),

      addNarrativeLog: (paragraph) => set((state) => ({
        narrative: { ...state.narrative, log: [...state.narrative.log, paragraph] },
      })),

      setNarrativeFlag: (flag, value) => set((state) => ({
        narrative: { ...state.narrative, flags: { ...state.narrative.flags, [flag]: value } },
      })),

      addChoice: (choice) => set((state) => ({
        narrative: { ...state.narrative, choices_made: [...state.narrative.choices_made, choice] },
      })),

      setWorldFlag: (flag, value) => set((state) => ({
        world: { ...state.world, world_flags: { ...state.world.world_flags, [flag]: value } },
      })),

      unlockRegion: (regionId) => set((state) => ({
        world: { ...state.world, unlocked_regions: state.world.unlocked_regions.includes(regionId) ? state.world.unlocked_regions : [...state.world.unlocked_regions, regionId] },
      })),

      setCurrentRegion: (regionId) => set((state) => ({ world: { ...state.world, current_region: regionId } })),

      setCurrentLocation: (locationId) => set((state) => ({
        world: { ...state.world, current_location: locationId, visited_locations: state.world.visited_locations.includes(locationId) ? state.world.visited_locations : [...state.world.visited_locations, locationId] },
      })),

      addXP: (amount) => set((state) => {
        let newXP = state.player.xp + amount;
        let newLevel = state.player.level;
        let newXPNext = state.player.xp_next;
        while (newXP >= newXPNext) { newXP -= newXPNext; newLevel += 1; newXPNext = Math.floor(newXPNext * 1.5); }
        return { player: { ...state.player, xp: newXP, level: newLevel, xp_next: newXPNext } };
      }),

      startQuest: (quest) => set((state) => ({
        quests: { ...state.quests, active: [...state.quests.active, { ...quest, progress: {} }] },
      })),

      updateQuestProgress: (questId, objectiveId) => set((state) => ({
        quests: { ...state.quests, active: state.quests.active.map((q) => q.id === questId ? { ...q, progress: { ...q.progress, [objectiveId]: true } } : q) },
      })),

      completeQuest: (questId) => set((state) => {
        const quest = state.quests.active.find((q) => q.id === questId);
        return { quests: { active: state.quests.active.filter((q) => q.id !== questId), completed: [...state.quests.completed, quest], failed: state.quests.failed } };
      }),

      failQuest: (questId) => set((state) => {
        const quest = state.quests.active.find((q) => q.id === questId);
        return { quests: { active: state.quests.active.filter((q) => q.id !== questId), completed: state.quests.completed, failed: [...state.quests.failed, quest] } };
      }),

      resetGame: () => set({
        gamePhase: 'title', currentAct: 1, currentScene: 'prologue_start',
        player: { class: null, name: 'Arslan', level: 1, xp: 0, xp_next: 100, attributes: {}, hp: 0, hp_max: 0, pa: 3, ca: 10, equipment: { weapon: null, armor: null, shield: null }, skills: [], legendary_skills: [], status_effects: [] },
        party: [], recruited_generals: [],
        factions: { nobreza_pars: 20, lusitanos_moderados: -60, sindhura: 0, turan: -10, escravos_libertos: 0, clero_mithra: 30 },
        inventory: { gold: 50, items: [], key_items: [] },
        quests: { active: [], completed: [], failed: [] },
        world: { current_region: 'atropatene', current_location: null, unlocked_regions: ['atropatene'], visited_locations: [], world_flags: {} },
        narrative: { log: [], flags: {}, choices_made: [] },
        combat: null, dialogue: null,
      }),
    }),
    { name: 'arslan-rpg-storage' }
  )
);

export default useGameStore;
