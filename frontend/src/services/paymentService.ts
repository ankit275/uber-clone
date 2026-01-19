import { api } from '../utils/api';

export interface Payment {
  id: number;
  rideId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export const paymentService = {
  async createPayment(payload: {
    rideId: number;
    paymentMethod: string;
    idempotencyKey?: string;
  }): Promise<Payment> {
    const response = await api.post<Payment>('/payments', payload);
    return response.data;
  },

  async getPayment(paymentId: number): Promise<Payment> {
    const response = await api.get<Payment>(`/payments/${paymentId}`);
    return response.data;
  },
};
