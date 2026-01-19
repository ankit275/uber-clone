import { useState, useEffect } from 'react';
import { RideHistory, driverService } from '../services/driverService';
import RideDetailsModal from './RideDetailsModal';

interface RideHistoryComponentProps {
  driverId: number;
}

export default function RideHistoryComponent({ driverId }: RideHistoryComponentProps) {
  const [rides, setRides] = useState<RideHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<RideHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRideHistory();
  }, [driverId]);

  const fetchRideHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await driverService.getRideHistory(driverId);
      setRides(history);
    } catch (err) {
      console.error('Failed to fetch ride history:', err);
      setError('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async (rideId: number) => {
    if (!driverId) return;
    try {
      await driverService.startTrip(driverId, rideId);
      fetchRideHistory();
    } catch (error) {
      console.error('Failed to start trip:', error);
      throw error;
    }
  };

  const handleEndTrip = async (rideId: number) => {
    if (!driverId) return;
    try {
      await driverService.endTrip(driverId, rideId);
      fetchRideHistory();
    } catch (error) {
      console.error('Failed to end trip:', error);
      throw error;
    }
  };

  const handleCompleteRide = async (rideId: number) => {
    if (!driverId) return;
    try {
      await driverService.completeRide(driverId, rideId);
      fetchRideHistory();
      setSelectedRide(null);
    } catch (error) {
      console.error('Failed to complete ride:', error);
      throw error;
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">📋 Ride History</h2>
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
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No rides yet</p>
          <p className="text-sm">Your ride history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {rides.map((ride) => {
            const isCompleted = ride.status?.toUpperCase() === 'COMPLETED';
            const isCancelled = ride.status?.toUpperCase() === 'CANCELLED';
            
            return (
              <div
                key={ride.id}
                onClick={() => setSelectedRide(ride)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-lg ${
                  isCompleted
                    ? 'bg-green-50 border-green-200'
                    : isCancelled
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {ride.passengerName || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      📍 {ride.pickupAddress || 'Pickup location'}
                    </p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                    isCompleted ? 'bg-green-200 text-green-800' :
                    isCancelled ? 'bg-red-200 text-red-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {ride.status || 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  {ride.fare && (
                    <div>
                      <p className="text-gray-600">Fare</p>
                      <p className="font-bold text-green-600">${ride.fare.toFixed(2)}</p>
                    </div>
                  )}
                  {ride.distance && (
                    <div>
                      <p className="text-gray-600">Distance</p>
                      <p className="font-bold text-blue-600">{ride.distance} km</p>
                    </div>
                  )}
                  {ride.duration && (
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-bold text-purple-600">{ride.duration} min</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Click to see details
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Ride Details Modal */}
      {selectedRide && (
        <RideDetailsModal
          ride={selectedRide}
          isOpen={!!selectedRide}
          onClose={() => setSelectedRide(null)}
          onStartTrip={handleStartTrip}
          onEndTrip={handleEndTrip}
          onCompleteRide={handleCompleteRide}
        />
      )}
    </div>
  );
}
