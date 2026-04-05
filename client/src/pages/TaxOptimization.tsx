import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingDown, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function TaxOptimization() {
  const [selectedPortfolio, setSelectedPortfolio] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: harvestingOps, isLoading } =
    trpc.taxOptimization.getTaxLossHarvestingOpportunities.useQuery({
      portfolioId: selectedPortfolio,
      minLossAmount: 100,
    });

  const { data: capitalGains } =
    trpc.taxOptimization.getCapitalGainsSummary.useQuery({
      portfolioId: selectedPortfolio,
      year: selectedYear,
    });

  const { data: withdrawalStrategies } =
    trpc.taxOptimization.getTaxEfficientWithdrawalStrategy.useQuery({
      portfolioId: selectedPortfolio,
      withdrawalAmount: 10000,
    });

  const { data: quarterlyTaxes } =
    trpc.taxOptimization.getEstimatedQuarterlyTaxes.useQuery({
      portfolioId: selectedPortfolio,
      year: selectedYear,
    });

  const { data: recommendations } =
    trpc.taxOptimization.getTaxPlanningRecommendations.useQuery({
      portfolioId: selectedPortfolio,
      year: selectedYear,
    });

  const executeHarvesting =
    trpc.taxOptimization.executeTaxLossHarvesting.useMutation();

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
        <h1 className="text-3xl font-bold">Tax Optimization</h1>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            {[2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tax-Loss Harvesting Opportunities */}
      <Card className="p-6 border-l-4 border-l-orange-600">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-orange-600" />
          Tax-Loss Harvesting Opportunities
        </h2>
        {harvestingOps && harvestingOps.opportunities.length > 0 ? (
          <div className="space-y-3">
            {harvestingOps.opportunities.map((opp: any, idx: number) => (
              <div key={idx} className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg">{opp.symbol}</p>
                    <p className="text-sm text-gray-600">
                      {opp.quantity} shares @ ${opp.currentPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      -${opp.unrealizedLoss}
                    </p>
                    <p className="text-sm text-green-600">
                      Tax Benefit: ${opp.taxBenefit}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {opp.recommendation}
                </p>
                {opp.replacementOptions && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">
                      Replacement Options:
                    </p>
                    <div className="flex gap-2">
                      {opp.replacementOptions.map((symbol: string) => (
                        <span
                          key={symbol}
                          className="text-xs bg-white px-2 py-1 rounded border"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => {
                    executeHarvesting.mutate({
                      portfolioId: selectedPortfolio,
                      harvests: [
                        {
                          symbol: opp.symbol,
                          quantity: opp.quantity,
                          replacementSymbol: opp.replacementOptions?.[0],
                        },
                      ],
                    });
                  }}
                  disabled={executeHarvesting.isPending}
                >
                  {executeHarvesting.isPending ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    "Execute Harvest"
                  )}
                </Button>
              </div>
            ))}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600">
                Total Potential Tax Benefit:{" "}
                <span className="font-bold text-green-600">
                  ${harvestingOps.totalPotentialTaxBenefit}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Net Benefit (after costs):{" "}
                <span className="font-bold text-green-600">
                  ${harvestingOps.netBenefit}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No tax-loss harvesting opportunities</p>
        )}
      </Card>

      {/* Capital Gains Summary */}
      {capitalGains && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Capital Gains Summary</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Short-Term Gains</p>
              <p className="text-2xl font-bold text-blue-600">
                ${capitalGains.shortTermGains.netGains.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {capitalGains.shortTermGains.transactions} transactions
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Long-Term Gains</p>
              <p className="text-2xl font-bold text-green-600">
                ${capitalGains.longTermGains.netGains.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {capitalGains.longTermGains.transactions} transactions
              </p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Total Capital Gains</span>
              <span className="font-bold">
                ${capitalGains.netCapitalGains.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Total Capital Losses</span>
              <span className="font-bold text-red-600">
                -${capitalGains.totalCapitalLosses.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Estimated Tax Liability</span>
              <span className="font-bold text-red-600">
                ${capitalGains.estimatedTaxLiability.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Withdrawal Strategies */}
      {withdrawalStrategies && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Tax-Efficient Withdrawal Strategies
          </h2>
          <div className="space-y-3">
            {withdrawalStrategies.strategies.map((strategy: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  strategy.name === withdrawalStrategies.recommendedStrategy
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{strategy.name}</p>
                    <p className="text-sm text-gray-600">
                      {strategy.recommendation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ${strategy.taxImpact.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Tax Impact</p>
                  </div>
                </div>
                {strategy.name === withdrawalStrategies.recommendedStrategy && (
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    ✓ Recommended
                  </p>
                )}
              </div>
            ))}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900">
                Estimated Tax Savings:{" "}
                <span className="text-green-600">
                  ${withdrawalStrategies.estimatedTaxSavings.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quarterly Estimated Taxes */}
      {quarterlyTaxes && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Estimated Quarterly Taxes - {selectedYear}
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {quarterlyTaxes.quarters.map((quarter: any) => (
              <div key={quarter.quarter} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold">Q{quarter.quarter}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  ${quarter.estimatedTax.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Due: {quarter.dueDate}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm">
              Total Estimated Tax:{" "}
              <span className="font-bold">
                ${quarterlyTaxes.totalEstimatedTax.toLocaleString()}
              </span>
            </p>
          </div>
        </Card>
      )}

      {/* Tax Planning Recommendations */}
      {recommendations && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Tax Planning Recommendations
          </h2>
          <div className="space-y-3">
            {recommendations.recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === "HIGH"
                    ? "border-l-red-600 bg-red-50"
                    : "border-l-yellow-600 bg-yellow-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{rec.title}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          rec.priority === "HIGH"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-600">Potential Savings</p>
                    <p className="text-lg font-bold text-green-600">
                      ${rec.potentialSavings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold">
                Total Potential Savings:{" "}
                <span className="text-green-600">
                  ${recommendations.totalPotentialSavings.toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Estimated Tax Reduction:{" "}
                <span className="font-semibold">
                  ${recommendations.estimatedTaxReduction.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
