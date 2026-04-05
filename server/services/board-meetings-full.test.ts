import { describe, it, expect } from 'vitest';
import {
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
} from './board-meetings-full';

describe('Board Meetings Full Service', () => {
  describe('createBoardMeeting', () => {
    it('should create a new board meeting', () => {
      const meeting = createBoardMeeting(
        'Q1 Board Meeting',
        'regular',
        new Date('2024-03-15T10:00:00'),
        'Conference Room A',
        'admin-001'
      );

      expect(meeting.meetingId).toContain('mtg-');
      expect(meeting.title).toBe('Q1 Board Meeting');
      expect(meeting.type).toBe('regular');
      expect(meeting.status).toBe('scheduled');
      expect(meeting.quorumRequired).toBe(0.5);
    });

    it('should include virtual link if provided', () => {
      const meeting = createBoardMeeting(
        'Virtual Meeting',
        'special',
        new Date(),
        'Virtual',
        'admin-001',
        0.5,
        'https://zoom.us/j/123456'
      );

      expect(meeting.virtualLink).toBe('https://zoom.us/j/123456');
    });
  });

  describe('addAgendaItem', () => {
    it('should add agenda items with correct order', () => {
      let meeting = createBoardMeeting('Test Meeting', 'regular', new Date(), 'Room A', 'admin');
      meeting = addAgendaItem(meeting, 'Call to Order', 'Opening', 5, false);
      meeting = addAgendaItem(meeting, 'Budget Approval', 'Review Q1 budget', 30, true);

      expect(meeting.agenda).toHaveLength(2);
      expect(meeting.agenda[0].order).toBe(1);
      expect(meeting.agenda[1].order).toBe(2);
      expect(meeting.agenda[1].requiresVote).toBe(true);
    });
  });

  describe('addAttendee', () => {
    it('should add attendees with roles', () => {
      let meeting = createBoardMeeting('Test Meeting', 'regular', new Date(), 'Room A', 'admin');
      meeting = addAttendee(meeting, 'member-001', 'John Freeman', 'chair');
      meeting = addAttendee(meeting, 'member-002', 'Jane Smith', 'member');

      expect(meeting.attendees).toHaveLength(2);
      expect(meeting.attendees[0].role).toBe('chair');
      expect(meeting.attendees[0].status).toBe('invited');
    });
  });

  describe('updateAttendeeStatus', () => {
    it('should update attendee status', () => {
      let meeting = createBoardMeeting('Test Meeting', 'regular', new Date(), 'Room A', 'admin');
      meeting = addAttendee(meeting, 'member-001', 'John Freeman', 'member');
      meeting = updateAttendeeStatus(meeting, 'member-001', 'confirmed');

      expect(meeting.attendees[0].status).toBe('confirmed');
    });
  });

  describe('recuseAttendee', () => {
    it('should mark attendee as recused with reason', () => {
      let meeting = createBoardMeeting('Test Meeting', 'regular', new Date(), 'Room A', 'admin');
      meeting = addAttendee(meeting, 'member-001', 'John Freeman', 'member');
      meeting = recuseAttendee(meeting, 'member-001', 'Conflict of interest');

      expect(meeting.attendees[0].isRecused).toBe(true);
      expect(meeting.attendees[0].recusalReason).toBe('Conflict of interest');
    });
  });

  describe('checkQuorum', () => {
    it('should correctly calculate quorum', () => {
      let meeting = createBoardMeeting('Test Meeting', 'regular', new Date(), 'Room A', 'admin', 0.5);
      meeting = addAttendee(meeting, 'member-001', 'John', 'member');
      meeting = addAttendee(meeting, 'member-002', 'Jane', 'member');
      meeting = addAttendee(meeting, 'member-003', 'Bob', 'member');
      meeting = addAttendee(meeting, 'member-004', 'Alice', 'member');
      
      meeting = updateAttendeeStatus(meeting, 'member-001', 'attended');
      meeting = updateAttendeeStatus(meeting, 'member-002', 'attended');

      const quorum = checkQuorum(meeting);
      expect(quorum.hasQuorum).toBe(true);
      expect(quorum.present).toBe(2);
      expect(quorum.required).toBe(2);
    });

    it('should exclude guests from quorum calculation', () => {
      let meeting = createBoardMeeting('Test Meeting', 'regular', new Date(), 'Room A', 'admin', 0.5);
      meeting = addAttendee(meeting, 'member-001', 'John', 'member');
      meeting = addAttendee(meeting, 'member-002', 'Jane', 'member');
      meeting = addAttendee(meeting, 'guest-001', 'Guest', 'guest');
      
      meeting = updateAttendeeStatus(meeting, 'member-001', 'attended');

      const quorum = checkQuorum(meeting);
      expect(quorum.required).toBe(1); // 50% of 2 voting members
    });
  });

  describe('startMeeting and endMeeting', () => {
    it('should update meeting status and times', () => {
      let meeting = createBoardMeeting('Test Meeting', 'regular', new Date(), 'Room A', 'admin');
      meeting = startMeeting(meeting);
      expect(meeting.status).toBe('in_progress');
      expect(meeting.startTime).toBeDefined();

      meeting = endMeeting(meeting);
      expect(meeting.status).toBe('completed');
      expect(meeting.endTime).toBeDefined();
    });
  });

  describe('Voting', () => {
    it('should create and record votes', () => {
      let vote = createVote('agenda-001', 'simple_majority', 'Approve Q1 budget', 'member-001', 'member-002');
      expect(vote.voteId).toContain('vote-');
      expect(vote.result).toBe('pending');

      vote = recordVote(vote, 'member-001', 'John', 'yes');
      vote = recordVote(vote, 'member-002', 'Jane', 'yes');
      vote = recordVote(vote, 'member-003', 'Bob', 'no');

      expect(vote.votes).toHaveLength(3);
    });

    it('should calculate simple majority correctly', () => {
      let vote = createVote('agenda-001', 'simple_majority', 'Test motion', 'member-001');
      vote = recordVote(vote, 'member-001', 'John', 'yes');
      vote = recordVote(vote, 'member-002', 'Jane', 'yes');
      vote = recordVote(vote, 'member-003', 'Bob', 'no');

      vote = calculateVoteResult(vote);
      expect(vote.result).toBe('passed');
    });

    it('should calculate two-thirds majority correctly', () => {
      let vote = createVote('agenda-001', 'two_thirds', 'Amendment', 'member-001');
      vote = recordVote(vote, 'member-001', 'John', 'yes');
      vote = recordVote(vote, 'member-002', 'Jane', 'yes');
      vote = recordVote(vote, 'member-003', 'Bob', 'yes');
      vote = recordVote(vote, 'member-004', 'Alice', 'yes');
      vote = recordVote(vote, 'member-005', 'Charlie', 'no');
      vote = recordVote(vote, 'member-006', 'Diana', 'no');

      vote = calculateVoteResult(vote);
      expect(vote.result).toBe('passed'); // 4/6 = 66.67% >= 66.67%
    });

    it('should calculate unanimous vote correctly', () => {
      let vote = createVote('agenda-001', 'unanimous', 'Critical decision', 'member-001');
      vote = recordVote(vote, 'member-001', 'John', 'yes');
      vote = recordVote(vote, 'member-002', 'Jane', 'yes');
      vote = recordVote(vote, 'member-003', 'Bob', 'no');

      vote = calculateVoteResult(vote);
      expect(vote.result).toBe('failed');
    });

    it('should handle recused votes', () => {
      let vote = createVote('agenda-001', 'simple_majority', 'Test', 'member-001');
      vote = recordVote(vote, 'member-001', 'John', 'yes');
      vote = recordVote(vote, 'member-002', 'Jane', 'recused');
      vote = recordVote(vote, 'member-003', 'Bob', 'no');

      vote = calculateVoteResult(vote);
      // Only 2 valid votes (yes and no), yes > 50%
      expect(vote.result).toBe('failed'); // 1 yes, 1 no = tie, fails
    });
  });

  describe('Meeting Minutes', () => {
    it('should create meeting minutes', () => {
      const minutes = createMeetingMinutes('mtg-001', 'secretary-001', 'Meeting proceedings...');
      expect(minutes.minutesId).toContain('min-');
      expect(minutes.status).toBe('draft');
    });

    it('should add action items', () => {
      let minutes = createMeetingMinutes('mtg-001', 'secretary-001', 'Content');
      minutes = addActionItem(minutes, 'Follow up on budget', 'John Freeman', new Date('2024-04-01'));

      expect(minutes.actionItems).toHaveLength(1);
      expect(minutes.actionItems[0].status).toBe('pending');
    });

    it('should add decisions', () => {
      let minutes = createMeetingMinutes('mtg-001', 'secretary-001', 'Content');
      minutes = addDecision(minutes, 'Budget approved for Q1', new Date('2024-03-15'), 'Passed 5-1');

      expect(minutes.decisions).toHaveLength(1);
      expect(minutes.decisions[0].voteResult).toBe('Passed 5-1');
    });

    it('should approve minutes', () => {
      let minutes = createMeetingMinutes('mtg-001', 'secretary-001', 'Content');
      minutes = approveMinutes(minutes, 'chair-001');

      expect(minutes.status).toBe('approved');
      expect(minutes.approvedBy).toBe('chair-001');
      expect(minutes.approvedAt).toBeDefined();
    });
  });

  describe('generateMeetingReminder', () => {
    it('should generate formatted reminder', () => {
      let meeting = createBoardMeeting('Q1 Meeting', 'regular', new Date('2024-03-15T10:00:00'), 'Room A', 'admin');
      meeting = addAgendaItem(meeting, 'Budget Review', 'Review Q1', 30, true);

      const reminder = generateMeetingReminder(meeting);
      expect(reminder).toContain('BOARD MEETING REMINDER');
      expect(reminder).toContain('Q1 Meeting');
      expect(reminder).toContain('Budget Review');
      expect(reminder).toContain('[VOTE REQUIRED]');
    });
  });

  describe('generateMinutesDocument', () => {
    it('should generate formatted minutes document', () => {
      let meeting = createBoardMeeting('Q1 Meeting', 'regular', new Date('2024-03-15'), 'Room A', 'admin');
      meeting = addAttendee(meeting, 'member-001', 'John Freeman', 'chair');
      meeting = updateAttendeeStatus(meeting, 'member-001', 'attended');
      meeting = endMeeting(meeting);

      let minutes = createMeetingMinutes(meeting.meetingId, 'secretary', 'The meeting was called to order...');
      minutes = addDecision(minutes, 'Budget approved', new Date(), 'Passed');

      const doc = generateMinutesDocument(meeting, minutes);
      expect(doc).toContain('MINUTES OF BOARD MEETING');
      expect(doc).toContain('John Freeman');
      expect(doc).toContain('Budget approved');
    });
  });
});
