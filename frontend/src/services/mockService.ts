// Mock service for development and testing
import { Ride, Driver, Location, SystemStats, RideStatus, DriverStatus } from '../types';

// Mock data storage (in production, this would be API calls)
let mockRides: Ride[] = [];
let mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Doe',
    phoneNumber: '+1234567890',
    vehicleNumber: 'ABC123',
    status: DriverStatus.ONLINE,
    currentLocation: { latitude: 37.7749, longitude: -122.4194 },
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Jane Smith',
    phoneNumber: '+1234567891',
    vehicleNumber: 'XYZ789',
    status: DriverStatus.ONLINE,
    currentLocation: { latitude: 37.7849, longitude: -122.4094 },
    rating: 4.9,
  },
];

export const mockService = {
  // Mock geocoding
  async geocodeAddress(address: string): Promise<Location> {
    // Mock implementation - returns a random location in SF area
    return {
      address,
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    };
  },

  // Mock ride creation
  async createMockRide(
    pickupLocation: Location,
    destinationLocation: Location,
    tier: string
  ): Promise<Ride> {
    const newRide: Ride = {
      id: Date.now().toString(),
      riderId: 'rider1',
      pickupLocation,
      destinationLocation,
      status: RideStatus.REQUESTED,
      tier: tier as any,
      estimatedFare: Math.random() * 50 + 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRides.push(newRide);
    return newRide;
  },

  // Mock driver location updates
  getMockDriverLocation(driverId: string): Location | null {
    const driver = mockDrivers.find((d) => d.id === driverId);
    return driver?.currentLocation || null;
  },

  // Mock system stats
  getMockStats(): SystemStats {
    return {
      activeRides: mockRides.filter((r) =>
        [RideStatus.REQUESTED, RideStatus.ASSIGNED, RideStatus.STARTED].includes(r.status)
      ).length,
      activeDrivers: mockDrivers.filter((d) => d.status === DriverStatus.ONLINE).length,
      totalRidesToday: mockRides.length,
      totalRevenueToday: mockRides
        .filter((r) => r.status === RideStatus.ENDED)
        .reduce((sum, r) => sum + (r.fare || 0), 0),
    };
  },

  // Update mock driver location (simulate movement)
  updateMockDriverLocation(driverId: string): void {
    const driver = mockDrivers.find((d) => d.id === driverId);
    if (driver && driver.currentLocation) {
      // Move driver slightly
      driver.currentLocation.latitude += (Math.random() - 0.5) * 0.001;
      driver.currentLocation.longitude += (Math.random() - 0.5) * 0.001;
    }
  },
};