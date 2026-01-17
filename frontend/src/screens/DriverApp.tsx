import { useState, useEffect } from 'react';
import { Driver, DriverStatus, Location, Trip, TripStatus } from '../types';
import { driverService } from '../services/driverService';
import { tripService } from '../services/tripService';
import { websocketService } from '../services/websocketService';
import DriverPanel from '../components/DriverPanel';
import TripControls from '../components/TripControls';
import MapView from '../components/MapView';

const MOCK_DRIVER: Driver = {
  id: 'driver1',
  name: 'John Doe',
  phoneNumber: '+1234567890',
  vehicleNumber: 'ABC123',
  status: DriverStatus.OFFLINE,
  currentLocation: { latitude: 37.7749, longitude: -122.4194 },
  rating: 4.8,
};

export default function DriverApp() {
  const [driver, setDriver] = useState<Driver>(MOCK_DRIVER);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location>(
    driver.currentLocation || { latitude: 37.7749, longitude: -122.4194 }
  );

  useEffect(() => {
    // Get current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(location);
          if (driver.status === DriverStatus.ONLINE) {
            updateDriverLocation(location);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );

      // Watch position for real-time updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(location);
          if (driver.status === DriverStatus.ONLINE || driver.status === DriverStatus.ON_TRIP) {
            updateDriverLocation(location);
          }
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [driver.status]);

  useEffect(() => {
    const socket = websocketService.connect();

    // Listen for trip updates
    websocketService.onTripStatusUpdate((trip: Trip) => {
      if (trip.driverId === driver.id) {
        setCurrentTrip(trip);
        if (trip.status === TripStatus.IN_PROGRESS) {
          setDriver((prev) => ({ ...prev, status: DriverStatus.ON_TRIP }));
        } else if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
          setDriver((prev) => ({ ...prev, status: DriverStatus.ONLINE }));
          setCurrentTrip(null);
        }
      }
    });

    return () => {
      websocketService.disconnect();
    };
  }, [driver.id]);

  const updateDriverLocation = async (location: Location) => {
    try {
      await driverService.updateLocation(location);
      websocketService.emitDriverLocation(location);
      setDriver((prev) => ({ ...prev, currentLocation: location }));
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleStatusChange = async (status: DriverStatus) => {
    try {
      await driverService.updateStatus(status);
      setDriver((prev) => ({ ...prev, status }));
      websocketService.emitDriverStatus(status);

      if (status === DriverStatus.ONLINE && currentLocation) {
        updateDriverLocation(currentLocation);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleTripUpdate = (trip: Trip) => {
    setCurrentTrip(trip);
    if (trip.status === TripStatus.IN_PROGRESS) {
      setDriver((prev) => ({ ...prev, status: DriverStatus.ON_TRIP }));
    } else if (trip.status === TripStatus.COMPLETED) {
      setDriver((prev) => ({ ...prev, status: DriverStatus.ONLINE }));
      setCurrentTrip(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Driver App</h1>
            <p className="text-sm text-gray-600">{driver.name} • {driver.vehicleNumber}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            driver.status === DriverStatus.ONLINE || driver.status === DriverStatus.ON_TRIP
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {driver.status}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Left Panel */}
        <div className="w-full lg:w-96 space-y-4">
          <DriverPanel driver={driver} onStatusChange={handleStatusChange} />
          
          {currentTrip && (
            <TripControls trip={currentTrip} onTripUpdate={handleTripUpdate} />
          )}
        </div>

        {/* Map */}
        <div className="flex-1 rounded-lg overflow-hidden shadow-lg bg-white">
          <MapView
            center={currentLocation}
            driverLocation={currentLocation}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}