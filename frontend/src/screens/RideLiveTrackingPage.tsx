import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ride, RideStatus, Location } from '../types';
import { rideService } from '../services/rideService';
import { websocketService } from '../services/websocketService';
import MapView from '../components/MapView';
import { useAuth } from '../context/AuthContext';

export default function RideLiveTrackingPage() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const { user, logout } = useAuth();
  const [ride, setRide] = useState<Ride | null>(null);
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rideId) {
      navigate('/');
      return;
    }

    loadRide();
    connectWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, [rideId]);

  const loadRide = async () => {
    setLoading(true);
    setError(null);
    try {
      const rideData = await rideService.getRide(rideId!);
      setRide(rideData);
    } catch (err) {
      console.error('Failed to load ride:', err);
      setError('Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    websocketService.connect();

    // Listen for ride status updates
    websocketService.onRideStatusUpdate((updatedRide: Ride) => {
      if (updatedRide.id === rideId) {
        setRide(updatedRide);

        // If ride is completed, redirect after a delay
        if (updatedRide.status === RideStatus.ENDED) {
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      }
    });

    // Listen for driver location updates
    websocketService.onDriverLocationUpdate((data) => {
      if (data.driverId === ride?.driverId) {
        setDriverLocation(data.location);
      }
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Ride Tracking</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error || 'Ride not found'}</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mapCenter = driverLocation || ride.pickupLocation;
  const isCompleted = ride.status === RideStatus.ENDED || ride.status === RideStatus.CANCELLED;
  const isDriver = user?.driverId === ride.driverId;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Live Ride Tracking</h1>
            <p className="text-sm text-gray-600">Ride ID: {String(ride.id).slice(-8)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Ride Details Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Ride Status</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                ride.status === RideStatus.STARTED ? 'bg-green-100 text-green-800' :
                ride.status === RideStatus.ASSIGNED ? 'bg-blue-100 text-blue-800' :
                ride.status === RideStatus.REQUESTED ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ride.status === RideStatus.STARTED ? '🚗 In Progress' : 
                 ride.status === RideStatus.ASSIGNED ? '👍 Accepted' :
                 ride.status === RideStatus.REQUESTED ? '⏳ Finding Driver' :
                 ride.status}
              </span>
            </div>

            {/* Driver Info */}
            {ride.driver && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Driver</p>
                <p className="font-semibold text-gray-800">{ride.driver.name}</p>
                <p className="text-xs text-gray-600">{ride.driver.vehicleNumber}</p>
                {ride.driver.rating && (
                  <p className="text-xs text-yellow-600 mt-1">⭐ {ride.driver.rating}</p>
                )}
              </div>
            )}

            {/* Pickup Location */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 font-semibold mb-1">📍 Pickup</p>
              <p className="text-sm text-gray-700">{ride.pickupAddress || 'Location'}</p>
            </div>

            {/* Dropoff Location */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 font-semibold mb-1">📍 Destination</p>
              <p className="text-sm text-gray-700">{ride.dropoffAddress || 'Location'}</p>
            </div>

            {/* Fare */}
            {(ride.fare || ride.estimatedFare) && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">
                  {ride.fare ? 'Final Fare' : 'Estimated Fare'}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  ${(ride.fare || ride.estimatedFare)?.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Completion Message */}
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-center text-green-800 font-semibold mb-2">✅ Ride Completed</p>
              <p className="text-sm text-gray-600 text-center">Thank you for using our service!</p>
              <button
                onClick={handleBack}
                className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Back to Home
              </button>
            </div>
          )}

          {/* Driver/Passenger Info */}
          {!isDriver && ride.driver && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">👋 Driver Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{ride.driver.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Vehicle</p>
                  <p className="font-medium">{ride.driver.vehicleNumber}</p>
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  📞 Call Driver
                </button>
              </div>
            </div>
          )}

          {isDriver && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">👤 Passenger Information</h3>
              <p className="text-sm text-gray-600 mb-2">Passenger details</p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                📞 Call Passenger
              </button>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 rounded-lg overflow-hidden shadow-lg bg-white min-h-96">
          <MapView
            center={mapCenter}
            pickupLocation={ride.pickupLocation}
            destinationLocation={ride.dropoffLocation}
            driverLocation={driverLocation || undefined}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
