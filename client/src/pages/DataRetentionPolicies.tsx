import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Archive, 
  Clock, 
  Shield,
  Trash2,
  Play,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Database,
  Lock,
  Unlock,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  dataRetentionService, 
  RetentionPolicy, 
  LegalHold,
  ArchivalJob,
  DataType,
  RetentionAction
} from "@/services/dataRetentionService";

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: 'documents', label: 'Documents' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'audit_logs', label: 'Audit Logs' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'messages', label: 'Messages' },
  { value: 'backups', label: 'Backups' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'temp_files', label: 'Temporary Files' }
];

const ACTIONS: { value: RetentionAction; label: string; icon: React.ReactNode }[] = [
  { value: 'archive', label: 'Archive', icon: <Archive className="w-4 h-4" /> },
  { value: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" /> },
  { value: 'anonymize', label: 'Anonymize', icon: <Shield className="w-4 h-4" /> },
  { value: 'compress', label: 'Compress', icon: <Database className="w-4 h-4" /> },
  { value: 'move_cold_storage', label: 'Move to Cold Storage', icon: <Archive className="w-4 h-4" /> }
];

export default function DataRetentionPoliciesPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [legalHolds, setLegalHolds] = useState<LegalHold[]>([]);
  const [jobs, setJobs] = useState<ArchivalJob[]>([]);
  const [stats, setStats] = useState(dataRetentionService.getStats());
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false);
  const [isCreateHoldOpen, setIsCreateHoldOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    dataType: 'documents' as DataType,
    retentionPeriod: 365,
    action: 'archive' as RetentionAction
  });
  const [newHold, setNewHold] = useState({
    name: '',
    reason: '',
    dataTypes: [] as DataType[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPolicies(dataRetentionService.getPolicies());
    setLegalHolds(dataRetentionService.getLegalHolds());
    setJobs(dataRetentionService.getArchivalJobs());
    setStats(dataRetentionService.getStats());
  };

  const handleCreatePolicy = () => {
    if (!newPolicy.name) {
      toast.error("Policy name is required");
      return;
    }
    dataRetentionService.createPolicy({
      ...newPolicy,
      conditions: [],
      isActive: true
    });
    toast.success("Policy created");
    setIsCreatePolicyOpen(false);
    setNewPolicy({
      name: '',
      description: '',
      dataType: 'documents',
      retentionPeriod: 365,
      action: 'archive'
    });
    loadData();
  };

  const handleTogglePolicy = (id: string) => {
    dataRetentionService.togglePolicy(id);
    loadData();
  };

  const handleExecutePolicy = (id: string) => {
    dataRetentionService.executePolicy(id);
    toast.success("Policy execution started");
    setTimeout(loadData, 2500);
  };

  const handleDeletePolicy = (id: string) => {
    dataRetentionService.deletePolicy(id);
    toast.success("Policy deleted");
    loadData();
  };

  const handleCreateHold = () => {
    if (!newHold.name || !newHold.reason) {
      toast.error("Name and reason are required");
      return;
    }
    dataRetentionService.createLegalHold({
      ...newHold,
      startDate: new Date(),
      isActive: true,
      createdBy: user?.name || 'Unknown'
    });
    toast.success("Legal hold created");
    setIsCreateHoldOpen(false);
    setNewHold({ name: '', reason: '', dataTypes: [] });
    loadData();
  };

  const handleReleaseHold = (id: string) => {
    dataRetentionService.releaseLegalHold(id);
    toast.success("Legal hold released");
    loadData();
  };

  const compliance = dataRetentionService.generateComplianceReport().compliance;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Retention Policies</h1>
            <p className="text-muted-foreground mt-1">
              Manage data lifecycle, archival rules, and compliance
            </p>
          </div>
          <Button onClick={() => setIsCreatePolicyOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Policy
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activePolicies}/{stats.totalPolicies}</p>
                  <p className="text-sm text-muted-foreground">Active Policies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Lock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeLegalHolds}</p>
                  <p className="text-sm text-muted-foreground">Legal Holds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Archive className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.recordsArchived.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Records Archived</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(stats.storageReclaimed / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <p className="text-sm text-muted-foreground">Storage Reclaimed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                {compliance.gdprCompliant ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span>GDPR</span>
              </div>
              <div className="flex items-center gap-2">
                {compliance.hipaaCompliant ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span>HIPAA</span>
              </div>
              <div className="flex items-center gap-2">
                {compliance.soc2Compliant ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span>SOC 2</span>
              </div>
              {compliance.issues.length > 0 && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {compliance.issues.length} issues
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="policies">
          <TabsList>
            <TabsTrigger value="policies">
              <FileText className="w-4 h-4 mr-2" />
              Retention Policies
            </TabsTrigger>
            <TabsTrigger value="holds">
              <Lock className="w-4 h-4 mr-2" />
              Legal Holds
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <RefreshCw className="w-4 h-4 mr-2" />
              Archival Jobs
            </TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-4">
            <div className="grid gap-4">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{policy.name}</h3>
                          <Badge variant={policy.isActive ? "default" : "secondary"}>
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {DATA_TYPES.find(t => t.value === policy.dataType)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {policy.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{policy.retentionPeriod} days</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {ACTIONS.find(a => a.value === policy.action)?.icon}
                            <span className="capitalize">{policy.action.replace('_', ' ')}</span>
                          </div>
                          {policy.lastExecuted && (
                            <div className="text-muted-foreground">
                              Last run: {policy.lastExecuted.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={policy.isActive}
                          onCheckedChange={() => handleTogglePolicy(policy.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExecutePolicy(policy.id)}
                          disabled={!policy.isActive}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Run
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePolicy(policy.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Legal Holds Tab */}
          <TabsContent value="holds" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsCreateHoldOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Legal Hold
              </Button>
            </div>
            <div className="grid gap-4">
              {legalHolds.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No legal holds active
                  </CardContent>
                </Card>
              ) : (
                legalHolds.map((hold) => (
                  <Card key={hold.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{hold.name}</h3>
                            <Badge variant={hold.isActive ? "destructive" : "secondary"}>
                              {hold.isActive ? (
                                <>
                                  <Lock className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Released
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{hold.reason}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {hold.dataTypes.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {DATA_TYPES.find(t => t.value === type)?.label}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span>Started: {hold.startDate.toLocaleDateString()}</span>
                            <span>Records: {hold.affectedRecords.toLocaleString()}</span>
                            <span>By: {hold.createdBy}</span>
                          </div>
                        </div>
                        {hold.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReleaseHold(hold.id)}
                          >
                            <Unlock className="w-4 h-4 mr-1" />
                            Release
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {jobs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No archival jobs have been run
                    </CardContent>
                  </Card>
                ) : (
                  jobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{job.policyName}</span>
                              <Badge
                                variant={
                                  job.status === 'completed' ? 'default' :
                                  job.status === 'running' ? 'secondary' :
                                  job.status === 'failed' ? 'destructive' :
                                  'outline'
                                }
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Started: {job.startedAt.toLocaleString()}
                              {job.completedAt && ` • Completed: ${job.completedAt.toLocaleString()}`}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div>{job.recordsProcessed} processed</div>
                            <div className="text-green-600">{job.recordsArchived} archived</div>
                            {job.recordsFailed > 0 && (
                              <div className="text-red-600">{job.recordsFailed} failed</div>
                            )}
                          </div>
                        </div>
                        {job.status === 'running' && (
                          <Progress value={45} className="mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Create Policy Dialog */}
        <Dialog open={isCreatePolicyOpen} onOpenChange={setIsCreatePolicyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Retention Policy</DialogTitle>
              <DialogDescription>
                Define rules for automatic data archival and cleanup
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Policy Name</Label>
                <Input
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  placeholder="e.g., Old Documents Cleanup"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Describe what this policy does..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select
                    value={newPolicy.dataType}
                    onValueChange={(v) => setNewPolicy({ ...newPolicy, dataType: v as DataType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Retention Period (days)</Label>
                  <Input
                    type="number"
                    value={newPolicy.retentionPeriod}
                    onChange={(e) => setNewPolicy({ ...newPolicy, retentionPeriod: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={newPolicy.action}
                  onValueChange={(v) => setNewPolicy({ ...newPolicy, action: v as RetentionAction })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="flex items-center gap-2">
                          {action.icon}
                          {action.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatePolicyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePolicy}>Create Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Legal Hold Dialog */}
        <Dialog open={isCreateHoldOpen} onOpenChange={setIsCreateHoldOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Legal Hold</DialogTitle>
              <DialogDescription>
                Prevent data from being archived or deleted during legal proceedings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Hold Name</Label>
                <Input
                  value={newHold.name}
                  onChange={(e) => setNewHold({ ...newHold, name: e.target.value })}
                  placeholder="e.g., Case #12345 Hold"
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={newHold.reason}
                  onChange={(e) => setNewHold({ ...newHold, reason: e.target.value })}
                  placeholder="Legal case reference and reason for hold..."
                />
              </div>
              <div className="space-y-2">
                <Label>Data Types to Hold</Label>
                <div className="flex flex-wrap gap-2">
                  {DATA_TYPES.map((type) => (
                    <Badge
                      key={type.value}
                      variant={newHold.dataTypes.includes(type.value) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const types = newHold.dataTypes.includes(type.value)
                          ? newHold.dataTypes.filter(t => t !== type.value)
                          : [...newHold.dataTypes, type.value];
                        setNewHold({ ...newHold, dataTypes: types });
                      }}
                    >
                      {type.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateHoldOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateHold}>Create Hold</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
