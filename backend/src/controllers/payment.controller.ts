import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia' as any,
});

export const createPaymentIntent = async (req: Request, res: Response) => {
  const { amount, currency = 'vnd' } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const refundPayment = async (paymentIntentId: string): Promise<any> => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return { success: true, refund };
  } catch (error: any) {
    console.error('Error refunding payment:', error.message);
    return { success: false, error: error.message };
  }
};
