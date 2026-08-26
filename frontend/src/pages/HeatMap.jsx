import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Activity, AlertTriangle, Satellite } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { useDarkMode } from '../context/DarkModeContext';

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const HeatMap = () => {
  const [heatPoints, setHeatPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useDarkMode();

  useEffect(() => {
    fetchSatelliteData();
  }, []);

  const fetchSatelliteData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching satellite heat map data...');
      const response = await fetch(`${API_URL}/heatmap/satellite`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Satellite data received:', data.length, 'points');
      setHeatPoints(data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getColor = (intensity) => {
    if (intensity > 75) return '#ef4444';
    if (intensity > 50) return '#f59e0b';
    if (intensity > 25) return '#eab308';
    return '#22c55e';
  };

  const getRadius = (intensity) => {
    return 8 + (intensity / 4);
  };

  const mapCenter = [19.0760, 72.8777];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Loading satellite heat map data...</p>
          <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>298 points from satellite imagery</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="text-red-500 mx-auto mb-3" size={48} />
        <h3 className="text-red-700 font-semibold">Error Loading Heat Map</h3>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button 
          onClick={fetchSatelliteData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Heat Map</h1>
          <p className={`${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
            {heatPoints.length} satellite-based UHI points across Mumbai
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-darkHover border border-dark' : 'bg-purple-50'}`}>
          <Satellite className="text-purple-500" size={16} />
          <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>Satellite Data</span>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-purple-400'}`}>|</span>
          <span className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{heatPoints.length} points</span>
        </div>
      </div>

      <div className={`rounded-lg shadow-sm p-4 ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
        <div className="h-[600px] rounded-lg overflow-hidden relative">
          <MapContainer
            center={mapCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {heatPoints.map((point, index) => (
              <CircleMarker
                key={index}
                center={[point.lat, point.lng]}
                radius={getRadius(point.intensity || 50)}
                fillColor={getColor(point.intensity || 50)}
                color="#fff"
                weight={1.5}
                opacity={1}
                fillOpacity={0.7}
              >
                <Popup>
                  <div className="p-2 min-w-[180px]">
                    <p className="font-semibold text-lg">UHI Point</p>
                    <div className="space-y-1 mt-2">
                      <p className="text-sm flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium">{point.lat.toFixed(4)}, {point.lng.toFixed(4)}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span>Satellite Value:</span>
                        <span className="font-medium">{point.satellite_value?.toFixed(3) || 'N/A'}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span>Heat Intensity:</span>
                        <span className="font-medium">{point.intensity?.toFixed(0) || 'N/A'}%</span>
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-400">Satellite-derived UHI data</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>Low (&lt;25)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>Medium (25-50)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>High (50-75)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>Critical (&gt;75)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;

