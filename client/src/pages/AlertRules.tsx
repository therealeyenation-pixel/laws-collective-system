import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Plus, Edit2, Trash2, CheckCircle, Save, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  createdAt: number;
  lastTriggered?: number;
  triggerCount: number;
}

export default function AlertRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState<AlertRule[]>([
    { id: '1', name: "High Error Rate", condition: "error_rate > 1%", action: "notify_admin", priority: "critical", enabled: true, createdAt: Date.now(), triggerCount: 3 },
    { id: '2', name: "Low Uptime", condition: "uptime < 99%", action: "escalate", priority: "high", enabled: true, createdAt: Date.now() - 86400000, triggerCount: 1 },
    { id: '3', name: "High Latency", condition: "latency > 500ms", action: "alert_team", priority: "medium", enabled: false, createdAt: Date.now() - 172800000, triggerCount: 5 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    priority: 'medium' as const,
    action: 'notify_admin' as const,
  });

  // Fetch rules from backend
  const { data: backendRules, isLoading } = trpc.system.getAlertRules.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id, refetchInterval: 30000 }
  );

  // Create/update rule mutation
  const createRuleMutation = trpc.system.createAlertRule.useMutation({
    onSuccess: () => {
      toast.success('Rule created successfully');
      setFormData({ name: '', condition: '', priority: 'medium', action: 'notify_admin' });
      setShowForm(false);
    },
    onError: () => toast.error('Failed to create rule'),
  });

  // Delete rule mutation
  const deleteRuleMutation = trpc.system.deleteAlertRule.useMutation({
    onSuccess: () => toast.success('Rule deleted'),
    onError: () => toast.error('Failed to delete rule'),
  });

  const priorities = ["critical", "high", "medium", "low"];
  const actions = ["notify_admin", "escalate", "alert_team", "auto_remediate", "log_only"];

  const handleCreateRule = () => {
    if (!formData.name || !formData.condition) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingId) {
      // Update existing rule
      setRules(rules.map(r => r.id === editingId ? { ...r, ...formData } : r));
      setEditingId(null);
      toast.success('Rule updated');
    } else {
      // Create new rule
      const newRule: AlertRule = {
        id: Date.now().toString(),
        ...formData,
        enabled: true,
        createdAt: Date.now(),
        triggerCount: 0,
      };
      setRules([newRule, ...rules]);
      createRuleMutation.mutate({ userId: user?.id || '', rule: newRule });
    }

    setFormData({ name: '', condition: '', priority: 'medium', action: 'notify_admin' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    deleteRuleMutation.mutate({ userId: user?.id || '', ruleId: id });
  };

  const handleToggle = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleEdit = (rule: AlertRule) => {
    setFormData({
      name: rule.name,
      condition: rule.condition,
      priority: rule.priority,
      action: rule.action as any,
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const getSeverityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Alert Rules</h1>
            <p className="text-muted-foreground mt-2">Create and manage custom alert rules for system monitoring</p>
          </div>
          <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', condition: '', priority: 'medium', action: 'notify_admin' }); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Rules</p>
            <p className="text-2xl font-bold text-foreground">{rules.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active Rules</p>
            <p className="text-2xl font-bold text-green-600">{rules.filter(r => r.enabled).length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Critical Priority</p>
            <p className="text-2xl font-bold text-red-600">{rules.filter(r => r.priority === 'critical').length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Triggers</p>
            <p className="text-2xl font-bold text-foreground">{rules.reduce((sum, r) => sum + r.triggerCount, 0)}</p>
          </Card>
        </div>

        {/* New Rule Form */}
        {showForm && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Alert Rule' : 'Create New Alert Rule'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g., Database Connection Failure"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Condition</label>
                <input
                  type="text"
                  placeholder="e.g., db_connections < 5"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {priorities.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <select 
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {actions.map(a => (
                    <option key={a} value={a}>{a.replace(/_/g, ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCreateRule}>
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update Rule' : 'Create Rule'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => { setShowForm(false); setEditingId(null); }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Rules List */}
        <div className="space-y-3 mb-8">
          {rules.length > 0 ? (
            rules.map((rule) => (
              <Card key={rule.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(rule.id)}
                        className={`p-2 rounded-lg transition-all ${
                          rule.enabled
                            ? "bg-green-100 text-green-600 dark:bg-green-950/30"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-950/30"
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">Condition: {rule.condition}</p>
                        <p className="text-xs text-muted-foreground mt-1">Triggered {rule.triggerCount} times • Created {new Date(rule.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(rule.priority)}`}>
                      {rule.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {rule.action.replace(/_/g, ' ')}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(rule)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No alert rules configured. Create your first rule to get started.
            </Card>
          )}
        </div>

        {/* Rule Templates */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Performance Degradation", condition: "response_time > 1000ms", priority: "high" },
              { name: "Resource Exhaustion", condition: "cpu_usage > 90%", priority: "critical" },
              { name: "Security Alert", condition: "failed_logins > 5", priority: "critical" },
              { name: "Data Sync Failure", condition: "sync_errors > 0", priority: "high" },
            ].map((template, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFormData({
                    name: template.name,
                    condition: template.condition,
                    priority: template.priority as any,
                    action: 'notify_admin',
                  });
                  setShowForm(true);
                }}
                className="p-3 border border-border rounded-lg hover:bg-muted transition-all text-left"
              >
                <p className="font-semibold text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{template.condition}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
