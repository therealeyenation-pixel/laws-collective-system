import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Crown,
  Building2,
  Shield,
  Lock,
  Users,
  Wallet,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Home,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Rocket,
  Eye,
  ShieldAlert,
  Scale,
  Landmark,
  Heart,
  Layers,
} from "lucide-react";
import LAWSOnboardingGuide from "@/components/LAWSOnboardingGuide";

interface HouseOverview {
  id: number;
  name: string;
  status: string;
  heirsCount: number;
  businessCount: number;
  trustHealth: number;
}

export default function AutonomousWealthSystem() {
  const { user, loading: authLoading } = useAuth();

  // Query for houses
  const housesQuery = trpc.genesisHouse.listHouses.useQuery(undefined, {
    enabled: !!user,
  });

  // Query for activation progress
  const progressQuery = trpc.systemActivation.getProgress.useQuery(undefined, {
    enabled: !!user,
  });

  const houses = housesQuery.data ?? [];
  const hasHouse = houses.length > 0;
  const activationProgress = progressQuery.data;
  const completedCount = activationProgress?.completedCount ?? 0;
  const totalRequired = activationProgress?.totalRequired ?? 6;

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Crown className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  LuvOnPurpose Autonomous Wealth System
                </h1>
                <p className="text-muted-foreground text-sm">
                  Multi-generational House & Trust management architecture
                </p>
              </div>
            </div>
          </div>
          {!hasHouse && (
            <Button asChild size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700">
              <Link href="/genesis">
                <Rocket className="w-4 h-4" />
                Start the First House
              </Link>
            </Button>
          )}
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{houses.length}</p>
                  <p className="text-xs text-muted-foreground">Active Houses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {houses.reduce((sum: number, h: any) => sum + (h.heirsCount || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Designated Heirs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {houses.reduce((sum: number, h: any) => sum + (h.businessCount || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Linked Businesses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCount}/{totalRequired}</p>
                  <p className="text-xs text-muted-foreground">Activation Steps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No House - Getting Started */}
        {!hasHouse && (
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Begin Your Wealth Architecture
              </CardTitle>
              <CardDescription>
                The Autonomous Wealth System is a sovereign framework for building and protecting 
                multi-generational wealth. Start by establishing your first House — the foundational 
                trust structure that will house your businesses, protect your assets, and secure your 
                family's legacy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1. Genesis Activation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Name your House, define your vision, and designate your initial heirs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">2. Secure the Vault</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Encrypt family identity documents and establish succession protocols
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">3. Activate Wealth Flow</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Link businesses, set distribution rules, and begin the generational arc
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" className="w-full gap-2 bg-amber-600 hover:bg-amber-700">
                <Link href="/genesis">
                  <Rocket className="w-4 h-4" />
                  Start the First House
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Houses List (when houses exist) */}
        {hasHouse && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Houses</h2>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/genesis">
                  <Rocket className="w-3.5 h-3.5" />
                  Establish New House
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {houses.map((house: any) => (
                <Card key={house.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-600" />
                        {house.name || `House #${house.id}`}
                      </CardTitle>
                      <Badge variant={house.isGenesis ? "default" : "secondary"}>
                        {house.isGenesis ? "Genesis" : "Active"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold">{house.heirsCount || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Heirs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{house.businessCount || 0}</p>
                        <p className="text-[10px] text-muted-foreground">Businesses</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{house.trustHealth || 0}%</p>
                        <p className="text-[10px] text-muted-foreground">Trust Health</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full mt-4 gap-2">
                      <Link href="/house">
                        Manage House
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Wealth System Modules */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Wealth System Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Genesis House */}
            <Link href="/genesis">
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-amber-500/50 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-lg">
                      <Rocket className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Genesis Activation</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Establish a new House with heirs, vision, and foundational trust structure
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Identity Vault */}
            <Link href="/founder/identity-vault">
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-emerald-500/50 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                      <Lock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Identity Vault</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Encrypted storage for family identity documents, SSNs, and sensitive records
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Succession Protocol */}
            <Link href="/founder/succession-protocol">
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-red-500/50 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-red-500/10 rounded-lg">
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Succession Protocol</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Designate successors, configure emergency vault access with time-locked protocols
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Trust Governance */}
            <Link href="/trust-governance">
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-purple-500/50 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-purple-500/10 rounded-lg">
                      <Scale className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Trust Governance</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Distribution rules, beneficiary management, and trust policy oversight
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Trust Structure */}
            <Link href="/trust-structure">
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-500/50 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-lg">
                      <Layers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Trust Structure</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Visual entity hierarchy, organizational chart, and structural overview
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* House Management */}
            <Link href="/houses">
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-teal-500/50 h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-teal-500/10 rounded-lg">
                      <Home className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">House Management</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Manage all Houses, linked businesses, financial flows, and heir assignments
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Onboarding Guide */}
        <LAWSOnboardingGuide
          completedSteps={[]}
          currentStep={hasHouse ? 5 : 1}
        />

        {/* System Architecture Info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Landmark className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">About the Autonomous Wealth System</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The LuvOnPurpose Autonomous Wealth System is the sovereign architecture anchored by 
                  the CALEA Freeman Family Trust (98 Trust) — a foreign grantor trust that serves as the 
                  root entity for all operations, including international relations under UNDRIP/ADRIP. 
                  Each "House" represents a family trust structure with linked businesses that generate 
                  revenue, protected by encrypted identity vaults and succession protocols. The system 
                  is designed for a 5-year implementation arc with a 100+ year legacy vision — building 
                  generational wealth through purpose, structure, and community.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
