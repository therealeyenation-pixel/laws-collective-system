// Calendar Sync Service for Google Calendar and Outlook integration

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  reminders?: { method: 'email' | 'popup'; minutes: number }[];
  recurrence?: string;
  source: 'system' | 'google' | 'outlook';
  externalId?: string;
  category: 'meeting' | 'deadline' | 'compliance' | 'grant' | 'other';
}

export interface CalendarConnection {
  provider: 'google' | 'outlook';
  connected: boolean;
  email?: string;
  lastSync?: Date;
  syncEnabled: boolean;
  calendarId?: string;
}

export interface SyncResult {
  success: boolean;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  errors: string[];
}

class CalendarSyncService {
  private readonly STORAGE_KEY = 'calendar_connections';
  private readonly EVENTS_KEY = 'calendar_events';

  // Get stored connections
  getConnections(): CalendarConnection[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  }

  // Save connection
  saveConnection(connection: CalendarConnection): void {
    const connections = this.getConnections();
    const index = connections.findIndex(c => c.provider === connection.provider);
    if (index >= 0) {
      connections[index] = connection;
    } else {
      connections.push(connection);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
  }

  // Remove connection
  removeConnection(provider: 'google' | 'outlook'): void {
    const connections = this.getConnections().filter(c => c.provider !== provider);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connections));
  }

  // Generate Google OAuth URL
  getGoogleAuthUrl(): string {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/api/calendar/google/callback`;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar');
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  }

  // Generate Outlook OAuth URL
  getOutlookAuthUrl(): string {
    const clientId = import.meta.env.VITE_OUTLOOK_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/api/calendar/outlook/callback`;
    const scope = encodeURIComponent('Calendars.ReadWrite offline_access');
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  }

  // Get local events
  getLocalEvents(): CalendarEvent[] {
    const stored = localStorage.getItem(this.EVENTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((e: any) => ({
      ...e,
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
    }));
  }

  // Save local event
  saveLocalEvent(event: CalendarEvent): void {
    const events = this.getLocalEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
  }

  // Delete local event
  deleteLocalEvent(eventId: string): void {
    const events = this.getLocalEvents().filter(e => e.id !== eventId);
    localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
  }

  // Create system event from board meeting
  createBoardMeetingEvent(meeting: {
    id: string;
    title: string;
    date: Date;
    duration: number;
    location?: string;
    attendees?: string[];
  }): CalendarEvent {
    const endTime = new Date(meeting.date);
    endTime.setMinutes(endTime.getMinutes() + meeting.duration);

    return {
      id: `board-meeting-${meeting.id}`,
      title: meeting.title,
      description: 'Board Meeting - The The L.A.W.S. Collective',
      startTime: meeting.date,
      endTime,
      location: meeting.location,
      attendees: meeting.attendees,
      reminders: [
        { method: 'email', minutes: 1440 }, // 24 hours
        { method: 'popup', minutes: 60 },   // 1 hour
      ],
      source: 'system',
      category: 'meeting',
    };
  }

  // Create system event from grant deadline
  createGrantDeadlineEvent(grant: {
    id: string;
    name: string;
    deadline: Date;
    type: string;
  }): CalendarEvent {
    const endTime = new Date(grant.deadline);
    endTime.setHours(23, 59, 59);

    return {
      id: `grant-deadline-${grant.id}`,
      title: `Grant Deadline: ${grant.name}`,
      description: `${grant.type} deadline for ${grant.name}`,
      startTime: grant.deadline,
      endTime,
      reminders: [
        { method: 'email', minutes: 10080 }, // 7 days
        { method: 'email', minutes: 1440 },  // 24 hours
        { method: 'popup', minutes: 60 },    // 1 hour
      ],
      source: 'system',
      category: 'grant',
    };
  }

  // Create system event from compliance date
  createComplianceEvent(compliance: {
    id: string;
    title: string;
    dueDate: Date;
    entity: string;
  }): CalendarEvent {
    const endTime = new Date(compliance.dueDate);
    endTime.setHours(23, 59, 59);

    return {
      id: `compliance-${compliance.id}`,
      title: `Compliance: ${compliance.title}`,
      description: `Compliance requirement for ${compliance.entity}`,
      startTime: compliance.dueDate,
      endTime,
      reminders: [
        { method: 'email', minutes: 20160 }, // 14 days
        { method: 'email', minutes: 10080 }, // 7 days
        { method: 'popup', minutes: 1440 },  // 24 hours
      ],
      source: 'system',
      category: 'compliance',
    };
  }

  // Generate ICS file for download
  generateICS(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The The L.A.W.S. Collective//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@laws-collective.com`,
      `DTSTART:${formatDate(event.startTime)}`,
      `DTEND:${formatDate(event.endTime)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    return ics;
  }

  // Download ICS file
  downloadICS(event: CalendarEvent): void {
    const ics = this.generateICS(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Check availability (mock - would integrate with real calendar API)
  async checkAvailability(
    attendees: string[],
    startTime: Date,
    endTime: Date
  ): Promise<{ available: boolean; conflicts: string[] }> {
    // In production, this would call the calendar API
    // For now, return mock availability
    return {
      available: true,
      conflicts: [],
    };
  }

  // Find available slots (mock - would integrate with real calendar API)
  async findAvailableSlots(
    attendees: string[],
    duration: number,
    startDate: Date,
    endDate: Date
  ): Promise<{ start: Date; end: Date }[]> {
    // In production, this would call the calendar API
    // For now, return mock slots
    const slots: { start: Date; end: Date }[] = [];
    const current = new Date(startDate);

    while (current < endDate && slots.length < 5) {
      // Skip weekends
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        // Add 9 AM slot
        const start = new Date(current);
        start.setHours(9, 0, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + duration);
        slots.push({ start, end });

        // Add 2 PM slot
        const start2 = new Date(current);
        start2.setHours(14, 0, 0, 0);
        const end2 = new Date(start2);
        end2.setMinutes(end2.getMinutes() + duration);
        slots.push({ start: start2, end: end2 });
      }
      current.setDate(current.getDate() + 1);
    }

    return slots.slice(0, 5);
  }
}

export const calendarSyncService = new CalendarSyncService();
export default calendarSyncService;
