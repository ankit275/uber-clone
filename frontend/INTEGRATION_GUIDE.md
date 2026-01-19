# Quick Start Guide - Frontend Backend Integration

## Setup

### 1. Environment Variables
Create or update these files in the `frontend/` directory:

**Development (.env.development):**
```
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

**Production (.env.production):**
```
VITE_API_URL=https://your-backend-url.com
VITE_WS_URL=wss://your-backend-url.com
```

### 2. Start Services
```bash
# Terminal 1: Backend (Spring Boot)
cd /path/to/project
mvn spring-boot:run

# Terminal 2: Frontend (React/Vite)
cd frontend
npm install
npm run dev
```

## Key Service Methods

### Ride Service
```typescript
import { rideService } from './services/rideService';

// Create a ride
const ride = await rideService.createRide(
  { latitude: 37.7749, longitude: -122.4194 }, // pickup
  { latitude: 37.8044, longitude: -122.2712 }, // destination
  'BASIC' // tier
);

// Get ride details
const rideDetails = await rideService.getRide(rideId);

// End a ride
await rideService.endRide(rideId);
```

### Driver Service
```typescript
import { driverService } from './services/driverService';

// Register driver
const driver = await driverService.registerDriver({
  phoneNumber: '+1234567890',
  licenseNumber: 'DL123',
  vehicleModel: 'Toyota Prius',
  vehiclePlateNumber: 'ABC123',
  tenantId: 1
});

// Update driver status
await driverService.updateStatus(driverId, 'ONLINE');

// Update location
await driverService.updateLocation(driverId, {
  latitude: 37.7749,
  longitude: -122.4194
});

// Accept a ride
await driverService.acceptRide(driverId, rideId);
```

### Trip Service
```typescript
import { tripService } from './services/tripService';

// Start a trip
const trip = await tripService.startTrip(rideId);

// End a trip
await tripService.endTrip(tripId);
```

### Payment Service
```typescript
import { paymentService } from './services/paymentService';

// Create payment
const payment = await paymentService.createPayment({
  rideId: rideId,
  paymentMethod: 'CREDIT_CARD'
});
```

### Tenant Service
```typescript
import { tenantService } from './services/tenantService';

// Register tenant
const tenant = await tenantService.registerTenant({
  name: 'My Uber Clone',
  contactEmail: 'admin@example.com'
});
```

## Common Issues & Solutions

### Issue: 404 Not Found on API calls
**Solution:** 
- Verify backend is running on port 8080
- Check `VITE_API_URL` in `.env.development`
- Ensure backend routes match service methods

### Issue: CORS errors
**Solution:**
- Add CORS configuration in Spring Boot backend
- Or use the dev server proxy (already configured in vite.config.ts)

### Issue: WebSocket connection fails
**Solution:**
- Check `VITE_WS_URL` environment variable
- Verify WebSocket server is running on backend
- Check browser console for connection errors

### Issue: Types don't match backend response
**Solution:**
- Update TypeScript interfaces in `src/types/index.ts`
- Ensure ID types match (string vs number)
- Add optional fields for nullable backend properties

## Debugging Tips

1. **Network Requests**: Open DevTools → Network tab to inspect API requests
2. **Console Errors**: Check browser console for JavaScript errors
3. **Backend Logs**: Watch Spring Boot console for request/response logs
4. **Types**: Use TypeScript strict mode to catch type mismatches early

## Project Structure Reference

```
frontend/
├── src/
│   ├── components/          # React components
│   ├── screens/             # Page components
│   ├── services/            # API service layer
│   │   ├── rideService.ts
│   │   ├── driverService.ts
│   │   ├── tripService.ts
│   │   ├── paymentService.ts
│   │   └── tenantService.ts
│   ├── types/               # TypeScript types
│   └── utils/
│       └── api.ts           # Axios configuration
├── .env.development         # Dev environment vars
└── .env.production          # Prod environment vars
```

## API Response Types

All API responses are JSON and typed as:

```typescript
// Successful response (200-299)
{
  data: { /* response object */ }
}

// Error response (4xx, 5xx)
{
  error: {
    message: string,
    status: number
  }
}
```

## Testing Endpoints

Use these curl commands to test backend endpoints:

```bash
# Create ride
curl -X POST http://localhost:8080/rides \
  -H "Content-Type: application/json" \
  -d '{
    "passengerId": 1,
    "pickupLatitude": 37.7749,
    "pickupLongitude": -122.4194,
    "dropoffLatitude": 37.8044,
    "dropoffLongitude": -122.2712,
    "city": "San Francisco"
  }'

# Get ride
curl http://localhost:8080/rides/1

# Register driver
curl -X POST http://localhost:8080/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "licenseNumber": "DL123",
    "vehicleModel": "Toyota Prius",
    "vehiclePlateNumber": "ABC123",
    "tenantId": 1
  }'

# Update driver status
curl -X POST "http://localhost:8080/drivers/1/setStatus?status=ONLINE"

# Start trip
curl -X POST http://localhost:8080/trips/1/start
```

## Next Steps

1. ✅ Frontend API integration complete
2. ⭕ Implement geocoding for address-to-coordinates conversion
3. ⭕ Add authentication/authorization
4. ⭕ Implement real-time WebSocket updates
5. ⭕ Add comprehensive error handling
6. ⭕ Write integration tests
7. ⭕ Set up CI/CD pipeline
8. ⭕ Deploy to production
