import { useState, useEffect } from 'react';
import { Ride, RideStatus } from '../types';
import { rideService } from '../services/rideService';

interface PassengerRideHistoryComponentProps {
  tenantId: number;
  onRequestNewRide: () => void;
  onViewOngoingRide: (ride: Ride) => void;
}

export default function PassengerRideHistoryComponent({
  tenantId,
  onRequestNewRide,
  onViewOngoingRide,
}: PassengerRideHistoryComponentProps) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRideHistory();
  }, [tenantId]);

  const fetchRideHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await rideService.getRideHistory(tenantId);
      setRides(history);
    } catch (err) {
      console.error('Failed to fetch ride history:', err);
      setError('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  const handleRideClick = (ride: Ride) => {
    const isCompleted = ride.status === RideStatus.ENDED || ride.status === RideStatus.CANCELLED;
    
    if (isCompleted) {
      // Show modal for completed rides
      setSelectedRide(ride);
    } else {
      // Navigate to ride details page for ongoing rides
      onViewOngoingRide(ride);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ride History</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Loading rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request New Ride Button */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Ready for a ride?</h2>
            <p className="text-blue-100">Book your next ride in seconds</p>
          </div>
          <button
            onClick={onRequestNewRide}
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition transform hover:scale-105 active:scale-95"
          >
            📍 Request Ride
          </button>
        </div>
      </div>

      {/* Ride History Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">📋 Your Rides</h2>
          <button
            onClick={fetchRideHistory}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}

        {rides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No rides yet</p>
            <p className="text-sm">Your ride history will appear here</p>
            <button
              onClick={onRequestNewRide}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Book Your First Ride
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => {
              const isCompleted = ride.status === RideStatus.ENDED || ride.status === RideStatus.CANCELLED;
              const isOngoing = ride.status === RideStatus.REQUESTED || ride.status === RideStatus.ASSIGNED || ride.status === RideStatus.STARTED;
              
              return (
                <div
                  key={ride.id}
                  onClick={() => handleRideClick(ride)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-lg ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : isOngoing
                      ? 'bg-blue-50 border-blue-200 hover:border-blue-400'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {ride.driver ? (
                        <p className="font-semibold text-gray-800">
                          🚗 {ride.driver.name}
                        </p>
                      ) : (
                        <p className="font-semibold text-gray-800">Waiting for driver...</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">
                        📍 {ride.pickupAddress || 'Pickup location'}
                      </p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                      isCompleted ? 'bg-green-200 text-green-800' :
                      isOngoing ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {ride.status === RideStatus.STARTED ? '🚗 In Progress' : ride.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    {ride.fare && (
                      <div>
                        <p className="text-gray-600">Fare</p>
                        <p className="font-bold text-green-600">${ride.fare.toFixed(2)}</p>
                      </div>
                    )}
                    {ride.estimatedFare && !ride.fare && (
                      <div>
                        <p className="text-gray-600">Est. Fare</p>
                        <p className="font-bold text-blue-600">${ride.estimatedFare.toFixed(2)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Destination</p>
                      <p className="font-bold text-purple-600">{ride.dropoffAddress ? 'Set' : 'Pending'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    {isCompleted ? 'Click to view details' : 'Click to track ride'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ride Details Modal for Completed Rides */}
      {selectedRide && (
        <RideDetailsCompletedModal
          ride={selectedRide}
          isOpen={!!selectedRide}
          onClose={() => setSelectedRide(null)}
        />
      )}
    </div>
  );
}

// Simple modal for viewing completed ride details
function RideDetailsCompletedModal({
  ride,
  isOpen,
  onClose,
}: {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold">Ride Details</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-80 transition"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Driver Info */}
          {ride.driver && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">🚗 Driver</h3>
              <p className="text-gray-700 font-medium">{ride.driver.name}</p>
              <p className="text-sm text-gray-600">{ride.driver.vehicleNumber}</p>
              {ride.driver.rating && (
                <p className="text-sm text-yellow-600 mt-1">⭐ {ride.driver.rating}</p>
              )}
            </div>
          )}

          {/* Pickup Location */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">📍 Pickup</h3>
            <p className="text-gray-700">{ride.pickupAddress || 'Location not specified'}</p>
          </div>

          {/* Dropoff Location */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">📍 Dropoff</h3>
            <p className="text-gray-700">{ride.dropoffAddress || 'Location not specified'}</p>
          </div>

          {/* Fare and Details */}
          <div className="grid grid-cols-2 gap-3">
            {ride.fare && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Fare</p>
                <p className="font-bold text-green-600">${ride.fare.toFixed(2)}</p>
              </div>
            )}
            {ride.estimatedFare && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Estimate</p>
                <p className="font-bold text-blue-600">${ride.estimatedFare.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="text-center p-3 rounded-lg bg-gray-100">
            <p className="text-xs text-gray-600 mb-1">Status</p>
            <span className={`inline-block px-4 py-1 rounded-full font-semibold text-sm ${
              ride.status === RideStatus.ENDED ? 'bg-green-100 text-green-800' :
              ride.status === RideStatus.CANCELLED ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {ride.status === RideStatus.ENDED ? 'Completed' : ride.status}
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
