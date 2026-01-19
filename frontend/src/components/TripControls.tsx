import { useState } from 'react';
import { Trip, TripStatus } from '../types';
import { tripService } from '../services/tripService';

interface TripControlsProps {
  trip: Trip;
  onTripUpdate?: (trip: Trip) => void;
}

export default function TripControls({ trip, onTripUpdate }: TripControlsProps) {
  const [currentTrip, setCurrentTrip] = useState<Trip>(trip);
  const [loading, setLoading] = useState(false);

  const handleStartTrip = async () => {
    setLoading(true);
    try {
      const rideIdNum = typeof trip.id === 'string' ? parseInt(trip.id) : trip.id;
      const updatedTrip = await tripService.startTrip(rideIdNum);
      setCurrentTrip(updatedTrip);
      onTripUpdate?.(updatedTrip);
    } catch (error) {
      console.error('Failed to start trip:', error);
      alert('Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!window.confirm('Are you sure you want to end this trip?')) {
      return;
    }

    setLoading(true);
    try {
      const tripIdNum = typeof trip.id === 'string' ? parseInt(trip.id) : trip.id;
      const updatedTrip = await tripService.endTrip(tripIdNum);
      setCurrentTrip(updatedTrip);
      onTripUpdate?.(updatedTrip);
    } catch (error) {
      console.error('Failed to end trip:', error);
      alert('Failed to end trip');
    } finally {
      setLoading(false);
    }
  };

  if (currentTrip.status === TripStatus.COMPLETED) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Trip Completed</h3>
          {currentTrip.startTime && currentTrip.endTime && (
            <p className="text-gray-600 mb-4">
              Duration: {Math.round(
                (new Date(currentTrip.endTime).getTime() - new Date(currentTrip.startTime).getTime()) / 60000
              )} minutes
            </p>
          )}
          {currentTrip.distance && (
            <p className="text-gray-600 mb-4">Distance: {currentTrip.distance.toFixed(2)} km</p>
          )}
        </div>
      </div>
    );
  }

  if (currentTrip.status === TripStatus.IN_PROGRESS) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Trip in Progress</h3>
          {currentTrip.startTime && (
            <p className="text-gray-600">
              Started at: {new Date(currentTrip.startTime).toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          onClick={handleEndTrip}
          disabled={loading}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Ending Trip...' : 'End Trip'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Start Trip</h3>
        <p className="text-gray-600">Click the button below when you pick up the rider</p>
      </div>

      <button
        onClick={handleStartTrip}
        disabled={loading}
        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        {loading ? 'Starting Trip...' : 'Start Trip'}
      </button>
    </div>
  );
}