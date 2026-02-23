import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  DollarSign,
  Calculator,
  Calendar,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  PieChart,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";

export default function TaxModule() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [projectionInputs, setProjectionInputs] = useState<{
    grossIncome: number;
    deductions: number;
    filingStatus: "single" | "married_joint" | "married_separate" | "head_of_household";
    selfEmployed: boolean;
  }>({
    grossIncome: 100000,
    deductions: 0,
    filingStatus: "single",
    selfEmployed: true,
  });

  const { data: taxSummary, isLoading: summaryLoading } = trpc.taxModule.getTaxSummary.useQuery({
    year: selectedYear,
  });

  const { data: quarterlyEstimates, isLoading: quarterlyLoading } = trpc.taxModule.getQuarterlyEstimates.useQuery({
    year: selectedYear,
  });

  const { data: contractors } = trpc.taxModule.get1099Payments.useQuery({
    year: selectedYear,
  });

  const { data: projection } = trpc.taxModule.calculateTaxProjection.useQuery(projectionInputs);

  const { data: categories } = trpc.taxModule.getTaxCategories.useQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tax Module</h1>
            <p className="text-muted-foreground">
              Tax planning and estimates powered by LuvLedger
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="summary">Tax Summary</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly Estimates</TabsTrigger>
            <TabsTrigger value="projection">Tax Projection</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {summaryLoading ? (
              <div className="text-center py-8">Loading tax summary...</div>
            ) : taxSummary ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Total Income
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(taxSummary.totalIncome)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {taxSummary.transactionCount} transactions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Total Deductions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(taxSummary.totalDeductions)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Taxable Income
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(taxSummary.taxableIncome)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Estimated Tax
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(taxSummary.totalEstimatedTax)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Effective rate: {formatPercent(taxSummary.effectiveTaxRate)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Tax Breakdown</CardTitle>
                    <CardDescription>
                      Detailed breakdown of estimated taxes for {selectedYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tax Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Federal Income Tax</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(taxSummary.estimatedFederalTax)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Self-Employment Tax (15.3%)</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(taxSummary.selfEmploymentTax)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="font-bold">
                          <TableCell>Total Estimated Tax</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(taxSummary.totalEstimatedTax)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {contractors && contractors.contractors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        1099 Contractor Payments
                      </CardTitle>
                      <CardDescription>
                        Contractors paid {formatCurrency(contractors.totalContractorPayments)} total
                        {" • "}
                        {contractors.contractorsRequiring1099} requiring 1099
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Contractor</TableHead>
                            <TableHead className="text-right">Total Paid</TableHead>
                            <TableHead className="text-center">1099 Required</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contractors.contractors.map((contractor, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{contractor.name}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(contractor.total)}
                              </TableCell>
                              <TableCell className="text-center">
                                {contractor.requires1099 ? (
                                  <Badge variant="destructive">Yes</Badge>
                                ) : (
                                  <Badge variant="secondary">No</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tax data available for {selectedYear}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quarterly" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Quarterly Estimated Tax Payments
                </CardTitle>
                <CardDescription>
                  Track your quarterly estimated tax payments for {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quarterlyLoading ? (
                  <div className="text-center py-8">Loading quarterly estimates...</div>
                ) : quarterlyEstimates ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Income</TableHead>
                        <TableHead className="text-right">Estimated Tax</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quarterlyEstimates.map((quarter) => (
                        <TableRow key={quarter.quarter}>
                          <TableCell className="font-medium">{quarter.quarter}</TableCell>
                          <TableCell>{quarter.period}</TableCell>
                          <TableCell>
                            {format(new Date(quarter.dueDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(quarter.income)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(quarter.estimatedTax)}
                          </TableCell>
                          <TableCell className="text-center">
                            {quarter.isPastDue ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Past Due
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Upcoming
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No quarterly data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                    <Label htmlFor="grossIncome">Gross Income</Label>
                    <Input
                      id="grossIncome"
                      type="number"
                      value={projectionInputs.grossIncome}
                      onChange={(e) =>
                        setProjectionInputs((prev) => ({
                          ...prev,
                          grossIncome: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deductions">Itemized Deductions</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={projectionInputs.deductions}
                      onChange={(e) =>
                        setProjectionInputs((prev) => ({
                          ...prev,
                          deductions: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Filing Status</Label>
                    <Select
                      value={projectionInputs.filingStatus}
                      onValueChange={(v: "single" | "married_joint" | "married_separate" | "head_of_household") =>
                        setProjectionInputs((prev) => ({
                          ...prev,
                          filingStatus: v,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                        <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                        <SelectItem value="head_of_household">Head of Household</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="selfEmployed"
                      checked={projectionInputs.selfEmployed}
                      onChange={(e) =>
                        setProjectionInputs((prev) => ({
                          ...prev,
                          selfEmployed: e.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="selfEmployed">Self-Employed (include SE tax)</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Projection Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projection ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Gross Income</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(projection.grossIncome)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Deductions</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(projection.totalDeductions)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Taxable Income</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(projection.taxableIncome)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Federal Tax</p>
                          <p className="text-lg font-semibold text-red-600">
                            {formatCurrency(projection.federalTax)}
                          </p>
                        </div>
                        {projection.selfEmploymentTax > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground">SE Tax</p>
                            <p className="text-lg font-semibold text-red-600">
                              {formatCurrency(projection.selfEmploymentTax)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">Total Tax</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(projection.totalTax)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Effective Tax Rate</span>
                          <span className="font-semibold">
                            {formatPercent(projection.effectiveRate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Marginal Tax Rate</span>
                          <span className="font-semibold">
                            {formatPercent(projection.marginalRate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Take-Home Pay (Annual)</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(projection.takeHomePay)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Take-Home Pay (Monthly)</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(projection.monthlyTakeHome)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quarterly Estimate</span>
                          <span className="font-semibold">
                            {formatCurrency(projection.quarterlyEstimate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Enter income to calculate projection
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Income Categories</CardTitle>
                  <CardDescription>
                    Types of income and their typical tax treatment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Est. Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories?.income.map((cat) => (
                        <TableRow key={cat.code}>
                          <TableCell>{cat.name}</TableCell>
                          <TableCell className="text-right">
                            {formatPercent(cat.taxRate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Deduction Categories</CardTitle>
                  <CardDescription>
                    Common business deductions for tax planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Max Limit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories?.deductions.map((cat) => (
                        <TableRow key={cat.code}>
                          <TableCell>{cat.name}</TableCell>
                          <TableCell className="text-right">
                            {cat.maxDeduction
                              ? formatCurrency(cat.maxDeduction)
                              : "No limit"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
