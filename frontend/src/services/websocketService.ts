import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

class WebSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(WS_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Ride events
  onRideStatusUpdate(callback: (ride: any) => void): void {
    if (this.socket) {
      this.socket.on('ride:status-updated', callback);
    }
  }

  onRideAssigned(callback: (data: { rideId: string; driver: any }) => void): void {
    if (this.socket) {
      this.socket.on('ride:assigned', callback);
    }
  }

  // Driver events
  onDriverLocationUpdate(callback: (data: { driverId: string; location: any }) => void): void {
    if (this.socket) {
      this.socket.on('driver:location-updated', callback);
    }
  }

  onRideRequest(callback: (ride: any) => void): void {
    if (this.socket) {
      this.socket.on('ride:requested', callback);
    }
  }

  // Trip events
  onTripStatusUpdate(callback: (trip: any) => void): void {
    if (this.socket) {
      this.socket.on('trip:status-updated', callback);
    }
  }

  // Admin events
  onSystemStatsUpdate(callback: (stats: any) => void): void {
    if (this.socket) {
      this.socket.on('admin:stats-updated', callback);
    }
  }

  // Emit events
  emitDriverLocation(location: any): void {
    if (this.socket) {
      this.socket.emit('driver:location', location);
    }
  }

  emitDriverStatus(status: string): void {
    if (this.socket) {
      this.socket.emit('driver:status', status);
    }
  }

  // Remove listeners
  off(event: string, callback?: any): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const websocketService = new WebSocketService();