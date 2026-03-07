/**
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The L.A.W.S. Collective, LLC
 * 
 * Core game engine with save system, progression, and state management
 */

import type {
  Character,
  CharacterStats,
  GameState,
  Quest,
  InventoryItem,
  Achievement,
  SaveData,
  Rank,
  GameLocation,
  RealmType,
} from "./types";

import {
  DEFAULT_CHARACTER,
  DEFAULT_SETTINGS,
  DEFAULT_STATISTICS,
  EXPERIENCE_CURVE,
  ENERGY_CONFIG,
  TOKEN_RATES,
  QUESTS,
  ACHIEVEMENTS,
  ITEMS,
  RANKS,
  GAME_VERSION,
  SAVE_VERSION,
} from "./constants";

// ============================================
// SAVE SYSTEM
// ============================================

const SAVE_KEY = "laws_quest_save";
const SAVE_SLOTS_KEY = "laws_quest_slots";

export function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function saveGame(gameState: GameState, slot: number = 0): boolean {
  try {
    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      gameState,
      checksum: "",
    };
    
    // Generate checksum without the checksum field
    const dataForChecksum = JSON.stringify({ ...saveData, checksum: "" });
    saveData.checksum = generateChecksum(dataForChecksum);
    
    const key = slot === 0 ? SAVE_KEY : `${SAVE_KEY}_${slot}`;
    localStorage.setItem(key, JSON.stringify(saveData));
    
    // Update save slots metadata
    updateSaveSlotMetadata(slot, gameState);
    
    return true;
  } catch (error) {
    console.error("Failed to save game:", error);
    return false;
  }
}

export function loadGame(slot: number = 0): GameState | null {
  try {
    const key = slot === 0 ? SAVE_KEY : `${SAVE_KEY}_${slot}`;
    const savedData = localStorage.getItem(key);
    
    if (!savedData) return null;
    
    const saveData: SaveData = JSON.parse(savedData);
    
    // Verify checksum
    const expectedChecksum = generateChecksum(
      JSON.stringify({ ...saveData, checksum: "" })
    );
    
    if (saveData.checksum !== expectedChecksum) {
      console.warn("Save data checksum mismatch - data may be corrupted");
    }
    
    // Handle version migrations if needed
    const migratedState = migrateGameState(saveData.gameState, saveData.version);
    
    return migratedState;
  } catch (error) {
    console.error("Failed to load game:", error);
    return null;
  }
}

export function deleteSave(slot: number = 0): boolean {
  try {
    const key = slot === 0 ? SAVE_KEY : `${SAVE_KEY}_${slot}`;
    localStorage.removeItem(key);
    
    // Update slots metadata
    const slotsData = localStorage.getItem(SAVE_SLOTS_KEY);
    if (slotsData) {
      const slots = JSON.parse(slotsData);
      delete slots[slot];
      localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
    }
    
    return true;
  } catch (error) {
    console.error("Failed to delete save:", error);
    return false;
  }
}

export function getSaveSlots(): Record<number, { name: string; level: number; playTime: number; lastPlayed: number }> {
  try {
    const slotsData = localStorage.getItem(SAVE_SLOTS_KEY);
    return slotsData ? JSON.parse(slotsData) : {};
  } catch {
    return {};
  }
}

function updateSaveSlotMetadata(slot: number, gameState: GameState): void {
  try {
    const slots = getSaveSlots();
    slots[slot] = {
      name: gameState.character.name,
      level: gameState.character.level,
      playTime: gameState.statistics.totalPlayTime,
      lastPlayed: Date.now(),
    };
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
  } catch (error) {
    console.error("Failed to update save slot metadata:", error);
  }
}

function migrateGameState(state: GameState, version: string): GameState {
  // Add migration logic here when save format changes
  // For now, just return the state as-is
  return state;
}

// ============================================
// CHARACTER CREATION & MANAGEMENT
// ============================================

export function createNewCharacter(name: string): Character {
  return {
    ...DEFAULT_CHARACTER,
    id: generateId(),
    name: name || "Sovereign",
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
  };
}

export function createNewGameState(characterName: string): GameState {
  return {
    character: createNewCharacter(characterName),
    settings: { ...DEFAULT_SETTINGS },
    statistics: { ...DEFAULT_STATISTICS },
    dailyRewards: {
      lastClaimed: 0,
      currentStreak: 0,
      totalDaysClaimed: 0,
    },
    tutorials: {
      completed: [],
      skipped: [],
    },
  };
}

// ============================================
// PROGRESSION SYSTEM
// ============================================

export function addExperience(character: Character, amount: number): { character: Character; leveledUp: boolean; newLevel?: number } {
  let newExp = character.experience + amount;
  let newLevel = character.level;
  let leveledUp = false;
  let expToNext = character.experienceToNext;
  
  // Check for level ups
  while (newExp >= expToNext) {
    newExp -= expToNext;
    newLevel++;
    leveledUp = true;
    expToNext = EXPERIENCE_CURVE.getExpForLevel(newLevel);
  }
  
  const updatedCharacter: Character = {
    ...character,
    experience: newExp,
    level: newLevel,
    experienceToNext: expToNext,
    title: getRankForLevel(newLevel).name,
    maxEnergy: calculateMaxEnergy(newLevel),
  };
  
  return {
    character: updatedCharacter,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  };
}

export function addTokens(character: Character, amount: number): Character {
  return {
    ...character,
    tokens: character.tokens + amount,
  };
}

export function spendTokens(character: Character, amount: number): Character | null {
  if (character.tokens < amount) return null;
  return {
    ...character,
    tokens: character.tokens - amount,
  };
}

export function addStatPoints(character: Character, stats: Partial<CharacterStats>): Character {
  return {
    ...character,
    stats: {
      land: character.stats.land + (stats.land || 0),
      air: character.stats.air + (stats.air || 0),
      water: character.stats.water + (stats.water || 0),
      self: character.stats.self + (stats.self || 0),
    },
  };
}

export function useEnergy(character: Character, amount: number): Character | null {
  if (character.energy < amount) return null;
  return {
    ...character,
    energy: character.energy - amount,
  };
}

export function restoreEnergy(character: Character, amount: number): Character {
  return {
    ...character,
    energy: Math.min(character.energy + amount, character.maxEnergy),
  };
}

export function calculateMaxEnergy(level: number): number {
  const levelBonus = Math.floor(level / 10) * ENERGY_CONFIG.levelBonus;
  return ENERGY_CONFIG.baseMax + levelBonus;
}

export function getRankForLevel(level: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

// ============================================
// QUEST SYSTEM
// ============================================

export function getAvailableQuests(character: Character): Quest[] {
  return QUESTS.filter(quest => {
    // Check if already completed (for non-repeatable quests)
    if (quest.repeatability === "once" && character.completedQuests.includes(quest.id)) {
      return false;
    }
    
    // Check level requirement
    if (quest.requirements.level && character.level < quest.requirements.level) {
      return false;
    }
    
    // Check stat requirements
    if (quest.requirements.stats) {
      for (const [stat, value] of Object.entries(quest.requirements.stats)) {
        if (character.stats[stat as keyof CharacterStats] < value) {
          return false;
        }
      }
    }
    
    // Check prerequisite quests
    if (quest.prerequisites) {
      for (const prereq of quest.prerequisites) {
        if (!character.completedQuests.includes(prereq)) {
          return false;
        }
      }
    }
    
    // Check item requirements
    if (quest.requirements.items) {
      for (const req of quest.requirements.items) {
        const item = character.inventory.find(i => i.id === req.itemId);
        if (!item || item.quantity < req.quantity) {
          return false;
        }
      }
    }
    
    return true;
  });
}

export function getQuestsByRealm(realm: RealmType): Quest[] {
  return QUESTS.filter(quest => quest.realm === realm);
}

export function startQuest(character: Character, questId: string): Character | null {
  const quest = QUESTS.find(q => q.id === questId);
  if (!quest) return null;
  
  // Check energy
  if (character.energy < quest.energyCost) return null;
  
  // Check if quest is available
  const available = getAvailableQuests(character);
  if (!available.find(q => q.id === questId)) return null;
  
  // Deduct energy and add to active quests
  return {
    ...character,
    energy: character.energy - quest.energyCost,
    activeQuests: [...character.activeQuests, questId],
  };
}

export function completeQuest(
  character: Character, 
  questId: string, 
  success: boolean
): { character: Character; rewards?: Quest["rewards"] } {
  const quest = QUESTS.find(q => q.id === questId);
  if (!quest) return { character };
  
  // Remove from active quests
  let updatedCharacter: Character = {
    ...character,
    activeQuests: character.activeQuests.filter(id => id !== questId),
  };
  
  if (success) {
    // Add to completed quests
    if (!updatedCharacter.completedQuests.includes(questId)) {
      updatedCharacter.completedQuests = [...updatedCharacter.completedQuests, questId];
    }
    
    // Apply rewards
    const { character: expChar, leveledUp } = addExperience(updatedCharacter, quest.rewards.experience);
    updatedCharacter = expChar;
    updatedCharacter = addTokens(updatedCharacter, quest.rewards.tokens);
    
    if (quest.rewards.statBoosts) {
      updatedCharacter = addStatPoints(updatedCharacter, quest.rewards.statBoosts);
    }
    
    if (quest.rewards.items) {
      for (const itemReward of quest.rewards.items) {
        // Check chance if specified
        if (itemReward.chance && Math.random() > itemReward.chance) continue;
        updatedCharacter = addItemToInventory(updatedCharacter, itemReward.itemId, itemReward.quantity);
      }
    }
    
    if (quest.rewards.achievements) {
      for (const achievementId of quest.rewards.achievements) {
        if (!updatedCharacter.achievements.includes(achievementId)) {
          updatedCharacter.achievements = [...updatedCharacter.achievements, achievementId];
        }
      }
    }
    
    return { character: updatedCharacter, rewards: quest.rewards };
  }
  
  return { character: updatedCharacter };
}

// ============================================
// INVENTORY SYSTEM
// ============================================

export function addItemToInventory(character: Character, itemId: string, quantity: number = 1): Character {
  const itemTemplate = ITEMS[itemId];
  if (!itemTemplate) return character;
  
  const inventory = [...character.inventory];
  const existingIndex = inventory.findIndex(i => i.id === itemId);
  
  if (existingIndex >= 0 && itemTemplate.stackable) {
    // Stack with existing item
    const existing = inventory[existingIndex];
    const newQuantity = Math.min(existing.quantity + quantity, itemTemplate.maxStack);
    inventory[existingIndex] = { ...existing, quantity: newQuantity };
  } else {
    // Add new item
    inventory.push({ ...itemTemplate, quantity });
  }
  
  return { ...character, inventory };
}

export function removeItemFromInventory(character: Character, itemId: string, quantity: number = 1): Character | null {
  const inventory = [...character.inventory];
  const existingIndex = inventory.findIndex(i => i.id === itemId);
  
  if (existingIndex < 0) return null;
  
  const existing = inventory[existingIndex];
  if (existing.quantity < quantity) return null;
  
  if (existing.quantity === quantity) {
    inventory.splice(existingIndex, 1);
  } else {
    inventory[existingIndex] = { ...existing, quantity: existing.quantity - quantity };
  }
  
  return { ...character, inventory };
}

export function useItem(character: Character, itemId: string): Character | null {
  const item = character.inventory.find(i => i.id === itemId);
  if (!item || item.type !== "consumable" || !item.effect) return null;
  
  let updatedCharacter = removeItemFromInventory(character, itemId, 1);
  if (!updatedCharacter) return null;
  
  // Apply effect
  switch (item.effect.type) {
    case "energy_restore":
      updatedCharacter = restoreEnergy(updatedCharacter, item.effect.value);
      break;
    case "health_restore":
      updatedCharacter = {
        ...updatedCharacter,
        health: Math.min(updatedCharacter.health + item.effect.value, updatedCharacter.maxHealth),
      };
      break;
    case "stat_boost":
      if (item.effect.stat) {
        updatedCharacter = addStatPoints(updatedCharacter, { [item.effect.stat]: item.effect.value });
      }
      break;
  }
  
  return updatedCharacter;
}

// ============================================
// ACHIEVEMENT SYSTEM
// ============================================

export function checkAchievements(gameState: GameState): { achievements: string[]; newlyUnlocked: Achievement[] } {
  const { character, statistics } = gameState;
  const newlyUnlocked: Achievement[] = [];
  
  for (const achievement of ACHIEVEMENTS) {
    if (character.achievements.includes(achievement.id)) continue;
    
    let allRequirementsMet = true;
    
    for (const req of achievement.requirements) {
      switch (req.type) {
        case "quest_count":
          if (statistics.questsCompleted < (req.target as number)) {
            allRequirementsMet = false;
          }
          break;
        case "level":
          if (character.level < (req.target as number)) {
            allRequirementsMet = false;
          }
          break;
        case "stat":
          const statValue = character.stats[req.target as keyof CharacterStats];
          if (statValue < 20) { // Default threshold for stat achievements
            allRequirementsMet = false;
          }
          break;
        case "streak":
          if (gameState.dailyRewards.currentStreak < (req.target as number)) {
            allRequirementsMet = false;
          }
          break;
        case "playtime":
          if (statistics.totalPlayTime < (req.target as number)) {
            allRequirementsMet = false;
          }
          break;
      }
      
      if (!allRequirementsMet) break;
    }
    
    if (allRequirementsMet) {
      newlyUnlocked.push(achievement);
    }
  }
  
  return {
    achievements: [...character.achievements, ...newlyUnlocked.map(a => a.id)],
    newlyUnlocked,
  };
}

export function claimAchievementRewards(character: Character, achievementId: string): Character {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return character;
  
  let updatedCharacter = character;
  
  if (achievement.rewards.tokens) {
    updatedCharacter = addTokens(updatedCharacter, achievement.rewards.tokens);
  }
  
  if (achievement.rewards.experience) {
    const { character: expChar } = addExperience(updatedCharacter, achievement.rewards.experience);
    updatedCharacter = expChar;
  }
  
  if (achievement.rewards.items) {
    for (const item of achievement.rewards.items) {
      updatedCharacter = addItemToInventory(updatedCharacter, item.itemId, item.quantity);
    }
  }
  
  return updatedCharacter;
}

// ============================================
// DAILY REWARDS
// ============================================

export function checkDailyReward(gameState: GameState): { canClaim: boolean; streakBonus: number; baseReward: number } {
  const { dailyRewards } = gameState;
  const now = Date.now();
  const lastClaim = dailyRewards.lastClaimed;
  
  // Check if 24 hours have passed
  const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60);
  const canClaim = hoursSinceLastClaim >= 24;
  
  // Calculate streak (broken if more than 48 hours)
  const streakBroken = hoursSinceLastClaim > 48;
  const currentStreak = streakBroken ? 0 : dailyRewards.currentStreak;
  
  const baseReward = TOKEN_RATES.dailyLogin;
  const streakBonus = currentStreak * TOKEN_RATES.streakBonus;
  
  return { canClaim, streakBonus, baseReward };
}

export function claimDailyReward(gameState: GameState): GameState {
  const { canClaim, streakBonus, baseReward } = checkDailyReward(gameState);
  if (!canClaim) return gameState;
  
  const now = Date.now();
  const hoursSinceLastClaim = (now - gameState.dailyRewards.lastClaimed) / (1000 * 60 * 60);
  const streakBroken = hoursSinceLastClaim > 48;
  
  const newStreak = streakBroken ? 1 : gameState.dailyRewards.currentStreak + 1;
  const totalReward = baseReward + (streakBroken ? 0 : streakBonus);
  
  return {
    ...gameState,
    character: addTokens(gameState.character, totalReward),
    dailyRewards: {
      lastClaimed: now,
      currentStreak: newStreak,
      totalDaysClaimed: gameState.dailyRewards.totalDaysClaimed + 1,
    },
    statistics: {
      ...gameState.statistics,
      tokensEarned: gameState.statistics.tokensEarned + totalReward,
      longestStreak: Math.max(gameState.statistics.longestStreak, newStreak),
    },
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getStatTotal(stats: CharacterStats): number {
  return stats.land + stats.air + stats.water + stats.self;
}

export function getQuestById(questId: string): Quest | undefined {
  return QUESTS.find(q => q.id === questId);
}

export function getAchievementById(achievementId: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === achievementId);
}

export function getItemById(itemId: string): InventoryItem | undefined {
  return ITEMS[itemId];
}
