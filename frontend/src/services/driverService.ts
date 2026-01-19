import { api } from '../utils/api';
import { Driver, Location, DriverStatus } from '../types';
import { generateIdempotentKey } from '../utils/uuid';

export interface RideHistory {
  id: number;
  passengerName?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  distance?: number;
  duration?: number;
  fare?: number;
  status?: string;
  startTime?: string;
  endTime?: string;
  rating?: number;
}

export interface DriverDetail {
  id?: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  vehicleModel?: string;
  vehiclePlateNumber?: string;
  status?: string; // 'ONLINE' | 'OFFLINE' | 'ON_TRIP'
  rating?: number;
  totalRides?: number;
  totalEarnings?: number;
  rideHistory?: RideHistory[];
}

export const driverService = {
  async registerDriver(payload: {
    phoneNumber: string;
    licenseNumber: string;
    vehicleModel: string;
    vehiclePlateNumber: string;
    tenantId: number;
  }): Promise<Driver> {
    const response = await api.post<Driver>('/drivers', payload);
    return response.data;
  },

  async updateStatus(driverId: number, status: DriverStatus): Promise<Driver> {
    const response = await api.post<Driver>(`/drivers/${driverId}/setStatus`, null, {
      params: { status: status.toUpperCase() },
      headers: {
        'Idempotent-Key': generateIdempotentKey()
      }
    });
    return response.data;
  },

  async updateLocation(driverId: number, location: Location): Promise<void> {
    await api.post(`/drivers/${driverId}/location`, {
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.address || 'San Francisco',
    }, {
      headers: {
        'Idempotent-Key': generateIdempotentKey()
      }
    });
  },

  async acceptRide(driverId: number, rideId: number): Promise<void> {
    await api.post(`/drivers/${driverId}/accept`, null, {
      params: { rideId },
      headers: {
        'Idempotent-Key': generateIdempotentKey()
      }
    });
  },

  async rejectRide(driverId: number, rideId: number): Promise<void> {
    // Backend doesn't have reject endpoint, so this is a placeholder
    console.log(`Driver ${driverId} rejected ride ${rideId}`);
  },

  async getActiveDrivers(): Promise<Driver[]> {
    const response = await api.get<Driver[]>('/drivers/active');
    return response.data;
  },

  // Get ride history for driver - using /drivers/{driverId}/detail endpoint
  async getRideHistory(driverId: number): Promise<RideHistory[]> {
    try {
      const response = await api.get<DriverDetail>(`/drivers/${driverId}/detail`);
      return response.data.rideHistory || [];
    } catch (error) {
      console.error('Failed to fetch ride history:', error);
      return [];
    }
  },

  // Get driver details including status and ride history
  async getDriverDetail(driverId: number): Promise<DriverDetail> {
    try {
      const response = await api.get<DriverDetail>(`/drivers/${driverId}/detail`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch driver details:', error);
      return {};
    }
  },

  // Start trip
  async startTrip(driverId: number, rideId: number): Promise<void> {
    await api.post(`/drivers/${driverId}/trips/start`, null, {
      params: { rideId },
      headers: {
        'Idempotent-Key': generateIdempotentKey()
      }
    });
  },

  // End trip
  async endTrip(driverId: number, rideId: number): Promise<void> {
    await api.post(`/drivers/${driverId}/trips/end`, null, {
      params: { rideId },
      headers: {
        'Idempotent-Key': generateIdempotentKey()
      }
    });
  },

  // Complete ride (after payment)
  async completeRide(driverId: number, rideId: number): Promise<void> {
    await api.post(`/drivers/${driverId}/rides/${rideId}/complete`, undefined, {
      headers: {
        'Idempotent-Key': generateIdempotentKey()
      }
    });
  },
};