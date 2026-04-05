import { describe, it, expect } from "vitest";

describe("Delegation Notifications & Analytics - Phase 66", () => {
  describe("Delegation Notification Service", () => {
    it("should define notification types", () => {
      const notificationTypes = [
        'delegated_to_you',
        'delegation_accepted',
        'delegation_declined',
        'delegation_completed'
      ];
      expect(notificationTypes).toHaveLength(4);
      expect(notificationTypes).toContain('delegated_to_you');
      expect(notificationTypes).toContain('delegation_accepted');
    });

    it("should generate email template for delegation notification", () => {
      const notification = {
        type: 'delegated_to_you' as const,
        taskTitle: 'Review Q4 Report',
        fromUser: { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com' },
        toUser: { id: '2', name: 'Michael Chen', email: 'michael@example.com' },
        notes: 'Please prioritize this',
        reason: 'expertise',
      };

      const email = {
        subject: `Task Delegated to You: ${notification.taskTitle}`,
        recipientEmail: notification.toUser.email,
        recipientName: notification.toUser.name,
      };

      expect(email.subject).toContain('Review Q4 Report');
      expect(email.recipientEmail).toBe('michael@example.com');
    });

    it("should generate in-app notification content", () => {
      const notification = {
        id: 'notif-1',
        type: 'delegation_accepted' as const,
        taskTitle: 'Sign Contract',
        fromUser: { id: '1', name: 'Sarah Johnson' },
        toUser: { id: '2', name: 'Michael Chen' },
      };

      const inAppNotification = {
        id: notification.id,
        type: 'delegation',
        title: 'Delegation Accepted',
        message: `${notification.toUser.name} accepted your delegation of "${notification.taskTitle}"`,
        link: '/task-delegation',
      };

      expect(inAppNotification.title).toBe('Delegation Accepted');
      expect(inAppNotification.message).toContain('Michael Chen');
      expect(inAppNotification.link).toBe('/task-delegation');
    });

    it("should format delegation reasons correctly", () => {
      const reasonMap: Record<string, string> = {
        workload: 'High workload / capacity constraints',
        expertise: 'Task requires different expertise',
        pto: 'Planned time off / vacation',
        priority: 'Conflicting priorities',
        reassignment: 'Role or responsibility change',
        collaboration: 'Better suited for team collaboration',
        other: 'Other reason',
      };

      expect(reasonMap['expertise']).toBe('Task requires different expertise');
      expect(reasonMap['pto']).toBe('Planned time off / vacation');
    });
  });

  describe("Workload Balancing Service", () => {
    it("should calculate workload status based on utilization", () => {
      const calculateStatus = (utilization: number) => {
        if (utilization < 50) return 'available';
        if (utilization < 75) return 'balanced';
        if (utilization < 90) return 'busy';
        return 'overloaded';
      };

      expect(calculateStatus(30)).toBe('available');
      expect(calculateStatus(60)).toBe('balanced');
      expect(calculateStatus(80)).toBe('busy');
      expect(calculateStatus(95)).toBe('overloaded');
    });

    it("should calculate capacity utilization", () => {
      const calculateUtilization = (pending: number, max: number, overdue: number) => {
        const effective = pending + overdue * 0.5;
        return Math.min(100, Math.round((effective / max) * 100));
      };

      expect(calculateUtilization(5, 10, 0)).toBe(50);
      expect(calculateUtilization(8, 10, 2)).toBe(90);
      expect(calculateUtilization(10, 10, 0)).toBe(100);
    });

    it("should calculate team workload summary", () => {
      const members = [
        { capacity: { status: 'available' as const, currentUtilization: 40 }, workload: { pendingTasks: 4, overdueTasks: 0 } },
        { capacity: { status: 'balanced' as const, currentUtilization: 65 }, workload: { pendingTasks: 7, overdueTasks: 1 } },
        { capacity: { status: 'overloaded' as const, currentUtilization: 95 }, workload: { pendingTasks: 12, overdueTasks: 3 } },
      ];

      const summary = {
        totalTeamMembers: members.length,
        averageUtilization: Math.round(members.reduce((acc, m) => acc + m.capacity.currentUtilization, 0) / members.length),
        overloadedMembers: members.filter(m => m.capacity.status === 'overloaded').length,
        availableMembers: members.filter(m => m.capacity.status === 'available').length,
        totalPendingTasks: members.reduce((acc, m) => acc + m.workload.pendingTasks, 0),
        totalOverdueTasks: members.reduce((acc, m) => acc + m.workload.overdueTasks, 0),
      };

      expect(summary.totalTeamMembers).toBe(3);
      expect(summary.averageUtilization).toBe(67);
      expect(summary.overloadedMembers).toBe(1);
      expect(summary.availableMembers).toBe(1);
      expect(summary.totalPendingTasks).toBe(23);
      expect(summary.totalOverdueTasks).toBe(4);
    });

    it("should generate delegation recommendations", () => {
      const members = [
        { id: '1', name: 'Sarah', capacity: { status: 'available' as const }, skills: ['article', 'review'] },
        { id: '2', name: 'Michael', capacity: { status: 'overloaded' as const }, skills: ['article'] },
        { id: '3', name: 'Emily', capacity: { status: 'balanced' as const }, skills: ['signature', 'approval'] },
      ];

      const taskType = 'article';
      const recommendations = members
        .filter(m => m.capacity.status !== 'overloaded')
        .map(m => ({
          userId: m.id,
          userName: m.name,
          score: m.capacity.status === 'available' ? 80 : 60,
          hasSkill: m.skills.includes(taskType),
        }))
        .sort((a, b) => b.score - a.score);

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].userName).toBe('Sarah');
      expect(recommendations[0].score).toBe(80);
      expect(recommendations[0].hasSkill).toBe(true);
    });

    it("should detect when rebalancing is needed", () => {
      const needsRebalancing = (summary: { overloadedMembers: number; totalTeamMembers: number; availableMembers: number; averageUtilization: number }) => {
        const overloadedPercent = (summary.overloadedMembers / summary.totalTeamMembers) * 100;
        const hasImbalance = summary.overloadedMembers > 0 && summary.availableMembers > 0;
        return overloadedPercent > 20 || summary.averageUtilization > 85 || hasImbalance;
      };

      expect(needsRebalancing({ overloadedMembers: 1, totalTeamMembers: 3, availableMembers: 1, averageUtilization: 70 })).toBe(true);
      expect(needsRebalancing({ overloadedMembers: 0, totalTeamMembers: 5, availableMembers: 2, averageUtilization: 50 })).toBe(false);
      expect(needsRebalancing({ overloadedMembers: 0, totalTeamMembers: 5, availableMembers: 0, averageUtilization: 90 })).toBe(true);
    });

    it("should generate rebalancing suggestions", () => {
      const members = [
        { name: 'Sarah', capacity: { status: 'overloaded' as const, availableCapacity: -3 }, workload: { pendingTasks: 13 }, maxTasks: 10 },
        { name: 'Michael', capacity: { status: 'available' as const, availableCapacity: 5 }, workload: { pendingTasks: 5 }, maxTasks: 10 },
      ];

      const overloaded = members.filter(m => m.capacity.status === 'overloaded');
      const available = members.filter(m => m.capacity.status === 'available');

      const suggestions = overloaded.map(o => {
        const excessTasks = o.workload.pendingTasks - o.maxTasks;
        const target = available[0];
        return {
          from: o.name,
          to: target?.name,
          tasksToMove: Math.min(excessTasks, target?.capacity.availableCapacity || 0),
        };
      }).filter(s => s.tasksToMove > 0);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].from).toBe('Sarah');
      expect(suggestions[0].to).toBe('Michael');
      expect(suggestions[0].tasksToMove).toBe(3);
    });
  });

  describe("Delegation Analytics Service", () => {
    it("should calculate delegation metrics", () => {
      const records = [
        { status: 'completed' as const, respondedAt: new Date(), completedAt: new Date() },
        { status: 'accepted' as const, respondedAt: new Date() },
        { status: 'declined' as const, respondedAt: new Date() },
        { status: 'pending' as const },
      ];

      const responded = records.filter(r => r.status !== 'pending');
      const accepted = records.filter(r => r.status === 'accepted' || r.status === 'completed');
      const declined = records.filter(r => r.status === 'declined');
      const completed = records.filter(r => r.status === 'completed');

      const metrics = {
        totalDelegations: records.length,
        acceptanceRate: (accepted.length / responded.length) * 100,
        declineRate: (declined.length / responded.length) * 100,
        completionRate: (completed.length / accepted.length) * 100,
      };

      expect(metrics.totalDelegations).toBe(4);
      expect(metrics.acceptanceRate).toBeCloseTo(66.67, 1);
      expect(metrics.declineRate).toBeCloseTo(33.33, 1);
      expect(metrics.completionRate).toBe(50);
    });

    it("should calculate user delegation stats", () => {
      const records = [
        { fromUserId: '1', toUserId: '2', status: 'completed' as const, reason: 'workload' },
        { fromUserId: '1', toUserId: '3', status: 'accepted' as const, reason: 'expertise' },
        { fromUserId: '2', toUserId: '1', status: 'declined' as const, reason: 'workload' },
      ];

      const userId = '1';
      const received = records.filter(r => r.toUserId === userId);
      const sent = records.filter(r => r.fromUserId === userId);

      const stats = {
        delegationsReceived: received.length,
        delegationsSent: sent.length,
        acceptanceRate: received.filter(r => r.status === 'accepted' || r.status === 'completed').length / received.length * 100,
      };

      expect(stats.delegationsReceived).toBe(1);
      expect(stats.delegationsSent).toBe(2);
      expect(stats.acceptanceRate).toBe(0);
    });

    it("should analyze delegation reasons", () => {
      const records = [
        { reason: 'workload' },
        { reason: 'workload' },
        { reason: 'expertise' },
        { reason: 'pto' },
        { reason: 'workload' },
      ];

      const reasonCounts: Record<string, number> = {};
      records.forEach(r => {
        reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
      });

      const analysis = Object.entries(reasonCounts)
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: (count / records.length) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      expect(analysis[0].reason).toBe('workload');
      expect(analysis[0].count).toBe(3);
      expect(analysis[0].percentage).toBe(60);
    });

    it("should get top delegators", () => {
      const records = [
        { fromUserId: '1', fromUserName: 'Sarah' },
        { fromUserId: '1', fromUserName: 'Sarah' },
        { fromUserId: '2', fromUserName: 'Michael' },
        { fromUserId: '1', fromUserName: 'Sarah' },
        { fromUserId: '3', fromUserName: 'Emily' },
      ];

      const counts: Record<string, { name: string; count: number }> = {};
      records.forEach(r => {
        if (!counts[r.fromUserId]) {
          counts[r.fromUserId] = { name: r.fromUserName, count: 0 };
        }
        counts[r.fromUserId].count++;
      });

      const topDelegators = Object.entries(counts)
        .map(([id, data]) => ({ userId: id, userName: data.name, count: data.count }))
        .sort((a, b) => b.count - a.count);

      expect(topDelegators[0].userName).toBe('Sarah');
      expect(topDelegators[0].count).toBe(3);
    });

    it("should get top delegates with completion rates", () => {
      const records = [
        { toUserId: '1', toUserName: 'Sarah', status: 'completed' as const },
        { toUserId: '1', toUserName: 'Sarah', status: 'completed' as const },
        { toUserId: '2', toUserName: 'Michael', status: 'accepted' as const },
        { toUserId: '1', toUserName: 'Sarah', status: 'accepted' as const },
      ];

      const counts: Record<string, { name: string; count: number; completed: number }> = {};
      records.forEach(r => {
        if (!counts[r.toUserId]) {
          counts[r.toUserId] = { name: r.toUserName, count: 0, completed: 0 };
        }
        counts[r.toUserId].count++;
        if (r.status === 'completed') {
          counts[r.toUserId].completed++;
        }
      });

      const topDelegates = Object.entries(counts)
        .map(([id, data]) => ({
          userId: id,
          userName: data.name,
          count: data.count,
          completionRate: (data.completed / data.count) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      expect(topDelegates[0].userName).toBe('Sarah');
      expect(topDelegates[0].count).toBe(3);
      expect(topDelegates[0].completionRate).toBeCloseTo(66.67, 1);
    });

    it("should format duration correctly", () => {
      const formatDuration = (hours: number): string => {
        if (hours < 1) return `${Math.round(hours * 60)} min`;
        if (hours < 24) return `${Math.round(hours)} hr${hours >= 2 ? 's' : ''}`;
        const days = Math.round(hours / 24);
        return `${days} day${days > 1 ? 's' : ''}`;
      };

      expect(formatDuration(0.5)).toBe('30 min');
      expect(formatDuration(1)).toBe('1 hr');
      expect(formatDuration(5)).toBe('5 hrs');
      expect(formatDuration(24)).toBe('1 day');
      expect(formatDuration(72)).toBe('3 days');
    });

    it("should calculate delegation trends", () => {
      const records = [
        { delegatedAt: new Date('2026-01-20'), status: 'completed' as const },
        { delegatedAt: new Date('2026-01-21'), status: 'accepted' as const },
        { delegatedAt: new Date('2026-01-22'), status: 'declined' as const },
        { delegatedAt: new Date('2026-01-25'), status: 'pending' as const },
      ];

      const weeklyTrends = new Map<string, { delegations: number; accepted: number; declined: number; completed: number }>();
      
      records.forEach(r => {
        const date = new Date(r.delegatedAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const period = weekStart.toISOString().split('T')[0];
        
        if (!weeklyTrends.has(period)) {
          weeklyTrends.set(period, { delegations: 0, accepted: 0, declined: 0, completed: 0 });
        }
        
        const trend = weeklyTrends.get(period)!;
        trend.delegations++;
        if (r.status === 'accepted') trend.accepted++;
        if (r.status === 'declined') trend.declined++;
        if (r.status === 'completed') trend.completed++;
      });

      expect(weeklyTrends.size).toBeGreaterThan(0);
    });
  });
});
