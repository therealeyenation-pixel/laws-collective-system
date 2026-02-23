import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Calendar,
  Bell,
  Plus,
  RefreshCw,
  Download,
  FileText,
  Building2,
  DollarSign,
  Scale,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { complianceMonitoringService, ComplianceItem, ComplianceAlert, ComplianceReport } from "@/services/complianceMonitoringService";
import { format, differenceInDays } from "date-fns";

export default function ComplianceMonitoringPage() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'registration' as ComplianceItem['type'],
    title: '',
    description: '',
    entity: '',
    jurisdiction: '',
    dueDate: '',
    priority: 'medium' as ComplianceItem['priority'],
    autoRenew: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(complianceMonitoringService.getItems());
    setAlerts(complianceMonitoringService.getAlerts());
    setReport(complianceMonitoringService.generateReport());
  };

  const handleRunCheck = async () => {
    setIsLoading(true);
    try {
      const result = await complianceMonitoringService.runComplianceCheck();
      toast.success(`Checked ${result.itemsChecked} items, found ${result.issuesFound} issues`);
      loadData();
    } catch (error) {
      toast.error("Compliance check failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.title || !newItem.entity || !newItem.dueDate) {
      toast.error("Please fill in required fields");
      return;
    }

    complianceMonitoringService.addItem({
      type: newItem.type,
      title: newItem.title,
      description: newItem.description,
      entity: newItem.entity,
      jurisdiction: newItem.jurisdiction || undefined,
      dueDate: new Date(newItem.dueDate),
      status: 'upcoming',
      priority: newItem.priority,
      autoRenew: newItem.autoRenew,
    });

    toast.success("Compliance item added");
    setShowAddDialog(false);
    setNewItem({
      type: 'registration',
      title: '',
      description: '',
      entity: '',
      jurisdiction: '',
      dueDate: '',
      priority: 'medium',
      autoRenew: false,
    });
    loadData();
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    complianceMonitoringService.acknowledgeAlert(alertId, 'Current User');
    toast.success("Alert acknowledged");
    loadData();
  };

  const handleMarkComplete = (itemId: string) => {
    complianceMonitoringService.updateItem(itemId, { 
      status: 'compliant',
      dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Next year
      remindersSent: 0,
    });
    toast.success("Marked as complete");
    loadData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'upcoming': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'at_risk': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'overdue': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'at_risk': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'registration': return <Building2 className="w-4 h-4" />;
      case 'tax_filing': return <DollarSign className="w-4 h-4" />;
      case 'grant_report': return <FileText className="w-4 h-4" />;
      case 'annual_report': return <FileText className="w-4 h-4" />;
      case 'license': return <Scale className="w-4 h-4" />;
      case 'insurance': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Compliance Monitoring
            </h1>
            <p className="text-muted-foreground mt-1">
              Automated tracking for registrations, filings, and deadlines
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRunCheck} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Run Check
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Compliance Item</DialogTitle>
                  <DialogDescription>
                    Track a new compliance requirement or deadline
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newItem.type} onValueChange={(v) => setNewItem({ ...newItem, type: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registration">Registration</SelectItem>
                          <SelectItem value="tax_filing">Tax Filing</SelectItem>
                          <SelectItem value="grant_report">Grant Report</SelectItem>
                          <SelectItem value="annual_report">Annual Report</SelectItem>
                          <SelectItem value="license">License</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={newItem.priority} onValueChange={(v) => setNewItem({ ...newItem, priority: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="e.g., Georgia Annual Registration"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Entity *</Label>
                    <Input
                      value={newItem.entity}
                      onChange={(e) => setNewItem({ ...newItem, entity: e.target.value })}
                      placeholder="e.g., L.A.W.S. Collective LLC"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Due Date *</Label>
                      <Input
                        type="date"
                        value={newItem.dueDate}
                        onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jurisdiction</Label>
                      <Input
                        value={newItem.jurisdiction}
                        onChange={(e) => setNewItem({ ...newItem, jurisdiction: e.target.value })}
                        placeholder="e.g., Georgia"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Additional details..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddItem}>Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.totalItems}</p>
                    <p className="text-xs text-muted-foreground">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.compliant}</p>
                    <p className="text-xs text-muted-foreground">Compliant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.upcoming}</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.atRisk}</p>
                    <p className="text-xs text-muted-foreground">At Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.overdue}</p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts Banner */}
        {unacknowledgedAlerts.length > 0 && (
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      {unacknowledgedAlerts.length} Unacknowledged Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {unacknowledgedAlerts[0]?.message}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAcknowledgeAlert(unacknowledgedAlerts[0].id)}
                >
                  Acknowledge
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          {/* All Items Tab */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Items</CardTitle>
                <CardDescription>All tracked compliance requirements and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {items.map((item) => {
                      const daysUntilDue = differenceInDays(item.dueDate, new Date());
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(item.status)}
                            <div className="p-2 bg-muted rounded-lg">
                              {getTypeIcon(item.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.entity} {item.jurisdiction && `• ${item.jurisdiction}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {daysUntilDue < 0 
                                  ? `${Math.abs(daysUntilDue)} days overdue`
                                  : daysUntilDue === 0
                                  ? 'Due today'
                                  : `${daysUntilDue} days left`
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(item.dueDate, 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                            {item.status !== 'compliant' && (
                              <Button size="sm" variant="outline" onClick={() => handleMarkComplete(item.id)}>
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Urgent Tab */}
          <TabsContent value="urgent">
            <Card>
              <CardHeader>
                <CardTitle>Urgent Items</CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {items
                      .filter(i => i.status === 'overdue' || i.status === 'at_risk')
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(item.status)}
                            <div>
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.entity}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-sm font-medium text-red-600">
                              Due: {format(item.dueDate, 'MMM d, yyyy')}
                            </p>
                            <Button size="sm" onClick={() => handleMarkComplete(item.id)}>
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                      ))}
                    {items.filter(i => i.status === 'overdue' || i.status === 'at_risk').length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>No urgent items. All compliance requirements are on track.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Alert History</CardTitle>
                <CardDescription>System-generated compliance alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          alert.acknowledged ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {alert.type === 'error' ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : alert.type === 'warning' ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Bell className="w-5 h-5 text-blue-500" />
                          )}
                          <div>
                            <p className="text-sm">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(alert.createdAt, 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report">
            {report && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>By Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(report.byType).map(([type, data]) => (
                        <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(type)}
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{data.total} total</Badge>
                            <Badge className="bg-green-100 text-green-700">{data.compliant} ok</Badge>
                            {data.issues > 0 && (
                              <Badge className="bg-red-100 text-red-700">{data.issues} issues</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>By Entity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(report.byEntity).map(([entity, data]) => (
                        <div key={entity} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{entity}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{data.total} total</Badge>
                            <Badge className="bg-green-100 text-green-700">{data.compliant} ok</Badge>
                            {data.issues > 0 && (
                              <Badge className="bg-red-100 text-red-700">{data.issues} issues</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
