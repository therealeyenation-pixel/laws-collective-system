import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Building2,
  Shield,
  Palette,
  Video,
  Megaphone,
  Home,
  GraduationCap,
  ShoppingCart,
  Heart,
  Briefcase,
  FileText,
  DollarSign,
  Scale,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";

const departmentIcons: Record<string, React.ReactNode> = {
  TAX_PREP: <FileText className="w-5 h-5" />,
  CONTRACT: <Scale className="w-5 h-5" />,
  GRANT: <DollarSign className="w-5 h-5" />,
  BIZ_SETUP: <Building2 className="w-5 h-5" />,
  DESIGN: <Palette className="w-5 h-5" />,
  MEDIA: <Video className="w-5 h-5" />,
  MARKETING: <Megaphone className="w-5 h-5" />,
  PROPERTY: <Home className="w-5 h-5" />,
  EDUCATION: <GraduationCap className="w-5 h-5" />,
  PURCHASING: <ShoppingCart className="w-5 h-5" />,
  HEALTH: <Heart className="w-5 h-5" />,
  BIZ_MGMT: <Briefcase className="w-5 h-5" />,
};

export default function ServiceDepartments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [disclaimerDialogOpen, setDisclaimerDialogOpen] = useState(false);
  const [selectedDisclaimer, setSelectedDisclaimer] = useState<any>(null);
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);
  const [signature, setSignature] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);

  // Queries
  const { data: departments, isLoading: loadingDepts } = trpc.hybridServices.getDepartments.useQuery();
  const { data: centralServices } = trpc.hybridServices.getCentralServices.useQuery();
  const { data: licensableServices } = trpc.hybridServices.getLicensableServices.useQuery();
  const { data: disclaimers } = trpc.hybridServices.getDisclaimers.useQuery();
  const { data: houseLicenses } = trpc.hybridServices.getHouseLicenses.useQuery({ status: "all" });
  
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const { data: revenueStats } = trpc.hybridServices.getRevenueStats.useQuery({
    startDate: thirtyDaysAgo,
    endDate: now,
  });
  const { data: utilizationSummary } = trpc.hybridServices.getUtilizationSummary.useQuery({
    startDate: thirtyDaysAgo,
    endDate: now,
    groupBy: "department",
  });

  // Mutations
  const requestLicenseMutation = trpc.hybridServices.requestLicense.useMutation({
    onSuccess: () => {
      toast.success("License request submitted");
      setLicenseDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const acknowledgeDisclaimerMutation = trpc.hybridServices.acknowledgeDisclaimer.useMutation({
    onSuccess: () => {
      toast.success("Disclaimer acknowledged");
      setDisclaimerDialogOpen(false);
      setDisclaimerAcknowledged(false);
      setSignature("");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleRequestLicense = () => {
    if (!selectedDepartment || !selectedHouseId) return;
    requestLicenseMutation.mutate({
      houseId: selectedHouseId,
      departmentId: selectedDepartment.id,
      billingCycle,
    });
  };

  const handleAcknowledgeDisclaimer = () => {
    if (!selectedDisclaimer || !signature.trim()) return;
    acknowledgeDisclaimerMutation.mutate({
      disclaimerId: selectedDisclaimer.id,
      electronicSignature: signature,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loadingDepts) {
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
        <div>
          <h1 className="text-3xl font-bold">Service Departments</h1>
          <p className="text-muted-foreground mt-1">
            Manage L.A.W.S. Central Services and House-Licensed Services
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Departments</p>
                  <p className="text-2xl font-bold">{departments?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Central Services</p>
                  <p className="text-2xl font-bold">{centralServices?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Licensable Services</p>
                  <p className="text-2xl font-bold">{licensableServices?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Licenses</p>
                  <p className="text-2xl font-bold">
                    {houseLicenses?.filter((l: any) => l.license_status === "active").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="central">Central Services</TabsTrigger>
            <TabsTrigger value="licensable">Licensable Services</TabsTrigger>
            <TabsTrigger value="licenses">House Licenses</TabsTrigger>
            <TabsTrigger value="disclaimers">Disclaimers</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Central Services Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    L.A.W.S. Central Services
                  </CardTitle>
                  <CardDescription>
                    Compliance-sensitive services operated exclusively by L.A.W.S. Collective
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {centralServices?.map((dept: any) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-blue-500">
                            {departmentIcons[dept.department_code] || <Building2 className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{dept.department_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {dept.revenue_split_laws}% L.A.W.S. / {dept.revenue_split_trust}% Trust
                            </p>
                          </div>
                        </div>
                        {dept.requires_disclaimer && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Disclaimer
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Licensable Services Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Licensable Services
                  </CardTitle>
                  <CardDescription>
                    Services that Houses can license and operate independently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {licensableServices?.map((dept: any) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-green-500">
                            {departmentIcons[dept.department_code] || <Building2 className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{dept.department_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(Number(dept.licensing_fee_monthly))}/mo or{" "}
                              {formatCurrency(Number(dept.licensing_fee_annual))}/yr
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setLicenseDialogOpen(true);
                          }}
                        >
                          License
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Split Explanation */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Split Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      Central Services (L.A.W.S. Operated)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>L.A.W.S. Collective</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trust (Generational Wealth)</span>
                        <span className="font-medium">40%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      Licensed Services (House Operated)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Operating House</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>L.A.W.S. Collective</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trust (Generational Wealth)</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Central Services Tab */}
          <TabsContent value="central" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centralServices?.map((dept: any) => (
                <Card key={dept.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {departmentIcons[dept.department_code] || <Building2 className="w-5 h-5" />}
                      {dept.department_name}
                    </CardTitle>
                    <CardDescription>{dept.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="secondary">{dept.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Revenue Split</span>
                        <span>{dept.revenue_split_laws}% / {dept.revenue_split_trust}%</span>
                      </div>
                      {dept.requires_disclaimer && (
                        <div className="p-3 bg-amber-500/10 rounded-lg">
                          <p className="text-sm text-amber-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Requires disclaimer acknowledgment
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Licensable Services Tab */}
          <TabsContent value="licensable" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {licensableServices?.map((dept: any) => (
                <Card key={dept.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {departmentIcons[dept.department_code] || <Building2 className="w-5 h-5" />}
                      {dept.department_name}
                    </CardTitle>
                    <CardDescription className="text-xs">{dept.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Licensing Fee</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold">
                            {formatCurrency(Number(dept.licensing_fee_monthly))}
                          </span>
                          <span className="text-xs text-muted-foreground">/month</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          or {formatCurrency(Number(dept.licensing_fee_annual))}/year (save 2 months)
                        </p>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">House Revenue</span>
                          <span className="font-medium text-green-600">{dept.revenue_split_house}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">L.A.W.S. Share</span>
                          <span>{dept.revenue_split_laws}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trust Share</span>
                          <span>{dept.revenue_split_trust}%</span>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setLicenseDialogOpen(true);
                        }}
                      >
                        Request License
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* House Licenses Tab */}
          <TabsContent value="licenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>House Service Licenses</CardTitle>
                <CardDescription>
                  Track all service licenses issued to Houses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {houseLicenses && houseLicenses.length > 0 ? (
                  <div className="space-y-3">
                    {houseLicenses.map((license: any) => (
                      <div
                        key={license.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-primary">
                            {departmentIcons[license.department_code] || <Building2 className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{license.department_name}</p>
                            <p className="text-sm text-muted-foreground">
                              House #{license.house_id} • {license.billing_cycle}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              license.license_status === "active"
                                ? "default"
                                : license.license_status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {license.license_status}
                          </Badge>
                          {license.next_payment_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Next: {new Date(Number(license.next_payment_date)).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No licenses issued yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disclaimers Tab */}
          <TabsContent value="disclaimers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Disclaimers</CardTitle>
                <CardDescription>
                  Legal disclaimers required for compliance-sensitive services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disclaimers?.map((disclaimer: any) => (
                    <div key={disclaimer.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          {disclaimer.title}
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDisclaimer(disclaimer);
                            setDisclaimerDialogOpen(true);
                          }}
                        >
                          View & Acknowledge
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{disclaimer.short_text}</p>
                      <div className="flex gap-2 mt-2">
                        {disclaimer.requires_acknowledgment && (
                          <Badge variant="outline" className="text-xs">
                            Requires Acknowledgment
                          </Badge>
                        )}
                        {disclaimer.display_on_documents && (
                          <Badge variant="outline" className="text-xs">
                            Displayed on Documents
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Department (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  {utilizationSummary && utilizationSummary.length > 0 ? (
                    <div className="space-y-3">
                      {utilizationSummary.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.group_key}</p>
                            <p className="text-xs text-muted-foreground">
                              {Number(item.total_hours).toFixed(1)} hours • {item.total_entries} entries
                            </p>
                          </div>
                          <span className="font-bold text-green-600">
                            {formatCurrency(Number(item.total_revenue))}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No revenue data for this period</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Client Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueStats?.byClientType && revenueStats.byClientType.length > 0 ? (
                    <div className="space-y-3">
                      {revenueStats.byClientType.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {item.client_type === "internal_house" && <Home className="w-4 h-4" />}
                            {item.client_type === "internal_business" && <Building2 className="w-4 h-4" />}
                            {item.client_type === "external" && <Users className="w-4 h-4" />}
                            <span className="capitalize">{item.client_type.replace(/_/g, " ")}</span>
                          </div>
                          <span className="font-bold">{formatCurrency(Number(item.total))}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No client revenue data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* License Request Dialog */}
      <Dialog open={licenseDialogOpen} onOpenChange={setLicenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Service License</DialogTitle>
            <DialogDescription>
              License {selectedDepartment?.department_name} for your House
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>House ID</Label>
              <Input
                type="number"
                placeholder="Enter your House ID"
                value={selectedHouseId || ""}
                onChange={(e) => setSelectedHouseId(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    Monthly - {formatCurrency(Number(selectedDepartment?.licensing_fee_monthly || 0))}/mo
                  </SelectItem>
                  <SelectItem value="annual">
                    Annual - {formatCurrency(Number(selectedDepartment?.licensing_fee_annual || 0))}/yr (Save 2 months)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">Revenue Split for Licensed Services:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Your House: {selectedDepartment?.revenue_split_house}%</li>
                <li>• L.A.W.S. Collective: {selectedDepartment?.revenue_split_laws}%</li>
                <li>• Trust: {selectedDepartment?.revenue_split_trust}%</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLicenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestLicense}
              disabled={!selectedHouseId || requestLicenseMutation.isPending}
            >
              {requestLicenseMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disclaimer Acknowledgment Dialog */}
      <Dialog open={disclaimerDialogOpen} onOpenChange={setDisclaimerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDisclaimer?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{selectedDisclaimer?.full_text}</p>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="acknowledge"
                checked={disclaimerAcknowledged}
                onCheckedChange={(checked) => setDisclaimerAcknowledged(checked as boolean)}
              />
              <Label htmlFor="acknowledge" className="text-sm">
                I have read, understand, and agree to the terms of this disclaimer
              </Label>
            </div>
            <div>
              <Label>Electronic Signature</Label>
              <Input
                placeholder="Type your full name as signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                disabled={!disclaimerAcknowledged}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisclaimerDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAcknowledgeDisclaimer}
              disabled={!disclaimerAcknowledged || !signature.trim() || acknowledgeDisclaimerMutation.isPending}
            >
              {acknowledgeDisclaimerMutation.isPending ? "Saving..." : "Sign & Acknowledge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
