import React from "react";
import { WorkflowBuilder } from "@/components/WorkflowBuilder";
import { Card } from "@/components/ui/card";

export default function WorkflowBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow Automation Builder</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage automated workflows using visual workflow designer
        </p>
      </div>

      <WorkflowBuilder />

      <Card className="p-6 bg-blue-50 dark:bg-blue-950">
        <h3 className="font-semibold mb-2">How to Use</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Click "Create New Workflow" to start building</li>
          <li>• Add nodes by selecting from triggers, actions, and conditions</li>
          <li>• Configure each node by clicking on it and editing the config</li>
          <li>• Save your workflow when complete</li>
          <li>• Execute workflows immediately or schedule them for later</li>
          <li>• View execution history and statistics in the dashboard</li>
        </ul>
      </Card>
    </div>
  );
}
