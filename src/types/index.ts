export interface Location {
  latitude: number;
  longitude: number;
}

export interface LocationEvent {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp?: Date;
}

export interface Zone {
  id: string;
  name: string;
  coordinates: Location;
  radius: number; // in meters
}

export interface ZoneEvent {
  vehicleId: string;
  zoneName: string;
  eventType: 'ENTER' | 'EXIT';
  timestamp: Date;
  location: Location;
}

export interface VehicleStatus {
  vehicleId: string;
  currentZone: string | null;
  lastUpdate: Date;
  location: Location;
}