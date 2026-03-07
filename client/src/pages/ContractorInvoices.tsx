import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Download,
  Eye,
  Trash2,
  Loader2,
  Receipt,
  TrendingUp,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  category: 'labor' | 'materials' | 'expenses' | 'retainer' | 'milestone' | 'other';
  projectName?: string;
  hoursWorked?: number;
  hourlyRate?: number;
}

export default function ContractorInvoices() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, category: 'labor' }
  ]);
  const [newInvoice, setNewInvoice] = useState({
    contractorId: 1, // Would come from auth context in real app
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    periodStart: '',
    periodEnd: '',
    paymentTerms: 'Net 30',
    notes: ''
  });

  // Queries
  const { data: invoices, isLoading, refetch } = trpc.contractorInvoices.getAllInvoices.useQuery({});
  const { data: stats } = trpc.contractorInvoices.getInvoiceStats.useQuery({});

  // Mutations
  const createMutation = trpc.contractorInvoices.createInvoice.useMutation({
    onSuccess: (data) => {
      toast.success(`Invoice ${data.invoiceNumber} created`);
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create invoice: ${error.message}`);
    }
  });

  const submitMutation = trpc.contractorInvoices.submitInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice submitted for approval");
      refetch();
    }
  });

  const approveMutation = trpc.contractorInvoices.approveInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice approved");
      refetch();
    }
  });

  const rejectMutation = trpc.contractorInvoices.rejectInvoice.useMutation({
    onSuccess: () => {
      toast.success("Invoice rejected");
      refetch();
    }
  });

  const resetForm = () => {
    setLineItems([{ description: '', quantity: 1, unitPrice: 0, category: 'labor' }]);
    setNewInvoice({
      contractorId: 1,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      periodStart: '',
      periodEnd: '',
      paymentTerms: 'Net 30',
      notes: ''
    });
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, category: 'labor' }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreateInvoice = () => {
    if (lineItems.some(item => !item.description || item.unitPrice <= 0)) {
      toast.error("Please fill in all line items");
      return;
    }

    createMutation.mutate({
      ...newInvoice,
      lineItems
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      overdue: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    };
    return <Badge className={styles[status] || styles.draft}>{status.toUpperCase()}</Badge>;
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invoice Portal</h1>
            <p className="text-muted-foreground mt-1">
              Manage contractor invoices and payments
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Create an invoice for services rendered to The L.A.W.S. Collective
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Invoice Date</Label>
                    <Input 
                      type="date" 
                      value={newInvoice.invoiceDate}
                      onChange={(e) => setNewInvoice({...newInvoice, invoiceDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input 
                      type="date" 
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period Start</Label>
                    <Input 
                      type="date" 
                      value={newInvoice.periodStart}
                      onChange={(e) => setNewInvoice({...newInvoice, periodStart: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Period End</Label>
                    <Input 
                      type="date" 
                      value={newInvoice.periodEnd}
                      onChange={(e) => setNewInvoice({...newInvoice, periodEnd: e.target.value})}
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Line Items</Label>
                    <Button variant="outline" size="sm" onClick={addLineItem}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                      <div className="col-span-4 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input 
                          placeholder="Service description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Select 
                          value={item.category}
                          onValueChange={(v) => updateLineItem(index, 'category', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="labor">Labor</SelectItem>
                            <SelectItem value="materials">Materials</SelectItem>
                            <SelectItem value="expenses">Expenses</SelectItem>
                            <SelectItem value="retainer">Retainer</SelectItem>
                            <SelectItem value="milestone">Milestone</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input 
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Unit Price</Label>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1 text-right font-medium">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      <div className="col-span-1">
                        {lineItems.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeLineItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end border-t pt-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Additional notes or payment instructions..."
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleCreateInvoice} 
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Invoice
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{stats?.totalInvoices || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold">${parseFloat(stats?.totalPaid || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">${parseFloat(stats?.totalPending || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">${parseFloat(stats?.totalOverdue || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({stats?.draftCount || 0})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({(stats?.submittedCount || 0) + (stats?.approvedCount || 0)})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({stats?.paidCount || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>Complete list of contractor invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Contractor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No invoices found. Create your first invoice to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices?.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{invoice.businessName || `Contractor #${invoice.contractorId}`}</TableCell>
                          <TableCell className="font-medium">${parseFloat(invoice.totalAmount).toFixed(2)}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedInvoice(invoice);
                                setViewDialogOpen(true);
                              }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {invoice.status === 'draft' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => submitMutation.mutate({ invoiceId: invoice.id })}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              )}
                              {invoice.status === 'submitted' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => approveMutation.mutate({ invoiceId: invoice.id, approvedBy: 1 })}
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => rejectMutation.mutate({ invoiceId: invoice.id, reason: 'Needs revision' })}
                                  >
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draft">
            <Card>
              <CardHeader>
                <CardTitle>Draft Invoices</CardTitle>
                <CardDescription>Invoices not yet submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.filter((i: any) => i.status === 'draft').map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">${parseFloat(invoice.totalAmount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            onClick={() => submitMutation.mutate({ invoiceId: invoice.id })}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invoices</CardTitle>
                <CardDescription>Awaiting approval or payment</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.filter((i: any) => ['submitted', 'approved'].includes(i.status)).map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">${parseFloat(invoice.totalAmount).toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paid">
            <Card>
              <CardHeader>
                <CardTitle>Paid Invoices</CardTitle>
                <CardDescription>Completed payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.filter((i: any) => i.status === 'paid').map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="font-medium">${parseFloat(invoice.totalAmount).toFixed(2)}</TableCell>
                        <TableCell>{invoice.paymentMethod || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Invoice Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p className="font-medium">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Terms</p>
                    <p className="font-medium">{selectedInvoice.paymentTerms}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
                  <p className="text-3xl font-bold">${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</p>
                </div>
                {selectedInvoice.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
