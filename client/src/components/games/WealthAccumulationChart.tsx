import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ComposedChart,
  Bar,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  Target,
  Milestone
} from "lucide-react";

// Life milestones for reference lines
const MILESTONES = [
  { age: 18, label: "Adulthood" },
  { age: 25, label: "Career Start" },
  { age: 30, label: "Family Formation" },
  { age: 45, label: "Peak Earning" },
  { age: 55, label: "Pre-Retirement" },
  { age: 65, label: "Retirement" },
];

interface WealthDataPoint {
  age: number;
  wardNetWorth: number;
  trustNetWorth: number;
  wardIncome: number;
  trustIncome: number;
  wardProtection: number;
  trustProtection: number;
  event?: string;
  milestone?: string;
}

interface WealthAccumulationChartProps {
  wardStats: {
    netWorth: number;
    totalIncome: number;
    protectionLevel: number;
  };
  trustStats: {
    netWorth: number;
    totalIncome: number;
    protectionLevel: number;
  };
  currentAge: number;
  eventsCompleted: string[];
}

// Generate projected wealth data over lifetime
const generateWealthData = (
  wardStats: WealthAccumulationChartProps["wardStats"],
  trustStats: WealthAccumulationChartProps["trustStats"],
  currentAge: number
): WealthDataPoint[] => {
  const data: WealthDataPoint[] = [];
  
  // Base growth rates
  const wardGrowthRate = 0.04; // 4% annual growth (lower due to less protection/optimization)
  const trustGrowthRate = 0.08; // 8% annual growth (higher due to protection and tax optimization)
  
  // Income growth rates
  const wardIncomeGrowth = 0.03; // 3% annual income growth
  const trustIncomeGrowth = 0.06; // 6% annual income growth (business income)
  
  // Starting values at birth
  let wardNetWorth = 0;
  let trustNetWorth = 5000; // Initial trust funding
  let wardIncome = 0;
  let trustIncome = 0;
  
  // Crisis impact ages
  const crisisAges = [32, 48, 55]; // Lawsuit, medical, divorce
  
  for (let age = 0; age <= 85; age++) {
    // Apply growth
    if (age > 0) {
      wardNetWorth = wardNetWorth * (1 + wardGrowthRate);
      trustNetWorth = trustNetWorth * (1 + trustGrowthRate);
    }
    
    // Income events
    if (age === 16) {
      wardIncome = 8000; // First job
      trustIncome = 5000;
    } else if (age === 22) {
      wardIncome = 45000; // Career start
      trustIncome = 35000;
      wardNetWorth -= 45000; // Student loans
      trustNetWorth -= 20000; // Trust-funded education
    } else if (age === 30) {
      wardNetWorth += 50000; // Home equity
      trustNetWorth += 75000;
      wardIncome = 65000;
      trustIncome = 80000;
    } else if (age === 40) {
      wardIncome = 90000;
      trustIncome = 150000;
    } else if (age === 50) {
      wardIncome = 120000;
      trustIncome = 200000;
    } else if (age === 60) {
      wardNetWorth += 200000; // Business sale (ward discovers business late)
      trustNetWorth += 500000; // Trust business sale
    } else if (age === 65) {
      wardIncome = 40000; // Retirement income
      trustIncome = 150000; // Passive income continues
    }
    
    // Crisis impacts (ward path hit harder)
    if (crisisAges.includes(age)) {
      wardNetWorth -= wardNetWorth * 0.3; // 30% loss
      trustNetWorth -= trustNetWorth * 0.05; // 5% loss (protected)
    }
    
    // Accumulate income into net worth (simplified)
    if (age >= 22) {
      wardNetWorth += wardIncome * 0.1; // 10% savings rate
      trustNetWorth += trustIncome * 0.25; // 25% savings rate (tax advantages)
    }
    
    // Find milestone
    const milestone = MILESTONES.find(m => m.age === age);
    
    data.push({
      age,
      wardNetWorth: Math.round(wardNetWorth),
      trustNetWorth: Math.round(trustNetWorth),
      wardIncome: Math.round(wardIncome),
      trustIncome: Math.round(trustIncome),
      wardProtection: age < 40 ? 0 : 30, // Ward discovers protection late
      trustProtection: 100,
      milestone: milestone?.label,
    });
  }
  
  return data;
};

// Format currency for axis
const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-bold mb-2">Age {label}</p>
        {data.milestone && (
          <p className="text-xs text-primary mb-2 flex items-center gap-1">
            <Milestone className="w-3 h-3" />
            {data.milestone}
          </p>
        )}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-red-600">Ward Net Worth:</span>
            <span className="font-medium">{formatCurrency(data.wardNetWorth)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-green-600">Trust Net Worth:</span>
            <span className="font-medium">{formatCurrency(data.trustNetWorth)}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t">
            <span className="text-muted-foreground">Gap:</span>
            <span className="font-bold text-amber-600">
              {formatCurrency(data.trustNetWorth - data.wardNetWorth)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function WealthAccumulationChart({
  wardStats,
  trustStats,
  currentAge,
  eventsCompleted,
}: WealthAccumulationChartProps) {
  const wealthData = useMemo(
    () => generateWealthData(wardStats, trustStats, currentAge),
    [wardStats, trustStats, currentAge]
  );
  
  // Calculate key metrics
  const currentData = wealthData.find(d => d.age === currentAge) || wealthData[0];
  const retirementData = wealthData.find(d => d.age === 65) || wealthData[wealthData.length - 1];
  const finalData = wealthData[wealthData.length - 1];
  
  const wealthGap = trustStats.netWorth - wardStats.netWorth;
  const projectedGapAt65 = retirementData.trustNetWorth - retirementData.wardNetWorth;
  const lifetimeGap = finalData.trustNetWorth - finalData.wardNetWorth;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Current Gap</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(wealthGap)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Gap at Retirement (65)</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(projectedGapAt65)}</p>
              </div>
              <Target className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Lifetime Gap (85)</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(lifetimeGap)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Trust Advantage</p>
                <p className="text-xl font-bold text-green-600">
                  {((finalData.trustNetWorth / Math.max(1, finalData.wardNetWorth)) * 100 - 100).toFixed(0)}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Lifetime Wealth Accumulation Comparison
          </CardTitle>
          <CardDescription>
            Side-by-side comparison of net worth over a lifetime for both paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wealthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="age" 
                  label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  label={{ value: 'Net Worth', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Milestone reference lines */}
                {MILESTONES.map((milestone) => (
                  <ReferenceLine
                    key={milestone.age}
                    x={milestone.age}
                    stroke="#888"
                    strokeDasharray="3 3"
                    label={{ value: milestone.label, position: 'top', fontSize: 10 }}
                  />
                ))}
                
                {/* Current age indicator */}
                <ReferenceLine
                  x={currentAge}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  label={{ value: 'You are here', position: 'top', fill: '#f59e0b' }}
                />
                
                <Area
                  type="monotone"
                  dataKey="wardNetWorth"
                  name="Birth-Ward Path"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="trustNetWorth"
                  name="Birth-Trust Path"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Milestone Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Milestone className="w-5 h-5" />
            Key Milestone Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Age</th>
                  <th className="text-left py-2 px-3">Milestone</th>
                  <th className="text-right py-2 px-3 text-red-600">Ward Net Worth</th>
                  <th className="text-right py-2 px-3 text-green-600">Trust Net Worth</th>
                  <th className="text-right py-2 px-3 text-amber-600">Gap</th>
                </tr>
              </thead>
              <tbody>
                {[0, 18, 25, 35, 45, 55, 65, 75, 85].map((age) => {
                  const data = wealthData.find(d => d.age === age);
                  if (!data) return null;
                  const milestone = MILESTONES.find(m => m.age === age);
                  const gap = data.trustNetWorth - data.wardNetWorth;
                  
                  return (
                    <tr key={age} className={`border-b ${age === currentAge ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}>
                      <td className="py-2 px-3 font-medium">{age}</td>
                      <td className="py-2 px-3">{milestone?.label || (age === 0 ? 'Birth' : age === 35 ? 'Mid-Career' : age === 75 ? 'Late Retirement' : age === 85 ? 'End of Life' : '')}</td>
                      <td className="py-2 px-3 text-right text-red-600">{formatCurrency(data.wardNetWorth)}</td>
                      <td className="py-2 px-3 text-right text-green-600">{formatCurrency(data.trustNetWorth)}</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-600">{formatCurrency(gap)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Income Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Annual Income Comparison
          </CardTitle>
          <CardDescription>
            Income trajectory differences between W-2 employment and business ownership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={wealthData.filter(d => d.age >= 16 && d.age <= 75)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="age" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="wardIncome" name="Ward Income" fill="#ef4444" fillOpacity={0.6} />
                <Bar dataKey="trustIncome" name="Trust Income" fill="#22c55e" fillOpacity={0.6} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Insights */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Birth-Ward Challenges</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Higher tax burden throughout life (25-35% effective rate)</li>
                <li>• No asset protection during crises (lawsuits, divorce, medical)</li>
                <li>• Student loan debt delays wealth building by 10+ years</li>
                <li>• Limited retirement options (401k + Social Security)</li>
                <li>• Estate taxes reduce generational transfer by 40%+</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Birth-Trust Advantages</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tax optimization from day one (15-20% effective rate)</li>
                <li>• Full asset protection through all life events</li>
                <li>• Education funded without personal debt</li>
                <li>• Multiple income streams and passive income</li>
                <li>• Seamless generational wealth transfer</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
