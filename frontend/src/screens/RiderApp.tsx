import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ride, Location, RideTier, RideStatus } from '../types';
import { rideService } from '../services/rideService';
import { useAuth } from '../context/AuthContext';
import RideForm from '../components/RideForm';
import RideStatusComponent from '../components/RideStatus';
import PaymentComponent from '../components/PaymentComponent';
import PassengerRideHistoryComponent from '../components/PassengerRideHistoryComponent';
import { websocketService } from '../services/websocketService';

type RiderScreen = 'history' | 'form' | 'status' | 'payment' | 'receipt';

export default function RiderApp() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState<RiderScreen>('history');
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check for active ride on mount
    const activeRideId = localStorage.getItem('activeRideId');
    if (activeRideId) {
      loadRide(activeRideId);
    }
  }, []);

  useEffect(() => {
    if (currentRide) {
      websocketService.connect();

      // Listen for ride status updates
      websocketService.onRideStatusUpdate((updatedRide: Ride) => {
        if (updatedRide.id === currentRide.id) {
          setCurrentRide(updatedRide);
          
          // When ride starts, update status
          if (updatedRide.status === RideStatus.STARTED) {
            setCurrentRide(updatedRide);
          }
          
          // When ride ends, show payment screen
          if (updatedRide.status === RideStatus.ENDED) {
            setCurrentRide(updatedRide);
            setScreen('payment');
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
    _tier: RideTier
  ) => {
    setLoading(true);
    try {
      // Use backend API to create ride
      const ride = await rideService.createRide(pickupLocation, destinationLocation, _tier, user?.id);
      
      setCurrentRide(ride);
      setScreen('status');
      localStorage.setItem('activeRideId', ride.id.toString());
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
      // End the ride instead of cancel
      await rideService.endRide(currentRide.id);
      setCurrentRide(null);
      setScreen('form');
      localStorage.removeItem('activeRideId');
    } catch (error) {
      console.error('Failed to cancel ride:', error);
      alert('Failed to cancel ride');
    }
  };

  const handlePaymentComplete = (success: boolean) => {
    if (success) {
      setScreen('receipt');
    }
  };

  const handleNewRide = () => {
    setCurrentRide(null);
    setScreen('form');
    localStorage.removeItem('activeRideId');
  };

  const handleViewOngoingRide = (ride: Ride) => {
    localStorage.setItem('activeRideId', ride.id.toString());
    navigate(`/ride/${ride.id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // History screen
  if (screen === 'history') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-md p-4 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Uber Clone</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Ride History */}
        <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
          {user?.tenantId ? (
            <PassengerRideHistoryComponent
              tenantId={user.tenantId}
              onRequestNewRide={() => setScreen('form')}
              onViewOngoingRide={handleViewOngoingRide}
            />
          ) : (
            (() => {
              const storedTenantId = localStorage.getItem('tenantId');
              return storedTenantId ? (
                <PassengerRideHistoryComponent
                  tenantId={parseInt(storedTenantId)}
                  onRequestNewRide={() => setScreen('form')}
                  onViewOngoingRide={handleViewOngoingRide}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600 mb-4">Unable to load ride history</p>
                  <button
                    onClick={() => setScreen('form')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Request a Ride
                  </button>
                </div>
              );
            })()
          )}
        </div>
      </div>
    );
  }

  // Payment screen
  if (screen === 'payment' && currentRide) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-md p-4 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Ride Completed</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <PaymentComponent ride={currentRide} onPaymentComplete={handlePaymentComplete} />
      </div>
    );
  }

  // Receipt screen
  if (screen === 'receipt' && currentRide) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="bg-white shadow-md p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Ride Summary</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

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
              <span className="font-medium">{String(currentRide.id).slice(-8)}</span>
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
                {currentRide.dropoffAddress || currentRide.dropoffLocation?.latitude ? `${currentRide.dropoffLocation?.latitude}, ${currentRide.dropoffLocation?.longitude}` : 'Location'}
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
              <span className="text-lg font-semibold text-gray-800">Total Paid</span>
              <span className="text-2xl font-bold text-primary-600">
                ${currentRide.fare?.toFixed(2) || '0.00'}
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
        {/* Header */}
        <div className="bg-white shadow-md p-4 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Ride Status</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <RideStatusComponent ride={currentRide} onCancel={handleCancelRide} />
      </div>
    );
  }

  // Form screen (default)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Uber Clone</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Request a Ride</h2>
            <p className="text-gray-600">Book your ride from position 1 to position 2</p>
          </div>
          <RideForm onSubmit={handleRequestRide} loading={loading} />
        </div>
      </div>
    </div>
  );
}