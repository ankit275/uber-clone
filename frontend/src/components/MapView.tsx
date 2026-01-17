import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../types';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  center: Location;
  zoom?: number;
  pickupLocation?: Location;
  destinationLocation?: Location;
  driverLocation?: Location;
  showRoute?: boolean;
  className?: string;
}

function MapUpdater({ center }: { center: Location }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.latitude, center.longitude], map.getZoom());
  }, [center, map]);

  return null;
}

export default function MapView({
  center,
  zoom = 13,
  pickupLocation,
  destinationLocation,
  driverLocation,
  showRoute = false,
  className = '',
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Create custom icons
  const pickupIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="10" fill="#22c55e" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const destinationIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const driverIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="12" fill="#3b82f6" stroke="white" stroke-width="2"/>
        <path d="M20 10 L25 20 L20 18 L15 20 Z" fill="white"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <div className={`w-full h-full ${className}`}>
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {pickupLocation && (
          <Marker
            position={[pickupLocation.latitude, pickupLocation.longitude]}
            icon={pickupIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-green-600">Pickup</p>
                {pickupLocation.address && <p className="text-sm">{pickupLocation.address}</p>}
              </div>
            </Popup>
          </Marker>
        )}

        {destinationLocation && (
          <Marker
            position={[destinationLocation.latitude, destinationLocation.longitude]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-red-600">Destination</p>
                {destinationLocation.address && (
                  <p className="text-sm">{destinationLocation.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {driverLocation && (
          <Marker
            position={[driverLocation.latitude, driverLocation.longitude]}
            icon={driverIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-blue-600">Driver</p>
                <p className="text-sm">Live location</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}