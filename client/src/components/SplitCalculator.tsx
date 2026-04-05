import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calculator, PieChart, Download, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SplitBreakdown {
  house: number;
  collective: number;
  houseOperations: number;
  inheritance: number;
}

export function SplitCalculator() {
  const [amount, setAmount] = useState<string>("1000");
  const [customHousePercent, setCustomHousePercent] = useState<string>("60");
  const [customInternalPercent, setCustomInternalPercent] = useState<string>("70");

  const parsedAmount = useMemo(() => {
    const val = parseFloat(amount);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [amount]);

  // Standard 60/40 and 70/30 splits
  const standardSplit = useMemo((): SplitBreakdown => {
    const house = parsedAmount * 0.6; // 60% to house
    const collective = parsedAmount * 0.4; // 40% to collective
    const houseOperations = house * 0.7; // 70% of house for operations
    const inheritance = house * 0.3; // 30% of house to inheritance
    return { house, collective, houseOperations, inheritance };
  }, [parsedAmount]);

  // Custom split calculation
  const customSplit = useMemo((): SplitBreakdown => {
    const housePercent = Math.min(100, Math.max(0, parseFloat(customHousePercent) || 60)) / 100;
    const internalPercent = Math.min(100, Math.max(0, parseFloat(customInternalPercent) || 70)) / 100;
    
    const house = parsedAmount * housePercent;
    const collective = parsedAmount * (1 - housePercent);
    const houseOperations = house * internalPercent;
    const inheritance = house * (1 - internalPercent);
    return { house, collective, houseOperations, inheritance };
  }, [parsedAmount, customHousePercent, customInternalPercent]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return ((value / total) * 100).toFixed(1) + "%";
  };

  const SplitDisplay = ({ split, title }: { split: SplitBreakdown; title: string }) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">{title}</h4>
      
      {/* Visual breakdown */}
      <div className="space-y-3">
        {/* Inter-house split bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Inter-House Split (60/40)</span>
            <span className="text-foreground">{formatCurrency(parsedAmount)}</span>
          </div>
          <div className="h-6 rounded-full overflow-hidden flex bg-secondary">
            <div 
              className="bg-green-600 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(split.house / parsedAmount) * 100}%` }}
            >
              House {formatPercent(split.house, parsedAmount)}
            </div>
            <div 
              className="bg-blue-600 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${(split.collective / parsedAmount) * 100}%` }}
            >
              Collective {formatPercent(split.collective, parsedAmount)}
            </div>
          </div>
        </div>

        {/* Intra-house split bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Intra-House Split (70/30)</span>
            <span className="text-foreground">{formatCurrency(split.house)}</span>
          </div>
          <div className="h-6 rounded-full overflow-hidden flex bg-secondary">
            <div 
              className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${split.house > 0 ? (split.houseOperations / split.house) * 100 : 0}%` }}
            >
              Operations {formatPercent(split.houseOperations, split.house)}
            </div>
            <div 
              className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${split.house > 0 ? (split.inheritance / split.house) * 100 : 0}%` }}
            >
              Inheritance {formatPercent(split.inheritance, split.house)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed breakdown table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2 font-medium">Allocation</th>
              <th className="text-right p-2 font-medium">Amount</th>
              <th className="text-right p-2 font-medium">% of Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                House Total
              </td>
              <td className="p-2 text-right font-medium">{formatCurrency(split.house)}</td>
              <td className="p-2 text-right text-muted-foreground">{formatPercent(split.house, parsedAmount)}</td>
            </tr>
            <tr className="border-t bg-muted/30">
              <td className="p-2 pl-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                House Operations
              </td>
              <td className="p-2 text-right">{formatCurrency(split.houseOperations)}</td>
              <td className="p-2 text-right text-muted-foreground">{formatPercent(split.houseOperations, parsedAmount)}</td>
            </tr>
            <tr className="border-t bg-muted/30">
              <td className="p-2 pl-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Inheritance Pool
              </td>
              <td className="p-2 text-right">{formatCurrency(split.inheritance)}</td>
              <td className="p-2 text-right text-muted-foreground">{formatPercent(split.inheritance, parsedAmount)}</td>
            </tr>
            <tr className="border-t">
              <td className="p-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                Collective Share
              </td>
              <td className="p-2 text-right font-medium">{formatCurrency(split.collective)}</td>
              <td className="p-2 text-right text-muted-foreground">{formatPercent(split.collective, parsedAmount)}</td>
            </tr>
            <tr className="border-t bg-muted font-semibold">
              <td className="p-2">Total</td>
              <td className="p-2 text-right">{formatCurrency(parsedAmount)}</td>
              <td className="p-2 text-right">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <CardTitle>Split Calculator</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>60/40 Inter-House:</strong> 60% to house, 40% to collective<br />
                  <strong>70/30 Intra-House:</strong> 70% house operations, 30% inheritance
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Calculate how funds are distributed under the house split formulas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount to Distribute</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7"
              placeholder="Enter amount"
              min="0"
              step="100"
            />
          </div>
        </div>

        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Split</TabsTrigger>
            <TabsTrigger value="custom">Custom Split</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="mt-4">
            <SplitDisplay split={standardSplit} title="Standard 60/40 + 70/30 Split" />
          </TabsContent>

          <TabsContent value="custom" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customHouse">House % (Inter-House)</Label>
                <div className="relative">
                  <Input
                    id="customHouse"
                    type="number"
                    value={customHousePercent}
                    onChange={(e) => setCustomHousePercent(e.target.value)}
                    className="pr-7"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Collective: {100 - (parseFloat(customHousePercent) || 0)}%
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customInternal">Operations % (Intra-House)</Label>
                <div className="relative">
                  <Input
                    id="customInternal"
                    type="number"
                    value={customInternalPercent}
                    onChange={(e) => setCustomInternalPercent(e.target.value)}
                    className="pr-7"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Inheritance: {100 - (parseFloat(customInternalPercent) || 0)}%
                </p>
              </div>
            </div>
            <SplitDisplay 
              split={customSplit} 
              title={`Custom ${customHousePercent}/${100 - (parseFloat(customHousePercent) || 0)} + ${customInternalPercent}/${100 - (parseFloat(customInternalPercent) || 0)} Split`} 
            />
          </TabsContent>
        </Tabs>

        {/* Quick amounts */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Quick Amounts</Label>
          <div className="flex flex-wrap gap-2">
            {[100, 500, 1000, 5000, 10000, 50000].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                onClick={() => setAmount(val.toString())}
                className={amount === val.toString() ? "border-primary" : ""}
              >
                ${val.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SplitCalculator;
