import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, TrendingUp, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";

export default function PortfolioManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    portfolioType: "personal",
    riskProfile: "moderate",
  });

  const { data: portfoliosData, isLoading, refetch } = trpc.investmentMgmt.getPortfolios.useQuery({
    limit: 50,
    offset: 0,
  });

  const createPortfolioMutation = trpc.investmentMgmt.createPortfolio.useMutation({
    onSuccess: () => {
      toast.success("Portfolio created successfully");
      setFormData({
        name: "",
        description: "",
        portfolioType: "personal",
        riskProfile: "moderate",
      });
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error creating portfolio: ${error.message}`);
    },
  });

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Portfolio name is required");
      return;
    }

    await createPortfolioMutation.mutateAsync({
      name: formData.name,
      description: formData.description,
      portfolioType: formData.portfolioType as any,
      riskProfile: formData.riskProfile as any,
    });
  };

  const getPortfolioTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      personal: "Personal",
      retirement: "Retirement",
      education: "Education",
      trading: "Trading",
      long_term: "Long-term",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case "conservative":
        return "text-green-600 bg-green-50";
      case "moderate":
        return "text-blue-600 bg-blue-50";
      case "aggressive":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold">Investment Portfolios</h1>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Portfolio
        </Button>
      </div>

      {/* Create Portfolio Form */}
      {isCreating && (
        <Card className="p-6 bg-secondary/30">
          <h2 className="text-xl font-semibold mb-4">Create New Portfolio</h2>
          <form onSubmit={handleCreatePortfolio} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio Name</label>
                <Input
                  placeholder="e.g., Retirement Fund"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio Type</label>
                <Select
                  value={formData.portfolioType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, portfolioType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="trading">Trading</SelectItem>
                    <SelectItem value="long_term">Long-term</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Risk Profile</label>
              <Select
                value={formData.riskProfile}
                onValueChange={(value) =>
                  setFormData({ ...formData, riskProfile: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Portfolio description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createPortfolioMutation.isPending}
              >
                {createPortfolioMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Portfolio"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Portfolios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfoliosData?.portfolios && portfoliosData.portfolios.length > 0 ? (
          portfoliosData.portfolios.map((portfolio: any) => (
            <Card key={portfolio.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{portfolio.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
                      {getPortfolioTypeLabel(portfolio.portfolioType)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getRiskProfileColor(portfolio.riskProfile)}`}>
                      {portfolio.riskProfile.charAt(0).toUpperCase() +
                        portfolio.riskProfile.slice(1)}{" "}
                      Risk
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-accent" />
                      <p className="text-lg font-semibold">
                        ${portfolio.totalValue?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Gain/Loss</p>
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      <p
                        className={`text-lg font-semibold ${
                          portfolio.gainLossPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {portfolio.gainLossPercent >= 0 ? "+" : ""}
                        {portfolio.gainLossPercent?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground col-span-full">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No portfolios yet. Create your first portfolio to get started!</p>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      {portfoliosData?.portfolios && portfoliosData.portfolios.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5">
          <h3 className="font-semibold mb-4">Portfolio Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Portfolios</p>
              <p className="text-2xl font-bold">{portfoliosData.total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Combined Value</p>
              <p className="text-2xl font-bold">
                ${portfoliosData.portfolios
                  .reduce((sum: number, p: any) => sum + (p.totalValue || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average Return</p>
              <p className="text-2xl font-bold text-green-600">
                +
                {(
                  portfoliosData.portfolios.reduce(
                    (sum: number, p: any) => sum + (p.gainLossPercent || 0),
                    0
                  ) / portfoliosData.total
                ).toFixed(2)}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Risk Distribution</p>
              <p className="text-sm mt-2">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-1">
                  {portfoliosData.portfolios.filter((p: any) => p.riskProfile === "conservative").length}
                </span>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-1">
                  {portfoliosData.portfolios.filter((p: any) => p.riskProfile === "moderate").length}
                </span>
                <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                  {portfoliosData.portfolios.filter((p: any) => p.riskProfile === "aggressive").length}
                </span>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
