import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Wrench, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  History,
  Trash2,
  RefreshCw,
  Database,
  Wifi,
  HardDrive,
  Key,
  Search,
  CloudOff
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  REPAIR_ACTIONS,
  RepairActionType,
  RepairResult,
  RepairSession,
  executeRepairSession,
  executeFullRepair,
  getRepairHistory,
  clearRepairHistory,
  type RepairAction,
} from "@/services/systemRepairService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const categoryIcons: Record<string, React.ReactNode> = {
  cache: <RefreshCw className="w-4 h-4" />,
  data: <Database className="w-4 h-4" />,
  connection: <Wifi className="w-4 h-4" />,
  storage: <HardDrive className="w-4 h-4" />,
  session: <Key className="w-4 h-4" />,
};

const severityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function ForceRepairPanel() {
  const [selectedActions, setSelectedActions] = useState<Set<RepairActionType>>(new Set());
  const [isRepairing, setIsRepairing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<RepairResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const history = getRepairHistory();

  const toggleAction = (actionId: RepairActionType) => {
    const newSelected = new Set(selectedActions);
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId);
    } else {
      newSelected.add(actionId);
    }
    setSelectedActions(newSelected);
  };

  const selectAll = () => {
    setSelectedActions(new Set(REPAIR_ACTIONS.map(a => a.id)));
  };

  const selectNone = () => {
    setSelectedActions(new Set());
  };

  const selectSafe = () => {
    const safeActions = REPAIR_ACTIONS.filter(a => !a.requiresConfirmation).map(a => a.id);
    setSelectedActions(new Set(safeActions));
  };

  const hasConfirmationRequired = () => {
    return Array.from(selectedActions).some(id => {
      const action = REPAIR_ACTIONS.find(a => a.id === id);
      return action?.requiresConfirmation;
    });
  };

  const handleRepair = async () => {
    if (selectedActions.size === 0) {
      toast.error("Please select at least one repair action");
      return;
    }

    if (hasConfirmationRequired()) {
      setShowConfirmDialog(true);
      return;
    }

    await runRepair();
  };

  const runRepair = async () => {
    setShowConfirmDialog(false);
    setIsRepairing(true);
    setResults([]);
    setProgress(0);

    const actions = Array.from(selectedActions);
    
    try {
      await executeRepairSession(actions, (result, index, total) => {
        setCurrentAction(REPAIR_ACTIONS.find(a => a.id === result.actionId)?.name || result.actionId);
        setProgress(((index + 1) / total) * 100);
        setResults(prev => [...prev, result]);
      });

      const successCount = results.filter(r => r.status === 'success').length + 1;
      toast.success(`Repair completed: ${successCount}/${actions.length} actions successful`);
    } catch (error) {
      toast.error("Repair process failed");
    } finally {
      setIsRepairing(false);
      setCurrentAction(null);
    }
  };

  const handleQuickRepair = async () => {
    setIsRepairing(true);
    setResults([]);
    setProgress(0);
    setSelectedActions(new Set(['cache_clear', 'data_revalidation', 'connection_retry', 'storage_cleanup']));

    try {
      await executeFullRepair((result, index, total) => {
        setCurrentAction(REPAIR_ACTIONS.find(a => a.id === result.actionId)?.name || result.actionId);
        setProgress(((index + 1) / total) * 100);
        setResults(prev => [...prev, result]);
      });

      toast.success("Quick repair completed");
    } catch (error) {
      toast.error("Quick repair failed");
    } finally {
      setIsRepairing(false);
      setCurrentAction(null);
    }
  };

  const handleClearHistory = () => {
    clearRepairHistory();
    toast.success("Repair history cleared");
    setShowHistory(false);
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Force Update / Repair
            </CardTitle>
            <CardDescription>
              Run repair operations to fix common system issues
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleQuickRepair}
              disabled={isRepairing}
            >
              {isRepairing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              Quick Repair
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Section */}
        {isRepairing && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {currentAction || "Initializing..."}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && !isRepairing && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm mb-3">Repair Results</h4>
            {results.map((result, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  {getResultIcon(result.status)}
                  <span className="text-sm">
                    {REPAIR_ACTIONS.find(a => a.id === result.actionId)?.name || result.actionId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {result.duration}ms
                  </span>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                    {result.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Section */}
        {showHistory && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Repair History</h4>
              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearHistory}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No repair history</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 10).map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      {session.overallStatus === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {session.actions.length} actions
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(session.startTime), "MMM d, h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Selection */}
        {!showHistory && (
          <>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Select Repair Actions</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>All</Button>
                <Button variant="ghost" size="sm" onClick={selectSafe}>Safe Only</Button>
                <Button variant="ghost" size="sm" onClick={selectNone}>None</Button>
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              {['cache', 'data', 'connection', 'storage', 'session'].map(category => {
                const categoryActions = REPAIR_ACTIONS.filter(a => a.category === category);
                if (categoryActions.length === 0) return null;

                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        {categoryIcons[category]}
                        <span className="capitalize">{category}</span>
                        <Badge variant="secondary" className="ml-2">
                          {categoryActions.filter(a => selectedActions.has(a.id)).length}/{categoryActions.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pl-6">
                        {categoryActions.map(action => (
                          <div 
                            key={action.id} 
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={action.id}
                              checked={selectedActions.has(action.id)}
                              onCheckedChange={() => toggleAction(action.id)}
                              disabled={isRepairing}
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={action.id} 
                                className="text-sm font-medium cursor-pointer flex items-center gap-2"
                              >
                                {action.name}
                                {action.requiresConfirmation && (
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                )}
                              </label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {action.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={severityColors[action.severity]} variant="secondary">
                                  {action.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  ~{action.estimatedTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* Run Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleRepair}
                disabled={isRepairing || selectedActions.size === 0}
                className="gap-2"
              >
                {isRepairing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
                Run Selected Repairs ({selectedActions.size})
              </Button>
            </div>
          </>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Confirm Repair Actions
              </DialogTitle>
              <DialogDescription>
                Some selected actions require confirmation as they may affect system data or require re-authentication.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm mb-3">The following actions require confirmation:</p>
              <ul className="space-y-2">
                {Array.from(selectedActions)
                  .map(id => REPAIR_ACTIONS.find(a => a.id === id))
                  .filter(a => a?.requiresConfirmation)
                  .map(action => (
                    <li key={action!.id} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      {action!.name}
                    </li>
                  ))}
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={runRepair}>
                Confirm & Run
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
