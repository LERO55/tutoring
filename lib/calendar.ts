import { PublicClientApplication } from '@azure/msal-browser';
import { loginRequest } from './msal-config';

const GRAPH_API = 'https://graph.microsoft.com/v1.0';

export interface TimeSlot {
  start: Date;
  end: Date;
  isFree: boolean;
}

export interface CalendarEvent {
  id?: string;
  subject: string;
  start: Date;
  end: Date;
  location?: string;
  body?: string;
  attendees?: string[];
}

// Get access token for Graph API
async function getAccessToken(msalInstance: PublicClientApplication): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    throw new Error('No account logged in');
  }

  const response = await msalInstance.acquireTokenSilent({
    ...loginRequest,
    account: accounts[0],
  });

  return response.accessToken;
}

// Get user's free/busy times for a date range
export async function getFreeBusyTimes(
  msalInstance: PublicClientApplication,
  startTime: Date,
  endTime: Date
): Promise<TimeSlot[]> {
  const token = await getAccessToken(msalInstance);

  // Get calendar events in the time range
  const response = await fetch(
    `${GRAPH_API}/me/calendarView?startDateTime=${startTime.toISOString()}&endDateTime=${endTime.toISOString()}&$select=subject,start,end,showAs`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch calendar');
  }

  const data = await response.json();
  const busySlots: TimeSlot[] = data.value.map((event: { start: { dateTime: string }; end: { dateTime: string } }) => ({
    start: new Date(event.start.dateTime + 'Z'),
    end: new Date(event.end.dateTime + 'Z'),
    isFree: false,
  }));

  return busySlots;
}

// Check if a specific time slot is free
export async function isTimeFree(
  msalInstance: PublicClientApplication,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const busySlots = await getFreeBusyTimes(msalInstance, startTime, endTime);
  
  // Check if any busy slot overlaps with our desired time
  for (const slot of busySlots) {
    if (startTime < slot.end && endTime > slot.start) {
      return false; // Overlap found
    }
  }
  
  return true;
}

// Get suggested free slots for the next few days
export async function getSuggestedSlots(
  msalInstance: PublicClientApplication,
  durationMinutes: number = 60,
  numSlots: number = 5
): Promise<Date[]> {
  const now = new Date();
  const endSearch = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
  
  const busySlots = await getFreeBusyTimes(msalInstance, now, endSearch);
  
  const freeSlots: Date[] = [];
  const slotDuration = durationMinutes * 60 * 1000;
  
  // Start from the next hour
  let currentTime = new Date(now);
  currentTime.setMinutes(0, 0, 0);
  currentTime.setHours(currentTime.getHours() + 1);
  
  // Only suggest slots during reasonable hours (9 AM - 8 PM)
  while (freeSlots.length < numSlots && currentTime < endSearch) {
    const hour = currentTime.getHours();
    
    // Skip outside of 9 AM - 8 PM
    if (hour >= 9 && hour < 20) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration);
      
      // Check if this slot overlaps with any busy time
      let isFree = true;
      for (const busy of busySlots) {
        if (currentTime < busy.end && slotEnd > busy.start) {
          isFree = false;
          break;
        }
      }
      
      if (isFree) {
        freeSlots.push(new Date(currentTime));
      }
    }
    
    // Move to next slot (30 min intervals)
    currentTime.setMinutes(currentTime.getMinutes() + 30);
    
    // If we're past 8 PM, jump to 9 AM next day
    if (currentTime.getHours() >= 20) {
      currentTime.setDate(currentTime.getDate() + 1);
      currentTime.setHours(9, 0, 0, 0);
    }
  }
  
  return freeSlots;
}

// Create a calendar event
export async function createCalendarEvent(
  msalInstance: PublicClientApplication,
  event: CalendarEvent
): Promise<CalendarEvent> {
  const token = await getAccessToken(msalInstance);

  const eventData = {
    subject: event.subject,
    start: {
      dateTime: event.start.toISOString().slice(0, -1), // Remove 'Z' for local time
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.end.toISOString().slice(0, -1),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    location: event.location ? { displayName: event.location } : undefined,
    body: event.body ? {
      contentType: 'text',
      content: event.body,
    } : undefined,
    attendees: event.attendees?.map(email => ({
      emailAddress: { address: email },
      type: 'required',
    })),
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
  };

  const response = await fetch(`${GRAPH_API}/me/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to create event:', error);
    throw new Error('Failed to create calendar event');
  }

  const created = await response.json();
  return {
    id: created.id,
    subject: created.subject,
    start: new Date(created.start.dateTime),
    end: new Date(created.end.dateTime),
  };
}

// Delete a calendar event
export async function deleteCalendarEvent(
  msalInstance: PublicClientApplication,
  eventId: string
): Promise<void> {
  const token = await getAccessToken(msalInstance);

  const response = await fetch(`${GRAPH_API}/me/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete calendar event');
  }
}

// Format a date for display
export function formatSlotTime(date: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (isToday) {
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 60) {
      return `In ${diffMins} min`;
    }
    return `Today ${timeStr}`;
  }
  
  if (isTomorrow) {
    return `Tomorrow ${timeStr}`;
  }
  
  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${dayStr} ${timeStr}`;
}
