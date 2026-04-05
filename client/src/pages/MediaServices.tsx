import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Video,
  Package,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  Send,
  Plus,
  Eye,
  Loader2,
  Music,
  Camera,
  Mic,
  Film,
  Tag,
  Building2,
  Home,
  UserCircle,
  CreditCard,
} from "lucide-react";

export default function MediaServices() {
  const [activeTab, setActiveTab] = useState("packages");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [clientType, setClientType] = useState<string>("external");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isLawsMember, setIsLawsMember] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState("");

  const { data: packages, isLoading: packagesLoading } = trpc.serviceBilling.getMediaPackages.useQuery();
  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = trpc.serviceBilling.getInvoices.useQuery({ serviceType: "media" });
  const { data: stats } = trpc.serviceBilling.getBillingStats.useQuery({ serviceType: "media" });

  const createInvoiceMutation = trpc.serviceBilling.createInvoiceFromPackage.useMutation({
    onSuccess: (data) => {
      toast.success(`Invoice ${data.invoiceNumber} created for $${data.totalAmount.toFixed(2)}`);
      if (data.memberSavings > 0) {
        toast.info(`Member savings: $${data.memberSavings.toFixed(2)}`);
      }
      setIsInvoiceDialogOpen(false);
      resetForm();
      refetchInvoices();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendInvoiceMutation = trpc.serviceBilling.sendInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice sent to client");
      refetchInvoices();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createCheckoutMutation = trpc.serviceBilling.createServiceCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Redirecting to payment...");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setSelectedPackage(null);
    setClientType("external");
    setClientName("");
    setClientEmail("");
    setIsLawsMember(false);
    setQuantity(1);
    setCustomNotes("");
  };

  const handleCreateInvoice = () => {
    if (!selectedPackage || !clientName) {
      toast.error("Please select a package and enter client name");
      return;
    }

    createInvoiceMutation.mutate({
      packageId: selectedPackage.id,
      clientType: clientType as any,
      clientName,
      clientEmail: clientEmail || undefined,
      isLawsMember,
      quantity,
      customNotes: customNotes || undefined,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      sent: { variant: "default", label: "Sent" },
      paid: { variant: "default", label: "Paid" },
      partial: { variant: "outline", label: "Partial" },
      overdue: { variant: "destructive", label: "Overdue" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      refunded: { variant: "secondary", label: "Refunded" },
    };
    const config = statusConfig[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPricingTypeBadge = (type: string) => {
    const typeConfig: Record<string, { color: string; label: string }> = {
      fixed: { color: "bg-green-100 text-green-800", label: "Fixed Price" },
      hourly: { color: "bg-blue-100 text-blue-800", label: "Hourly" },
      per_item: { color: "bg-purple-100 text-purple-800", label: "Per Item" },
      subscription: { color: "bg-amber-100 text-amber-800", label: "Subscription" },
    };
    const config = typeConfig[type] || { color: "bg-gray-100 text-gray-800", label: type };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      video: <Video className="w-4 h-4" />,
      audio: <Music className="w-4 h-4" />,
      photography: <Camera className="w-4 h-4" />,
      general: <Film className="w-4 h-4" />,
      subscription: <Clock className="w-4 h-4" />,
    };
    return icons[category] || <Video className="w-4 h-4" />;
  };

  const getClientTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      internal_house: <Home className="w-4 h-4" />,
      internal_business: <Building2 className="w-4 h-4" />,
      external: <UserCircle className="w-4 h-4" />,
    };
    return icons[type] || <UserCircle className="w-4 h-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Video className="w-8 h-8 text-primary" />
              Media Creation Services
            </h1>
            <p className="text-muted-foreground mt-1">
              Professional video, audio, and photography services with member pricing
            </p>
          </div>
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Media Invoice</DialogTitle>
                <DialogDescription>
                  Generate an invoice for media creation services
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Service Package</Label>
                  <Select
                    value={selectedPackage?.id?.toString() || ""}
                    onValueChange={(value) => {
                      const pkg = packages?.find((p) => p.id.toString() === value);
                      setSelectedPackage(pkg);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                          {pkg.package_name} - {formatCurrency(Number(pkg.base_price))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Client Type</Label>
                  <Select value={clientType} onValueChange={setClientType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal_house">Internal - House</SelectItem>
                      <SelectItem value="internal_business">Internal - Business</SelectItem>
                      <SelectItem value="external">External Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client Email</Label>
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>L.A.W.S. Member</Label>
                    <p className="text-xs text-muted-foreground">20% discount applied</p>
                  </div>
                  <Switch checked={isLawsMember} onCheckedChange={setIsLawsMember} />
                </div>

                {selectedPackage?.pricing_type === "per_item" && (
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Additional notes for this invoice"
                    rows={3}
                  />
                </div>

                {selectedPackage && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span>{formatCurrency(Number(selectedPackage.base_price) * quantity)}</span>
                        </div>
                        {isLawsMember && (
                          <div className="flex justify-between text-green-600">
                            <span>Member Discount (20%):</span>
                            <span>-{formatCurrency((Number(selectedPackage.base_price) - Number(selectedPackage.member_price)) * quantity)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>
                            {formatCurrency(
                              (isLawsMember ? Number(selectedPackage.member_price) : Number(selectedPackage.base_price)) * quantity
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice} disabled={createInvoiceMutation.isPending}>
                  {createInvoiceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Create Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invoices</p>
                  <p className="text-2xl font-bold">{stats?.pendingCount || 0}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(stats?.pendingAmount || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Savings</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.totalMemberSavings || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="packages" className="gap-2">
              <Package className="w-4 h-4" />
              Service Packages
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="w-4 h-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

          {/* Packages Tab */}
          <TabsContent value="packages" className="mt-6">
            {packagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages?.map((pkg) => (
                  <Card key={pkg.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(pkg.category)}
                          <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                        </div>
                        {getPricingTypeBadge(pkg.pricing_type)}
                      </div>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">{formatCurrency(Number(pkg.base_price))}</span>
                          {pkg.pricing_type === "hourly" && <span className="text-muted-foreground">/hour</span>}
                          {pkg.pricing_type === "per_item" && <span className="text-muted-foreground">/item</span>}
                          {pkg.pricing_type === "subscription" && <span className="text-muted-foreground">/month</span>}
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Tag className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Member Price: {formatCurrency(Number(pkg.member_price))}
                          </span>
                        </div>
                      </div>

                      {pkg.estimated_hours && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>~{pkg.estimated_hours} hours</span>
                        </div>
                      )}

                      {pkg.deliverables && pkg.deliverables.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Deliverables:</p>
                          <ul className="space-y-1">
                            {pkg.deliverables.slice(0, 3).map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                            {pkg.deliverables.length > 3 && (
                              <li className="text-sm text-muted-foreground pl-6">
                                +{pkg.deliverables.length - 3} more...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setIsInvoiceDialogOpen(true);
                        }}
                      >
                        Create Invoice
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Service Invoices</CardTitle>
                <CardDescription>Manage and track media creation service invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : invoices && invoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getClientTypeIcon(invoice.client_type)}
                              <div>
                                <p className="font-medium">{invoice.client_name}</p>
                                {invoice.is_laws_member && (
                                  <Badge variant="outline" className="text-xs">Member</Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{invoice.client_type.replace(/_/g, " ")}</span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(Number(invoice.total_amount))}
                            {invoice.discount_amount > 0 && (
                              <p className="text-xs text-green-600">
                                Saved {formatCurrency(Number(invoice.discount_amount))}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>{formatDate(invoice.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {invoice.status === "draft" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => sendInvoiceMutation.mutate({ id: invoice.id })}
                                  disabled={sendInvoiceMutation.isPending}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                              {(invoice.status === "sent" || invoice.status === "draft") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => createCheckoutMutation.mutate({ invoiceId: invoice.id })}
                                  disabled={createCheckoutMutation.isPending}
                                  title="Pay with Stripe"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices yet</p>
                    <p className="text-sm">Create your first media service invoice</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
