import { useState, useEffect } from 'react';
import { Driver, DriverStatus, Ride } from '../types';
import { driverService } from '../services/driverService';
import { websocketService } from '../services/websocketService';

interface DriverPanelProps {
  driver: Driver;
  onStatusChange?: (status: DriverStatus) => void;
}

export default function DriverPanel({ driver, onStatusChange }: DriverPanelProps) {
  const [status, setStatus] = useState<DriverStatus>(driver.status);
  const [pendingRides, setPendingRides] = useState<Ride[]>([]);

  useEffect(() => {
    websocketService.connect();

    // Listen for ride requests
    websocketService.onRideRequest((ride: Ride) => {
      setPendingRides((prev) => [...prev, ride]);
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const handleStatusToggle = async () => {
    const newStatus = status === DriverStatus.OFFLINE ? DriverStatus.ONLINE : DriverStatus.OFFLINE;
    
    try {
      const driverId = typeof driver.id === 'string' ? parseInt(driver.id) : driver.id;
      await driverService.updateStatus(driverId, newStatus);
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAcceptRide = async (rideId: string | number) => {
    try {
      const driverId = typeof driver.id === 'string' ? parseInt(driver.id) : driver.id;
      const rideIdNum = typeof rideId === 'string' ? parseInt(rideId) : rideId;
      await driverService.acceptRide(driverId, rideIdNum);
      setPendingRides((prev) => prev.filter((r) => r.id !== rideId));
    } catch (error) {
      console.error('Failed to accept ride:', error);
    }
  };

  const handleRejectRide = async (rideId: string | number) => {
    try {
      const driverId = typeof driver.id === 'string' ? parseInt(driver.id) : driver.id;
      const rideIdNum = typeof rideId === 'string' ? parseInt(rideId) : rideId;
      await driverService.rejectRide(driverId, rideIdNum);
      setPendingRides((prev) => prev.filter((r) => r.id !== rideId));
    } catch (error) {
      console.error('Failed to reject ride:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{driver.name}</h2>
          <p className="text-gray-600">{driver.vehicleNumber}</p>
          {driver.rating && (
            <p className="text-yellow-600">⭐ {driver.rating}</p>
          )}
        </div>
        <button
          onClick={handleStatusToggle}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            status === DriverStatus.ONLINE
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
          }`}
        >
          {status === DriverStatus.ONLINE ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <div className="mb-6">
        <div className={`p-4 rounded-lg ${
          status === DriverStatus.ONLINE ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'
        }`}>
          <p className="font-semibold text-gray-800">
            Status: <span className={status === DriverStatus.ONLINE ? 'text-green-600' : 'text-gray-600'}>
              {status}
            </span>
          </p>
        </div>
      </div>

      {status === DriverStatus.ONLINE && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Ride Requests</h3>
          {pendingRides.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending ride requests</p>
          ) : (
            <div className="space-y-3">
              {pendingRides.map((ride) => (
                <div
                  key={ride.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Pickup</p>
                    <p className="font-medium">{ride.pickupLocation.address || 'Location'}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-medium">{ride.dropoffAddress || ride.dropoffLocation?.latitude ? `${ride.dropoffLocation?.latitude}, ${ride.dropoffLocation?.longitude}` : 'Location'}</p>
                  </div>
                  {ride.estimatedFare && (
                    <p className="text-sm text-gray-600 mb-3">
                      Estimated Fare: <span className="font-semibold">${ride.estimatedFare.toFixed(2)}</span>
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRide(ride.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRide(ride.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}