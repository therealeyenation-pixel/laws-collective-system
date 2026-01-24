import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  Scroll, 
  Zap, 
  Shield, 
  Star, 
  Sparkles,
  Package,
  Crown,
  Heart,
  Mountain,
  Wind,
  Droplets,
  Gem,
  Lock,
  Check
} from "lucide-react";
import { toast } from "sonner";

// Shop item types
interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: "consumables" | "equipment" | "scrolls" | "cosmetics" | "upgrades";
  price: number;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  effect?: {
    type: "energy" | "xp_boost" | "token_boost" | "stat_boost" | "cosmetic";
    value: number;
    duration?: number; // in minutes, 0 = permanent
    stat?: "land" | "air" | "water" | "self";
  };
  requirements?: {
    level?: number;
    stat?: { name: "land" | "air" | "water" | "self"; value: number };
  };
  stock?: number; // undefined = unlimited
  purchased?: boolean; // for one-time purchases
}

// Shop inventory
const SHOP_ITEMS: ShopItem[] = [
  // Consumables
  {
    id: "energy-potion-small",
    name: "Minor Energy Elixir",
    description: "Restore 25 energy instantly",
    category: "consumables",
    price: 15,
    icon: "⚡",
    rarity: "common",
    effect: { type: "energy", value: 25 }
  },
  {
    id: "energy-potion-medium",
    name: "Energy Elixir",
    description: "Restore 50 energy instantly",
    category: "consumables",
    price: 25,
    icon: "🔋",
    rarity: "uncommon",
    effect: { type: "energy", value: 50 }
  },
  {
    id: "energy-potion-large",
    name: "Greater Energy Elixir",
    description: "Fully restore your energy",
    category: "consumables",
    price: 50,
    icon: "💫",
    rarity: "rare",
    effect: { type: "energy", value: 100 }
  },
  {
    id: "xp-boost-30",
    name: "Scholar's Blessing",
    description: "+50% XP for 30 minutes",
    category: "consumables",
    price: 40,
    icon: "📚",
    rarity: "uncommon",
    effect: { type: "xp_boost", value: 50, duration: 30 }
  },
  {
    id: "token-boost-30",
    name: "Fortune's Favor",
    description: "+25% tokens for 30 minutes",
    category: "consumables",
    price: 35,
    icon: "🍀",
    rarity: "uncommon",
    effect: { type: "token_boost", value: 25, duration: 30 }
  },

  // Scrolls (permanent stat boosts)
  {
    id: "scroll-land-1",
    name: "Scroll of Earth Wisdom",
    description: "Permanently increase LAND by 1",
    category: "scrolls",
    price: 100,
    icon: "📜",
    rarity: "rare",
    effect: { type: "stat_boost", value: 1, stat: "land", duration: 0 }
  },
  {
    id: "scroll-air-1",
    name: "Scroll of Wind Knowledge",
    description: "Permanently increase AIR by 1",
    category: "scrolls",
    price: 100,
    icon: "📜",
    rarity: "rare",
    effect: { type: "stat_boost", value: 1, stat: "air", duration: 0 }
  },
  {
    id: "scroll-water-1",
    name: "Scroll of Ocean Calm",
    description: "Permanently increase WATER by 1",
    category: "scrolls",
    price: 100,
    icon: "📜",
    rarity: "rare",
    effect: { type: "stat_boost", value: 1, stat: "water", duration: 0 }
  },
  {
    id: "scroll-self-1",
    name: "Scroll of Inner Fire",
    description: "Permanently increase SELF by 1",
    category: "scrolls",
    price: 100,
    icon: "📜",
    rarity: "rare",
    effect: { type: "stat_boost", value: 1, stat: "self", duration: 0 }
  },

  // Equipment (permanent upgrades)
  {
    id: "amulet-energy",
    name: "Amulet of Vitality",
    description: "Increase max energy by 25",
    category: "equipment",
    price: 200,
    icon: "🔮",
    rarity: "epic",
    effect: { type: "energy", value: 25, duration: 0 },
    purchased: false
  },
  {
    id: "ring-wisdom",
    name: "Ring of Wisdom",
    description: "Permanently gain +10% XP from all sources",
    category: "equipment",
    price: 300,
    icon: "💍",
    rarity: "epic",
    effect: { type: "xp_boost", value: 10, duration: 0 },
    requirements: { level: 10 },
    purchased: false
  },
  {
    id: "crown-sovereign",
    name: "Sovereign's Crown",
    description: "Mark of true sovereignty. +2 to all stats",
    category: "equipment",
    price: 1000,
    icon: "👑",
    rarity: "legendary",
    effect: { type: "stat_boost", value: 2, duration: 0 },
    requirements: { level: 25 },
    purchased: false
  },

  // Cosmetics
  {
    id: "title-pioneer",
    name: "Title: Pioneer",
    description: "Display 'Pioneer' as your title",
    category: "cosmetics",
    price: 50,
    icon: "🏷️",
    rarity: "uncommon",
    effect: { type: "cosmetic", value: 0 },
    purchased: false
  },
  {
    id: "title-guardian",
    name: "Title: Guardian",
    description: "Display 'Guardian' as your title",
    category: "cosmetics",
    price: 75,
    icon: "🏷️",
    rarity: "rare",
    effect: { type: "cosmetic", value: 0 },
    requirements: { level: 15 },
    purchased: false
  },
  {
    id: "title-sage",
    name: "Title: Sage",
    description: "Display 'Sage' as your title",
    category: "cosmetics",
    price: 150,
    icon: "🏷️",
    rarity: "epic",
    effect: { type: "cosmetic", value: 0 },
    requirements: { level: 30 },
    purchased: false
  },

  // Upgrades
  {
    id: "inventory-expansion",
    name: "Inventory Expansion",
    description: "Increase inventory slots by 10",
    category: "upgrades",
    price: 150,
    icon: "🎒",
    rarity: "rare",
    effect: { type: "cosmetic", value: 10 },
    purchased: false
  },
  {
    id: "energy-regen-boost",
    name: "Energy Regeneration Boost",
    description: "Regenerate energy 50% faster",
    category: "upgrades",
    price: 250,
    icon: "⚡",
    rarity: "epic",
    effect: { type: "energy", value: 50, duration: 0 },
    purchased: false
  }
];

interface TokenShopProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokens: number;
  level: number;
  stats: { land: number; air: number; water: number; self: number };
  onPurchase: (item: ShopItem) => void;
  purchasedItems: string[];
}

const RARITY_COLORS = {
  common: "bg-gray-100 text-gray-800 border-gray-300",
  uncommon: "bg-green-100 text-green-800 border-green-300",
  rare: "bg-blue-100 text-blue-800 border-blue-300",
  epic: "bg-purple-100 text-purple-800 border-purple-300",
  legendary: "bg-amber-100 text-amber-800 border-amber-300"
};

const CATEGORY_ICONS = {
  consumables: Zap,
  equipment: Shield,
  scrolls: Scroll,
  cosmetics: Sparkles,
  upgrades: Star
};

export default function TokenShop({ 
  open, 
  onOpenChange, 
  tokens, 
  level, 
  stats,
  onPurchase,
  purchasedItems 
}: TokenShopProps) {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [confirmPurchase, setConfirmPurchase] = useState(false);

  const canAfford = (item: ShopItem) => tokens >= item.price;
  
  const meetsRequirements = (item: ShopItem) => {
    if (!item.requirements) return true;
    if (item.requirements.level && level < item.requirements.level) return false;
    if (item.requirements.stat) {
      const statValue = stats[item.requirements.stat.name];
      if (statValue < item.requirements.stat.value) return false;
    }
    return true;
  };

  const isPurchased = (item: ShopItem) => {
    return purchasedItems.includes(item.id);
  };

  const handlePurchase = () => {
    if (!selectedItem) return;
    if (!canAfford(selectedItem)) {
      toast.error("Not enough tokens!");
      return;
    }
    if (!meetsRequirements(selectedItem)) {
      toast.error("Requirements not met!");
      return;
    }
    if (isPurchased(selectedItem) && selectedItem.category !== "consumables") {
      toast.error("Already purchased!");
      return;
    }

    onPurchase(selectedItem);
    setConfirmPurchase(false);
    setSelectedItem(null);
    toast.success(`Purchased ${selectedItem.name}!`);
  };

  const renderItemCard = (item: ShopItem) => {
    const affordable = canAfford(item);
    const meetsReqs = meetsRequirements(item);
    const alreadyPurchased = isPurchased(item) && item.category !== "consumables";
    const available = affordable && meetsReqs && !alreadyPurchased;

    return (
      <Card 
        key={item.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          !available ? "opacity-60" : ""
        } ${selectedItem?.id === item.id ? "ring-2 ring-primary" : ""}`}
        onClick={() => setSelectedItem(item)}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                {alreadyPurchased && (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={RARITY_COLORS[item.rarity]} variant="outline">
                  {item.rarity}
                </Badge>
                <Badge variant="outline" className={affordable ? "text-amber-600" : "text-red-600"}>
                  <Coins className="w-3 h-3 mr-1" />
                  {item.price}
                </Badge>
              </div>
              {item.requirements && !meetsReqs && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                  <Lock className="w-3 h-3" />
                  {item.requirements.level && `Level ${item.requirements.level} required`}
                  {item.requirements.stat && `${item.requirements.stat.name.toUpperCase()} ${item.requirements.stat.value} required`}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const categories = ["consumables", "scrolls", "equipment", "cosmetics", "upgrades"] as const;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Token Shop
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <span>Spend your hard-earned tokens on powerful items</span>
              <Badge variant="outline" className="text-amber-600">
                <Coins className="w-3 h-3 mr-1" />
                {tokens} Tokens
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="consumables" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-5 w-full">
              {categories.map(cat => {
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <TabsTrigger key={cat} value={cat} className="gap-1 text-xs">
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline capitalize">{cat}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="flex-1 overflow-y-auto mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SHOP_ITEMS.filter(item => item.category === category).map(renderItemCard)}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {selectedItem && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedItem.icon}</span>
                  <div>
                    <h4 className="font-semibold">{selectedItem.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setConfirmPurchase(true)}
                  disabled={!canAfford(selectedItem) || !meetsRequirements(selectedItem) || (isPurchased(selectedItem) && selectedItem.category !== "consumables")}
                >
                  <Coins className="w-4 h-4 mr-1" />
                  Buy for {selectedItem.price}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Purchase Confirmation */}
      <Dialog open={confirmPurchase} onOpenChange={setConfirmPurchase}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase {selectedItem?.name} for {selectedItem?.price} tokens?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <span className="text-5xl">{selectedItem?.icon}</span>
              <p className="font-semibold mt-2">{selectedItem?.name}</p>
              <Badge className={selectedItem ? RARITY_COLORS[selectedItem.rarity] : ""} variant="outline">
                {selectedItem?.rarity}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm bg-secondary/30 p-3 rounded-lg">
            <span>Current Balance:</span>
            <span className="font-bold">{tokens} tokens</span>
          </div>
          <div className="flex items-center justify-between text-sm bg-secondary/30 p-3 rounded-lg">
            <span>After Purchase:</span>
            <span className="font-bold">{tokens - (selectedItem?.price || 0)} tokens</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPurchase(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase}>
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { SHOP_ITEMS, type ShopItem };
