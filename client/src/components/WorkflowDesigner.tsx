import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Plus,
  Trash2,
  Play,
  Save,
  Copy,
  ArrowRight,
  Clock,
  AlertCircle,
  Mail,
  MessageSquare,
  Database,
  Webhook,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";

interface WorkflowNode {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TRIGGER_TYPES = [
  { id: "event", label: "Event", icon: AlertCircle },
  { id: "schedule", label: "Schedule", icon: Clock },
  { id: "webhook", label: "Webhook", icon: Webhook },
  { id: "condition", label: "Condition", icon: GitBranch },
  { id: "manual", label: "Manual", icon: Play },
];

const ACTION_TYPES = [
  { id: "notification", label: "Send Notification", icon: AlertCircle },
  { id: "email", label: "Send Email", icon: Mail },
  { id: "sms", label: "Send SMS", icon: MessageSquare },
  { id: "database", label: "Database Operation", icon: Database },
  { id: "webhook", label: "Call Webhook", icon: Webhook },
  { id: "conditional", label: "Conditional", icon: GitBranch },
];

export function WorkflowDesigner() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [nodeType, setNodeType] = useState<"trigger" | "action" | "condition">(
    "trigger"
  );
  const [selectedAction, setSelectedAction] = useState("");

  const addNode = useCallback(
    (type: "trigger" | "action" | "condition", actionType: string) => {
      const newNode: WorkflowNode = {
        id: `node_${Date.now()}`,
        type,
        label: actionType,
        config: {},
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
      };
      setNodes([...nodes, newNode]);
      setShowNodeDialog(false);
      setSelectedAction("");
      toast.success(`${actionType} added to workflow`);
    },
    [nodes]
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes(nodes.filter((n) => n.id !== nodeId));
      setEdges(edges.filter((e) => e.from !== nodeId && e.to !== nodeId));
      toast.success("Node removed");
    },
    [nodes, edges]
  );

  const connectNodes = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) {
        toast.error("Cannot connect node to itself");
        return;
      }

      const edgeExists = edges.some((e) => e.from === fromId && e.to === toId);
      if (edgeExists) {
        toast.error("Connection already exists");
        return;
      }

      const newEdge: WorkflowEdge = {
        id: `edge_${Date.now()}`,
        from: fromId,
        to: toId,
      };
      setEdges([...edges, newEdge]);
      toast.success("Nodes connected");
    },
    [edges]
  );

  const saveWorkflow = useCallback(() => {
    if (!workflowName.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    if (nodes.length === 0) {
      toast.error("Workflow must have at least one node");
      return;
    }

    const workflow: Workflow = {
      id: currentWorkflow?.id || `workflow_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      nodes,
      edges,
      enabled: true,
      createdAt: currentWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (currentWorkflow) {
      setWorkflows(
        workflows.map((w) => (w.id === workflow.id ? workflow : w))
      );
      toast.success("Workflow updated");
    } else {
      setWorkflows([...workflows, workflow]);
      toast.success("Workflow saved");
    }

    resetWorkflow();
  }, [workflowName, workflowDescription, nodes, edges, currentWorkflow, workflows]);

  const resetWorkflow = useCallback(() => {
    setCurrentWorkflow(null);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setWorkflowName("");
    setWorkflowDescription("");
  }, []);

  const loadWorkflow = useCallback((workflow: Workflow) => {
    setCurrentWorkflow(workflow);
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description);
  }, []);

  const deleteWorkflow = useCallback(
    (workflowId: string) => {
      setWorkflows(workflows.filter((w) => w.id !== workflowId));
      if (currentWorkflow?.id === workflowId) {
        resetWorkflow();
      }
      toast.success("Workflow deleted");
    },
    [workflows, currentWorkflow, resetWorkflow]
  );

  const duplicateWorkflow = useCallback(
    (workflow: Workflow) => {
      const newWorkflow: Workflow = {
        ...workflow,
        id: `workflow_${Date.now()}`,
        name: `${workflow.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setWorkflows([...workflows, newWorkflow]);
      toast.success("Workflow duplicated");
    },
    [workflows]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Designer</h2>
        <Button onClick={resetWorkflow} variant="outline">
          New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Workflow Canvas */}
        <div className="col-span-2">
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-96">
            <div className="space-y-4">
              <div>
                <Label>Workflow Name</Label>
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Enter workflow description"
                  className="mt-2"
                />
              </div>

              {/* Canvas */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 min-h-80 bg-white dark:bg-slate-950 relative overflow-auto">
                {nodes.length === 0 ? (
                  <div className="flex items-center justify-center h-80 text-slate-400">
                    <div className="text-center">
                      <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Add triggers and actions to start</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nodes.map((node, index) => (
                      <div key={node.id} className="flex items-center gap-2">
                        <Card
                          className={`p-3 cursor-pointer flex-1 transition-all ${
                            selectedNode === node.id
                              ? "ring-2 ring-blue-500"
                              : "hover:shadow-md"
                          }`}
                          onClick={() => setSelectedNode(node.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  node.type === "trigger"
                                    ? "bg-green-500"
                                    : node.type === "action"
                                      ? "bg-blue-500"
                                      : "bg-purple-500"
                                }`}
                              />
                              <span className="font-medium text-sm">
                                {node.label}
                              </span>
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
                        </Card>

                        {index < nodes.length - 1 && (
                          <div className="flex flex-col items-center gap-1">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                connectNodes(node.id, nodes[index + 1].id)
                              }
                            >
                              Connect
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Node Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Trigger
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Trigger Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                      {TRIGGER_TYPES.map((trigger) => (
                        <Button
                          key={trigger.id}
                          variant="outline"
                          className="h-auto flex-col gap-2 p-4"
                          onClick={() => addNode("trigger", trigger.label)}
                        >
                          <trigger.icon className="w-6 h-6" />
                          {trigger.label}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={showNodeDialog && nodeType === "action"}
                  onOpenChange={(open) => {
                    if (!open) setShowNodeDialog(false);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setNodeType("action");
                        setShowNodeDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Action
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Action Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTION_TYPES.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="h-auto flex-col gap-2 p-4"
                          onClick={() => addNode("action", action.label)}
                        >
                          <action.icon className="w-6 h-6" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Save Buttons */}
              <div className="flex gap-2">
                <Button onClick={saveWorkflow} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  Save Workflow
                </Button>
                <Button onClick={resetWorkflow} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Saved Workflows */}
        <div>
          <Card className="p-6">
            <h3 className="font-bold mb-4">Saved Workflows</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workflows.length === 0 ? (
                <p className="text-sm text-slate-500">No workflows yet</p>
              ) : (
                workflows.map((workflow) => (
                  <Card
                    key={workflow.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => loadWorkflow(workflow)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{workflow.name}</p>
                          <p className="text-xs text-slate-500">
                            {workflow.nodes.length} nodes
                          </p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            workflow.enabled ? "bg-green-500" : "bg-slate-300"
                          }`}
                        />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {workflow.description}
                      </p>
                      <div className="flex gap-1 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateWorkflow(workflow);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWorkflow(workflow.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
