import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import RtPrediction from './pages/RtPrediction';
import MortalityPrediction from './pages/MortalityPrediction';
import SpreadPrediction from './pages/SpreadPrediction';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predictions/rt" element={<RtPrediction />} />
          <Route path="/about" element={<About />} />
          {/* Routes pour les autres prédictions - à développer */}
          <Route path="/predictions/mortality" element={<MortalityPrediction />} />
          <Route path="/predictions/spread" element={<SpreadPrediction />} />
          {/* Route 404 */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h1>404 - Page non trouvée</h1>
              <p>La page que vous cherchez n'existe pas.</p>
              <a href="/" style={{ color: '#3498db' }}>Retour au Dashboard</a>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
