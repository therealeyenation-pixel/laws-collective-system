import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  Save,
  History,
  Building2,
  DollarSign,
  Calculator,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  Users,
  FileText,
  Gamepad2,
  BookOpen,
  Settings,
} from "lucide-react";

const sandboxTypeIcons: Record<string, React.ReactNode> = {
  financial: <DollarSign className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
  game: <Gamepad2 className="w-5 h-5" />,
  curriculum: <BookOpen className="w-5 h-5" />,
  full: <FlaskConical className="w-5 h-5" />,
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function Sandbox() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showEntityDialog, setShowEntityDialog] = useState(false);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);

  // Form states
  const [sessionName, setSessionName] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("deposit");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState<string>("llc");
  const [entityBalance, setEntityBalance] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [interHouseSplit, setInterHouseSplit] = useState("60");
  const [intraHouseSplit, setIntraHouseSplit] = useState("70");
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotDescription, setSnapshotDescription] = useState("");

  // Queries
  const { data: templates, isLoading: templatesLoading } = trpc.sandbox.getTemplates.useQuery();
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = trpc.sandbox.getSessions.useQuery();
  const { data: activeSession, refetch: refetchActiveSession } = trpc.sandbox.getActiveSession.useQuery();
  const { data: stats } = trpc.sandbox.getStats.useQuery();

  // Get session details if active
  const { data: sessionDetails, refetch: refetchSessionDetails } = trpc.sandbox.getSession.useQuery(
    { sessionId: activeSession?.id || 0 },
    { enabled: !!activeSession }
  );

  const { data: snapshots, refetch: refetchSnapshots } = trpc.sandbox.getSnapshots.useQuery(
    { sessionId: activeSession?.id || 0 },
    { enabled: !!activeSession }
  );

  // Mutations
  const createSessionMutation = trpc.sandbox.createSession.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowCreateDialog(false);
      setSessionName("");
      setSessionDescription("");
      setSelectedTemplate("");
      refetchSessions();
      refetchActiveSession();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const executeTransactionMutation = trpc.sandbox.executeTransaction.useMutation({
    onSuccess: (data) => {
      toast.success(`Transaction completed: $${data.amount.toFixed(2)} ${data.transactionType}`);
      setShowTransactionDialog(false);
      setTransactionAmount("");
      setTransactionDescription("");
      refetchSessionDetails();
      refetchActiveSession();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createEntityMutation = trpc.sandbox.createEntity.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowEntityDialog(false);
      setEntityName("");
      setEntityBalance("");
      refetchSessionDetails();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const testSplitMutation = trpc.sandbox.testSplitCalculation.useMutation({
    onSuccess: (data) => {
      toast.success("Split calculation completed");
      refetchSessionDetails();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const saveSnapshotMutation = trpc.sandbox.saveSnapshot.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowSnapshotDialog(false);
      setSnapshotName("");
      setSnapshotDescription("");
      refetchSnapshots();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const restoreSnapshotMutation = trpc.sandbox.restoreSnapshot.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchSessionDetails();
      refetchActiveSession();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetSessionMutation = trpc.sandbox.resetSession.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchSessionDetails();
      refetchActiveSession();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const endSessionMutation = trpc.sandbox.endSession.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchSessions();
      refetchActiveSession();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const seedTemplatesMutation = trpc.sandbox.seedTemplates.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateSession = () => {
    createSessionMutation.mutate({
      sessionName,
      description: sessionDescription || undefined,
      templateId: selectedTemplate ? parseInt(selectedTemplate) : undefined,
    });
  };

  const handleExecuteTransaction = () => {
    if (!activeSession) return;
    executeTransactionMutation.mutate({
      sessionId: activeSession.id,
      transactionType: transactionType as any,
      amount: parseFloat(transactionAmount),
      description: transactionDescription || undefined,
    });
  };

  const handleCreateEntity = () => {
    if (!activeSession) return;
    createEntityMutation.mutate({
      sessionId: activeSession.id,
      entityName,
      entityType: entityType as any,
      initialBalance: entityBalance ? parseFloat(entityBalance) : 0,
    });
  };

  const handleTestSplit = () => {
    if (!activeSession) return;
    testSplitMutation.mutate({
      sessionId: activeSession.id,
      amount: parseFloat(splitAmount),
      interHouseSplit: parseInt(interHouseSplit),
      intraHouseSplit: parseInt(intraHouseSplit),
    });
  };

  const handleSaveSnapshot = () => {
    if (!activeSession) return;
    saveSnapshotMutation.mutate({
      sessionId: activeSession.id,
      snapshotName,
      description: snapshotDescription || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FlaskConical className="w-8 h-8 text-primary" />
              Sandbox Environment
            </h1>
            <p className="text-muted-foreground mt-1">
              Test system features safely without affecting production data
            </p>
          </div>
          <div className="flex gap-2">
            {activeSession && (
              <Badge variant="outline" className="gap-2 py-2 px-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Active: {activeSession.sessionName}
              </Badge>
            )}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Sandbox
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Sandbox Session</DialogTitle>
                  <DialogDescription>
                    Start a new sandbox environment to test features safely
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionName">Session Name</Label>
                    <Input
                      id="sessionName"
                      placeholder="My Test Session"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionDescription">Description (Optional)</Label>
                    <Textarea
                      id="sessionDescription"
                      placeholder="What are you testing?"
                      value={sessionDescription}
                      onChange={(e) => setSessionDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Template (Optional)</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates?.map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            <div className="flex items-center gap-2">
                              {sandboxTypeIcons[template.sandboxType]}
                              {template.templateName}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSession}
                    disabled={!sessionName || createSessionMutation.isPending}
                  >
                    {createSessionMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Start Sandbox
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
                <p className="text-sm text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{stats.completedSessions}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.totalOperations}</div>
                <p className="text-sm text-muted-foreground">Operations</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="workspace" disabled={!activeSession}>
              Workspace
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="snapshots" disabled={!activeSession}>
              Snapshots
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {activeSession ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {sandboxTypeIcons[activeSession.sandboxType]}
                        {activeSession.sessionName}
                      </CardTitle>
                      <CardDescription>{activeSession.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetSessionMutation.mutate({ sessionId: activeSession.id })}
                        disabled={resetSessionMutation.isPending}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => endSessionMutation.mutate({ sessionId: activeSession.id })}
                        disabled={endSessionMutation.isPending}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        End Session
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Wallet className="w-4 h-4" />
                        Current Balance
                      </div>
                      <div className="text-2xl font-bold">
                        ${parseFloat(activeSession.currentBalance || "0").toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <PiggyBank className="w-4 h-4" />
                        Initial Balance
                      </div>
                      <div className="text-2xl font-bold">
                        ${parseFloat(activeSession.initialBalance || "0").toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Transactions
                      </div>
                      <div className="text-2xl font-bold">{activeSession.totalTransactions || 0}</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Settings className="w-4 h-4" />
                        Operations
                      </div>
                      <div className="text-2xl font-bold">{activeSession.totalOperations || 0}</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setShowTransactionDialog(true)}>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add Transaction
                    </Button>
                    <Button variant="outline" onClick={() => setShowEntityDialog(true)}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Create Entity
                    </Button>
                    <Button variant="outline" onClick={() => setShowSplitDialog(true)}>
                      <Calculator className="w-4 h-4 mr-2" />
                      Test Split
                    </Button>
                    <Button variant="outline" onClick={() => setShowSnapshotDialog(true)}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Snapshot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FlaskConical className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Sandbox</h3>
                    <p className="text-muted-foreground mb-4">
                      Create a new sandbox session to start testing
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Sandbox
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {sessionDetails && (
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sessionDetails.transactions.length > 0 ? (
                      <div className="space-y-2">
                        {sessionDetails.transactions.slice(0, 5).map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-2 bg-muted rounded"
                          >
                            <div>
                              <div className="font-medium capitalize">
                                {tx.transactionType.replace(/_/g, " ")}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tx.description || "No description"}
                              </div>
                            </div>
                            <div
                              className={`font-bold ${
                                ["deposit", "token_earn", "dividend", "refund"].includes(tx.transactionType)
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {["deposit", "token_earn", "dividend", "refund"].includes(tx.transactionType)
                                ? "+"
                                : "-"}
                              ${parseFloat(tx.amount).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No transactions yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sandbox Entities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sessionDetails.entities.length > 0 ? (
                      <div className="space-y-2">
                        {sessionDetails.entities.map((entity) => (
                          <div
                            key={entity.id}
                            className="flex items-center justify-between p-2 bg-muted rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{entity.entityName}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {entity.entityType}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                ${parseFloat(entity.balance || "0").toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {entity.interHouseSplit}/{entity.intraHouseSplit} split
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No entities created</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => seedTemplatesMutation.mutate()}
                disabled={seedTemplatesMutation.isPending}
              >
                {seedTemplatesMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Seed Templates
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {sandboxTypeIcons[template.sandboxType]}
                        <CardTitle className="text-lg">{template.templateName}</CardTitle>
                      </div>
                      <Badge className={difficultyColors[template.difficulty || "beginner"]}>
                        {template.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Starting Balance</span>
                        <span className="font-medium">
                          ${parseFloat(template.initialBalance || "0").toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{template.estimatedDuration} min</span>
                      </div>
                      {template.learningObjectives && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Learning Objectives:</p>
                          <ul className="text-xs space-y-1">
                            {(template.learningObjectives as string[]).slice(0, 3).map((obj, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Button
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedTemplate(template.id.toString());
                          setSessionName(`${template.templateName} Session`);
                          setShowCreateDialog(true);
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start This Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Workspace Tab */}
          <TabsContent value="workspace" className="space-y-4">
            {activeSession && sessionDetails && (
              <>
                {/* Split Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Split Calculator
                    </CardTitle>
                    <CardDescription>
                      Test the 60/40 house/collective and 70/30 house/inheritance splits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Amount to Split</Label>
                          <Input
                            type="number"
                            placeholder="10000"
                            value={splitAmount}
                            onChange={(e) => setSplitAmount(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Inter-House Split (House %)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={interHouseSplit}
                            onChange={(e) => setInterHouseSplit(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Default: 60% house / 40% collective
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Intra-House Split (House Operations %)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={intraHouseSplit}
                            onChange={(e) => setIntraHouseSplit(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Default: 70% house / 30% inheritance
                          </p>
                        </div>
                        <Button
                          onClick={handleTestSplit}
                          disabled={!splitAmount || testSplitMutation.isPending}
                          className="w-full"
                        >
                          {testSplitMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Calculator className="w-4 h-4 mr-2" />
                          )}
                          Calculate Split
                        </Button>
                      </div>

                      {testSplitMutation.data && (
                        <div className="space-y-4">
                          <h4 className="font-semibold">Results</h4>
                          <div className="space-y-2">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                              <p className="text-sm text-muted-foreground">House Share (60%)</p>
                              <p className="text-xl font-bold text-blue-600">
                                ${testSplitMutation.data.interHouseSplit.houseShare.toLocaleString()}
                              </p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded">
                              <p className="text-sm text-muted-foreground">Collective Share (40%)</p>
                              <p className="text-xl font-bold text-purple-600">
                                ${testSplitMutation.data.interHouseSplit.collectiveShare.toLocaleString()}
                              </p>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <p className="text-sm font-medium mb-2">House Internal Split:</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-green-50 dark:bg-green-950 rounded">
                                  <p className="text-xs text-muted-foreground">Operations (70%)</p>
                                  <p className="font-bold text-green-600">
                                    ${testSplitMutation.data.intraHouseSplit.operationsShare.toLocaleString()}
                                  </p>
                                </div>
                                <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded">
                                  <p className="text-xs text-muted-foreground">Inheritance (30%)</p>
                                  <p className="font-bold text-amber-600">
                                    ${testSplitMutation.data.intraHouseSplit.inheritanceShare.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Operations Log */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Operations Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sessionDetails.operations.length > 0 ? (
                      <div className="space-y-2">
                        {sessionDetails.operations.map((op) => (
                          <div
                            key={op.id}
                            className="flex items-center justify-between p-3 bg-muted rounded"
                          >
                            <div>
                              <div className="font-medium">{op.operationName}</div>
                              <div className="text-xs text-muted-foreground">
                                {op.operationType} • {new Date(op.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <Badge
                              variant={op.status === "success" ? "default" : "destructive"}
                            >
                              {op.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No operations yet</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>All your sandbox sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {sandboxTypeIcons[session.sandboxType]}
                          <div>
                            <div className="font-medium">{session.sessionName}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.description || "No description"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created: {new Date(session.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold">
                              ${parseFloat(session.currentBalance || "0").toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.totalTransactions || 0} transactions
                            </div>
                          </div>
                          <Badge
                            variant={session.status === "active" ? "default" : "secondary"}
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No sessions yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Snapshots Tab */}
          <TabsContent value="snapshots" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Saved Snapshots</CardTitle>
                    <CardDescription>Save and restore sandbox states</CardDescription>
                  </div>
                  <Button onClick={() => setShowSnapshotDialog(true)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Snapshot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {snapshots && snapshots.length > 0 ? (
                  <div className="space-y-2">
                    {snapshots.map((snapshot) => (
                      <div
                        key={snapshot.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{snapshot.snapshotName}</div>
                          <div className="text-sm text-muted-foreground">
                            {snapshot.description || "No description"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(snapshot.createdAt).toLocaleString()} •{" "}
                            {snapshot.transactionsCount} transactions
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreSnapshotMutation.mutate({ snapshotId: snapshot.id })}
                          disabled={restoreSnapshotMutation.isPending}
                        >
                          <History className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No snapshots saved</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transaction Dialog */}
        <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>Record a sandbox transaction</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="split_allocation">Split Allocation</SelectItem>
                    <SelectItem value="token_earn">Token Earn</SelectItem>
                    <SelectItem value="token_spend">Token Spend</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="dividend">Dividend</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Transaction description"
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTransactionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteTransaction}
                disabled={!transactionAmount || executeTransactionMutation.isPending}
              >
                {executeTransactionMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Execute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Entity Dialog */}
        <Dialog open={showEntityDialog} onOpenChange={setShowEntityDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sandbox Entity</DialogTitle>
              <DialogDescription>Create a test business entity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Entity Name</Label>
                <Input
                  placeholder="Test LLC"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="collective">Collective</SelectItem>
                    <SelectItem value="508c1a">508(c)(1)(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial Balance</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={entityBalance}
                  onChange={(e) => setEntityBalance(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEntityDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateEntity}
                disabled={!entityName || createEntityMutation.isPending}
              >
                {createEntityMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Create Entity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Split Test Dialog */}
        <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Split Calculation</DialogTitle>
              <DialogDescription>
                Test the 60/40 and 70/30 split formulas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Inter-House (House %)</Label>
                  <Input
                    type="number"
                    value={interHouseSplit}
                    onChange={(e) => setInterHouseSplit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Intra-House (Operations %)</Label>
                  <Input
                    type="number"
                    value={intraHouseSplit}
                    onChange={(e) => setIntraHouseSplit(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSplitDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleTestSplit();
                  setShowSplitDialog(false);
                }}
                disabled={!splitAmount || testSplitMutation.isPending}
              >
                Calculate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Snapshot Dialog */}
        <Dialog open={showSnapshotDialog} onOpenChange={setShowSnapshotDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Snapshot</DialogTitle>
              <DialogDescription>Save the current sandbox state</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Snapshot Name</Label>
                <Input
                  placeholder="Before major changes"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="What state are you saving?"
                  value={snapshotDescription}
                  onChange={(e) => setSnapshotDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSnapshotDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSnapshot}
                disabled={!snapshotName || saveSnapshotMutation.isPending}
              >
                {saveSnapshotMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Save Snapshot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
