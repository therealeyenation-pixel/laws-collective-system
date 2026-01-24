/**
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The L.A.W.S. Collective, LLC
 * 
 * NPC system with dialogue trees, relationships, and interactions
 */

import type { NPC, NPCAffinity, DialogueNode, DialogueChoice, Character } from "./types";

// ============================================
// NPC DEFINITIONS
// ============================================

export interface NPCDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  realm: "land" | "air" | "water" | "self" | "hub";
  role: "mentor" | "merchant" | "quest_giver" | "guide" | "elder";
  portrait: string; // emoji or image path
  personality: string[];
  backstory: string;
  shopId?: string;
  questIds?: string[];
  affinityRewards: AffinityReward[];
  dialogueTreeId: string;
}

export interface AffinityReward {
  level: number;
  reward: {
    type: "item" | "tokens" | "experience" | "stat" | "quest_unlock";
    itemId?: string;
    amount?: number;
    stat?: "land" | "air" | "water" | "self";
    questId?: string;
  };
  description: string;
}

// ============================================
// DIALOGUE SYSTEM
// ============================================

export interface DialogueTree {
  id: string;
  npcId: string;
  rootNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export interface ExtendedDialogueNode extends DialogueNode {
  speaker?: "npc" | "player";
  emotion?: "neutral" | "happy" | "sad" | "angry" | "surprised" | "thoughtful";
  effects?: DialogueEffect[];
  conditions?: DialogueCondition[];
}

export interface DialogueEffect {
  type: "affinity" | "tokens" | "experience" | "item" | "quest" | "flag";
  value: number | string;
  itemId?: string;
  questId?: string;
  flagName?: string;
}

export interface DialogueCondition {
  type: "affinity" | "level" | "quest_complete" | "item_owned" | "flag" | "stat";
  operator: "gte" | "lte" | "eq" | "neq";
  value: number | string | boolean;
  stat?: "land" | "air" | "water" | "self";
  questId?: string;
  itemId?: string;
  flagName?: string;
}

// ============================================
// NPC DATABASE
// ============================================

export const NPCS: NPCDefinition[] = [
  // LAND REALM
  {
    id: "elder-root",
    name: "Elder Root",
    title: "Keeper of Ancestral Wisdom",
    description: "An ancient guardian who has witnessed generations come and go. Elder Root holds the secrets of the land and the stories of those who walked before.",
    realm: "land",
    role: "mentor",
    portrait: "🌳",
    personality: ["wise", "patient", "mysterious", "nurturing"],
    backstory: "Elder Root has stood in the Land realm for centuries, serving as a bridge between the past and present. They have guided countless seekers to discover their roots and understand the importance of land and heritage.",
    shopId: "shop-land",
    questIds: ["land-origins-1", "land-property-1", "land-steward-1"],
    affinityRewards: [
      { level: 10, reward: { type: "item", itemId: "herb-vitality", amount: 5 }, description: "Gift of Vitality Herbs" },
      { level: 25, reward: { type: "stat", stat: "land", amount: 2 }, description: "Blessing of the Land" },
      { level: 50, reward: { type: "item", itemId: "compass-basic" }, description: "Traveler's Compass" },
      { level: 75, reward: { type: "quest_unlock", questId: "land-secret-1" }, description: "Secret Quest Unlocked" },
      { level: 100, reward: { type: "item", itemId: "artifact-family-tree" }, description: "Ancestral Family Tree" },
    ],
    dialogueTreeId: "dialogue-elder-root",
  },
  
  // AIR REALM
  {
    id: "sage-breeze",
    name: "Sage Breeze",
    title: "Master of Knowledge",
    description: "A brilliant scholar who has dedicated their existence to the pursuit and sharing of knowledge. Sage Breeze believes that wisdom is the greatest gift one can give.",
    realm: "air",
    role: "mentor",
    portrait: "🌬️",
    personality: ["intellectual", "curious", "eloquent", "encouraging"],
    backstory: "Once a wandering scholar, Sage Breeze settled in the Air realm after realizing that true knowledge comes not from traveling the world, but from understanding oneself and sharing wisdom with others.",
    shopId: "shop-air",
    questIds: ["air-comm-1", "air-know-1", "air-wisdom-1"],
    affinityRewards: [
      { level: 10, reward: { type: "item", itemId: "exp-scroll", amount: 2 }, description: "Scrolls of Learning" },
      { level: 25, reward: { type: "stat", stat: "air", amount: 2 }, description: "Blessing of Wisdom" },
      { level: 50, reward: { type: "item", itemId: "quill-basic" }, description: "Scholar's Quill" },
      { level: 75, reward: { type: "quest_unlock", questId: "air-secret-1" }, description: "Secret Quest Unlocked" },
      { level: 100, reward: { type: "item", itemId: "artifact-wisdom-crystal" }, description: "Crystal of Accumulated Wisdom" },
    ],
    dialogueTreeId: "dialogue-sage-breeze",
  },
  
  // WATER REALM
  {
    id: "healer-tide",
    name: "Healer Tide",
    title: "Guardian of Balance",
    description: "A compassionate healer who understands that true healing comes from within. Healer Tide guides seekers through the turbulent waters of emotion toward calm shores.",
    realm: "water",
    role: "mentor",
    portrait: "🌊",
    personality: ["empathetic", "calm", "insightful", "supportive"],
    backstory: "Healer Tide once struggled with their own emotional storms until they learned to find peace within the chaos. Now they help others navigate their inner waters and find balance.",
    shopId: "shop-water",
    questIds: ["water-aware-1", "water-heal-1", "water-balance-1"],
    affinityRewards: [
      { level: 10, reward: { type: "item", itemId: "energy-elixir", amount: 2 }, description: "Vitality Elixirs" },
      { level: 25, reward: { type: "stat", stat: "water", amount: 2 }, description: "Blessing of Balance" },
      { level: 50, reward: { type: "item", itemId: "mirror-reflection" }, description: "Mirror of Reflection" },
      { level: 75, reward: { type: "quest_unlock", questId: "water-secret-1" }, description: "Secret Quest Unlocked" },
      { level: 100, reward: { type: "item", itemId: "artifact-healing-waters" }, description: "Vial of Healing Waters" },
    ],
    dialogueTreeId: "dialogue-healer-tide",
  },
  
  // SELF REALM
  {
    id: "mentor-flame",
    name: "Mentor Flame",
    title: "Guide of Purpose",
    description: "A passionate guide who helps seekers discover their inner fire and build the foundations of lasting prosperity. Mentor Flame teaches that true wealth begins with purpose.",
    realm: "self",
    role: "mentor",
    portrait: "🔥",
    personality: ["passionate", "driven", "practical", "inspiring"],
    backstory: "Mentor Flame built and lost fortunes before understanding that sustainable wealth requires a foundation of purpose. Now they teach others to build their legacy on solid ground.",
    shopId: "shop-self",
    questIds: ["self-purpose-1", "self-found-1", "self-grow-1"],
    affinityRewards: [
      { level: 10, reward: { type: "tokens", amount: 50 }, description: "Starter Funds" },
      { level: 25, reward: { type: "stat", stat: "self", amount: 2 }, description: "Blessing of Purpose" },
      { level: 50, reward: { type: "item", itemId: "ledger-basic" }, description: "Basic Ledger" },
      { level: 75, reward: { type: "quest_unlock", questId: "self-secret-1" }, description: "Secret Quest Unlocked" },
      { level: 100, reward: { type: "item", itemId: "artifact-sovereign-seal" }, description: "Sovereign's Seal" },
    ],
    dialogueTreeId: "dialogue-mentor-flame",
  },
  
  // HUB
  {
    id: "guide-compass",
    name: "Guide Compass",
    title: "Navigator of Paths",
    description: "A friendly guide who helps newcomers find their way through the realms. Guide Compass knows every path and can point seekers in the right direction.",
    realm: "hub",
    role: "guide",
    portrait: "🧭",
    personality: ["friendly", "helpful", "knowledgeable", "welcoming"],
    backstory: "Guide Compass has traveled every path in every realm and now dedicates their time to helping others begin their journey. They remember what it was like to be lost and confused.",
    questIds: ["tutorial-1", "tutorial-2"],
    affinityRewards: [
      { level: 10, reward: { type: "item", itemId: "energy-tea", amount: 5 }, description: "Welcome Gift" },
      { level: 25, reward: { type: "experience", amount: 100 }, description: "Navigator's Blessing" },
      { level: 50, reward: { type: "tokens", amount: 100 }, description: "Traveler's Stipend" },
      { level: 100, reward: { type: "item", itemId: "compass-sovereign" }, description: "Sovereign's Compass" },
    ],
    dialogueTreeId: "dialogue-guide-compass",
  },
];

// ============================================
// DIALOGUE TREES
// ============================================

export const DIALOGUE_TREES: DialogueTree[] = [
  // Elder Root Dialogue
  {
    id: "dialogue-elder-root",
    npcId: "elder-root",
    rootNodeId: "root",
    nodes: {
      "root": {
        id: "root",
        text: "Welcome, young one. The land remembers all who walk upon it. What brings you to seek the wisdom of the roots?",
        choices: [
          { text: "I want to learn about my ancestors.", nextNodeId: "ancestry" },
          { text: "Tell me about land ownership.", nextNodeId: "property" },
          { text: "I'm looking for quests.", nextNodeId: "quests" },
          { text: "What items do you have?", nextNodeId: "shop" },
          { text: "Goodbye for now.", nextNodeId: "farewell" },
        ],
      },
      "ancestry": {
        id: "ancestry",
        text: "Ah, the search for one's roots. This is the most important journey you can undertake. Your ancestors planted seeds of wisdom that are waiting to be discovered. To understand where you're going, you must first know where you came from.",
        choices: [
          { text: "How do I start researching my family?", nextNodeId: "ancestry-how" },
          { text: "Why is ancestry important?", nextNodeId: "ancestry-why" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "ancestry-how": {
        id: "ancestry-how",
        text: "Begin with what you know. Talk to your elders while they still walk among us. Gather names, dates, stories. Each piece is a thread in the tapestry of your heritage. I have a quest that can guide you through this process.",
        choices: [
          { text: "I'd like to start that quest.", nextNodeId: "quest-ancestry-start" },
          { text: "Tell me more about why this matters.", nextNodeId: "ancestry-why" },
          { text: "Let me think about it.", nextNodeId: "root" },
        ],
      },
      "ancestry-why": {
        id: "ancestry-why",
        text: "Your ancestors faced challenges, made sacrifices, and learned lessons that live on in you. Their stories contain wisdom that no book can teach. When you know your roots, you stand taller. When you understand their struggles, your own become lighter.",
        choices: [
          { text: "That's beautiful. I want to learn more.", nextNodeId: "ancestry-how" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "property": {
        id: "property",
        text: "Land is the foundation upon which all lasting wealth is built. Throughout history, those who controlled land controlled their destiny. But true ownership is more than a piece of paper—it is stewardship, responsibility, and legacy.",
        choices: [
          { text: "How do I learn about property ownership?", nextNodeId: "property-learn" },
          { text: "What is sovereignty?", nextNodeId: "property-sovereignty" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "property-learn": {
        id: "property-learn",
        text: "Understanding property begins with understanding deeds, titles, and rights. I can guide you through this knowledge, but first you must complete the foundational quests of ancestry. The land and your heritage are intertwined.",
        choices: [
          { text: "I understand. Let me work on ancestry first.", nextNodeId: "root" },
          { text: "Tell me about sovereignty.", nextNodeId: "property-sovereignty" },
        ],
      },
      "property-sovereignty": {
        id: "property-sovereignty",
        text: "Sovereignty is the supreme authority over one's own affairs. In the context of land, it means true ownership—not merely holding a deed, but having the right to determine what happens on your land without interference. This is the goal of true land mastery.",
        choices: [
          { text: "How do I achieve this?", nextNodeId: "property-learn" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "quests": {
        id: "quests",
        text: "I have several paths for those who seek to strengthen their connection to the land. Each quest will teach you something valuable and reward your efforts. Which aspect interests you most?",
        choices: [
          { text: "Ancestral heritage quests", nextNodeId: "quest-ancestry-start" },
          { text: "Property and ownership quests", nextNodeId: "quest-property-info" },
          { text: "Resource stewardship quests", nextNodeId: "quest-steward-info" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "quest-ancestry-start": {
        id: "quest-ancestry-start",
        text: "The 'Roots of Origin' quest awaits you. Begin by documenting what you know of your family. This is the first step on a long and rewarding journey. Are you ready to begin?",
        choices: [
          { text: "Yes, I'm ready to start.", nextNodeId: "quest-accepted" },
          { text: "Not yet. Let me prepare first.", nextNodeId: "root" },
        ],
      },
      "quest-property-info": {
        id: "quest-property-info",
        text: "The property quests require a strong foundation in ancestry. Complete the 'Roots of the Ancestors' storyline first, and these paths will open to you.",
        choices: [
          { text: "I understand. I'll work on ancestry first.", nextNodeId: "root" },
        ],
      },
      "quest-steward-info": {
        id: "quest-steward-info",
        text: "Stewardship is an advanced path. You must first understand your roots and the nature of property before you can learn to manage resources for future generations.",
        choices: [
          { text: "I understand. I'll work on the foundations first.", nextNodeId: "root" },
        ],
      },
      "quest-accepted": {
        id: "quest-accepted",
        text: "Excellent. The land welcomes your commitment. Go forth and discover your roots. Return to me when you have completed your task, and I shall guide you further along the path.",
        choices: [
          { text: "Thank you, Elder Root.", nextNodeId: "farewell" },
        ],
      },
      "shop": {
        id: "shop",
        text: "I have gathered items that may aid you in your journey through the Land realm. Take a look at what I have to offer.",
        choices: [
          { text: "Show me your wares.", nextNodeId: "shop-open" },
          { text: "Maybe later.", nextNodeId: "root" },
        ],
      },
      "shop-open": {
        id: "shop-open",
        text: "[Opens shop interface]",
        choices: [
          { text: "Thank you.", nextNodeId: "root" },
        ],
      },
      "farewell": {
        id: "farewell",
        text: "May the roots guide your path, young one. The land remembers, and so shall your legacy. Return when you seek more wisdom.",
        choices: [],
      },
    },
  },

  // Sage Breeze Dialogue
  {
    id: "dialogue-sage-breeze",
    npcId: "sage-breeze",
    rootNodeId: "root",
    nodes: {
      "root": {
        id: "root",
        text: "Ah, a seeker of knowledge! The wind carries whispers of wisdom to those who listen. What knowledge do you seek today?",
        choices: [
          { text: "I want to improve my communication.", nextNodeId: "communication" },
          { text: "Teach me about learning itself.", nextNodeId: "learning" },
          { text: "What quests do you have?", nextNodeId: "quests" },
          { text: "Show me your shop.", nextNodeId: "shop" },
          { text: "Farewell, Sage.", nextNodeId: "farewell" },
        ],
      },
      "communication": {
        id: "communication",
        text: "Communication is the bridge between minds. It is not merely about speaking—it is about being understood, and more importantly, about understanding others. The greatest communicators are first the greatest listeners.",
        choices: [
          { text: "How do I become a better listener?", nextNodeId: "listening" },
          { text: "How do I express myself more clearly?", nextNodeId: "expression" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "listening": {
        id: "listening",
        text: "Active listening requires presence. When someone speaks to you, give them your full attention. Listen not just to their words, but to the meaning behind them. Ask questions that show you understand. This is a skill that can be practiced.",
        choices: [
          { text: "I'd like to practice this skill.", nextNodeId: "quest-comm-start" },
          { text: "Tell me about expression.", nextNodeId: "expression" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "expression": {
        id: "expression",
        text: "Clear expression begins with clear thinking. Before you speak, know what you want to say. Use simple words when possible. Structure your thoughts. And remember—the goal is not to impress, but to communicate.",
        choices: [
          { text: "I'd like to work on this.", nextNodeId: "quest-comm-start" },
          { text: "Tell me about listening.", nextNodeId: "listening" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "learning": {
        id: "learning",
        text: "Learning how to learn is the most valuable skill you can develop. The mind is like a garden—it grows what you plant and tends. With the right techniques, you can absorb knowledge faster and retain it longer.",
        choices: [
          { text: "What techniques should I use?", nextNodeId: "learning-techniques" },
          { text: "Why is continuous learning important?", nextNodeId: "learning-importance" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "learning-techniques": {
        id: "learning-techniques",
        text: "Space your learning over time rather than cramming. Connect new knowledge to what you already know. Teach others what you learn—this deepens your own understanding. And always question what you read; critical thinking separates wisdom from mere information.",
        choices: [
          { text: "I want to develop these skills.", nextNodeId: "quests" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "learning-importance": {
        id: "learning-importance",
        text: "The world changes constantly. Those who stop learning are left behind. But more than that—learning keeps the mind sharp, opens new possibilities, and connects you to the accumulated wisdom of humanity. It is a gift that keeps giving.",
        choices: [
          { text: "I'm convinced. How do I start?", nextNodeId: "quests" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "quests": {
        id: "quests",
        text: "I have paths for those who seek to sharpen their minds and tongues. Communication, learning, wisdom, and mentorship—each builds upon the last. Where would you like to begin?",
        choices: [
          { text: "Communication skills", nextNodeId: "quest-comm-start" },
          { text: "Learning and knowledge", nextNodeId: "quest-know-info" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "quest-comm-start": {
        id: "quest-comm-start",
        text: "The 'First Words' quest will teach you the fundamentals of clear communication. It is the foundation upon which all other Air realm skills are built. Shall we begin?",
        choices: [
          { text: "Yes, I'm ready.", nextNodeId: "quest-accepted" },
          { text: "Let me prepare first.", nextNodeId: "root" },
        ],
      },
      "quest-know-info": {
        id: "quest-know-info",
        text: "The knowledge quests require mastery of communication first. Complete the 'Voice of Clarity' storyline, and the Scholar's Path will open to you.",
        choices: [
          { text: "I understand. I'll work on communication first.", nextNodeId: "root" },
        ],
      },
      "quest-accepted": {
        id: "quest-accepted",
        text: "Wonderful! Knowledge flows to those who seek it. Complete this quest and return—there is much more to learn.",
        choices: [
          { text: "Thank you, Sage Breeze.", nextNodeId: "farewell" },
        ],
      },
      "shop": {
        id: "shop",
        text: "I have collected tools for the pursuit of knowledge. Quills, scrolls, and items that enhance learning. Would you like to see them?",
        choices: [
          { text: "Yes, show me.", nextNodeId: "shop-open" },
          { text: "Maybe later.", nextNodeId: "root" },
        ],
      },
      "shop-open": {
        id: "shop-open",
        text: "[Opens shop interface]",
        choices: [
          { text: "Thank you.", nextNodeId: "root" },
        ],
      },
      "farewell": {
        id: "farewell",
        text: "May the winds of wisdom guide your path. Knowledge awaits those who seek it. Return whenever you thirst for more.",
        choices: [],
      },
    },
  },

  // Guide Compass Dialogue (Tutorial/Hub)
  {
    id: "dialogue-guide-compass",
    npcId: "guide-compass",
    rootNodeId: "root",
    nodes: {
      "root": {
        id: "root",
        text: "Welcome, traveler! I am Guide Compass, and I help newcomers find their way. The four realms await you—Land, Air, Water, and Self. Each offers unique wisdom. How can I help you today?",
        choices: [
          { text: "Tell me about the four realms.", nextNodeId: "realms-overview" },
          { text: "I'm new. Where should I start?", nextNodeId: "new-player" },
          { text: "How does this game work?", nextNodeId: "tutorial" },
          { text: "I know my way. Goodbye!", nextNodeId: "farewell" },
        ],
      },
      "realms-overview": {
        id: "realms-overview",
        text: "The four realms represent the pillars of a balanced life:\n\n🌍 LAND - Ancestry, property, and resources\n💨 AIR - Knowledge, communication, and wisdom\n💧 WATER - Emotions, healing, and balance\n🔥 SELF - Purpose, finances, and skills\n\nWhich realm calls to you?",
        choices: [
          { text: "Tell me about the Land realm.", nextNodeId: "realm-land" },
          { text: "Tell me about the Air realm.", nextNodeId: "realm-air" },
          { text: "Tell me about the Water realm.", nextNodeId: "realm-water" },
          { text: "Tell me about the Self realm.", nextNodeId: "realm-self" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "realm-land": {
        id: "realm-land",
        text: "The Land realm is about roots and foundation. Here you'll learn about your ancestry, understand property ownership, and master resource stewardship. Elder Root is the mentor here—wise and patient, they hold the secrets of generations.",
        choices: [
          { text: "How do I get there?", nextNodeId: "travel-land" },
          { text: "Tell me about another realm.", nextNodeId: "realms-overview" },
        ],
      },
      "realm-air": {
        id: "realm-air",
        text: "The Air realm is about the mind and communication. Here you'll sharpen your thinking, improve your communication, and pursue knowledge. Sage Breeze guides seekers here—brilliant and encouraging, they believe wisdom is the greatest gift.",
        choices: [
          { text: "How do I get there?", nextNodeId: "travel-air" },
          { text: "Tell me about another realm.", nextNodeId: "realms-overview" },
        ],
      },
      "realm-water": {
        id: "realm-water",
        text: "The Water realm is about emotions and healing. Here you'll develop emotional intelligence, process past wounds, and find balance. Healer Tide watches over this realm—compassionate and calm, they guide seekers through turbulent waters.",
        choices: [
          { text: "How do I get there?", nextNodeId: "travel-water" },
          { text: "Tell me about another realm.", nextNodeId: "realms-overview" },
        ],
      },
      "realm-self": {
        id: "realm-self",
        text: "The Self realm is about purpose and prosperity. Here you'll discover your purpose, build financial foundations, and develop entrepreneurial skills. Mentor Flame guides this realm—passionate and practical, they teach that true wealth begins with purpose.",
        choices: [
          { text: "How do I get there?", nextNodeId: "travel-self" },
          { text: "Tell me about another realm.", nextNodeId: "realms-overview" },
        ],
      },
      "travel-land": {
        id: "travel-land",
        text: "Simply select the Land realm from the realm selector. Elder Root awaits you there. Begin with the 'Roots of Origin' quest to start your journey.",
        choices: [
          { text: "Thank you!", nextNodeId: "root" },
        ],
      },
      "travel-air": {
        id: "travel-air",
        text: "Simply select the Air realm from the realm selector. Sage Breeze awaits you there. Begin with the 'First Words' quest to start your journey.",
        choices: [
          { text: "Thank you!", nextNodeId: "root" },
        ],
      },
      "travel-water": {
        id: "travel-water",
        text: "Simply select the Water realm from the realm selector. Healer Tide awaits you there. Begin with the 'Inner Reflection' quest to start your journey.",
        choices: [
          { text: "Thank you!", nextNodeId: "root" },
        ],
      },
      "travel-self": {
        id: "travel-self",
        text: "Simply select the Self realm from the realm selector. Mentor Flame awaits you there. Begin with the 'Purpose Discovery' quest to start your journey.",
        choices: [
          { text: "Thank you!", nextNodeId: "root" },
        ],
      },
      "new-player": {
        id: "new-player",
        text: "Welcome! I recommend starting with whichever realm resonates most with you right now. If you're unsure, the Self realm is a good starting point—understanding your purpose helps guide all other journeys. But truly, any realm is a valid beginning.",
        choices: [
          { text: "Tell me more about the realms.", nextNodeId: "realms-overview" },
          { text: "How do I complete quests?", nextNodeId: "tutorial-quests" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "tutorial": {
        id: "tutorial",
        text: "L.A.W.S. Quest is a journey of self-discovery and growth. You'll complete quests, earn experience and tokens, and develop your character across four attributes: Land, Air, Water, and Self. What would you like to know more about?",
        choices: [
          { text: "How do quests work?", nextNodeId: "tutorial-quests" },
          { text: "What are tokens for?", nextNodeId: "tutorial-tokens" },
          { text: "How do I level up?", nextNodeId: "tutorial-levels" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "tutorial-quests": {
        id: "tutorial-quests",
        text: "Quests are challenges that teach you valuable lessons. Each quest has a mini-game—trivia, reflection, math problems, or memory challenges. Complete the mini-game successfully to earn rewards. Some quests unlock others, creating storylines to follow.",
        choices: [
          { text: "What about tokens?", nextNodeId: "tutorial-tokens" },
          { text: "How do I level up?", nextNodeId: "tutorial-levels" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "tutorial-tokens": {
        id: "tutorial-tokens",
        text: "Tokens are the currency of L.A.W.S. Quest. Earn them by completing quests and daily logins. Spend them at shops to buy helpful items. In the future, tokens may connect to real-world benefits through the L.A.W.S. Collective!",
        choices: [
          { text: "How do quests work?", nextNodeId: "tutorial-quests" },
          { text: "How do I level up?", nextNodeId: "tutorial-levels" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "tutorial-levels": {
        id: "tutorial-levels",
        text: "Completing quests earns experience points. Gain enough experience and you'll level up! Higher levels unlock new quests, better items, and new ranks. Your rank reflects your overall mastery—from Seedling to Sovereign.",
        choices: [
          { text: "How do quests work?", nextNodeId: "tutorial-quests" },
          { text: "What about tokens?", nextNodeId: "tutorial-tokens" },
          { text: "Let me ask about something else.", nextNodeId: "root" },
        ],
      },
      "farewell": {
        id: "farewell",
        text: "Safe travels, friend! Remember, all paths lead somewhere—choose wisely, but don't be afraid to explore. I'll be here if you need guidance.",
        choices: [],
      },
    },
  },
];

// ============================================
// NPC HELPER FUNCTIONS
// ============================================

export function getNPCById(npcId: string): NPCDefinition | undefined {
  return NPCS.find(npc => npc.id === npcId);
}

export function getNPCsByRealm(realm: "land" | "air" | "water" | "self" | "hub"): NPCDefinition[] {
  return NPCS.filter(npc => npc.realm === realm);
}

export function getDialogueTree(treeId: string): DialogueTree | undefined {
  return DIALOGUE_TREES.find(tree => tree.id === treeId);
}

export function getDialogueNode(tree: DialogueTree, nodeId: string): DialogueNode | undefined {
  return tree.nodes[nodeId];
}

export function getAffinityLevel(affinity: number): number {
  // Affinity thresholds: 10, 25, 50, 75, 100
  if (affinity >= 100) return 5;
  if (affinity >= 75) return 4;
  if (affinity >= 50) return 3;
  if (affinity >= 25) return 2;
  if (affinity >= 10) return 1;
  return 0;
}

export function getNextAffinityThreshold(currentAffinity: number): number {
  const thresholds = [10, 25, 50, 75, 100];
  for (const threshold of thresholds) {
    if (currentAffinity < threshold) return threshold;
  }
  return 100;
}

export function getUnclaimedRewards(npcId: string, currentAffinity: number, claimedRewards: string[]): AffinityReward[] {
  const npc = getNPCById(npcId);
  if (!npc) return [];
  
  return npc.affinityRewards.filter(reward => {
    const rewardId = `${npcId}-${reward.level}`;
    return currentAffinity >= reward.level && !claimedRewards.includes(rewardId);
  });
}

export function calculateAffinityGain(action: "quest_complete" | "dialogue" | "gift" | "daily_visit"): number {
  const gains: Record<string, number> = {
    quest_complete: 5,
    dialogue: 1,
    gift: 3,
    daily_visit: 2,
  };
  return gains[action] || 0;
}
