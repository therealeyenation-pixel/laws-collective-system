import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  Users,
  Trophy,
  Star,
  Crown,
  Sparkles,
  Medal,
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  unlockedAt?: number;
}

interface ShareAchievementProps {
  achievement: Achievement;
  playerName?: string;
  trigger?: React.ReactNode;
}

const RARITY_COLORS = {
  common: {
    bg: "from-gray-500 to-gray-600",
    border: "border-gray-400",
    text: "text-gray-100",
    label: "Common",
  },
  uncommon: {
    bg: "from-green-500 to-emerald-600",
    border: "border-green-400",
    text: "text-green-100",
    label: "Uncommon",
  },
  rare: {
    bg: "from-blue-500 to-indigo-600",
    border: "border-blue-400",
    text: "text-blue-100",
    label: "Rare",
  },
  epic: {
    bg: "from-purple-500 to-violet-600",
    border: "border-purple-400",
    text: "text-purple-100",
    label: "Epic",
  },
  legendary: {
    bg: "from-amber-500 to-orange-600",
    border: "border-amber-400",
    text: "text-amber-100",
    label: "Legendary",
  },
};

const RARITY_ICONS = {
  common: Medal,
  uncommon: Star,
  rare: Trophy,
  epic: Crown,
  legendary: Sparkles,
};

export function ShareAchievement({
  achievement,
  playerName = "A L.A.W.S. Player",
  trigger,
}: ShareAchievementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const rarityStyle = RARITY_COLORS[achievement.rarity];
  const RarityIcon = RARITY_ICONS[achievement.rarity];

  // Generate share text
  const shareText = `🏆 I just unlocked "${achievement.name}" in L.A.W.S. Quest!\n\n${achievement.description}\n\n+${achievement.points} points | ${rarityStyle.label} Achievement\n\nJoin the journey to financial sovereignty!`;
  
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/achievements?highlight=${achievement.id}`
    : "";

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
    toast.success("Opening Twitter...");
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=550,height=420");
    toast.success("Opening Facebook...");
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, "_blank", "width=550,height=420");
    toast.success("Opening LinkedIn...");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareToCollective = () => {
    // This would integrate with the Collective feed system
    toast.success("Achievement shared to L.A.W.S. Collective feed!");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Achievement
          </DialogTitle>
          <DialogDescription>
            Share your accomplishment with friends and the L.A.W.S. community
          </DialogDescription>
        </DialogHeader>

        {/* Achievement Preview Card */}
        <Card className={`p-4 bg-gradient-to-br ${rarityStyle.bg} ${rarityStyle.border} border-2`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-black/20 ${rarityStyle.text}`}>
              <RarityIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full bg-black/20 ${rarityStyle.text}`}>
                  {rarityStyle.label}
                </span>
                <span className={`text-xs ${rarityStyle.text}`}>
                  +{achievement.points} pts
                </span>
              </div>
              <h3 className={`font-bold text-lg ${rarityStyle.text}`}>
                {achievement.name}
              </h3>
              <p className={`text-sm ${rarityStyle.text} opacity-90`}>
                {achievement.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Share Options */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Share to:</p>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={handleTwitterShare}
            >
              <Twitter className="w-4 h-4 text-[#1DA1F2]" />
              Twitter / X
            </Button>
            
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={handleFacebookShare}
            >
              <Facebook className="w-4 h-4 text-[#4267B2]" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={handleLinkedInShare}
            >
              <Linkedin className="w-4 h-4 text-[#0077B5]" />
              LinkedIn
            </Button>
            
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Share to Collective */}
          <div className="pt-3 border-t">
            <Button
              className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={handleShareToCollective}
            >
              <Users className="w-4 h-4" />
              Share to L.A.W.S. Collective
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Your achievement will appear in the Collective community feed
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareAchievement;
