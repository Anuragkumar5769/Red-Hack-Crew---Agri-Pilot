import { useState, useEffect } from 'react'
import LoginPage from './pages/Login'
import SignupPage from './pages/SignupPage'
import LanguageSelector from './pages/LanguageSelector'
import WeatherPage from './pages/WeatherPage'
import MarketPricesPage from './pages/MarketPricesPage'
import AIAgentPage from './pages/AIAgentPage'
import GovernmentSchemePage from './pages/GovernmentSchemePage'
import UserInfoPage from './pages/UserInfoPage'

const App = () => {  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stage, setStage] = useState('login')
  const [page, setPage] = useState('ai')
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setStage('language'); // or whatever your main app stage is
    }
  }, []);
  if (stage === 'login') {
    return <LoginPage
      onContinue={() => {
        setIsAuthenticated(true);
        setStage('language');
      }}
      onSwitchToSignup={() => setStage('signup')}
    />
  }

  if (stage === 'signup') {
    return <SignupPage
      onContinue={() => {
        setIsAuthenticated(true);
        setStage('language');
      }}
      onSwitchToLogin={() => setStage('login')}
    />
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          // fetchWeatherData(latitude, longitude);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to retrieve your location. Using default location.');
          // fetchWeatherData(28.6139, 77.2090); // Default New Delhi
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Using default location.');
      // fetchWeatherData(28.6139, 77.2090);
    }
  };

  if (stage === 'language') {
    // return <LanguageSelector onNext={() => setStage('app')} />
    getLocation();
  }

  switch (page) {
    case 'weather': return <WeatherPage onNavigate={setPage} location={location}
      setLocation={setLocation} />
    case 'market': return <MarketPricesPage onNavigate={setPage} />
    case 'ai': return <AIAgentPage onNavigate={setPage} location={location}
      setLocation={setLocation} />
    case 'schemes': return <GovernmentSchemePage onNavigate={setPage} />
    case 'profile': return <UserInfoPage onNavigate={setPage} />
    default: return <WeatherPage onNavigate={setPage} />
  }
}

export default App