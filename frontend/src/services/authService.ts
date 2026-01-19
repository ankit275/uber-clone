import { api } from '../utils/api';

export interface User {
  id: number;
  email: string;
  name?: string;
  tenantId?: number;
  driverId?: number;
  role?: 'RIDER' | 'DRIVER' | 'BOTH';
  driver?: boolean;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export const authService = {
  // Identify or create user by email
  async identify(email: string, name?: string): Promise<AuthResponse> {
    try {
      // Use GET endpoint with query parameter as per your API: /identity?email=...
      const response = await api.get<any>('/identity', {
        params: {
          email,
          name: name || email.split('@')[0],
        },
      });
      
      // Handle response from backend: { tenantId, driverId, driver }
      const data = response.data;
      const user: User = {
        id: data.id || Math.floor(Math.random() * 100000),
        email,
        name: name || email.split('@')[0],
        tenantId: data.tenantId,
        driverId: data.driverId,
        driver: data.driver || false,
        role: data.driver ? 'DRIVER' : 'RIDER',
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error: any) {
      // If /identity doesn't exist, create a user in localStorage
      if (error.response?.status === 404 || error.response?.status === 0) {
        const user: User = {
          id: Math.floor(Math.random() * 100000),
          email,
          name: name || email.split('@')[0],
          driver: false,
          role: 'RIDER',
        };
        localStorage.setItem('user', JSON.stringify(user));
        return { user };
      }
      throw error;
    }
  },

  // Register as tenant
  async registerTenant(name: string, email: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/tenants', {
        name,
        contactEmail: email,
      });
      const user: User = {
        id: Math.floor(Math.random() * 100000),
        email,
        name,
        tenantId: (response.data as any).id,
      };
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    } catch (error) {
      console.error('Tenant registration failed:', error);
      throw error;
    }
  },

  // Register as driver
  async registerDriver(
    tenantId: number,
    phoneNumber: string,
    licenseNumber: string,
    vehicleModel: string,
    vehiclePlateNumber: string
  ): Promise<User> {
    const response = await api.post('/drivers', {
      tenantId,
      phoneNumber,
      licenseNumber,
      vehicleModel,
      vehiclePlateNumber,
    });

    const user = this.getCurrentUser();
    if (user) {
      user.driverId = response.data.id;
      user.role = user.role === 'RIDER' ? 'BOTH' : 'DRIVER';
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Set current user
  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Logout
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('activeRideId');
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  },

  // Check if user is a driver
  isDriver(): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.driverId && (user.role === 'DRIVER' || user.role === 'BOTH'));
  },

  // Check if user is a rider
  isRider(): boolean {
    const user = this.getCurrentUser();
    return !user || !user.role || user.role === 'RIDER' || user.role === 'BOTH';
  },
};
