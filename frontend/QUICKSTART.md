# Quick Start Guide

Get the Uber Frontend app running in minutes!

## Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm

## Installation Steps

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Create `.env.development` in the frontend directory:
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

### 4. Start development server
```bash
npm run dev
```

The app will start at `http://localhost:3000`

## Access the App

Once running, you can access:

- **Rider App**: http://localhost:3000/rider
- **Driver App**: http://localhost:3000/driver
- **Admin Dashboard**: http://localhost:3000/admin

## Features to Try

### Rider App
1. Enter pickup and destination addresses
2. Select a ride tier (Basic, Premium, Luxury)
3. Request a ride
4. View real-time ride status and driver tracking

### Driver App
1. Click "Go Online" to start accepting rides
2. Accept or reject incoming ride requests
3. Start and end trips
4. View your location on the map

### Admin Dashboard
1. View system statistics
2. Monitor active rides
3. See all active drivers

## Troubleshooting

### Port 3000 already in use
Change the port in `vite.config.ts`:
```typescript
server: {
  port: 3001, // or any available port
}
```

### API connection errors
- Ensure backend is running on port 8080
- Check `.env.development` has correct API URL
- Verify CORS is configured on backend

### Map not loading
- Check browser console for Leaflet errors
- Verify internet connection (maps load from OpenStreetMap)

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Customize the app to match your backend API endpoints