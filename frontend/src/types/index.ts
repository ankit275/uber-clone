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

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  WALLET = 'WALLET',
  UPI = 'UPI',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Driver {
  id: string;
  driverId?: number | string;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  status: DriverStatus;
  currentLocation?: Location;
  rating?: number;
}

export interface Ride {
  id: number | string;
  riderId: number | string;
  driverId?: number | string;
  passengerName?: string;
  pickupLocation: Location;
  pickupAddress?: string;
  destinationLocation?: Location;
  dropoffLocation?: Location;
  dropoffAddress?: string;
  status: RideStatus;
  tier?: RideTier;
  fare?: number;
  estimatedFare?: number;
  createdAt?: string;
  updatedAt?: string;
  driver?: Driver;
}

export interface Trip {
  id: string | number;
  rideId: string | number;
  driverId: string | number;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
  startLocation?: Location;
  endLocation?: Location;
  distance?: number;
  duration?: number;
}

export interface Payment {
  id?: number | string;
  rideId: number | string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: number | string;
  email: string;
  name: string;
  tenantId?: number | string;
  driverId?: number | string;
  role?: 'RIDER' | 'DRIVER' | 'BOTH';
  phoneNumber?: string;
  licenseNumber?: string;
  vehicleModel?: string;
  vehiclePlateNumber?: string;
}

export interface SystemStats {
  activeRides: number;
  activeDrivers: number;
  totalRidesToday: number;
  totalRevenueToday: number;
}