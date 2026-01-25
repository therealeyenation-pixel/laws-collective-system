/**
 * S.W.A.L. NFT Collections
 * Five unique collections representing the journey to Sovereignty
 */

import {
  NFTCollection,
  NFTRarity,
  SWALPhase,
  SWAL_PHASES,
} from './swal-tokenomics';

// ============================================================================
// COLLECTION DEFINITIONS
// ============================================================================

export interface NFTCollectionConfig {
  id: NFTCollection;
  name: string;
  description: string;
  phase: SWALPhase;
  symbol: string;
  maxSupply: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundStyle: string;
  };
  traits: NFTTrait[];
  lore: string;
}

export interface NFTTrait {
  name: string;
  description: string;
  possibleValues: string[];
  rarityWeights: Record<NFTRarity, number[]>; // Weights for each value per rarity
}

export interface NFTArtwork {
  baseImage: string;
  overlays: {
    rarity: Record<NFTRarity, string>;
    traits: Record<string, Record<string, string>>;
  };
  animations?: {
    idle: string;
    special: string;
  };
}

// ============================================================================
// THE AWAKENING (SELF)
// ============================================================================

export const THE_AWAKENING: NFTCollectionConfig = {
  id: 'the_awakening',
  name: 'The Awakening',
  description: 'Proof of self-discovery and inner knowing. The first step on the journey to Sovereignty.',
  phase: 'self',
  symbol: 'AWAKEN',
  maxSupply: 2500,
  theme: {
    primaryColor: '#9333EA',
    secondaryColor: '#7C3AED',
    accentColor: '#C4B5FD',
    backgroundStyle: 'radial-gradient(circle at center, #1E1B4B 0%, #0F0D1A 100%)',
  },
  traits: [
    {
      name: 'Inner Light',
      description: 'The intensity of self-awareness achieved',
      possibleValues: ['Dim Spark', 'Steady Glow', 'Bright Flame', 'Radiant Sun', 'Cosmic Blaze'],
      rarityWeights: {
        common: [50, 30, 15, 4, 1],
        uncommon: [30, 35, 25, 8, 2],
        rare: [15, 25, 35, 20, 5],
        epic: [5, 15, 30, 35, 15],
        legendary: [1, 5, 15, 35, 44],
      },
    },
    {
      name: 'Mirror Type',
      description: 'The reflection that revealed your truth',
      possibleValues: ['Still Water', 'Polished Stone', 'Crystal Clear', 'Ancestral Glass', 'Infinite Void'],
      rarityWeights: {
        common: [45, 35, 15, 4, 1],
        uncommon: [25, 40, 25, 8, 2],
        rare: [10, 25, 40, 20, 5],
        epic: [5, 10, 30, 40, 15],
        legendary: [1, 5, 14, 35, 45],
      },
    },
    {
      name: 'Awakening Hour',
      description: 'The time of your awakening',
      possibleValues: ['Dawn', 'Noon', 'Dusk', 'Midnight', 'Eclipse'],
      rarityWeights: {
        common: [40, 35, 20, 4, 1],
        uncommon: [30, 30, 28, 10, 2],
        rare: [20, 25, 30, 20, 5],
        epic: [10, 15, 25, 35, 15],
        legendary: [2, 5, 13, 35, 45],
      },
    },
  ],
  lore: `In the beginning, there was only darkness and potential. The Awakening marks the moment 
when a soul first glimpses its true nature—not as a fleeting shadow, but as an eternal flame. 
Those who hold these tokens have taken the first and most crucial step: they have chosen to know themselves.`,
};

// ============================================================================
// THE HEALING (WATER)
// ============================================================================

export const THE_HEALING: NFTCollectionConfig = {
  id: 'the_healing',
  name: 'The Healing',
  description: 'Proof of emotional restoration and balance. The waters that cleanse and renew.',
  phase: 'water',
  symbol: 'HEAL',
  maxSupply: 2000,
  theme: {
    primaryColor: '#0EA5E9',
    secondaryColor: '#0284C7',
    accentColor: '#7DD3FC',
    backgroundStyle: 'linear-gradient(180deg, #0C4A6E 0%, #082F49 50%, #0A1929 100%)',
  },
  traits: [
    {
      name: 'Water Source',
      description: 'The healing waters that restored you',
      possibleValues: ['Mountain Spring', 'River Flow', 'Ocean Depths', 'Sacred Well', 'Celestial Rain'],
      rarityWeights: {
        common: [45, 35, 15, 4, 1],
        uncommon: [30, 35, 25, 8, 2],
        rare: [15, 25, 35, 20, 5],
        epic: [5, 15, 30, 35, 15],
        legendary: [1, 5, 15, 34, 45],
      },
    },
    {
      name: 'Healing Depth',
      description: 'How deep the healing reached',
      possibleValues: ['Surface Calm', 'Emotional Tide', 'Soul Cleanse', 'Ancestral Release', 'Generational Cure'],
      rarityWeights: {
        common: [50, 30, 15, 4, 1],
        uncommon: [30, 35, 25, 8, 2],
        rare: [15, 25, 35, 20, 5],
        epic: [5, 15, 30, 35, 15],
        legendary: [1, 5, 14, 35, 45],
      },
    },
    {
      name: 'Moon Phase',
      description: 'The lunar influence during healing',
      possibleValues: ['New Moon', 'Waxing', 'Full Moon', 'Waning', 'Blue Moon'],
      rarityWeights: {
        common: [35, 35, 20, 8, 2],
        uncommon: [25, 30, 30, 12, 3],
        rare: [15, 25, 35, 18, 7],
        epic: [8, 15, 35, 27, 15],
        legendary: [2, 8, 25, 30, 35],
      },
    },
  ],
  lore: `Water remembers everything—every joy, every sorrow, every wound passed down through generations. 
The Healing collection honors those brave enough to face the depths of their pain and emerge renewed. 
Like water finding its level, these souls have found their balance.`,
};

// ============================================================================
// THE ENLIGHTENMENT (AIR)
// ============================================================================

export const THE_ENLIGHTENMENT: NFTCollectionConfig = {
  id: 'the_enlightenment',
  name: 'The Enlightenment',
  description: 'Proof of wisdom gained and knowledge mastered. The breath of understanding.',
  phase: 'air',
  symbol: 'LIGHT',
  maxSupply: 1500,
  theme: {
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    accentColor: '#FDE68A',
    backgroundStyle: 'linear-gradient(135deg, #78350F 0%, #451A03 50%, #1C0A00 100%)',
  },
  traits: [
    {
      name: 'Wind Direction',
      description: 'The winds that carried your knowledge',
      possibleValues: ['East Wind', 'South Wind', 'West Wind', 'North Wind', 'Divine Breath'],
      rarityWeights: {
        common: [30, 30, 25, 13, 2],
        uncommon: [25, 25, 28, 18, 4],
        rare: [18, 20, 30, 24, 8],
        epic: [10, 15, 25, 35, 15],
        legendary: [5, 8, 17, 30, 40],
      },
    },
    {
      name: 'Wisdom Type',
      description: 'The nature of knowledge attained',
      possibleValues: ['Book Learning', 'Life Experience', 'Ancestral Memory', 'Divine Revelation', 'Universal Truth'],
      rarityWeights: {
        common: [45, 35, 15, 4, 1],
        uncommon: [30, 35, 25, 8, 2],
        rare: [15, 25, 35, 20, 5],
        epic: [5, 15, 30, 35, 15],
        legendary: [1, 5, 14, 35, 45],
      },
    },
    {
      name: 'Sky State',
      description: 'The heavens at your enlightenment',
      possibleValues: ['Clear Day', 'Clouded', 'Stormy', 'Starlit', 'Aurora'],
      rarityWeights: {
        common: [40, 35, 18, 5, 2],
        uncommon: [30, 30, 25, 12, 3],
        rare: [20, 25, 28, 20, 7],
        epic: [10, 15, 25, 35, 15],
        legendary: [3, 7, 15, 30, 45],
      },
    },
  ],
  lore: `Knowledge rises like smoke, wisdom settles like dew. The Enlightenment marks those who have 
breathed in the teachings of ages and exhaled understanding. They speak with the voice of ancestors 
and see with eyes unclouded by ignorance.`,
};

// ============================================================================
// THE FOUNDATION (LAND)
// ============================================================================

export const THE_FOUNDATION: NFTCollectionConfig = {
  id: 'the_foundation',
  name: 'The Foundation',
  description: 'Proof of stability established and legacy rooted. The ground upon which generations stand.',
  phase: 'land',
  symbol: 'FOUND',
  maxSupply: 1000,
  theme: {
    primaryColor: '#22C55E',
    secondaryColor: '#16A34A',
    accentColor: '#86EFAC',
    backgroundStyle: 'linear-gradient(180deg, #14532D 0%, #052E16 50%, #022C22 100%)',
  },
  traits: [
    {
      name: 'Soil Type',
      description: 'The earth that holds your roots',
      possibleValues: ['Rich Loam', 'Ancient Clay', 'Mountain Stone', 'Sacred Ground', 'Ancestral Dust'],
      rarityWeights: {
        common: [45, 30, 18, 5, 2],
        uncommon: [30, 35, 25, 8, 2],
        rare: [15, 25, 35, 20, 5],
        epic: [5, 15, 30, 35, 15],
        legendary: [1, 5, 14, 35, 45],
      },
    },
    {
      name: 'Root Depth',
      description: 'How deep your foundation reaches',
      possibleValues: ['Surface Roots', 'Deep Tap', 'Bedrock Anchor', 'Earth Core', 'Infinite Depth'],
      rarityWeights: {
        common: [50, 30, 15, 4, 1],
        uncommon: [30, 35, 25, 8, 2],
        rare: [15, 25, 35, 20, 5],
        epic: [5, 15, 30, 35, 15],
        legendary: [1, 5, 14, 35, 45],
      },
    },
    {
      name: 'Season Planted',
      description: 'When your foundation was laid',
      possibleValues: ['Spring', 'Summer', 'Autumn', 'Winter', 'Eternal Season'],
      rarityWeights: {
        common: [30, 30, 25, 13, 2],
        uncommon: [25, 28, 28, 15, 4],
        rare: [18, 22, 30, 22, 8],
        epic: [10, 15, 25, 35, 15],
        legendary: [5, 8, 17, 30, 40],
      },
    },
  ],
  lore: `From the earth we came, and to the earth we return—but not before we build something that endures. 
The Foundation honors those who have planted seeds that will shade generations yet unborn. 
Their legacy is written not in words, but in the very land itself.`,
};

// ============================================================================
// THE CROWN (SOVEREIGNTY)
// ============================================================================

export const THE_CROWN: NFTCollectionConfig = {
  id: 'the_crown',
  name: 'The Crown',
  description: 'Proof of complete mastery and sovereign authority. The ultimate achievement.',
  phase: 'sovereignty',
  symbol: 'CROWN',
  maxSupply: 500,
  theme: {
    primaryColor: '#EAB308',
    secondaryColor: '#CA8A04',
    accentColor: '#FEF08A',
    backgroundStyle: 'radial-gradient(ellipse at top, #713F12 0%, #422006 40%, #1A0A00 100%)',
  },
  traits: [
    {
      name: 'Crown Material',
      description: 'What your crown is forged from',
      possibleValues: ['Silver', 'Gold', 'Platinum', 'Stardust', 'Pure Light'],
      rarityWeights: {
        common: [45, 35, 15, 4, 1],
        uncommon: [25, 40, 25, 8, 2],
        rare: [10, 25, 40, 20, 5],
        epic: [5, 10, 30, 40, 15],
        legendary: [1, 5, 14, 35, 45],
      },
    },
    {
      name: 'Jewel Count',
      description: 'The gems adorning your crown',
      possibleValues: ['Single Stone', 'Three Gems', 'Seven Stars', 'Twelve Lights', 'Infinite Radiance'],
      rarityWeights: {
        common: [50, 30, 15, 4, 1],
        uncommon: [30, 35, 25, 8, 2],
        rare: [15, 25, 35, 20, 5],
        epic: [5, 15, 30, 35, 15],
        legendary: [1, 5, 14, 35, 45],
      },
    },
    {
      name: 'Coronation Witness',
      description: 'Who witnessed your sovereignty',
      possibleValues: ['Self Alone', 'Family Circle', 'Community Gathered', 'Ancestors Present', 'Universe Watching'],
      rarityWeights: {
        common: [40, 35, 18, 5, 2],
        uncommon: [25, 35, 28, 10, 2],
        rare: [15, 25, 35, 20, 5],
        epic: [5, 15, 30, 35, 15],
        legendary: [1, 5, 14, 35, 45],
      },
    },
  ],
  lore: `The Crown is not given—it is claimed by those who have walked the full path. Through Self-knowledge, 
Water's healing, Air's wisdom, and Land's foundation, the Sovereign rises. These are the rarest souls, 
the ones who have mastered all four elements and now stand as beacons for those who follow.`,
};

// ============================================================================
// COLLECTION REGISTRY
// ============================================================================

export const NFT_COLLECTIONS: Record<NFTCollection, NFTCollectionConfig> = {
  the_awakening: THE_AWAKENING,
  the_healing: THE_HEALING,
  the_enlightenment: THE_ENLIGHTENMENT,
  the_foundation: THE_FOUNDATION,
  the_crown: THE_CROWN,
};

// ============================================================================
// TRAIT GENERATION
// ============================================================================

/**
 * Generate random traits for an NFT based on rarity
 */
export function generateNFTTraits(
  collection: NFTCollection,
  rarity: NFTRarity
): Record<string, string> {
  const config = NFT_COLLECTIONS[collection];
  const traits: Record<string, string> = {};
  
  for (const trait of config.traits) {
    const weights = trait.rarityWeights[rarity];
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < trait.possibleValues.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        traits[trait.name] = trait.possibleValues[i];
        break;
      }
    }
    
    // Fallback to first value if something went wrong
    if (!traits[trait.name]) {
      traits[trait.name] = trait.possibleValues[0];
    }
  }
  
  return traits;
}

/**
 * Calculate trait rarity score
 */
export function calculateTraitRarityScore(
  collection: NFTCollection,
  traits: Record<string, string>
): number {
  const config = NFT_COLLECTIONS[collection];
  let totalScore = 0;
  
  for (const trait of config.traits) {
    const valueIndex = trait.possibleValues.indexOf(traits[trait.name]);
    if (valueIndex !== -1) {
      // Higher index = rarer trait = higher score
      totalScore += (valueIndex + 1) * 20;
    }
  }
  
  return totalScore;
}

/**
 * Get collection by phase
 */
export function getCollectionByPhase(phase: SWALPhase): NFTCollectionConfig {
  const phaseConfig = SWAL_PHASES[phase];
  return NFT_COLLECTIONS[phaseConfig.nftCollection];
}

/**
 * Generate full NFT display data
 */
export function generateNFTDisplayData(
  collection: NFTCollection,
  rarity: NFTRarity,
  tokenNumber: number
): {
  name: string;
  description: string;
  traits: Record<string, string>;
  rarityScore: number;
  theme: NFTCollectionConfig['theme'];
  lore: string;
} {
  const config = NFT_COLLECTIONS[collection];
  const traits = generateNFTTraits(collection, rarity);
  const rarityScore = calculateTraitRarityScore(collection, traits);
  
  const rarityPrefix: Record<NFTRarity, string> = {
    common: '',
    uncommon: 'Notable ',
    rare: 'Distinguished ',
    epic: 'Legendary ',
    legendary: 'Mythic ',
  };
  
  return {
    name: `${rarityPrefix[rarity]}${config.name} #${tokenNumber}`,
    description: config.description,
    traits,
    rarityScore,
    theme: config.theme,
    lore: config.lore,
  };
}
