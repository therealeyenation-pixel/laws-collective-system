/**
 * S.W.A.L. Tokenomics System
 * Owner: The L.A.W.S. Collective, LLC
 * 
 * Journey to Sovereignty: Self → Water → Air → Land → Sovereignty
 * 
 * The S.W.A.L. system represents the internal journey to sovereignty:
 * - SELF: Know yourself first (The Awakening)
 * - WATER: Heal and find balance (The Healing)
 * - AIR: Gain knowledge and wisdom (The Enlightenment)
 * - LAND: Build stability and legacy (The Foundation)
 * - SOVEREIGNTY: Complete mastery (The Crown)
 */

// ============================================================================
// CONSTANTS
// ============================================================================

export const SWAL_TOTAL_SUPPLY = 10_000;
export const SWAL_RESERVE_POOL = 2_500; // For Academy/Employee benefits
export const SWAL_PUBLIC_SUPPLY = 7_500; // Available for public purchase

// ============================================================================
// TYPES
// ============================================================================

export type SWALPhase = 'self' | 'water' | 'air' | 'land' | 'sovereignty';

export type SWALTier = 'genesis' | 'flow' | 'ascend' | 'root' | 'crown';

export type NFTCollection = 
  | 'the_awakening'    // SELF completions
  | 'the_healing'      // WATER completions
  | 'the_enlightenment' // AIR completions
  | 'the_foundation'   // LAND completions
  | 'the_crown';       // SOVEREIGNTY completions

export type NFTRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface SWALPhaseConfig {
  phase: SWALPhase;
  tier: SWALTier;
  order: number;
  name: string;
  description: string;
  totalSupply: number;
  basePrice: number; // USD
  valueMultiplier: number;
  nftCollection: NFTCollection;
  collectionName: string;
  color: string;
  icon: string;
  unlockRequirements: {
    previousPhaseComplete: boolean;
    minLevel?: number;
    minRealmStat?: number;
  };
}

export interface SWALToken {
  id: string;
  phase: SWALPhase;
  tier: SWALTier;
  tokenNumber: number; // 1 to totalSupply
  mintedAt: number;
  ownerId: string | null;
  purchasePrice: number;
  currentValue: number;
  status: 'available' | 'owned' | 'burned' | 'reserved';
  blockchainHash: string;
}

export interface SWALPurchase {
  id: string;
  userId: string;
  tokenId: string;
  phase: SWALPhase;
  purchasePrice: number;
  purchasedAt: number;
  transactionHash: string;
}

export interface SWALNFT {
  id: string;
  userId: string;
  collection: NFTCollection;
  phase: SWALPhase;
  name: string;
  description: string;
  imageUrl: string;
  rarity: NFTRarity;
  attributes: {
    completionDate: number;
    completionLevel: number;
    realmStats: Record<string, number>;
    questsCompleted: number;
    timePlayed: number;
  };
  mintedAt: number;
  blockchainHash: string;
  tokenId: string; // The unlock token that generated this NFT
}

export interface SWALUnlock {
  id: string;
  userId: string;
  phase: SWALPhase;
  unlockedAt: number;
  tokenId: string;
  nftId: string;
  blockchainHash: string;
}

export interface SWALUserProgress {
  userId: string;
  currentPhase: SWALPhase;
  unlockedPhases: SWALPhase[];
  ownedTokens: SWALToken[];
  earnedNFTs: SWALNFT[];
  totalInvested: number;
  portfolioValue: number;
  membershipType: 'public' | 'academy' | 'employee';
}

// ============================================================================
// PHASE CONFIGURATIONS
// ============================================================================

export const SWAL_PHASES: Record<SWALPhase, SWALPhaseConfig> = {
  self: {
    phase: 'self',
    tier: 'genesis',
    order: 1,
    name: 'SELF',
    description: 'Know yourself first. The journey begins within.',
    totalSupply: 2_500,
    basePrice: 10,
    valueMultiplier: 1,
    nftCollection: 'the_awakening',
    collectionName: 'The Awakening',
    color: '#9333EA', // Purple
    icon: '🔮',
    unlockRequirements: {
      previousPhaseComplete: false,
      minLevel: 1,
    },
  },
  water: {
    phase: 'water',
    tier: 'flow',
    order: 2,
    name: 'WATER',
    description: 'Heal and find balance. Let emotions flow freely.',
    totalSupply: 2_000,
    basePrice: 25,
    valueMultiplier: 2,
    nftCollection: 'the_healing',
    collectionName: 'The Healing',
    color: '#0EA5E9', // Blue
    icon: '💧',
    unlockRequirements: {
      previousPhaseComplete: true,
      minLevel: 10,
      minRealmStat: 5,
    },
  },
  air: {
    phase: 'air',
    tier: 'ascend',
    order: 3,
    name: 'AIR',
    description: 'Gain knowledge and wisdom. Rise above limitations.',
    totalSupply: 1_500,
    basePrice: 50,
    valueMultiplier: 4,
    nftCollection: 'the_enlightenment',
    collectionName: 'The Enlightenment',
    color: '#F59E0B', // Amber
    icon: '🌬️',
    unlockRequirements: {
      previousPhaseComplete: true,
      minLevel: 25,
      minRealmStat: 10,
    },
  },
  land: {
    phase: 'land',
    tier: 'root',
    order: 4,
    name: 'LAND',
    description: 'Build stability and legacy. Root yourself in purpose.',
    totalSupply: 1_000,
    basePrice: 100,
    valueMultiplier: 8,
    nftCollection: 'the_foundation',
    collectionName: 'The Foundation',
    color: '#22C55E', // Green
    icon: '🌍',
    unlockRequirements: {
      previousPhaseComplete: true,
      minLevel: 50,
      minRealmStat: 20,
    },
  },
  sovereignty: {
    phase: 'sovereignty',
    tier: 'crown',
    order: 5,
    name: 'SOVEREIGNTY',
    description: 'Complete mastery. Claim your crown and legacy.',
    totalSupply: 500,
    basePrice: 250,
    valueMultiplier: 16,
    nftCollection: 'the_crown',
    collectionName: 'The Crown',
    color: '#EAB308', // Gold
    icon: '👑',
    unlockRequirements: {
      previousPhaseComplete: true,
      minLevel: 75,
      minRealmStat: 30,
    },
  },
};

// Phase order for progression
export const SWAL_PHASE_ORDER: SWALPhase[] = ['self', 'water', 'air', 'land', 'sovereignty'];

// ============================================================================
// NFT RARITY DISTRIBUTION
// ============================================================================

export const NFT_RARITY_DISTRIBUTION: Record<NFTRarity, { chance: number; bonusMultiplier: number }> = {
  common: { chance: 0.50, bonusMultiplier: 1.0 },
  uncommon: { chance: 0.30, bonusMultiplier: 1.25 },
  rare: { chance: 0.15, bonusMultiplier: 1.5 },
  epic: { chance: 0.04, bonusMultiplier: 2.0 },
  legendary: { chance: 0.01, bonusMultiplier: 3.0 },
};

// ============================================================================
// MEMBERSHIP BENEFITS
// ============================================================================

export interface MembershipBenefits {
  type: 'public' | 'academy' | 'employee';
  tokenDiscount: number; // Percentage off base price
  earnedTokensPerMonth: number;
  nftBonusChance: number; // Increased rarity chance
  exclusiveContent: boolean;
  priorityAccess: boolean;
}

export const MEMBERSHIP_BENEFITS: Record<string, MembershipBenefits> = {
  public: {
    type: 'public',
    tokenDiscount: 0,
    earnedTokensPerMonth: 0,
    nftBonusChance: 0,
    exclusiveContent: false,
    priorityAccess: false,
  },
  academy: {
    type: 'academy',
    tokenDiscount: 0.25, // 25% off
    earnedTokensPerMonth: 2, // Earn 2 tokens per month through progress
    nftBonusChance: 0.10, // 10% better rarity odds
    exclusiveContent: true,
    priorityAccess: true,
  },
  employee: {
    type: 'employee',
    tokenDiscount: 0.50, // 50% off
    earnedTokensPerMonth: 5, // Earn 5 tokens per month
    nftBonusChance: 0.20, // 20% better rarity odds
    exclusiveContent: true,
    priorityAccess: true,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate current token value based on remaining supply
 */
export function calculateTokenValue(phase: SWALPhase, remainingSupply: number): number {
  const config = SWAL_PHASES[phase];
  const totalSupply = config.totalSupply;
  const soldPercentage = (totalSupply - remainingSupply) / totalSupply;
  
  // Price increases as supply decreases
  // Formula: basePrice * (1 + soldPercentage * valueMultiplier)
  const appreciationFactor = 1 + (soldPercentage * config.valueMultiplier);
  return Math.round(config.basePrice * appreciationFactor * 100) / 100;
}

/**
 * Calculate price with membership discount
 */
export function calculateDiscountedPrice(
  basePrice: number,
  membershipType: 'public' | 'academy' | 'employee'
): number {
  const benefits = MEMBERSHIP_BENEFITS[membershipType];
  return Math.round(basePrice * (1 - benefits.tokenDiscount) * 100) / 100;
}

/**
 * Determine NFT rarity based on membership and random chance
 */
export function determineNFTRarity(membershipType: 'public' | 'academy' | 'employee'): NFTRarity {
  const benefits = MEMBERSHIP_BENEFITS[membershipType];
  const bonusChance = benefits.nftBonusChance;
  const roll = Math.random();
  
  let cumulative = 0;
  for (const [rarity, config] of Object.entries(NFT_RARITY_DISTRIBUTION)) {
    // Apply bonus chance to shift distribution toward rarer items
    const adjustedChance = rarity === 'common' 
      ? config.chance - bonusChance 
      : config.chance + (bonusChance / 4);
    
    cumulative += adjustedChance;
    if (roll <= cumulative) {
      return rarity as NFTRarity;
    }
  }
  
  return 'common';
}

/**
 * Generate blockchain hash for token/NFT
 */
export function generateBlockchainHash(data: Record<string, unknown>): string {
  const str = JSON.stringify(data) + Date.now() + Math.random();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}

/**
 * Check if user can unlock a phase
 */
export function canUnlockPhase(
  phase: SWALPhase,
  userProgress: SWALUserProgress,
  userLevel: number,
  realmStats: Record<string, number>
): { canUnlock: boolean; reason?: string } {
  const config = SWAL_PHASES[phase];
  
  // Check if already unlocked
  if (userProgress.unlockedPhases.includes(phase)) {
    return { canUnlock: false, reason: 'Phase already unlocked' };
  }
  
  // Check previous phase requirement
  if (config.unlockRequirements.previousPhaseComplete) {
    const prevPhaseIndex = SWAL_PHASE_ORDER.indexOf(phase) - 1;
    if (prevPhaseIndex >= 0) {
      const prevPhase = SWAL_PHASE_ORDER[prevPhaseIndex];
      if (!userProgress.unlockedPhases.includes(prevPhase)) {
        return { canUnlock: false, reason: `Must complete ${SWAL_PHASES[prevPhase].name} phase first` };
      }
    }
  }
  
  // Check level requirement
  if (config.unlockRequirements.minLevel && userLevel < config.unlockRequirements.minLevel) {
    return { canUnlock: false, reason: `Requires level ${config.unlockRequirements.minLevel}` };
  }
  
  // Check realm stat requirement
  if (config.unlockRequirements.minRealmStat) {
    const relevantStat = realmStats[phase] || 0;
    if (relevantStat < config.unlockRequirements.minRealmStat) {
      return { canUnlock: false, reason: `Requires ${config.name} stat of ${config.unlockRequirements.minRealmStat}` };
    }
  }
  
  return { canUnlock: true };
}

/**
 * Get next phase in progression
 */
export function getNextPhase(currentPhase: SWALPhase): SWALPhase | null {
  const currentIndex = SWAL_PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex >= SWAL_PHASE_ORDER.length - 1) {
    return null;
  }
  return SWAL_PHASE_ORDER[currentIndex + 1];
}

/**
 * Calculate total portfolio value
 */
export function calculatePortfolioValue(tokens: SWALToken[]): number {
  return tokens.reduce((sum, token) => sum + token.currentValue, 0);
}

/**
 * Get phase statistics
 */
export function getPhaseStats(phase: SWALPhase, soldCount: number): {
  totalSupply: number;
  sold: number;
  remaining: number;
  percentSold: number;
  currentPrice: number;
  totalRaised: number;
} {
  const config = SWAL_PHASES[phase];
  const remaining = config.totalSupply - soldCount;
  const currentPrice = calculateTokenValue(phase, remaining);
  
  // Estimate total raised (simplified - actual would track each sale)
  const avgPrice = (config.basePrice + currentPrice) / 2;
  const totalRaised = soldCount * avgPrice;
  
  return {
    totalSupply: config.totalSupply,
    sold: soldCount,
    remaining,
    percentSold: (soldCount / config.totalSupply) * 100,
    currentPrice,
    totalRaised,
  };
}

/**
 * Generate NFT metadata
 */
export function generateNFTMetadata(
  phase: SWALPhase,
  userId: string,
  completionData: {
    level: number;
    realmStats: Record<string, number>;
    questsCompleted: number;
    timePlayed: number;
  },
  rarity: NFTRarity
): Omit<SWALNFT, 'id' | 'mintedAt' | 'blockchainHash' | 'tokenId'> {
  const config = SWAL_PHASES[phase];
  
  const rarityNames: Record<NFTRarity, string> = {
    common: '',
    uncommon: 'Notable ',
    rare: 'Distinguished ',
    epic: 'Legendary ',
    legendary: 'Mythic ',
  };
  
  return {
    userId,
    collection: config.nftCollection,
    phase,
    name: `${rarityNames[rarity]}${config.collectionName} #${Date.now()}`,
    description: `Proof of completing the ${config.name} phase on the journey to Sovereignty. ${config.description}`,
    imageUrl: `/nft/${config.nftCollection}/${rarity}.png`, // Placeholder
    rarity,
    attributes: {
      completionDate: Date.now(),
      completionLevel: completionData.level,
      realmStats: completionData.realmStats,
      questsCompleted: completionData.questsCompleted,
      timePlayed: completionData.timePlayed,
    },
  };
}

// ============================================================================
// ROYALTY CONFIGURATION
// ============================================================================

export const ROYALTY_CONFIG = {
  secondaryMarketRoyalty: 0.075, // 7.5% on resales
  creatorShare: 0.70, // 70% to The L.A.W.S. Collective
  communityShare: 0.20, // 20% to community treasury
  platformShare: 0.10, // 10% to platform maintenance
};

/**
 * Calculate royalty distribution on secondary sale
 */
export function calculateRoyalties(salePrice: number): {
  totalRoyalty: number;
  creatorAmount: number;
  communityAmount: number;
  platformAmount: number;
} {
  const totalRoyalty = salePrice * ROYALTY_CONFIG.secondaryMarketRoyalty;
  return {
    totalRoyalty,
    creatorAmount: totalRoyalty * ROYALTY_CONFIG.creatorShare,
    communityAmount: totalRoyalty * ROYALTY_CONFIG.communityShare,
    platformAmount: totalRoyalty * ROYALTY_CONFIG.platformShare,
  };
}
