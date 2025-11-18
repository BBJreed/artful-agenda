import { useState, useEffect, useCallback, useRef } from 'react';

interface Geofence {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  name?: string;
  onEnter?: () => void;
  onExit?: () => void;
  onProximity?: (distance: number) => void; // Triggered when approaching the geofence
  proximityThreshold?: number; // Distance in meters to trigger proximity alert
  isActive: boolean;
}

interface GeolocationState {
  coordinates: {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number | null;
  error: string | null;
  isLoading: boolean;
  geofences: Geofence[];
  activeGeofences: string[]; // IDs of geofences user is currently inside
  proximityAlerts: string[]; // IDs of geofences user is near
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
  enableGeofencing?: boolean;
  geofenceCheckInterval?: number; // in milliseconds
  proximityCheckInterval?: number; // in milliseconds
}

const defaultState: GeolocationState = {
  coordinates: {
    latitude: null,
    longitude: null,
    altitude: null,
    accuracy: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null
  },
  timestamp: null,
  error: null,
  isLoading: false,
  geofences: [],
  activeGeofences: [],
  proximityAlerts: []
};

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 60000,
    watch = false,
    enableGeofencing = false,
    geofenceCheckInterval = 5000, // 5 seconds
    proximityCheckInterval = 2000 // 2 seconds
  } = options;
  
  const [state, setState] = useState<GeolocationState>(defaultState);
  const previousActiveGeofences = useRef<string[]>([]);
  const previousProximityAlerts = useRef<string[]>([]);
  
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        isLoading: false
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const success = (position: GeolocationPosition) => {
      const { latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed } = position.coords;
      
      setState(prev => ({
        coordinates: {
          latitude,
          longitude,
          altitude,
          accuracy,
          altitudeAccuracy,
          heading,
          speed
        },
        timestamp: position.timestamp,
        error: null,
        isLoading: false,
        geofences: prev.geofences,
        activeGeofences: prev.activeGeofences,
        proximityAlerts: prev.proximityAlerts
      }));
    };
    
    const error = (error: GeolocationPositionError) => {
      let errorMessage = '';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'User denied the request for Geolocation';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'The request to get user location timed out';
          break;
        default:
          errorMessage = 'An unknown error occurred';
          break;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    };
    
    const geolocationOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };
    
    if (watch) {
      const watchId = navigator.geolocation.watchPosition(success, error, geolocationOptions);
      
      // Return cleanup function
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      navigator.geolocation.getCurrentPosition(success, error, geolocationOptions);
    }
  }, [enableHighAccuracy, timeout, maximumAge, watch]);
  
  // Get location on mount if not watching
  useEffect(() => {
    if (!watch) {
      getLocation();
    }
  }, [getLocation, watch]);
  
  // Set up watching if enabled
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (watch) {
      cleanup = getLocation();
    }
    
    // Cleanup function for watch
    return () => {
      if (cleanup) cleanup();
    };
  }, [getLocation, watch]);
  
  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }, []);
  
  // Check if user is within a certain radius of a point
  const isWithinRadius = useCallback((
    targetLat: number,
    targetLon: number,
    radiusMeters: number
  ): boolean => {
    if (state.coordinates.latitude === null || state.coordinates.longitude === null) {
      return false;
    }
    
    const distance = calculateDistance(
      state.coordinates.latitude,
      state.coordinates.longitude,
      targetLat,
      targetLon
    );
    
    return distance <= radiusMeters;
  }, [state.coordinates.latitude, state.coordinates.longitude, calculateDistance]);
  
  // Add a new geofence
  const addGeofence = useCallback((geofence: Omit<Geofence, 'isActive'>) => {
    setState(prev => ({
      ...prev,
      geofences: [...prev.geofences, { ...geofence, isActive: true }]
    }));
  }, []);
  
  // Remove a geofence by ID
  const removeGeofence = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      geofences: prev.geofences.filter(g => g.id !== id),
      activeGeofences: prev.activeGeofences.filter(activeId => activeId !== id),
      proximityAlerts: prev.proximityAlerts.filter(alertId => alertId !== id)
    }));
  }, []);
  
  // Update a geofence
  const updateGeofence = useCallback((id: string, updates: Partial<Geofence>) => {
    setState(prev => ({
      ...prev,
      geofences: prev.geofences.map(g => 
        g.id === id ? { ...g, ...updates } : g
      )
    }));
  }, []);
  
  // Toggle geofence active state
  const toggleGeofence = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      geofences: prev.geofences.map(g => 
        g.id === id ? { ...g, isActive: !g.isActive } : g
      )
    }));
  }, []);
  
  // Check geofences for entry/exit events
  const checkGeofences = useCallback(() => {
    if (!enableGeofencing || 
        state.coordinates.latitude === null || 
        state.coordinates.longitude === null) {
      return;
    }
    
    const newActiveGeofences: string[] = [];
    const newProximityAlerts: string[] = [];
    
    state.geofences.forEach(geofence => {
      if (!geofence.isActive) return;
      
      const distance = calculateDistance(
        state.coordinates.latitude!,
        state.coordinates.longitude!,
        geofence.latitude,
        geofence.longitude
      );
      
      // Check if user is inside the geofence
      if (distance <= geofence.radius) {
        newActiveGeofences.push(geofence.id);
        
        // Trigger enter event if this is a new entry
        if (!previousActiveGeofences.current.includes(geofence.id) && geofence.onEnter) {
          geofence.onEnter();
        }
      }
      
      // Check for proximity alerts
      const threshold = geofence.proximityThreshold || geofence.radius * 2;
      if (distance <= threshold) {
        newProximityAlerts.push(geofence.id);
        
        // Trigger proximity event
        if (geofence.onProximity) {
          geofence.onProximity(distance);
        }
      }
    });
    
    // Trigger exit events for geofences user has left
    previousActiveGeofences.current.forEach(id => {
      if (!newActiveGeofences.includes(id)) {
        const geofence = state.geofences.find(g => g.id === id);
        if (geofence && geofence.onExit) {
          geofence.onExit();
        }
      }
    });
    
    // Update state with new active geofences
    setState(prev => ({
      ...prev,
      activeGeofences: newActiveGeofences,
      proximityAlerts: newProximityAlerts
    }));
    
    // Update refs for next comparison
    previousActiveGeofences.current = newActiveGeofences;
    previousProximityAlerts.current = newProximityAlerts;
  }, [enableGeofencing, state.coordinates, state.geofences, calculateDistance]);
  
  // Periodically check geofences
  useEffect(() => {
    if (!enableGeofencing) return;
    
    const interval = setInterval(checkGeofences, geofenceCheckInterval);
    return () => clearInterval(interval);
  }, [enableGeofencing, checkGeofences, geofenceCheckInterval]);
  
  // Periodically check for proximity alerts
  useEffect(() => {
    if (!enableGeofencing) return;
    
    const interval = setInterval(() => {
      // Proximity checks happen within checkGeofences
      checkGeofences();
    }, proximityCheckInterval);
    
    return () => clearInterval(interval);
  }, [enableGeofencing, checkGeofences, proximityCheckInterval]);
  
  // Get formatted address (reverse geocoding would require an API)
  const getFormattedAddress = useCallback(async (): Promise<string> => {
    if (state.coordinates.latitude === null || state.coordinates.longitude === null) {
      return 'Location not available';
    }
    
    // In a real application, this would call a reverse geocoding API
    // For demo purposes, we'll return a basic formatted string
    return `${state.coordinates.latitude.toFixed(6)}, ${state.coordinates.longitude.toFixed(6)}`;
  }, [state.coordinates.latitude, state.coordinates.longitude]);
  
  // Get all active geofences
  const getActiveGeofences = useCallback(() => {
    return state.geofences.filter(g => 
      state.activeGeofences.includes(g.id) && g.isActive
    );
  }, [state.geofences, state.activeGeofences]);
  
  // Get all proximity alerts
  const getProximityAlerts = useCallback(() => {
    return state.geofences.filter(g => 
      state.proximityAlerts.includes(g.id) && g.isActive
    );
  }, [state.geofences, state.proximityAlerts]);
  
  return {
    ...state,
    getLocation,
    calculateDistance,
    isWithinRadius,
    getFormattedAddress,
    addGeofence,
    removeGeofence,
    updateGeofence,
    toggleGeofence,
    getActiveGeofences,
    getProximityAlerts
  };
};