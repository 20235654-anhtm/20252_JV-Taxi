import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { BookingProvider } from './contexts/BookingContext';

function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <AppRoutes />
      </BookingProvider>
    </BrowserRouter>
  );
}

export default App;