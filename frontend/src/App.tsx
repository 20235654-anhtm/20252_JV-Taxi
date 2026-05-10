import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
