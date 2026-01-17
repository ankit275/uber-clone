import { api } from '../utils/api';
import { Ride, Location, RideTier } from '../types';

export const rideService = {
  async createRide(
    pickupLocation: Location,
    destinationLocation: Location,
    tier: RideTier
  ): Promise<Ride> {
    const response = await api.post<Ride>('/api/rides', {
      pickupLocation,
      destinationLocation,
      tier,
    });
    return response.data;
  },

  async getRide(rideId: string): Promise<Ride> {
    const response = await api.get<Ride>(`/api/rides/${rideId}`);
    return response.data;
  },

  async cancelRide(rideId: string): Promise<void> {
    await api.delete(`/api/rides/${rideId}`);
  },

  async getActiveRides(): Promise<Ride[]> {
    const response = await api.get<Ride[]>('/api/rides/active');
    return response.data;
  },
};