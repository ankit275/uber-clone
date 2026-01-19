import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Driver, DriverStatus, Location, Trip, TripStatus, Ride } from '../types';
import { driverService } from '../services/driverService';
import { useAuth } from '../context/AuthContext';
import { websocketService } from '../services/websocketService';
import DriverPanel from '../components/DriverPanel';
import TripControls from '../components/TripControls';
import MapView from '../components/MapView';
import RideHistoryComponent from '../components/RideHistoryComponent';

export default function DriverApp() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location>(
    { latitude: 37.7749, longitude: -122.4194 }
  );
  const [loading, setLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!user || !user.driverId) {
      navigate('/login');
    } else {
      // Initialize driver from user data
      setDriver({
        id: String(user.driverId),
        driverId: user.driverId,
        name: user.name || 'Driver',
        phoneNumber: '',
        vehicleNumber: '',
        status: DriverStatus.OFFLINE,
        currentLocation: currentLocation,
      });
    }
  }, [user, navigate]);

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
          if (driver?.status === DriverStatus.ONLINE) {
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
          if (driver?.status === DriverStatus.ONLINE || driver?.status === DriverStatus.ON_TRIP) {
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
  }, [driver?.status]);

  useEffect(() => {
    websocketService.connect();

    // Listen for trip updates
    websocketService.onTripStatusUpdate((trip: Trip) => {
      if (driver && trip.driverId === driver.id) {
        setCurrentTrip(trip);
        if (trip.status === TripStatus.IN_PROGRESS) {
          setDriver((prev) => prev ? { ...prev, status: DriverStatus.ON_TRIP } : null);
        } else if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
          setDriver((prev) => prev ? { ...prev, status: DriverStatus.ONLINE } : null);
          setCurrentTrip(null);
          setCurrentRide(null);
        }
      }
    });

    // Listen for ride requests/assignments
    websocketService.onRideRequest((ride: Ride) => {
      if (driver?.status === DriverStatus.ONLINE) {
        setCurrentRide(ride);
      }
    });

    return () => {
      websocketService.disconnect();
    };
  }, [driver?.id, driver?.status]);

  const updateDriverLocation = async (location: Location) => {
    if (!driver) return;
    try {
      const driverId = typeof driver.id === 'string' ? parseInt(driver.id) : driver.id;
      await driverService.updateLocation(driverId, location);
      websocketService.emitDriverLocation(location);
      setDriver((prev) => prev ? { ...prev, currentLocation: location } : null);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleStatusChange = async (status: DriverStatus) => {
    if (!driver) return;
    setLoading(true);
    try {
      const driverId = typeof driver.id === 'string' ? parseInt(driver.id) : driver.id;
      await driverService.updateStatus(driverId, status);
      setDriver((prev) => prev ? { ...prev, status } : null);
      websocketService.emitDriverStatus(status);

      if (status === DriverStatus.ONLINE && currentLocation) {
        updateDriverLocation(currentLocation);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId: number | string) => {
    if (!driver) return;
    setLoading(true);
    try {
      const driverId = typeof driver.id === 'string' ? parseInt(driver.id) : driver.id;
      const rideIdNum = typeof rideId === 'string' ? parseInt(rideId) : rideId;
      await driverService.acceptRide(driverId, rideIdNum);
      // Ride will be updated via WebSocket
    } catch (error) {
      console.error('Failed to accept ride:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripUpdate = (trip: Trip) => {
    setCurrentTrip(trip);
    if (trip.status === TripStatus.IN_PROGRESS) {
      setDriver((prev) => prev ? { ...prev, status: DriverStatus.ON_TRIP } : null);
    } else if (trip.status === TripStatus.COMPLETED) {
      setDriver((prev) => prev ? { ...prev, status: DriverStatus.ONLINE } : null);
      setCurrentTrip(null);
      setCurrentRide(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Driver App</h1>
            <p className="text-sm text-gray-600">{driver.name} • {user?.email}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold mr-4 ${
            driver.status === DriverStatus.ONLINE || driver.status === DriverStatus.ON_TRIP
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {driver.status}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Left Panel - Scrollable */}
        <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)]">
          <DriverPanel driver={driver} onStatusChange={handleStatusChange} />
          
          {/* Ride Assignment Card */}
          {currentRide && !currentTrip && driver.status === DriverStatus.ONLINE && (
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-yellow-500 flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">🚗</span>
                New Ride Request
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 font-semibold">Passenger</p>
                  <p className="text-gray-800">{currentRide.passengerName || 'Customer'}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Pickup Location</p>
                  <p className="text-gray-800">
                    {currentRide.pickupAddress || 
                      `${currentRide.pickupLocation?.latitude}, ${currentRide.pickupLocation?.longitude}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Dropoff Location</p>
                  <p className="text-gray-800">
                    {currentRide.dropoffAddress || 
                      `${currentRide.dropoffLocation?.latitude}, ${currentRide.dropoffLocation?.longitude}`}
                  </p>
                </div>
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <p className="text-gray-600 font-semibold">Estimated Fare</p>
                  <p className="text-xl font-bold text-blue-600">${currentRide.estimatedFare?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <button
                onClick={() => handleAcceptRide(currentRide.id)}
                disabled={loading}
                className="mt-4 w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {loading ? 'Accepting...' : 'Accept Ride'}
              </button>
            </div>
          )}
          
          {currentTrip && (
            <TripControls trip={currentTrip} onTripUpdate={handleTripUpdate} />
          )}

          {/* Ride History Component - Scrollable */}
          {driver && driver.driverId && !currentRide && !currentTrip && (
            <RideHistoryComponent driverId={typeof driver.driverId === 'string' ? parseInt(driver.driverId) : driver.driverId} />
          )}
        </div>

        {/* Map */}
        <div className="flex-1 rounded-lg overflow-hidden shadow-lg bg-white min-h-96">
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