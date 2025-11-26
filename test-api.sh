#!/bin/bash

# Geofence Service API Test Script
# Make this file executable: chmod +x test-api.sh

BASE_URL="http://localhost:3000"
API_URL="${BASE_URL}/api"

echo "=================================="
echo "Geofence Service API Tests"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
curl -s "${BASE_URL}/health" | json_pp
echo -e "\n"

# Test 2: Get all zones
echo "2. Getting all zones..."
curl -s "${API_URL}/zones" | json_pp
echo -e "\n"

# Test 3: Send location outside all zones
echo "3. Sending location OUTSIDE all zones (TX123)..."
curl -s -X POST "${API_URL}/location" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.0500,"longitude":7.4000}' | json_pp
echo -e "\n"

# Test 4: Send location inside Wuse zone
echo "4. Sending location INSIDE Wuse zone (TX123) - Should ENTER..."
curl -s -X POST "${API_URL}/location" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.0765,"longitude":7.4165}' | json_pp
echo -e "\n"

# Test 5: Check vehicle status
echo "5. Checking vehicle TX123 status..."
curl -s "${API_URL}/vehicle/TX123/status" | json_pp
echo -e "\n"

# Test 6: Move to Gwarimpa zone
echo "6. Moving to Gwarimpa zone (TX123) - Should EXIT Wuse and ENTER Gwarimpa..."
curl -s -X POST "${API_URL}/location" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.1103,"longitude":7.4041}' | json_pp
echo -e "\n"

# Test 7: Add another vehicle in Apo
echo "7. Adding vehicle TX456 in Apo zone..."
curl -s -X POST "${API_URL}/location" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX456","latitude":8.9806,"longitude":7.4467}' | json_pp
echo -e "\n"

# Test 8: Get all events
echo "8. Getting all events..."
curl -s "${API_URL}/events" | json_pp
echo -e "\n"

# Test 9: Get events for TX123 only
echo "9. Getting events for TX123 only..."
curl -s "${API_URL}/events?vehicleId=TX123" | json_pp
echo -e "\n"

# Test 10: Get all tracked vehicles
echo "10. Getting all tracked vehicles..."
curl -s "${API_URL}/vehicles" | json_pp
echo -e "\n"

# Test 11: Get system statistics
echo "11. Getting system statistics..."
curl -s "${API_URL}/stats" | json_pp
echo -e "\n"

# Test 12: Move TX123 outside all zones
echo "12. Moving TX123 outside all zones - Should EXIT Gwarimpa..."
curl -s -X POST "${API_URL}/location" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX123","latitude":9.2000,"longitude":7.3000}' | json_pp
echo -e "\n"

# Test 13: Invalid coordinates test
echo "13. Testing invalid coordinates (should fail)..."
curl -s -X POST "${API_URL}/location" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX999","latitude":999,"longitude":7.4000}' | json_pp
echo -e "\n"

# Test 14: Missing fields test
echo "14. Testing missing fields (should fail)..."
curl -s -X POST "${API_URL}/location" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"TX999"}' | json_pp
echo -e "\n"

echo "=================================="
echo "All tests completed!"
echo "=================================="