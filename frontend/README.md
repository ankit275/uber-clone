# Uber Frontend - Ride Hailing App

A production-ready React web application for a ride-hailing system (Uber/Ola-like) built with React 18, Vite, Tailwind CSS, React Router, Axios, and Socket.io.

## Features

### Rider App (`/rider`)
- Request ride form with pickup, destination, and tier selection
- Real-time ride status tracking (requested, assigned, started, ended)
- Live driver tracking on map
- Fare and receipt screen after ride completion

### Driver App (`/driver`)
- Go online/offline status toggle
- Accept/reject ride requests
- Real-time location updates
- Trip control (start, end) with location tracking

### Admin Dashboard (`/admin`)
- View active rides with detailed information
- Monitor active drivers
- System statistics (active rides, drivers, revenue, etc.)
- Real-time updates via WebSocket

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.io Client** - WebSocket for real-time updates
- **Leaflet** - Interactive maps
- **React Leaflet** - React components for Leaflet

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── AdminDashboard.tsx
│   │   ├── DriverPanel.tsx
│   │   ├── MapView.tsx
│   │   ├── RideForm.tsx
│   │   ├── RideStatus.tsx
│   │   └── TripControls.tsx
│   ├── screens/             # Main application screens
│   │   ├── RiderApp.tsx
│   │   ├── DriverApp.tsx
│   │   └── AdminDashboard.tsx
│   ├── services/            # API and business logic services
│   │   ├── driverService.ts
│   │   ├── mockService.ts
│   │   ├── rideService.ts
│   │   ├── tripService.ts
│   │   └── websocketService.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── api.ts
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (default: http://localhost:8080)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment file (`.env.development`):
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## Environment Variables

Create `.env.development` for local development and `.env.production` for production:

```env
VITE_API_URL=http://localhost:8080        # Backend API URL
VITE_WS_URL=ws://localhost:8080           # WebSocket URL
```

For production:
```env
VITE_API_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com
```

## API Integration

The app integrates with the backend API at `/api` endpoints:

- **Rides**: `/api/rides`
- **Drivers**: `/api/drivers`
- **Trips**: `/api/trips`

WebSocket connection is established automatically for real-time updates.

## Mock Data

For development and testing without a backend, the app includes a `mockService` that provides mock data and simulated behavior. In production, replace mock service calls with actual API calls.

## Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the frontend directory
3. Set environment variables in Vercel dashboard

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Docker

A Dockerfile can be created for containerized deployment. Use a simple nginx server to serve the static files from the `dist` directory.

## Features in Detail

### Map Integration
- Interactive maps using Leaflet/OpenStreetMap
- Custom markers for pickup, destination, and driver locations
- Real-time location updates

### WebSocket Integration
- Real-time ride status updates
- Live driver location tracking
- System statistics updates for admin
- Automatic reconnection on disconnect

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface

## Development Notes

- The app uses mock data by default for development
- Replace `mockService` calls with actual API calls in production
- WebSocket events need to be configured on the backend
- Map markers use SVG icons for better performance

## License

MIT