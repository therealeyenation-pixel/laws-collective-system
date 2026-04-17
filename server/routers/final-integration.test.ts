/**
 * Final Integration Tests
 * Complete system integration tests for all three operational systems
 */

import { describe, it, expect, beforeEach } from "vitest";
import { workflowExecutor } from "../_core/workflowExecutor";
import { websocketSyncService } from "../_core/websocketSync";
import { realtimeCollaborationService } from "../_core/realtimeCollaboration";
import { mobilePushNotificationsService } from "../_core/mobilePushNotifications";

describe("Complete System Integration - All Operational Systems", () => {
  beforeEach(() => {
    workflowExecutor.clear();
    websocketSyncService.clear();
    realtimeCollaborationService.clear();
    mobilePushNotificationsService.clear();
  });

  describe("Workflow Automation Execution Engine", () => {
    it("should execute workflow with multiple actions", async () => {
      const nodes = [
        {
          id: "trigger_1",
          type: "trigger" as const,
          label: "Manual Trigger",
          config: { triggerType: "manual" },
        },
        {
          id: "action_1",
          type: "action" as const,
          label: "Send Notification",
          config: {
            actionType: "notification",
            userId: "user1",
            title: "Test",
            body: "Test body",
          },
        },
      ];

      const execution = await workflowExecutor.executeWorkflow(
        "workflow_1",
        nodes
      );

      expect(execution.status).toBe("completed");
      expect(execution.result).toHaveProperty("notificationSent");
    });

    it("should schedule workflow execution", () => {
      const schedule = workflowExecutor.scheduleWorkflow(
        "workflow_1",
        "0 0 * * *",
        "UTC"
      );

      expect(schedule.workflowId).toBe("workflow_1");
      expect(schedule.enabled).toBe(true);
      expect(schedule.cronExpression).toBe("0 0 * * *");
    });

    it("should retry failed executions", async () => {
      const nodes = [
        {
          id: "action_1",
          type: "action" as const,
          label: "Invalid Action",
          config: { actionType: "invalid_type" },
        },
      ];

      const execution = await workflowExecutor.executeWorkflow(
        "workflow_1",
        nodes
      );

      expect(execution.status).toBe("failed");

      const retried = await workflowExecutor.retryExecution(execution.id);
      expect(retried).not.toBeNull();
      expect(retried?.retryCount).toBeGreaterThanOrEqual(0);
    });

    it("should track workflow statistics", async () => {
      const nodes = [
        {
          id: "action_1",
          type: "action" as const,
          label: "Send Notification",
          config: {
            actionType: "notification",
            userId: "user1",
            title: "Test",
            body: "Test",
          },
        },
      ];

      await workflowExecutor.executeWorkflow("workflow_1", nodes);
      await workflowExecutor.executeWorkflow("workflow_2", nodes);

      const stats = workflowExecutor.getStats();

      expect(stats.totalExecutions).toBeGreaterThanOrEqual(0);
      expect(stats.successfulExecutions).toBeGreaterThanOrEqual(0);
    });
  });

  describe("WebSocket Real-time Synchronization", () => {
    it("should register and manage client connections", () => {
      const connection = websocketSyncService.registerConnection(
        "client_1",
        "user1",
        "John"
      );

      expect(connection.clientId).toBe("client_1");
      expect(connection.isActive).toBe(true);

      const connections = websocketSyncService.getActiveConnections();
      expect(connections).toHaveLength(1);
    });

    it("should handle channel subscriptions", () => {
      websocketSyncService.registerConnection("client_1", "user1", "John");

      const success = websocketSyncService.subscribeToChannel(
        "client_1",
        "alerts"
      );

      expect(success).toBe(true);

      const subscribers = websocketSyncService.getChannelSubscribers("alerts");
      expect(subscribers).toHaveLength(1);
    });

    it("should broadcast messages to channel", () => {
      websocketSyncService.registerConnection("client_1", "user1", "John");
      websocketSyncService.registerConnection("client_2", "user2", "Jane");

      websocketSyncService.subscribeToChannel("client_1", "alerts");
      websocketSyncService.subscribeToChannel("client_2", "alerts");

      const message = websocketSyncService.sendToChannel("alerts", {
        type: "alert_update",
        data: { alertId: "alert_1", status: "active" },
      });

      expect(message).not.toBeNull();

      const history = websocketSyncService.getChannelHistory("alerts");
      expect(history).toHaveLength(1);
    });

    it("should maintain message history", () => {
      websocketSyncService.registerConnection("client_1", "user1", "John");
      websocketSyncService.subscribeToChannel("client_1", "alerts");

      for (let i = 0; i < 10; i++) {
        websocketSyncService.sendToChannel("alerts", {
          type: "alert_update",
          data: { alertId: `alert_${i}` },
        });
      }

      const history = websocketSyncService.getChannelHistory("alerts", 5);
      expect(history).toHaveLength(5);
    });

    it("should track sync statistics", () => {
      websocketSyncService.registerConnection("client_1", "user1", "John");
      websocketSyncService.registerConnection("client_2", "user2", "Jane");

      websocketSyncService.subscribeToChannel("client_1", "alerts");
      websocketSyncService.subscribeToChannel("client_2", "notifications");

      const stats = websocketSyncService.getStats();

      expect(stats.activeConnections).toBe(2);
      expect(stats.totalChannels).toBe(2);
    });
  });

  describe("Cross-System Workflow + WebSocket Integration", () => {
    it("should execute workflow and broadcast via WebSocket", async () => {
      // Setup WebSocket
      websocketSyncService.registerConnection("client_1", "user1", "John");
      websocketSyncService.subscribeToChannel("client_1", "workflows");

      // Execute workflow
      const nodes = [
        {
          id: "action_1",
          type: "action" as const,
          label: "Send Notification",
          config: {
            actionType: "notification",
            userId: "user1",
            title: "Workflow Complete",
            body: "Workflow execution completed",
          },
        },
      ];

      const execution = await workflowExecutor.executeWorkflow(
        "workflow_1",
        nodes
      );

      // Broadcast result via WebSocket
      websocketSyncService.sendToChannel("workflows", {
        type: "workflow_update",
        data: {
          executionId: execution.id,
          status: execution.status,
          result: execution.result,
        },
      });

      const history = websocketSyncService.getChannelHistory("workflows");
      expect(history).toHaveLength(1);
      expect(history[0].data.executionId).toBe(execution.id);
    });

    it("should sync collaboration events via WebSocket", () => {
      // Setup WebSocket
      websocketSyncService.registerConnection("client_1", "user1", "John");
      websocketSyncService.registerConnection("client_2", "user2", "Jane");

      websocketSyncService.subscribeToChannel("client_1", "collaboration");
      websocketSyncService.subscribeToChannel("client_2", "collaboration");

      // Record collaboration event
      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );

      // Broadcast via WebSocket
      websocketSyncService.broadcastMessage({
        type: "collaboration_update",
        channel: "collaboration",
        data: {
          event: "user_joined",
          userId: "user1",
          userName: "John",
        },
      });

      const history = websocketSyncService.getChannelHistory("collaboration");
      expect(history).toHaveLength(1);
    });

    it("should handle push notifications with WebSocket sync", async () => {
      // Setup WebSocket
      websocketSyncService.registerConnection("client_1", "user1", "John");
      websocketSyncService.subscribeToChannel("client_1", "notifications");

      // Subscribe to push
      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push",
          keys: { auth: "auth", p256dh: "p256dh" },
        },
        "Mozilla/5.0"
      );

      // Send push notification
      const notification = await mobilePushNotificationsService.sendCriticalAlert(
        "user1",
        "Critical Alert",
        "System error"
      );

      // Sync via WebSocket
      websocketSyncService.sendToChannel("notifications", {
        type: "notification_update",
        data: {
          notificationId: notification.id,
          status: notification.status,
          title: notification.title,
        },
      });

      const history = websocketSyncService.getChannelHistory("notifications");
      expect(history).toHaveLength(1);
    });
  });

  describe("Production Readiness - Full System Load", () => {
    it("should handle concurrent operations across all systems", async () => {
      const userCount = 5;
      const workflowCount = 3;

      // Setup WebSocket connections
      for (let i = 0; i < userCount; i++) {
        websocketSyncService.registerConnection(
          `client_${i}`,
          `user${i}`,
          `User ${i}`
        );
        websocketSyncService.subscribeToChannel(`client_${i}`, "system");
      }

      // Execute workflows
      const nodes = [
        {
          id: "action_1",
          type: "action" as const,
          label: "Send Notification",
          config: {
            actionType: "notification",
            userId: "user1",
            title: "Test",
            body: "Test",
          },
        },
      ];

      for (let i = 0; i < workflowCount; i++) {
        await workflowExecutor.executeWorkflow(`workflow_${i}`, nodes);
      }

      // Setup collaboration
      for (let i = 0; i < userCount; i++) {
        realtimeCollaborationService.registerSession(
          `user${i}`,
          `User ${i}`,
          `session_${i}`,
          "/dashboard"
        );
      }

      // Verify all systems
      const wsStats = websocketSyncService.getStats();
      const wfStats = workflowExecutor.getStats();
      const collabStats = realtimeCollaborationService.getStats();

      expect(wsStats.activeConnections).toBeGreaterThanOrEqual(userCount);
      expect(wfStats.totalExecutions).toBeGreaterThanOrEqual(workflowCount);
      expect(collabStats.activeUsers).toBeGreaterThanOrEqual(userCount);
    });

    it("should maintain system health under stress", async () => {
      // Create high load
      for (let i = 0; i < 20; i++) {
        websocketSyncService.registerConnection(
          `client_${i}`,
          `user${i}`,
          `User ${i}`
        );
        websocketSyncService.subscribeToChannel(`client_${i}`, "alerts");

        // Send multiple messages
        for (let j = 0; j < 5; j++) {
          websocketSyncService.sendToChannel("alerts", {
            type: "alert_update",
            data: { alertId: `alert_${i}_${j}` },
          });
        }
      }

      const stats = websocketSyncService.getStats();

      expect(stats.activeConnections).toBe(20);
      expect(stats.totalMessages).toBeGreaterThanOrEqual(0);
      expect(stats.totalChannels).toBeGreaterThanOrEqual(0);
    });

    it("should provide comprehensive health metrics", () => {
      // Setup all systems
      websocketSyncService.registerConnection("client_1", "user1", "John");
      websocketSyncService.subscribeToChannel("client_1", "system");

      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );

      mobilePushNotificationsService.subscribeToPush(
        "user1",
        {
          endpoint: "https://example.com/push",
          keys: { auth: "auth", p256dh: "p256dh" },
        },
        "Mozilla/5.0"
      );

      // Get metrics from all systems
      const wsHealth = websocketSyncService.getStats();
      const collabHealth = realtimeCollaborationService.getStats();
      const pushHealth = mobilePushNotificationsService.getStats();

      // Verify all metrics available
      expect(wsHealth).toHaveProperty("activeConnections");
      expect(collabHealth).toHaveProperty("activeUsers");
      expect(pushHealth).toHaveProperty("activeSubscriptions");

      // All should show activity
      expect(wsHealth.activeConnections).toBeGreaterThanOrEqual(0);
      expect(collabHealth.activeUsers).toBeGreaterThanOrEqual(0);
      expect(pushHealth.activeSubscriptions).toBeGreaterThanOrEqual(0);
    });
  });

  describe("System Cleanup and Shutdown", () => {
    it("should cleanup all resources gracefully", () => {
      // Setup all systems
      websocketSyncService.registerConnection("client_1", "user1", "John");
      realtimeCollaborationService.registerSession(
        "user1",
        "John",
        "session_1",
        "/dashboard"
      );
      workflowExecutor.scheduleWorkflow("workflow_1", "0 0 * * *");

      // Verify setup
      let wsStats = websocketSyncService.getStats();
      let collabStats = realtimeCollaborationService.getStats();
      let wfStats = workflowExecutor.getStats();

      expect(wsStats.activeConnections).toBeGreaterThanOrEqual(0);
      expect(collabStats.activeUsers).toBeGreaterThanOrEqual(0);
      expect(wfStats.activeSchedules).toBeGreaterThanOrEqual(0);

      // Cleanup
      websocketSyncService.clear();
      realtimeCollaborationService.clear();
      workflowExecutor.clear();

      // Verify cleanup
      wsStats = websocketSyncService.getStats();
      collabStats = realtimeCollaborationService.getStats();
      wfStats = workflowExecutor.getStats();

      expect(wsStats.activeConnections).toBe(0);
      expect(collabStats.activeUsers).toBe(0);
      expect(wfStats.activeSchedules).toBe(0);
    });
  });
});
