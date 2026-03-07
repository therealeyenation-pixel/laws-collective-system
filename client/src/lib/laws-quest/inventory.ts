/**
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The The The L.A.W.S. Collective, LLC
 * 
 * Inventory system with crafting, item management, and economy
 */

import type { InventoryItem, ItemType, ItemRarity, ItemEffect, Character } from "./types";

// ============================================
// ITEM DEFINITIONS
// ============================================

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  stackable: boolean;
  maxStack: number;
  sellValue: number;
  buyValue?: number;
  effect?: ItemEffect;
  craftable?: boolean;
  craftingRecipe?: CraftingRecipe;
  questReward?: boolean;
  achievementReward?: boolean;
  realm?: "land" | "air" | "water" | "self";
}

export interface CraftingRecipe {
  ingredients: { itemId: string; quantity: number }[];
  craftingTime: number; // seconds
  requiredLevel: number;
  requiredStats?: Partial<Record<"land" | "air" | "water" | "self", number>>;
}

// ============================================
// CONSUMABLE ITEMS
// ============================================

export const CONSUMABLE_ITEMS: ItemDefinition[] = [
  // Energy Restoration
  {
    id: "energy-tea",
    name: "Herbal Energy Tea",
    description: "A soothing tea that restores 20 energy.",
    type: "consumable",
    rarity: "common",
    icon: "🍵",
    stackable: true,
    maxStack: 20,
    sellValue: 5,
    buyValue: 10,
    effect: { type: "energy_restore", value: 20 },
  },
  {
    id: "energy-elixir",
    name: "Vitality Elixir",
    description: "A potent elixir that restores 50 energy.",
    type: "consumable",
    rarity: "uncommon",
    icon: "🧪",
    stackable: true,
    maxStack: 10,
    sellValue: 15,
    buyValue: 30,
    effect: { type: "energy_restore", value: 50 },
    craftable: true,
    craftingRecipe: {
      ingredients: [
        { itemId: "energy-tea", quantity: 3 },
        { itemId: "herb-vitality", quantity: 2 },
      ],
      craftingTime: 30,
      requiredLevel: 5,
    },
  },
  {
    id: "energy-surge",
    name: "Sovereign's Surge",
    description: "A legendary drink that fully restores energy.",
    type: "consumable",
    rarity: "legendary",
    icon: "⚡",
    stackable: true,
    maxStack: 5,
    sellValue: 100,
    effect: { type: "energy_restore", value: 999 },
    questReward: true,
  },

  // Stat Boosters
  {
    id: "boost-land",
    name: "Earth Essence",
    description: "Temporarily increases LAND stat by 5 for the next quest.",
    type: "consumable",
    rarity: "uncommon",
    icon: "🌍",
    stackable: true,
    maxStack: 10,
    sellValue: 20,
    buyValue: 40,
    effect: { type: "stat_boost", stat: "land", value: 5, duration: 1 },
    realm: "land",
  },
  {
    id: "boost-air",
    name: "Wind Essence",
    description: "Temporarily increases AIR stat by 5 for the next quest.",
    type: "consumable",
    rarity: "uncommon",
    icon: "💨",
    stackable: true,
    maxStack: 10,
    sellValue: 20,
    buyValue: 40,
    effect: { type: "stat_boost", stat: "air", value: 5, duration: 1 },
    realm: "air",
  },
  {
    id: "boost-water",
    name: "Tide Essence",
    description: "Temporarily increases WATER stat by 5 for the next quest.",
    type: "consumable",
    rarity: "uncommon",
    icon: "💧",
    stackable: true,
    maxStack: 10,
    sellValue: 20,
    buyValue: 40,
    effect: { type: "stat_boost", stat: "water", value: 5, duration: 1 },
    realm: "water",
  },
  {
    id: "boost-self",
    name: "Flame Essence",
    description: "Temporarily increases SELF stat by 5 for the next quest.",
    type: "consumable",
    rarity: "uncommon",
    icon: "🔥",
    stackable: true,
    maxStack: 10,
    sellValue: 20,
    buyValue: 40,
    effect: { type: "stat_boost", stat: "self", value: 5, duration: 1 },
    realm: "self",
  },

  // Experience Boosters
  {
    id: "exp-scroll",
    name: "Scroll of Learning",
    description: "Grants 50 bonus experience points.",
    type: "consumable",
    rarity: "uncommon",
    icon: "📜",
    stackable: true,
    maxStack: 10,
    sellValue: 25,
    effect: { type: "experience_boost", value: 50 },
  },
  {
    id: "exp-tome",
    name: "Tome of Wisdom",
    description: "Grants 200 bonus experience points.",
    type: "consumable",
    rarity: "rare",
    icon: "📕",
    stackable: true,
    maxStack: 5,
    sellValue: 75,
    effect: { type: "experience_boost", value: 200 },
    craftable: true,
    craftingRecipe: {
      ingredients: [
        { itemId: "exp-scroll", quantity: 5 },
        { itemId: "ink-wisdom", quantity: 1 },
      ],
      craftingTime: 60,
      requiredLevel: 15,
    },
  },
];

// ============================================
// EQUIPMENT ITEMS
// ============================================

export const EQUIPMENT_ITEMS: ItemDefinition[] = [
  // Tools
  {
    id: "quill-basic",
    name: "Basic Quill",
    description: "A simple writing tool. +2 AIR stat.",
    type: "tool",
    rarity: "common",
    icon: "🪶",
    stackable: false,
    maxStack: 1,
    sellValue: 10,
    buyValue: 25,
    effect: { type: "stat_permanent", stat: "air", value: 2 },
    realm: "air",
  },
  {
    id: "quill-scholar",
    name: "Scholar's Quill",
    description: "An elegant quill used by learned scholars. +5 AIR stat.",
    type: "tool",
    rarity: "rare",
    icon: "✒️",
    stackable: false,
    maxStack: 1,
    sellValue: 50,
    effect: { type: "stat_permanent", stat: "air", value: 5 },
    realm: "air",
    questReward: true,
  },
  {
    id: "compass-basic",
    name: "Traveler's Compass",
    description: "Helps navigate the realms. +2 LAND stat.",
    type: "tool",
    rarity: "common",
    icon: "🧭",
    stackable: false,
    maxStack: 1,
    sellValue: 10,
    buyValue: 25,
    effect: { type: "stat_permanent", stat: "land", value: 2 },
    realm: "land",
  },
  {
    id: "compass-sovereign",
    name: "Sovereign's Compass",
    description: "A masterwork compass that always points to your purpose. +5 LAND, +3 SELF.",
    type: "tool",
    rarity: "epic",
    icon: "🔮",
    stackable: false,
    maxStack: 1,
    sellValue: 200,
    effect: { type: "stat_permanent", stat: "land", value: 5 },
    questReward: true,
  },
  {
    id: "ledger-basic",
    name: "Basic Ledger",
    description: "A simple accounting book. +2 SELF stat.",
    type: "tool",
    rarity: "common",
    icon: "📒",
    stackable: false,
    maxStack: 1,
    sellValue: 10,
    buyValue: 25,
    effect: { type: "stat_permanent", stat: "self", value: 2 },
    realm: "self",
  },
  {
    id: "ledger-master",
    name: "Master's Ledger",
    description: "A comprehensive financial tracking system. +5 SELF stat.",
    type: "tool",
    rarity: "rare",
    icon: "📊",
    stackable: false,
    maxStack: 1,
    sellValue: 50,
    effect: { type: "stat_permanent", stat: "self", value: 5 },
    realm: "self",
    questReward: true,
  },
  {
    id: "mirror-reflection",
    name: "Mirror of Reflection",
    description: "A mirror that reveals inner truths. +2 WATER stat.",
    type: "tool",
    rarity: "common",
    icon: "🪞",
    stackable: false,
    maxStack: 1,
    sellValue: 10,
    buyValue: 25,
    effect: { type: "stat_permanent", stat: "water", value: 2 },
    realm: "water",
  },
  {
    id: "mirror-soul",
    name: "Soul Mirror",
    description: "A mystical mirror that reveals the depths of emotion. +5 WATER stat.",
    type: "tool",
    rarity: "rare",
    icon: "💎",
    stackable: false,
    maxStack: 1,
    sellValue: 50,
    effect: { type: "stat_permanent", stat: "water", value: 5 },
    realm: "water",
    questReward: true,
  },
];

// ============================================
// ARTIFACT ITEMS (Special/Legendary)
// ============================================

export const ARTIFACT_ITEMS: ItemDefinition[] = [
  {
    id: "artifact-family-tree",
    name: "Ancestral Family Tree",
    description: "A beautifully documented family tree spanning generations. +10 LAND stat.",
    longDescription: "This meticulously crafted document traces your lineage through the ages, connecting you to the wisdom and strength of your ancestors.",
    type: "artifact",
    rarity: "legendary",
    icon: "🌳",
    stackable: false,
    maxStack: 1,
    sellValue: 0, // Cannot be sold
    effect: { type: "stat_permanent", stat: "land", value: 10 },
    realm: "land",
    questReward: true,
  },
  {
    id: "artifact-wisdom-crystal",
    name: "Crystal of Accumulated Wisdom",
    description: "A crystal that glows with the knowledge of ages. +10 AIR stat.",
    longDescription: "This ancient crystal contains the distilled wisdom of countless scholars and teachers who came before.",
    type: "artifact",
    rarity: "legendary",
    icon: "💠",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    effect: { type: "stat_permanent", stat: "air", value: 10 },
    realm: "air",
    achievementReward: true,
  },
  {
    id: "artifact-healing-waters",
    name: "Vial of Healing Waters",
    description: "Waters from the source of all healing. +10 WATER stat.",
    longDescription: "These sacred waters carry the essence of emotional healing and balance, collected from the deepest springs of the Water realm.",
    type: "artifact",
    rarity: "legendary",
    icon: "🏺",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    effect: { type: "stat_permanent", stat: "water", value: 10 },
    realm: "water",
    achievementReward: true,
  },
  {
    id: "artifact-sovereign-seal",
    name: "Sovereign's Seal",
    description: "The mark of true sovereignty. +10 SELF stat.",
    longDescription: "This seal represents the achievement of true self-sovereignty—mastery over one's purpose, finances, and destiny.",
    type: "artifact",
    rarity: "legendary",
    icon: "👑",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    effect: { type: "stat_permanent", stat: "self", value: 10 },
    realm: "self",
    achievementReward: true,
  },
  {
    id: "artifact-laws-medallion",
    name: "L.A.W.S. Medallion",
    description: "The ultimate symbol of mastery across all realms. +5 to ALL stats.",
    longDescription: "This medallion is awarded only to those who have demonstrated mastery in Land, Air, Water, and Self. It represents the complete integration of all four pillars.",
    type: "artifact",
    rarity: "legendary",
    icon: "🏅",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    effect: { type: "stat_permanent", value: 5 }, // All stats
    achievementReward: true,
  },
];

// ============================================
// RESOURCE ITEMS (Crafting Materials)
// ============================================

export const RESOURCE_ITEMS: ItemDefinition[] = [
  {
    id: "herb-vitality",
    name: "Vitality Herb",
    description: "A common herb used in energy restoration recipes.",
    type: "resource",
    rarity: "common",
    icon: "🌿",
    stackable: true,
    maxStack: 99,
    sellValue: 2,
    buyValue: 5,
  },
  {
    id: "herb-clarity",
    name: "Clarity Herb",
    description: "A herb that enhances mental focus.",
    type: "resource",
    rarity: "uncommon",
    icon: "🍃",
    stackable: true,
    maxStack: 99,
    sellValue: 5,
    buyValue: 12,
  },
  {
    id: "ink-wisdom",
    name: "Wisdom Ink",
    description: "Special ink used for creating knowledge scrolls.",
    type: "resource",
    rarity: "rare",
    icon: "🖋️",
    stackable: true,
    maxStack: 50,
    sellValue: 15,
    buyValue: 35,
  },
  {
    id: "crystal-shard",
    name: "Crystal Shard",
    description: "A fragment of crystallized energy.",
    type: "resource",
    rarity: "uncommon",
    icon: "💎",
    stackable: true,
    maxStack: 99,
    sellValue: 8,
    buyValue: 20,
  },
  {
    id: "essence-pure",
    name: "Pure Essence",
    description: "Refined essence used in advanced crafting.",
    type: "resource",
    rarity: "rare",
    icon: "✨",
    stackable: true,
    maxStack: 50,
    sellValue: 25,
    buyValue: 60,
  },
  {
    id: "parchment-ancient",
    name: "Ancient Parchment",
    description: "Aged parchment perfect for important documents.",
    type: "resource",
    rarity: "uncommon",
    icon: "📃",
    stackable: true,
    maxStack: 50,
    sellValue: 10,
    buyValue: 25,
  },
];

// ============================================
// KEY ITEMS (Quest/Story Items)
// ============================================

export const KEY_ITEMS: ItemDefinition[] = [
  {
    id: "key-land-realm",
    name: "Key to the Land Realm",
    description: "Grants access to advanced Land realm areas.",
    type: "key",
    rarity: "rare",
    icon: "🗝️",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    questReward: true,
  },
  {
    id: "key-air-realm",
    name: "Key to the Air Realm",
    description: "Grants access to advanced Air realm areas.",
    type: "key",
    rarity: "rare",
    icon: "🔑",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    questReward: true,
  },
  {
    id: "key-water-realm",
    name: "Key to the Water Realm",
    description: "Grants access to advanced Water realm areas.",
    type: "key",
    rarity: "rare",
    icon: "🗝️",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    questReward: true,
  },
  {
    id: "key-self-realm",
    name: "Key to the Self Realm",
    description: "Grants access to advanced Self realm areas.",
    type: "key",
    rarity: "rare",
    icon: "🔑",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    questReward: true,
  },
  {
    id: "scroll-ancestry",
    name: "Scroll of Ancestry",
    description: "Contains clues about your family history.",
    type: "scroll",
    rarity: "uncommon",
    icon: "📜",
    stackable: false,
    maxStack: 1,
    sellValue: 0,
    questReward: true,
  },
];

// ============================================
// COMBINED ITEM DATABASE
// ============================================

export const ALL_ITEMS: ItemDefinition[] = [
  ...CONSUMABLE_ITEMS,
  ...EQUIPMENT_ITEMS,
  ...ARTIFACT_ITEMS,
  ...RESOURCE_ITEMS,
  ...KEY_ITEMS,
];

export const ITEM_DATABASE: Record<string, ItemDefinition> = Object.fromEntries(
  ALL_ITEMS.map(item => [item.id, item])
);

// ============================================
// SHOP INVENTORY
// ============================================

export interface ShopItem {
  itemId: string;
  stock: number; // -1 for unlimited
  discount?: number; // percentage
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  realm: "land" | "air" | "water" | "self" | "hub";
  npcId?: string;
  items: ShopItem[];
  requiredLevel?: number;
}

export const SHOPS: Shop[] = [
  {
    id: "shop-hub-general",
    name: "General Store",
    description: "Basic supplies for all travelers.",
    realm: "hub",
    items: [
      { itemId: "energy-tea", stock: -1 },
      { itemId: "herb-vitality", stock: -1 },
      { itemId: "parchment-ancient", stock: 10 },
    ],
  },
  {
    id: "shop-land",
    name: "Earth Emporium",
    description: "Supplies for Land realm exploration.",
    realm: "land",
    npcId: "elder-root",
    items: [
      { itemId: "compass-basic", stock: 5 },
      { itemId: "boost-land", stock: 10 },
      { itemId: "herb-vitality", stock: -1 },
    ],
  },
  {
    id: "shop-air",
    name: "Scholar's Supply",
    description: "Tools for the pursuit of knowledge.",
    realm: "air",
    npcId: "sage-breeze",
    items: [
      { itemId: "quill-basic", stock: 5 },
      { itemId: "boost-air", stock: 10 },
      { itemId: "exp-scroll", stock: 5 },
      { itemId: "ink-wisdom", stock: 3 },
    ],
    requiredLevel: 5,
  },
  {
    id: "shop-water",
    name: "Healing Springs Shop",
    description: "Items for emotional balance and healing.",
    realm: "water",
    npcId: "healer-tide",
    items: [
      { itemId: "mirror-reflection", stock: 5 },
      { itemId: "boost-water", stock: 10 },
      { itemId: "energy-elixir", stock: 5 },
    ],
    requiredLevel: 5,
  },
  {
    id: "shop-self",
    name: "Sovereign's Market",
    description: "Tools for building financial mastery.",
    realm: "self",
    npcId: "mentor-flame",
    items: [
      { itemId: "ledger-basic", stock: 5 },
      { itemId: "boost-self", stock: 10 },
      { itemId: "crystal-shard", stock: 10 },
    ],
    requiredLevel: 5,
  },
];

// ============================================
// INVENTORY MANAGEMENT FUNCTIONS
// ============================================

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return ITEM_DATABASE[itemId];
}

export function canStackItems(item1: InventoryItem, item2: InventoryItem): boolean {
  if (item1.id !== item2.id) return false;
  const definition = getItemDefinition(item1.id);
  return definition?.stackable ?? false;
}

export function getMaxStack(itemId: string): number {
  const definition = getItemDefinition(itemId);
  return definition?.maxStack ?? 1;
}

export function calculateSellValue(item: InventoryItem): number {
  const definition = getItemDefinition(item.id);
  if (!definition) return 0;
  return definition.sellValue * item.quantity;
}

export function canAffordItem(tokens: number, itemId: string, quantity: number = 1): boolean {
  const definition = getItemDefinition(itemId);
  if (!definition?.buyValue) return false;
  return tokens >= definition.buyValue * quantity;
}

export function getItemsByType(type: ItemType): ItemDefinition[] {
  return ALL_ITEMS.filter(item => item.type === type);
}

export function getItemsByRarity(rarity: ItemRarity): ItemDefinition[] {
  return ALL_ITEMS.filter(item => item.rarity === rarity);
}

export function getItemsByRealm(realm: "land" | "air" | "water" | "self"): ItemDefinition[] {
  return ALL_ITEMS.filter(item => item.realm === realm);
}

export function getCraftableItems(): ItemDefinition[] {
  return ALL_ITEMS.filter(item => item.craftable);
}

export function canCraftItem(
  itemId: string, 
  inventory: InventoryItem[], 
  level: number,
  stats: Record<string, number>
): { canCraft: boolean; missingIngredients: { itemId: string; needed: number; have: number }[] } {
  const definition = getItemDefinition(itemId);
  if (!definition?.craftable || !definition.craftingRecipe) {
    return { canCraft: false, missingIngredients: [] };
  }

  const recipe = definition.craftingRecipe;
  
  // Check level requirement
  if (level < recipe.requiredLevel) {
    return { canCraft: false, missingIngredients: [] };
  }

  // Check stat requirements
  if (recipe.requiredStats) {
    for (const [stat, value] of Object.entries(recipe.requiredStats)) {
      if ((stats[stat] || 0) < value) {
        return { canCraft: false, missingIngredients: [] };
      }
    }
  }

  // Check ingredients
  const missingIngredients: { itemId: string; needed: number; have: number }[] = [];
  
  for (const ingredient of recipe.ingredients) {
    const inventoryItem = inventory.find(i => i.id === ingredient.itemId);
    const have = inventoryItem?.quantity || 0;
    
    if (have < ingredient.quantity) {
      missingIngredients.push({
        itemId: ingredient.itemId,
        needed: ingredient.quantity,
        have,
      });
    }
  }

  return {
    canCraft: missingIngredients.length === 0,
    missingIngredients,
  };
}

// ============================================
// RARITY COLORS AND DISPLAY
// ============================================

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-yellow-400",
};

export const RARITY_BG_COLORS: Record<ItemRarity, string> = {
  common: "bg-gray-500/20",
  uncommon: "bg-green-500/20",
  rare: "bg-blue-500/20",
  epic: "bg-purple-500/20",
  legendary: "bg-yellow-500/20",
};

export const RARITY_BORDER_COLORS: Record<ItemRarity, string> = {
  common: "border-gray-500",
  uncommon: "border-green-500",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-yellow-500",
};

export function getRarityDisplay(rarity: ItemRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}
