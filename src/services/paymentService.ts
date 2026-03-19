import api from './api';
import type { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from '@appTypes/index';

export const paymentService = {

  // Stripe PaymentIntent oluştur
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    const response = await api.post<CreatePaymentIntentResponse>('/api/payments/intent', data);
    return response.data;
  },
};

// ─── Kredi Paketleri (backend'de endpoint yok, frontend'de sabit) ─────────────
export const CREDIT_PACKAGES = [
  { id: 1, name: 'Başlangıç',  creditAmount: 100,  amountCents: 2999,  currency: 'try', isPopular: false },
  { id: 2, name: 'Popüler',    creditAmount: 250,  amountCents: 5999,  currency: 'try', isPopular: true  },
  { id: 3, name: 'Premium',    creditAmount: 600,  amountCents: 11999, currency: 'try', isPopular: false },
  { id: 4, name: 'VIP',        creditAmount: 1500, amountCents: 24999, currency: 'try', isPopular: false },
] as const;

export type CreditPackage = typeof CREDIT_PACKAGES[number];
