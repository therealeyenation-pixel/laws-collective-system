import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Gift,
  Shield,
  Heart,
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

const GIFT_TYPE_CONFIG = {
  mirror: {
    icon: Heart,
    label: "Mirror Gift",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    description: "A bloodline gift — connecting you to your family's legacy within the Collective.",
  },
  adaptive: {
    icon: Shield,
    label: "Adaptive Gift",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "A trusted gift — extending the Collective's reach to valued community members.",
  },
  locked: {
    icon: Lock,
    label: "Locked Gift",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "A time-delayed gift — designed to unlock at the right moment in your journey.",
  },
};

const STATUS_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  pending: { icon: Clock, label: "Awaiting Activation", color: "text-amber-400" },
  awaiting_activation: { icon: Clock, label: "Ready to Claim", color: "text-green-400" },
  activated: { icon: CheckCircle2, label: "Activated", color: "text-green-400" },
  claimed: { icon: CheckCircle2, label: "Claimed", color: "text-green-400" },
  expired: { icon: XCircle, label: "Expired", color: "text-gray-400" },
  revoked: { icon: XCircle, label: "Revoked", color: "text-red-400" },
};

export default function RedeemGift() {
  const [, params] = useRoute("/redeem/:code");
  const code = params?.code || "";
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { data, isLoading, error } = trpc.giftingSystem.getGiftByCode.useQuery(
    { code },
    { enabled: !!code }
  );

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading gift details...</p>
        </div>
      </div>
    );
  }

  if (!data?.found || !data.gift) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full p-10 bg-[#1a1a2e]/80 border-gray-700 text-center">
          <XCircle className="w-16 h-16 text-gray-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Gift Not Found</h2>
          <p className="text-gray-400 mb-6">
            This redemption code is invalid or has expired. Please check the code and try again,
            or contact the person who sent you this gift.
          </p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="border-gray-600 text-gray-300"
          >
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  const gift = data.gift;
  const giftType = gift.giftType as keyof typeof GIFT_TYPE_CONFIG;
  const config = GIFT_TYPE_CONFIG[giftType] || GIFT_TYPE_CONFIG.adaptive;
  const status = STATUS_CONFIG[gift.giftStatus] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const GiftIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        {/* Gift Card */}
        <Card className={`p-8 bg-[#1a1a2e]/80 ${config.borderColor} text-center`}>
          <div className={`w-20 h-20 rounded-full ${config.bgColor} ${config.borderColor} border flex items-center justify-center mx-auto mb-6`}>
            <GiftIcon className={`w-10 h-10 ${config.color}`} />
          </div>

          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">L.A.W.S. Collective Gift</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">{config.label}</h1>
          <p className="text-gray-400 mb-6">{config.description}</p>

          {/* Gift Message */}
          {gift.giftMessage && (
            <div className="bg-[#0a0a1a]/50 border border-gray-700/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Personal Message</p>
              <p className="text-gray-300 italic">"{gift.giftMessage}"</p>
            </div>
          )}

          {/* Gift Details */}
          {gift.giftDescription && (
            <div className="bg-[#0a0a1a]/50 border border-gray-700/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Gift Details</p>
              <p className="text-gray-300 text-sm">{gift.giftDescription}</p>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </div>

          {/* Recipient Name */}
          {gift.targetName && (
            <p className="text-gray-400 text-sm mb-6">
              Prepared for <span className="text-white font-medium">{gift.targetName}</span>
            </p>
          )}

          {/* Action Buttons */}
          {gift.isClaimable && (
            <div className="space-y-3">
              {isAuthenticated ? (
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg">
                  Claim This Gift <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => (window.location.href = getLoginUrl())}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg"
                  >
                    Sign In to Claim <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-gray-500 text-xs">
                    You need a L.A.W.S. Collective account to claim this gift.
                    Don't have one? Signing in will create your account automatically.
                  </p>
                </>
              )}
            </div>
          )}

          {!gift.isClaimable && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">
                {gift.giftStatus === "claimed" || gift.giftStatus === "activated"
                  ? "This gift has already been claimed."
                  : gift.giftStatus === "expired"
                  ? "This gift has expired and is no longer available."
                  : gift.giftStatus === "revoked"
                  ? "This gift has been revoked by the sender."
                  : "This gift is not currently available for claiming."}
              </p>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-[#1a1a2e]/60 border-gray-700/50">
          <h3 className="text-white font-semibold mb-3">What is the L.A.W.S. Collective?</h3>
          <p className="text-gray-400 text-sm mb-4">
            The L.A.W.S. Collective is a multi-generational system designed to help families
            build real wealth, gain real education, and create real legacy. This gift is an
            invitation to join our community.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { letter: "L", word: "Land" },
              { letter: "A", word: "Air" },
              { letter: "W", word: "Water" },
              { letter: "S", word: "Self" },
            ].map((item) => (
              <div key={item.letter} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-400">{item.letter}</span>
                </div>
                <span className="text-gray-300 text-sm">{item.word}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs">
          L.A.W.S. Collective, LLC | Redemption Code: {code}
        </p>
      </div>
    </div>
  );
}
