import React, { useState, useEffect } from 'react';
import { 
  Trees, Home, Droplets, Building2, Leaf, Activity, 
  AlertTriangle, Sparkles, TrendingDown, BarChart3, History,
  Thermometer, ArrowRight, CheckCircle, XCircle,
  TrendingUp, Zap, Shield, MapPin, Grid3x3
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Intervention = () => {
  const [selectedArea, setSelectedArea] = useState('bkc');
  const [intervention, setIntervention] = useState('waterBodies');
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [locations, setLocations] = useState([]);
  const [history, setHistory] = useState([]);
  const [locationHeatData, setLocationHeatData] = useState({});
  const [showComparison, setShowComparison] = useState(false);
  const [allSimulations, setAllSimulations] = useState([]);
  const { isDark } = useDarkMode();

  useEffect(() => {
    fetchRealData();
    fetchLocations();
  }, []);

  const fetchRealData = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`);
      const data = await response.json();
      setCurrentTemp(data.temperature);
    } catch (err) {
      console.error('Error fetching temp:', err);
      setCurrentTemp(27.6);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/locations`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
        if (data.length > 0) {
          setSelectedArea(data[3]?.name.toLowerCase() || data[0].name.toLowerCase());
        }
        fetchHeatDataForLocations(data);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const fetchHeatDataForLocations = async (locs) => {
    try {
      const heatMap = {};
      for (const loc of locs) {
        try {
          const now = new Date();
          const response = await fetch(`${API_URL}/predict/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: loc.name.toLowerCase(),
              temperature: currentTemp || 27.6,
              humidity: 69.7,
              windSpeed: 3.3,
              hour: now.getHours(),
              dayOfWeek: now.getDay(),
              month: now.getMonth() + 1
            })
          });
          if (response.ok) {
            const data = await response.json();
            heatMap[loc.name.toLowerCase()] = {
              heatStress: data.prediction,
              risk: data.risk,
              buildings: loc.buildings
            };
          }
        } catch (e) {
          console.error(`Error fetching heat for ${loc.name}:`, e);
        }
      }
      setLocationHeatData(heatMap);
    } catch (err) {
      console.error('Error fetching heat data:', err);
    }
  };

  const interventions = [
    { 
      id: 'trees',
      name: 'Tree Plantation',
      icon: Trees,
      color: 'text-green-500',
      bg: isDark ? 'bg-green-900/30' : 'bg-green-50',
      border: isDark ? 'border-green-700' : 'border-green-200',
      description: 'Add 2.0 km² of green space',
      reduction: 2.5,
      cost: '₹50,000',
      emoji: '🌳'
    },
    { 
      id: 'greenRoof',
      name: 'Green Roofs',
      icon: Home,
      color: 'text-emerald-500',
      bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
      border: isDark ? 'border-emerald-700' : 'border-emerald-200',
      description: 'Add 1.5 km² of green roofs',
      reduction: 3.5,
      cost: '₹1,00,000',
      emoji: '🏠'
    },
    { 
      id: 'coolRoofs',
      name: 'Cool Roofs',
      icon: Building2,
      color: 'text-blue-500',
      bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
      border: isDark ? 'border-blue-700' : 'border-blue-200',
      description: 'Reduce heat absorption',
      reduction: 2.0,
      cost: '₹75,000',
      emoji: '🏗️'
    },
    { 
      id: 'waterBodies',
      name: 'Water Bodies',
      icon: Droplets,
      color: 'text-cyan-500',
      bg: isDark ? 'bg-cyan-900/30' : 'bg-cyan-50',
      border: isDark ? 'border-cyan-700' : 'border-cyan-200',
      description: 'Add 3.0 km² of water',
      reduction: 4.0,
      cost: '₹2,00,000',
      emoji: '💧'
    },
    { 
      id: 'urbanParks',
      name: 'Urban Parks',
      icon: Leaf,
      color: 'text-lime-500',
      bg: isDark ? 'bg-lime-900/30' : 'bg-lime-50',
      border: isDark ? 'border-lime-700' : 'border-lime-200',
      description: 'Add 2.5 km² of parks',
      reduction: 3.0,
      cost: '₹1,50,000',
      emoji: '🌿'
    },
  ];

  const getRiskColor = (risk) => {
    if (risk === 'High') return 'bg-red-500';
    if (risk === 'Medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskTextColor = (risk) => {
    if (risk === 'High') return isDark ? 'text-red-400' : 'text-red-600';
    if (risk === 'Medium') return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-green-400' : 'text-green-600';
  };

  const getRiskBgColor = (risk) => {
    if (risk === 'High') return isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200';
    if (risk === 'Medium') return isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
    return isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200';
  };

  const getRiskEmoji = (risk) => {
    if (risk === 'High') return '🔴';
    if (risk === 'Medium') return '🟡';
    return '🟢';
  };

  const runSimulation = async () => {
    if (!selectedArea) {
      setError('Please select an area');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const now = new Date();
      
      const response = await fetch(`${API_URL}/intervention/simulate/ml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedArea,
          intervention: intervention,
          currentTemp: currentTemp || 27.6,
          humidity: 69.7,
          windSpeed: 3.3,
          hour: now.getHours(),
          dayOfWeek: now.getDay(),
          month: now.getMonth() + 1
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Simulation failed');
      }
      
      const data = await response.json();
      console.log('📊 ML Simulation result:', data);
      setSimulation(data);
      
      setHistory(prev => [{
        location: data.location,
        intervention: data.intervention,
        reduction: data.reduction,
        timestamp: new Date().toLocaleString()
      }, ...prev].slice(0, 5));
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const runAllSimulations = async () => {
    setShowComparison(true);
    setAllSimulations([]);
    setLoading(true);
    
    try {
      const results = [];
      for (const interv of interventions) {
        const now = new Date();
        const response = await fetch(`${API_URL}/intervention/simulate/ml`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: selectedArea,
            intervention: interv.id,
            currentTemp: currentTemp || 27.6,
            humidity: 69.7,
            windSpeed: 3.3,
            hour: now.getHours(),
            dayOfWeek: now.getDay(),
            month: now.getMonth() + 1
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          results.push({
            ...data,
            interventionName: interv.name,
            emoji: interv.emoji,
            icon: interv.icon
          });
        }
      }
      setAllSimulations(results);
      setLoading(false);
    } catch (err) {
      console.error('Error running all simulations:', err);
      setLoading(false);
    }
  };

  const getEffectivenessColor = (rating) => {
    if (rating === 'Excellent') return isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100';
    if (rating === 'Good') return isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-100';
    if (rating === 'Moderate') return isDark ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-100';
    return isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-100';
  };

  const getInterventionName = (id) => {
    const found = interventions.find(i => i.id === id);
    return found ? found.name : id;
  };

  const getLocationHeat = (name) => {
    const data = locationHeatData[name?.toLowerCase()];
    if (data) {
      return data;
    }
    return { heatStress: null, risk: 'Low' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>AI Intervention Simulator</h1>
          <p className={`${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
            {locations.length} locations available • Real predictions from your trained model
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-darkCard border-purple-700 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
          <Sparkles className="text-purple-500" size={16} />
          <span className="text-sm font-medium">AI Powered</span>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-purple-400'}`}>|</span>
          <span className="text-xs">ML Model: R² 0.973</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className={isDark ? 'text-darkSecondary' : 'text-gray-500'} size={18} />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>Select Location</span>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>| Click a location to select</span>
          </div>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>{locations.length} locations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {locations.slice(0, 12).map((loc) => {
            const heat = getLocationHeat(loc.name);
            const isSelected = selectedArea === loc.name.toLowerCase();
            return (
              <div
                key={loc.name}
                onClick={() => setSelectedArea(loc.name.toLowerCase())}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                  ${isSelected ? 'border-blue-500 bg-blue-500/20 shadow-md' : isDark ? 'border-dark hover:border-blue-700 bg-darkCard' : 'border-gray-200 hover:border-blue-300'}
                  ${heat.risk ? getRiskBgColor(heat.risk) : isDark ? 'bg-darkCard' : 'bg-gray-50'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-400' : isDark ? 'text-white' : 'text-gray-700'}`}>
                    {loc.name}
                  </span>
                  {isSelected && <CheckCircle size={14} className="text-blue-500" />}
                </div>
                {heat.heatStress !== null ? (
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{heat.heatStress.toFixed(1)}°C</span>
                    <span className="text-xs">{getRiskEmoji(heat.risk)}</span>
                  </div>
                ) : (
                  <div className={`text-xs mt-1 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Loading...</div>
                )}
                <div className={`text-xs mt-0.5 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>{loc.buildings} buildings</div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedArea && (
        <div className={`rounded-lg p-3 mb-6 flex items-center justify-between flex-wrap gap-2 ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-center gap-3">
            <MapPin className={isDark ? 'text-blue-400' : 'text-blue-500'} size={18} />
            <span className={`font-medium capitalize ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{selectedArea}</span>
            {locationHeatData[selectedArea] && (
              <span className={`text-sm font-medium ${getRiskTextColor(locationHeatData[selectedArea].risk)}`}>
                {locationHeatData[selectedArea].heatStress?.toFixed(1)}°C {getRiskEmoji(locationHeatData[selectedArea].risk)}
              </span>
            )}
            <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {locations.find(l => l.name.toLowerCase() === selectedArea)?.buildings || 0} buildings
            </span>
          </div>
          <button
            onClick={runAllSimulations}
            disabled={loading}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Grid3x3 size={14} />
            Compare All Interventions
          </button>
        </div>
      )}

      <div className={`rounded-lg shadow-sm p-6 mb-6 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>📍 Area</label>
            <select 
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-dark border-dark text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              {locations.map(loc => (
                <option key={loc.name} value={loc.name.toLowerCase()}>
                  {loc.name} ({loc.buildings} buildings)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>🌱 Intervention Type</label>
            <select 
              className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-dark border-dark text-white' : 'bg-white border-gray-300 text-gray-800'}`}
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
            >
              {interventions.map(interv => (
                <option key={interv.id} value={interv.id}>{interv.emoji} {interv.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={loading}
              className={`
                w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'}
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Simulating...
                </>
              ) : (
                <>
                  <Activity size={18} />
                  Run AI Simulation
                </>
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/30 border border-red-700 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            ❌ {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {interventions.map((interv) => (
          <div 
            key={interv.id}
            className={`${interv.bg} p-4 rounded-lg border-2 cursor-pointer transition-all
              ${intervention === interv.id ? `${interv.border} border-blue-500 shadow-md` : isDark ? 'border-dark hover:border-gray-600' : 'border-transparent'}`}
            onClick={() => setIntervention(interv.id)}
          >
            <interv.icon className={interv.color} size={24} />
            <p className={`text-sm font-medium mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{interv.emoji} {interv.name}</p>
            <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>{interv.description}</p>
            <p className="text-xs font-medium text-blue-600 mt-1">-{interv.reduction}°C</p>
          </div>
        ))}
      </div>

      <div className={`rounded-lg p-3 mb-6 text-center ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
        <span className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Current temperature: </span>
        <span className="text-lg font-bold text-red-500">{currentTemp?.toFixed(1) || 'N/A'}°C</span>
        <span className={`text-xs ml-2 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>(from your 8,425 records)</span>
      </div>

      {simulation && (
        <div className={`rounded-lg shadow-lg p-6 border ${isDark ? 'bg-darkCard border-blue-700' : 'bg-white border-blue-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              <Sparkles className="text-purple-500" size={20} />
              AI Simulation Results
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                {simulation.model_used}
              </span>
              <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>{simulation.model_accuracy}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-sm ${isDark ? 'text-red-400' : 'text-gray-500'}`}>Current Temperature</p>
              <p className="text-2xl font-bold text-red-500">{simulation.currentTemp}°C</p>
              <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>From your model</p>
            </div>
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-sm ${isDark ? 'text-green-400' : 'text-gray-500'}`}>After {getInterventionName(simulation.intervention)}</p>
              <p className="text-2xl font-bold text-green-500">{simulation.afterIntervention}°C</p>
              <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>ML predicted</p>
            </div>
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-gray-500'}`}>Temperature Reduction</p>
              <p className="text-2xl font-bold text-blue-500">-{simulation.reduction}°C</p>
              <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>AI estimate</p>
            </div>
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-gray-500'}`}>Effectiveness</p>
              <p className={`text-2xl font-bold ${getEffectivenessColor(simulation.effectiveness)} px-3 py-1 rounded-lg inline-block`}>
                {simulation.emoji} {simulation.effectiveness}
              </p>
              <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>{simulation.co2Saved} kg CO₂/year</p>
            </div>
          </div>

          <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>🌡️ Temperature Reduction Visualization</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className={`flex items-center justify-between text-xs mb-1 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                  <span>Before: {simulation.currentTemp}°C</span>
                  <span>After: {simulation.afterIntervention}°C</span>
                  <span className="text-green-600 font-medium">-{simulation.reduction}°C</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-500"
                    style={{ width: `${(simulation.currentTemp / 40) * 100}%` }}
                  />
                  <div 
                    className="bg-green-500 h-full transition-all duration-500"
                    style={{ width: `${(simulation.afterIntervention / 40) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
            <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>📊 What Changed</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-darkCard' : 'bg-white'}`}>
                <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Buildings</p>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{simulation.features_changed?.buildings || 'No change'}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-darkCard' : 'bg-white'}`}>
                <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Green Area</p>
                <p className={`text-sm font-medium text-green-600`}>{simulation.features_changed?.green_area || 'No change'}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-darkCard' : 'bg-white'}`}>
                <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>CO₂ Reduction</p>
                <p className={`text-sm font-medium text-emerald-600`}>{simulation.co2Saved} kg/year</p>
              </div>
            </div>
          </div>

          <div className={`mt-4 p-4 rounded-lg border ${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
            <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              <TrendingDown size={16} />
              <span className="font-medium">AI Recommendation:</span>
              <span>{simulation.detailed_recommendation}</span>
            </p>
            <div className={`flex items-center gap-4 mt-2 text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
              <span>💰 Cost: {simulation.cost}</span>
              <span>📈 ROI: {simulation.roi}</span>
              <span>📍 {simulation.location?.charAt(0).toUpperCase() + simulation.location?.slice(1)}</span>
            </div>
          </div>
        </div>
      )}

      {showComparison && allSimulations.length > 0 && (
        <div className={`mt-6 rounded-lg shadow-lg p-6 border ${isDark ? 'bg-darkCard border-blue-700' : 'bg-white border-blue-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
              <BarChart3 className="text-blue-500" size={20} />
              Intervention Comparison
            </h2>
            <button
              onClick={() => setShowComparison(false)}
              className={`${isDark ? 'text-darkSecondary hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <XCircle size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-dark' : 'border-gray-200'}`}>
                  <th className={`text-left py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Intervention</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Reduction</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>After Temp</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Cost</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>ROI</th>
                  <th className={`text-center py-2 px-3 text-sm font-medium ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {allSimulations
                  .sort((a, b) => b.reduction - a.reduction)
                  .map((sim, index) => (
                    <tr key={index} className={`border-b last:border-b-0 ${isDark ? 'border-dark hover:bg-dark' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className={`py-2 px-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <span className="flex items-center gap-2">
                          <span>{sim.emoji}</span>
                          {sim.interventionName}
                        </span>
                      </td>
                      <td className="text-center py-2 px-3 text-green-600 font-medium">
                        -{sim.reduction}°C
                      </td>
                      <td className={`text-center py-2 px-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {sim.afterIntervention}°C
                      </td>
                      <td className={`text-center py-2 px-3 ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>{sim.cost}</td>
                      <td className={`text-center py-2 px-3 ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>{sim.roi}</td>
                      <td className="text-center py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffectivenessColor(sim.effectiveness)}`}>
                          {sim.emoji} {sim.effectiveness}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className={`mt-6 rounded-lg shadow-sm p-4 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-3">
            <History size={18} className="text-gray-400" />
            <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>Recent Simulations</h3>
          </div>
          <div className="space-y-2">
            {history.map((item, index) => (
              <div key={index} className={`flex items-center justify-between text-sm border-b pb-2 ${isDark ? 'border-dark' : 'border-gray-100'}`}>
                <span className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.location}</span>
                <span className="text-blue-600">{item.intervention}</span>
                <span className="text-green-600">-{item.reduction}°C</span>
                <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>{item.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Intervention;

