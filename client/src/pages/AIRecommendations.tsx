import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Streamdown } from 'streamdown';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

export default function AIRecommendations() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>(
    'moderate'
  );
  const [investmentGoals, setInvestmentGoals] = useState<string[]>(['growth', 'income']);

  // Fetch portfolios
  const { data: portfolios, isLoading: portfoliosLoading } =
    trpc.investmentMgmt.getPortfolios.useQuery();

  // Fetch recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } =
    trpc.aiRecommendations.generateRecommendations.useQuery(
      {
        portfolioId: selectedPortfolio || 0,
        riskProfile,
        investmentGoals,
      },
      { enabled: selectedPortfolio !== null }
    );

  // Fetch portfolio risk analysis
  const { data: riskAnalysis, isLoading: riskLoading } =
    trpc.aiRecommendations.analyzePortfolioRisk.useQuery(
      { portfolioId: selectedPortfolio || 0 },
      { enabled: selectedPortfolio !== null }
    );

  // Fetch diversification gaps
  const { data: diversificationGaps, isLoading: diversificationLoading } =
    trpc.aiRecommendations.identifyDiversificationGaps.useQuery(
      { portfolioId: selectedPortfolio || 0 },
      { enabled: selectedPortfolio !== null }
    );

  // Fetch market insights
  const { data: marketInsights, isLoading: insightsLoading } =
    trpc.aiRecommendations.generateMarketInsights.useQuery();

  // Save feedback mutation
  const saveFeedbackMutation = trpc.aiRecommendations.saveRecommendationFeedback.useMutation();

  const handleFeedback = (recommendationId: string, feedback: 'helpful' | 'not_helpful' | 'implemented') => {
    saveFeedbackMutation.mutate({
      portfolioId: selectedPortfolio || 0,
      recommendationId,
      feedback,
    });
  };

  const isLoading =
    portfoliosLoading ||
    recommendationsLoading ||
    riskLoading ||
    diversificationLoading ||
    insightsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Investment Recommendations</h1>
          <p className="text-muted-foreground">
            Personalized portfolio suggestions powered by advanced AI analysis
          </p>
        </div>

        {/* Portfolio Selection */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
          <h2 className="text-xl font-bold text-foreground mb-4">Select Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Portfolio</label>
              <select
                value={selectedPortfolio || ''}
                onChange={(e) => setSelectedPortfolio(Number(e.target.value) || null)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Choose a portfolio...</option>
                {portfolios?.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name} (${portfolio.totalValue.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Risk Profile</label>
              <select
                value={riskProfile}
                onChange={(e) =>
                  setRiskProfile(e.target.value as 'conservative' | 'moderate' | 'aggressive')
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Investment Goals
              </label>
              <div className="flex gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={investmentGoals.includes('growth')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInvestmentGoals([...investmentGoals, 'growth']);
                      } else {
                        setInvestmentGoals(investmentGoals.filter((g) => g !== 'growth'));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">Growth</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={investmentGoals.includes('income')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInvestmentGoals([...investmentGoals, 'income']);
                      } else {
                        setInvestmentGoals(investmentGoals.filter((g) => g !== 'income'));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">Income</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-foreground">Analyzing your portfolio...</span>
          </div>
        ) : selectedPortfolio ? (
          <>
            {/* Risk Analysis */}
            {riskAnalysis && (
              <Card className="p-6 mb-8 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">Portfolio Risk Analysis</h3>
                    <Streamdown>{riskAnalysis.analysis}</Streamdown>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Volatility</p>
                        <p className="text-lg font-bold text-foreground">
                          {riskAnalysis.metrics.volatility.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Concentration</p>
                        <p className="text-lg font-bold text-foreground">
                          {riskAnalysis.metrics.concentration.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Diversification</p>
                        <p className="text-lg font-bold text-foreground">
                          {riskAnalysis.metrics.diversification.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Correlation</p>
                        <p className="text-lg font-bold text-foreground">
                          {riskAnalysis.metrics.correlation.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Diversification Gaps */}
            {diversificationGaps && (
              <Card className="p-6 mb-8 border-l-4 border-l-accent">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-6 h-6 text-accent mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">Diversification Opportunities</h3>
                    <Streamdown>{diversificationGaps.recommendations}</Streamdown>
                  </div>
                </div>
              </Card>
            )}

            {/* AI Recommendations */}
            {recommendationsData && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Personalized Recommendations</h2>
                <div className="space-y-4">
                  {recommendationsData.recommendations.map((rec: Recommendation) => (
                    <Card
                      key={rec.id}
                      className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-foreground">{rec.title}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                rec.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : rec.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {rec.priority.toUpperCase()}
                            </span>
                          </div>
                          <Streamdown>{rec.description}</Streamdown>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-sm text-muted-foreground">Confidence</p>
                          <p className="text-2xl font-bold text-primary">{rec.confidence}%</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(rec.id, 'helpful')}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Helpful
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(rec.id, 'not_helpful')}
                        >
                          Not Helpful
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleFeedback(rec.id, 'implemented')}
                        >
                          Implement
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Market Insights */}
            {marketInsights && (
              <Card className="p-6 bg-gradient-to-br from-secondary/30 to-accent/10">
                <h3 className="text-lg font-bold text-foreground mb-3">Market Insights</h3>
                <Streamdown>{marketInsights.insights}</Streamdown>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              Select a portfolio to view personalized AI recommendations
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
