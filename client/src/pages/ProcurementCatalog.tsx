import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Package, Heart, DollarSign, Building2, Calculator } from "lucide-react";

export default function ProcurementCatalog() {
  const [selectedTier, setSelectedTier] = useState<"specialist" | "coordinator" | "manager" | "director" | "executive">("manager");
  const [sampleSalary, setSampleSalary] = useState(108000);

  const { data: equipmentPackages, isLoading: loadingEquipment } = trpc.procurementCatalog.getEquipmentPackages.useQuery();
  const { data: benefitsPackages, isLoading: loadingBenefits } = trpc.procurementCatalog.getBenefitsPackages.useQuery();
  const { data: startupCosts, isLoading: loadingStartup } = trpc.procurementCatalog.getStartupCosts.useQuery();
  const { data: vendorCategories, isLoading: loadingVendors } = trpc.procurementCatalog.getVendorCategories.useQuery();
  const { data: packageCost } = trpc.procurementCatalog.calculatePackageCost.useQuery({
    tier: selectedTier,
    annualSalary: sampleSalary,
  });

  const isLoading = loadingEquipment || loadingBenefits || loadingStartup || loadingVendors;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Procurement Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Equipment packages, benefits, and startup costs for employee onboarding
          </p>
        </div>

        <Tabs defaultValue="equipment" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="startup">Startup Costs</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
          </TabsList>

          {/* Equipment Packages */}
          <TabsContent value="equipment" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipmentPackages?.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Package className="w-8 h-8 text-primary" />
                      <Badge variant="outline">{pkg.tier}</Badge>
                    </div>
                    <CardTitle className="mt-2">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-4">
                      ${pkg.cost.toLocaleString()}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Includes:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {pkg.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Benefits Packages */}
          <TabsContent value="benefits" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {benefitsPackages?.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Heart className="w-8 h-8 text-red-500" />
                      <Badge variant="outline">{pkg.tier}</Badge>
                    </div>
                    <CardTitle className="mt-2">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-4">
                      ${pkg.annualCost.toLocaleString()}/year
                    </div>
                    <div className="space-y-2">
                      {pkg.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-foreground">{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.monthlyCost > 0 ? `$${item.monthlyCost}/mo` : item.coverage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Startup Costs */}
          <TabsContent value="startup" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  One-Time Startup Costs (Per Employee)
                </CardTitle>
                <CardDescription>
                  These costs are incurred once when onboarding a new employee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {startupCosts?.map((cost) => (
                    <div key={cost.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{cost.name}</p>
                        <p className="text-sm text-muted-foreground">{cost.description}</p>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${cost.cost.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
                    <p className="font-bold text-foreground">Total Startup Cost</p>
                    <p className="text-xl font-bold text-primary">
                      ${startupCosts?.reduce((sum, c) => sum + c.cost, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors */}
          <TabsContent value="vendors" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendorCategories?.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-primary" />
                      <CardTitle>{category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {category.vendors.map((vendor, idx) => (
                        <Badge key={idx} variant="secondary">
                          {vendor}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cost Calculator */}
          <TabsContent value="calculator" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-primary" />
                  Total Package Cost Calculator
                </CardTitle>
                <CardDescription>
                  Calculate the full Year 1 cost for a new hire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Position Tier</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(["specialist", "coordinator", "manager", "director", "executive"] as const).map((tier) => (
                          <Button
                            key={tier}
                            variant={selectedTier === tier ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTier(tier)}
                          >
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Annual Salary</label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          value={sampleSalary}
                          onChange={(e) => setSampleSalary(Number(e.target.value))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {packageCost && (
                    <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                      <h3 className="font-bold text-foreground">Cost Breakdown</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Annual Salary</span>
                          <span className="font-medium">${packageCost.salary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equipment ({packageCost.breakdown.equipmentPackage})</span>
                          <span className="font-medium">${packageCost.equipment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Benefits ({packageCost.breakdown.benefitsPackage})</span>
                          <span className="font-medium">${packageCost.benefits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Startup Costs</span>
                          <span className="font-medium">${packageCost.startup.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-lg font-bold text-primary">
                            <span>Year 1 Total</span>
                            <span>${packageCost.year1Total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Ongoing Annual</span>
                            <span>${packageCost.ongoingAnnual.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
