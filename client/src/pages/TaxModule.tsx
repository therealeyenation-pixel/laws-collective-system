import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Calculator,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  PiggyBank,
  Receipt,
  Building2,
  Briefcase,
} from "lucide-react";

export default function TaxModule() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [projectionInputs, setProjectionInputs] = useState({
    annualIncome: 100000,
    deductions: 15000,
    selfEmploymentIncome: 0,
  });

  const { data: taxSummary, isLoading: summaryLoading } = trpc.taxModule.getTaxSummary.useQuery({
    year: selectedYear,
  });

  const { data: quarterlyData, isLoading: quarterlyLoading } = trpc.taxModule.getQuarterlyBreakdown.useQuery({
    year: selectedYear,
  });

  const { data: projection } = trpc.taxModule.calculateProjection.useQuery(projectionInputs);

  const { data: categories } = trpc.taxModule.getCategories.useQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tax Module</h1>
            <p className="text-muted-foreground mt-1">
              Automated tax calculations using LuvLedger transaction data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="year-select" className="text-sm">Tax Year:</Label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded-md px-3 py-2 bg-background"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Tax Summary</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly Estimates</TabsTrigger>
            <TabsTrigger value="projection">Tax Projection</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Tax Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {summaryLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                      <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(taxSummary?.totalIncome || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        From {taxSummary?.transactionCount || 0} transactions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
                      <Receipt className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(taxSummary?.totalDeductions || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Business expenses & fees
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
                      <Calculator className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(taxSummary?.estimatedTax || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Federal + Self-Employment
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Effective Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercent(taxSummary?.effectiveRate || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        On adjusted income
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Tax Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Tax Breakdown
                      </CardTitle>
                      <CardDescription>
                        Detailed breakdown of your tax liability
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Gross Income</span>
                        <span className="font-medium">{formatCurrency(taxSummary?.totalIncome || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Less: Deductions</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(taxSummary?.totalDeductions || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">Adjusted Gross Income</span>
                        <span className="font-bold">{formatCurrency(taxSummary?.adjustedIncome || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Federal Income Tax</span>
                        <span className="font-medium">{formatCurrency(taxSummary?.federalTax || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-muted-foreground">Self-Employment Tax</span>
                        <span className="font-medium">{formatCurrency(taxSummary?.selfEmploymentTax || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 bg-muted/50 px-2 rounded">
                        <span className="font-bold">Total Tax Liability</span>
                        <span className="font-bold text-lg">{formatCurrency(taxSummary?.estimatedTax || 0)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PiggyBank className="h-5 w-5" />
                        Quarterly Estimate
                      </CardTitle>
                      <CardDescription>
                        Amount to set aside each quarter
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="text-5xl font-bold text-primary mb-2">
                          {formatCurrency(taxSummary?.quarterlyEstimate || 0)}
                        </div>
                        <p className="text-muted-foreground">per quarter</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800 dark:text-amber-200">
                              Estimated Tax Reminder
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              Set aside this amount quarterly to avoid underpayment penalties.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Quarterly Estimates Tab */}
          <TabsContent value="quarterly" className="space-y-6">
            {quarterlyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quarterlyData?.quarters.map((quarter) => {
                  const isPast = new Date() > new Date(quarter.dueDate);
                  const isUpcoming = !isPast && new Date() > new Date(new Date(quarter.dueDate).getTime() - 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <Card key={quarter.quarter} className={isUpcoming ? "border-amber-500" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Q{quarter.quarter} {selectedYear}
                          </CardTitle>
                          {isPast ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Past
                            </Badge>
                          ) : isUpcoming ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Due Soon
                            </Badge>
                          ) : (
                            <Badge variant="outline">Upcoming</Badge>
                          )}
                        </div>
                        <CardDescription>Due: {quarter.dueDate}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Income</p>
                            <p className="text-lg font-semibold text-green-600">
                              {formatCurrency(quarter.income)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expenses</p>
                            <p className="text-lg font-semibold text-red-600">
                              {formatCurrency(quarter.expenses)}
                            </p>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Estimated Tax Due</span>
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(quarter.estimatedTax)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Tax Projection Tab */}
          <TabsContent value="projection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tax Projection Calculator
                  </CardTitle>
                  <CardDescription>
                    Estimate your tax liability based on projected income
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="annual-income">Annual Income</Label>
                    <Input
                      id="annual-income"
                      type="number"
                      value={projectionInputs.annualIncome}
                      onChange={(e) =>
                        setProjectionInputs((prev) => ({
                          ...prev,
                          annualIncome: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deductions">Total Deductions</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={projectionInputs.deductions}
                      onChange={(e) =>
                        setProjectionInputs((prev) => ({
                          ...prev,
                          deductions: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="self-employment">Self-Employment Income</Label>
                    <Input
                      id="self-employment"
                      type="number"
                      value={projectionInputs.selfEmploymentIncome}
                      onChange={(e) =>
                        setProjectionInputs((prev) => ({
                          ...prev,
                          selfEmploymentIncome: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Subject to 15.3% self-employment tax
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projection Results</CardTitle>
                  <CardDescription>Based on your inputs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projection && (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Gross Income</span>
                          <span className="font-medium">{formatCurrency(projection.grossIncome)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Deductions</span>
                          <span className="font-medium text-red-600">
                            -{formatCurrency(projection.deductions)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Taxable Income</span>
                          <span className="font-bold">{formatCurrency(projection.taxableIncome)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Federal Tax</span>
                          <span className="font-medium">{formatCurrency(projection.federalTax)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Self-Employment Tax</span>
                          <span className="font-medium">{formatCurrency(projection.selfEmploymentTax)}</span>
                        </div>
                        <div className="flex justify-between py-2 bg-primary/10 px-2 rounded">
                          <span className="font-bold">Total Tax</span>
                          <span className="font-bold text-lg">{formatCurrency(projection.totalTax)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Effective Rate</p>
                          <p className="text-2xl font-bold">{formatPercent(projection.effectiveRate)}</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Marginal Rate</p>
                          <p className="text-2xl font-bold">{formatPercent(projection.marginalRate)}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Take-Home Pay</span>
                          <span className="text-2xl font-bold text-green-600">
                            {formatCurrency(projection.takeHome)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Income Categories
                  </CardTitle>
                  <CardDescription>
                    Types of income tracked for tax purposes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories?.income.map((cat) => (
                      <div
                        key={cat.code}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{cat.name}</span>
                        </div>
                        <Badge variant={cat.taxable ? "default" : "secondary"}>
                          {cat.taxable ? "Taxable" : "Non-Taxable"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-red-500" />
                    Expense Categories
                  </CardTitle>
                  <CardDescription>
                    Deductible and non-deductible expenses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories?.expense.map((cat) => (
                      <div
                        key={cat.code}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{cat.name}</span>
                        </div>
                        <Badge variant={cat.deductible ? "default" : "secondary"}>
                          {cat.deductible ? "Deductible" : "Non-Deductible"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
