export enum RideStatus {
  REQUESTED = 'REQUESTED',
  ASSIGNED = 'ASSIGNED',
  STARTED = 'STARTED',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export enum DriverStatus {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  ON_TRIP = 'ON_TRIP',
}

export enum TripStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RideTier {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY',
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  status: DriverStatus;
  currentLocation?: Location;
  rating?: number;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickupLocation: Location;
  destinationLocation: Location;
  status: RideStatus;
  tier: RideTier;
  fare?: number;
  estimatedFare?: number;
  createdAt: string;
  updatedAt: string;
  driver?: Driver;
}

export interface Trip {
  id: string;
  rideId: string;
  driverId: string;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
  startLocation?: Location;
  endLocation?: Location;
  distance?: number;
  duration?: number;
}

export interface SystemStats {
  activeRides: number;
  activeDrivers: number;
  totalRidesToday: number;
  totalRevenueToday: number;
}