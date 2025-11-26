import * as turf from '@turf/turf';
import { Location, Zone, ZoneEvent, LocationEvent } from '../types';
import { ZONES } from '../models/Zone';
import VehicleTracker from './VehicleTracker';

/**
 * GeofenceService handles all geofencing logic
 * - Point-in-zone detection
 * - Zone transition detection
 * - Event generation and storage
 */
class GeofenceService {
  private events: ZoneEvent[] = [];
  private readonly MAX_EVENTS = 1000; // Limit stored events to prevent memory issues

  /**
   * Check if a point is inside a circular zone using Turf.js
   * Uses the Haversine formula for accurate distance calculation
   */
  isPointInZone(location: Location, zone: Zone): boolean {
    const point = turf.point([location.longitude, location.latitude]);
    const center = turf.point([zone.coordinates.longitude, zone.coordinates.latitude]);
    const distance = turf.distance(point, center, { units: 'meters' });
    
    return distance <= zone.radius;
  }

  /**
   * Find which zone (if any) a location is currently in
   * Returns the first matching zone (vehicles can only be in one zone at a time)
   */
  findCurrentZone(location: Location): Zone | null {
    for (const zone of ZONES) {
      if (this.isPointInZone(location, zone)) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Process a location update and detect zone transitions
   * Returns array of events generated (enter/exit events)
   */
  processLocationUpdate(event: LocationEvent): ZoneEvent[] {
    const { vehicleId, latitude, longitude } = event;
    const location: Location = { latitude, longitude };
    
    // Get vehicle's previous zone
    const previousZone = VehicleTracker.getCurrentZone(vehicleId);
    
    // Find current zone based on new location
    const currentZoneObj = this.findCurrentZone(location);
    const currentZone = currentZoneObj?.name || null;
    
    // Update vehicle tracker with new position
    VehicleTracker.updateVehicle(vehicleId, currentZone, location);
    
    // Detect zone changes and generate events
    const generatedEvents: ZoneEvent[] = [];
    
    if (previousZone !== currentZone) {
      // Vehicle changed zones (or entered/exited zone coverage)
      
      if (previousZone) {
        // Vehicle exited previous zone
        const exitEvent: ZoneEvent = {
          vehicleId,
          zoneName: previousZone,
          eventType: 'EXIT',
          timestamp: new Date(),
          location
        };
        generatedEvents.push(exitEvent);
        this.addEvent(exitEvent);
        console.log(`🚗 Vehicle ${vehicleId} EXITED ${previousZone}`);
      }
      
      if (currentZone) {
        // Vehicle entered new zone
        const enterEvent: ZoneEvent = {
          vehicleId,
          zoneName: currentZone,
          eventType: 'ENTER',
          timestamp: new Date(),
          location
        };
        generatedEvents.push(enterEvent);
        this.addEvent(enterEvent);
        console.log(`🚗 Vehicle ${vehicleId} ENTERED ${currentZone}`);
      }
    }
    
    return generatedEvents;
  }

  /**
   * Add event to storage with size limit
   */
  private addEvent(event: ZoneEvent): void {
    this.events.push(event);
    
    // Prevent unbounded growth - keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift(); // Remove oldest event
    }
  }

  /**
   * Get all stored events
   */
  getAllEvents(): ZoneEvent[] {
    return [...this.events]; // Return copy to prevent external modification
  }

  /**
   * Get events for a specific vehicle
   */
  getVehicleEvents(vehicleId: string): ZoneEvent[] {
    return this.events.filter(e => e.vehicleId === vehicleId);
  }

  /**
   * Get recent events (last N events)
   */
  getRecentEvents(count: number = 10): ZoneEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Get events within a time range
   */
  getEventsByTimeRange(startTime: Date, endTime: Date): ZoneEvent[] {
    return this.events.filter(e => 
      e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Get all zones definition
   */
  getAllZones(): Zone[] {
    return ZONES;
  }

  /**
   * Clear all events (useful for testing or reset)
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Get event statistics
   */
  getStats() {
    return {
      totalEvents: this.events.length,
      enterEvents: this.events.filter(e => e.eventType === 'ENTER').length,
      exitEvents: this.events.filter(e => e.eventType === 'EXIT').length,
      uniqueVehicles: new Set(this.events.map(e => e.vehicleId)).size
    };
  }
}

// Export singleton instance
export default new GeofenceService();