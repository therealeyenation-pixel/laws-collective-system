/**
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The L.A.W.S. Collective, LLC
 * 
 * Game constants, items, quests, NPCs, and achievements
 */

import type { 
  InventoryItem, 
  Quest, 
  NPC, 
  Achievement, 
  Character,
  CharacterStats,
  GameSettings,
  GameStatistics,
  Rank
} from "./types";

// ============================================
// GAME CONFIGURATION
// ============================================

export const GAME_VERSION = "1.0.0";
export const SAVE_VERSION = "1";

export const EXPERIENCE_CURVE = {
  base: 100,
  multiplier: 1.5,
  getExpForLevel: (level: number): number => {
    return Math.floor(EXPERIENCE_CURVE.base * Math.pow(EXPERIENCE_CURVE.multiplier, level - 1));
  }
};

export const ENERGY_CONFIG = {
  baseMax: 100,
  regenRate: 1, // per minute
  levelBonus: 5, // additional max energy per 10 levels
};

export const TOKEN_RATES = {
  questCompletion: 1.0,
  miniGameWin: 0.5,
  dailyLogin: 5,
  streakBonus: 2, // per day of streak
  achievementBase: 10,
};

// ============================================
// REALM INFORMATION
// ============================================

export const REALM_INFO = {
  land: {
    id: "land",
    name: "LAND",
    fullName: "Reconnection & Stability",
    icon: "🏔️",
    color: "#B45309", // amber-700
    bgColor: "#FEF3C7", // amber-100
    borderColor: "#FDE68A", // amber-200
    description: "Understanding roots, migrations, and family history. Build stability through connection to your origins.",
    themes: ["ancestry", "property", "resources", "heritage", "stability"],
  },
  air: {
    id: "air",
    name: "AIR",
    fullName: "Education & Knowledge",
    icon: "💨",
    color: "#0369A1", // sky-700
    bgColor: "#E0F2FE", // sky-100
    borderColor: "#BAE6FD", // sky-200
    description: "Learning, personal development, and communication. Expand your mind and share wisdom.",
    themes: ["education", "communication", "wisdom", "learning", "mentorship"],
  },
  water: {
    id: "water",
    name: "WATER",
    fullName: "Healing & Balance",
    icon: "💧",
    color: "#1D4ED8", // blue-700
    bgColor: "#DBEAFE", // blue-100
    borderColor: "#BFDBFE", // blue-200
    description: "Emotional resilience, healing cycles, and healthy decision-making. Find your inner balance.",
    themes: ["healing", "emotions", "balance", "relationships", "mindfulness"],
  },
  self: {
    id: "self",
    name: "SELF",
    fullName: "Purpose & Skills",
    icon: "❤️",
    color: "#BE123C", // rose-700
    bgColor: "#FFE4E6", // rose-100
    borderColor: "#FECDD3", // rose-200
    description: "Financial literacy, business readiness, and purposeful growth. Build your sovereign future.",
    themes: ["finance", "business", "purpose", "skills", "entrepreneurship"],
  },
  hub: {
    id: "hub",
    name: "HUB",
    fullName: "Central Crossroads",
    icon: "🧭",
    color: "#047857", // emerald-700
    bgColor: "#D1FAE5", // emerald-100
    borderColor: "#A7F3D0", // emerald-200
    description: "The central hub connecting all four realms. Plan your journey and manage your progress.",
    themes: ["navigation", "planning", "overview", "connections"],
  },
  house: {
    id: "house",
    name: "HOUSE",
    fullName: "Family Legacy",
    icon: "🏛️",
    color: "#7C3AED", // violet-600
    bgColor: "#EDE9FE", // violet-100
    borderColor: "#DDD6FE", // violet-200
    description: "Your family's legacy. Build, grow, and pass on generational wealth.",
    themes: ["family", "legacy", "generations", "wealth", "heritage"],
  },
} as const;

// ============================================
// ITEMS DATABASE
// ============================================

export const ITEMS: Record<string, InventoryItem> = {
  // === SCROLLS (Knowledge items) ===
  "scroll-beginning": {
    id: "scroll-beginning",
    name: "Scroll of Beginning",
    type: "scroll",
    rarity: "common",
    description: "Your first scroll, marking the start of your journey.",
    quantity: 1,
    icon: "📜",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
  },
  "scroll-ancestry": {
    id: "scroll-ancestry",
    name: "Scroll of Ancestry",
    type: "scroll",
    rarity: "uncommon",
    description: "Contains wisdom about tracing your family lineage.",
    quantity: 1,
    icon: "📜",
    stackable: true,
    maxStack: 10,
    sellValue: 15,
    realm: "land",
  },
  "scroll-wisdom": {
    id: "scroll-wisdom",
    name: "Scroll of Wisdom",
    type: "scroll",
    rarity: "rare",
    description: "Ancient teachings passed down through generations.",
    quantity: 1,
    icon: "📜",
    stackable: true,
    maxStack: 10,
    sellValue: 50,
    realm: "air",
    effect: { type: "stat_boost", stat: "air", value: 1 },
  },
  
  // === TOOLS ===
  "compass-guidance": {
    id: "compass-guidance",
    name: "Compass of Guidance",
    type: "tool",
    rarity: "uncommon",
    description: "Helps navigate the realms with clarity.",
    quantity: 1,
    icon: "🧭",
    stackable: false,
    maxStack: 1,
    sellValue: 25,
    equipSlot: "accessory",
    effect: { type: "experience_boost", value: 5 },
  },
  "quill-scholar": {
    id: "quill-scholar",
    name: "Scholar's Quill",
    type: "tool",
    rarity: "uncommon",
    description: "A fine writing instrument for recording knowledge.",
    quantity: 1,
    icon: "🪶",
    stackable: false,
    maxStack: 1,
    sellValue: 20,
    equipSlot: "tool",
    realm: "air",
  },
  
  // === RESOURCES ===
  "essence-land": {
    id: "essence-land",
    name: "Essence of Land",
    type: "resource",
    rarity: "common",
    description: "Pure essence gathered from the Land realm.",
    quantity: 1,
    icon: "🟤",
    stackable: true,
    maxStack: 99,
    sellValue: 5,
    realm: "land",
  },
  "essence-air": {
    id: "essence-air",
    name: "Essence of Air",
    type: "resource",
    rarity: "common",
    description: "Pure essence gathered from the Air realm.",
    quantity: 1,
    icon: "⚪",
    stackable: true,
    maxStack: 99,
    sellValue: 5,
    realm: "air",
  },
  "essence-water": {
    id: "essence-water",
    name: "Essence of Water",
    type: "resource",
    rarity: "common",
    description: "Pure essence gathered from the Water realm.",
    quantity: 1,
    icon: "🔵",
    stackable: true,
    maxStack: 99,
    sellValue: 5,
    realm: "water",
  },
  "essence-self": {
    id: "essence-self",
    name: "Essence of Self",
    type: "resource",
    rarity: "common",
    description: "Pure essence gathered from the Self realm.",
    quantity: 1,
    icon: "🔴",
    stackable: true,
    maxStack: 99,
    sellValue: 5,
    realm: "self",
  },
  
  // === CONSUMABLES ===
  "potion-energy": {
    id: "potion-energy",
    name: "Energy Potion",
    type: "consumable",
    rarity: "common",
    description: "Restores 25 energy points.",
    quantity: 1,
    icon: "🧪",
    stackable: true,
    maxStack: 20,
    sellValue: 10,
    effect: { type: "energy_restore", value: 25 },
  },
  "potion-vitality": {
    id: "potion-vitality",
    name: "Vitality Elixir",
    type: "consumable",
    rarity: "uncommon",
    description: "Restores 50 energy points.",
    quantity: 1,
    icon: "⚗️",
    stackable: true,
    maxStack: 10,
    sellValue: 25,
    effect: { type: "energy_restore", value: 50 },
  },
  
  // === ARTIFACTS ===
  "artifact-founders-seal": {
    id: "artifact-founders-seal",
    name: "Founder's Seal",
    type: "artifact",
    rarity: "legendary",
    description: "A seal bearing the mark of the original founders. Grants great wisdom.",
    quantity: 1,
    icon: "🔱",
    stackable: false,
    maxStack: 1,
    sellValue: 0, // Cannot be sold
    effect: { type: "stat_boost", stat: "self", value: 5 },
  },
  
  // === KEYS ===
  "key-land-temple": {
    id: "key-land-temple",
    name: "Key to the Land Temple",
    type: "key",
    rarity: "rare",
    description: "Unlocks the ancient temple in the Land realm.",
    quantity: 1,
    icon: "🗝️",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    realm: "land",
  },
};

// ============================================
// QUESTS DATABASE
// ============================================

export const QUESTS: Quest[] = [
  // === LAND REALM QUESTS ===
  {
    id: "land-1-roots",
    name: "Roots of Origin",
    description: "Discover your ancestral lineage and document your family tree.",
    longDescription: "Understanding where you come from is the first step to knowing where you're going. In this quest, you'll explore the importance of ancestry and begin documenting your family's history.",
    realm: "land",
    difficulty: "beginner",
    chapter: 1,
    requirements: {},
    rewards: { 
      experience: 50, 
      tokens: 10, 
      statBoosts: { land: 2 },
      items: [{ itemId: "scroll-ancestry", quantity: 1 }]
    },
    status: "available",
    miniGame: "reflection",
    miniGameConfig: { type: "reflection", difficulty: 1, questionCount: 3, passingScore: 60 },
    energyCost: 10,
    estimatedTime: 5,
    repeatability: "once",
    completionCount: 0,
    npcGiver: "elder-root",
  },
  {
    id: "land-2-sacred-ground",
    name: "Sacred Ground",
    description: "Learn about land ownership and property rights.",
    longDescription: "Land has always been the foundation of wealth and stability. This quest teaches you about property rights, deeds, and the importance of territorial sovereignty.",
    realm: "land",
    difficulty: "intermediate",
    chapter: 1,
    requirements: { stats: { land: 5 }, quests: ["land-1-roots"] },
    rewards: { 
      experience: 100, 
      tokens: 25, 
      statBoosts: { land: 3 },
    },
    status: "locked",
    miniGame: "trivia",
    miniGameConfig: { type: "trivia", difficulty: 3, questionCount: 5, passingScore: 60 },
    energyCost: 15,
    estimatedTime: 10,
    repeatability: "once",
    completionCount: 0,
    prerequisites: ["land-1-roots"],
    npcGiver: "elder-root",
  },
  {
    id: "land-3-stewardship",
    name: "Resource Stewardship",
    description: "Master sustainable resource management for future generations.",
    longDescription: "True wealth isn't just about accumulation—it's about sustainable management. Learn to steward resources in a way that benefits not just you, but generations to come.",
    realm: "land",
    difficulty: "advanced",
    chapter: 1,
    requirements: { level: 10, stats: { land: 15 }, quests: ["land-2-sacred-ground"] },
    rewards: { 
      experience: 200, 
      tokens: 50, 
      statBoosts: { land: 5, self: 2 },
      items: [{ itemId: "essence-land", quantity: 5 }]
    },
    status: "locked",
    miniGame: "strategy",
    miniGameConfig: { type: "strategy", difficulty: 5, timeLimit: 180, passingScore: 70 },
    energyCost: 20,
    estimatedTime: 15,
    repeatability: "once",
    completionCount: 0,
    prerequisites: ["land-2-sacred-ground"],
  },
  
  // === AIR REALM QUESTS ===
  {
    id: "air-1-first-words",
    name: "First Words",
    description: "Learn the fundamentals of effective communication.",
    longDescription: "Words have power. In this quest, you'll learn the basics of clear expression and effective communication—skills that will serve you in every realm.",
    realm: "air",
    difficulty: "beginner",
    chapter: 1,
    requirements: {},
    rewards: { 
      experience: 50, 
      tokens: 10, 
      statBoosts: { air: 2 },
    },
    status: "available",
    miniGame: "trivia",
    miniGameConfig: { type: "trivia", difficulty: 1, questionCount: 5, passingScore: 60 },
    energyCost: 10,
    estimatedTime: 5,
    repeatability: "once",
    completionCount: 0,
    npcGiver: "sage-breeze",
  },
  {
    id: "air-2-knowledge-seeker",
    name: "Knowledge Seeker",
    description: "Complete an educational challenge to expand your understanding.",
    longDescription: "Knowledge builds upon knowledge. This quest challenges you to learn new concepts and demonstrate your understanding through a series of tests.",
    realm: "air",
    difficulty: "intermediate",
    chapter: 1,
    requirements: { stats: { air: 5 }, quests: ["air-1-first-words"] },
    rewards: { 
      experience: 100, 
      tokens: 25, 
      statBoosts: { air: 3 },
      items: [{ itemId: "quill-scholar", quantity: 1 }]
    },
    status: "locked",
    miniGame: "memory",
    miniGameConfig: { type: "memory", difficulty: 3, timeLimit: 120, passingScore: 80 },
    energyCost: 15,
    estimatedTime: 10,
    repeatability: "once",
    completionCount: 0,
    prerequisites: ["air-1-first-words"],
    npcGiver: "sage-breeze",
  },
  {
    id: "air-3-wisdom-keeper",
    name: "Wisdom Keeper",
    description: "Teach others and preserve knowledge for future generations.",
    longDescription: "The highest form of learning is teaching. In this quest, you'll demonstrate mastery by helping others learn and ensuring wisdom is preserved.",
    realm: "air",
    difficulty: "advanced",
    chapter: 1,
    requirements: { level: 10, stats: { air: 15 }, quests: ["air-2-knowledge-seeker"] },
    rewards: { 
      experience: 200, 
      tokens: 50, 
      statBoosts: { air: 5, water: 2 },
      items: [{ itemId: "scroll-wisdom", quantity: 1 }]
    },
    status: "locked",
    miniGame: "word",
    miniGameConfig: { type: "word", difficulty: 5, timeLimit: 180, passingScore: 70 },
    energyCost: 20,
    estimatedTime: 15,
    repeatability: "once",
    completionCount: 0,
    prerequisites: ["air-2-knowledge-seeker"],
  },
  
  // === WATER REALM QUESTS ===
  {
    id: "water-1-reflection",
    name: "Inner Reflection",
    description: "Begin your journey of emotional awareness.",
    longDescription: "Before you can navigate the waters of emotion, you must first learn to see clearly into your own depths. This quest begins your journey of self-awareness.",
    realm: "water",
    difficulty: "beginner",
    chapter: 1,
    requirements: {},
    rewards: { 
      experience: 50, 
      tokens: 10, 
      statBoosts: { water: 2 },
    },
    status: "available",
    miniGame: "reflection",
    miniGameConfig: { type: "reflection", difficulty: 1, questionCount: 3, passingScore: 60 },
    energyCost: 10,
    estimatedTime: 5,
    repeatability: "daily",
    completionCount: 0,
    npcGiver: "healer-tide",
  },
  {
    id: "water-2-healing-currents",
    name: "Healing Currents",
    description: "Learn techniques for emotional healing and balance.",
    longDescription: "Healing is not about forgetting—it's about processing and growing. This quest teaches you techniques for emotional healing and maintaining inner balance.",
    realm: "water",
    difficulty: "intermediate",
    chapter: 1,
    requirements: { stats: { water: 5 }, quests: ["water-1-reflection"] },
    rewards: { 
      experience: 100, 
      tokens: 25, 
      statBoosts: { water: 3 },
    },
    status: "locked",
    miniGame: "meditation",
    miniGameConfig: { type: "meditation", difficulty: 3, timeLimit: 60, passingScore: 100 },
    energyCost: 15,
    estimatedTime: 10,
    repeatability: "once",
    completionCount: 0,
    prerequisites: ["water-1-reflection"],
    npcGiver: "healer-tide",
  },
  {
    id: "water-3-flow-master",
    name: "Flow Master",
    description: "Achieve mastery over emotional responses.",
    longDescription: "True mastery is not control—it's flow. Learn to move with your emotions rather than against them, and help others find their balance.",
    realm: "water",
    difficulty: "advanced",
    chapter: 1,
    requirements: { level: 10, stats: { water: 15 }, quests: ["water-2-healing-currents"] },
    rewards: { 
      experience: 200, 
      tokens: 50, 
      statBoosts: { water: 5, land: 2 },
      items: [{ itemId: "essence-water", quantity: 5 }]
    },
    status: "locked",
    miniGame: "puzzle",
    miniGameConfig: { type: "puzzle", difficulty: 5, timeLimit: 180, passingScore: 70 },
    energyCost: 20,
    estimatedTime: 15,
    repeatability: "once",
    completionCount: 0,
    prerequisites: ["water-2-healing-currents"],
  },
  
  // === SELF REALM QUESTS ===
  {
    id: "self-1-purpose",
    name: "Purpose Discovery",
    description: "Identify your core values and life's purpose.",
    longDescription: "Before you can build wealth, you must know why you're building it. This quest helps you identify your core values and begin defining your life's purpose.",
    realm: "self",
    difficulty: "beginner",
    chapter: 1,
    requirements: {},
    rewards: { 
      experience: 50, 
      tokens: 10, 
      statBoosts: { self: 2 },
    },
    status: "available",
    miniGame: "reflection",
    miniGameConfig: { type: "reflection", difficulty: 1, questionCount: 3, passingScore: 60 },
    energyCost: 10,
    estimatedTime: 5,
    repeatability: "once",
    completionCount: 0,
    npcGiver: "mentor-flame",
  },
  {
    id: "self-2-financial-foundation",
    name: "Financial Foundation",
    description: "Learn the basics of budgeting and saving.",
    longDescription: "Every great fortune starts with a solid foundation. This quest teaches you the fundamentals of budgeting, saving, and building financial security.",
    realm: "self",
    difficulty: "intermediate",
    chapter: 1,
    requirements: { stats: { self: 5 }, quests: ["self-1-purpose"] },
    rewards: { 
      experience: 100, 
      tokens: 25, 
      statBoosts: { self: 3 },
    },
    status: "locked",
    miniGame: "math",
    miniGameConfig: { type: "math", difficulty: 3, questionCount: 5, passingScore: 60 },
    energyCost: 15,
    estimatedTime: 10,
    repeatability: "once",
    completionCount: 0,
    prerequisites: ["self-1-purpose"],
    npcGiver: "mentor-flame",
  },
  {
    id: "self-3-sovereign-builder",
    name: "Sovereign Builder",
    description: "Create a plan for multi-generational wealth.",
    longDescription: "True sovereignty is building something that lasts beyond your lifetime. This quest challenges you to create a comprehensive plan for multi-generational wealth.",
    realm: "self",
    difficulty: "advanced",
    chapter: 1,
    requirements: { level: 10, stats: { self: 15 }, quests: ["self-2-financial-foundation"] },
    rewards: { 
      experience: 200, 
      tokens: 50, 
      statBoosts: { self: 5, air: 2 },
      items: [{ itemId: "essence-self", quantity: 5 }],
      achievements: ["sovereign-path"]
    },
    status: "locked",
    miniGame: "strategy",
    miniGameConfig: { type: "strategy", difficulty: 5, timeLimit: 300, passingScore: 70 },
    energyCost: 20,
    estimatedTime: 20,
    repeatability: "once",
    completionCount: 0,
    prerequisites: ["self-2-financial-foundation"],
  },
];

// ============================================
// NPCs DATABASE
// ============================================

export const NPCS: NPC[] = [
  {
    id: "guide-compass",
    name: "Guide Compass",
    title: "Navigator of Paths",
    description: "A wise guide who helps travelers navigate between the realms.",
    realm: "hub",
    role: ["guide"],
    portrait: "🧭",
    affinity: 0,
    dialogue: {
      greeting: {
        id: "greeting",
        text: "Welcome, traveler. I am Guide Compass, and I help those who seek to navigate the four realms. What brings you to the Crossroads?",
        speaker: "npc",
        responses: [
          { text: "Tell me about the four realms.", nextNodeId: "about-realms" },
          { text: "How do I grow stronger?", nextNodeId: "about-growth" },
          { text: "I'm just exploring. Farewell.", nextNodeId: "farewell" },
        ],
      },
      nodes: {
        "about-realms": {
          id: "about-realms",
          text: "The four realms represent the pillars of a sovereign life: LAND for stability and roots, AIR for knowledge and wisdom, WATER for healing and balance, and SELF for purpose and prosperity. Each realm offers unique challenges and rewards.",
          speaker: "npc",
          responses: [
            { text: "Which realm should I start with?", nextNodeId: "realm-advice" },
            { text: "Thank you for the wisdom.", nextNodeId: "farewell" },
          ],
        },
        "realm-advice": {
          id: "realm-advice",
          text: "Begin where your heart calls you. Some start with LAND to establish their roots. Others begin with SELF to find their purpose. There is no wrong path—only your path.",
          speaker: "npc",
          responses: [
            { text: "I understand. Thank you.", nextNodeId: "farewell" },
          ],
        },
        "about-growth": {
          id: "about-growth",
          text: "Growth comes through experience. Complete quests, learn from the realm masters, and never stop seeking wisdom. Your attributes will grow as you face challenges in each realm.",
          speaker: "npc",
          responses: [
            { text: "I'll remember that. Farewell.", nextNodeId: "farewell" },
          ],
        },
        "farewell": {
          id: "farewell",
          text: "May your journey be fruitful, traveler. The Crossroads will always be here when you need guidance.",
          speaker: "npc",
        },
      },
    },
  },
  {
    id: "elder-root",
    name: "Elder Root",
    title: "Keeper of Ancestral Wisdom",
    description: "An ancient guardian who preserves the knowledge of lineages and land.",
    realm: "land",
    role: ["quest_giver", "mentor"],
    portrait: "🌳",
    affinity: 0,
    questIds: ["land-1-roots", "land-2-sacred-ground", "land-3-stewardship"],
    dialogue: {
      greeting: {
        id: "greeting",
        text: "Welcome, young one. The land remembers all who walk upon it. I am Elder Root, keeper of ancestral wisdom. Do you seek to understand your origins?",
        speaker: "npc",
        responses: [
          { text: "Yes, I want to learn about my ancestry.", nextNodeId: "ancestry-intro" },
          { text: "What quests do you have for me?", nextNodeId: "quests" },
          { text: "Tell me about the Land realm.", nextNodeId: "about-land" },
          { text: "I must go. Farewell.", nextNodeId: "farewell" },
        ],
      },
      nodes: {
        "ancestry-intro": {
          id: "ancestry-intro",
          text: "Your ancestors planted seeds of wisdom long before you were born. It is time to harvest that wisdom. Understanding where you come from is the first step to knowing where you're going.",
          speaker: "npc",
          responses: [
            { text: "How do I begin?", nextNodeId: "quests" },
            { text: "I need time to think. Farewell.", nextNodeId: "farewell" },
          ],
        },
        "quests": {
          id: "quests",
          text: "I have several paths for you to walk. Begin with 'Roots of Origin' to discover your ancestral lineage. As you grow in wisdom, more challenging paths will open to you.",
          speaker: "npc",
          responses: [
            { text: "I'm ready to begin.", nextNodeId: "farewell" },
          ],
        },
        "about-land": {
          id: "about-land",
          text: "The Land realm teaches stability, connection to your roots, and the stewardship of resources. Here you will learn about property, heritage, and the foundation upon which all else is built.",
          speaker: "npc",
          responses: [
            { text: "I understand. What quests do you have?", nextNodeId: "quests" },
            { text: "Thank you, Elder. Farewell.", nextNodeId: "farewell" },
          ],
        },
        "farewell": {
          id: "farewell",
          text: "Go with the blessing of the ancestors. Remember: the land beneath your feet carries the memory of all who came before.",
          speaker: "npc",
        },
      },
    },
  },
  {
    id: "sage-breeze",
    name: "Sage Breeze",
    title: "Master of Knowledge",
    description: "A learned scholar who guides seekers of wisdom.",
    realm: "air",
    role: ["quest_giver", "mentor"],
    portrait: "📚",
    affinity: 0,
    questIds: ["air-1-first-words", "air-2-knowledge-seeker", "air-3-wisdom-keeper"],
    dialogue: {
      greeting: {
        id: "greeting",
        text: "Ah, a seeker of knowledge! I am Sage Breeze. Knowledge flows like the wind—catch it, or it passes you by. What wisdom do you seek today?",
        speaker: "npc",
        responses: [
          { text: "I want to learn and grow.", nextNodeId: "learning" },
          { text: "What quests can I undertake?", nextNodeId: "quests" },
          { text: "Tell me about the Air realm.", nextNodeId: "about-air" },
          { text: "I'll return later. Farewell.", nextNodeId: "farewell" },
        ],
      },
      nodes: {
        "learning": {
          id: "learning",
          text: "Every question is a doorway. Are you brave enough to open it? The mind that seeks to learn will never be empty. I can guide you on the path of knowledge.",
          speaker: "npc",
          responses: [
            { text: "Guide me, Sage.", nextNodeId: "quests" },
            { text: "I need to prepare first.", nextNodeId: "farewell" },
          ],
        },
        "quests": {
          id: "quests",
          text: "Begin with 'First Words'—master the art of communication. Then seek 'Knowledge Seeker' to expand your mind. The path of the 'Wisdom Keeper' awaits those who prove their dedication.",
          speaker: "npc",
          responses: [
            { text: "I accept the challenge.", nextNodeId: "farewell" },
          ],
        },
        "about-air": {
          id: "about-air",
          text: "The Air realm is the domain of knowledge, communication, and wisdom. Here you will sharpen your mind, learn to express yourself clearly, and eventually become a keeper of wisdom yourself.",
          speaker: "npc",
          responses: [
            { text: "Show me the quests.", nextNodeId: "quests" },
            { text: "Fascinating. Farewell for now.", nextNodeId: "farewell" },
          ],
        },
        "farewell": {
          id: "farewell",
          text: "May the winds of wisdom guide your path. Return when you are ready to learn more.",
          speaker: "npc",
        },
      },
    },
  },
  {
    id: "healer-tide",
    name: "Healer Tide",
    title: "Guardian of Balance",
    description: "A compassionate healer who guides others through emotional waters.",
    realm: "water",
    role: ["quest_giver", "mentor"],
    portrait: "🌊",
    affinity: 0,
    questIds: ["water-1-reflection", "water-2-healing-currents", "water-3-flow-master"],
    dialogue: {
      greeting: {
        id: "greeting",
        text: "Peace be with you, traveler. I am Healer Tide. The waters of emotion can drown or carry you—I teach the art of swimming. What brings you to seek balance?",
        speaker: "npc",
        responses: [
          { text: "I seek emotional healing.", nextNodeId: "healing" },
          { text: "What quests do you offer?", nextNodeId: "quests" },
          { text: "Tell me about the Water realm.", nextNodeId: "about-water" },
          { text: "I must reflect alone. Farewell.", nextNodeId: "farewell" },
        ],
      },
      nodes: {
        "healing": {
          id: "healing",
          text: "Healing begins when we acknowledge the wound. Balance is not stillness—it is the dance between forces. I can guide you through the currents of your inner world.",
          speaker: "npc",
          responses: [
            { text: "I'm ready to begin.", nextNodeId: "quests" },
            { text: "I need more time.", nextNodeId: "farewell" },
          ],
        },
        "quests": {
          id: "quests",
          text: "Start with 'Inner Reflection'—look within yourself. Then learn the 'Healing Currents' that restore balance. Masters walk the path of the 'Flow Master', moving with life rather than against it.",
          speaker: "npc",
          responses: [
            { text: "I will walk this path.", nextNodeId: "farewell" },
          ],
        },
        "about-water": {
          id: "about-water",
          text: "The Water realm teaches emotional intelligence, healing, and balance. Here you will learn to understand your feelings, process difficult emotions, and maintain equilibrium in life's storms.",
          speaker: "npc",
          responses: [
            { text: "What quests can I do?", nextNodeId: "quests" },
            { text: "Thank you, Healer. Farewell.", nextNodeId: "farewell" },
          ],
        },
        "farewell": {
          id: "farewell",
          text: "May the waters of peace flow through you. Return whenever you need to find your balance again.",
          speaker: "npc",
        },
      },
    },
  },
  {
    id: "mentor-flame",
    name: "Mentor Flame",
    title: "Guide of Purpose",
    description: "A passionate mentor who ignites the fire of purpose in others.",
    realm: "self",
    role: ["quest_giver", "mentor"],
    portrait: "🔥",
    affinity: 0,
    questIds: ["self-1-purpose", "self-2-financial-foundation", "self-3-sovereign-builder"],
    dialogue: {
      greeting: {
        id: "greeting",
        text: "Greetings, seeker! I am Mentor Flame. Your purpose burns within you—I help fan those flames. Are you ready to discover your true potential?",
        speaker: "npc",
        responses: [
          { text: "I want to find my purpose.", nextNodeId: "purpose" },
          { text: "What quests do you have?", nextNodeId: "quests" },
          { text: "Tell me about the Self realm.", nextNodeId: "about-self" },
          { text: "I'll return when ready. Farewell.", nextNodeId: "farewell" },
        ],
      },
      nodes: {
        "purpose": {
          id: "purpose",
          text: "Wealth without purpose is a house without foundation. Build your legacy one brick at a time, but build it to last. First, we must discover what drives you.",
          speaker: "npc",
          responses: [
            { text: "Show me the way.", nextNodeId: "quests" },
            { text: "I need to think about this.", nextNodeId: "farewell" },
          ],
        },
        "quests": {
          id: "quests",
          text: "Begin with 'Purpose Discovery' to find your core values. Then build your 'Financial Foundation' with practical skills. The ultimate challenge is becoming a 'Sovereign Builder' of generational wealth.",
          speaker: "npc",
          responses: [
            { text: "I'm ready to build my future.", nextNodeId: "farewell" },
          ],
        },
        "about-self": {
          id: "about-self",
          text: "The Self realm is where purpose meets prosperity. Here you will learn financial literacy, business skills, and how to build wealth that serves your life's mission and benefits future generations.",
          speaker: "npc",
          responses: [
            { text: "What quests are available?", nextNodeId: "quests" },
            { text: "Inspiring. Farewell for now.", nextNodeId: "farewell" },
          ],
        },
        "farewell": {
          id: "farewell",
          text: "Keep the fire burning, seeker. Your purpose awaits—return when you're ready to claim it.",
          speaker: "npc",
        },
      },
    },
  },
];

// ============================================
// ACHIEVEMENTS DATABASE
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  // Quest achievements
  {
    id: "first-quest",
    name: "First Steps",
    description: "Complete your first quest.",
    category: "quests",
    icon: "🎯",
    rarity: "common",
    hidden: false,
    requirements: [{ type: "quest_count", target: 1 }],
    rewards: { tokens: 5, experience: 25 },
  },
  {
    id: "quest-10",
    name: "Questor",
    description: "Complete 10 quests.",
    category: "quests",
    icon: "⚔️",
    rarity: "uncommon",
    hidden: false,
    requirements: [{ type: "quest_count", target: 10 }],
    rewards: { tokens: 25, experience: 100 },
  },
  {
    id: "quest-50",
    name: "Quest Master",
    description: "Complete 50 quests.",
    category: "quests",
    icon: "🏆",
    rarity: "rare",
    hidden: false,
    requirements: [{ type: "quest_count", target: 50 }],
    rewards: { tokens: 100, experience: 500, title: "Quest Master" },
  },
  
  // Realm mastery
  {
    id: "land-master",
    name: "Land Master",
    description: "Reach level 20 in the Land attribute.",
    category: "mastery",
    icon: "🏔️",
    rarity: "rare",
    hidden: false,
    requirements: [{ type: "stat", target: "land", current: 0 }],
    rewards: { tokens: 50, experience: 200, items: [{ itemId: "key-land-temple", quantity: 1 }] },
  },
  {
    id: "air-master",
    name: "Air Master",
    description: "Reach level 20 in the Air attribute.",
    category: "mastery",
    icon: "💨",
    rarity: "rare",
    hidden: false,
    requirements: [{ type: "stat", target: "air", current: 0 }],
    rewards: { tokens: 50, experience: 200 },
  },
  {
    id: "water-master",
    name: "Water Master",
    description: "Reach level 20 in the Water attribute.",
    category: "mastery",
    icon: "💧",
    rarity: "rare",
    hidden: false,
    requirements: [{ type: "stat", target: "water", current: 0 }],
    rewards: { tokens: 50, experience: 200 },
  },
  {
    id: "self-master",
    name: "Self Master",
    description: "Reach level 20 in the Self attribute.",
    category: "mastery",
    icon: "❤️",
    rarity: "rare",
    hidden: false,
    requirements: [{ type: "stat", target: "self", current: 0 }],
    rewards: { tokens: 50, experience: 200 },
  },
  {
    id: "balanced-soul",
    name: "Balanced Soul",
    description: "Reach level 10 in all four attributes.",
    category: "mastery",
    icon: "☯️",
    rarity: "epic",
    hidden: false,
    requirements: [
      { type: "stat", target: "land", current: 0 },
      { type: "stat", target: "air", current: 0 },
      { type: "stat", target: "water", current: 0 },
      { type: "stat", target: "self", current: 0 },
    ],
    rewards: { tokens: 200, experience: 1000, title: "Balanced Soul" },
  },
  
  // Level achievements
  {
    id: "level-10",
    name: "Rising Star",
    description: "Reach level 10.",
    category: "mastery",
    icon: "⭐",
    rarity: "common",
    hidden: false,
    requirements: [{ type: "level", target: 10 }],
    rewards: { tokens: 20, experience: 50 },
  },
  {
    id: "level-25",
    name: "Proven Seeker",
    description: "Reach level 25.",
    category: "mastery",
    icon: "🌟",
    rarity: "uncommon",
    hidden: false,
    requirements: [{ type: "level", target: 25 }],
    rewards: { tokens: 50, experience: 150 },
  },
  {
    id: "level-50",
    name: "Veteran",
    description: "Reach level 50.",
    category: "mastery",
    icon: "💫",
    rarity: "rare",
    hidden: false,
    requirements: [{ type: "level", target: 50 }],
    rewards: { tokens: 100, experience: 300, title: "Veteran" },
  },
  {
    id: "level-100",
    name: "Sovereign",
    description: "Reach level 100 and achieve true sovereignty.",
    category: "mastery",
    icon: "👑",
    rarity: "legendary",
    hidden: false,
    requirements: [{ type: "level", target: 100 }],
    rewards: { tokens: 500, experience: 1000, title: "Sovereign", items: [{ itemId: "artifact-founders-seal", quantity: 1 }] },
  },
  
  // Streak achievements
  {
    id: "streak-7",
    name: "Dedicated",
    description: "Maintain a 7-day login streak.",
    category: "special",
    icon: "🔥",
    rarity: "common",
    hidden: false,
    requirements: [{ type: "streak", target: 7 }],
    rewards: { tokens: 15, experience: 50 },
  },
  {
    id: "streak-30",
    name: "Committed",
    description: "Maintain a 30-day login streak.",
    category: "special",
    icon: "🔥🔥",
    rarity: "uncommon",
    hidden: false,
    requirements: [{ type: "streak", target: 30 }],
    rewards: { tokens: 75, experience: 200 },
  },
  {
    id: "streak-100",
    name: "Unwavering",
    description: "Maintain a 100-day login streak.",
    category: "special",
    icon: "🔥🔥🔥",
    rarity: "epic",
    hidden: false,
    requirements: [{ type: "streak", target: 100 }],
    rewards: { tokens: 300, experience: 500, title: "Unwavering" },
  },
  
  // Special/Hidden achievements
  {
    id: "sovereign-path",
    name: "Path to Sovereignty",
    description: "Complete the Sovereign Builder quest.",
    category: "special",
    icon: "🛤️",
    rarity: "epic",
    hidden: true,
    requirements: [{ type: "custom", target: "self-3-sovereign-builder" }],
    rewards: { tokens: 100, experience: 300 },
  },
];

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_CHARACTER: Character = {
  id: "",
  name: "Sovereign",
  title: "Seedling",
  level: 1,
  experience: 0,
  experienceToNext: 100,
  stats: { land: 1, air: 1, water: 1, self: 1 },
  tokens: 0,
  currentLocation: "hub",
  completedQuests: [],
  activeQuests: [],
  achievements: [],
  inventory: [
    { ...ITEMS["scroll-beginning"], quantity: 1 },
  ],
  equipment: {},
  energy: 100,
  maxEnergy: 100,
  health: 100,
  maxHealth: 100,
  createdAt: Date.now(),
  lastPlayedAt: Date.now(),
  totalPlayTime: 0,
  dailyLoginStreak: 0,
  lastDailyReward: 0,
};

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 70,
  sfxVolume: 80,
  notifications: true,
  autoSave: true,
  language: "en",
  theme: "auto",
  accessibility: {
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReader: false,
  },
};

export const DEFAULT_STATISTICS: GameStatistics = {
  totalPlayTime: 0,
  questsCompleted: 0,
  questsFailed: 0,
  miniGamesPlayed: 0,
  miniGamesWon: 0,
  tokensEarned: 0,
  tokensSpent: 0,
  itemsCollected: 0,
  itemsCrafted: 0,
  npcsInteracted: 0,
  achievementsUnlocked: 0,
  highestLevel: 1,
  longestStreak: 0,
};
