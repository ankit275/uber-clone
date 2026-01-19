import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isDriver: boolean;
  isRider: boolean;
  login: (email: string, name?: string) => Promise<User>;
  registerTenant: (name: string, email: string) => Promise<User>;
  registerDriver: (
    tenantId: number,
    phoneNumber: string,
    licenseNumber: string,
    vehicleModel: string,
    vehiclePlateNumber: string
  ) => Promise<void>;
  setUserRole: (role: 'RIDER' | 'DRIVER' | 'BOTH') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (email: string, name?: string): Promise<User> => {
    const response = await authService.identify(email, name);
    setUser(response.user);
    return response.user;
  };

  const registerTenant = async (name: string, email: string): Promise<User> => {
    const response = await authService.registerTenant(name, email);
    setUser(response.user);
    return response.user;
  };

  const registerDriver = async (
    tenantId: number,
    phoneNumber: string,
    licenseNumber: string,
    vehicleModel: string,
    vehiclePlateNumber: string
  ): Promise<void> => {
    await authService.registerDriver(tenantId, phoneNumber, licenseNumber, vehicleModel, vehiclePlateNumber);
    const updatedUser = authService.getCurrentUser();
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const setUserRole = (role: 'RIDER' | 'DRIVER' | 'BOTH'): void => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      authService.setCurrentUser(updatedUser);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isDriver: authService.isDriver(),
        isRider: authService.isRider(),
        login,
        registerTenant,
        registerDriver,
        setUserRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
