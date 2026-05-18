import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { LanguageProvider } from './context/LanguageContext';
import { BookingProvider } from './contexts/BookingContext';
import IncomingCallOverlay from './components/features/IncomingCallOverlay';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <BookingProvider>
          <div className="App">
            <AppRoutes />
            {/* Chạy ngầm: kết nối socket + hiện popup khi có cuộc gọi đến */}
            <IncomingCallOverlay />
          </div>
        </BookingProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;