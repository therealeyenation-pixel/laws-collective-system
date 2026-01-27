/**
 * L.A.W.S. Quest Commercial Standalone Service
 * Covers: RPG mechanics, character progression, quests, inventory, skills, multiplayer
 */

// ============================================================================
// CHARACTER SYSTEM
// ============================================================================

export interface Character {
  id: string;
  userId: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  stats: CharacterStats;
  skills: CharacterSkill[];
  inventory: InventoryItem[];
  equipment: Equipment;
  achievements: string[];
  questLog: QuestProgress[];
  createdAt: number;
  lastActive: number;
}

export type CharacterClass = 'land_guardian' | 'air_scholar' | 'water_healer' | 'self_master' | 'balanced_seeker';

export interface CharacterStats {
  strength: number;
  wisdom: number;
  charisma: number;
  resilience: number;
  creativity: number;
  leadership: number;
}

export interface CharacterSkill {
  id: string;
  name: string;
  category: 'land' | 'air' | 'water' | 'self';
  level: number;
  experience: number;
  maxLevel: number;
  description: string;
  unlocked: boolean;
}

export interface Equipment {
  head?: InventoryItem;
  body?: InventoryItem;
  hands?: InventoryItem;
  feet?: InventoryItem;
  accessory1?: InventoryItem;
  accessory2?: InventoryItem;
  tool?: InventoryItem;
}

const characters: Character[] = [];

const classBaseStats: Record<CharacterClass, CharacterStats> = {
  land_guardian: { strength: 12, wisdom: 8, charisma: 8, resilience: 12, creativity: 6, leadership: 10 },
  air_scholar: { strength: 6, wisdom: 14, charisma: 10, resilience: 8, creativity: 12, leadership: 6 },
  water_healer: { strength: 8, wisdom: 10, charisma: 12, resilience: 10, creativity: 10, leadership: 6 },
  self_master: { strength: 10, wisdom: 10, charisma: 8, resilience: 14, creativity: 8, leadership: 6 },
  balanced_seeker: { strength: 10, wisdom: 10, charisma: 10, resilience: 10, creativity: 10, leadership: 6 }
};

export function createCharacter(
  userId: string,
  name: string,
  characterClass: CharacterClass
): Character {
  const baseStats = classBaseStats[characterClass];
  const character: Character = {
    id: `CHAR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    name,
    class: characterClass,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    health: 100,
    maxHealth: 100,
    energy: 50,
    maxEnergy: 50,
    stats: { ...baseStats },
    skills: getStarterSkills(characterClass),
    inventory: [],
    equipment: {},
    achievements: [],
    questLog: [],
    createdAt: Date.now(),
    lastActive: Date.now()
  };
  characters.push(character);
  return character;
}

function getStarterSkills(characterClass: CharacterClass): CharacterSkill[] {
  const skills: CharacterSkill[] = [
    { id: 'SK-LAND-1', name: 'Earth Connection', category: 'land', level: 1, experience: 0, maxLevel: 10, description: 'Connect with ancestral lands', unlocked: characterClass === 'land_guardian' },
    { id: 'SK-AIR-1', name: 'Knowledge Seeking', category: 'air', level: 1, experience: 0, maxLevel: 10, description: 'Absorb wisdom faster', unlocked: characterClass === 'air_scholar' },
    { id: 'SK-WATER-1', name: 'Emotional Balance', category: 'water', level: 1, experience: 0, maxLevel: 10, description: 'Maintain inner peace', unlocked: characterClass === 'water_healer' },
    { id: 'SK-SELF-1', name: 'Self Discipline', category: 'self', level: 1, experience: 0, maxLevel: 10, description: 'Build lasting habits', unlocked: characterClass === 'self_master' }
  ];
  return skills;
}

export function gainExperience(characterId: string, amount: number): { leveledUp: boolean; newLevel?: number } {
  const character = characters.find(c => c.id === characterId);
  if (!character) return { leveledUp: false };

  character.experience += amount;
  let leveledUp = false;
  let newLevel = character.level;

  while (character.experience >= character.experienceToNextLevel) {
    character.experience -= character.experienceToNextLevel;
    character.level++;
    character.experienceToNextLevel = Math.floor(character.experienceToNextLevel * 1.5);
    character.maxHealth += 10;
    character.health = character.maxHealth;
    character.maxEnergy += 5;
    character.energy = character.maxEnergy;
    leveledUp = true;
    newLevel = character.level;

    // Increase stats
    Object.keys(character.stats).forEach(stat => {
      (character.stats as any)[stat] += 1;
    });
  }

  character.lastActive = Date.now();
  return { leveledUp, newLevel };
}

export function getCharacter(characterId: string): Character | undefined {
  return characters.find(c => c.id === characterId);
}

export function getCharacterByUser(userId: string): Character | undefined {
  return characters.find(c => c.userId === userId);
}

// ============================================================================
// INVENTORY SYSTEM
// ============================================================================

export interface InventoryItem {
  id: string;
  name: string;
  type: 'equipment' | 'consumable' | 'material' | 'quest' | 'currency';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  quantity: number;
  stackable: boolean;
  equipSlot?: keyof Equipment;
  stats?: Partial<CharacterStats>;
  effects?: ItemEffect[];
  value: number;
}

export interface ItemEffect {
  type: 'heal' | 'energy' | 'buff' | 'debuff';
  value: number;
  duration?: number;
}

const itemTemplates: Omit<InventoryItem, 'id' | 'quantity'>[] = [
  { name: 'Healing Herb', type: 'consumable', rarity: 'common', description: 'Restores 20 health', stackable: true, effects: [{ type: 'heal', value: 20 }], value: 10 },
  { name: 'Energy Potion', type: 'consumable', rarity: 'uncommon', description: 'Restores 30 energy', stackable: true, effects: [{ type: 'energy', value: 30 }], value: 25 },
  { name: 'Wisdom Scroll', type: 'consumable', rarity: 'rare', description: 'Grants 50 XP', stackable: true, value: 100 },
  { name: 'Guardian Helm', type: 'equipment', rarity: 'uncommon', description: 'Protective headgear', stackable: false, equipSlot: 'head', stats: { resilience: 3 }, value: 150 },
  { name: 'Scholar Robe', type: 'equipment', rarity: 'rare', description: 'Enhances wisdom', stackable: false, equipSlot: 'body', stats: { wisdom: 5, creativity: 2 }, value: 300 },
  { name: 'Healer Gloves', type: 'equipment', rarity: 'uncommon', description: 'Gentle touch', stackable: false, equipSlot: 'hands', stats: { charisma: 3 }, value: 120 },
  { name: 'Ancestral Token', type: 'quest', rarity: 'epic', description: 'A token of heritage', stackable: false, value: 0 },
  { name: 'Gold Coin', type: 'currency', rarity: 'common', description: 'Standard currency', stackable: true, value: 1 }
];

export function addItemToInventory(characterId: string, itemName: string, quantity: number = 1): InventoryItem | null {
  const character = characters.find(c => c.id === characterId);
  if (!character) return null;

  const template = itemTemplates.find(t => t.name === itemName);
  if (!template) return null;

  // Check if stackable item already exists
  if (template.stackable) {
    const existing = character.inventory.find(i => i.name === itemName);
    if (existing) {
      existing.quantity += quantity;
      return existing;
    }
  }

  const item: InventoryItem = {
    ...template,
    id: `ITEM-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    quantity
  };
  character.inventory.push(item);
  return item;
}

export function removeItemFromInventory(characterId: string, itemId: string, quantity: number = 1): boolean {
  const character = characters.find(c => c.id === characterId);
  if (!character) return false;

  const itemIndex = character.inventory.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return false;

  const item = character.inventory[itemIndex];
  if (item.quantity <= quantity) {
    character.inventory.splice(itemIndex, 1);
  } else {
    item.quantity -= quantity;
  }
  return true;
}

export function equipItem(characterId: string, itemId: string): boolean {
  const character = characters.find(c => c.id === characterId);
  if (!character) return false;

  const item = character.inventory.find(i => i.id === itemId);
  if (!item || item.type !== 'equipment' || !item.equipSlot) return false;

  // Unequip current item if any
  const currentEquipped = character.equipment[item.equipSlot];
  if (currentEquipped) {
    character.inventory.push(currentEquipped);
    // Remove stats
    if (currentEquipped.stats) {
      Object.entries(currentEquipped.stats).forEach(([stat, value]) => {
        (character.stats as any)[stat] -= value;
      });
    }
  }

  // Equip new item
  character.equipment[item.equipSlot] = item;
  character.inventory = character.inventory.filter(i => i.id !== itemId);

  // Apply stats
  if (item.stats) {
    Object.entries(item.stats).forEach(([stat, value]) => {
      (character.stats as any)[stat] += value;
    });
  }

  return true;
}

export function useConsumable(characterId: string, itemId: string): boolean {
  const character = characters.find(c => c.id === characterId);
  if (!character) return false;

  const item = character.inventory.find(i => i.id === itemId);
  if (!item || item.type !== 'consumable') return false;

  // Apply effects
  if (item.effects) {
    item.effects.forEach(effect => {
      switch (effect.type) {
        case 'heal':
          character.health = Math.min(character.maxHealth, character.health + effect.value);
          break;
        case 'energy':
          character.energy = Math.min(character.maxEnergy, character.energy + effect.value);
          break;
      }
    });
  }

  return removeItemFromInventory(characterId, itemId, 1);
}

// ============================================================================
// QUEST SYSTEM
// ============================================================================

export interface Quest {
  id: string;
  name: string;
  description: string;
  category: 'land' | 'air' | 'water' | 'self' | 'main';
  type: 'main' | 'side' | 'daily' | 'weekly' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  prerequisites: string[];
  timeLimit?: number;
  repeatable: boolean;
  minLevel: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'collect' | 'defeat' | 'explore' | 'learn' | 'craft' | 'interact';
  target: string;
  required: number;
  current?: number;
  completed?: boolean;
}

export interface QuestReward {
  type: 'experience' | 'item' | 'gold' | 'skill_point' | 'achievement';
  value: string | number;
  quantity?: number;
}

export interface QuestProgress {
  questId: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  objectives: { objectiveId: string; current: number; completed: boolean }[];
  startedAt?: number;
  completedAt?: number;
}

const quests: Quest[] = [
  {
    id: 'Q-MAIN-1',
    name: 'The Awakening',
    description: 'Begin your journey of self-discovery',
    category: 'main',
    type: 'main',
    difficulty: 'easy',
    objectives: [
      { id: 'OBJ-1', description: 'Complete the tutorial', type: 'learn', target: 'tutorial', required: 1 },
      { id: 'OBJ-2', description: 'Visit the L.A.W.S. shrine', type: 'explore', target: 'shrine', required: 1 }
    ],
    rewards: [
      { type: 'experience', value: 100 },
      { type: 'item', value: 'Healing Herb', quantity: 5 }
    ],
    prerequisites: [],
    repeatable: false,
    minLevel: 1
  },
  {
    id: 'Q-LAND-1',
    name: 'Roots of Heritage',
    description: 'Explore your ancestral connections',
    category: 'land',
    type: 'side',
    difficulty: 'medium',
    objectives: [
      { id: 'OBJ-1', description: 'Gather ancestral tokens', type: 'collect', target: 'Ancestral Token', required: 3 },
      { id: 'OBJ-2', description: 'Visit the family tree', type: 'explore', target: 'family_tree', required: 1 }
    ],
    rewards: [
      { type: 'experience', value: 200 },
      { type: 'skill_point', value: 1 },
      { type: 'gold', value: 50 }
    ],
    prerequisites: ['Q-MAIN-1'],
    repeatable: false,
    minLevel: 3
  },
  {
    id: 'Q-AIR-1',
    name: 'Breath of Knowledge',
    description: 'Seek wisdom from the elders',
    category: 'air',
    type: 'side',
    difficulty: 'medium',
    objectives: [
      { id: 'OBJ-1', description: 'Read ancient scrolls', type: 'learn', target: 'scrolls', required: 5 },
      { id: 'OBJ-2', description: 'Answer the riddles', type: 'interact', target: 'riddles', required: 3 }
    ],
    rewards: [
      { type: 'experience', value: 250 },
      { type: 'item', value: 'Scholar Robe', quantity: 1 }
    ],
    prerequisites: ['Q-MAIN-1'],
    repeatable: false,
    minLevel: 5
  },
  {
    id: 'Q-WATER-1',
    name: 'Flowing Emotions',
    description: 'Learn to balance your inner waters',
    category: 'water',
    type: 'side',
    difficulty: 'hard',
    objectives: [
      { id: 'OBJ-1', description: 'Complete meditation sessions', type: 'learn', target: 'meditation', required: 7 },
      { id: 'OBJ-2', description: 'Help others heal', type: 'interact', target: 'healing', required: 3 }
    ],
    rewards: [
      { type: 'experience', value: 300 },
      { type: 'item', value: 'Healer Gloves', quantity: 1 },
      { type: 'achievement', value: 'ACH-HEALER' }
    ],
    prerequisites: ['Q-MAIN-1'],
    repeatable: false,
    minLevel: 7
  },
  {
    id: 'Q-SELF-1',
    name: 'Master of Self',
    description: 'Develop unshakeable discipline',
    category: 'self',
    type: 'side',
    difficulty: 'legendary',
    objectives: [
      { id: 'OBJ-1', description: 'Complete daily challenges', type: 'learn', target: 'daily_challenge', required: 30 },
      { id: 'OBJ-2', description: 'Reach level 10', type: 'interact', target: 'level', required: 10 }
    ],
    rewards: [
      { type: 'experience', value: 1000 },
      { type: 'skill_point', value: 5 },
      { type: 'achievement', value: 'ACH-MASTER' }
    ],
    prerequisites: ['Q-LAND-1', 'Q-AIR-1', 'Q-WATER-1'],
    repeatable: false,
    minLevel: 10
  },
  {
    id: 'Q-DAILY-1',
    name: 'Daily Reflection',
    description: 'Take time to reflect on your journey',
    category: 'self',
    type: 'daily',
    difficulty: 'easy',
    objectives: [
      { id: 'OBJ-1', description: 'Complete a reflection', type: 'learn', target: 'reflection', required: 1 }
    ],
    rewards: [
      { type: 'experience', value: 25 },
      { type: 'gold', value: 10 }
    ],
    prerequisites: [],
    repeatable: true,
    minLevel: 1
  }
];

export function getAvailableQuests(characterId: string): Quest[] {
  const character = characters.find(c => c.id === characterId);
  if (!character) return [];

  return quests.filter(quest => {
    // Check level requirement
    if (character.level < quest.minLevel) return false;
    
    // Check prerequisites
    const completedQuests = character.questLog
      .filter(q => q.status === 'completed')
      .map(q => q.questId);
    if (!quest.prerequisites.every(p => completedQuests.includes(p))) return false;
    
    // Check if already completed (for non-repeatable)
    if (!quest.repeatable && completedQuests.includes(quest.id)) return false;
    
    // Check if already active
    if (character.questLog.some(q => q.questId === quest.id && q.status === 'active')) return false;
    
    return true;
  });
}

export function acceptQuest(characterId: string, questId: string): QuestProgress | null {
  const character = characters.find(c => c.id === characterId);
  if (!character) return null;

  const quest = quests.find(q => q.id === questId);
  if (!quest) return null;

  const progress: QuestProgress = {
    questId,
    status: 'active',
    objectives: quest.objectives.map(obj => ({
      objectiveId: obj.id,
      current: 0,
      completed: false
    })),
    startedAt: Date.now()
  };
  character.questLog.push(progress);
  return progress;
}

export function updateQuestProgress(
  characterId: string,
  questId: string,
  objectiveId: string,
  progress: number
): boolean {
  const character = characters.find(c => c.id === characterId);
  if (!character) return false;

  const questProgress = character.questLog.find(q => q.questId === questId && q.status === 'active');
  if (!questProgress) return false;

  const quest = quests.find(q => q.id === questId);
  if (!quest) return false;

  const objective = questProgress.objectives.find(o => o.objectiveId === objectiveId);
  const questObjective = quest.objectives.find(o => o.id === objectiveId);
  if (!objective || !questObjective) return false;

  objective.current = Math.min(objective.current + progress, questObjective.required);
  objective.completed = objective.current >= questObjective.required;

  // Check if all objectives completed
  if (questProgress.objectives.every(o => o.completed)) {
    questProgress.status = 'completed';
    questProgress.completedAt = Date.now();
    
    // Grant rewards
    quest.rewards.forEach(reward => {
      switch (reward.type) {
        case 'experience':
          gainExperience(characterId, reward.value as number);
          break;
        case 'item':
          addItemToInventory(characterId, reward.value as string, reward.quantity || 1);
          break;
        case 'gold':
          addItemToInventory(characterId, 'Gold Coin', reward.value as number);
          break;
        case 'achievement':
          character.achievements.push(reward.value as string);
          break;
      }
    });
  }

  return true;
}

export function abandonQuest(characterId: string, questId: string): boolean {
  const character = characters.find(c => c.id === characterId);
  if (!character) return false;

  const questIndex = character.questLog.findIndex(q => q.questId === questId && q.status === 'active');
  if (questIndex === -1) return false;

  character.questLog.splice(questIndex, 1);
  return true;
}

// ============================================================================
// SKILL SYSTEM
// ============================================================================

export function trainSkill(characterId: string, skillId: string, experience: number): boolean {
  const character = characters.find(c => c.id === characterId);
  if (!character) return false;

  const skill = character.skills.find(s => s.id === skillId);
  if (!skill || !skill.unlocked || skill.level >= skill.maxLevel) return false;

  skill.experience += experience;
  const expNeeded = skill.level * 100;

  while (skill.experience >= expNeeded && skill.level < skill.maxLevel) {
    skill.experience -= expNeeded;
    skill.level++;
  }

  return true;
}

export function unlockSkill(characterId: string, skillId: string): boolean {
  const character = characters.find(c => c.id === characterId);
  if (!character) return false;

  const skill = character.skills.find(s => s.id === skillId);
  if (!skill || skill.unlocked) return false;

  skill.unlocked = true;
  return true;
}

// ============================================================================
// MULTIPLAYER FEATURES
// ============================================================================

export interface Party {
  id: string;
  name: string;
  leaderId: string;
  members: PartyMember[];
  maxMembers: number;
  status: 'forming' | 'adventuring' | 'disbanded';
  createdAt: number;
}

export interface PartyMember {
  oderId: string;
  characterId: string;
  characterName: string;
  role: 'leader' | 'member';
  joinedAt: number;
}

const parties: Party[] = [];

export function createParty(leaderId: string, characterId: string, characterName: string, partyName: string): Party {
  const party: Party = {
    id: `PARTY-${Date.now().toString(36)}`,
    name: partyName,
    leaderId,
    members: [{
      oderId: leaderId,
      characterId,
      characterName,
      role: 'leader',
      joinedAt: Date.now()
    }],
    maxMembers: 4,
    status: 'forming',
    createdAt: Date.now()
  };
  parties.push(party);
  return party;
}

export function joinParty(partyId: string, userId: string, characterId: string, characterName: string): boolean {
  const party = parties.find(p => p.id === partyId);
  if (!party || party.status !== 'forming') return false;
  if (party.members.length >= party.maxMembers) return false;
  if (party.members.some(m => m.oderId === oderId)) return false;

  party.members.push({
    oderId: oderId,
    characterId,
    characterName,
    role: 'member',
    joinedAt: Date.now()
  });
  return true;
}

export function leaveParty(partyId: string, userId: string): boolean {
  const party = parties.find(p => p.id === partyId);
  if (!party) return false;

  const memberIndex = party.members.findIndex(m => m.oderId === oderId);
  if (memberIndex === -1) return false;

  if (party.members[memberIndex].role === 'leader') {
    if (party.members.length > 1) {
      // Transfer leadership
      party.members[1].role = 'leader';
      party.leaderId = party.members[1].oderId;
    } else {
      party.status = 'disbanded';
    }
  }

  party.members.splice(memberIndex, 1);
  return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const lawsQuestService = {
  // Character
  createCharacter,
  gainExperience,
  getCharacter,
  getCharacterByUser,
  // Inventory
  addItemToInventory,
  removeItemFromInventory,
  equipItem,
  useConsumable,
  // Quests
  getAvailableQuests,
  acceptQuest,
  updateQuestProgress,
  abandonQuest,
  // Skills
  trainSkill,
  unlockSkill,
  // Party
  createParty,
  joinParty,
  leaveParty
};

export default lawsQuestService;
