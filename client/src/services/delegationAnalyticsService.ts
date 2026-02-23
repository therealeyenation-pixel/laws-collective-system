// Delegation Analytics Service
// Tracks and analyzes delegation patterns and metrics

export interface DelegationRecord {
  id: string;
  taskId: string;
  taskType: 'article' | 'signature' | 'approval';
  taskTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reason: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  delegatedAt: Date;
  respondedAt?: Date;
  completedAt?: Date;
  originalDueDate: Date;
  newDueDate?: Date;
  notes?: string;
  declineReason?: string;
}

export interface DelegationMetrics {
  totalDelegations: number;
  acceptanceRate: number;
  declineRate: number;
  completionRate: number;
  avgResponseTime: number;
  avgCompletionTime: number;
  onTimeCompletionRate: number;
}

export interface DelegationTrend {
  period: string;
  delegations: number;
  accepted: number;
  declined: number;
  completed: number;
}

export interface ReasonAnalysis {
  reason: string;
  label: string;
  count: number;
  percentage: number;
  avgAcceptanceRate: number;
}

export function calculateDelegationMetrics(records: DelegationRecord[]): DelegationMetrics {
  if (records.length === 0) {
    return {
      totalDelegations: 0,
      acceptanceRate: 0,
      declineRate: 0,
      completionRate: 0,
      avgResponseTime: 0,
      avgCompletionTime: 0,
      onTimeCompletionRate: 0,
    };
  }

  const responded = records.filter((r) => r.status !== 'pending');
  const accepted = records.filter((r) => r.status === 'accepted' || r.status === 'completed');
  const declined = records.filter((r) => r.status === 'declined');
  const completed = records.filter((r) => r.status === 'completed');

  const responseTimes = responded
    .filter((r) => r.respondedAt)
    .map((r) => {
      const delegatedAt = new Date(r.delegatedAt).getTime();
      const respondedAt = new Date(r.respondedAt!).getTime();
      return (respondedAt - delegatedAt) / (1000 * 60 * 60);
    });

  const completionTimes = completed
    .filter((r) => r.completedAt)
    .map((r) => {
      const delegatedAt = new Date(r.delegatedAt).getTime();
      const completedAt = new Date(r.completedAt!).getTime();
      return (completedAt - delegatedAt) / (1000 * 60 * 60);
    });

  const onTimeCompletions = completed.filter((r) => {
    if (!r.completedAt || !r.newDueDate) return false;
    return new Date(r.completedAt) <= new Date(r.newDueDate);
  });

  return {
    totalDelegations: records.length,
    acceptanceRate: responded.length > 0 ? (accepted.length / responded.length) * 100 : 0,
    declineRate: responded.length > 0 ? (declined.length / responded.length) * 100 : 0,
    completionRate: accepted.length > 0 ? (completed.length / accepted.length) * 100 : 0,
    avgResponseTime:
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0,
    avgCompletionTime:
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0,
    onTimeCompletionRate:
      completed.length > 0 ? (onTimeCompletions.length / completed.length) * 100 : 0,
  };
}

export function calculateDelegationTrends(
  records: DelegationRecord[],
  periodType: 'daily' | 'weekly' | 'monthly' = 'weekly'
): DelegationTrend[] {
  const trends: Map<string, DelegationTrend> = new Map();

  records.forEach((record) => {
    const date = new Date(record.delegatedAt);
    let period: string;

    switch (periodType) {
      case 'daily':
        period = date.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        period = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        break;
      case 'monthly':
        period = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        break;
    }

    if (!trends.has(period)) {
      trends.set(period, { period, delegations: 0, accepted: 0, declined: 0, completed: 0 });
    }

    const trend = trends.get(period)!;
    trend.delegations++;
    if (record.status === 'accepted') trend.accepted++;
    if (record.status === 'declined') trend.declined++;
    if (record.status === 'completed') trend.completed++;
  });

  return Array.from(trends.values()).sort((a, b) => a.period.localeCompare(b.period));
}

export function analyzeReasons(records: DelegationRecord[]): ReasonAnalysis[] {
  const reasonLabels: Record<string, string> = {
    workload: 'High workload / capacity constraints',
    expertise: 'Task requires different expertise',
    pto: 'Planned time off / vacation',
    priority: 'Conflicting priorities',
    reassignment: 'Role or responsibility change',
    collaboration: 'Better suited for team collaboration',
    other: 'Other reason',
  };

  const reasonStats: Record<string, { count: number; accepted: number }> = {};

  records.forEach((record) => {
    if (!reasonStats[record.reason]) {
      reasonStats[record.reason] = { count: 0, accepted: 0 };
    }
    reasonStats[record.reason].count++;
    if (record.status === 'accepted' || record.status === 'completed') {
      reasonStats[record.reason].accepted++;
    }
  });

  const total = records.length;

  return Object.entries(reasonStats)
    .map(([reason, stats]) => ({
      reason,
      label: reasonLabels[reason] || reason,
      count: stats.count,
      percentage: total > 0 ? (stats.count / total) * 100 : 0,
      avgAcceptanceRate: stats.count > 0 ? (stats.accepted / stats.count) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getTopDelegators(
  records: DelegationRecord[],
  limit: number = 5
): { userId: string; userName: string; count: number }[] {
  const delegatorCounts: Record<string, { userName: string; count: number }> = {};

  records.forEach((record) => {
    if (!delegatorCounts[record.fromUserId]) {
      delegatorCounts[record.fromUserId] = { userName: record.fromUserName, count: 0 };
    }
    delegatorCounts[record.fromUserId].count++;
  });

  return Object.entries(delegatorCounts)
    .map(([userId, data]) => ({ userId, userName: data.userName, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopDelegates(
  records: DelegationRecord[],
  limit: number = 5
): { userId: string; userName: string; count: number; completionRate: number }[] {
  const delegateCounts: Record<string, { userName: string; count: number; completed: number }> = {};

  records.forEach((record) => {
    if (!delegateCounts[record.toUserId]) {
      delegateCounts[record.toUserId] = { userName: record.toUserName, count: 0, completed: 0 };
    }
    delegateCounts[record.toUserId].count++;
    if (record.status === 'completed') {
      delegateCounts[record.toUserId].completed++;
    }
  });

  return Object.entries(delegateCounts)
    .map(([userId, data]) => ({
      userId,
      userName: data.userName,
      count: data.count,
      completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function generateMockDelegationRecords(count: number = 50): DelegationRecord[] {
  const users = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Michael Chen' },
    { id: '3', name: 'Emily Rodriguez' },
    { id: '4', name: 'David Kim' },
    { id: '5', name: 'Jessica Taylor' },
    { id: '6', name: 'Robert Brown' },
  ];

  const taskTypes: DelegationRecord['taskType'][] = ['article', 'signature', 'approval'];
  const reasons = ['workload', 'expertise', 'pto', 'priority', 'reassignment', 'collaboration'];
  const statuses: DelegationRecord['status'][] = ['pending', 'accepted', 'declined', 'completed'];

  const records: DelegationRecord[] = [];

  for (let i = 0; i < count; i++) {
    const fromUser = users[Math.floor(Math.random() * users.length)];
    let toUser = users[Math.floor(Math.random() * users.length)];
    while (toUser.id === fromUser.id) {
      toUser = users[Math.floor(Math.random() * users.length)];
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const delegatedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const respondedAt =
      status !== 'pending'
        ? new Date(delegatedAt.getTime() + Math.random() * 48 * 60 * 60 * 1000)
        : undefined;
    const completedAt =
      status === 'completed'
        ? new Date((respondedAt?.getTime() || delegatedAt.getTime()) + Math.random() * 72 * 60 * 60 * 1000)
        : undefined;

    records.push({
      id: `del-${i + 1}`,
      taskId: `task-${i + 1}`,
      taskType: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      taskTitle: `Task ${i + 1}: ${['Review Document', 'Sign Agreement', 'Approve Request', 'Complete Analysis'][Math.floor(Math.random() * 4)]}`,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name,
      toUserId: toUser.id,
      toUserName: toUser.name,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status,
      delegatedAt,
      respondedAt,
      completedAt,
      originalDueDate: new Date(delegatedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      newDueDate: new Date(delegatedAt.getTime() + 10 * 24 * 60 * 60 * 1000),
      notes: Math.random() > 0.5 ? 'Please prioritize this task' : undefined,
      declineReason: status === 'declined' ? 'Currently at capacity' : undefined,
    });
  }

  return records;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  } else if (hours < 24) {
    return `${Math.round(hours)} hr${hours >= 2 ? 's' : ''}`;
  } else {
    const days = Math.round(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}
