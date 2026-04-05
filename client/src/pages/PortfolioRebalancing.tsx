import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PortfolioRebalancing() {
  const [selectedPortfolio, setSelectedPortfolio] = useState(1);
  const [showExecute, setShowExecute] = useState(false);

  const { data: recommendations, isLoading } =
    trpc.portfolioRebalancing.getRebalancingRecommendations.useQuery({
      portfolioId: selectedPortfolio,
    });

  const { data: history } =
    trpc.portfolioRebalancing.getRebalancingHistory.useQuery({
      portfolioId: selectedPortfolio,
    });

  const executeRebalancing =
    trpc.portfolioRebalancing.executeRebalancing.useMutation({
      onSuccess: () => {
        setShowExecute(false);
      },
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Rebalancing</h1>
        <Button
          onClick={() => setShowExecute(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Execute Rebalancing
        </Button>
      </div>

      {/* Portfolio Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {recommendations?.portfolio.name}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold">
              ${recommendations?.portfolio.totalValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Rebalancing Score</p>
            <p className="text-2xl font-bold">
              {recommendations?.rebalancingScore}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Net Benefit</p>
            <p className="text-2xl font-bold text-green-600">
              ${recommendations?.netBenefit}
            </p>
          </div>
        </div>
      </Card>

      {/* Current Allocation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Allocation</h3>
        <div className="space-y-3">
          {Object.entries(recommendations?.portfolio.currentAllocation || {}).map(
            ([asset, data]: [string, any]) => (
              <div key={asset}>
                <div className="flex justify-between mb-2">
                  <span className="capitalize">{asset}</span>
                  <span className="font-semibold">
                    {data.percent}% (${data.value.toLocaleString()})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${data.percent}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Target: {data.targetPercent}%
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      {/* Rebalancing Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
        <div className="space-y-3">
          {recommendations?.recommendations.map((rec: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {rec.action === "REDUCE" ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                )}
                <div>
                  <p className="font-semibold capitalize">{rec.assetClass}</p>
                  <p className="text-sm text-gray-600">{rec.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {rec.action === "REDUCE" ? "-" : "+"}${rec.amount}
                </p>
                <p className="text-sm text-gray-600">
                  {rec.currentPercent}% → {rec.targetPercent}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tax & Cost Impact */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tax & Cost Impact</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Estimated Tax Impact</p>
            <p className="text-2xl font-bold text-red-600">
              ${recommendations?.estimatedTaxImpact}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trading Costs</p>
            <p className="text-2xl font-bold text-red-600">
              ${recommendations?.estimatedTradingCosts}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Net Benefit</p>
            <p className="text-2xl font-bold text-green-600">
              ${recommendations?.netBenefit}
            </p>
          </div>
        </div>
      </Card>

      {/* Rebalancing History */}
      {history && history.history.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rebalancing History</h3>
          <div className="space-y-3">
            {history.history.map((item: any) => (
              <div key={item.id} className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{item.type} Rebalancing</p>
                  <p className="text-sm text-gray-600">{item.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.trades} trades</p>
                  <p className="text-sm text-red-600">
                    Tax: ${item.taxImpact}
                  </p>
                  <p className="text-sm text-green-600">
                    Benefit: ${item.taxImpact - item.tradingCosts}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Execute Rebalancing Modal */}
      {showExecute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              Confirm Rebalancing
            </h3>
            <p className="text-gray-600 mb-6">
              This will execute {recommendations?.recommendations.length} trades
              to rebalance your portfolio. Estimated tax impact: $
              {recommendations?.estimatedTaxImpact}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowExecute(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  executeRebalancing.mutate({
                    portfolioId: selectedPortfolio,
                    trades: recommendations?.recommendations.map((r: any) => ({
                      action: r.action,
                      symbol: r.assetClass,
                      quantity: r.amount / 100,
                      price: 100,
                    })) || [],
                  });
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={executeRebalancing.isPending}
              >
                {executeRebalancing.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  "Execute"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
