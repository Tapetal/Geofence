# Geofence Event Processing Service

A real-time location-based service that tracks vehicles as they move through geographic zones and detects zone boundary crossings using GPS coordinates.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Design Decisions](#design-decisions)
- [Future Improvements](#future-improvements)

## 🎯 Overview

This service processes GPS location events from vehicles in real-time and:
- Detects when vehicles enter or exit predefined geographic zones
- Tracks current zone status for each vehicle
- Provides historical event data for zone crossings
- Uses circular geofences for efficient point-in-zone detection

## ✨ Features

- **Real-time Location Processing**: Accept GPS coordinates via HTTP endpoint
- **Zone Detection**: Automatically detect when vehicles cross zone boundaries
- **Event Tracking**: Store and query entry/exit events
- **Vehicle Status**: Query current zone and location for any vehicle
- **Multiple Zones**: Support for multiple predefined zones (Wuse, Gwarimpa, Apo, Garki)
- **RESTful API**: Clean, well-documented REST endpoints
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive validation and error responses

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Geospatial**: Turf.js (point-in-zone calculations)
- **Storage**: In-memory (Map data structures)

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Extract the zip file and navigate to the project directory**
   ```bash
   cd Geofence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the service**

   **Development mode (with auto-reload):**
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm run build
   npm start
   ```

4. **Verify it's running**
   ```bash
   curl http://localhost:3000/health
   ```

   You should see:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-11-26T10:00:00.000Z",
     "uptime": 1.234
   }
   ```

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check
Check if the service is running.

**Request:**
```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2025-11-26T10:00:00.000Z",
  "uptime": 123.45
}
```

---

#### 2. Submit Location Update
Send GPS coordinates from a vehicle. The service will detect zone transitions and return any events generated.

**Request:**
```http
POST /api/location
Content-Type: application/json

{
  "vehicleId": "TX123",
  "latitude": 9.0765,
  "longitude": 7.4165
}
```

**Response - Vehicle Enters Zone (200 OK):**
```json
{
  "message": "Location updated successfully",
  "vehicleId": "TX123",
  "currentZone": "Wuse",
  "events": [
    {
      "vehicleId": "TX123",
      "zoneName": "Wuse",
      "eventType": "ENTER",
      "timestamp": "2025-11-26T10:30:00.000Z",
      "location": {
        "latitude": 9.0765,
        "longitude": 7.4165
      }
    }
  ],
  "location": {
    "latitude": 9.0765,
    "longitude": 7.4165
  }
}
```

**Response - No Zone Change (200 OK):**
```json
{
  "message": "Location updated successfully",
  "vehicleId": "TX123",
  "currentZone": "Outside all zones",
  "location": {
    "latitude": 9.0500,
    "longitude": 7.4000
  }
}
```

**Error Response - Invalid Coordinates (400 Bad Request):**
```json
{
  "error": "Invalid latitude",
  "message": "Latitude must be between -90 and 90"
}
```

**Error Response - Missing Fields (400 Bad Request):**
```json
{
  "error": "Missing required fields",
  "required": ["vehicleId", "latitude", "longitude"]
}
```

---

#### 3. Get Vehicle Status
Query the current zone and location of a specific vehicle.

**Request:**
```http
GET /api/vehicle/:vehicleId/status
```

**Example:**
```bash
curl http://localhost:3000/api/vehicle/TX123/status
```

**Response (200 OK):**
```json
{
  "vehicleId": "TX123",
  "currentZone": "Wuse",
  "location": {
    "latitude": 9.0765,
    "longitude": 7.4165
  },
  "lastUpdate": "2025-11-26T10:30:00.000Z"
}
```

**Response - Vehicle Not Found (404 Not Found):**
```json
{
  "error": "Vehicle not found",
  "message": "No tracking data found for vehicle TX999"
}
```

---

#### 4. Get Events
Retrieve zone crossing events with optional filtering.

**Request:**
```http
GET /api/events?vehicleId=TX123&limit=10
```

**Query Parameters:**
- `vehicleId` (optional): Filter events by specific vehicle
- `limit` (optional): Limit number of recent events returned

**Example - All Events:**
```bash
curl http://localhost:3000/api/events
```

**Example - Events for Specific Vehicle:**
```bash
curl http://localhost:3000/api/events?vehicleId=TX123
```

**Example - Last 5 Events:**
```bash
curl http://localhost:3000/api/events?limit=5
```

**Response (200 OK):**
```json
{
  "count": 4,
  "events": [
    {
      "vehicleId": "TX123",
      "zoneName": "Wuse",
      "eventType": "ENTER",
      "timestamp": "2025-11-26T10:30:00.000Z",
      "location": {
        "latitude": 9.0765,
        "longitude": 7.4165
      }
    },
    {
      "vehicleId": "TX123",
      "zoneName": "Wuse",
      "eventType": "EXIT",
      "timestamp": "2025-11-26T10:45:00.000Z",
      "location": {
        "latitude": 9.1103,
        "longitude": 7.4041
      }
    },
    {
      "vehicleId": "TX123",
      "zoneName": "Gwarimpa",
      "eventType": "ENTER",
      "timestamp": "2025-11-26T10:45:00.000Z",
      "location": {
        "latitude": 9.1103,
        "longitude": 7.4041
      }
    }
  ]
}
```

---

#### 5. Get All Vehicles
List all currently tracked vehicles and their status.

**Request:**
```http
GET /api/vehicles
```

**Example:**
```bash
curl http://localhost:3000/api/vehicles
```

**Response (200 OK):**
```json
{
  "count": 3,
  "vehicles": [
    {
      "vehicleId": "TX123",
      "currentZone": "Wuse",
      "location": {
        "latitude": 9.0765,
        "longitude": 7.4165
      },
      "lastUpdate": "2025-11-26T10:30:00.000Z"
    },
    {
      "vehicleId": "TX456",
      "currentZone": "Gwarimpa",
      "location": {
        "latitude": 9.1103,
        "longitude": 7.4041
      },
      "lastUpdate": "2025-11-26T10:35:00.000Z"
    },
    {
      "vehicleId": "TX789",
      "currentZone": "Outside all zones",
      "location": {
        "latitude": 9.2000,
        "longitude": 7.3000
      },
      "lastUpdate": "2025-11-26T10:40:00.000Z"
    }
  ]
}
```

---

#### 6. Get Zones
List all defined geofence zones.

**Request:**
```http
GET /api/zones
```

**Example:**
```bash
curl http://localhost:3000/api/zones
```

**Response (200 OK):**
```json
{
  "count": 4,
  "zones": [
    {
      "id": "wuse",
      "name": "Wuse",
      "coordinates": {
        "latitude": 9.0765,
        "longitude": 7.4165
      },
      "radius": 2000
    },
    {
      "id": "gwarimpa",
      "name": "Gwarimpa",
      "coordinates": {
        "latitude": 9.1103,
        "longitude": 7.4041
      },
      "radius": 2500
    },
    {
      "id": "apo",
      "name": "Apo",
      "coordinates": {
        "latitude": 8.9806,
        "longitude": 7.4467
      },
      "radius": 2000
    },
    {
      "id": "garki",
      "name": "Garki",
      "coordinates": {
        "latitude": 9.0354,
        "longitude": 7.4906
      },
      "radius": 1800
    }
  ]
}
```

---

#### 7. Get Statistics
Get system-wide statistics about events and vehicles.

**Request:**
```http
GET /api/stats
```

**Example:**
```bash
curl http://localhost:3000/api/stats
```

**Response (200 OK):**
```json
{
  "totalEvents": 45,
  "enterEvents": 23,
  "exitEvents": 22,
  "uniqueVehicles": 8,
  "activeVehicles": 5
}
```

## 🧪 Testing

### Complete Test Flow

Follow this sequence to test the complete geofencing functionality:

```bash
# 1. Check service health
curl http://localhost:3000/health

# 2. View available zones
curl http://localhost:3000/api/zones

# 3. Send location OUTSIDE all zones
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.0500,"longitude":7.4000}'

# Expected: No events, vehicle outside all zones

# 4. Send location INSIDE Wuse zone (ENTER event)
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.0765,"longitude":7.4165}'

# Expected: ENTER event for Wuse zone

# 5. Check vehicle status
curl http://localhost:3000/api/vehicle/TX123/status

# Expected: currentZone = "Wuse"

# 6. Move to Gwarimpa zone (EXIT Wuse + ENTER Gwarimpa)
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.1103,"longitude":7.4041}'

# Expected: EXIT event for Wuse, ENTER event for Gwarimpa

# 7. Add another vehicle in Apo zone
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX456","latitude":8.9806,"longitude":7.4467}'

# Expected: ENTER event for Apo zone

# 8. View all events
curl http://localhost:3000/api/events

# Expected: All zone crossing events

# 9. View events for TX123 only
curl http://localhost:3000/api/events?vehicleId=TX123

# Expected: Only TX123's events

# 10. View all tracked vehicles
curl http://localhost:3000/api/vehicles

# Expected: TX123 (in Gwarimpa), TX456 (in Apo)

# 11. Get system statistics
curl http://localhost:3000/api/stats

# Expected: Event counts and vehicle counts

# 12. Move TX123 outside all zones (EXIT event)
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.2000,"longitude":7.3000}'

# Expected: EXIT event for Gwarimpa

# 13. Test invalid coordinates (validation error)
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX999","latitude":999,"longitude":7.4000}'

# Expected: 400 error - Invalid latitude

# 14. Test missing fields (validation error)
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX999"}'

# Expected: 400 error - Missing required fields
```

### Using the Test Script

A bash script (`test-api.sh`) is included that runs all the above tests automatically:

```bash
# Make it executable
chmod +x test-api.sh

# Run all tests
./test-api.sh
```

### Testing with Postman

1. Open Postman and create a new collection called "Geofence API"
2. Set the base URL variable: `http://localhost:3000`
3. Add requests for each endpoint listed above
4. Run the requests in the order shown in the test flow
5. Use the Collection Runner to automate testing

**Postman Collection Structure:**
```
Geofence API/
├── Health Check (GET)
├── Get All Zones (GET)
├── Location - Outside Zones (POST)
├── Location - Enter Wuse (POST)
├── Get Vehicle Status (GET)
├── Location - Move to Gwarimpa (POST)
├── Get All Events (GET)
├── Get Events - TX123 Only (GET)
├── Get All Vehicles (GET)
└── Get Stats (GET)
```

## 🏗 Design Decisions

### 1. **Circular Geofences**
- **Choice**: Used circular zones with center point + radius
- **Rationale**: Simpler to implement and faster to compute than polygons
- **Trade-off**: Less precise for irregular shapes, but adequate for city districts
- **Algorithm**: Haversine distance formula via Turf.js

### 2. **In-Memory Storage**
- **Choice**: Map data structures for vehicles and arrays for events
- **Rationale**: Fast access, simple implementation, sufficient for prototype
- **Trade-off**: Data lost on restart, not scalable to millions of vehicles
- **Mitigation**: Event limit (1000 max) to prevent memory overflow

### 3. **Singleton Services**
- **Choice**: Single instances of VehicleTracker and GeofenceService
- **Rationale**: Shared state across all requests, simpler state management
- **Trade-off**: Not suitable for horizontal scaling without external state store

### 4. **One Zone Per Vehicle**
- **Choice**: Vehicles can only be in one zone at a time
- **Rationale**: Simplifies logic, matches real-world taxi service requirements
- **Trade-off**: Overlapping zones not supported

### 5. **Event-Driven Detection**
- **Choice**: Detect zone changes on location updates (pull model)
- **Rationale**: Simple, reliable, matches requirements
- **Alternative**: Could use push model with background zone monitoring

### 6. **TypeScript**
- **Choice**: Full TypeScript implementation
- **Rationale**: Type safety, better IDE support, clearer contracts
- **Trade-off**: Slightly more setup, but worth it for maintainability

## 🔮 Future Improvements

### Short-term (if more time was available)

1. **Database Integration**
   - Add PostgreSQL with PostGIS extension for persistent storage
   - Spatial indexes for faster zone queries
   - Store events permanently for analytics

2. **Polygon Zones**
   - Support complex polygon shapes for accurate zone boundaries
   - Load zones from GeoJSON files
   - Zone management API (CRUD operations)

3. **Testing**
   - Unit tests for geofence logic
   - Integration tests for API endpoints
   - Mock location data generator

4. **WebSocket Support**
   - Real-time event streaming to clients
   - Live vehicle tracking dashboard

5. **Authentication & Authorization**
   - API key authentication
   - Vehicle-specific access control
   - Rate limiting per client

### Long-term (production readiness)

6. **Scalability**
   - Redis for distributed state management
   - Message queue (RabbitMQ/Kafka) for event processing
   - Horizontal scaling with load balancer

7. **Monitoring & Observability**
   - Prometheus metrics (request rates, latency, zone crossings)
   - Structured logging (Winston/Pino)
   - Distributed tracing (Jaeger)
   - Alerting for anomalies

8. **Advanced Features**
   - Dwell time tracking (time spent in zones)
   - Speed calculation between updates
   - Route prediction
   - Geofence analytics (hotspot detection)

9. **Performance Optimization**
   - Spatial indexing (R-tree) for zone lookups
   - Batch processing for high-frequency updates
   - Caching layer for frequently accessed data

10. **Operational Excellence**
    - Docker containerization
    - Kubernetes deployment
    - CI/CD pipeline
    - Automated backups
    - Disaster recovery plan

11. **Edge Cases**
    - Handle GPS inaccuracy/jitter
    - Deal with stale location data
    - Manage vehicles that go offline
    - Handle rapid zone transitions

## 📝 Assumptions

1. **Zone Coverage**: Zones don't overlap (one vehicle, one zone)
2. **GPS Accuracy**: GPS coordinates are reasonably accurate (±10-50 meters)
3. **Update Frequency**: Vehicles send updates every 10-60 seconds
4. **Scale**: Designed for hundreds of vehicles (not millions)
5. **Data Retention**: Events kept in memory (no long-term historical analysis)
6. **Network**: Reliable network connectivity between vehicles and service
7. **Time**: Server time used for all timestamps (no timezone handling)

## 🤝 Contributing

This is a challenge submission, but feedback is welcome!

---

**Built for a location-based taxi service in Abuja, Nigeria**
