import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  Wallet,
  Building2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

/**
 * Financial Statements Generator
 * 
 * Generates formal financial statements for grant applications:
 * - Balance Sheet
 * - Income Statement / P&L
 * - Cash Flow Statement
 * 
 * Supports $0/startup state for new entities.
 */

export default function FinancialStatements() {
  const [activeTab, setActiveTab] = useState("startup");
  const [entityName, setEntityName] = useState("The The L.A.W.S. Collective, LLC");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialCapital, setInitialCapital] = useState(0);
  const [generatedStatements, setGeneratedStatements] = useState<any>(null);

  const generateStartupMutation = trpc.financialStatements.generateStartupStatements.useMutation({
    onSuccess: (data) => {
      setGeneratedStatements(data);
      toast.success("Financial statements generated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to generate statements: ${error.message}`);
    },
  });

  const handleGenerateStartup = () => {
    generateStartupMutation.mutate({
      entityName,
      asOfDate,
      initialCapital,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderBalanceSheet = (data: any) => {
    if (!data) return null;
    const { assets, liabilities, equity, totals } = data.data;

    return (
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{data.entityName}</CardTitle>
              <CardDescription>Balance Sheet as of {data.asOfDate}</CardDescription>
            </div>
            <Badge variant={data.isBalanced ? "default" : "destructive"} className="gap-1">
              {data.isBalanced ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {data.isBalanced ? "Balanced" : "Unbalanced"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets */}
            <div>
              <h3 className="font-bold text-lg mb-4 border-b pb-2">ASSETS</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Current Assets</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Cash</span><span>{formatCurrency(assets.current.cash)}</span></div>
                  <div className="flex justify-between"><span>Accounts Receivable</span><span>{formatCurrency(assets.current.accountsReceivable)}</span></div>
                  <div className="flex justify-between"><span>Inventory</span><span>{formatCurrency(assets.current.inventory)}</span></div>
                  <div className="flex justify-between"><span>Prepaid Expenses</span><span>{formatCurrency(assets.current.prepaidExpenses)}</span></div>
                  <div className="flex justify-between"><span>Other Current Assets</span><span>{formatCurrency(assets.current.otherCurrentAssets)}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-1"><span>Total Current Assets</span><span>{formatCurrency(totals.totalCurrentAssets)}</span></div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Fixed Assets</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Equipment</span><span>{formatCurrency(assets.fixed.equipment)}</span></div>
                  <div className="flex justify-between"><span>Furniture</span><span>{formatCurrency(assets.fixed.furniture)}</span></div>
                  <div className="flex justify-between"><span>Vehicles</span><span>{formatCurrency(assets.fixed.vehicles)}</span></div>
                  <div className="flex justify-between"><span>Less: Accumulated Depreciation</span><span>({formatCurrency(assets.fixed.accumulatedDepreciation)})</span></div>
                  <div className="flex justify-between font-semibold border-t pt-1"><span>Total Fixed Assets</span><span>{formatCurrency(totals.totalFixedAssets)}</span></div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Other Assets</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Intangible Assets</span><span>{formatCurrency(assets.other.intangibleAssets)}</span></div>
                  <div className="flex justify-between"><span>Investments</span><span>{formatCurrency(assets.other.investments)}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-1"><span>Total Other Assets</span><span>{formatCurrency(totals.totalOtherAssets)}</span></div>
                </div>
              </div>

              <div className="bg-primary/10 p-3 rounded-lg">
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL ASSETS</span>
                  <span>{formatCurrency(totals.totalAssets)}</span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              <h3 className="font-bold text-lg mb-4 border-b pb-2">LIABILITIES & EQUITY</h3>
              
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Current Liabilities</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Accounts Payable</span><span>{formatCurrency(liabilities.current.accountsPayable)}</span></div>
                  <div className="flex justify-between"><span>Accrued Expenses</span><span>{formatCurrency(liabilities.current.accruedExpenses)}</span></div>
                  <div className="flex justify-between"><span>Short-Term Debt</span><span>{formatCurrency(liabilities.current.shortTermDebt)}</span></div>
                  <div className="flex justify-between"><span>Deferred Revenue</span><span>{formatCurrency(liabilities.current.deferredRevenue)}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-1"><span>Total Current Liabilities</span><span>{formatCurrency(totals.totalCurrentLiabilities)}</span></div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Long-Term Liabilities</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Long-Term Debt</span><span>{formatCurrency(liabilities.longTerm.longTermDebt)}</span></div>
                  <div className="flex justify-between"><span>Notes Payable</span><span>{formatCurrency(liabilities.longTerm.notesPayable)}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-1"><span>Total Long-Term Liabilities</span><span>{formatCurrency(totals.totalLongTermLiabilities)}</span></div>
                </div>
              </div>

              <div className="mb-4 bg-muted/30 p-3 rounded">
                <div className="flex justify-between font-semibold">
                  <span>TOTAL LIABILITIES</span>
                  <span>{formatCurrency(totals.totalLiabilities)}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Equity</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Owner's Capital</span><span>{formatCurrency(equity.ownerCapital)}</span></div>
                  <div className="flex justify-between"><span>Retained Earnings</span><span>{formatCurrency(equity.retainedEarnings)}</span></div>
                  <div className="flex justify-between"><span>Current Year Earnings</span><span>{formatCurrency(equity.currentYearEarnings)}</span></div>
                  <div className="flex justify-between font-semibold border-t pt-1"><span>Total Equity</span><span>{formatCurrency(totals.totalEquity)}</span></div>
                </div>
              </div>

              <div className="bg-primary/10 p-3 rounded-lg">
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span>{formatCurrency(totals.totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderIncomeStatement = (data: any) => {
    if (!data) return null;
    const { revenue, costOfGoodsSold, operatingExpenses, otherIncomeExpense, totals } = data.data;

    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">{data.entityName}</CardTitle>
          <CardDescription>Income Statement for period {data.periodStart} to {data.periodEnd}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="max-w-xl mx-auto space-y-4">
            {/* Revenue */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">REVENUE</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Sales Revenue</span><span>{formatCurrency(revenue.salesRevenue)}</span></div>
                <div className="flex justify-between"><span>Service Revenue</span><span>{formatCurrency(revenue.serviceRevenue)}</span></div>
                <div className="flex justify-between"><span>Grant Revenue</span><span>{formatCurrency(revenue.grantRevenue)}</span></div>
                <div className="flex justify-between"><span>Donation Revenue</span><span>{formatCurrency(revenue.donationRevenue)}</span></div>
                <div className="flex justify-between"><span>Other Revenue</span><span>{formatCurrency(revenue.otherRevenue)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total Revenue</span><span>{formatCurrency(totals.totalRevenue)}</span></div>
              </div>
            </div>

            {/* COGS */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">COST OF GOODS SOLD</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Direct Labor</span><span>{formatCurrency(costOfGoodsSold.directLabor)}</span></div>
                <div className="flex justify-between"><span>Materials</span><span>{formatCurrency(costOfGoodsSold.materials)}</span></div>
                <div className="flex justify-between"><span>Other COGS</span><span>{formatCurrency(costOfGoodsSold.otherCOGS)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total COGS</span><span>{formatCurrency(totals.totalCOGS)}</span></div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
              <div className="flex justify-between font-semibold">
                <span>GROSS PROFIT</span>
                <span>{formatCurrency(totals.grossProfit)} ({totals.grossProfitMargin}%)</span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">OPERATING EXPENSES</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Salaries & Wages</span><span>{formatCurrency(operatingExpenses.salaries)}</span></div>
                <div className="flex justify-between"><span>Rent</span><span>{formatCurrency(operatingExpenses.rent)}</span></div>
                <div className="flex justify-between"><span>Utilities</span><span>{formatCurrency(operatingExpenses.utilities)}</span></div>
                <div className="flex justify-between"><span>Insurance</span><span>{formatCurrency(operatingExpenses.insurance)}</span></div>
                <div className="flex justify-between"><span>Marketing</span><span>{formatCurrency(operatingExpenses.marketing)}</span></div>
                <div className="flex justify-between"><span>Professional Fees</span><span>{formatCurrency(operatingExpenses.professionalFees)}</span></div>
                <div className="flex justify-between"><span>Depreciation</span><span>{formatCurrency(operatingExpenses.depreciation)}</span></div>
                <div className="flex justify-between"><span>Other Operating</span><span>{formatCurrency(operatingExpenses.otherOperating)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total Operating Expenses</span><span>{formatCurrency(totals.totalOperatingExpenses)}</span></div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded">
              <div className="flex justify-between font-semibold">
                <span>OPERATING INCOME</span>
                <span>{formatCurrency(totals.operatingIncome)} ({totals.operatingMargin}%)</span>
              </div>
            </div>

            {/* Other Income/Expense */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">OTHER INCOME/EXPENSE</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Interest Income</span><span>{formatCurrency(otherIncomeExpense.interestIncome)}</span></div>
                <div className="flex justify-between"><span>Interest Expense</span><span>({formatCurrency(otherIncomeExpense.interestExpense)})</span></div>
                <div className="flex justify-between"><span>Other Income</span><span>{formatCurrency(otherIncomeExpense.otherIncome)}</span></div>
                <div className="flex justify-between"><span>Other Expense</span><span>({formatCurrency(otherIncomeExpense.otherExpense)})</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Net Other Income/Expense</span><span>{formatCurrency(totals.netOtherIncomeExpense)}</span></div>
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex justify-between font-bold text-lg">
                <span>NET INCOME</span>
                <span className={totals.netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(totals.netIncome)} ({totals.netProfitMargin}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCashFlow = (data: any) => {
    if (!data) return null;
    const { beginningCash, operating, investing, financing, totals } = data.data;

    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">{data.entityName}</CardTitle>
          <CardDescription>Cash Flow Statement for period {data.periodStart} to {data.periodEnd}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-muted/30 p-3 rounded">
              <div className="flex justify-between font-semibold">
                <span>Beginning Cash Balance</span>
                <span>{formatCurrency(beginningCash)}</span>
              </div>
            </div>

            {/* Operating Activities */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">CASH FROM OPERATING ACTIVITIES</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Net Income</span><span>{formatCurrency(operating.netIncome)}</span></div>
                <div className="flex justify-between"><span>Add: Depreciation</span><span>{formatCurrency(operating.depreciation)}</span></div>
                <div className="flex justify-between"><span>Change in Accounts Receivable</span><span>{formatCurrency(-operating.accountsReceivableChange)}</span></div>
                <div className="flex justify-between"><span>Change in Inventory</span><span>{formatCurrency(-operating.inventoryChange)}</span></div>
                <div className="flex justify-between"><span>Change in Accounts Payable</span><span>{formatCurrency(operating.accountsPayableChange)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1 text-blue-600">
                  <span>Net Cash from Operating</span>
                  <span>{formatCurrency(totals.cashFromOperating)}</span>
                </div>
              </div>
            </div>

            {/* Investing Activities */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">CASH FROM INVESTING ACTIVITIES</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Equipment Purchases</span><span>({formatCurrency(investing.equipmentPurchases)})</span></div>
                <div className="flex justify-between"><span>Equipment Sales</span><span>{formatCurrency(investing.equipmentSales)}</span></div>
                <div className="flex justify-between"><span>Investment Purchases</span><span>({formatCurrency(investing.investmentPurchases)})</span></div>
                <div className="flex justify-between"><span>Investment Sales</span><span>{formatCurrency(investing.investmentSales)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1 text-purple-600">
                  <span>Net Cash from Investing</span>
                  <span>{formatCurrency(totals.cashFromInvesting)}</span>
                </div>
              </div>
            </div>

            {/* Financing Activities */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">CASH FROM FINANCING ACTIVITIES</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Owner Contributions</span><span>{formatCurrency(financing.ownerContributions)}</span></div>
                <div className="flex justify-between"><span>Owner Distributions</span><span>({formatCurrency(financing.ownerDistributions)})</span></div>
                <div className="flex justify-between"><span>Loan Proceeds</span><span>{formatCurrency(financing.loanProceeds)}</span></div>
                <div className="flex justify-between"><span>Loan Payments</span><span>({formatCurrency(financing.loanPayments)})</span></div>
                <div className="flex justify-between font-semibold border-t pt-1 text-green-600">
                  <span>Net Cash from Financing</span>
                  <span>{formatCurrency(totals.cashFromFinancing)}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded">
              <div className="flex justify-between font-semibold">
                <span>Net Change in Cash</span>
                <span className={totals.netChangeInCash >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(totals.netChangeInCash)}
                </span>
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex justify-between font-bold text-lg">
                <span>ENDING CASH BALANCE</span>
                <span>{formatCurrency(totals.endingCash)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Statements</h1>
            <p className="text-muted-foreground">
              Generate formal financial statements for grant applications
            </p>
          </div>
          {generatedStatements && (
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="startup" className="gap-2">
              <Building2 className="w-4 h-4" />
              Startup ($0)
            </TabsTrigger>
            <TabsTrigger value="balance" className="gap-2">
              <Wallet className="w-4 h-4" />
              Balance Sheet
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Income Statement
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Cash Flow
            </TabsTrigger>
          </TabsList>

          {/* Startup Generator */}
          <TabsContent value="startup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Startup Financial Statements</CardTitle>
                <CardDescription>
                  Create formal financial statements for a new entity with $0 or minimal activity.
                  Perfect for grant applications when you're just starting out.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entityName">Entity Name</Label>
                    <Input
                      id="entityName"
                      value={entityName}
                      onChange={(e) => setEntityName(e.target.value)}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asOfDate">As of Date</Label>
                    <Input
                      id="asOfDate"
                      type="date"
                      value={asOfDate}
                      onChange={(e) => setAsOfDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initialCapital">Initial Capital (if any)</Label>
                    <Input
                      id="initialCapital"
                      type="number"
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateStartup}
                  disabled={generateStartupMutation.isPending}
                  className="gap-2"
                >
                  {generateStartupMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Generate All Statements
                </Button>
              </CardContent>
            </Card>

            {/* Generated Statements */}
            {generatedStatements && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Generated on {new Date(generatedStatements.balanceSheet.generatedAt).toLocaleString()}</span>
                  {generatedStatements.isStartup && (
                    <Badge variant="secondary">Startup/Zero Activity</Badge>
                  )}
                </div>

                {renderBalanceSheet(generatedStatements.balanceSheet)}
                {renderIncomeStatement(generatedStatements.incomeStatement)}
                {renderCashFlow(generatedStatements.cashFlow)}
              </div>
            )}
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Balance Sheet</CardTitle>
                <CardDescription>
                  Enter your actual financial data to generate a detailed balance sheet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For custom balance sheets with actual data, use the Startup generator first, 
                  then modify the values as needed. Full custom entry form coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Statement Tab */}
          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Income Statement</CardTitle>
                <CardDescription>
                  Enter revenue and expense data to generate a profit & loss statement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For custom income statements with actual data, use the Startup generator first, 
                  then modify the values as needed. Full custom entry form coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cashflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Cash Flow Statement</CardTitle>
                <CardDescription>
                  Track cash movements from operating, investing, and financing activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For custom cash flow statements with actual data, use the Startup generator first, 
                  then modify the values as needed. Full custom entry form coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
