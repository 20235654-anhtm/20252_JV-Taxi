import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import BookingConfirmation from './BookingConfirmation';

const stripePromise = loadStripe('pk_test_51TXO0jFRcENrVzgl4iRDc2OZje7C8NXQBTh3Jhx8KqTqRA5CBJ7yfOrctFe4o9jlrZbWQx7SNjJnNoct6F0OI0OR009W08pbJg');

const BookingConfirmationWrapper = () => {
  return (
    <Elements stripe={stripePromise} options={{ locale: 'ja' }}>
      <BookingConfirmation />
    </Elements>
  );
};

export default BookingConfirmationWrapper;
