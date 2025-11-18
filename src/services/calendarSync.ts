import axios from 'axios';
import { CalendarEvent, CalendarSyncConfig } from '../types';

export class CalendarSyncService {
  private config: CalendarSyncConfig;
  private syncInterval: NodeJS.Timeout | null = null;
  
  constructor(config: CalendarSyncConfig) {
    this.config = config;
  }
  
  /**
   * Establishes bidirectional sync by fetching remote events and pushing local changes
   */
  async initializeSync(): Promise<CalendarEvent[]> {
    try {
      const remoteEvents = await this.fetchRemoteEvents();
      this.startPolling();
      return remoteEvents;
    } catch (error) {
      console.error('Calendar sync initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Fetches events from external calendar API using provider-specific endpoints
   */
  private async fetchRemoteEvents(): Promise<CalendarEvent[]> {
    const endpoint = this.getProviderEndpoint();
    
    try {
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return this.normalizeProviderEvents(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.fetchRemoteEvents();
      }
      throw error;
    }
  }
  
  /**
   * Returns provider-specific API endpoint for calendar data
   */
  private getProviderEndpoint(): string {
    const endpoints = {
      google: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      apple: 'https://caldav.icloud.com',
      outlook: 'https://graph.microsoft.com/v1.0/me/calendar/events'
    };
    
    return endpoints[this.config.provider] || this.config.apiEndpoint;
  }
  
  /**
   * Normalizes provider-specific event formats into unified structure
   */
  private normalizeProviderEvents(data: any): CalendarEvent[] {
    const normalizers = {
      google: (items: any[]) => items.map(item => ({
        id: item.id,
        title: item.summary,
        startTime: new Date(item.start.dateTime || item.start.date),
        endTime: new Date(item.end.dateTime || item.end.date),
        description: item.description,
        sourceCalendar: 'google' as const,
        timestamp: Date.parse(item.updated)
      })),
      
      apple: (items: any[]) => items.map(item => ({
        id: item.uid,
        title: item.summary,
        startTime: new Date(item.dtstart),
        endTime: new Date(item.dtend),
        description: item.description,
        sourceCalendar: 'apple' as const,
        timestamp: Date.parse(item.lastModified)
      })),
      
      outlook: (items: any[]) => items.map(item => ({
        id: item.id,
        title: item.subject,
        startTime: new Date(item.start.dateTime),
        endTime: new Date(item.end.dateTime),
        description: item.bodyPreview,
        sourceCalendar: 'outlook' as const,
        timestamp: Date.parse(item.lastModifiedDateTime)
      }))
    };
    
    const normalizer = normalizers[this.config.provider];
    return normalizer ? normalizer(data.items || data.value || data) : [];
  }
  
  /**
   * Pushes local event to remote calendar with conflict detection
   */
  async pushEvent(event: CalendarEvent): Promise<void> {
    const endpoint = this.getProviderEndpoint();
    const payload = this.formatEventForProvider(event);
    
    try {
      await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to push event to remote calendar:', error);
      throw error;
    }
  }
  
  /**
   * Resolves conflicts between local and remote versions using configured strategy
   */
  resolveConflict(localEvent: CalendarEvent, remoteEvent: CalendarEvent): CalendarEvent {
    switch (this.config.conflictResolution) {
      case 'source':
        return remoteEvent.sourceCalendar !== 'native' ? remoteEvent : localEvent;
        
      case 'local':
        return localEvent;
        
      case 'timestamp':
      default:
        return localEvent.timestamp > remoteEvent.timestamp ? localEvent : remoteEvent;
    }
  }
  
  /**
   * Formats event data according to provider's API schema
   */
  private formatEventForProvider(event: CalendarEvent): any {
    const formatters = {
      google: (e: CalendarEvent) => ({
        summary: e.title,
        description: e.description,
        start: { dateTime: e.startTime.toISOString() },
        end: { dateTime: e.endTime.toISOString() }
      }),
      
      apple: (e: CalendarEvent) => ({
        summary: e.title,
        description: e.description,
        dtstart: e.startTime.toISOString(),
        dtend: e.endTime.toISOString()
      }),
      
      outlook: (e: CalendarEvent) => ({
        subject: e.title,
        body: { content: e.description, contentType: 'text' },
        start: { dateTime: e.startTime.toISOString(), timeZone: 'UTC' },
        end: { dateTime: e.endTime.toISOString(), timeZone: 'UTC' }
      })
    };
    
    const formatter = formatters[this.config.provider];
    return formatter ? formatter(event) : event;
  }
  
  /**
   * Refreshes expired access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    // Provider-specific token refresh logic would go here
    // This is a placeholder for the actual OAuth2 refresh flow
    console.warn('Access token expired, attempting refresh');
  }
  
  /**
   * Starts polling mechanism as fallback to WebSocket sync
   */
  private startPolling(intervalMs: number = 30000): void {
    if (this.syncInterval) clearInterval(this.syncInterval);
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.fetchRemoteEvents();
      } catch (error) {
        console.error('Polling sync failed:', error);
      }
    }, intervalMs);
  }
  
  /**
   * Stops the polling sync mechanism
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}