import { useState, useEffect } from 'react';
import { Ride, Location, RideTier, RideStatus } from '../types';
import { rideService } from '../services/rideService';
import { mockService } from '../services/mockService';
import RideForm from '../components/RideForm';
import RideStatusComponent from '../components/RideStatus';
import MapView from '../components/MapView';
import { websocketService } from '../services/websocketService';

type RiderScreen = 'form' | 'status' | 'receipt';

export default function RiderApp() {
  const [screen, setScreen] = useState<RiderScreen>('form');
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for active ride on mount
    // In production, this would check localStorage or API
    const activeRideId = localStorage.getItem('activeRideId');
    if (activeRideId) {
      loadRide(activeRideId);
    }
  }, []);

  useEffect(() => {
    if (currentRide) {
      const socket = websocketService.connect();

      // Listen for ride status updates
      websocketService.onRideStatusUpdate((updatedRide: Ride) => {
        if (updatedRide.id === currentRide.id) {
          setCurrentRide(updatedRide);
          
          // If ride ended, show receipt
          if (updatedRide.status === RideStatus.ENDED) {
            setScreen('receipt');
          }
        }
      });

      // Listen for ride assignment
      websocketService.onRideAssigned((data) => {
        if (data.rideId === currentRide.id) {
          setCurrentRide((prev) => prev ? { ...prev, driver: data.driver, status: RideStatus.ASSIGNED } : null);
        }
      });

      return () => {
        websocketService.disconnect();
      };
    }
  }, [currentRide]);

  const loadRide = async (rideId: string) => {
    try {
      const ride = await rideService.getRide(rideId);
      setCurrentRide(ride);
      setScreen('status');
    } catch (error) {
      console.error('Failed to load ride:', error);
      localStorage.removeItem('activeRideId');
    }
  };

  const handleRequestRide = async (
    pickupLocation: Location,
    destinationLocation: Location,
    tier: RideTier
  ) => {
    setLoading(true);
    try {
      // In production, use real API
      // For now, use mock service
      const ride = await mockService.createMockRide(pickupLocation, destinationLocation, tier);
      
      setCurrentRide(ride);
      setScreen('status');
      localStorage.setItem('activeRideId', ride.id);

      // In production, this would trigger the real API call
      // await rideService.createRide(pickupLocation, destinationLocation, tier);
    } catch (error) {
      console.error('Failed to create ride:', error);
      alert('Failed to request ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!currentRide) return;

    if (!window.confirm('Are you sure you want to cancel this ride?')) {
      return;
    }

    try {
      await rideService.cancelRide(currentRide.id);
      setCurrentRide(null);
      setScreen('form');
      localStorage.removeItem('activeRideId');
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      alert('Failed to cancel ride');
    }
  };

  const handleNewRide = () => {
    setCurrentRide(null);
    setScreen('form');
    localStorage.removeItem('activeRideId');
  };

  // Receipt screen
  if (screen === 'receipt' && currentRide && currentRide.status === RideStatus.ENDED) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ride Completed</h2>
            <p className="text-gray-600">Thank you for using our service!</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Ride ID</span>
              <span className="font-medium">{currentRide.id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup</span>
              <span className="font-medium text-right max-w-xs">
                {currentRide.pickupLocation.address || 'Location'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destination</span>
              <span className="font-medium text-right max-w-xs">
                {currentRide.destinationLocation.address || 'Location'}
              </span>
            </div>
            {currentRide.driver && (
              <div className="flex justify-between">
                <span className="text-gray-600">Driver</span>
                <span className="font-medium">{currentRide.driver.name}</span>
              </div>
            )}
            {currentRide.tier && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tier</span>
                <span className="font-medium">{currentRide.tier}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center bg-primary-50 p-4 rounded-lg">
              <span className="text-lg font-semibold text-gray-800">Total Fare</span>
              <span className="text-2xl font-bold text-primary-600">
                ${currentRide.fare?.toFixed(2) || currentRide.estimatedFare?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleNewRide}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Book Another Ride
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Status screen
  if (screen === 'status' && currentRide) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <RideStatusComponent ride={currentRide} onCancel={handleCancelRide} />
      </div>
    );
  }

  // Form screen (default)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Uber Ride</h1>
          <p className="text-gray-600">Book your ride in seconds</p>
        </div>
        <RideForm onSubmit={handleRequestRide} loading={loading} />
      </div>
    </div>
  );
}