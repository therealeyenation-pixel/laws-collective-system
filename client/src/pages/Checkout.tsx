import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  stripeProductId?: string;
  stripePriceId?: string;
}

const PRICING_PLANS: Record<string, PricingPlan> = {
  'starter': {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'Perfect for individuals and small families starting their wealth journey',
    features: [
      '1 Business Entity',
      'Basic Financial Dashboard',
      'Document Vault (5GB)',
      'Grant Database Access',
      'Email Support',
      'Basic Reporting',
      'Mobile App Access',
    ],
  },
  'professional': {
    id: 'professional',
    name: 'Professional',
    price: 149,
    description: 'For growing families and organizations building multiple revenue streams',
    features: [
      'Up to 5 Business Entities',
      'Advanced Financial Automation',
      'Document Vault (50GB)',
      'Grant Simulator & Writer',
      'Proposal Generator',
      'Contract Management',
      'Tax Preparation Tools',
      'Priority Support',
      'Custom Reporting',
      'API Access',
    ],
  },
  'enterprise': {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    description: 'Complete solution for multi-generational wealth systems and organizations',
    features: [
      'Unlimited Business Entities',
      'Full Financial Automation Suite',
      'Unlimited Document Storage',
      'All Simulators & Generators',
      'White-label Options',
      'Dedicated Account Manager',
      'Custom Integrations',
      'Advanced Analytics',
      'Training & Onboarding',
      'SLA Guarantee',
      'Multi-user Access (25 seats)',
    ],
  },
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const createCheckout = trpc.stripe.createCheckoutSession.useMutation();

  useEffect(() => {
    // Get plan from URL params
    const params = new URLSearchParams(window.location.search);
    const planId = params.get('plan');

    if (planId && PRICING_PLANS[planId]) {
      setSelectedPlan(PRICING_PLANS[planId]);
    } else {
      // Default to professional plan
      setSelectedPlan(PRICING_PLANS['professional']);
    }
  }, []);

  const handleCheckout = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCheckout.mutateAsync({
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price * 100, // Convert to cents
        frequency: 'monthly',
      });

      if (result.checkoutUrl) {
        // Open in new tab
        window.open(result.checkoutUrl, '_blank');
        toast.success('Redirecting to checkout...');
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/pricing')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-muted-foreground">
            Start your 14-day free trial with full access to all features.
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.values(PRICING_PLANS).map((plan) => (
            <Card
              key={plan.id}
              className={`p-6 cursor-pointer transition-all ${
                selectedPlan?.id === plan.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedPlan(plan)}
            >
              <h3 className="text-lg font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-primary mb-2">${plan.price}</p>
              <p className="text-sm text-muted-foreground mb-4">/month</p>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </Card>
          ))}
        </div>

        {/* Plan Details */}
        {selectedPlan && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {selectedPlan.name} Plan - ${selectedPlan.price}/month
            </h2>

            {/* Features List */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Included Features:</h3>
              <ul className="space-y-3">
                {selectedPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trial Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-8">
              <p className="text-sm text-foreground">
                <span className="font-semibold">14-Day Free Trial:</span> Start your trial today with full access to all features. No credit card required to start. Cancel anytime.
              </p>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start 14-Day Free Trial
                </>
              )}
            </Button>

            {/* Legal Notice */}
            <p className="text-xs text-muted-foreground mt-6 text-center">
              By starting your trial, you agree to our terms of service and privacy policy.
              Your trial is free for 14 days. After that, your plan will renew at the regular price unless cancelled.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
