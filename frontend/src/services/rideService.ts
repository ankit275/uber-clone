import { api } from '../utils/api';
import { Ride, Location, RideTier } from '../types';
import { generateIdempotentKey } from '../utils/uuid';

export const rideService = {
  async createRide(
    pickupLocation: Location,
    destinationLocation: Location,
    _tier: RideTier,
    passengerId?: number
  ): Promise<Ride> {
    const response = await api.post<Ride>('/rides', {
      passengerId: passengerId || 1,
      pickupLatitude: pickupLocation.latitude,
      pickupLongitude: pickupLocation.longitude,
      dropoffLatitude: destinationLocation.latitude,
      dropoffLongitude: destinationLocation.longitude,
      pickupAddress: pickupLocation.address,
      dropoffAddress: destinationLocation.address,
      city: 'San Francisco',
    }, {
      headers: {
        'Idempotent-Key': generateIdempotentKey()
      }
    });
    return response.data;
  },

  async getRide(rideId: string | number): Promise<Ride> {
    const response = await api.get<Ride>(`/rides/${rideId}`);
    return response.data;
  },

  async endRide(rideId: string | number): Promise<string> {
    const response = await api.post(`/rides/${rideId}/end`, undefined, {
      headers: {
        'Idempotent-Key': generateIdempotentKey()
      },
      responseType: 'text'
    });
    return response.data || 'success';
  },

  async getActiveRides(): Promise<Ride[]> {
    const response = await api.get<Ride[]>('/rides/active');
    return response.data;
  },

  async getRideHistory(tenantId: number): Promise<Ride[]> {
    try {
      const response = await api.get<Ride[]>(`/${tenantId}/history`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ride history:', error);
      return [];
    }
  },
};