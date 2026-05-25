import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import BookingConfirmation from './BookingConfirmation';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error('FATAL: VITE_STRIPE_PUBLISHABLE_KEY is not set in .env file. Stripe payments will not work.');
}
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const BookingConfirmationWrapper = () => {
  return (
    <Elements stripe={stripePromise} options={{ locale: 'ja' }}>
      <BookingConfirmation />
    </Elements>
  );
};

export default BookingConfirmationWrapper;
