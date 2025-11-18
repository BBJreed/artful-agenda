import { io, Socket } from 'socket.io-client';
import { SyncOperation } from '../types';

export class RealtimeSyncService {
  private socket: Socket | null = null;
  private token: string;
  private url: string;
  
  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }
  
  connect(callback: (operations: SyncOperation[]) => void) {
    // Connect to WebSocket server
    this.socket = io(this.url, {
      auth: {
        token: this.token
      }
    });
    
    // Handle incoming operations
    this.socket.on('operations', (operations: SyncOperation[]) => {
      callback(operations);
    });
    
    // Handle user cursor updates
    this.socket.on('cursorUpdate', (data: { userId: string; x: number; y: number; username: string }) => {
      // This would update UI to show other users' cursors
      console.log('Cursor update from', data.username, 'at', data.x, data.y);
    });
    
    // Handle user presence updates
    this.socket.on('userJoined', (data: { userId: string; username: string }) => {
      console.log('User joined:', data.username);
    });
    
    this.socket.on('userLeft', (data: { userId: string; username: string }) => {
      console.log('User left:', data.username);
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  sendOperations(operations: SyncOperation[]) {
    if (this.socket) {
      this.socket.emit('operations', operations);
    }
  }
  
  sendCursorUpdate(x: number, y: number, username: string) {
    if (this.socket) {
      this.socket.emit('cursorUpdate', { x, y, username });
    }
  }
  
  joinCalendar(calendarId: string, username: string) {
    if (this.socket) {
      this.socket.emit('joinCalendar', { calendarId, username });
    }
  }
  
  leaveCalendar(calendarId: string) {
    if (this.socket) {
      this.socket.emit('leaveCalendar', { calendarId });
    }
  }
}

export default RealtimeSyncService;