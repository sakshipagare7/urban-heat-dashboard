import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HeatMap from './pages/HeatMap';
import Prediction from './pages/Prediction';
import Intervention from './pages/Intervention';
import Recommendations from './pages/Recommendations';
import Analytics from './pages/Analytics';
import Hotspots from './pages/Hotspots';  // ← ADD THIS

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/heatmap" element={<HeatMap />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/intervention" element={<Intervention />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/hotspots" element={<Hotspots />} />  {/* ← ADD THIS */}
          
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

