import React, { useState, useEffect } from 'react';
import { 
  MapPin, Thermometer, Droplets, Wind, Search, AlertTriangle, 
  Activity, Building2, Trees, Map, ChevronDown, 
  ArrowRight, X, Plus, TrendingUp, Shield
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Prediction = () => {
  const [location, setLocation] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareLocations, setCompareLocations] = useState([]);
  const [compareResults, setCompareResults] = useState([]);
  const { isDark } = useDarkMode();

  const highDensity = ['bandra', 'colaba', 'bkc', 'lower_parel', 'worli', 'dadar', 'juhu', 'andheri'];
  const mediumDensity = ['malad', 'borivali', 'kandivali', 'goregaon', 'santacruz', 'vile_parle', 'chembur', 'ghatkopar', 'thane', 'navi_mumbai', 'vashi', 'airoli', 'ghansoli', 'kopar_khairane'];
  const lowDensity = ['powai', 'mulund', 'dombivli', 'kalyan'];
  const popularLocations = ['bandra', 'colaba', 'bkc', 'powai', 'andheri', 'worli'];

  useEffect(() => {
    fetchRealData();
    fetchLocations();
  }, []);

  const fetchRealData = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      const data = await response.json();
      setRealTimeData(data);
    } catch (err) {
      console.error('Error fetching real data:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/locations`);
      if (response.ok) {
        const data = await response.json();
        setAvailableLocations(data);
        console.log('📍 Locations loaded:', data.length);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const handlePredict = async (selectedLocation) => {
    const locationToPredict = selectedLocation || location;
    
    if (!locationToPredict) {
      setError('Please select a location');
      return;
    }
    
    setLoading(true);
    setError(null);
    setShowDropdown(false);
    
    try {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      const month = now.getMonth() + 1;
      
      const inputData = {
        location: locationToPredict,
        temperature: realTimeData?.temperature || 27.6,
        humidity: realTimeData?.humidity || 69.7,
        windSpeed: realTimeData?.windSpeed || 3.3,
        hour: hour,
        dayOfWeek: dayOfWeek,
        month: month
      };
      
      const response = await fetch(`${API_URL}/predict/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed');
      }
      
      setPrediction({
        ...data,
        location: locationToPredict,
        timestamp: new Date().toLocaleString()
      });
      setLoading(false);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (compareLocations.length < 2) {
      setError('Please select 2 locations to compare');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = [];
      for (const loc of compareLocations) {
        const now = new Date();
        const inputData = {
          location: loc,
          temperature: realTimeData?.temperature || 27.6,
          humidity: realTimeData?.humidity || 69.7,
          windSpeed: realTimeData?.windSpeed || 3.3,
          hour: now.getHours(),
          dayOfWeek: now.getDay(),
          month: now.getMonth() + 1
        };
        
        const response = await fetch(`${API_URL}/predict/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputData)
        });
        
        const data = await response.json();
        if (response.ok) {
          results.push(data);
        }
      }
      setCompareResults(results);
      setLoading(false);
    } catch (err) {
      console.error('❌ Compare error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleCompareLocation = (locName) => {
    if (compareLocations.includes(locName)) {
      setCompareLocations(compareLocations.filter(l => l !== locName));
    } else if (compareLocations.length < 2) {
      setCompareLocations([...compareLocations, locName]);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'High') return isDark ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-200';
    if (risk === 'Medium') return isDark ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200';
  };

  const getRiskIcon = (risk) => {
    if (risk === 'High') return '🔴';
    if (risk === 'Medium') return '🟡';
    return '🟢';
  };

  const getDensityColor = (locName) => {
    if (highDensity.includes(locName)) return isDark ? 'border-red-800 bg-red-900/20' : 'border-red-200 bg-red-50';
    if (mediumDensity.includes(locName)) return isDark ? 'border-yellow-800 bg-yellow-900/20' : 'border-yellow-200 bg-yellow-50';
    if (lowDensity.includes(locName)) return isDark ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50';
    return isDark ? 'border-dark bg-darkCard' : 'border-gray-200 bg-gray-50';
  };

  const isLocationSelected = (locName) => {
    return compareLocations.includes(locName);
  };

  const renderLocationCard = (loc, index) => {
    const isSelected = isLocationSelected(loc.name.toLowerCase());
    const densityClass = getDensityColor(loc.name.toLowerCase());
    
    return (
      <div
        key={index}
        onClick={() => compareMode ? toggleCompareLocation(loc.name.toLowerCase()) : handlePredict(loc.name)}
        className={`
          p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
          ${isSelected ? 'border-blue-500 bg-blue-500/20 shadow-md' : densityClass}
          ${!compareMode && 'hover:border-blue-300'}
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{loc.name}</p>
            <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>{loc.buildings} buildings</p>
          </div>
          {compareMode && (
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : isDark ? 'border-darkSecondary' : 'border-gray-300'}`}>
              {isSelected && <span className="text-white text-xs">✓</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Heat Stress Prediction</h1>
          <p className={`${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
            {availableLocations.length} locations available • Real data from your trained model
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              if (!compareMode) {
                setCompareLocations([]);
                setCompareResults([]);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors
              ${compareMode ? 'bg-blue-500 text-white' : isDark ? 'bg-darkCard text-darkSecondary hover:bg-darkHover' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <TrendingUp size={16} />
            {compareMode ? 'Exit Compare' : 'Compare'}
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-darkCard border-dark text-darkSecondary' : 'bg-green-50 border-green-200'}`}>
            <Activity className="text-green-500" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>Live Model</span>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-green-400'}`}>|</span>
            <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>26 Locations</span>
          </div>
        </div>
      </div>

      {compareMode && (
        <div className={`rounded-lg p-4 mb-6 flex items-center justify-between ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-center gap-3">
            <TrendingUp className={`${isDark ? 'text-blue-400' : 'text-blue-500'}`} size={20} />
            <div>
              <p className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Compare Mode</p>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                Select 2 locations to compare heat stress
                {compareLocations.length > 0 && ` (${compareLocations.length}/2 selected)`}
              </p>
            </div>
          </div>
          {compareLocations.length === 2 && (
            <button
              onClick={handleCompare}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2
                ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Comparing...' : 'Compare Now'}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      <div className={`rounded-lg shadow-sm p-6 mb-6 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search or select location..."
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDark ? 'bg-dark border-dark text-white placeholder-darkSecondary' : 'bg-white border-gray-300 text-gray-800'}`}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyPress={(e) => e.key === 'Enter' && handlePredict()}
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <ChevronDown size={20} />
            </button>
            
            {showDropdown && availableLocations.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${isDark ? 'bg-darkCard border-dark' : 'bg-white border-gray-200'}`}>
                {availableLocations
                  .filter(loc => loc.name.toLowerCase().includes(location.toLowerCase()))
                  .map((loc, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-3 cursor-pointer border-b last:border-b-0 flex items-center justify-between ${isDark ? 'hover:bg-darkHover border-dark' : 'hover:bg-blue-50 border-gray-100'}`}
                      onClick={() => {
                        setLocation(loc.name);
                        setShowDropdown(false);
                        handlePredict(loc.name);
                      }}
                    >
                      <div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{loc.name}</span>
                        <span className={`text-xs ml-2 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>{loc.description}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-dark text-darkSecondary' : 'bg-gray-100 text-gray-600'}`}>
                        {loc.buildings} buildings
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            onClick={() => handlePredict()}
            disabled={loading || !location}
            className={`
              px-6 py-3 rounded-lg font-medium flex items-center gap-2
              ${loading || !location 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'}
            `}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Predicting...
              </>
            ) : (
              <>
                <Search size={20} />
                Predict
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${isDark ? 'bg-red-900/30 border border-red-700 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>⭐ Popular Locations</span>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>| Quick select</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {availableLocations
            .filter(loc => popularLocations.includes(loc.name.toLowerCase()))
            .map((loc, idx) => (
              <button
                key={idx}
                onClick={() => compareMode ? toggleCompareLocation(loc.name.toLowerCase()) : handlePredict(loc.name)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${isLocationSelected(loc.name.toLowerCase()) 
                    ? 'bg-blue-500 text-white' 
                    : isDark ? 'bg-darkCard text-darkSecondary hover:bg-darkHover' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {loc.name}
              </button>
            ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>📍 All Locations</h3>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>🏙️ High Density</span>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>(8 locations)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableLocations
              .filter(loc => highDensity.includes(loc.name.toLowerCase()))
              .map((loc, idx) => renderLocationCard(loc, idx))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>🌳 Medium Density</span>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>(14 locations)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableLocations
              .filter(loc => mediumDensity.includes(loc.name.toLowerCase()))
              .map((loc, idx) => renderLocationCard(loc, idx))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>🌿 Low Density</span>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>(4 locations)</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableLocations
              .filter(loc => lowDensity.includes(loc.name.toLowerCase()))
              .map((loc, idx) => renderLocationCard(loc, idx))}
          </div>
        </div>
      </div>

      {compareResults.length === 2 && (
        <div className={`rounded-lg shadow-sm p-6 mb-6 border ${isDark ? 'bg-darkCard border-blue-700' : 'bg-white border-blue-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              <TrendingUp size={18} className="text-blue-500" />
              Comparison Results
            </h2>
            <button
              onClick={() => {
                setCompareResults([]);
                setCompareLocations([]);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {compareResults.map((result, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${getRiskColor(result.risk)}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{result.location?.charAt(0).toUpperCase() + result.location?.slice(1)}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(result.risk)}`}>
                    {getRiskIcon(result.risk)} {result.risk}
                  </span>
                </div>
                <p className="text-3xl font-bold text-orange-500">{result.prediction?.toFixed(1)}°C</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <p className={isDark ? 'text-darkSecondary' : 'text-gray-500'}>Buildings</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{result.location_features?.building_count || 'N/A'}</p>
                  </div>
                  <div>
                    <p className={isDark ? 'text-darkSecondary' : 'text-gray-500'}>Green Area</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{result.location_features?.green_area || 'N/A'} km²</p>
                  </div>
                  <div>
                    <p className={isDark ? 'text-darkSecondary' : 'text-gray-500'}>Roads</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{result.location_features?.road_length || 'N/A'} km</p>
                  </div>
                  <div>
                    <p className={isDark ? 'text-darkSecondary' : 'text-gray-500'}>Description</p>
                    <p className={`font-medium text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>{result.location_features?.description || 'Urban area'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {compareResults.length === 2 && (
            <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>📊 Difference</p>
              <p className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>
                {compareResults[0].location} is 
                <span className={`font-bold ${compareResults[0].prediction > compareResults[1].prediction ? 'text-red-500' : 'text-green-500'}`}>
                  {(compareResults[0].prediction - compareResults[1].prediction).toFixed(1)}°C 
                  {compareResults[0].prediction > compareResults[1].prediction ? ' hotter' : ' cooler'}
                </span>
                than {compareResults[1].location}
              </p>
            </div>
          )}
        </div>
      )}

      {prediction && !compareMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-lg shadow-sm p-6 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`font-semibold text-xl ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Results for {prediction.location}
                </h2>
                <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>{prediction.timestamp}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getRiskColor(prediction.risk)}`}>
                {getRiskIcon(prediction.risk)} {prediction.risk} Risk
              </span>
            </div>
            
            {prediction.location_features && (
              <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={18} />
                  <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Urban Features</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`rounded-lg p-2 text-center ${isDark ? 'bg-dark' : 'bg-white'}`}>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{prediction.location_features.building_count}</p>
                    <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Buildings</p>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${isDark ? 'bg-dark' : 'bg-white'}`}>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{prediction.location_features.avg_height}m</p>
                    <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Avg Height</p>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${isDark ? 'bg-dark' : 'bg-white'}`}>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{prediction.location_features.road_length}km</p>
                    <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Roads</p>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${isDark ? 'bg-dark' : 'bg-white'}`}>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{prediction.location_features.green_area}km²</p>
                    <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Green Area</p>
                  </div>
                </div>
                <p className={`text-xs mt-2 text-center ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {prediction.location_features.description}
                </p>
              </div>
            )}
            
            <div className={`border-t pt-4 ${isDark ? 'border-dark' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Heat Stress Index</p>
                  <p className="text-4xl font-bold text-orange-500">{prediction.prediction?.toFixed(1) || 'N/A'}</p>
                  <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>
                    Using {prediction.features_used?.buildingCount || 'N/A'} buildings
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Model Used</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{prediction.model_used || 'ML Model'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-sm p-6 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
            <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>Recommendations</h2>
            <div className="space-y-3">
              {prediction.risk === 'High' && (
                <>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    🚫 Avoid outdoor activities 12-4 PM
                  </div>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-blue-900/30 border-blue-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    💧 Stay hydrated every 20 minutes
                  </div>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    🌳 Seek shade or cooling centers
                  </div>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                    🏠 Use fans or AC if available
                  </div>
                </>
              )}
              {prediction.risk === 'Medium' && (
                <>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                    ⚠️ Limit strenuous outdoor activities
                  </div>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-blue-900/30 border-blue-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    💧 Stay hydrated
                  </div>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    🌳 Take breaks in shaded areas
                  </div>
                </>
              )}
              {prediction.risk === 'Low' && (
                <>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    ✅ Normal outdoor activities safe
                  </div>
                  <div className={`p-3 rounded-lg text-sm border ${isDark ? 'bg-blue-900/30 border-blue-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    💧 Maintain hydration
                  </div>
                </>
              )}
            </div>

            {prediction.location_features && (
              <div className={`mt-4 p-3 rounded-lg border ${isDark ? 'bg-dark border-dark' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-600'}`}>📍 About this area</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                  <Building2 size={12} className="inline mr-1" />
                  {prediction.location_features.building_count} buildings
                </p>
                <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                  <Trees size={12} className="inline mr-1" />
                  {prediction.location_features.green_area}km² green space
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>
                  Based on real OSM data from your model
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Prediction;

