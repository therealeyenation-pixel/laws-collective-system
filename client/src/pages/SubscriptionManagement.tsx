import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: currentSubscription, isLoading: isLoadingSubscription } =
    trpc.stripeSubscriptions.getSubscription.useQuery();

  const { data: plans } = trpc.stripeSubscriptions.getSubscriptionPlans.useQuery();

  const createCheckoutMutation =
    trpc.stripeSubscriptions.createCheckoutSession.useMutation({
      onSuccess: (data) => {
        if (data.url) {
          window.open(data.url, "_blank");
          toast.success("Redirecting to checkout...");
        }
      },
      onError: (error) => {
        toast.error("Failed to create checkout session");
        console.error(error);
      },
    });

  const cancelSubscriptionMutation =
    trpc.stripeSubscriptions.cancelSubscription.useMutation({
      onSuccess: () => {
        toast.success("Subscription cancelled");
      },
      onError: (error) => {
        toast.error("Failed to cancel subscription");
        console.error(error);
      },
    });

  const handleSelectPlan = async (planId: string) => {
    setIsLoading(true);
    setSelectedPlan(planId);

    // Map plan ID to Stripe price ID (you'll need to set these in your Stripe dashboard)
    const priceMap: Record<string, string> = {
      verified_18: process.env.VITE_STRIPE_PRICE_18 || "price_18",
      verified_21: process.env.VITE_STRIPE_PRICE_21 || "price_21",
      premium: process.env.VITE_STRIPE_PRICE_PREMIUM || "price_premium",
    };

    createCheckoutMutation.mutate({
      priceId: priceMap[planId],
      tier: planId as "verified_18" | "verified_21" | "premium",
    });

    setIsLoading(false);
  };

  const handleCancelSubscription = async () => {
    if (
      confirm(
        "Are you sure you want to cancel your subscription? You will lose access to premium features."
      )
    ) {
      cancelSubscriptionMutation.mutate();
    }
  };

  if (isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const currentPlan = currentSubscription?.subscription?.tier;
  const isSubscribed = currentSubscription?.status === "active";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Subscription Management
          </h1>
          <p className="text-muted-foreground">
            Manage your streaming access and premium features
          </p>
        </div>

        {/* Current Subscription Status */}
        {isSubscribed && (
          <Card className="mb-8 p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Active Subscription
                </h3>
                <p className="text-muted-foreground mt-1">
                  Plan: <span className="font-semibold capitalize">{currentPlan}</span>
                </p>
                <p className="text-muted-foreground">
                  Renews:{" "}
                  <span className="font-semibold">
                    {currentSubscription?.subscription?.currentPeriodEnd
                      ? new Date(
                          currentSubscription.subscription.currentPeriodEnd
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={cancelSubscriptionMutation.isPending}
              >
                {cancelSubscriptionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-6 relative transition-all ${
                currentPlan === plan.id
                  ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20"
                  : ""
              }`}
            >
              {currentPlan === plan.id && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Current Plan
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground ml-2">
                  /{plan.interval}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={
                  isLoading ||
                  currentPlan === plan.id ||
                  createCheckoutMutation.isPending
                }
                className="w-full"
                variant={currentPlan === plan.id ? "outline" : "default"}
              >
                {isLoading && selectedPlan === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentPlan === plan.id ? (
                  "Current Plan"
                ) : (
                  "Subscribe Now"
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Free Tier Info */}
        <Card className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Free Streaming
          </h3>
          <p className="text-muted-foreground mb-4">
            All members have access to free streaming content. Upgrade to premium
            to unlock exclusive content and features.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-blue-500" />
              Access to 100+ free channels
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-blue-500" />
              Standard quality streaming
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <X className="w-4 h-4 text-red-500" />
              No 18+ or 21+ restricted content
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
