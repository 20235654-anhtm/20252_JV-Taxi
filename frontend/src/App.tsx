import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ID3 from './id3'; 
import ID4 from './id4';
import PassengerHome from './pages/passenger/PassengerHome';function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Gọi Component bằng tên đã viết hoa */}
        <Route path="/" element={<ID4 />} />
        <Route path="/booking" element={<ID3 />} />
        <Route path="/passenger" element={<PassengerHome />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;