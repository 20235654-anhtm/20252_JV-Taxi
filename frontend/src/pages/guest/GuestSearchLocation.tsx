import { useLocation } from 'react-router-dom';
import SearchLocationScreen from '../../components/SearchLocation/SearchLocationScreen';

const GuestSearchLocation = () => {
  const location = useLocation();
  const initialSearch = location.state?.initialSearch || '';

  return <SearchLocationScreen isGuest={true} initialSearch={initialSearch} />;
};

export default GuestSearchLocation;
