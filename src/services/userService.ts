import api from './api';
import type { User, CreditTransaction, PageResponse, PageableParams } from '@appTypes/index';

export const userService = {

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/users/me');
    return response.data;
  },

  async updateMe(data: { email?: string }): Promise<User> {
    const response = await api.put<User>('/api/users/me', data);
    return response.data;
  },

  async getCredits(): Promise<number> {
    const response = await api.get<{ credits: number }>('/api/users/me/credits');
    // API { "credits": 150 } şeklinde döndürüyor
    const data = response.data as any;
    return typeof data === 'object' ? Object.values(data)[0] as number : data;
  },

  async getTransactions(pageable: PageableParams = { page: 0, size: 20 }): Promise<PageResponse<CreditTransaction>> {
    const response = await api.get<PageResponse<CreditTransaction>>(
      '/api/users/me/transactions',
      { params: pageable },
    );
    return response.data;
  },
};
