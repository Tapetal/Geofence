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
- [Assumptions](#assumptions)
- [Contributing](#contributing)
- [License](#license)


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

1. **Create project directory and navigate to it**
   ```bash
   mkdir geofence-service
   cd geofence-service
   ```

2. **Initialize project and install dependencies**
   ```bash
   npm init -y
   npm install express @turf/turf cors
   npm install -D typescript @types/node @types/express @types/cors @types/geojson ts-node nodemon
   ```

3. **Copy all the files from the artifacts** into their respective locations:
   - `package.json` (root)
   - `tsconfig.json` (root)
   - `.gitignore` (root)
   - `nodemon.json` (root)
   - Create `src/` folder and add all TypeScript files

4. **Run the service**

   **Development mode (with auto-reload):**
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm run build
   npm start
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:3000/health
   ```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Submit Location Update
```http
POST /api/location
Content-Type: application/json

{
  "vehicleId": "TX123",
  "latitude": 9.0765,
  "longitude": 7.4165
}
```

**Response (200 OK):**
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

#### 2. Get Vehicle Status
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

#### 3. Get Events
```http
GET /api/events?vehicleId=TX123&limit=10
```

**Query Parameters:**
- `vehicleId` (optional): Filter events by vehicle
- `limit` (optional): Limit number of recent events

**Response (200 OK):**
```json
{
  "count": 2,
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
  ]
}
```

#### 4. Get All Vehicles
```http
GET /api/vehicles
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
    }
  ]
}
```

#### 5. Get Zones
```http
GET /api/zones
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
    }
  ]
}
```

#### 6. Get Statistics
```http
GET /api/stats
```

**Response (200 OK):**
```json
{
  "totalEvents": 45,
  "enterEvents": 23,
  "exitEvents": 22,
  "uniqueVehicles": 5,
  "activeVehicles": 5
}
```

## 🧪 Testing

### Manual Testing with curl

**Test Scenario: Vehicle entering Wuse zone**

```bash
# 1. Check health
curl http://localhost:3000/health

# 2. Send location outside all zones
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.0500,"longitude":7.4000}'

# 3. Send location inside Wuse zone (should generate ENTER event)
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.0765,"longitude":7.4165}'

# 4. Check vehicle status
curl http://localhost:3000/api/vehicle/TX123/status

# 5. Move to Gwarimpa (should generate EXIT and ENTER events)
curl -X POST http://localhost:3000/api/location \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.1103,"longitude":7.4041}'

# 6. View all events
curl http://localhost:3000/api/events

# 7. View events for specific vehicle
curl http://localhost:3000/api/events?vehicleId=TX123

# 8. View all tracked vehicles
curl http://localhost:3000/api/vehicles

# 9. View system stats
curl http://localhost:3000/api/stats
```

### Testing with Postman

1. Import the following as a collection or test individually
2. Use `http://localhost:3000` as base URL
3. Test the complete flow from location updates to event retrieval

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

## 📄 License

MIT

---

**Built for a location-based taxi service in Abuja, Nigeria**
