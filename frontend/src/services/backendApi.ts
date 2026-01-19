import { api } from '../utils/api';

// Centralized backend-aligned API helpers targeting Spring controllers
// These do not modify existing services; import and use where needed.

// Tenants
export async function createTenant(payload: { name: string; contactEmail?: string }) {
  const res = await api.post('/tenants', payload);
  return res.data as any;
}

// Drivers
export async function registerDriver(payload: {
  phoneNumber: string;
  licenseNumber: string;
  vehicleModel: string;
  vehiclePlateNumber: string;
  tenantId: number;
}) {
  const res = await api.post('/drivers', payload);
  return res.data as any;
}

export async function updateDriverLocation(driverId: number, payload: {
  latitude: number;
  longitude: number;
  city: string;
}) {
  await api.post(`/drivers/${driverId}/location`, payload);
}

export async function acceptRide(driverId: number, rideId: number) {
  await api.post(`/drivers/${driverId}/accept`, null, { params: { rideId } });
}

export async function setDriverStatus(driverId: number, status: 'ONLINE' | 'OFFLINE') {
  await api.post(`/drivers/${driverId}/setStatus`, null, { params: { status } });
}

// Rides
export async function createRide(payload: {
  passengerId: number;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  pickupAddress?: string;
  dropoffAddress?: string;
  idempotencyKey?: string;
  city?: string;
}) {
  const res = await api.post('/rides', payload);
  return res.data as any;
}

export async function getRide(rideId: number) {
  const res = await api.get(`/rides/${rideId}`);
  return res.data as any;
}

// Note: backend returns plain text "success" for this endpoint
export async function endRide(rideId: number) {
  const res = await api.post(`/rides/${rideId}/end`, undefined, { responseType: 'text' });
  return (res.data as unknown as string) || 'success';
}

// Trips
export async function startTripByRide(rideId: number) {
  const res = await api.post(`/trips/${rideId}/start`);
  return res.data as any;
}

export async function endTrip(tripId: number) {
  const res = await api.post(`/trips/${tripId}/end`);
  return res.data as any;
}

// Payments
export async function createPayment(payload: {
  rideId: number;
  paymentMethod: string;
  idempotencyKey?: string;
}) {
  const res = await api.post('/payments', payload);
  return res.data as any;
}
