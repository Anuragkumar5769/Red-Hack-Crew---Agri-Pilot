import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
// import ChatInput from '../components/ChatInput';
import { Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudLightning, CloudFog, LocateIcon } from 'lucide-react';


const API_KEY = 'c10c5c7ffff4be43b5e7b4bea8d85dfb';


const WeatherPage = ({ onNavigate, location, setLocation }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [IsWeather, setIsWeather] = useState(false);



  const fetchWeatherData = async (lat, lon) => {
    try {
      // Reverse geocoding
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
      );

      if (!geoResponse.ok) throw new Error('Failed to get location data');

      const geoData = await geoResponse.json();
      const cityName = geoData[0]?.name || 'Unknown';

      // Current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`
      );

      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        throw new Error(errorData.message || 'Weather data not available');
      }

      const weatherData = await weatherResponse.json();

      // Forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`
      );

      if (!forecastResponse.ok) throw new Error('Failed to get forecast data');

      const forecastData = await forecastResponse.json();

      // Group forecast
      const dailyForecast = {};
      forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toDateString();

        if (!dailyForecast[dateString]) {
          dailyForecast[dateString] = {
            dt: item.dt,
            temp: { max: -Infinity, min: Infinity, day: item.main.temp },
            weather: item.weather,
            pop: 0,
            count: 0
          };
        }

        const dayForecast = dailyForecast[dateString];
        dayForecast.temp.max = Math.max(dayForecast.temp.max, item.main.temp_max);
        dayForecast.temp.min = Math.min(dayForecast.temp.min, item.main.temp_min);
        dayForecast.pop += item.pop || 0;
        dayForecast.count++;
      });

      const dailyForecastArray = Object.values(dailyForecast).map(day => ({
        ...day,
        pop: day.pop / day.count,
        temp: {
          max: Math.round(day.temp.max * 10) / 10,
          min: Math.round(day.temp.min * 10) / 10,
          day: Math.round(day.temp.day * 10) / 10
        }
      }));

      const formattedData = {
        current: {
          ...weatherData.main,
          weather: weatherData.weather,
          wind_speed: weatherData.wind?.speed || 0,
          rain: weatherData.rain || { '1h': 0 },
          dt: weatherData.dt,
          city: cityName
        },
        daily: dailyForecastArray.slice(0, 5)
      };


      setWeatherData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(`Error: ${err.message}. Using sample data.`);

    

      const now = Math.floor(Date.now() / 1000);
      const sampleData = {
        current: {
          temp: 28.5,
          humidity: 65,
          wind_speed: 3.5,
          rain: { '1h': 0 },
          weather: [{ main: 'Clear', id: 800 }],
          dt: now,
          city: "Sample City"
        },
        daily: [
          { dt: now, temp: { max: 32, min: 25, day: 28.5 }, weather: [{ id: 800, main: 'Clear' }], pop: 0.1 },
          { dt: now + 86400, temp: { max: 31, min: 24, day: 27.5 }, weather: [{ id: 801, main: 'Clouds' }], pop: 0.2 },
          { dt: now + (86400 * 2), temp: { max: 30, min: 23, day: 26.5 }, weather: [{ id: 500, main: 'Rain' }], pop: 0.6 },
          { dt: now + (86400 * 3), temp: { max: 29, min: 22, day: 25.5 }, weather: [{ id: 500, main: 'Rain' }], pop: 0.7 },
          { dt: now + (86400 * 4), temp: { max: 30, min: 23, day: 26.5 }, weather: [{ id: 801, main: 'Clouds' }], pop: 0.3 }
        ]
      };

      setWeatherData(sampleData);
      setLoading(false);
    }
  };

  if (IsWeather==false){
    fetchWeatherData(location.lat, location.lon);
    setIsWeather(true);
  }
  // console.log(`Fetching weather data for location: ${location.lat}, ${location.lon}`);

  const getWeatherIcon = (weatherId) => {
    if (!weatherId) return <Sun size={22} />;
    if (weatherId >= 200 && weatherId < 300) return <CloudLightning size={22} />;
    if (weatherId >= 300 && weatherId < 400) return <CloudDrizzle size={22} />;
    if (weatherId >= 500 && weatherId < 600) return <CloudRain size={22} />;
    if (weatherId >= 600 && weatherId < 700) return <CloudSnow size={22} />;
    if (weatherId >= 700 && weatherId < 800) return <CloudFog size={22} />;
    return weatherId === 800 ? <Sun size={22} /> : <Cloud size={22} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pb-24 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 pb-24 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={getLocation}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { current, daily } = weatherData || {};
  const currentWeather = current?.weather?.[0];

  const getDayName = (date, index) => {
    if (index === 0) return "Today";
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header inline */}
      <div className="frost rounded-b-2xl sticky top-0 z-10 px-4 py-3 flex items-center justify-between bg-white shadow">
        <div className="flex items-center gap-2 text-gray-700">
          <LocateIcon size={16} className="text-green-600" />
          <span className="text-sm font-semibold">{current?.city || "Unknown City"}</span>
        </div>
        <span className="text-xs text-gray-500">
          Updated: {new Date(current?.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* Forecast */}
        <div className="rounded-2xl p-6 bg-white/80 backdrop-blur-sm shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-center text-gray-800">
            5-Day Forecast
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {daily?.slice(0, 7).map((day, i) => {
              const date = new Date(day.dt * 1000);
              const dayName = getDayName(date, i);
              const weatherType = day.weather?.[0]?.main?.toLowerCase() || 'clear';

              const weatherStyles = {
                'clear': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                'sunny': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
                'clouds': { bg: 'bg-gray-100', text: 'text-gray-800' },
                'rain': { bg: 'bg-blue-100', text: 'text-blue-800' },
                'snow': { bg: 'bg-blue-50', text: 'text-blue-800' },
                'thunderstorm': { bg: 'bg-indigo-100', text: 'text-indigo-900' },
                'drizzle': { bg: 'bg-blue-50', text: 'text-blue-800' },
                'mist': { bg: 'bg-gray-50', text: 'text-gray-800' },
                'fog': { bg: 'bg-gray-50', text: 'text-gray-800' },
                'haze': { bg: 'bg-gray-50', text: 'text-gray-800' }
              }[weatherType] || { bg: 'bg-gray-100', text: 'text-gray-800' };

              return (
                <div
                  key={i}
                  className={`${weatherStyles.bg} ${weatherStyles.text} rounded-2xl p-4 flex flex-col items-center transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full`}
                >
                  <span className="text-sm font-medium mb-3">{dayName}</span>
                  <div className="my-2 flex-4 flex items-center">
                    {getWeatherIcon(day.weather?.[0]?.id, 36)}
                  </div>
                  <div className="text-xl font-bold my-1">
                    {Math.round(day.temp?.max)}° / {Math.round(day.temp?.min)}°
                  </div>
                  <div className="text-sm font-medium mt-1 opacity-90">
                    {Math.round((day.pop || 0) * 100)}%
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    Precip
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today */}
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Today's Weather
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {currentWeather?.id ? (
                <div className="text-yellow-400">{getWeatherIcon(currentWeather.id)}</div>
              ) : (
                <Sun size={52} className="text-yellow-400" />
              )}
              <p className="text-5xl font-bold ml-3">{Math.round(current?.temp)}°C</p>
              <span className="text-lg ml-2 self-end">
                {currentWeather?.main || 'Clear'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Humidity: {current?.humidity}%</p>
              <p>Rain: {current?.rain ? `${current.rain['1h'] || 0} mm` : '0 mm'}</p>
              <p>Wind: {Math.round(current?.wind_speed * 3.6)} km/h</p>
            </div>
          </div>
        </div>
      </div>

      {/* <ChatInput /> */}
      <Navbar active="weather" onNavigate={onNavigate} />
    </div>
  );
};

export default WeatherPage;