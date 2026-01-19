import { useState } from 'react';
import { RideHistory } from '../services/driverService';
import { Ride, RideStatus } from '../types';
import PaymentComponent from './PaymentComponent';

interface RideDetailsModalProps {
  ride: RideHistory;
  isOpen: boolean;
  onClose: () => void;
  onStartTrip: (rideId: number) => Promise<void>;
  onEndTrip: (rideId: number) => Promise<void>;
  onCompleteRide: (rideId: number) => Promise<void>;
}

export default function RideDetailsModal({
  ride,
  isOpen,
  onClose,
  onStartTrip,
  onEndTrip,
  onCompleteRide,
}: RideDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [tripStarted, setTripStarted] = useState(false);

  if (!isOpen) return null;

  const isCompleted = ride.status?.toUpperCase() === 'COMPLETED';
  const isCancelled = ride.status?.toUpperCase() === 'CANCELLED';
  const canStartTrip = !isCompleted && !isCancelled && !tripStarted;
  const canEndTrip = tripStarted && !isCompleted;

  const handleStartTrip = async () => {
    setLoading(true);
    try {
      await onStartTrip(ride.id);
      setTripStarted(true);
    } catch (error) {
      console.error('Failed to start trip:', error);
      alert('Failed to start trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async () => {
    setLoading(true);
    try {
      await onEndTrip(ride.id);
      setShowPayment(true);
    } catch (error) {
      console.error('Failed to end trip:', error);
      alert('Failed to end trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async () => {
    setLoading(true);
    try {
      await onCompleteRide(ride.id);
      setShowPayment(false);
      alert('Ride completed successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to complete ride:', error);
      alert('Failed to complete ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Passenger Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">👤 Passenger</h3>
            <p className="text-gray-600">{ride.passengerName || 'Customer'}</p>
          </div>

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

          {/* Ride Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {ride.distance && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Distance</p>
                <p className="font-bold text-blue-600">{ride.distance} km</p>
              </div>
            )}
            {ride.duration && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="font-bold text-purple-600">{ride.duration} min</p>
              </div>
            )}
            {ride.fare && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Fare</p>
                <p className="font-bold text-green-600">${ride.fare.toFixed(2)}</p>
              </div>
            )}
            {ride.rating && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Rating</p>
                <p className="font-bold text-yellow-600">⭐ {ride.rating}</p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="text-center p-3 rounded-lg bg-gray-100">
            <p className="text-xs text-gray-600 mb-1">Status</p>
            <span className={`inline-block px-4 py-1 rounded-full font-semibold text-sm ${
              isCompleted ? 'bg-green-100 text-green-800' :
              isCancelled ? 'bg-red-100 text-red-800' :
              tripStarted ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {tripStarted && !isCompleted ? 'Trip In Progress' : ride.status || 'Pending'}
            </span>
          </div>

          {/* Timestamps */}
          {ride.startTime && (
            <div className="text-xs text-gray-600">
              <p><strong>Started:</strong> {new Date(ride.startTime).toLocaleString()}</p>
            </div>
          )}
          {ride.endTime && (
            <div className="text-xs text-gray-600">
              <p><strong>Ended:</strong> {new Date(ride.endTime).toLocaleString()}</p>
            </div>
          )}

          {/* Payment Component */}
          {showPayment && !isCompleted && (
            <PaymentComponent
              ride={{
                id: ride.id,
                riderId: 0,
                status: RideStatus.ENDED,
                pickupLocation: { latitude: 0, longitude: 0 },
                dropoffLocation: { latitude: 0, longitude: 0 },
                fare: ride.fare,
              } as Ride}
              onPaymentComplete={handlePaymentComplete}
            />
          )}

          {/* Action Buttons */}
          {!showPayment && !isCompleted && !isCancelled && (
            <div className="space-y-2 pt-4 border-t">
              {canStartTrip && (
                <button
                  onClick={handleStartTrip}
                  disabled={loading}
                  className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting...' : '▶️ Start Trip'}
                </button>
              )}

              {canEndTrip && (
                <button
                  onClick={handleEndTrip}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Ending...' : '⏹️ End Trip & Payment'}
                </button>
              )}
            </div>
          )}

          {/* Close Button */}
          {!showPayment && (
            <button
              onClick={onClose}
              className="w-full mt-4 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
