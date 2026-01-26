/**
 * Board Meetings Full Service
 * Phase 65: Complete board meeting management with voting, minutes, and notifications
 */

export type MeetingType = 'regular' | 'special' | 'emergency' | 'annual';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type VoteType = 'simple_majority' | 'two_thirds' | 'unanimous' | 'abstain_allowed';
export type VoteChoice = 'yes' | 'no' | 'abstain' | 'recused';

export interface BoardMeeting {
  meetingId: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  scheduledDate: Date;
  startTime?: Date;
  endTime?: Date;
  location: string;
  virtualLink?: string;
  agenda: AgendaItem[];
  attendees: Attendee[];
  quorumRequired: number;
  createdBy: string;
  createdAt: Date;
  notes?: string;
}

export interface AgendaItem {
  itemId: string;
  order: number;
  title: string;
  description: string;
  presenter?: string;
  duration: number; // minutes
  requiresVote: boolean;
  vote?: VoteRecord;
  status: 'pending' | 'discussed' | 'tabled' | 'completed';
}

export interface Attendee {
  memberId: string;
  name: string;
  role: 'chair' | 'secretary' | 'member' | 'guest';
  status: 'invited' | 'confirmed' | 'declined' | 'attended' | 'absent';
  isRecused?: boolean;
  recusalReason?: string;
}

export interface VoteRecord {
  voteId: string;
  agendaItemId: string;
  voteType: VoteType;
  motion: string;
  movedBy: string;
  secondedBy?: string;
  votes: IndividualVote[];
  result: 'passed' | 'failed' | 'tabled' | 'pending';
  recordedAt: Date;
}

export interface IndividualVote {
  memberId: string;
  memberName: string;
  choice: VoteChoice;
  timestamp: Date;
}

export interface MeetingMinutes {
  minutesId: string;
  meetingId: string;
  preparedBy: string;
  preparedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  content: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  status: 'draft' | 'pending_approval' | 'approved';
}

export interface ActionItem {
  itemId: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
}

export interface Decision {
  decisionId: string;
  description: string;
  voteResult?: string;
  effectiveDate: Date;
}

export function createBoardMeeting(
  title: string,
  type: MeetingType,
  scheduledDate: Date,
  location: string,
  createdBy: string,
  quorumRequired: number = 0.5,
  virtualLink?: string
): BoardMeeting {
  return {
    meetingId: `mtg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    type,
    status: 'scheduled',
    scheduledDate,
    location,
    virtualLink,
    agenda: [],
    attendees: [],
    quorumRequired,
    createdBy,
    createdAt: new Date()
  };
}

export function addAgendaItem(
  meeting: BoardMeeting,
  title: string,
  description: string,
  duration: number,
  requiresVote: boolean = false,
  presenter?: string
): BoardMeeting {
  const newItem: AgendaItem = {
    itemId: `agenda-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    order: meeting.agenda.length + 1,
    title,
    description,
    presenter,
    duration,
    requiresVote,
    status: 'pending'
  };

  return {
    ...meeting,
    agenda: [...meeting.agenda, newItem]
  };
}

export function addAttendee(
  meeting: BoardMeeting,
  memberId: string,
  name: string,
  role: Attendee['role']
): BoardMeeting {
  const newAttendee: Attendee = {
    memberId,
    name,
    role,
    status: 'invited'
  };

  return {
    ...meeting,
    attendees: [...meeting.attendees, newAttendee]
  };
}

export function updateAttendeeStatus(
  meeting: BoardMeeting,
  memberId: string,
  status: Attendee['status']
): BoardMeeting {
  return {
    ...meeting,
    attendees: meeting.attendees.map(a =>
      a.memberId === memberId ? { ...a, status } : a
    )
  };
}

export function recuseAttendee(
  meeting: BoardMeeting,
  memberId: string,
  reason: string
): BoardMeeting {
  return {
    ...meeting,
    attendees: meeting.attendees.map(a =>
      a.memberId === memberId ? { ...a, isRecused: true, recusalReason: reason } : a
    )
  };
}

export function checkQuorum(meeting: BoardMeeting): { hasQuorum: boolean; present: number; required: number } {
  const votingMembers = meeting.attendees.filter(a => a.role !== 'guest');
  const presentMembers = votingMembers.filter(a => a.status === 'attended' || a.status === 'confirmed');
  const required = Math.ceil(votingMembers.length * meeting.quorumRequired);

  return {
    hasQuorum: presentMembers.length >= required,
    present: presentMembers.length,
    required
  };
}

export function startMeeting(meeting: BoardMeeting): BoardMeeting {
  return {
    ...meeting,
    status: 'in_progress',
    startTime: new Date()
  };
}

export function endMeeting(meeting: BoardMeeting): BoardMeeting {
  return {
    ...meeting,
    status: 'completed',
    endTime: new Date()
  };
}

export function createVote(
  agendaItemId: string,
  voteType: VoteType,
  motion: string,
  movedBy: string,
  secondedBy?: string
): VoteRecord {
  return {
    voteId: `vote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    agendaItemId,
    voteType,
    motion,
    movedBy,
    secondedBy,
    votes: [],
    result: 'pending',
    recordedAt: new Date()
  };
}

export function recordVote(
  voteRecord: VoteRecord,
  memberId: string,
  memberName: string,
  choice: VoteChoice
): VoteRecord {
  const newVote: IndividualVote = {
    memberId,
    memberName,
    choice,
    timestamp: new Date()
  };

  return {
    ...voteRecord,
    votes: [...voteRecord.votes, newVote]
  };
}

export function calculateVoteResult(voteRecord: VoteRecord): VoteRecord {
  const validVotes = voteRecord.votes.filter(v => v.choice !== 'recused');
  const yesVotes = validVotes.filter(v => v.choice === 'yes').length;
  const noVotes = validVotes.filter(v => v.choice === 'no').length;
  const totalVotes = validVotes.filter(v => v.choice !== 'abstain').length;

  let result: VoteRecord['result'] = 'pending';

  if (totalVotes === 0) {
    result = 'failed';
  } else {
    switch (voteRecord.voteType) {
      case 'simple_majority':
        result = yesVotes > totalVotes / 2 ? 'passed' : 'failed';
        break;
      case 'two_thirds':
        result = yesVotes >= (totalVotes * 2) / 3 ? 'passed' : 'failed';
        break;
      case 'unanimous':
        result = noVotes === 0 && yesVotes > 0 ? 'passed' : 'failed';
        break;
      case 'abstain_allowed':
        result = yesVotes > noVotes ? 'passed' : 'failed';
        break;
    }
  }

  return {
    ...voteRecord,
    result
  };
}

export function createMeetingMinutes(
  meetingId: string,
  preparedBy: string,
  content: string
): MeetingMinutes {
  return {
    minutesId: `min-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    meetingId,
    preparedBy,
    preparedAt: new Date(),
    content,
    actionItems: [],
    decisions: [],
    status: 'draft'
  };
}

export function addActionItem(
  minutes: MeetingMinutes,
  description: string,
  assignedTo: string,
  dueDate: Date
): MeetingMinutes {
  const newItem: ActionItem = {
    itemId: `action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description,
    assignedTo,
    dueDate,
    status: 'pending'
  };

  return {
    ...minutes,
    actionItems: [...minutes.actionItems, newItem]
  };
}

export function addDecision(
  minutes: MeetingMinutes,
  description: string,
  effectiveDate: Date,
  voteResult?: string
): MeetingMinutes {
  const newDecision: Decision = {
    decisionId: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description,
    voteResult,
    effectiveDate
  };

  return {
    ...minutes,
    decisions: [...minutes.decisions, newDecision]
  };
}

export function approveMinutes(
  minutes: MeetingMinutes,
  approvedBy: string
): MeetingMinutes {
  return {
    ...minutes,
    approvedBy,
    approvedAt: new Date(),
    status: 'approved'
  };
}

export function generateMeetingReminder(meeting: BoardMeeting): string {
  return `
BOARD MEETING REMINDER
======================

Meeting: ${meeting.title}
Type: ${meeting.type.toUpperCase()}
Date: ${meeting.scheduledDate.toLocaleDateString()}
Time: ${meeting.scheduledDate.toLocaleTimeString()}
Location: ${meeting.location}
${meeting.virtualLink ? `Virtual Link: ${meeting.virtualLink}` : ''}

AGENDA
------
${meeting.agenda.map((item, idx) => `${idx + 1}. ${item.title} (${item.duration} min)${item.requiresVote ? ' [VOTE REQUIRED]' : ''}`).join('\n')}

Please confirm your attendance.
`;
}

export function generateMinutesDocument(meeting: BoardMeeting, minutes: MeetingMinutes): string {
  const quorumStatus = checkQuorum(meeting);
  
  return `
MINUTES OF BOARD MEETING
========================

Meeting: ${meeting.title}
Date: ${meeting.scheduledDate.toLocaleDateString()}
Location: ${meeting.location}
Type: ${meeting.type.toUpperCase()}

ATTENDANCE
----------
Present: ${meeting.attendees.filter(a => a.status === 'attended').map(a => a.name).join(', ')}
Absent: ${meeting.attendees.filter(a => a.status === 'absent').map(a => a.name).join(', ') || 'None'}
Quorum: ${quorumStatus.hasQuorum ? 'ACHIEVED' : 'NOT ACHIEVED'} (${quorumStatus.present}/${quorumStatus.required} required)

PROCEEDINGS
-----------
${minutes.content}

DECISIONS MADE
--------------
${minutes.decisions.map((d, idx) => `${idx + 1}. ${d.description}${d.voteResult ? ` (Vote: ${d.voteResult})` : ''}`).join('\n') || 'None'}

ACTION ITEMS
------------
${minutes.actionItems.map((a, idx) => `${idx + 1}. ${a.description} - Assigned to: ${a.assignedTo}, Due: ${a.dueDate.toLocaleDateString()}`).join('\n') || 'None'}

ADJOURNMENT
-----------
Meeting adjourned at ${meeting.endTime?.toLocaleTimeString() || 'N/A'}

Minutes prepared by: ${minutes.preparedBy}
Date: ${minutes.preparedAt.toLocaleDateString()}
${minutes.approvedBy ? `Approved by: ${minutes.approvedBy} on ${minutes.approvedAt?.toLocaleDateString()}` : 'Status: PENDING APPROVAL'}
`;
}

export const boardMeetingsFull = {
  createBoardMeeting,
  addAgendaItem,
  addAttendee,
  updateAttendeeStatus,
  recuseAttendee,
  checkQuorum,
  startMeeting,
  endMeeting,
  createVote,
  recordVote,
  calculateVoteResult,
  createMeetingMinutes,
  addActionItem,
  addDecision,
  approveMinutes,
  generateMeetingReminder,
  generateMinutesDocument
};
