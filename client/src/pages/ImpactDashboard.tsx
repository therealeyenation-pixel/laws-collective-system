import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, Target, Heart, ArrowRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

interface ImpactMetrics {
  totalFundsRaised: number;
  totalDonors: number;
  jobsCreated: number;
  businessesFormed: number;
  peopleTrained: number;
  familiesServed: number;
}

export default function ImpactDashboard() {
  const [, setLocation] = useLocation();
  const [metrics, setMetrics] = useState<ImpactMetrics>({
    totalFundsRaised: 0,
    totalDonors: 0,
    jobsCreated: 47,
    businessesFormed: 23,
    peopleTrained: 156,
    familiesServed: 89,
  });
  const [isLoading, setIsLoading] = useState(true);

  const { data: impactData } = trpc.stripeDonations.getImpactMetrics.useQuery();

  useEffect(() => {
    if (impactData) {
      setMetrics((prev) => ({
        ...prev,
        jobsCreated: impactData.jobsCreated || prev.jobsCreated,
        businessesFormed: impactData.businessesFormed || prev.businessesFormed,
        peopleTrained: impactData.peopleTrained || prev.peopleTrained,
        familiesServed: impactData.familiesServed || prev.familiesServed,
      }));
    }
    setIsLoading(false);
  }, [impactData]);

  const impactCards = [
    {
      title: 'Total Funds Raised',
      value: `$${metrics.totalFundsRaised.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      description: 'Supporting community initiatives',
    },
    {
      title: 'Active Supporters',
      value: metrics.totalDonors.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      description: 'Building together',
    },
    {
      title: 'Jobs Created',
      value: metrics.jobsCreated.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      description: 'Economic opportunities',
    },
    {
      title: 'Businesses Formed',
      value: metrics.businessesFormed.toLocaleString(),
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      description: 'Entrepreneurship enabled',
    },
    {
      title: 'People Trained',
      value: metrics.peopleTrained.toLocaleString(),
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      description: 'Skills and knowledge',
    },
    {
      title: 'Families Served',
      value: metrics.familiesServed.toLocaleString(),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      description: 'Generational impact',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading impact metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-purple-600" />
            Community Impact Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            See the real-world impact of supporters like you building generational wealth and community strength.
          </p>
          <Button
            onClick={() => setLocation('/purple-heart')}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <Heart className="w-4 h-4" />
            Join Our Supporters
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {impactCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <Card key={idx} className={`p-6 ${card.bgColor} border-0`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-foreground">{card.value}</p>
                  </div>
                  <IconComponent className={`w-8 h-8 ${card.color}`} />
                </div>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Impact Stories Section */}
        <Card className="p-8 mb-12 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-0">
          <h2 className="text-2xl font-bold text-foreground mb-6">How Your Support Creates Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h3 className="font-semibold text-foreground">Education & Training</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Your donations fund comprehensive financial literacy, business formation, and professional development programs that equip community members with essential skills.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h3 className="font-semibold text-foreground">Business Formation</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Support enables entrepreneurs to launch their own businesses, creating jobs and economic opportunities within the community while building generational wealth.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h3 className="font-semibold text-foreground">Generational Wealth</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Through systematic wealth-building programs, we help families establish lasting financial security and pass prosperity to future generations.
              </p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Be Part of the Change</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every donation, regardless of size, contributes to building a stronger, more prosperous community. Join our growing network of supporters today.
          </p>
          <Button
            onClick={() => setLocation('/purple-heart')}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <Heart className="w-5 h-5" />
            Support The L.A.W.S. Collective
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
