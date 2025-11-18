/**
 * Geofencing Service
 * Handles location-based reminders and triggers
 */

export class GeofencingService {
  private static instance: GeofencingService;
  private geofences: Array<{
    id: string;
    latitude: number;
    longitude: number;
    radius: number;
    onEnter: () => void;
    onExit: () => void;
    lastState: 'inside' | 'outside' | null;
  }> = [];
  private watchId: number | null = null;
  private isWatching: boolean = false;

  private constructor() {
    // Initialize geofencing service
  }

  static getInstance(): GeofencingService {
    if (!GeofencingService.instance) {
      GeofencingService.instance = new GeofencingService();
    }
    return GeofencingService.instance;
  }

  /**
   * Add a geofence
   */
  addGeofence(
    id: string,
    latitude: number,
    longitude: number,
    radius: number,
    onEnter: () => void,
    onExit: () => void
  ): void {
    this.geofences.push({
      id,
      latitude,
      longitude,
      radius,
      onEnter,
      onExit,
      lastState: null
    });

    // Start watching if not already
    if (!this.isWatching) {
      this.startWatching();
    }
  }

  /**
   * Remove a geofence
   */
  removeGeofence(id: string): void {
    this.geofences = this.geofences.filter(geofence => geofence.id !== id);
    
    // Stop watching if no geofences left
    if (this.geofences.length === 0) {
      this.stopWatching();
    }
  }

  /**
   * Start watching position for geofence detection
   */
  private startWatching(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    this.isWatching = true;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.checkGeofences(position),
      (error) => console.error('Geolocation error:', error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  /**
   * Stop watching position
   */
  private stopWatching(): void {
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
    }
  }

  /**
   * Check all geofences against current position
   */
  private checkGeofences(position: GeolocationPosition): void {
    const { latitude, longitude } = position.coords;

    this.geofences.forEach(geofence => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radius;
      const currentState = isInside ? 'inside' : 'outside';

      // Trigger events based on state changes
      if (geofence.lastState !== currentState) {
        if (isInside && geofence.lastState === 'outside') {
          console.log(`Entering geofence: ${geofence.id}`);
          geofence.onEnter();
        } else if (!isInside && geofence.lastState === 'inside') {
          console.log(`Exiting geofence: ${geofence.id}`);
          geofence.onExit();
        }
        
        geofence.lastState = currentState;
      }
    });
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Get all active geofences
   */
  getGeofences(): Array<{ id: string; latitude: number; longitude: number; radius: number }> {
    return this.geofences.map(geofence => ({
      id: geofence.id,
      latitude: geofence.latitude,
      longitude: geofence.longitude,
      radius: geofence.radius
    }));
  }

  /**
   * Check if geofencing is supported
   */
  isSupported(): boolean {
    return !!navigator.geolocation;
  }

  /**
   * Simulate geofence entry for testing
   */
  simulateGeofenceEntry(id: string): void {
    const geofence = this.geofences.find(g => g.id === id);
    if (geofence && geofence.lastState !== 'inside') {
      geofence.lastState = 'inside';
      geofence.onEnter();
    }
  }

  /**
   * Simulate geofence exit for testing
   */
  simulateGeofenceExit(id: string): void {
    const geofence = this.geofences.find(g => g.id === id);
    if (geofence && geofence.lastState !== 'outside') {
      geofence.lastState = 'outside';
      geofence.onExit();
    }
  }
}

// Export a singleton instance
export const geofencingService = GeofencingService.getInstance();