import { api } from '../utils/api';

export interface Tenant {
  id: number;
  name: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

export const tenantService = {
  async registerTenant(payload: {
    name: string;
    contactEmail?: string;
  }): Promise<Tenant> {
    const response = await api.post<Tenant>('/tenants', payload);
    return response.data;
  },

  async getTenant(tenantId: number): Promise<Tenant> {
    const response = await api.get<Tenant>(`/tenants/${tenantId}`);
    return response.data;
  },
};
