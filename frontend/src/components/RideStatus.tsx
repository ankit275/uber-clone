import { useEffect, useState } from 'react';
import { Ride, RideStatus, Location } from '../types';
import MapView from './MapView';
import { websocketService } from '../services/websocketService';

interface RideStatusProps {
  ride: Ride;
  onCancel?: () => void;
}

const statusMessages: Record<RideStatus, string> = {
  [RideStatus.REQUESTED]: 'Finding a driver...',
  [RideStatus.ASSIGNED]: 'Driver assigned',
  [RideStatus.STARTED]: 'Ride in progress',
  [RideStatus.ENDED]: 'Ride completed',
  [RideStatus.CANCELLED]: 'Ride cancelled',
};

const statusColors: Record<RideStatus, string> = {
  [RideStatus.REQUESTED]: 'bg-yellow-100 text-yellow-800',
  [RideStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
  [RideStatus.STARTED]: 'bg-green-100 text-green-800',
  [RideStatus.ENDED]: 'bg-gray-100 text-gray-800',
  [RideStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export default function RideStatusComponent({ ride, onCancel }: RideStatusProps) {
  const [currentRide, setCurrentRide] = useState<Ride>(ride);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);

  useEffect(() => {
    const socket = websocketService.connect();

    // Listen for ride status updates
    websocketService.onRideStatusUpdate((updatedRide: Ride) => {
      if (updatedRide.id === ride.id) {
        setCurrentRide(updatedRide);
      }
    });

    // Listen for driver location updates
    websocketService.onDriverLocationUpdate((data) => {
      if (data.driverId === ride.driverId && data.location) {
        setDriverLocation(data.location);
      }
    });

    // If driver is assigned, get their location
    if (ride.driverId) {
      // In production, this would fetch driver location from API
      // For now, simulate with mock data
      const interval = setInterval(() => {
        // Mock driver movement - in production, this would come from WebSocket
        if (driverLocation) {
          setDriverLocation({
            ...driverLocation,
            latitude: driverLocation.latitude + (Math.random() - 0.5) * 0.001,
            longitude: driverLocation.longitude + (Math.random() - 0.5) * 0.001,
          });
        }
      }, 3000);

      return () => {
        clearInterval(interval);
        websocketService.disconnect();
      };
    }

    return () => {
      websocketService.disconnect();
    };
  }, [ride.id, ride.driverId, driverLocation]);

  const mapCenter: Location = driverLocation || ride.pickupLocation;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white shadow-md p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Ride Status</h2>
            <p className="text-sm text-gray-600">Ride ID: {currentRide.id.slice(-8)}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[currentRide.status]}`}
          >
            {statusMessages[currentRide.status]}
          </span>
        </div>

        {currentRide.driver && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{currentRide.driver.name}</p>
                <p className="text-sm text-gray-600">{currentRide.driver.vehicleNumber}</p>
                {currentRide.driver.rating && (
                  <p className="text-sm text-yellow-600">⭐ {currentRide.driver.rating}</p>
                )}
              </div>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Contact
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Pickup</p>
            <p className="font-medium">{ride.pickupLocation.address || 'Location'}</p>
          </div>
          <div>
            <p className="text-gray-600">Destination</p>
            <p className="font-medium">{ride.destinationLocation.address || 'Location'}</p>
          </div>
          {currentRide.estimatedFare && (
            <div>
              <p className="text-gray-600">Estimated Fare</p>
              <p className="font-medium">${currentRide.estimatedFare.toFixed(2)}</p>
            </div>
          )}
          {currentRide.fare && (
            <div>
              <p className="text-gray-600">Final Fare</p>
              <p className="font-medium text-green-600">${currentRide.fare.toFixed(2)}</p>
            </div>
          )}
        </div>

        {onCancel && currentRide.status === RideStatus.REQUESTED && (
          <button
            onClick={onCancel}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Cancel Ride
          </button>
        )}
      </div>

      <div className="flex-1 relative">
        <MapView
          center={mapCenter}
          pickupLocation={ride.pickupLocation}
          destinationLocation={ride.destinationLocation}
          driverLocation={driverLocation || undefined}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}