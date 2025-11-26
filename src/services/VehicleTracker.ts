import { VehicleStatus, Location } from '../types';

/**
 * VehicleTracker manages the state of all tracked vehicles
 * Stores current zone, location, and last update time for each vehicle
 */
class VehicleTracker {
  private vehicles: Map<string, VehicleStatus> = new Map();

  /**
   * Update vehicle's current state
   */
  updateVehicle(vehicleId: string, zone: string | null, location: Location): void {
    this.vehicles.set(vehicleId, {
      vehicleId,
      currentZone: zone,
      lastUpdate: new Date(),
      location
    });
  }

  /**
   * Get complete status for a vehicle
   */
  getVehicleStatus(vehicleId: string): VehicleStatus | null {
    return this.vehicles.get(vehicleId) || null;
  }

  /**
   * Get just the current zone name for a vehicle
   */
  getCurrentZone(vehicleId: string): string | null {
    const vehicle = this.vehicles.get(vehicleId);
    return vehicle?.currentZone || null;
  }

  /**
   * Get all tracked vehicles
   */
  getAllVehicles(): VehicleStatus[] {
    return Array.from(this.vehicles.values());
  }

  /**
   * Check if vehicle exists in tracking system
   */
  hasVehicle(vehicleId: string): boolean {
    return this.vehicles.has(vehicleId);
  }

  /**
   * Remove vehicle from tracking (optional cleanup)
   */
  removeVehicle(vehicleId: string): boolean {
    return this.vehicles.delete(vehicleId);
  }

  /**
   * Get total number of tracked vehicles
   */
  getVehicleCount(): number {
    return this.vehicles.size;
  }
}

// Export singleton instance
export default new VehicleTracker();