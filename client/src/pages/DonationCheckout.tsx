import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface DonationTier {
  name: string;
  amount: string;
  description: string;
  benefits: string[];
}

const DONATION_TIERS: Record<string, DonationTier> = {
  'Seed Supporter': {
    name: 'Seed Supporter',
    amount: '25',
    description: 'Plant the first seed',
    benefits: [
      'Recognition as a Seed Supporter',
      'Access to community updates',
      'Digital badge',
    ],
  },
  'Builder': {
    name: 'Builder',
    amount: '100',
    description: 'Help build the foundation',
    benefits: [
      'All Seed benefits',
      'Exclusive monthly insights',
      'Direct access to founder updates',
      "Builder's Circle membership",
    ],
  },
  'Guardian': {
    name: 'Guardian',
    amount: '500',
    description: 'Protect the collective',
    benefits: [
      'All Builder benefits',
      'Quarterly strategy calls',
      'Custom impact report',
      "Guardian's Circle membership",
      'Legacy recognition',
    ],
  },
  'Strategic Collaborator': {
    name: 'Strategic Collaborator',
    amount: '2500',
    description: 'Shape the future together',
    benefits: [
      'All Guardian benefits',
      'Strategic Collaborator status',
      'Annual in-person gathering',
      'Collaborative business opportunities',
      'Perpetual recognition',
      'Custom collaboration terms',
    ],
  },
};

export default function DonationCheckout() {
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<DonationTier | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const createCheckout = trpc.stripeDonations.createDonationCheckout.useMutation();

  useEffect(() => {
    // Get tier from URL params
    const params = new URLSearchParams(window.location.search);
    const tierName = params.get('tier');
    const amount = params.get('amount');

    if (tierName && DONATION_TIERS[tierName]) {
      setSelectedTier(DONATION_TIERS[tierName]);
    } else if (amount) {
      setCustomAmount(amount);
    }
  }, []);

  const handleDonate = async () => {
    if (!donorName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!donorEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    const amount = selectedTier ? parseFloat(selectedTier.amount) : parseFloat(customAmount);
    if (!amount || amount < 1) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCheckout.mutateAsync({
        amount,
        frequency: 'one_time',
        donorEmail,
        donorName,
        designation: selectedTier?.name || 'general',
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/purple-heart')}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Allies & Supporters
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-purple-600 fill-purple-600" />
            Support The L.A.W.S. Collective
          </h1>
          <p className="text-muted-foreground">
            Complete your donation to help build generational wealth and community strength.
          </p>
        </div>

        {/* Donation Summary */}
        {selectedTier && (
          <Card className="p-6 mb-8 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <h2 className="text-xl font-bold text-foreground mb-2">{selectedTier.name}</h2>
            <p className="text-3xl font-bold text-purple-600 mb-4">${selectedTier.amount}</p>
            <p className="text-muted-foreground mb-4">{selectedTier.description}</p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Your benefits include:</p>
              <ul className="space-y-1">
                {selectedTier.benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {/* Donation Form */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Donation Details</h2>

          {/* Donor Information */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {!selectedTier && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Donation Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-foreground">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="mb-8 p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Payment Method</p>
            <p className="text-foreground font-medium">Credit Card (Stripe)</p>
            <p className="text-xs text-muted-foreground mt-2">
              Your payment information is secure and encrypted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/purple-heart')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDonate}
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Complete Donation
                </>
              )}
            </Button>
          </div>

          {/* Legal Notice */}
          <p className="text-xs text-muted-foreground mt-6 text-center">
            By completing this donation, you agree to our terms of service and privacy policy.
            You will receive a confirmation email with your donation receipt.
          </p>
        </Card>
      </div>
    </div>
  );
}
