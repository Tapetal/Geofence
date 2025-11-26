import { Zone } from '../types';

/**
 * Predefined zones in Abuja, Nigeria
 * Using circular geofences for simplicity
 * Coordinates are approximate center points of each area
 */
export const ZONES: Zone[] = [
  {
    id: 'wuse',
    name: 'Wuse',
    coordinates: { 
      latitude: 9.0765, 
      longitude: 7.4165 
    },
    radius: 2000 // 2km radius
  },
  {
    id: 'gwarimpa',
    name: 'Gwarimpa',
    coordinates: { 
      latitude: 9.1103, 
      longitude: 7.4041 
    },
    radius: 2500 // 2.5km radius
  },
  {
    id: 'apo',
    name: 'Apo',
    coordinates: { 
      latitude: 8.9806, 
      longitude: 7.4467 
    },
    radius: 2000 // 2km radius
  },
  {
    id: 'garki',
    name: 'Garki',
    coordinates: { 
      latitude: 9.0354, 
      longitude: 7.4906 
    },
    radius: 1800 // 1.8km radius
  }
];