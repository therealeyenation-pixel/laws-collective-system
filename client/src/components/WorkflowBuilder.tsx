import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Play,
  Save,
  X,
  ChevronDown,
  Settings,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  config: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TRIGGER_TYPES = [
  { id: "manual", label: "Manual Trigger", icon: "▶️" },
  { id: "schedule", label: "Scheduled", icon: "⏰" },
  { id: "webhook", label: "Webhook", icon: "🔗" },
  { id: "event", label: "Event", icon: "⚡" },
  { id: "condition", label: "Condition", icon: "❓" },
];

const ACTION_TYPES = [
  { id: "notification", label: "Send Notification", icon: "🔔" },
  { id: "email", label: "Send Email", icon: "📧" },
  { id: "sms", label: "Send SMS", icon: "📱" },
  { id: "database", label: "Database Action", icon: "💾" },
  { id: "webhook", label: "Call Webhook", icon: "🌐" },
  { id: "delay", label: "Delay", icon: "⏱️" },
];

const CONDITION_TYPES = [
  { id: "equals", label: "Equals", icon: "=" },
  { id: "notEquals", label: "Not Equals", icon: "≠" },
  { id: "greaterThan", label: "Greater Than", icon: ">" },
  { id: "lessThan", label: "Less Than", icon: "<" },
  { id: "contains", label: "Contains", icon: "∋" },
  { id: "exists", label: "Exists", icon: "✓" },
];

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [nodeType, setNodeType] = useState<"trigger" | "action" | "condition">(
    "action"
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");

  const createNewWorkflow = useCallback(() => {
    const workflow: Workflow = {
      id: `wf_${Date.now()}`,
      name: "New Workflow",
      description: "",
      nodes: [],
      enabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCurrentWorkflow(workflow);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description);
  }, []);

  const addNode = useCallback(
    (type: "trigger" | "action" | "condition", nodeTypeId: string) => {
      if (!currentWorkflow) return;

      const newNode: WorkflowNode = {
        id: `node_${Date.now()}`,
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${nodeTypeId}`,
        config: { nodeTypeId },
      };

      const updatedWorkflow = {
        ...currentWorkflow,
        nodes: [...currentWorkflow.nodes, newNode],
        updatedAt: new Date(),
      };

      setCurrentWorkflow(updatedWorkflow);
      setShowNodeSelector(false);
      toast.success(`${type} node added`);
    },
    [currentWorkflow]
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      if (!currentWorkflow) return;

      const updatedWorkflow = {
        ...currentWorkflow,
        nodes: currentWorkflow.nodes.filter((n) => n.id !== nodeId),
        updatedAt: new Date(),
      };

      setCurrentWorkflow(updatedWorkflow);
      setSelectedNode(null);
      toast.success("Node removed");
    },
    [currentWorkflow]
  );

  const updateNodeConfig = useCallback(
    (nodeId: string, config: Record<string, any>) => {
      if (!currentWorkflow) return;

      const updatedWorkflow = {
        ...currentWorkflow,
        nodes: currentWorkflow.nodes.map((n) =>
          n.id === nodeId ? { ...n, config } : n
        ),
        updatedAt: new Date(),
      };

      setCurrentWorkflow(updatedWorkflow);
    },
    [currentWorkflow]
  );

  const saveWorkflow = useCallback(() => {
    if (!currentWorkflow || !workflowName.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    if (currentWorkflow.nodes.length === 0) {
      toast.error("Workflow must have at least one node");
      return;
    }

    const updatedWorkflow = {
      ...currentWorkflow,
      name: workflowName,
      description: workflowDescription,
      updatedAt: new Date(),
    };

    const existingIndex = workflows.findIndex((w) => w.id === updatedWorkflow.id);

    if (existingIndex >= 0) {
      const updatedWorkflows = [...workflows];
      updatedWorkflows[existingIndex] = updatedWorkflow;
      setWorkflows(updatedWorkflows);
    } else {
      setWorkflows([...workflows, updatedWorkflow]);
    }

    setCurrentWorkflow(updatedWorkflow);
    toast.success("Workflow saved successfully");
  }, [currentWorkflow, workflowName, workflowDescription, workflows]);

  const executeWorkflow = useCallback(() => {
    if (!currentWorkflow || currentWorkflow.nodes.length === 0) {
      toast.error("Cannot execute empty workflow");
      return;
    }

    toast.success("Workflow execution started");
    // In production, call tRPC mutation to execute
  }, [currentWorkflow]);

  const getNodeTypeLabel = (type: string, nodeTypeId: string) => {
    if (type === "trigger") {
      return TRIGGER_TYPES.find((t) => t.id === nodeTypeId)?.label || nodeTypeId;
    } else if (type === "action") {
      return ACTION_TYPES.find((a) => a.id === nodeTypeId)?.label || nodeTypeId;
    } else if (type === "condition") {
      return CONDITION_TYPES.find((c) => c.id === nodeTypeId)?.label || nodeTypeId;
    }
    return nodeTypeId;
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "trigger":
        return "bg-green-100 border-green-300";
      case "action":
        return "bg-blue-100 border-blue-300";
      case "condition":
        return "bg-yellow-100 border-yellow-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  if (!currentWorkflow) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Workflow Builder</h2>
          <p className="text-muted-foreground mb-4">
            Create automated workflows by combining triggers, actions, and conditions.
          </p>
          <Button onClick={createNewWorkflow} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create New Workflow
          </Button>
        </Card>

        {workflows.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Saved Workflows</h3>
            <div className="space-y-2">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setCurrentWorkflow(wf);
                    setWorkflowName(wf.name);
                    setWorkflowDescription(wf.description);
                  }}
                >
                  <div>
                    <p className="font-medium">{wf.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {wf.nodes.length} nodes
                    </p>
                  </div>
                  <Badge variant={wf.enabled ? "default" : "secondary"}>
                    {wf.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Workflow Header */}
      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Workflow Name</label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full px-3 py-2 border rounded mt-1"
              placeholder="Enter workflow name"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded mt-1"
              placeholder="Enter workflow description"
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Workflow Canvas */}
      <Card className="p-6 min-h-96">
        <div className="space-y-3">
          {currentWorkflow.nodes.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">No nodes added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a trigger to get started
              </p>
            </div>
          ) : (
            currentWorkflow.nodes.map((node, index) => (
              <div key={node.id}>
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${getNodeColor(node.type)} ${
                    selectedNode === node.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className="mb-2">
                        {node.type.toUpperCase()}
                      </Badge>
                      <p className="font-semibold">{node.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {node.id}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNode(node.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedNode === node.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div>
                        <label className="text-xs font-semibold">Config</label>
                        <textarea
                          value={JSON.stringify(node.config, null, 2)}
                          onChange={(e) => {
                            try {
                              updateNodeConfig(
                                node.id,
                                JSON.parse(e.target.value)
                              );
                            } catch {
                              // Invalid JSON
                            }
                          }}
                          className="w-full px-2 py-1 text-xs border rounded mt-1 font-mono"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {index < currentWorkflow.nodes.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Node Selector */}
      {showNodeSelector && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Add Node</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNodeSelector(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {nodeType === "trigger" && (
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_TYPES.map((t) => (
                  <Button
                    key={t.id}
                    variant="outline"
                    onClick={() => addNode("trigger", t.id)}
                    className="justify-start"
                  >
                    <span className="mr-2">{t.icon}</span>
                    {t.label}
                  </Button>
                ))}
              </div>
            )}

            {nodeType === "action" && (
              <div className="grid grid-cols-2 gap-2">
                {ACTION_TYPES.map((a) => (
                  <Button
                    key={a.id}
                    variant="outline"
                    onClick={() => addNode("action", a.id)}
                    className="justify-start"
                  >
                    <span className="mr-2">{a.icon}</span>
                    {a.label}
                  </Button>
                ))}
              </div>
            )}

            {nodeType === "condition" && (
              <div className="grid grid-cols-2 gap-2">
                {CONDITION_TYPES.map((c) => (
                  <Button
                    key={c.id}
                    variant="outline"
                    onClick={() => addNode("condition", c.id)}
                    className="justify-start"
                  >
                    <span className="mr-2">{c.icon}</span>
                    {c.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant={nodeType === "trigger" ? "default" : "outline"}
                onClick={() => setNodeType("trigger")}
                className="flex-1"
              >
                Triggers
              </Button>
              <Button
                size="sm"
                variant={nodeType === "action" ? "default" : "outline"}
                onClick={() => setNodeType("action")}
                className="flex-1"
              >
                Actions
              </Button>
              <Button
                size="sm"
                variant={nodeType === "condition" ? "default" : "outline"}
                onClick={() => setNodeType("condition")}
                className="flex-1"
              >
                Conditions
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <Button onClick={() => setShowNodeSelector(!showNodeSelector)} variant="outline" className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Add Node
        </Button>
        <Button onClick={saveWorkflow} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save Workflow
        </Button>
        <Button
          onClick={executeWorkflow}
          variant="default"
          className="flex-1"
        >
          <Play className="w-4 h-4 mr-2" />
          Execute
        </Button>
        <Button
          onClick={() => {
            setCurrentWorkflow(null);
            setSelectedNode(null);
          }}
          variant="outline"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
