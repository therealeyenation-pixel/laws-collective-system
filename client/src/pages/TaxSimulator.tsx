import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Calculator,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  Receipt,
  Briefcase,
  FileCheck,
  Bell,
  ChevronRight,
  Info,
} from "lucide-react";

type FilingStatus = "single" | "married_filing_jointly" | "married_filing_separately" | "head_of_household";

interface TaxSummary {
  grossIncome: number;
  adjustments: number;
  agi: number;
  deductions: number;
  taxableIncome: number;
  federalTax: number;
  selfEmploymentTax: number;
  totalTax: number;
  withholdings: number;
  estimatedPayments: number;
  balanceDue: number;
}

export default function TaxSimulator() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  
  // Income inputs
  const [w2Income, setW2Income] = useState(0);
  const [businessIncome, setBusinessIncome] = useState(0);
  const [investmentIncome, setInvestmentIncome] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  
  // Deduction inputs
  const [useItemized, setUseItemized] = useState(false);
  const [itemizedDeductions, setItemizedDeductions] = useState(0);
  
  // Payment inputs
  const [withholdings, setWithholdings] = useState(0);
  const [estimatedPayments, setEstimatedPayments] = useState(0);

  // API calls
  const taxReturnsQuery = trpc.taxPrep.getTaxReturns.useQuery();
  const taxDeadlinesQuery = trpc.taxPrep.getTaxDeadlines.useQuery({ taxYear: selectedYear });
  
  const calculateTaxMutation = trpc.taxPrep.calculateTax.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createTaxReturnMutation = trpc.taxPrep.createTaxReturn.useMutation({
    onSuccess: () => {
      toast.success("Tax return created");
      taxReturnsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Standard deductions for 2024
  const standardDeductions: Record<FilingStatus, number> = {
    single: 14600,
    married_filing_jointly: 29200,
    married_filing_separately: 14600,
    head_of_household: 21900,
  };

  // Calculate tax summary
  const taxSummary = useMemo((): TaxSummary => {
    const grossIncome = w2Income + businessIncome + investmentIncome + otherIncome;
    const selfEmploymentTax = businessIncome > 0 ? businessIncome * 0.153 : 0;
    const adjustments = selfEmploymentTax * 0.5; // 50% of SE tax is deductible
    const agi = grossIncome - adjustments;
    
    const standardDeduction = standardDeductions[filingStatus];
    const deductions = useItemized ? Math.max(itemizedDeductions, standardDeduction) : standardDeduction;
    const taxableIncome = Math.max(0, agi - deductions);
    
    // Simplified tax calculation (2024 brackets for single)
    let federalTax = 0;
    if (filingStatus === "single" || filingStatus === "married_filing_separately") {
      if (taxableIncome <= 11600) federalTax = taxableIncome * 0.10;
      else if (taxableIncome <= 47150) federalTax = 1160 + (taxableIncome - 11600) * 0.12;
      else if (taxableIncome <= 100525) federalTax = 5426 + (taxableIncome - 47150) * 0.22;
      else if (taxableIncome <= 191950) federalTax = 17168.50 + (taxableIncome - 100525) * 0.24;
      else if (taxableIncome <= 243725) federalTax = 39110.50 + (taxableIncome - 191950) * 0.32;
      else if (taxableIncome <= 609350) federalTax = 55678.50 + (taxableIncome - 243725) * 0.35;
      else federalTax = 183647.25 + (taxableIncome - 609350) * 0.37;
    } else if (filingStatus === "married_filing_jointly") {
      if (taxableIncome <= 23200) federalTax = taxableIncome * 0.10;
      else if (taxableIncome <= 94300) federalTax = 2320 + (taxableIncome - 23200) * 0.12;
      else if (taxableIncome <= 201050) federalTax = 10852 + (taxableIncome - 94300) * 0.22;
      else if (taxableIncome <= 383900) federalTax = 34337 + (taxableIncome - 201050) * 0.24;
      else if (taxableIncome <= 487450) federalTax = 78221 + (taxableIncome - 383900) * 0.32;
      else if (taxableIncome <= 731200) federalTax = 111357 + (taxableIncome - 487450) * 0.35;
      else federalTax = 196669.50 + (taxableIncome - 731200) * 0.37;
    } else { // head_of_household
      if (taxableIncome <= 16550) federalTax = taxableIncome * 0.10;
      else if (taxableIncome <= 63100) federalTax = 1655 + (taxableIncome - 16550) * 0.12;
      else if (taxableIncome <= 100500) federalTax = 7241 + (taxableIncome - 63100) * 0.22;
      else if (taxableIncome <= 191950) federalTax = 15469 + (taxableIncome - 100500) * 0.24;
      else if (taxableIncome <= 243700) federalTax = 37417 + (taxableIncome - 191950) * 0.32;
      else if (taxableIncome <= 609350) federalTax = 53977 + (taxableIncome - 243700) * 0.35;
      else federalTax = 181954.50 + (taxableIncome - 609350) * 0.37;
    }
    
    const totalTax = federalTax + selfEmploymentTax;
    const totalPayments = withholdings + estimatedPayments;
    const balanceDue = totalTax - totalPayments;
    
    return {
      grossIncome,
      adjustments,
      agi,
      deductions,
      taxableIncome,
      federalTax,
      selfEmploymentTax,
      totalTax,
      withholdings,
      estimatedPayments,
      balanceDue,
    };
  }, [w2Income, businessIncome, investmentIncome, otherIncome, filingStatus, useItemized, itemizedDeductions, withholdings, estimatedPayments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const effectiveTaxRate = taxSummary.grossIncome > 0 
    ? ((taxSummary.totalTax / taxSummary.grossIncome) * 100).toFixed(1)
    : "0.0";

  // Upcoming deadlines
  const upcomingDeadlines = taxDeadlinesQuery.data?.deadlines
    ?.filter((d) => new Date(d.date) >= new Date())
    .slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tax Preparation Simulator</h1>
            <p className="text-muted-foreground">
              Calculate taxes, track documents, and prepare filings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => createTaxReturnMutation.mutate({ taxYear: selectedYear, filingStatus })}
              disabled={createTaxReturnMutation.isPending}
            >
              <FileText className="w-4 h-4 mr-2" />
              New Return
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(taxSummary.grossIncome)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tax</p>
                  <p className="text-2xl font-bold">{formatCurrency(taxSummary.totalTax)}</p>
                </div>
                <Calculator className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Effective Rate</p>
                  <p className="text-2xl font-bold">{effectiveTaxRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {taxSummary.balanceDue >= 0 ? "Balance Due" : "Refund"}
                  </p>
                  <p className={`text-2xl font-bold ${taxSummary.balanceDue >= 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(Math.abs(taxSummary.balanceDue))}
                  </p>
                </div>
                {taxSummary.balanceDue >= 0 ? (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="contractors">1099s</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tax Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tax Summary</CardTitle>
                  <CardDescription>Your {selectedYear} tax calculation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Income</span>
                      <span className="font-medium">{formatCurrency(taxSummary.grossIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adjustments</span>
                      <span className="font-medium">-{formatCurrency(taxSummary.adjustments)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Adjusted Gross Income</span>
                      <span className="font-bold">{formatCurrency(taxSummary.agi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {useItemized ? "Itemized" : "Standard"} Deduction
                      </span>
                      <span className="font-medium">-{formatCurrency(taxSummary.deductions)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Taxable Income</span>
                      <span className="font-bold">{formatCurrency(taxSummary.taxableIncome)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Federal Income Tax</span>
                      <span className="font-medium">{formatCurrency(taxSummary.federalTax)}</span>
                    </div>
                    {taxSummary.selfEmploymentTax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Self-Employment Tax</span>
                        <span className="font-medium">{formatCurrency(taxSummary.selfEmploymentTax)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-medium">Total Tax</span>
                      <span className="font-bold text-lg">{formatCurrency(taxSummary.totalTax)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Withholdings</span>
                      <span className="font-medium text-green-600">-{formatCurrency(taxSummary.withholdings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Payments</span>
                      <span className="font-medium text-green-600">-{formatCurrency(taxSummary.estimatedPayments)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-bold">
                        {taxSummary.balanceDue >= 0 ? "Amount Owed" : "Refund Due"}
                      </span>
                      <span className={`font-bold text-xl ${taxSummary.balanceDue >= 0 ? "text-red-600" : "text-green-600"}`}>
                        {formatCurrency(Math.abs(taxSummary.balanceDue))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingDeadlines.length > 0 ? (
                      upcomingDeadlines.map((deadline, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                          <div className="flex-shrink-0">
                            <Badge variant={deadline.type === "payment" ? "destructive" : "secondary"}>
                              {deadline.form}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{deadline.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(deadline.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming deadlines
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filing Status */}
            <Card>
              <CardHeader>
                <CardTitle>Filing Status</CardTitle>
                <CardDescription>Select your tax filing status for {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: "single", label: "Single", icon: Users },
                    { value: "married_filing_jointly", label: "Married Filing Jointly", icon: Users },
                    { value: "married_filing_separately", label: "Married Filing Separately", icon: Users },
                    { value: "head_of_household", label: "Head of Household", icon: Building2 },
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setFilingStatus(status.value as FilingStatus)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        filingStatus === status.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <status.icon className={`w-6 h-6 mx-auto mb-2 ${
                        filingStatus === status.value ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className={`text-sm font-medium text-center ${
                        filingStatus === status.value ? "text-primary" : "text-foreground"
                      }`}>
                        {status.label}
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        Std. Ded: {formatCurrency(standardDeductions[status.value as FilingStatus])}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* W-2 Income */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    W-2 Employment Income
                  </CardTitle>
                  <CardDescription>Wages, salaries, and tips from employers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="w2Income">Total W-2 Income</Label>
                    <Input
                      id="w2Income"
                      type="number"
                      value={w2Income || ""}
                      onChange={(e) => setW2Income(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="withholdings">Federal Tax Withheld</Label>
                    <Input
                      id="withholdings"
                      type="number"
                      value={withholdings || ""}
                      onChange={(e) => setWithholdings(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      W-2 income is pulled from payroll records in LuvLedger when available.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Business Income */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Income (Schedule C)
                  </CardTitle>
                  <CardDescription>Self-employment and business profits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessIncome">Net Business Income</Label>
                    <Input
                      id="businessIncome"
                      type="number"
                      value={businessIncome || ""}
                      onChange={(e) => setBusinessIncome(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  {businessIncome > 0 && (
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm font-medium">Self-Employment Tax</p>
                      <p className="text-lg font-bold text-amber-600">
                        {formatCurrency(businessIncome * 0.153)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        15.3% (12.4% Social Security + 2.9% Medicare)
                      </p>
                    </div>
                  )}
                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      Business income is aggregated from your entity transactions in LuvLedger.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Investment Income */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Investment Income
                  </CardTitle>
                  <CardDescription>Interest, dividends, and capital gains</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="investmentIncome">Total Investment Income</Label>
                    <Input
                      id="investmentIncome"
                      type="number"
                      value={investmentIncome || ""}
                      onChange={(e) => setInvestmentIncome(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Other Income */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Other Income
                  </CardTitle>
                  <CardDescription>Rental, royalties, and miscellaneous</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="otherIncome">Total Other Income</Label>
                    <Input
                      id="otherIncome"
                      type="number"
                      value={otherIncome || ""}
                      onChange={(e) => setOtherIncome(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedPayments">Estimated Tax Payments Made</Label>
                    <Input
                      id="estimatedPayments"
                      type="number"
                      value={estimatedPayments || ""}
                      onChange={(e) => setEstimatedPayments(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deductions Tab */}
          <TabsContent value="deductions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deduction Method</CardTitle>
                <CardDescription>Choose standard or itemized deductions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setUseItemized(false)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      !useItemized
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <CheckCircle2 className={`w-8 h-8 mx-auto mb-3 ${
                      !useItemized ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium text-center">Standard Deduction</p>
                    <p className="text-2xl font-bold text-center mt-2">
                      {formatCurrency(standardDeductions[filingStatus])}
                    </p>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Recommended for most filers
                    </p>
                  </button>
                  <button
                    onClick={() => setUseItemized(true)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      useItemized
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Receipt className={`w-8 h-8 mx-auto mb-3 ${
                      useItemized ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <p className="font-medium text-center">Itemized Deductions</p>
                    <p className="text-2xl font-bold text-center mt-2">
                      {formatCurrency(itemizedDeductions)}
                    </p>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      If you have significant deductible expenses
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {useItemized && (
              <Card>
                <CardHeader>
                  <CardTitle>Itemized Deductions</CardTitle>
                  <CardDescription>Enter your deductible expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Mortgage Interest</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label>Property Taxes</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label>State/Local Taxes (SALT)</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label>Charitable Donations</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label>Medical Expenses (above 7.5% AGI)</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label>Other Deductions</Label>
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={itemizedDeductions || ""}
                        onChange={(e) => setItemizedDeductions(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertTitle>SALT Cap</AlertTitle>
                    <AlertDescription>
                      State and local tax deductions are capped at $10,000 ($5,000 if married filing separately).
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Personal Forms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Personal Forms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { code: "1040", name: "Individual Tax Return" },
                      { code: "Schedule A", name: "Itemized Deductions" },
                      { code: "Schedule B", name: "Interest & Dividends" },
                      { code: "Schedule D", name: "Capital Gains" },
                    ].map((form) => (
                      <div key={form.code} className="flex items-center justify-between p-2 rounded hover:bg-secondary/50">
                        <div>
                          <p className="font-medium">{form.code}</p>
                          <p className="text-xs text-muted-foreground">{form.name}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Business Forms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Forms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { code: "Schedule C", name: "Business Profit/Loss" },
                      { code: "Schedule SE", name: "Self-Employment Tax" },
                      { code: "1120-S", name: "S-Corp Return" },
                      { code: "1065", name: "Partnership Return" },
                      { code: "1041", name: "Trust/Estate Return" },
                    ].map((form) => (
                      <div key={form.code} className="flex items-center justify-between p-2 rounded hover:bg-secondary/50">
                        <div>
                          <p className="font-medium">{form.code}</p>
                          <p className="text-xs text-muted-foreground">{form.name}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Employment Forms */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Employment Forms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { code: "W-2", name: "Wage Statement" },
                      { code: "W-4", name: "Withholding Certificate" },
                      { code: "1099-NEC", name: "Contractor Compensation" },
                      { code: "1099-MISC", name: "Miscellaneous Income" },
                      { code: "W-9", name: "Taxpayer ID Request" },
                    ].map((form) => (
                      <div key={form.code} className="flex items-center justify-between p-2 rounded hover:bg-secondary/50">
                        <div>
                          <p className="font-medium">{form.code}</p>
                          <p className="text-xs text-muted-foreground">{form.name}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Tax Documents
                </CardTitle>
                <CardDescription>
                  Upload W-2s, 1099s, and other tax documents from Document Vault
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <Button variant="outline">
                    Select from Document Vault
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 1099 Contractors Tab */}
          <TabsContent value="contractors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contractor 1099 Management
                </CardTitle>
                <CardDescription>
                  Track contractor payments and generate 1099-NEC forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Info className="w-4 h-4" />
                  <AlertTitle>1099-NEC Requirement</AlertTitle>
                  <AlertDescription>
                    You must issue a 1099-NEC to any contractor paid $600 or more during the tax year.
                    Forms must be sent to recipients by January 31.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {/* Contractor List Placeholder */}
                  <div className="border rounded-lg">
                    <div className="p-4 border-b bg-secondary/30">
                      <div className="grid grid-cols-5 gap-4 text-sm font-medium">
                        <span>Contractor</span>
                        <span>W-9 Status</span>
                        <span>YTD Payments</span>
                        <span>1099 Status</span>
                        <span>Actions</span>
                      </div>
                    </div>
                    <div className="p-8 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No contractors found</p>
                      <p className="text-sm">Contractor payments will appear here from your contracts</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate All 1099s
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Summary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Renewals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Contract Renewal Reminders
                </CardTitle>
                <CardDescription>
                  Upcoming contract expirations requiring renewal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming renewals</p>
                    <p className="text-sm">Contract renewal reminders will appear 30/60/90 days before expiration</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Tax Calendar {selectedYear}
                </CardTitle>
                <CardDescription>
                  Important tax deadlines and filing dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxDeadlinesQuery.data?.deadlines?.map((deadline, idx) => {
                    const deadlineDate = new Date(deadline.date);
                    const isPast = deadlineDate < new Date();
                    const isUpcoming = !isPast && deadlineDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          isPast
                            ? "bg-secondary/30 opacity-60"
                            : isUpcoming
                            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                            : "bg-background"
                        }`}
                      >
                        <div className="flex-shrink-0 text-center">
                          <p className="text-2xl font-bold">
                            {deadlineDate.getDate()}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {deadlineDate.toLocaleDateString("en-US", { month: "short" })}
                          </p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                deadline.type === "payment"
                                  ? "destructive"
                                  : deadline.type === "business"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {deadline.form}
                            </Badge>
                            {isPast && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Past
                              </Badge>
                            )}
                            {isUpcoming && !isPast && (
                              <Badge variant="outline" className="text-xs text-amber-600">
                                <Clock className="w-3 h-3 mr-1" />
                                Upcoming
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{deadline.description}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="flex-shrink-0">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Estimated Tax Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Estimated Tax Payments</CardTitle>
                <CardDescription>
                  Required if you expect to owe $1,000+ in taxes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { quarter: "Q1", due: "April 15", period: "Jan 1 - Mar 31" },
                    { quarter: "Q2", due: "June 15", period: "Apr 1 - May 31" },
                    { quarter: "Q3", due: "Sept 15", period: "Jun 1 - Aug 31" },
                    { quarter: "Q4", due: "Jan 15", period: "Sep 1 - Dec 31" },
                  ].map((q) => (
                    <Card key={q.quarter}>
                      <CardContent className="pt-6">
                        <p className="text-lg font-bold text-center">{q.quarter}</p>
                        <p className="text-sm text-muted-foreground text-center">{q.period}</p>
                        <Separator className="my-3" />
                        <p className="text-center">
                          <span className="text-xs text-muted-foreground">Due: </span>
                          <span className="font-medium">{q.due}</span>
                        </p>
                        <p className="text-xl font-bold text-center mt-2">
                          {formatCurrency(Math.max(0, taxSummary.balanceDue / 4))}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
