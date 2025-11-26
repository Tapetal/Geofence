import { Router, Request, Response } from 'express';
import GeofenceService from '../services/GeofenceService';
import VehicleTracker from '../services/VehicleTracker';
import { LocationEvent } from '../types';

const router = Router();

/**
 * POST /location
 * Receive GPS location update from a vehicle
 * Body: { vehicleId, latitude, longitude }
 */
router.post('/location', (req: Request, res: Response) => {
  try {
    const { vehicleId, latitude, longitude }: LocationEvent = req.body;
    
    // Validation
    if (!vehicleId || latitude == null || longitude == null) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['vehicleId', 'latitude', 'longitude']
      });
    }
    
    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: 'Invalid latitude',
        message: 'Latitude must be between -90 and 90'
      });
    }
    
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid longitude',
        message: 'Longitude must be between -180 and 180'
      });
    }
    
    // Process location update
    const events = GeofenceService.processLocationUpdate({
      vehicleId,
      latitude,
      longitude,
      timestamp: new Date()
    });
    
    // Get updated vehicle status
    const status = VehicleTracker.getVehicleStatus(vehicleId);
    
    return res.status(200).json({
      message: 'Location updated successfully',
      vehicleId,
      currentZone: status?.currentZone || 'Outside all zones',
      events: events.length > 0 ? events : undefined,
      location: { latitude, longitude }
    });
    
  } catch (error) {
    console.error('Error processing location:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process location update'
    });
  }
});

/**
 * GET /vehicle/:vehicleId/status
 * Get current status of a specific vehicle
 */
router.get('/vehicle/:vehicleId/status', (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    
    if (!vehicleId) {
      return res.status(400).json({
        error: 'Vehicle ID is required'
      });
    }
    
    const status = VehicleTracker.getVehicleStatus(vehicleId);
    
    if (!status) {
      return res.status(404).json({
        error: 'Vehicle not found',
        message: `No tracking data found for vehicle ${vehicleId}`
      });
    }
    
    return res.status(200).json({
      vehicleId: status.vehicleId,
      currentZone: status.currentZone || 'Outside all zones',
      location: status.location,
      lastUpdate: status.lastUpdate
    });
    
  } catch (error) {
    console.error('Error getting vehicle status:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * GET /events
 * Get zone crossing events
 * Query params: vehicleId (optional), limit (optional)
 */
router.get('/events', (req: Request, res: Response) => {
  try {
    const { vehicleId, limit } = req.query;
    
    let events;
    
    if (vehicleId) {
      events = GeofenceService.getVehicleEvents(vehicleId as string);
    } else {
      events = GeofenceService.getAllEvents();
    }
    
    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit as string);
      if (!isNaN(limitNum) && limitNum > 0) {
        events = events.slice(-limitNum);
      }
    }
    
    return res.status(200).json({
      count: events.length,
      events
    });
    
  } catch (error) {
    console.error('Error getting events:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * GET /vehicles
 * Get all tracked vehicles and their current status
 */
router.get('/vehicles', (req: Request, res: Response) => {
  try {
    const vehicles = VehicleTracker.getAllVehicles();
    
    return res.status(200).json({
      count: vehicles.length,
      vehicles: vehicles.map(v => ({
        vehicleId: v.vehicleId,
        currentZone: v.currentZone || 'Outside all zones',
        location: v.location,
        lastUpdate: v.lastUpdate
      }))
    });
    
  } catch (error) {
    console.error('Error getting vehicles:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * GET /zones
 * Get all defined geofence zones
 */
router.get('/zones', (req: Request, res: Response) => {
  try {
    const zones = GeofenceService.getAllZones();
    
    return res.status(200).json({
      count: zones.length,
      zones
    });
    
  } catch (error) {
    console.error('Error getting zones:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * GET /stats
 * Get system statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = GeofenceService.getStats();
    const vehicleCount = VehicleTracker.getVehicleCount();
    
    return res.status(200).json({
      ...stats,
      activeVehicles: vehicleCount
    });
    
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

export default router;