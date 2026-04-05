// Team Workload Balancing Service

export interface TeamMemberWorkload {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  workload: {
    totalTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completedThisWeek: number;
    avgCompletionTime: number;
    estimatedHoursRemaining: number;
  };
  capacity: {
    maxTasks: number;
    currentUtilization: number;
    availableCapacity: number;
    status: 'available' | 'balanced' | 'busy' | 'overloaded';
  };
  skills: string[];
  preferences: {
    preferredTaskTypes: string[];
    maxDailyTasks: number;
    availableHours: number;
  };
}

export interface DelegationRecommendation {
  userId: string;
  userName: string;
  score: number;
  reasons: string[];
  warnings: string[];
  estimatedCompletionTime: string;
  currentWorkload: 'light' | 'moderate' | 'heavy';
}

export interface WorkloadSummary {
  totalTeamMembers: number;
  averageUtilization: number;
  overloadedMembers: number;
  availableMembers: number;
  totalPendingTasks: number;
  totalOverdueTasks: number;
  workloadDistribution: {
    available: number;
    balanced: number;
    busy: number;
    overloaded: number;
  };
}

export function calculateWorkloadStatus(
  utilization: number
): 'available' | 'balanced' | 'busy' | 'overloaded' {
  if (utilization < 50) return 'available';
  if (utilization < 75) return 'balanced';
  if (utilization < 90) return 'busy';
  return 'overloaded';
}

export function calculateUtilization(
  pendingTasks: number,
  maxTasks: number,
  overdueTasks: number
): number {
  const effectiveTasks = pendingTasks + overdueTasks * 0.5;
  return Math.min(100, Math.round((effectiveTasks / maxTasks) * 100));
}

export function getWorkloadColor(status: TeamMemberWorkload['capacity']['status']): string {
  switch (status) {
    case 'available':
      return 'text-green-600 bg-green-100';
    case 'balanced':
      return 'text-blue-600 bg-blue-100';
    case 'busy':
      return 'text-amber-600 bg-amber-100';
    case 'overloaded':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function calculateWorkloadSummary(members: TeamMemberWorkload[]): WorkloadSummary {
  const distribution = { available: 0, balanced: 0, busy: 0, overloaded: 0 };
  let totalUtilization = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  members.forEach((member) => {
    distribution[member.capacity.status]++;
    totalUtilization += member.capacity.currentUtilization;
    totalPending += member.workload.pendingTasks;
    totalOverdue += member.workload.overdueTasks;
  });

  return {
    totalTeamMembers: members.length,
    averageUtilization: Math.round(totalUtilization / members.length),
    overloadedMembers: distribution.overloaded,
    availableMembers: distribution.available,
    totalPendingTasks: totalPending,
    totalOverdueTasks: totalOverdue,
    workloadDistribution: distribution,
  };
}

export function getDelegationRecommendations(
  taskType: string,
  taskPriority: 'low' | 'medium' | 'high',
  estimatedHours: number,
  teamMembers: TeamMemberWorkload[],
  excludeUserIds: string[] = []
): DelegationRecommendation[] {
  const recommendations: DelegationRecommendation[] = [];

  teamMembers
    .filter((member) => !excludeUserIds.includes(member.id))
    .forEach((member) => {
      let score = 0;
      const reasons: string[] = [];
      const warnings: string[] = [];

      if (member.capacity.status === 'available') {
        score += 40;
        reasons.push('Has available capacity');
      } else if (member.capacity.status === 'balanced') {
        score += 30;
        reasons.push('Workload is balanced');
      } else if (member.capacity.status === 'busy') {
        score += 15;
        warnings.push('Currently busy');
      } else {
        warnings.push('Currently overloaded');
      }

      if (member.skills.includes(taskType)) {
        score += 30;
        reasons.push(`Has ${taskType} expertise`);
      }

      if (member.preferences.availableHours >= estimatedHours) {
        score += 20;
        reasons.push('Has sufficient available hours');
      }

      if (member.workload.overdueTasks > 0) {
        score -= member.workload.overdueTasks * 5;
        warnings.push(`Has ${member.workload.overdueTasks} overdue task(s)`);
      }

      score = Math.max(0, Math.min(100, score));

      recommendations.push({
        userId: member.id,
        userName: member.name,
        score,
        reasons,
        warnings,
        estimatedCompletionTime: `~${Math.ceil(estimatedHours)} hours`,
        currentWorkload: member.capacity.currentUtilization < 50 
          ? 'light' 
          : member.capacity.currentUtilization < 80 
            ? 'moderate' 
            : 'heavy',
      });
    });

  return recommendations.sort((a, b) => b.score - a.score);
}

export function needsRebalancing(summary: WorkloadSummary): boolean {
  const overloadedPercent = (summary.overloadedMembers / summary.totalTeamMembers) * 100;
  const hasImbalance = summary.overloadedMembers > 0 && summary.availableMembers > 0;
  return overloadedPercent > 20 || summary.averageUtilization > 85 || hasImbalance;
}

export function getRebalancingSuggestions(
  members: TeamMemberWorkload[]
): { from: string; to: string; tasksToMove: number }[] {
  const suggestions: { from: string; to: string; tasksToMove: number }[] = [];
  
  const overloaded = members.filter((m) => m.capacity.status === 'overloaded');
  const available = members.filter((m) => m.capacity.status === 'available');
  
  overloaded.forEach((overloadedMember) => {
    const excessTasks = overloadedMember.workload.pendingTasks - overloadedMember.capacity.maxTasks;
    
    if (excessTasks > 0 && available.length > 0) {
      const bestMatch = available.find(
        (a) => a.capacity.availableCapacity >= excessTasks
      ) || available[0];
      
      if (bestMatch) {
        const tasksToMove = Math.min(excessTasks, bestMatch.capacity.availableCapacity);
        suggestions.push({
          from: overloadedMember.name,
          to: bestMatch.name,
          tasksToMove,
        });
      }
    }
  });
  
  return suggestions;
}

export function generateMockWorkloadData(count: number = 8): TeamMemberWorkload[] {
  const names = [
    'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim',
    'Jessica Taylor', 'Robert Brown', 'Amanda Wilson', 'Christopher Lee',
    'Michelle Garcia', 'Daniel Martinez', 'Jennifer Anderson', 'James Thomas'
  ];
  
  const departments = ['Finance', 'Legal', 'HR', 'Operations', 'Marketing', 'IT'];
  const roles = ['Analyst', 'Manager', 'Specialist', 'Coordinator', 'Director'];
  const skills = ['article', 'signature', 'approval', 'review', 'analysis', 'compliance'];
  
  return names.slice(0, count).map((name, index) => {
    const pendingTasks = Math.floor(Math.random() * 15) + 1;
    const overdueTasks = Math.floor(Math.random() * 3);
    const maxTasks = 10;
    const utilization = calculateUtilization(pendingTasks, maxTasks, overdueTasks);
    
    return {
      id: `user-${index + 1}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      workload: {
        totalTasks: pendingTasks + Math.floor(Math.random() * 30) + 10,
        pendingTasks,
        overdueTasks,
        completedThisWeek: Math.floor(Math.random() * 10) + 3,
        avgCompletionTime: Math.floor(Math.random() * 24) + 4,
        estimatedHoursRemaining: pendingTasks * 4,
      },
      capacity: {
        maxTasks,
        currentUtilization: utilization,
        availableCapacity: Math.max(0, maxTasks - pendingTasks),
        status: calculateWorkloadStatus(utilization),
      },
      skills: skills.slice(0, Math.floor(Math.random() * 4) + 2),
      preferences: {
        preferredTaskTypes: skills.slice(0, 2),
        maxDailyTasks: 5,
        availableHours: 8,
      },
    };
  });
}
