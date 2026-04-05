/**
 * S.W.A.L. Journey Component
 * Visual representation of the journey to Sovereignty
 * Self → Water → Air → Land → Sovereignty
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Heart,
  Droplets,
  Wind,
  Mountain,
  Crown,
  Lock,
  Unlock,
  Sparkles,
  ChevronRight,
  Coins,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';

// S.W.A.L. Phase definitions
interface SWALPhase {
  id: 'self' | 'water' | 'air' | 'land' | 'sovereignty';
  name: string;
  tier: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  nftCollection: string;
  totalSupply: number;
  basePrice: number;
  valueMultiplier: number;
  requirements: string[];
}

const SWAL_PHASES: SWALPhase[] = [
  {
    id: 'self',
    name: 'SELF',
    tier: 'Genesis',
    description: 'Know yourself first. The awakening of inner truth and purpose.',
    icon: <Heart className="w-6 h-6" />,
    color: '#9333EA',
    bgGradient: 'from-purple-600 to-purple-900',
    nftCollection: 'The Awakening',
    totalSupply: 2500,
    basePrice: 10,
    valueMultiplier: 1,
    requirements: ['Complete character creation', 'Finish first SELF quest'],
  },
  {
    id: 'water',
    name: 'WATER',
    tier: 'Flow',
    description: 'Heal and find balance. The cleansing of emotional wounds.',
    icon: <Droplets className="w-6 h-6" />,
    color: '#0EA5E9',
    bgGradient: 'from-sky-500 to-sky-800',
    nftCollection: 'The Healing',
    totalSupply: 2000,
    basePrice: 25,
    valueMultiplier: 2,
    requirements: ['Complete SELF phase', 'Reach Level 10', 'Finish 5 WATER quests'],
  },
  {
    id: 'air',
    name: 'AIR',
    tier: 'Ascend',
    description: 'Gain wisdom and knowledge. The breath of understanding.',
    icon: <Wind className="w-6 h-6" />,
    color: '#F59E0B',
    bgGradient: 'from-amber-500 to-amber-800',
    nftCollection: 'The Enlightenment',
    totalSupply: 1500,
    basePrice: 50,
    valueMultiplier: 4,
    requirements: ['Complete WATER phase', 'Reach Level 25', 'Master 3 knowledge areas'],
  },
  {
    id: 'land',
    name: 'LAND',
    tier: 'Root',
    description: 'Build stability and legacy. The foundation of generations.',
    icon: <Mountain className="w-6 h-6" />,
    color: '#22C55E',
    bgGradient: 'from-green-500 to-green-800',
    nftCollection: 'The Foundation',
    totalSupply: 1000,
    basePrice: 100,
    valueMultiplier: 8,
    requirements: ['Complete AIR phase', 'Reach Level 50', 'Establish your House'],
  },
  {
    id: 'sovereignty',
    name: 'SOVEREIGNTY',
    tier: 'Crown',
    description: 'Complete mastery. The ultimate achievement of self-determination.',
    icon: <Crown className="w-6 h-6" />,
    color: '#EAB308',
    bgGradient: 'from-yellow-500 to-yellow-700',
    nftCollection: 'The Crown',
    totalSupply: 500,
    basePrice: 250,
    valueMultiplier: 16,
    requirements: ['Complete all four realms', 'Reach Level 100', 'Achieve House Dynasty status'],
  },
];

interface SWALJourneyProps {
  userProgress: {
    currentPhase: 'self' | 'water' | 'air' | 'land' | 'sovereignty';
    tokensOwned: number;
    nftsOwned: number;
    selfCompleted: boolean;
    waterCompleted: boolean;
    airCompleted: boolean;
    landCompleted: boolean;
    sovereigntyAchieved: boolean;
    totalInvested: number;
    portfolioValue: number;
  };
  membershipType: 'public' | 'academy' | 'employee';
  onPurchaseToken?: (phase: string) => void;
  onUnlockPhase?: (phase: string) => void;
}

export function SWALJourney({
  userProgress,
  membershipType,
  onPurchaseToken,
  onUnlockPhase,
}: SWALJourneyProps) {
  const [selectedPhase, setSelectedPhase] = useState<SWALPhase | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const getPhaseStatus = (phase: SWALPhase) => {
    const phaseIndex = SWAL_PHASES.findIndex(p => p.id === phase.id);
    const currentIndex = SWAL_PHASES.findIndex(p => p.id === userProgress.currentPhase);
    
    if (phase.id === 'self' && userProgress.selfCompleted) return 'completed';
    if (phase.id === 'water' && userProgress.waterCompleted) return 'completed';
    if (phase.id === 'air' && userProgress.airCompleted) return 'completed';
    if (phase.id === 'land' && userProgress.landCompleted) return 'completed';
    if (phase.id === 'sovereignty' && userProgress.sovereigntyAchieved) return 'completed';
    
    if (phaseIndex === currentIndex) return 'current';
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex + 1) return 'available';
    return 'locked';
  };

  const getDiscountedPrice = (basePrice: number) => {
    if (membershipType === 'employee') return basePrice * 0.5; // 50% off
    if (membershipType === 'academy') return basePrice * 0.75; // 25% off
    return basePrice;
  };

  const handlePhaseClick = (phase: SWALPhase) => {
    setSelectedPhase(phase);
    setShowPurchaseDialog(true);
  };

  const handlePurchase = () => {
    if (selectedPhase && onPurchaseToken) {
      onPurchaseToken(selectedPhase.id);
      toast.success(`Purchased ${selectedPhase.tier} Token!`, {
        description: `You now own a ${selectedPhase.nftCollection} unlock token.`,
      });
      setShowPurchaseDialog(false);
    }
  };

  const handleUnlock = () => {
    if (selectedPhase && onUnlockPhase) {
      onUnlockPhase(selectedPhase.id);
      toast.success(`${selectedPhase.name} Realm Unlocked!`, {
        description: `Your ${selectedPhase.nftCollection} NFT has been minted.`,
      });
      setShowPurchaseDialog(false);
    }
  };

  const completedPhases = [
    userProgress.selfCompleted,
    userProgress.waterCompleted,
    userProgress.airCompleted,
    userProgress.landCompleted,
    userProgress.sovereigntyAchieved,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-xs font-medium">Tokens Owned</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{userProgress.tokensOwned}</p>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">NFTs Owned</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{userProgress.nftsOwned}</p>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-medium">Journey Progress</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{completedPhases}/5</p>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-sky-500/10 to-sky-600/5">
          <div className="flex items-center gap-2 text-sky-400 mb-1">
            <Crown className="w-4 h-4" />
            <span className="text-xs font-medium">Portfolio Value</span>
          </div>
          <p className="text-2xl font-bold text-foreground">${userProgress.portfolioValue.toFixed(2)}</p>
        </Card>
      </div>

      {/* Journey Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">Journey to Sovereignty</h3>
          <Badge variant={userProgress.sovereigntyAchieved ? 'default' : 'secondary'}>
            {userProgress.sovereigntyAchieved ? 'Sovereign' : `Phase ${completedPhases + 1} of 5`}
          </Badge>
        </div>
        <Progress value={(completedPhases / 5) * 100} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          {membershipType === 'employee' && '🏢 Employee Benefit: 50% off all tokens'}
          {membershipType === 'academy' && '🎓 Academy Member: 25% off all tokens'}
          {membershipType === 'public' && '🌍 Public: Full price tokens'}
        </p>
      </Card>

      {/* Phase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {SWAL_PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase);
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          
          return (
            <Card
              key={phase.id}
              className={`relative overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                isLocked ? 'opacity-50' : ''
              } ${isCurrent ? 'ring-2 ring-primary' : ''}`}
              onClick={() => !isLocked && handlePhaseClick(phase)}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${phase.bgGradient} opacity-20`} />
              
              {/* Connector line */}
              {index < SWAL_PHASES.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <ChevronRight className={`w-6 h-6 ${isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                </div>
              )}
              
              <div className="relative p-4 text-center">
                {/* Status icon */}
                <div className="absolute top-2 right-2">
                  {isCompleted && <Unlock className="w-4 h-4 text-green-500" />}
                  {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  {isCurrent && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
                </div>
                
                {/* Phase icon */}
                <div
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                >
                  {phase.icon}
                </div>
                
                {/* Phase info */}
                <h4 className="font-bold text-foreground">{phase.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{phase.tier}</p>
                
                {/* Price */}
                <div className="text-sm">
                  {membershipType !== 'public' && (
                    <span className="line-through text-muted-foreground mr-1">
                      ${phase.basePrice}
                    </span>
                  )}
                  <span className="font-bold" style={{ color: phase.color }}>
                    ${getDiscountedPrice(phase.basePrice).toFixed(0)}
                  </span>
                </div>
                
                {/* Supply */}
                <p className="text-xs text-muted-foreground mt-1">
                  {phase.totalSupply.toLocaleString()} tokens
                </p>
                
                {/* Value multiplier */}
                <Badge variant="outline" className="mt-2 text-xs">
                  {phase.valueMultiplier}x Value
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Purchase/Unlock Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-md">
          {selectedPhase && (
            <>
              <DialogHeader>
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${selectedPhase.color}20`, color: selectedPhase.color }}
                >
                  {selectedPhase.icon}
                </div>
                <DialogTitle className="text-center">
                  {selectedPhase.name} - {selectedPhase.tier} Token
                </DialogTitle>
                <DialogDescription className="text-center">
                  {selectedPhase.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* NFT Collection */}
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">NFT Collection</p>
                  <p className="text-lg font-bold" style={{ color: selectedPhase.color }}>
                    {selectedPhase.nftCollection}
                  </p>
                </div>
                
                {/* Requirements */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Requirements</p>
                  <ul className="space-y-1">
                    {selectedPhase.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Pricing */}
                <div className="bg-secondary/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Base Price</span>
                    <span className="text-sm line-through text-muted-foreground">
                      ${selectedPhase.basePrice}
                    </span>
                  </div>
                  {membershipType !== 'public' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {membershipType === 'employee' ? 'Employee Discount' : 'Academy Discount'}
                      </span>
                      <span className="text-sm text-green-500">
                        -{membershipType === 'employee' ? '50%' : '25%'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                    <span className="font-medium text-foreground">Your Price</span>
                    <span className="text-xl font-bold" style={{ color: selectedPhase.color }}>
                      ${getDiscountedPrice(selectedPhase.basePrice).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {/* Value proposition */}
                <div className="text-center text-sm text-muted-foreground">
                  <p>Token value increases as supply decreases.</p>
                  <p className="font-medium" style={{ color: selectedPhase.color }}>
                    Current multiplier: {selectedPhase.valueMultiplier}x
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPurchaseDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  style={{ backgroundColor: selectedPhase.color }}
                  onClick={handlePurchase}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Purchase Token
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SWALJourney;
