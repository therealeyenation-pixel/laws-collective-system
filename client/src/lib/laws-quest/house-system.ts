/**
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The The The L.A.W.S. Collective, LLC
 * 
 * House Building System - Family Legacy Progression
 * 
 * The House system represents the player's family legacy within the game.
 * It mirrors the real-world House structure of the LuvOnPurpose Trust,
 * teaching players about generational wealth building through gameplay.
 */

import type { Character } from "./types";

// ============================================
// HOUSE TYPES AND INTERFACES
// ============================================

export interface House {
  id: string;
  name: string;
  motto: string;
  crest: HouseCrest;
  level: number;
  experience: number;
  foundedDate: number;
  
  // House Stats
  prosperity: number;      // Overall wealth/success
  wisdom: number;          // Knowledge passed down
  harmony: number;         // Family unity
  legacy: number;          // Long-term impact
  
  // Resources
  treasury: number;        // Accumulated tokens
  landHoldings: LandHolding[];
  heirlooms: Heirloom[];
  traditions: Tradition[];
  
  // Members
  founder: HouseMember;
  members: HouseMember[];
  generations: number;
  
  // Achievements
  milestones: HouseMilestone[];
  
  // Governance
  constitution: HouseConstitution;
}

export interface HouseCrest {
  primaryColor: string;
  secondaryColor: string;
  symbol: string;
  border: string;
}

export interface HouseMember {
  id: string;
  name: string;
  role: "founder" | "elder" | "guardian" | "heir" | "member";
  generation: number;
  joinedDate: number;
  contributions: number;
  isActive: boolean;
  characterId?: string; // Link to player character
}

export interface LandHolding {
  id: string;
  name: string;
  type: "homestead" | "farm" | "business" | "sanctuary" | "academy";
  level: number;
  income: number;        // Tokens per day
  maintenanceCost: number;
  bonuses: LandBonus[];
  acquiredDate: number;
}

export interface LandBonus {
  stat: "land" | "air" | "water" | "self" | "prosperity" | "wisdom" | "harmony" | "legacy";
  value: number;
}

export interface Heirloom {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  generation: number;     // Which generation created it
  story: string;          // The story behind it
  bonuses: HeirloomBonus[];
  isEquipped: boolean;
}

export interface HeirloomBonus {
  type: "stat" | "income" | "experience" | "affinity";
  stat?: "land" | "air" | "water" | "self";
  value: number;
}

export interface Tradition {
  id: string;
  name: string;
  description: string;
  type: "ceremony" | "practice" | "value" | "skill";
  realm: "land" | "air" | "water" | "self";
  effect: TraditionEffect;
  establishedGeneration: number;
  strength: number;       // 1-100, increases with practice
}

export interface TraditionEffect {
  type: "stat_boost" | "income_boost" | "experience_boost" | "affinity_boost";
  value: number;
  duration?: number;      // In days, undefined = permanent
}

export interface HouseMilestone {
  id: string;
  name: string;
  description: string;
  achievedDate: number;
  generation: number;
  reward: MilestoneReward;
}

export interface MilestoneReward {
  type: "tokens" | "heirloom" | "land" | "stat" | "title";
  value: number | string;
  itemId?: string;
}

export interface HouseConstitution {
  principles: string[];
  wealthDistribution: WealthDistribution;
  successionRules: string[];
  memberRequirements: string[];
}

export interface WealthDistribution {
  treasury: number;       // Percentage kept in treasury
  members: number;        // Percentage distributed to members
  reinvestment: number;   // Percentage for growth
  charity: number;        // Percentage for community
}

// ============================================
// HOUSE LEVELS AND PROGRESSION
// ============================================

export interface HouseLevel {
  level: number;
  name: string;
  requiredExperience: number;
  unlocks: string[];
  bonuses: { stat: string; value: number }[];
}

export const HOUSE_LEVELS: HouseLevel[] = [
  {
    level: 1,
    name: "Seedling House",
    requiredExperience: 0,
    unlocks: ["Basic Treasury", "Family Motto"],
    bonuses: [],
  },
  {
    level: 2,
    name: "Rooted House",
    requiredExperience: 100,
    unlocks: ["House Crest", "First Tradition"],
    bonuses: [{ stat: "land", value: 1 }],
  },
  {
    level: 3,
    name: "Growing House",
    requiredExperience: 300,
    unlocks: ["Land Holdings (Homestead)", "Second Member Slot"],
    bonuses: [{ stat: "prosperity", value: 5 }],
  },
  {
    level: 4,
    name: "Flourishing House",
    requiredExperience: 600,
    unlocks: ["Heirloom Creation", "Third Member Slot"],
    bonuses: [{ stat: "air", value: 1 }, { stat: "wisdom", value: 5 }],
  },
  {
    level: 5,
    name: "Established House",
    requiredExperience: 1000,
    unlocks: ["Land Holdings (Farm)", "House Constitution"],
    bonuses: [{ stat: "water", value: 1 }, { stat: "harmony", value: 5 }],
  },
  {
    level: 6,
    name: "Prosperous House",
    requiredExperience: 1500,
    unlocks: ["Business Ventures", "Fourth Member Slot"],
    bonuses: [{ stat: "self", value: 1 }, { stat: "prosperity", value: 10 }],
  },
  {
    level: 7,
    name: "Distinguished House",
    requiredExperience: 2200,
    unlocks: ["Sanctuary", "Advanced Traditions"],
    bonuses: [{ stat: "legacy", value: 10 }],
  },
  {
    level: 8,
    name: "Noble House",
    requiredExperience: 3000,
    unlocks: ["Academy", "Fifth Member Slot"],
    bonuses: [{ stat: "wisdom", value: 10 }, { stat: "air", value: 2 }],
  },
  {
    level: 9,
    name: "Sovereign House",
    requiredExperience: 4000,
    unlocks: ["Multi-Generational Planning", "Legacy Projects"],
    bonuses: [{ stat: "legacy", value: 20 }],
  },
  {
    level: 10,
    name: "Dynasty",
    requiredExperience: 5500,
    unlocks: ["Dynasty Features", "Unlimited Members"],
    bonuses: [
      { stat: "land", value: 3 },
      { stat: "air", value: 3 },
      { stat: "water", value: 3 },
      { stat: "self", value: 3 },
      { stat: "legacy", value: 50 },
    ],
  },
];

// ============================================
// LAND HOLDING TYPES
// ============================================

export interface LandHoldingType {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  baseIncome: number;
  maintenanceCost: number;
  requiredHouseLevel: number;
  maxLevel: number;
  bonuses: LandBonus[];
}

export const LAND_HOLDING_TYPES: LandHoldingType[] = [
  {
    id: "homestead",
    name: "Family Homestead",
    description: "The foundation of your House. A place where family gathers and traditions are born.",
    baseCost: 500,
    baseIncome: 10,
    maintenanceCost: 2,
    requiredHouseLevel: 3,
    maxLevel: 5,
    bonuses: [
      { stat: "harmony", value: 5 },
      { stat: "land", value: 1 },
    ],
  },
  {
    id: "farm",
    name: "Productive Farm",
    description: "Land that works for you. Generates steady income and teaches the value of cultivation.",
    baseCost: 1000,
    baseIncome: 25,
    maintenanceCost: 5,
    requiredHouseLevel: 5,
    maxLevel: 5,
    bonuses: [
      { stat: "prosperity", value: 10 },
      { stat: "self", value: 1 },
    ],
  },
  {
    id: "business",
    name: "Family Business",
    description: "An enterprise that builds wealth and teaches entrepreneurship to future generations.",
    baseCost: 2500,
    baseIncome: 50,
    maintenanceCost: 15,
    requiredHouseLevel: 6,
    maxLevel: 10,
    bonuses: [
      { stat: "prosperity", value: 20 },
      { stat: "self", value: 2 },
      { stat: "wisdom", value: 5 },
    ],
  },
  {
    id: "sanctuary",
    name: "Family Sanctuary",
    description: "A place of peace and healing. Where family members restore their spirits.",
    baseCost: 2000,
    baseIncome: 15,
    maintenanceCost: 10,
    requiredHouseLevel: 7,
    maxLevel: 5,
    bonuses: [
      { stat: "harmony", value: 20 },
      { stat: "water", value: 3 },
    ],
  },
  {
    id: "academy",
    name: "House Academy",
    description: "A center of learning where knowledge is preserved and passed to future generations.",
    baseCost: 5000,
    baseIncome: 30,
    maintenanceCost: 20,
    requiredHouseLevel: 8,
    maxLevel: 5,
    bonuses: [
      { stat: "wisdom", value: 30 },
      { stat: "air", value: 5 },
      { stat: "legacy", value: 10 },
    ],
  },
];

// ============================================
// TRADITION TEMPLATES
// ============================================

export interface TraditionTemplate {
  id: string;
  name: string;
  description: string;
  type: "ceremony" | "practice" | "value" | "skill";
  realm: "land" | "air" | "water" | "self";
  effect: TraditionEffect;
  requiredHouseLevel: number;
}

export const TRADITION_TEMPLATES: TraditionTemplate[] = [
  // LAND Traditions
  {
    id: "trad-ancestry-day",
    name: "Ancestry Remembrance Day",
    description: "An annual ceremony honoring ancestors and sharing family stories.",
    type: "ceremony",
    realm: "land",
    effect: { type: "stat_boost", value: 2 },
    requiredHouseLevel: 2,
  },
  {
    id: "trad-land-stewardship",
    name: "Land Stewardship Practice",
    description: "Regular care and improvement of family lands.",
    type: "practice",
    realm: "land",
    effect: { type: "income_boost", value: 10 },
    requiredHouseLevel: 3,
  },
  
  // AIR Traditions
  {
    id: "trad-knowledge-sharing",
    name: "Knowledge Sharing Circle",
    description: "Weekly gatherings where family members teach each other.",
    type: "practice",
    realm: "air",
    effect: { type: "experience_boost", value: 15 },
    requiredHouseLevel: 2,
  },
  {
    id: "trad-mentorship",
    name: "Elder Mentorship",
    description: "Formal mentorship between generations.",
    type: "skill",
    realm: "air",
    effect: { type: "stat_boost", value: 3 },
    requiredHouseLevel: 4,
  },
  
  // WATER Traditions
  {
    id: "trad-healing-circle",
    name: "Family Healing Circle",
    description: "Regular gatherings for emotional support and healing.",
    type: "ceremony",
    realm: "water",
    effect: { type: "stat_boost", value: 2 },
    requiredHouseLevel: 2,
  },
  {
    id: "trad-forgiveness",
    name: "Forgiveness Practice",
    description: "A commitment to address and resolve family conflicts.",
    type: "value",
    realm: "water",
    effect: { type: "affinity_boost", value: 5 },
    requiredHouseLevel: 5,
  },
  
  // SELF Traditions
  {
    id: "trad-financial-literacy",
    name: "Financial Education",
    description: "Teaching financial skills to every generation.",
    type: "skill",
    realm: "self",
    effect: { type: "income_boost", value: 15 },
    requiredHouseLevel: 2,
  },
  {
    id: "trad-purpose-ceremony",
    name: "Purpose Discovery Ceremony",
    description: "A coming-of-age ceremony helping young members find their purpose.",
    type: "ceremony",
    realm: "self",
    effect: { type: "stat_boost", value: 3 },
    requiredHouseLevel: 4,
  },
];

// ============================================
// HOUSE MILESTONES
// ============================================

export interface MilestoneDefinition {
  id: string;
  name: string;
  description: string;
  condition: MilestoneCondition;
  reward: MilestoneReward;
}

export interface MilestoneCondition {
  type: "house_level" | "treasury" | "members" | "generations" | "traditions" | "land_holdings" | "heirlooms";
  value: number;
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: "milestone-founded",
    name: "House Founded",
    description: "Your House has been established!",
    condition: { type: "house_level", value: 1 },
    reward: { type: "tokens", value: 100 },
  },
  {
    id: "milestone-first-tradition",
    name: "First Tradition",
    description: "Established your first family tradition.",
    condition: { type: "traditions", value: 1 },
    reward: { type: "tokens", value: 50 },
  },
  {
    id: "milestone-first-land",
    name: "First Land Holding",
    description: "Acquired your first piece of land.",
    condition: { type: "land_holdings", value: 1 },
    reward: { type: "tokens", value: 100 },
  },
  {
    id: "milestone-growing-family",
    name: "Growing Family",
    description: "Your House has 5 members.",
    condition: { type: "members", value: 5 },
    reward: { type: "stat", value: 2 },
  },
  {
    id: "milestone-wealthy",
    name: "Prosperous Treasury",
    description: "Accumulated 1,000 tokens in the treasury.",
    condition: { type: "treasury", value: 1000 },
    reward: { type: "title", value: "Prosperous" },
  },
  {
    id: "milestone-second-gen",
    name: "Second Generation",
    description: "Your House spans two generations.",
    condition: { type: "generations", value: 2 },
    reward: { type: "heirloom", value: "heirloom-founders-ring" },
  },
  {
    id: "milestone-tradition-keeper",
    name: "Tradition Keeper",
    description: "Established 5 family traditions.",
    condition: { type: "traditions", value: 5 },
    reward: { type: "tokens", value: 200 },
  },
  {
    id: "milestone-land-baron",
    name: "Land Baron",
    description: "Own 5 land holdings.",
    condition: { type: "land_holdings", value: 5 },
    reward: { type: "title", value: "Baron" },
  },
  {
    id: "milestone-dynasty",
    name: "Dynasty Achieved",
    description: "Reached House Level 10.",
    condition: { type: "house_level", value: 10 },
    reward: { type: "heirloom", value: "heirloom-dynasty-crown" },
  },
];

// ============================================
// HOUSE HELPER FUNCTIONS
// ============================================

export function createNewHouse(name: string, motto: string, founderId: string, founderName: string): House {
  return {
    id: `house-${Date.now()}`,
    name,
    motto,
    crest: {
      primaryColor: "#8B4513",
      secondaryColor: "#DAA520",
      symbol: "🏠",
      border: "shield",
    },
    level: 1,
    experience: 0,
    foundedDate: Date.now(),
    prosperity: 10,
    wisdom: 10,
    harmony: 10,
    legacy: 0,
    treasury: 0,
    landHoldings: [],
    heirlooms: [],
    traditions: [],
    founder: {
      id: founderId,
      name: founderName,
      role: "founder",
      generation: 1,
      joinedDate: Date.now(),
      contributions: 0,
      isActive: true,
    },
    members: [],
    generations: 1,
    milestones: [],
    constitution: {
      principles: ["Honor the ancestors", "Build for the future", "Support each other"],
      wealthDistribution: {
        treasury: 40,
        members: 30,
        reinvestment: 20,
        charity: 10,
      },
      successionRules: ["Eldest heir inherits leadership", "All members have voice in decisions"],
      memberRequirements: ["Commitment to House values", "Active participation"],
    },
  };
}

export function getHouseLevel(experience: number): HouseLevel {
  for (let i = HOUSE_LEVELS.length - 1; i >= 0; i--) {
    if (experience >= HOUSE_LEVELS[i].requiredExperience) {
      return HOUSE_LEVELS[i];
    }
  }
  return HOUSE_LEVELS[0];
}

export function getNextHouseLevel(currentLevel: number): HouseLevel | null {
  const nextIndex = HOUSE_LEVELS.findIndex(l => l.level === currentLevel + 1);
  return nextIndex >= 0 ? HOUSE_LEVELS[nextIndex] : null;
}

export function calculateHouseIncome(house: House): number {
  let income = 0;
  
  // Income from land holdings
  for (const holding of house.landHoldings) {
    income += holding.income - holding.maintenanceCost;
  }
  
  // Bonus from traditions
  for (const tradition of house.traditions) {
    if (tradition.effect.type === "income_boost") {
      income += tradition.effect.value * (tradition.strength / 100);
    }
  }
  
  return Math.max(0, Math.round(income));
}

export function canPurchaseLandHolding(house: House, holdingType: LandHoldingType): { canPurchase: boolean; reason?: string } {
  if (house.level < holdingType.requiredHouseLevel) {
    return { canPurchase: false, reason: `Requires House Level ${holdingType.requiredHouseLevel}` };
  }
  
  if (house.treasury < holdingType.baseCost) {
    return { canPurchase: false, reason: `Insufficient treasury (need ${holdingType.baseCost} tokens)` };
  }
  
  return { canPurchase: true };
}

export function purchaseLandHolding(house: House, holdingTypeId: string): House {
  const holdingType = LAND_HOLDING_TYPES.find(t => t.id === holdingTypeId);
  if (!holdingType) return house;
  
  const newHolding: LandHolding = {
    id: `holding-${Date.now()}`,
    name: holdingType.name,
    type: holdingTypeId as any,
    level: 1,
    income: holdingType.baseIncome,
    maintenanceCost: holdingType.maintenanceCost,
    bonuses: holdingType.bonuses,
    acquiredDate: Date.now(),
  };
  
  return {
    ...house,
    treasury: house.treasury - holdingType.baseCost,
    landHoldings: [...house.landHoldings, newHolding],
  };
}

export function establishTradition(house: House, templateId: string): House {
  const template = TRADITION_TEMPLATES.find(t => t.id === templateId);
  if (!template) return house;
  
  const newTradition: Tradition = {
    id: `trad-${Date.now()}`,
    name: template.name,
    description: template.description,
    type: template.type,
    realm: template.realm,
    effect: template.effect,
    establishedGeneration: house.generations,
    strength: 10, // Starts at 10%, grows with practice
  };
  
  return {
    ...house,
    traditions: [...house.traditions, newTradition],
  };
}

export function practiceTradition(house: House, traditionId: string): House {
  const traditions = house.traditions.map(t => {
    if (t.id === traditionId) {
      return {
        ...t,
        strength: Math.min(100, t.strength + 5),
      };
    }
    return t;
  });
  
  return {
    ...house,
    traditions,
    experience: house.experience + 10,
  };
}

export function checkMilestones(house: House): MilestoneDefinition[] {
  const achievedIds = house.milestones.map(m => m.id);
  const newMilestones: MilestoneDefinition[] = [];
  
  for (const milestone of MILESTONE_DEFINITIONS) {
    if (achievedIds.includes(milestone.id)) continue;
    
    let achieved = false;
    switch (milestone.condition.type) {
      case "house_level":
        achieved = house.level >= milestone.condition.value;
        break;
      case "treasury":
        achieved = house.treasury >= milestone.condition.value;
        break;
      case "members":
        achieved = house.members.length + 1 >= milestone.condition.value;
        break;
      case "generations":
        achieved = house.generations >= milestone.condition.value;
        break;
      case "traditions":
        achieved = house.traditions.length >= milestone.condition.value;
        break;
      case "land_holdings":
        achieved = house.landHoldings.length >= milestone.condition.value;
        break;
      case "heirlooms":
        achieved = house.heirlooms.length >= milestone.condition.value;
        break;
    }
    
    if (achieved) {
      newMilestones.push(milestone);
    }
  }
  
  return newMilestones;
}

export function awardMilestone(house: House, milestoneId: string): House {
  const definition = MILESTONE_DEFINITIONS.find(m => m.id === milestoneId);
  if (!definition) return house;
  
  const newMilestone: HouseMilestone = {
    id: milestoneId,
    name: definition.name,
    description: definition.description,
    achievedDate: Date.now(),
    generation: house.generations,
    reward: definition.reward,
  };
  
  let updatedHouse = {
    ...house,
    milestones: [...house.milestones, newMilestone],
  };
  
  // Apply reward
  if (definition.reward.type === "tokens") {
    updatedHouse.treasury += definition.reward.value as number;
  }
  
  return updatedHouse;
}

// ============================================
// HOUSE STAT CALCULATIONS
// ============================================

export function calculateHouseStats(house: House): { prosperity: number; wisdom: number; harmony: number; legacy: number } {
  let prosperity = house.prosperity;
  let wisdom = house.wisdom;
  let harmony = house.harmony;
  let legacy = house.legacy;
  
  // Bonuses from land holdings
  for (const holding of house.landHoldings) {
    for (const bonus of holding.bonuses) {
      switch (bonus.stat) {
        case "prosperity": prosperity += bonus.value * holding.level; break;
        case "wisdom": wisdom += bonus.value * holding.level; break;
        case "harmony": harmony += bonus.value * holding.level; break;
        case "legacy": legacy += bonus.value * holding.level; break;
      }
    }
  }
  
  // Bonuses from traditions
  for (const tradition of house.traditions) {
    const strengthMultiplier = tradition.strength / 100;
    if (tradition.effect.type === "stat_boost") {
      switch (tradition.realm) {
        case "land": prosperity += tradition.effect.value * strengthMultiplier; break;
        case "air": wisdom += tradition.effect.value * strengthMultiplier; break;
        case "water": harmony += tradition.effect.value * strengthMultiplier; break;
        case "self": legacy += tradition.effect.value * strengthMultiplier; break;
      }
    }
  }
  
  // Bonuses from house level
  const levelBonuses = HOUSE_LEVELS.find(l => l.level === house.level)?.bonuses || [];
  for (const bonus of levelBonuses) {
    switch (bonus.stat) {
      case "prosperity": prosperity += bonus.value; break;
      case "wisdom": wisdom += bonus.value; break;
      case "harmony": harmony += bonus.value; break;
      case "legacy": legacy += bonus.value; break;
    }
  }
  
  return {
    prosperity: Math.round(prosperity),
    wisdom: Math.round(wisdom),
    harmony: Math.round(harmony),
    legacy: Math.round(legacy),
  };
}
