import React, { useState, useEffect } from 'react';
import { 
  Scale, MapPin, Thermometer, Droplets, Wind, Building2, 
  Trees, Users, TrendingUp, TrendingDown, Sparkles,
  Activity, ChevronDown, CheckCircle, XCircle
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Compare = () => {
  const [locations, setLocations] = useState([]);
  const [location1, setLocation1] = useState('');
  const [location2, setLocation2] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isDark } = useDarkMode();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/locations`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
        if (data.length >= 2) {
          setLocation1(data[0].name.toLowerCase());
          setLocation2(data[1].name.toLowerCase());
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const handleCompare = async () => {
    if (!location1 || !location2) {
      setError('Please select two locations');
      return;
    }

    if (location1 === location2) {
      setError('Please select two different locations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location1: location1,
          location2: location2
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Comparison failed');
      }

      const data = await response.json();
      setCompareData(data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Compare error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (risk) => {
    if (risk === 'Critical') return isDark ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-200';
    if (risk === 'High') return isDark ? 'bg-orange-900/50 text-orange-400 border-orange-700' : 'bg-orange-100 text-orange-700 border-orange-200';
    if (risk === 'Medium') return isDark ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200';
  };

  const formatLocationName = (name) => {
    const map = {
      'bkc': 'BKC',
      'lower_parel': 'Lower Parel',
      'vile_parle': 'Vile Parle',
      'navi_mumbai': 'Navi Mumbai',
      'kopar_khairane': 'Kopar Khairane'
    };
    return map[name.toLowerCase()] || name;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="text-blue-500" size={28} />
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Compare Locations
            </h1>
          </div>
          <p className={`${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
            Side-by-side comparison of urban heat metrics
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-darkCard border border-dark' : 'bg-gray-100'}`}>
          <Activity className="text-blue-500" size={16} />
          <span className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>
            ML Powered
          </span>
        </div>
      </div>

      {/* Selection Section */}
      <div className={`rounded-lg shadow-sm p-6 mb-6 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              📍 Location 1
            </label>
            <select
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-dark border-dark text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              value={location1}
              onChange={(e) => setLocation1(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc.name} value={loc.name.toLowerCase()}>
                  {formatLocationName(loc.name)} ({loc.buildings} buildings)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              📍 Location 2
            </label>
            <select
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-dark border-dark text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              value={location2}
              onChange={(e) => setLocation2(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc.name} value={loc.name.toLowerCase()}>
                  {formatLocationName(loc.name)} ({loc.buildings} buildings)
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCompare}
            disabled={loading}
            className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Comparing...
              </>
            ) : (
              <>
                <Scale size={18} />
                Compare
              </>
            )}
          </button>
        </div>

        {error && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/30 border border-red-700 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Results */}
      {compareData && (
        <div className="space-y-6">
          {/* Winner Summary */}
          <div className={`rounded-lg p-6 border-2 ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl">🏆</span>
              <div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {compareData.diff_text}
                </p>
                {compareData.winner && (
                  <p className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>
                    {compareData.winner}: {compareData.winner_heat}°C vs {compareData.loser}: {compareData.loser_heat}°C
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className={`rounded-lg shadow-sm overflow-hidden ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      Metric
                    </th>
                    <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      {formatLocationName(compareData.location1.name)}
                    </th>
                    <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      {formatLocationName(compareData.location2.name)}
                    </th>
                    <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Heat Stress */}
                  <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <span className="flex items-center gap-1">🌡️ Heat Stress</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-bold ${compareData.location1.heat_stress > 35 ? 'text-red-500' : compareData.location1.heat_stress > 28 ? 'text-orange-500' : 'text-green-500'}`}>
                        {compareData.location1.heat_stress}°C
                      </span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRiskBadgeColor(compareData.location1.risk)}`}>
                        {compareData.location1.risk_emoji} {compareData.location1.risk}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-bold ${compareData.location2.heat_stress > 35 ? 'text-red-500' : compareData.location2.heat_stress > 28 ? 'text-orange-500' : 'text-green-500'}`}>
                        {compareData.location2.heat_stress}°C
                      </span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRiskBadgeColor(compareData.location2.risk)}`}>
                        {compareData.location2.risk_emoji} {compareData.location2.risk}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-medium ${compareData.difference.heat_stress > 0 ? 'text-red-500' : compareData.difference.heat_stress < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                        {compareData.difference.heat_stress > 0 ? '+' : ''}{compareData.difference.heat_stress}°C
                      </span>
                    </td>
                  </tr>

                  {/* Buildings */}
                  <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <span className="flex items-center gap-1">🏗️ Buildings</span>
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location1.buildings}
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location2.buildings}
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      {compareData.difference.buildings > 0 ? '+' : ''}{compareData.difference.buildings}
                    </td>
                  </tr>

                  {/* NDVI */}
                  <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <span className="flex items-center gap-1">🌿 NDVI (Vegetation)</span>
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location1.ndvi} ({Math.round(compareData.location1.ndvi * 100)}%)
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location2.ndvi} ({Math.round(compareData.location2.ndvi * 100)}%)
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      {compareData.difference.ndvi > 0 ? '+' : ''}{compareData.difference.ndvi}
                    </td>
                  </tr>

                  {/* LST */}
                  <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <span className="flex items-center gap-1">🌡️ LST (Surface Temp)</span>
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location1.lst}°C
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location2.lst}°C
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      {compareData.difference.lst > 0 ? '+' : ''}{compareData.difference.lst}°C
                    </td>
                  </tr>

                  {/* Population Density */}
                  <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <span className="flex items-center gap-1">👥 Population Density</span>
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location1.population_density.toLocaleString()}/km²
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location2.population_density.toLocaleString()}/km²
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      {compareData.difference.population_density > 0 ? '+' : ''}{compareData.difference.population_density.toLocaleString()}
                    </td>
                  </tr>

                  {/* Green Area */}
                  <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <span className="flex items-center gap-1">💚 Green Area</span>
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location1.green_area} km²
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {compareData.location2.green_area} km²
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      {compareData.difference.green_area > 0 ? '+' : ''}{compareData.difference.green_area} km²
                    </td>
                  </tr>

                  {/* Recommendation */}
                  <tr>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      <span className="flex items-center gap-1">💡 Recommendation</span>
                    </td>
                    <td className={`text-center py-3 px-4`}>
                      <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                        {compareData.location1.rec_emoji} {compareData.location1.recommendation}
                      </span>
                    </td>
                    <td className={`text-center py-3 px-4`}>
                      <span className={`text-sm px-3 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                        {compareData.location2.rec_emoji} {compareData.location2.recommendation}
                      </span>
                    </td>
                    <td className={`text-center py-3 px-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      Different approaches
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className={`rounded-lg p-6 border-2 ${isDark ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-purple-500" size={20} />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                🤖 AI Insights
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-purple-800 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                Powered by ML Model
              </span>
            </div>
            <div className="space-y-2">
              {compareData.insights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-dark' : 'bg-white'}`}>
                  <p className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-700'}`}>
                    {insight}
                  </p>
                </div>
              ))}
            </div>
            <p className={`text-xs mt-3 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>
              Based on comparison of {compareData.location1.name} and {compareData.location2.name} • Model accuracy: R² 0.9730
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;

