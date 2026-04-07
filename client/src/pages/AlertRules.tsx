import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Plus, Edit2, Trash2, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function AlertRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState([
    { id: 1, name: "High Error Rate", condition: "error_rate > 1%", action: "notify_admin", priority: "critical", enabled: true },
    { id: 2, name: "Low Uptime", condition: "uptime < 99%", action: "escalate", priority: "high", enabled: true },
    { id: 3, name: "High Latency", condition: "latency > 500ms", action: "alert_team", priority: "medium", enabled: false },
  ]);
  const [showForm, setShowForm] = useState(false);

  const priorities = ["critical", "high", "medium", "low"];
  const actions = ["notify_admin", "escalate", "alert_team", "auto_remediate", "log_only"];

  const handleDelete = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleToggle = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Alert Rules</h1>
            <p className="text-muted-foreground mt-2">Create and manage custom alert rules for system monitoring</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>

        {/* New Rule Form */}
        {showForm && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <h2 className="text-xl font-bold mb-4">Create New Alert Rule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g., Database Connection Failure"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Condition</label>
                <input
                  type="text"
                  placeholder="e.g., db_connections < 5"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  {priorities.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  {actions.map(a => (
                    <option key={a} value={a}>{a.replace(/_/g, ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Create Rule</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-4">
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
                    <div>
                      <h3 className="font-semibold text-foreground">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">Condition: {rule.condition}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    rule.priority === "critical" ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-200" :
                    rule.priority === "high" ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200" :
                    rule.priority === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-200" :
                    "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200"
                  }`}>
                    {rule.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {rule.action.replace(/_/g, ' ')}
                  </span>
                  <Button variant="ghost" size="sm">
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
          ))}
        </div>

        {/* Rule Templates */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Rule Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Performance Degradation", condition: "response_time > 1000ms" },
              { name: "Resource Exhaustion", condition: "cpu_usage > 90%" },
              { name: "Security Alert", condition: "failed_logins > 5" },
              { name: "Data Sync Failure", condition: "sync_errors > 0" },
            ].map((template, idx) => (
              <button
                key={idx}
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
