import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Plus,
  FileText,
  Users,
  DollarSign,
  Calendar,
  ClipboardList,
  Send,
  FileSignature,
  BookOpen,
  Building2,
  Gift,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface QuickAction {
  id: string;
  icon: any;
  label: string;
  description: string;
  color: string;
  action: "navigate" | "dialog";
  path?: string;
  dialogType?: string;
}

const quickActions: QuickAction[] = [
  {
    id: "new-document",
    icon: FileText,
    label: "New Document",
    description: "Create a new document",
    color: "text-blue-500",
    action: "navigate",
    path: "/document-vault",
  },
  {
    id: "add-team-member",
    icon: Users,
    label: "Add Team Member",
    description: "Invite someone to your team",
    color: "text-green-500",
    action: "navigate",
    path: "/team-management",
  },
  {
    id: "record-expense",
    icon: DollarSign,
    label: "Record Expense",
    description: "Log a new expense",
    color: "text-amber-500",
    action: "dialog",
    dialogType: "expense",
  },
  {
    id: "schedule-meeting",
    icon: Calendar,
    label: "Schedule Meeting",
    description: "Set up a new meeting",
    color: "text-purple-500",
    action: "navigate",
    path: "/calendar",
  },
  {
    id: "create-task",
    icon: ClipboardList,
    label: "Create Task",
    description: "Add a new task",
    color: "text-cyan-500",
    action: "dialog",
    dialogType: "task",
  },
  {
    id: "send-notification",
    icon: Send,
    label: "Send Notification",
    description: "Notify team members",
    color: "text-pink-500",
    action: "dialog",
    dialogType: "notification",
  },
  {
    id: "request-signature",
    icon: FileSignature,
    label: "Request Signature",
    description: "Send document for signing",
    color: "text-indigo-500",
    action: "navigate",
    path: "/signature-requests",
  },
  {
    id: "assign-reading",
    icon: BookOpen,
    label: "Assign Reading",
    description: "Assign article to team",
    color: "text-teal-500",
    action: "navigate",
    path: "/article-assignment",
  },
  {
    id: "new-entity",
    icon: Building2,
    label: "New Entity",
    description: "Create business entity",
    color: "text-orange-500",
    action: "navigate",
    path: "/business-formation",
  },
  {
    id: "apply-grant",
    icon: Gift,
    label: "Apply for Grant",
    description: "Start grant application",
    color: "text-emerald-500",
    action: "navigate",
    path: "/grants",
  },
];

export function QuickActionsWidget() {
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [expenseForm, setExpenseForm] = useState({ amount: "", category: "", description: "" });
  const [taskForm, setTaskForm] = useState({ title: "", priority: "medium", dueDate: "" });
  const [notificationForm, setNotificationForm] = useState({ title: "", message: "", recipients: "all" });

  const handleAction = (action: QuickAction) => {
    if (action.action === "navigate" && action.path) {
      setLocation(action.path);
    } else if (action.action === "dialog" && action.dialogType) {
      setDialogType(action.dialogType);
      setDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (dialogType) {
      case "expense":
        toast.success(`Expense of $${expenseForm.amount} recorded`);
        setExpenseForm({ amount: "", category: "", description: "" });
        break;
      case "task":
        toast.success(`Task "${taskForm.title}" created`);
        setTaskForm({ title: "", priority: "medium", dueDate: "" });
        break;
      case "notification":
        toast.success(`Notification sent to ${notificationForm.recipients}`);
        setNotificationForm({ title: "", message: "", recipients: "all" });
        break;
    }
    
    setIsSubmitting(false);
    setDialogOpen(false);
  };

  const renderDialogContent = () => {
    switch (dialogType) {
      case "expense":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Record Expense</DialogTitle>
              <DialogDescription>Log a new expense for tracking</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Office Supplies</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      case "task":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Add a new task to your list</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      case "notification":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>Notify team members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notifTitle">Title</Label>
                <Input
                  id="notifTitle"
                  placeholder="Notification title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Select
                  value={notificationForm.recipients}
                  onValueChange={(v) => setNotificationForm({ ...notificationForm, recipients: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team Members</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                    <SelectItem value="staff">Staff Only</SelectItem>
                    <SelectItem value="department">My Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message..."
                  rows={4}
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto py-3 px-2 flex flex-col items-center gap-1.5 hover:bg-accent/50 transition-colors"
                onClick={() => handleAction(action)}
              >
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-xs font-medium text-center leading-tight">
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {renderDialogContent()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
