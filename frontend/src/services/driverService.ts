import { api } from '../utils/api';
import { Driver, Location, DriverStatus } from '../types';

export const driverService = {
  async updateStatus(status: DriverStatus): Promise<Driver> {
    const response = await api.put<Driver>('/api/drivers/status', { status });
    return response.data;
  },

  async updateLocation(location: Location): Promise<void> {
    await api.put('/api/drivers/location', { location });
  },

  async acceptRide(rideId: string): Promise<void> {
    await api.post(`/api/drivers/rides/${rideId}/accept`);
  },

  async rejectRide(rideId: string): Promise<void> {
    await api.post(`/api/drivers/rides/${rideId}/reject`);
  },

  async getActiveDrivers(): Promise<Driver[]> {
    const response = await api.get<Driver[]>('/api/drivers/active');
    return response.data;
  },
};