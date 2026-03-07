/**
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The The The L.A.W.S. Collective, LLC
 * 
 * Core type definitions for the game engine
 */

// ============================================
// CHARACTER SYSTEM
// ============================================

export type RealmType = "land" | "air" | "water" | "self";
export type GameLocation = RealmType | "hub" | "house";

export interface CharacterStats {
  land: number;    // Stability, resources, ancestral connection
  air: number;     // Knowledge, communication, wisdom
  water: number;   // Healing, balance, emotional intelligence
  self: number;    // Purpose, skills, financial literacy
}

export interface Character {
  id: string;
  name: string;
  title: string;
  level: number;
  experience: number;
  experienceToNext: number;
  stats: CharacterStats;
  tokens: number;
  currentLocation: GameLocation;
  completedQuests: string[];
  activeQuests: string[];
  achievements: string[];
  inventory: InventoryItem[];
  equipment: Equipment;
  energy: number;
  maxEnergy: number;
  health: number;
  maxHealth: number;
  createdAt: number;
  lastPlayedAt: number;
  totalPlayTime: number; // in seconds
  dailyLoginStreak: number;
  lastDailyReward: number;
}

export interface Equipment {
  head?: InventoryItem;
  body?: InventoryItem;
  hands?: InventoryItem;
  feet?: InventoryItem;
  accessory?: InventoryItem;
  tool?: InventoryItem;
}

// ============================================
// RANK SYSTEM
// ============================================

export interface Rank {
  id: string;
  name: string;
  minLevel: number;
  icon: string;
  description: string;
  perks: string[];
}

export const RANKS: Rank[] = [
  { id: "seedling", name: "Seedling", minLevel: 1, icon: "🌱", description: "A new journey begins", perks: ["Basic quests unlocked"] },
  { id: "sprout", name: "Sprout", minLevel: 5, icon: "🌿", description: "Growing stronger", perks: ["Energy +10", "New quests unlocked"] },
  { id: "sapling", name: "Sapling", minLevel: 10, icon: "🌳", description: "Taking root", perks: ["Energy +20", "Crafting unlocked"] },
  { id: "tree", name: "Tree", minLevel: 20, icon: "🌲", description: "Standing tall", perks: ["Energy +30", "Advanced quests"] },
  { id: "grove", name: "Grove", minLevel: 35, icon: "🏕️", description: "Strength in numbers", perks: ["Energy +40", "House building unlocked"] },
  { id: "forest", name: "Forest", minLevel: 50, icon: "🌳🌲🌳", description: "A force of nature", perks: ["Energy +50", "Master quests"] },
  { id: "elder", name: "Elder", minLevel: 70, icon: "🏛️", description: "Wisdom of ages", perks: ["Energy +60", "Mentor abilities"] },
  { id: "sovereign", name: "Sovereign", minLevel: 100, icon: "👑", description: "True sovereignty achieved", perks: ["All abilities unlocked", "Legacy system"] },
];

// ============================================
// INVENTORY SYSTEM
// ============================================

export type ItemType = "scroll" | "tool" | "artifact" | "resource" | "key" | "equipment" | "consumable" | "cosmetic";
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type EquipmentSlot = "head" | "body" | "hands" | "feet" | "accessory" | "tool";

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  quantity: number;
  icon: string;
  stackable: boolean;
  maxStack: number;
  sellValue: number;
  effect?: ItemEffect;
  equipSlot?: EquipmentSlot;
  realm?: RealmType; // Which realm this item is associated with
  craftingRecipe?: CraftingRecipe;
}

export interface ItemEffect {
  type: "stat_boost" | "energy_restore" | "health_restore" | "experience_boost" | "token_boost";
  stat?: keyof CharacterStats;
  value: number;
  duration?: number; // in seconds, undefined = permanent
}

export interface CraftingRecipe {
  ingredients: { itemId: string; quantity: number }[];
  craftingTime: number; // in seconds
  requiredLevel: number;
  requiredRealm?: RealmType;
}

// ============================================
// QUEST SYSTEM
// ============================================

export type QuestDifficulty = "beginner" | "intermediate" | "advanced" | "master" | "legendary";
export type QuestStatus = "locked" | "available" | "active" | "completed" | "failed";
export type MiniGameType = "trivia" | "memory" | "math" | "reflection" | "meditation" | "puzzle" | "trading" | "rhythm" | "word" | "strategy";

export interface Quest {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  realm: RealmType;
  difficulty: QuestDifficulty;
  chapter: number;
  requirements: QuestRequirements;
  rewards: QuestRewards;
  status: QuestStatus;
  miniGame?: MiniGameType;
  miniGameConfig?: MiniGameConfig;
  energyCost: number;
  estimatedTime: number; // in minutes
  repeatability: "once" | "daily" | "weekly" | "unlimited";
  lastCompleted?: number;
  completionCount: number;
  storyline?: string; // ID of storyline this quest belongs to
  prerequisites?: string[]; // Quest IDs that must be completed first
  npcGiver?: string; // NPC ID who gives this quest
}

export interface QuestRequirements {
  level?: number;
  stats?: Partial<CharacterStats>;
  items?: { itemId: string; quantity: number }[];
  quests?: string[]; // Required completed quests
  achievements?: string[];
}

export interface QuestRewards {
  experience: number;
  tokens: number;
  items?: { itemId: string; quantity: number; chance?: number }[];
  statBoosts?: Partial<CharacterStats>;
  achievements?: string[];
  unlocks?: string[]; // Quest IDs or feature IDs to unlock
}

export interface MiniGameConfig {
  type: MiniGameType;
  difficulty: number; // 1-10
  timeLimit?: number; // in seconds
  questionCount?: number;
  passingScore?: number; // percentage
  customData?: Record<string, any>;
}

// ============================================
// NPC SYSTEM
// ============================================

export type NPCRole = "quest_giver" | "merchant" | "mentor" | "guide" | "antagonist" | "ally";

export interface NPC {
  id: string;
  name: string;
  title: string;
  description: string;
  realm: GameLocation;
  role: NPCRole[];
  portrait: string; // emoji or image path
  dialogue: DialogueTree;
  shopInventory?: ShopItem[];
  questIds?: string[];
  affinity: number; // -100 to 100, relationship with player
  affinityThresholds?: AffinityThreshold[];
}

export interface DialogueTree {
  greeting: DialogueNode;
  nodes: Record<string, DialogueNode>;
}

export interface DialogueNode {
  id: string;
  text: string;
  speaker: "npc" | "player";
  responses?: DialogueResponse[];
  effects?: DialogueEffect[];
  conditions?: DialogueCondition[];
}

export interface DialogueResponse {
  text: string;
  nextNodeId?: string;
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
}

export interface DialogueCondition {
  type: "level" | "stat" | "item" | "quest" | "affinity" | "achievement";
  target: string;
  operator: "gte" | "lte" | "eq" | "neq";
  value: number | string | boolean;
}

export interface DialogueEffect {
  type: "affinity" | "item" | "quest" | "stat" | "token";
  target: string;
  value: number | string;
}

export interface AffinityThreshold {
  level: number;
  title: string;
  perks: string[];
  unlockedDialogue?: string[];
  unlockedQuests?: string[];
}

export interface ShopItem {
  itemId: string;
  price: number;
  currency: "tokens" | "gold" | "special";
  stock?: number; // undefined = unlimited
  restockTime?: number; // in seconds
  requiredAffinity?: number;
}

// ============================================
// HOUSE SYSTEM (Family Legacy)
// ============================================

export interface House {
  id: string;
  name: string;
  motto: string;
  crest: HouseCrest;
  level: number;
  experience: number;
  experienceToNext: number;
  founded: number; // timestamp
  generation: number;
  members: HouseMember[];
  treasury: number; // tokens
  properties: HouseProperty[];
  achievements: string[];
  alliances: string[]; // other House IDs
  legacyPoints: number;
  attributes: HouseAttributes;
}

export interface HouseCrest {
  shield: string; // shape
  primaryColor: string;
  secondaryColor: string;
  emblem: string; // emoji or icon
  banner: string;
}

export interface HouseAttributes {
  land: number;  // Property and resource bonuses
  air: number;   // Knowledge and education bonuses
  water: number; // Healing and relationship bonuses
  self: number;  // Financial and business bonuses
}

export interface HouseMember {
  characterId: string;
  role: "founder" | "heir" | "elder" | "member";
  joinedAt: number;
  contribution: number;
}

export interface HouseProperty {
  id: string;
  name: string;
  type: "land" | "building" | "business" | "artifact";
  realm: RealmType;
  level: number;
  income: number; // tokens per day
  bonuses: Partial<CharacterStats>;
}

// ============================================
// ACHIEVEMENT SYSTEM
// ============================================

export type AchievementCategory = "quests" | "exploration" | "collection" | "social" | "mastery" | "legacy" | "special";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: ItemRarity;
  hidden: boolean; // Don't show until unlocked
  requirements: AchievementRequirement[];
  rewards: AchievementReward;
  progress?: number; // 0-100 for progressive achievements
  unlockedAt?: number;
}

export interface AchievementRequirement {
  type: "quest_count" | "level" | "stat" | "item_collect" | "npc_affinity" | "playtime" | "streak" | "custom";
  target: string | number;
  current?: number;
}

export interface AchievementReward {
  tokens?: number;
  experience?: number;
  items?: { itemId: string; quantity: number }[];
  title?: string;
  cosmetic?: string;
}

// ============================================
// GAME STATE
// ============================================

export interface GameState {
  character: Character;
  house?: House;
  settings: GameSettings;
  statistics: GameStatistics;
  dailyRewards: DailyRewardState;
  tutorials: TutorialState;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  notifications: boolean;
  autoSave: boolean;
  language: string;
  theme: "light" | "dark" | "auto";
  accessibility: AccessibilitySettings;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
}

export interface GameStatistics {
  totalPlayTime: number;
  questsCompleted: number;
  questsFailed: number;
  miniGamesPlayed: number;
  miniGamesWon: number;
  tokensEarned: number;
  tokensSpent: number;
  itemsCollected: number;
  itemsCrafted: number;
  npcsInteracted: number;
  achievementsUnlocked: number;
  highestLevel: number;
  longestStreak: number;
}

export interface DailyRewardState {
  lastClaimed: number;
  currentStreak: number;
  totalDaysClaimed: number;
}

export interface TutorialState {
  completed: string[];
  skipped: string[];
  currentTutorial?: string;
}

// ============================================
// SAVE SYSTEM
// ============================================

export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  checksum: string;
}

export interface CloudSaveMetadata {
  userId: string;
  saveSlot: number;
  lastModified: number;
  characterName: string;
  characterLevel: number;
  playTime: number;
  platform: string;
}
