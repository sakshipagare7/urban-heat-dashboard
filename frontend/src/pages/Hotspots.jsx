import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, TrendingUp, TrendingDown, Building2, Trees, 
  Users, Thermometer, ArrowRight, MapPin, Activity,
  ChevronLeft, ChevronRight, Sparkles, Download
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Hotspots = () => {
  const [hotspots, setHotspots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const scrollRef = useRef(null);
  const { isDark } = useDarkMode();

  useEffect(() => {
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/hotspots`);
      if (!response.ok) {
        throw new Error('Failed to fetch hotspots');
      }
      const data = await response.json();
      setHotspots(data.hotspots || []);
      setStats(data.stats);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching hotspots:', err);
      setError(err.message);
      setLoading(false);
    }
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

  const getRiskEmoji = (risk) => {
    if (risk === 'Critical') return '🔴';
    if (risk === 'High') return '🟠';
    if (risk === 'Medium') return '🟡';
    return '🟢';
  };

  const getRiskBadgeColor = (risk) => {
    if (risk === 'Critical') return isDark ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-200';
    if (risk === 'High') return isDark ? 'bg-orange-900/50 text-orange-400 border-orange-700' : 'bg-orange-100 text-orange-700 border-orange-200';
    if (risk === 'Medium') return isDark ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200';
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 220;
      const newIndex = direction === 'left' 
        ? Math.max(0, scrollIndex - 1)
        : Math.min(hotspots.length - 4, scrollIndex + 1);
      setScrollIndex(newIndex);
      scrollRef.current.scrollTo({
        left: newIndex * scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Loading heat hotspots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center rounded-lg ${isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
        <p className={isDark ? 'text-red-400' : 'text-red-700'}>❌ {error}</p>
        <button 
          onClick={fetchHotspots}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const topHotspots = hotspots.slice(0, 10);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={28} />
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Heat Hotspot Ranking
            </h1>
          </div>
          <p className={`${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
            {hotspots.length} locations ranked by heat stress • Updated from your trained model
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-darkCard border border-dark' : 'bg-gray-100'}`}>
          <Sparkles className="text-purple-500" size={16} />
          <span className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>
            R²: 0.9730
          </span>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6`}>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-darkCard border border-dark' : 'bg-white shadow-sm'}`}>
            <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Average Heat</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.average_heat}°C</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-darkCard border border-dark' : 'bg-white shadow-sm'}`}>
            <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Hottest</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.highest} <span className="text-sm text-red-500">{stats.highest_value}°C</span></p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-darkCard border border-dark' : 'bg-white shadow-sm'}`}>
            <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Coolest</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.lowest} <span className="text-sm text-green-500">{stats.lowest_value}°C</span></p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-darkCard border border-dark' : 'bg-white shadow-sm'}`}>
            <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Total Analyzed</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
          </div>
        </div>
      )}

      {/* Top Hotspots - Netflix Style Horizontal Scroll */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            🔥 Top Hotspots
          </h2>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Scroll →</span>
        </div>

        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 pb-4 scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topHotspots.map((item, index) => (
              <div
                key={item.name}
                onClick={() => setSelectedLocation(item.name)}
                className={`flex-shrink-0 w-48 p-4 rounded-xl cursor-pointer transition-all hover:scale-105 border-2
                  ${isDark ? 'bg-darkCard border-dark hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-400'}
                  ${index === 0 ? 'border-yellow-500' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400">#{item.rank}</span>
                  <span className={`text-lg ${index === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                    {index === 0 ? '👑' : ''}
                  </span>
                </div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{formatLocationName(item.name)}</p>
                <p className="text-2xl font-bold text-orange-500">{item.heat_stress}°C</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskBadgeColor(item.risk)}`}>
                  {item.risk_emoji || getRiskEmoji(item.risk)} {item.risk}
                </span>
                <div className="mt-2 text-xs text-gray-400">
                  🏗️ {item.buildings} • 🌿 {item.green_area}km²
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All 26 Locations - Ranked Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            📊 All Locations ({hotspots.length})
          </h2>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Ranked by heat stress</span>
        </div>

        <div className="space-y-4">
          {hotspots.map((item) => (
            <div
              key={item.name}
              className={`rounded-xl p-5 border-2 transition-all hover:shadow-lg
                ${isDark ? 'bg-darkCard border-dark hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-400'}
                ${item.rank <= 5 ? isDark ? 'border-red-700' : 'border-red-200' : ''}
              `}
            >
              {/* Rank and Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold ${item.rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                    #{item.rank}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {formatLocationName(item.name)}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskBadgeColor(item.risk)}`}>
                        {item.risk_emoji || getRiskEmoji(item.risk)} {item.risk}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-500">{item.heat_stress}°C</p>
                  <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Heat Stress</p>
                </div>
              </div>

              {/* Progress Bars - Netflix Style */}
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-lg ${isDark ? 'bg-dark' : 'bg-gray-50'}`}>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Trees size={14} className="text-green-500" />
                      <span className={isDark ? 'text-darkSecondary' : 'text-gray-600'}>Vegetation</span>
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {(item.ndvi * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(0, Math.min(100, item.ndvi * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Building2 size={14} className="text-blue-500" />
                      <span className={isDark ? 'text-darkSecondary' : 'text-gray-600'}>Buildings</span>
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {Math.min(100, (item.buildings / 400 * 100)).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (item.buildings / 400 * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-purple-500" />
                      <span className={isDark ? 'text-darkSecondary' : 'text-gray-600'}>Population</span>
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {Math.min(100, (item.population_density / 25000 * 100)).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (item.population_density / 25000 * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className={isDark ? 'text-darkSecondary' : 'text-gray-500'}>
                    🌡️ LST: {item.lst}°C
                  </span>
                  <span className={isDark ? 'text-darkSecondary' : 'text-gray-500'}>
                    🌿 NDVI: {item.ndvi}
                  </span>
                  <span className={isDark ? 'text-darkSecondary' : 'text-gray-500'}>
                    👥 {item.population_density.toLocaleString()} /km²
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-700' : 'bg-blue-50 text-blue-600'}`}>
                    {item.intervention_emoji} {item.intervention}
                  </span>
                </div>
                <button
                  onClick={() => window.location.href = `/intervention?location=${item.name.toLowerCase()}`}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors
                    ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  Take Action
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={`mt-8 p-4 rounded-lg ${isDark ? 'bg-darkCard border border-dark' : 'bg-gray-100'}`}>
        <p className={`text-center text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
          📊 Based on 8,425 records • Model accuracy: R² 0.9730 • {hotspots.length} locations analyzed
        </p>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Hotspots;

