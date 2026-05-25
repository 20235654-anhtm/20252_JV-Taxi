import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/payments`;

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  maskedCard?: string;
  error?: string;
}

export const paymentService = {
  createPaymentIntent: async (amount: number): Promise<{ clientSecret: string } | { error: string }> => {
    try {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      return await response.json();
    } catch (error: any) {
      return { error: error.message };
    }
  },

  processPayment: async (amount: number, method: 'cash' | 'card'): Promise<PaymentResult> => {
    if (method === 'cash') {
      return { success: true };
    }
    
    // Card payments are now handled by Stripe in the component
    return { success: false, error: 'Please use the Stripe payment form' };
  }
};
