import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  XCircle,
  DollarSign,
  Heart,
  Briefcase,
  Home,
  Car,
  Calculator,
  TrendingUp,
  Shield,
  AlertTriangle,
  ArrowRight,
  Building2,
  Wallet,
  PiggyBank,
  Clock,
  FileText,
} from "lucide-react";

export default function BenefitsComparison() {
  const { data: benefits, isLoading } = trpc.workforceDevelopment.getBenefitsComparison.useQuery();

  const benefitLabels: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
    healthInsurance: {
      label: "Health Insurance",
      icon: <Heart className="w-5 h-5" />,
      description: "Medical, dental, and vision coverage",
    },
    retirement: {
      label: "Retirement Savings",
      icon: <PiggyBank className="w-5 h-5" />,
      description: "401k, SEP-IRA, or Solo 401k options",
    },
    pto: {
      label: "Paid Time Off",
      icon: <Clock className="w-5 h-5" />,
      description: "Vacation, sick leave, and personal days",
    },
    equipment: {
      label: "Equipment",
      icon: <Briefcase className="w-5 h-5" />,
      description: "Computer, phone, and work tools",
    },
    homeOffice: {
      label: "Home Office",
      icon: <Home className="w-5 h-5" />,
      description: "Workspace setup and utilities",
    },
    vehicle: {
      label: "Vehicle Expenses",
      icon: <Car className="w-5 h-5" />,
      description: "Business use of personal vehicle",
    },
    taxes: {
      label: "Tax Handling",
      icon: <Calculator className="w-5 h-5" />,
      description: "How taxes are managed and paid",
    },
    incomeCeiling: {
      label: "Income Potential",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Maximum earning capacity",
    },
    unemployment: {
      label: "Unemployment Insurance",
      icon: <Shield className="w-5 h-5" />,
      description: "State unemployment benefits eligibility",
    },
    workersComp: {
      label: "Workers Compensation",
      icon: <AlertTriangle className="w-5 h-5" />,
      description: "Coverage for work-related injuries",
    },
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Benefits Comparison</h1>
          <p className="text-muted-foreground mt-1">
            Understand the differences between employee and contractor status
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Employee (W-2)</CardTitle>
                  <CardDescription>Traditional employment relationship</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Stable, predictable income
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Employer-provided benefits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Taxes withheld automatically
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Limited tax deductions
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Fixed income ceiling
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Contractor (1099)</CardTitle>
                  <CardDescription>Independent business owner</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Unlimited income potential
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Extensive tax deductions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Business asset building
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Self-funded benefits
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Variable income
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Comparison */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">Comparison Table</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Breakdown</TabsTrigger>
            <TabsTrigger value="financial">Financial Impact</TabsTrigger>
          </TabsList>

          {/* Table View */}
          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Side-by-Side Comparison</CardTitle>
                <CardDescription>
                  Compare benefits between employee and contractor status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Benefit</TableHead>
                      <TableHead>Employee (W-2)</TableHead>
                      <TableHead>Contractor (1099)</TableHead>
                      <TableHead className="w-[100px]">Tax Deductible</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benefits && Object.entries(benefits.employee).map(([key, empValue]) => {
                      const contValue = benefits.contractor[key as keyof typeof benefits.contractor];
                      const labelInfo = benefitLabels[key];
                      
                      return (
                        <TableRow key={key}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="text-muted-foreground">
                                {labelInfo?.icon}
                              </div>
                              <div>
                                <p className="font-medium">{labelInfo?.label || key}</p>
                                <p className="text-xs text-muted-foreground">{labelInfo?.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{empValue.value}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{contValue.value}</span>
                          </TableCell>
                          <TableCell>
                            {contValue.taxDeductible ? (
                              <Badge className="bg-green-100 text-green-800">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Breakdown */}
          <TabsContent value="detailed">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {benefits && Object.entries(benefits.employee).map(([key, empValue]) => {
                const contValue = benefits.contractor[key as keyof typeof benefits.contractor];
                const labelInfo = benefitLabels[key];
                
                return (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {labelInfo?.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{labelInfo?.label || key}</CardTitle>
                          <CardDescription>{labelInfo?.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-xs font-medium text-blue-600 mb-1">As Employee</p>
                          <p className="text-sm text-foreground">{empValue.value}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                          <p className="text-xs font-medium text-green-600 mb-1">As Contractor</p>
                          <p className="text-sm text-foreground">{contValue.value}</p>
                          {contValue.taxDeductible && (
                            <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Tax Deductible
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Financial Impact */}
          <TabsContent value="financial">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Financial Impact Analysis
                  </CardTitle>
                  <CardDescription>
                    Understanding the true cost and benefits of each status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tax Deduction Potential */}
                  <div>
                    <h4 className="font-semibold mb-3">Contractor Tax Deduction Potential</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { item: "Home Office", range: "$1,500 - $5,000/year" },
                        { item: "Health Insurance", range: "100% of premiums" },
                        { item: "Retirement Contributions", range: "Up to $69,000/year (2024)" },
                        { item: "Vehicle (Business Use)", range: "$0.67/mile (2024)" },
                        { item: "Equipment & Software", range: "100% in year purchased" },
                        { item: "Professional Development", range: "100% deductible" },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-green-50 border border-green-100">
                          <p className="text-sm font-medium">{item.item}</p>
                          <p className="text-xs text-green-700">{item.range}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example Scenario */}
                  <div>
                    <h4 className="font-semibold mb-3">Example: $75,000 Annual Income</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-blue-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Employee Scenario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Gross Income</span>
                            <span className="font-medium">$75,000</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Standard Deduction</span>
                            <span>-$14,600</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxable Income</span>
                            <span className="font-medium">$60,400</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Est. Federal Tax</span>
                            <span>~$8,700</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>FICA (7.65%)</span>
                            <span>~$5,740</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Net After Tax</span>
                            <span>~$60,560</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Contractor Scenario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Gross Income</span>
                            <span className="font-medium">$75,000</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Business Deductions</span>
                            <span>-$15,000</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>SEP-IRA Contribution</span>
                            <span>-$12,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxable Income</span>
                            <span className="font-medium">$48,000</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Est. Federal Tax</span>
                            <span>~$5,600</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Self-Employment Tax</span>
                            <span>~$8,500</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>Net + Retirement</span>
                            <span>~$60,900 + $12,000</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * This is a simplified example. Actual tax situations vary. Consult a tax professional.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Key Considerations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Key Considerations Before Transitioning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Advantages of Transitioning</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Build equity in your own business</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Higher retirement contribution limits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Flexibility to work with multiple clients</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Pass business to heirs as legacy asset</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Control over schedule and work style</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-700 mb-2">Challenges to Prepare For</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Must manage quarterly tax payments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Self-funded health insurance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>No unemployment insurance eligibility</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Variable income requires budgeting discipline</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Responsible for business administration</span>
                        </li>
                      </ul>
                    </div>
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
