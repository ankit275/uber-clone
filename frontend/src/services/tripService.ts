import { api } from '../utils/api';
import { Trip } from '../types';

export const tripService = {
  async startTrip(rideId: number | string): Promise<Trip> {
    const response = await api.post<Trip>(`/trips/${rideId}/start`);
    return response.data;
  },

  async endTrip(tripId: number | string): Promise<Trip> {
    const response = await api.post<Trip>(`/trips/${tripId}/end`);
    return response.data;
  },

  async getTrip(tripId: string): Promise<Trip> {
    const response = await api.get<Trip>(`/trips/${tripId}`);
    return response.data;
  },
};