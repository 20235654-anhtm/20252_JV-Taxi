import { useLocation } from 'react-router-dom';
import SearchLocationScreen from '../../components/SearchLocation/SearchLocationScreen';

const SearchLocation = () => {
  const location = useLocation();
  const initialSearch = location.state?.initialSearch || '';

  return <SearchLocationScreen initialSearch={initialSearch} />;
};

export default SearchLocation;
