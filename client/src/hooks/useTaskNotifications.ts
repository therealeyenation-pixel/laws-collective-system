import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  type: "article" | "signature" | "approval" | "deadline";
}

// Check if browser supports notifications
const supportsNotifications = () => {
  return "Notification" in window;
};

// Request notification permission
const requestPermission = async (): Promise<boolean> => {
  if (!supportsNotifications()) return false;
  
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

// Send browser notification
const sendNotification = (title: string, body: string, onClick?: () => void) => {
  if (!supportsNotifications() || Notification.permission !== "granted") {
    // Fallback to toast notification
    toast.warning(title, { description: body });
    return;
  }
  
  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `task-reminder-${Date.now()}`,
    requireInteraction: true,
  });
  
  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }
};

// Calculate time until due
const getTimeUntilDue = (dueDate: Date): { hours: number; minutes: number; isOverdue: boolean } => {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);
  
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes, isOverdue };
};

// Format time remaining
const formatTimeRemaining = (hours: number, minutes: number, isOverdue: boolean): string => {
  if (isOverdue) {
    if (hours > 24) return `${Math.floor(hours / 24)} days overdue`;
    if (hours > 0) return `${hours}h ${minutes}m overdue`;
    return `${minutes}m overdue`;
  }
  
  if (hours > 24) return `${Math.floor(hours / 24)} days remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

// Get task type label
const getTaskTypeLabel = (type: Task["type"]): string => {
  switch (type) {
    case "article": return "Article to Read";
    case "signature": return "Signature Required";
    case "approval": return "Approval Needed";
    case "deadline": return "Deadline";
    default: return "Task";
  }
};

interface UseTaskNotificationsOptions {
  tasks: Task[];
  enabled?: boolean;
  checkIntervalMs?: number;
  reminderThresholds?: number[]; // hours before due to remind
  onTaskClick?: (taskId: string) => void;
}

export function useTaskNotifications({
  tasks,
  enabled = true,
  checkIntervalMs = 60000, // Check every minute
  reminderThresholds = [24, 4, 1], // Remind at 24h, 4h, and 1h before due
  onTaskClick,
}: UseTaskNotificationsOptions) {
  const notifiedTasksRef = useRef<Set<string>>(new Set());
  const permissionGrantedRef = useRef<boolean>(false);

  // Request permission on mount
  useEffect(() => {
    if (enabled) {
      requestPermission().then((granted) => {
        permissionGrantedRef.current = granted;
        if (!granted && supportsNotifications()) {
          toast.info("Enable notifications to receive task reminders", {
            action: {
              label: "Enable",
              onClick: () => requestPermission(),
            },
          });
        }
      });
    }
  }, [enabled]);

  // Check tasks and send notifications
  const checkTasks = useCallback(() => {
    if (!enabled) return;

    const now = new Date();
    
    tasks.forEach((task) => {
      const { hours, minutes, isOverdue } = getTimeUntilDue(task.dueDate);
      const totalMinutes = hours * 60 + minutes;
      
      // Check each threshold
      reminderThresholds.forEach((thresholdHours) => {
        const thresholdMinutes = thresholdHours * 60;
        const notificationKey = `${task.id}-${thresholdHours}h`;
        
        // Skip if already notified for this threshold
        if (notifiedTasksRef.current.has(notificationKey)) return;
        
        // Check if we're within the threshold window (within 5 minutes of threshold)
        const isWithinThreshold = !isOverdue && 
          totalMinutes <= thresholdMinutes && 
          totalMinutes > thresholdMinutes - 5;
        
        // Also notify if overdue and not yet notified
        const isOverdueNotification = isOverdue && 
          !notifiedTasksRef.current.has(`${task.id}-overdue`);
        
        if (isWithinThreshold || isOverdueNotification) {
          const timeStr = formatTimeRemaining(hours, minutes, isOverdue);
          const typeLabel = getTaskTypeLabel(task.type);
          
          sendNotification(
            isOverdue ? `⚠️ Overdue: ${task.title}` : `📋 ${typeLabel} Due Soon`,
            isOverdue 
              ? `This task is ${timeStr}. Please complete it as soon as possible.`
              : `"${task.title}" has ${timeStr}`,
            onTaskClick ? () => onTaskClick(task.id) : undefined
          );
          
          notifiedTasksRef.current.add(isOverdue ? `${task.id}-overdue` : notificationKey);
        }
      });
    });
  }, [tasks, enabled, reminderThresholds, onTaskClick]);

  // Set up interval to check tasks
  useEffect(() => {
    if (!enabled) return;
    
    // Check immediately
    checkTasks();
    
    // Set up interval
    const intervalId = setInterval(checkTasks, checkIntervalMs);
    
    return () => clearInterval(intervalId);
  }, [checkTasks, checkIntervalMs, enabled]);

  // Clear notification history when tasks change significantly
  useEffect(() => {
    const currentTaskIds = new Set(tasks.map(t => t.id));
    const notifiedIds = Array.from(notifiedTasksRef.current);
    
    // Remove notifications for tasks that no longer exist
    notifiedIds.forEach((key) => {
      const taskId = key.split("-")[0];
      if (!currentTaskIds.has(taskId)) {
        notifiedTasksRef.current.delete(key);
      }
    });
  }, [tasks]);

  return {
    requestPermission,
    checkTasks,
    clearNotificationHistory: () => notifiedTasksRef.current.clear(),
  };
}

export default useTaskNotifications;
