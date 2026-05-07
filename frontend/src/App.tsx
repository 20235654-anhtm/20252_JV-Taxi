import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {/* Router sẽ quyết định component nào được hiển thị dựa trên URL */}
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
