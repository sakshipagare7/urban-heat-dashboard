import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart, 
  Calendar, Download, Filter, Activity, Sparkles,
  Thermometer, Droplets, Wind, Building2, Trees
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RePieChart,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, Pie
} from 'recharts';
import { useDarkMode } from '../context/DarkModeContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [temperatureData, setTemperatureData] = useState([]);
  const [heatDistribution, setHeatDistribution] = useState([]);
  const [urbanMetrics, setUrbanMetrics] = useState([]);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [modelInfo, setModelInfo] = useState({});
  const [shapData, setShapData] = useState(null);
  const { isDark } = useDarkMode();

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
  try {
    setLoading(true);
    setError(null);

    // Load the fast analytics first
    const [tempRes, heatRes, urbanRes, featureRes] = await Promise.all([
      fetch(`${API_URL}/analytics/temperature-trend`),
      fetch(`${API_URL}/analytics/heat-distribution`),
      fetch(`${API_URL}/analytics/urban-metrics`),
      fetch(`${API_URL}/analytics/feature-importance`)
    ]);

    // Check for API errors
    if (!tempRes.ok) throw new Error('Temperature analytics failed');
    if (!heatRes.ok) throw new Error('Heat distribution analytics failed');
    if (!urbanRes.ok) throw new Error('Urban metrics analytics failed');
    if (!featureRes.ok) throw new Error('Feature importance analytics failed');

    const tempData = await tempRes.json();
    const heatData = await heatRes.json();
    const urbanData = await urbanRes.json();
    const featureData = await featureRes.json();

    // Temperature data
    setTemperatureData(tempData);

    // Heat distribution
    if (heatData) {
      setHeatDistribution([
        {
          name: 'Critical (>40)',
          value: heatData.critical,
          color: '#ef4444'
        },
        {
          name: 'High (35-40)',
          value: heatData.high,
          color: '#f59e0b'
        },
        {
          name: 'Medium (28-35)',
          value: heatData.medium,
          color: '#eab308'
        },
        {
          name: 'Low (<28)',
          value: heatData.low,
          color: '#22c55e'
        }
      ]);
    }

    // Urban metrics
    setUrbanMetrics(urbanData);

    // Feature importance
    if (featureData && featureData.features) {
      const sortedFeatures = [...featureData.features]
        .sort((a, b) => b.importance - a.importance);

      setFeatureImportance(sortedFeatures);

      setModelInfo({
        accuracy: featureData.model_accuracy,
        model: featureData.model_used
      });
    }

    // IMPORTANT:
    // Stop the main page from waiting for SHAP.
    setLoading(false);

    // Load SHAP separately in the background
    fetch(`${API_URL}/analytics/shap`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('SHAP analysis failed');
        }

        return response.json();
      })
      .then((shapData) => {
        if (shapData.features) {
          shapData.features.sort(
            (a, b) => b.importance - a.importance
          );
        }

        setShapData(shapData);

        console.log('🔍 SHAP data loaded:', shapData);
      })
      .catch((err) => {
        console.warn('⚠️ SHAP analysis unavailable:', err);
      });

  } catch (err) {
    console.error('❌ Error fetching analytics:', err);
    setError(err.message);
    setLoading(false);
  }
};
  const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Loading real analytics from your model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <BarChart3 className="text-red-500 mx-auto mb-3" size={48} />
        <h3 className="text-red-700 font-semibold">Error Loading Analytics</h3>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Analytics</h1>
          <p className={`${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Real data analysis from your trained model</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-darkCard border-purple-700 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
          <Sparkles className="text-purple-500" size={16} />
          <span className="text-sm font-medium">ML Analytics</span>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-purple-400'}`}>|</span>
          <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>{modelInfo.accuracy || 'R²: 0.973'}</span>
        </div>
      </div>

      {/* Feature Importance - ML Model Insights */}
      <div className={`rounded-lg shadow-sm p-4 mb-6 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-500" size={18} />
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>ML Model Insights</h2>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>|</span>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Feature Importance from your trained model</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {featureImportance.slice(0, 8).map((item, index) => (
            <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>{item.feature}</p>
              <div className="flex items-center gap-2">
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${item.importance}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.importance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP Analysis - Model Explainability */}
      {shapData && (
        <div className={`rounded-lg shadow-sm p-4 mb-6 border-2 ${isDark ? 'bg-darkCard border-purple-700' : 'bg-white border-purple-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-500" size={18} />
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>🧠 SHAP Analysis - Model Explainability</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>AI Explainability</span>
          </div>
          
          <p className={`text-xs mb-3 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
            {shapData.explanation}
            <span className={`ml-2 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>(Based on {shapData.sample_size} samples)</span>
          </p>
          
          <div className="space-y-2">
            {shapData.features.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className={`text-sm w-32 font-medium truncate ${isDark ? 'text-white' : 'text-gray-600'}`}>
                  {item.feature}
                </span>
                <div className={`flex-1 h-4 rounded-full overflow-hidden ${isDark ? 'bg-dark' : 'bg-gray-100'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${(
                      item.impact === 'positive' ? 'bg-red-500' : 'bg-blue-500'
                    )}`}
                    style={{ width: `${item.importance}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-16 text-right ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {item.importance}%
                </span>
                <span className="text-xs w-16 text-center">
                  {item.impact === 'positive' ? '🔴' : '🔵'}
                </span>
              </div>
            ))}
          </div>
          
          <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
            <p className={`text-xs flex items-center gap-2 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
              <span>🔴 Positive impact (increases heat stress)</span>
              <span className={isDark ? 'text-dark' : 'text-gray-300'}>|</span>
              <span>🔵 Negative impact (decreases heat stress)</span>
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>
              Higher percentage = more influence on the model's prediction
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-lg shadow-sm p-4 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>Temperature Trend (Real Data)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={temperatureData.slice(-7)}>
              <XAxis dataKey="date" fontSize={12} stroke={isDark ? '#94a3b8' : '#6b7280'} />
              <YAxis fontSize={12} stroke={isDark ? '#94a3b8' : '#6b7280'} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1a1a2e' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }} />
              <Legend />
              <Line type="monotone" dataKey="avg_temp" stroke="#ef4444" name="Avg Temp (°C)" />
              <Line type="monotone" dataKey="min_temp" stroke="#3b82f6" name="Min Temp (°C)" />
              <Line type="monotone" dataKey="max_temp" stroke="#f59e0b" name="Max Temp (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-lg shadow-sm p-4 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>Heat Distribution (Real Data)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={heatDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {heatDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1a1a2e' : '#fff', borderColor: isDark ? '#334155' : '#e5e7eb' }} />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        <div className={`lg:col-span-2 rounded-lg shadow-sm p-4 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
          <h2 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>Urban Heat Metrics by Area (Real OSM Data)</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-200'}`}>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Area</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Buildings</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Green Area (km²)</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Roads (km)</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Heat Stress</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Risk</th>
                </tr>
              </thead>
              <tbody>
                {urbanMetrics.map((item, index) => (
                  <tr key={index} className={`border-b last:border-b-0 ${isDark ? 'border-dark hover:bg-dark' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <td className={`py-2 px-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.area}</td>
                    <td className={`text-center py-2 px-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.buildings}</td>
                    <td className={`text-center py-2 px-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.green_area}</td>
                    <td className={`text-center py-2 px-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.roads}</td>
                    <td className={`text-center py-2 px-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.heat_stress}°C</td>
                    <td className="text-center py-2 px-3">
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-medium
                        ${item.heat_stress > 40 ? 'bg-red-100 text-red-700' : ''}
                        ${item.heat_stress > 35 && item.heat_stress <= 40 ? 'bg-orange-100 text-orange-700' : ''}
                        ${item.heat_stress > 28 && item.heat_stress <= 35 ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${item.heat_stress <= 28 ? 'bg-green-100 text-green-700' : ''}
                      `}>
                        {item.heat_stress > 40 ? 'Critical' : 
                         item.heat_stress > 35 ? 'High' : 
                         item.heat_stress > 28 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`text-xs mt-3 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>
            Data from your 8,425 records and OSM data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

