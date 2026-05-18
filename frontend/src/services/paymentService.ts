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
    // This is still used for cash or as a fallback
    if (method === 'cash') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            transactionId: `CSH-${Math.floor(Math.random() * 10000)}`
          });
        }, 1000);
      });
    }
    
    // Card payments are now handled by Stripe in the component
    return { success: false, error: 'Please use the Stripe payment form' };
  }
};
