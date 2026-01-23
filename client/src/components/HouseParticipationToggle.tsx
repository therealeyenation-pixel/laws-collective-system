import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  Lock,
  Unlock,
  Shield,
  Users,
  TrendingUp,
  Coins,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface HouseParticipationToggleProps {
  businessId: number;
  businessName: string;
  currentStatus: "pending" | "opted_in" | "opted_out";
  linkedHouseId?: number;
  onStatusChange?: (newStatus: "opted_in" | "opted_out", reason?: string) => void;
}

export function HouseParticipationToggle({
  businessId,
  businessName,
  currentStatus,
  linkedHouseId,
  onStatusChange,
}: HouseParticipationToggleProps) {
  const [showOptInDialog, setShowOptInDialog] = useState(false);
  const [showOptOutDialog, setShowOptOutDialog] = useState(false);
  const [optOutReason, setOptOutReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isOptedIn = currentStatus === "opted_in";
  const isPending = currentStatus === "pending";

  const handleOptIn = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call - replace with actual tRPC mutation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onStatusChange?.("opted_in");
      toast.success("Welcome to the House System!", {
        description: `${businessName} is now a Locked House in the LuvOnPurpose Autonomous Wealth System.`,
      });
      setShowOptInDialog(false);
    } catch (error) {
      toast.error("Failed to activate House participation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptOut = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call - replace with actual tRPC mutation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onStatusChange?.("opted_out", optOutReason);
      toast.info("Operating Independently", {
        description: `${businessName} is now an Unlocked House. You can opt-in at any time.`,
      });
      setShowOptOutDialog(false);
      setOptOutReason("");
    } catch (error) {
      toast.error("Failed to update participation status");
    } finally {
      setIsProcessing(false);
    }
  };

  const houseFeatures = [
    {
      icon: Shield,
      title: "Trust Governance",
      description: "Protected under The 508 Trust structure",
    },
    {
      icon: Coins,
      title: "60/40 Distribution",
      description: "Participate in collective wealth building",
    },
    {
      icon: Users,
      title: "Heir Designations",
      description: "Set up generational wealth transfers",
    },
    {
      icon: TrendingUp,
      title: "Token Economy",
      description: "Access MIRROR, GIFT, SPARK, HOUSE tokens",
    },
    {
      icon: FileText,
      title: "House Ledger",
      description: "Dedicated LuvLedger for your House",
    },
  ];

  return (
    <>
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOptedIn ? (
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-muted">
                  <Unlock className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">House Participation</CardTitle>
                <CardDescription>
                  LuvOnPurpose Autonomous Wealth System
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={isOptedIn ? "default" : isPending ? "secondary" : "outline"}
              className={isOptedIn ? "bg-primary" : ""}
            >
              {isOptedIn ? (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Locked House
                </>
              ) : isPending ? (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Decision
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 mr-1" />
                  Unlocked House
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Description */}
          <div className="p-3 rounded-lg bg-background/50 border">
            {isOptedIn ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    Full House Management Active
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your business is a Locked House under The 508 Trust governance.
                    You have access to all House management features, distributions,
                    and generational wealth tools.
                  </p>
                </div>
              </div>
            ) : isPending ? (
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    Choose Your Path
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your business is recorded on LuvLedger. Decide whether to become
                    a Locked House (full features) or Unlocked House (independent operation).
                    You can always opt-in later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Unlock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">
                    Operating Independently
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your business is recorded on LuvLedger for analytics and records,
                    but operates independently without House management features.
                    You can opt-in at any time to unlock full House capabilities.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* LuvLedger Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Recorded on LuvLedger Blockchain
              </span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-300">
              Always Active
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isPending || !isOptedIn ? (
              <Button
                className="flex-1 gap-2"
                onClick={() => setShowOptInDialog(true)}
              >
                <Lock className="w-4 h-4" />
                Become a Locked House
              </Button>
            ) : null}
            {isPending ? (
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setShowOptOutDialog(true)}
              >
                <Unlock className="w-4 h-4" />
                Stay Independent
              </Button>
            ) : null}
            {isOptedIn && (
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <a href={`/house/${linkedHouseId}`}>
                  <Home className="w-4 h-4" />
                  View House Dashboard
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opt-In Dialog */}
      <Dialog open={showOptInDialog} onOpenChange={setShowOptInDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Become a Locked House
            </DialogTitle>
            <DialogDescription>
              Join the LuvOnPurpose Autonomous Wealth System and unlock full House
              management capabilities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By opting in, <strong>{businessName}</strong> will become a Locked House
              under The 508 Trust governance. You'll gain access to:
            </p>

            <div className="grid gap-3">
              {houseFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Note:</strong> As a Locked House, your business revenue does
                not automatically flow into the House system. You participate through
                platform usage fees and receive distributions from the collective pool.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptInDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleOptIn} disabled={isProcessing} className="gap-2">
              {isProcessing ? (
                "Activating..."
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Activate House
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opt-Out Dialog */}
      <Dialog open={showOptOutDialog} onOpenChange={setShowOptOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5" />
              Operate Independently
            </DialogTitle>
            <DialogDescription>
              Your business will be recorded on LuvLedger but won't have access to
              House management features.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>{businessName}</strong> will operate as an Unlocked House:
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Still recorded on LuvLedger blockchain
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Access to analytics and record management
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Can opt-in at any time later
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                No House governance features
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                No distribution participation
              </li>
            </ul>

            <div>
              <label className="text-sm font-medium">
                Reason for staying independent (optional)
              </label>
              <Textarea
                placeholder="Share your reason..."
                value={optOutReason}
                onChange={(e) => setOptOutReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptOutDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleOptOut}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Stay Independent
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default HouseParticipationToggle;
