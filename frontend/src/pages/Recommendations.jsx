import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, MapPin, Trees, Building2, Droplets, Leaf, 
  ChevronRight, Activity, Sparkles, TrendingDown,
  Download, FileText, X, CheckCircle
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Recommendations = () => {
  const [selectedArea, setSelectedArea] = useState('bkc');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [locations, setLocations] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const { isDark } = useDarkMode();

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedArea && locations.length > 0) {
      fetchMLRecommendations(selectedArea);
    }
  }, [selectedArea, locations]);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/locations`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
        if (data.length > 0) {
          setSelectedArea(data[3]?.name.toLowerCase() || data[0].name.toLowerCase());
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations');
      setLoading(false);
    }
  };

  const fetchMLRecommendations = async (location) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/recommendations/ml`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ML recommendations');
      }
      
      const data = await response.json();
      console.log('📊 ML Recommendations:', data);
      
      const filtered = data.recommendations?.filter(
        r => r.area?.toLowerCase() === location.toLowerCase()
      ) || [];
      
      setRecommendations(filtered);
      setModelInfo({
        model: data.model_used,
        accuracy: data.model_accuracy,
        total: data.total_recommendations,
        records: data.data_records
      });
      setLoading(false);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedArea) return;
    
    setReportLoading(true);
    setShowReport(true);
    
    try {
      const response = await fetch(`${API_URL}/recommendations/report/${selectedArea}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (err) {
      console.error('❌ Report error:', err);
      setError(err.message);
    }
    setReportLoading(false);
  };

  const downloadPDF = () => {
    if (!reportData) return;
    
    const content = `
================================================================================
                    URBAN HEAT MITIGATION REPORT
================================================================================

Location: ${reportData.location}
Generated: ${reportData.generated_at}
Model Accuracy: ${reportData.model_accuracy}

================================================================================
                    LOCATION SUMMARY
================================================================================

Current Temperature:  ${reportData.current_temp}°C
Buildings:           ${reportData.buildings}
Green Area:          ${reportData.green_area} km²
Roads:               ${reportData.roads} km
Avg Building Height: ${reportData.height} m
Description:         ${reportData.description}

================================================================================
                    RECOMMENDATIONS (Sorted by Impact)
================================================================================

${reportData.recommendations.map((rec, i) => `
${i+1}. ${rec.emoji} ${rec.name}
   ──────────────────────────────────────────────────
   Temperature Reduction:  ${rec.reduction}°C
   Green Area Increase:    ${rec.green_increase} km²
`).join('\n')}

================================================================================
                    DATA SOURCE
================================================================================

Total Records Analyzed:  8,425
Model Type:              Random Forest
Model Accuracy:          R²: 0.9730
Data Source:             ERA5 + OSM + Satellite

================================================================================
                    END OF REPORT
================================================================================
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UHI_Report_${reportData.location}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'Critical') return isDark ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-200';
    if (priority === 'High') return isDark ? 'bg-orange-900/50 text-orange-400 border-orange-700' : 'bg-orange-100 text-orange-700 border-orange-200';
    if (priority === 'Medium') return isDark ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 90) return isDark ? 'text-green-400' : 'text-green-600';
    if (confidence > 80) return isDark ? 'text-blue-400' : 'text-blue-600';
    return isDark ? 'text-yellow-400' : 'text-yellow-600';
  };

  const getRiskEmoji = (priority) => {
    if (priority === 'Critical') return '🔴';
    if (priority === 'High') return '🟠';
    if (priority === 'Medium') return '🟡';
    return '🟢';
  };

  const getIcon = (intervention) => {
    if (intervention?.includes('Tree')) return Trees;
    if (intervention?.includes('Green Roof')) return Building2;
    if (intervention?.includes('Cool Roof')) return Building2;
    if (intervention?.includes('Water')) return Droplets;
    if (intervention?.includes('Park')) return Leaf;
    return Lightbulb;
  };

  const getColor = (intervention) => {
    if (intervention?.includes('Tree')) return isDark ? 'text-green-400 bg-green-900/30' : 'text-green-500 bg-green-50';
    if (intervention?.includes('Green Roof')) return isDark ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-500 bg-emerald-50';
    if (intervention?.includes('Cool Roof')) return isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-500 bg-blue-50';
    if (intervention?.includes('Water')) return isDark ? 'text-cyan-400 bg-cyan-900/30' : 'text-cyan-500 bg-cyan-50';
    if (intervention?.includes('Park')) return isDark ? 'text-lime-400 bg-lime-900/30' : 'text-lime-500 bg-lime-50';
    return isDark ? 'text-purple-400 bg-purple-900/30' : 'text-purple-500 bg-purple-50';
  };

  const getLocationHeat = (locName) => {
    const rec = recommendations.find(r => r.area?.toLowerCase() === locName.toLowerCase());
    return rec?.current_heat_stress || '--';
  };

  const getLocationRisk = (locName) => {
    const rec = recommendations.find(r => r.area?.toLowerCase() === locName.toLowerCase());
    return rec?.priority || 'Low';
  };

  // Helper to format location names
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

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Loading ML-powered recommendations...</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Using your trained model</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <Lightbulb className="text-red-500 mx-auto mb-3" size={48} />
        <h3 className="text-red-700 font-semibold">Error Loading Recommendations</h3>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button 
          onClick={() => fetchMLRecommendations(selectedArea)}
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>AI Recommendations</h1>
          <p className={`${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>
            ML-powered recommendations for urban heat mitigation
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'bg-darkCard border-purple-700 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
          <Sparkles className="text-purple-500" size={16} />
          <span className="text-sm font-medium">ML Powered</span>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-purple-400'}`}>|</span>
          <span className="text-xs">{modelInfo?.model || 'Random Forest'}</span>
          <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓ {modelInfo?.accuracy || 'R²: 0.973'}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className={isDark ? 'text-darkSecondary' : 'text-gray-500'} size={18} />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>Select Location</span>
            <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>| Click a location to view recommendations</span>
          </div>
          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>{locations.length} locations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {locations.map((loc) => {
            const isSelected = selectedArea === loc.name.toLowerCase();
            const heat = getLocationHeat(loc.name);
            const risk = getLocationRisk(loc.name);
            const riskBg = risk === 'Critical' ? (isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200') :
                          risk === 'High' ? (isDark ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200') :
                          risk === 'Medium' ? (isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200') :
                          (isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200');
            
            return (
              <div
                key={loc.name}
                onClick={() => setSelectedArea(loc.name.toLowerCase())}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                  ${isSelected ? 'border-blue-500 bg-blue-500/20 shadow-md' : isDark ? `border-dark ${riskBg}` : `border-gray-200 ${riskBg}`}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-400' : isDark ? 'text-white' : 'text-gray-700'}`}>
                    {formatLocationName(loc.name)}
                  </span>
                  {isSelected && <CheckCircle size={14} className="text-blue-500" />}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {heat !== '--' ? `${heat}°C` : '--'}
                  </span>
                  <span className="text-xs">{getRiskEmoji(risk)}</span>
                </div>
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
            <span className={`font-medium capitalize ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              {formatLocationName(selectedArea)}
            </span>
            <span className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {recommendations.length} recommendations
            </span>
          </div>
          <button
            onClick={generateReport}
            disabled={reportLoading}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={14} />
            {reportLoading ? 'Generating...' : 'Download Report'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className={`rounded-lg shadow-sm p-8 text-center ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
            <p className={isDark ? 'text-darkSecondary' : 'text-gray-500'}>No recommendations found for this area.</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const Icon = getIcon(rec.intervention);
            const colorClass = getColor(rec.intervention);
            const confidenceColor = getConfidenceColor(rec.confidence);
            
            return (
              <div key={rec.id} className={`rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border ${isDark ? 'bg-darkCard border-dark hover:border-gray-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-start gap-4">
                  <div className={`${colorClass} p-3 rounded-lg`}>
                    {Icon && <Icon size={24} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {rec.emoji} {rec.intervention}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {getRiskEmoji(rec.priority)} {rec.priority}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm mt-1 ${isDark ? 'text-darkSecondary' : 'text-gray-600'}`}>{rec.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Area</p>
                        <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          <MapPin size={14} className="text-gray-400" />
                          {formatLocationName(rec.area)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Impact</p>
                        <p className="text-sm font-medium text-green-600">{rec.impact}</p>
                        <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>ML predicted</p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Cost</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{rec.cost}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Timeframe</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{rec.time}</p>
                      </div>
                    </div>

                    {/* Confidence Bar - NEW */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>Confidence</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ width: `${rec.confidence}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${confidenceColor}`}>
                          {rec.confidence}%
                        </span>
                      </div>
                    </div>
                    
                    {rec.explanation && (
                      <div className={`mt-3 p-3 rounded-lg border ${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-100'}`}>
                        <div className="flex items-start gap-2">
                          <Sparkles size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>ML Model Analysis</p>
                            <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{rec.explanation}</p>
                            <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                              <span>🏗️ {rec.features_used?.buildings || 'N/A'} buildings</span>
                              <span>🌿 {rec.features_used?.green_area || 'N/A'}km² green</span>
                              <span>📐 {rec.features_used?.avg_height || 'N/A'}m height</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showReport && reportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-darkCard border border-dark' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <FileText size={24} className="text-blue-500" />
                  Report: {reportData.location}
                </h2>
                <button
                  onClick={() => {
                    setShowReport(false);
                    setReportData(null);
                  }}
                  className={`${isDark ? 'text-darkSecondary hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Generated: {reportData.generated_at}</p>
                  <p className={`text-sm ${isDark ? 'text-darkSecondary' : 'text-gray-500'}`}>Model: {reportData.model_accuracy}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-red-400' : 'text-gray-500'}`}>Current Temp</p>
                    <p className="text-2xl font-bold text-red-500">{reportData.current_temp}°C</p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-gray-500'}`}>Buildings</p>
                    <p className="text-2xl font-bold text-blue-500">{reportData.buildings}</p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-green-400' : 'text-gray-500'}`}>Green Area</p>
                    <p className="text-2xl font-bold text-green-500">{reportData.green_area} km²</p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-cyan-900/30 border border-cyan-700' : 'bg-cyan-50'}`}>
                    <p className={`text-sm ${isDark ? 'text-cyan-400' : 'text-gray-500'}`}>Roads</p>
                    <p className="text-2xl font-bold text-cyan-500">{reportData.roads} km</p>
                  </div>
                </div>
                
                <div>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>Recommendations</h3>
                  <div className="space-y-2">
                    {reportData.recommendations.map((rec, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${isDark ? 'bg-dark border-dark' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{rec.emoji}</span>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{rec.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-green-600 font-medium">-{rec.reduction}°C</span>
                          <span className={`text-xs ${isDark ? 'text-darkSecondary' : 'text-gray-400'}`}>+{rec.green_increase}km² green</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={downloadPDF}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Report (.txt)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`mt-6 p-4 rounded-lg border ${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-blue-500" />
          <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            <span className="font-medium">AI-Powered Recommendations</span>
            <span className={`ml-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
              Generated using your trained ML model with {modelInfo?.accuracy || 'R²: 0.973'} accuracy
            </span>
          </p>
        </div>
        <p className={`text-xs mt-1 ml-7 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
          Each recommendation is based on {modelInfo?.records?.toLocaleString() || '8,425'} urban heat records from Mumbai
        </p>
      </div>
    </div>
  );
};

export default Recommendations;

