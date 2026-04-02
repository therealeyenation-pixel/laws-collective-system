import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp, TrendingDown, PieChart as PieChartIcon } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function InvestmentAnalytics() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState("1y");

  const { data: portfoliosData } = trpc.investmentMgmt.getPortfolios.useQuery({
    limit: 50,
    offset: 0,
  });

  const { data: performanceData, isLoading: perfLoading } =
    trpc.investmentMgmt.getPortfolioPerformance.useQuery(
      { portfolioId: selectedPortfolio || 0, timeframe: timeframe as any },
      { enabled: !!selectedPortfolio }
    );

  const { data: allocationData, isLoading: allocLoading } =
    trpc.investmentMgmt.getAllocationBreakdown.useQuery(
      { portfolioId: selectedPortfolio || 0 },
      { enabled: !!selectedPortfolio }
    );

  const { data: dividendData, isLoading: divLoading } =
    trpc.investmentMgmt.getDividendIncome.useQuery(
      { portfolioId: selectedPortfolio || 0 },
      { enabled: !!selectedPortfolio }
    );

  const isLoading = perfLoading || allocLoading || divLoading;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChartIcon className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold">Investment Analytics</h1>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Portfolio</label>
          <Select
            value={selectedPortfolio?.toString() || ""}
            onValueChange={(value) => setSelectedPortfolio(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a portfolio..." />
            </SelectTrigger>
            <SelectContent>
              {portfoliosData?.portfolios?.map((portfolio: any) => (
                <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                  {portfolio.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Timeframe</label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="1w">1 Week</SelectItem>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="5y">5 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : selectedPortfolio ? (
        <>
          {/* Performance Metrics */}
          {performanceData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                  <p className="text-2xl font-bold">
                    ${performanceData.totalValue?.toLocaleString()}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Gain/Loss</p>
                  <div className="flex items-center gap-2">
                    {performanceData.gainLoss >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p
                        className={`text-2xl font-bold ${
                          performanceData.gainLoss >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {performanceData.gainLoss >= 0 ? "+" : ""}
                        {performanceData.gainLoss?.toFixed(0)}
                      </p>
                      <p
                        className={`text-xs ${
                          performanceData.gainLossPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {performanceData.gainLossPercent >= 0 ? "+" : ""}
                        {performanceData.gainLossPercent?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Volatility</p>
                  <p className="text-2xl font-bold">{performanceData.volatility?.toFixed(2)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
                  <p className="text-2xl font-bold">{performanceData.sharpeRatio?.toFixed(2)}</p>
                </Card>
              </div>

              {/* Returns by Period */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Returns by Period</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">YTD</p>
                    <p
                      className={`text-lg font-semibold ${
                        performanceData.returnYTD >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {performanceData.returnYTD >= 0 ? "+" : ""}
                      {performanceData.returnYTD?.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">1 Year</p>
                    <p
                      className={`text-lg font-semibold ${
                        performanceData.return1Year >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {performanceData.return1Year >= 0 ? "+" : ""}
                      {performanceData.return1Year?.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">3 Years</p>
                    <p
                      className={`text-lg font-semibold ${
                        performanceData.return3Year >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {performanceData.return3Year >= 0 ? "+" : ""}
                      {performanceData.return3Year?.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">5 Years</p>
                    <p
                      className={`text-lg font-semibold ${
                        performanceData.return5Year >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {performanceData.return5Year >= 0 ? "+" : ""}
                      {performanceData.return5Year?.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Allocation Breakdown */}
          {allocationData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Asset Allocation</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationData.allocations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ assetClass, percent }) => `${assetClass} ${percent}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percent"
                    >
                      {allocationData.allocations.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Allocation Details</h2>
                <div className="space-y-3">
                  {allocationData.allocations.map((allocation: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{allocation.assetClass}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{allocation.percent}%</p>
                        <p className="text-xs text-muted-foreground">
                          ${allocation.value?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Dividend Income */}
          {dividendData && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Dividend Income</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground">Total Dividends</p>
                  <p className="text-2xl font-bold">
                    ${dividendData.totalDividends?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dividend Yield</p>
                  <p className="text-2xl font-bold">{dividendData.dividendYield?.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Year</p>
                  <p className="text-2xl font-bold">{dividendData.year}</p>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Top Dividend Stocks</h3>
              <div className="space-y-2">
                {dividendData.topDividendStocks?.map((stock: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded">
                    <div>
                      <p className="font-semibold">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">Yield: {stock.yield}%</p>
                    </div>
                    <p className="font-semibold">${stock.amount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a portfolio to view analytics.</p>
        </Card>
      )}
    </div>
  );
}
