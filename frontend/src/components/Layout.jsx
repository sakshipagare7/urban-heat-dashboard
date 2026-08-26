import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  TrendingUp, 
  Trees, 
  Lightbulb, 
  BarChart3,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
  Activity,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch(`${API_URL}/weather/current`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
        console.log('🌤️ Sidebar weather updated:', data.temperature);
      }
      setWeatherLoading(false);
    } catch (err) {
      console.error('Error fetching sidebar weather:', err);
      setWeatherLoading(false);
    }
  };

  const getWeatherIcon = (iconCode) => {
    if (!iconCode) return <Sun className="text-yellow-500" size={16} />;
    if (iconCode.includes('01')) return <Sun className="text-yellow-500" size={16} />;
    if (iconCode.includes('02') || iconCode.includes('03')) return <Cloud className="text-gray-400" size={16} />;
    if (iconCode.includes('04')) return <Cloud className="text-gray-500" size={16} />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="text-blue-400" size={16} />;
    if (iconCode.includes('11')) return <CloudLightning className="text-yellow-400" size={16} />;
    if (iconCode.includes('13')) return <CloudSnow className="text-blue-200" size={16} />;
    if (iconCode.includes('50')) return <CloudFog className="text-gray-300" size={16} />;
    return <Sun className="text-yellow-500" size={16} />;
  };

    const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/heatmap', icon: MapPin, label: 'Heat Map' },
    { path: '/prediction', icon: TrendingUp, label: 'Prediction' },
    { path: '/intervention', icon: Trees, label: 'Intervention' },
    { path: '/hotspots', icon: Flame, label: 'Heat Hotspot' },  // ← ADD THIS
    { path: '/recommendations', icon: Lightbulb, label: 'Recommendations' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
      <header className={`lg:hidden ${isDark ? 'bg-darkCard border-b border-dark' : 'bg-white shadow-sm'} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Sun className="text-orange-500" size={24} />
          <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>UrbanHeat AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${isDark ? 'bg-darkHover text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} className={isDark ? 'text-white' : 'text-gray-800'} /> : <Menu size={24} className={isDark ? 'text-white' : 'text-gray-800'} />}
          </button>
        </div>
      </header>

      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${isDark ? 'bg-darkCard border-r border-dark' : 'bg-white'}
      `}>
        <div className={`p-4 border-b ${isDark ? 'border-dark' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Sun className="text-orange-500" size={28} />
            <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>UrbanHeat AI</span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Urban Heat Mitigation System</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? isDark ? 'bg-darkHover text-blue-400' : 'bg-blue-50 text-blue-600'
                    : isDark ? 'text-darkSecondary hover:bg-darkHover hover:text-white' : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`absolute bottom-0 w-full p-4 border-t ${isDark ? 'border-dark bg-dark' : 'border-gray-200 bg-gray-50'}`}>
          {/* Live Weather - Always shows "Mumbai, India" */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Activity className="text-green-500" size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div>
              <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                {weatherLoading ? 'Loading...' : 'Mumbai, India'}  {/* ← ALWAYS "Mumbai, India" */}
              </p>
              <div className="flex items-center gap-2">
                {weather && !weatherLoading ? (
                  <>
                    {weather.icon ? (
                      <img 
                        src={`https://openweathermap.org/img/w/${weather.icon}.png`} 
                        alt={weather.description}
                        className="w-6 h-6"
                      />
                    ) : (
                      getWeatherIcon(weather.icon)
                    )}
                    <span className={`text-xs font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                      {weather.temperature?.toFixed(1)}°C
                    </span>
                    <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>|</span>
                    <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      💧 {weather.humidity}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`text-xs font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>--°C</span>
                    <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>|</span>
                    <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Loading...</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark 
                ? 'bg-darkHover text-yellow-400 hover:bg-opacity-80' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      <main className={`lg:ml-64 p-4 md:p-6 min-h-screen ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

