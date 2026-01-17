import { api } from '../utils/api';
import { Trip, Location } from '../types';

export const tripService = {
  async startTrip(tripId: string, startLocation: Location): Promise<Trip> {
    const response = await api.post<Trip>(`/api/trips/${tripId}/start`, {
      startLocation,
    });
    return response.data;
  },

  async endTrip(tripId: string, endLocation: Location): Promise<Trip> {
    const response = await api.post<Trip>(`/api/trips/${tripId}/end`, {
      endLocation,
    });
    return response.data;
  },

  async getTrip(tripId: string): Promise<Trip> {
    const response = await api.get<Trip>(`/api/trips/${tripId}`);
    return response.data;
  },
};