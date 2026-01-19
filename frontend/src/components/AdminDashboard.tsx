import { useState, useEffect } from 'react';
import { SystemStats, Ride, Driver } from '../types';
import { rideService } from '../services/rideService';
import { driverService } from '../services/driverService';
import { websocketService } from '../services/websocketService';

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    activeRides: 0,
    activeDrivers: 0,
    totalRidesToday: 0,
    totalRevenueToday: 0,
  });
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Set up WebSocket for real-time updates
    websocketService.connect();

    websocketService.onRideStatusUpdate(() => {
      loadData();
    });

    websocketService.onSystemStatsUpdate((updatedStats: SystemStats) => {
      setStats(updatedStats);
    });

    // Refresh data periodically (fallback)
    const interval = setInterval(loadData, 5000);

    return () => {
      clearInterval(interval);
      websocketService.disconnect();
    };
  }, []);

  const calculateStats = (rides: Ride[], drivers: Driver[]) => {
    const activeRideCount = rides.filter(r => ['REQUESTED', 'ASSIGNED', 'STARTED'].includes(r.status)).length;
    const onlineDrivers = drivers.filter(d => d.status === 'ONLINE' || d.status === 'ON_TRIP').length;
    const totalRevenue = rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);
    
    return {
      activeRides: activeRideCount,
      activeDrivers: onlineDrivers,
      totalRidesToday: rides.length,
      totalRevenueToday: totalRevenue,
    };
  };

  const loadData = async () => {
    try {
      const [rides, drivers] = await Promise.all([
        rideService.getActiveRides().catch(() => []),
        driverService.getActiveDrivers().catch(() => []),
      ]);

      setActiveRides(rides);
      setActiveDrivers(drivers);
      const calculatedStats = calculateStats(rides, drivers);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Rides</p>
                <p className="text-3xl font-bold text-gray-800">{stats.activeRides}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Drivers</p>
                <p className="text-3xl font-bold text-gray-800">{stats.activeDrivers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rides Today</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalRidesToday}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue Today</p>
                <p className="text-3xl font-bold text-gray-800">${stats.totalRevenueToday.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Rides Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active Rides</h2>
          {activeRides.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active rides</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ride ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pickup
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fare
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeRides.map((ride) => (
                    <tr key={ride.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {String(ride.id).slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ride.pickupLocation.address || 'Location'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ride.dropoffAddress || ride.dropoffLocation?.latitude ? `${ride.dropoffLocation?.latitude}, ${ride.dropoffLocation?.longitude}` : 'Location'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ride.driver?.name || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ride.fare ? `$${ride.fare.toFixed(2)}` : ride.estimatedFare ? `$${ride.estimatedFare.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Drivers Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active Drivers</h2>
          {activeDrivers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active drivers</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDrivers.map((driver) => (
                <div key={driver.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{driver.name}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {driver.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{driver.vehicleNumber}</p>
                  {driver.rating && (
                    <p className="text-sm text-yellow-600">⭐ {driver.rating}</p>
                  )}
                  {driver.currentLocation && (
                    <p className="text-xs text-gray-500 mt-2">
                      Lat: {driver.currentLocation.latitude.toFixed(4)}, 
                      Lng: {driver.currentLocation.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}