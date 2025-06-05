import React from 'react';
import { motion } from 'framer-motion';
import './TransportLanding.css';
import andarTayoLogo from '../../assets/andarTayo_logo.svg';

const TransportLanding = ({ onModeSelect }) => {
  const transportModes = [
    {
      id: 'edsa-carousel',
      name: 'EDSA Carousel',
      description: 'Bus Rapid Transit System along EDSA',
      icon: '🚌',
      color: '#dc2626',
      stats: {
        stations: '18+ stops',
        length: '23.4 km',
        frequency: '3-5 mins'
      },
      features: ['Dedicated bus lanes', 'Low-floor, all-airconditioned', 'Specified stops with MRT-3 and LRT-1 connections'],
      available: false
    },    {
      id: 'lrt-2',
      name: 'LRT Line 2',
      description: 'Light Rail Transit from Recto to Antipolo',
      icon: '🚇',
      color: '#8E44AD',
      stats: {
        stations: '13 stations',
        length: '13.8 km',
        frequency: '4-8 mins'
      },
      features: ['East to west Mega Manila railway', 'Has connections with MRT-3 and LRT-1', 'The newest and most accessible line among the three'],
      available: true
    },
    {
      id: 'mrt-3',
      name: 'MRT Line 3',
      description: 'Metro Rail Transit from North Avenue to Taft Avenue',
      icon: '🚊',
      color: '#1e40af',
      stats: {
        stations: '13 stations',
        length: '16.9 km',
        frequency: '3-7 mins'
      },      features: ['North to south Metro Manila railway', 'Passes through business districts', 'Has connections with LRT-2, EDSA Carousel, and LRT-1'],
      available: true
    },    {
      id: 'lrt-1',
      name: 'LRT Line 1',
      description: 'Light Rail Transit from Roosevelt to Dr. Santos',
      icon: '🚈',
      color: '#16a34a',
      stats: {
        stations: '25 stations',
        length: '32.4 km',
        frequency: '3-7 mins'
      },      features: ['Oldest line in the Philippines', 'Has connections with LRT-2, EDSA Carousel, PNR, and MRT-3', 'Runs along Manila Bay', 'Cavite Extension Phase 1 opened November 2024'],
      available: true
    }
  ];

  const handleModeClick = (mode) => {
    if (mode.available) {
      onModeSelect(mode.id);
    }
  };

  return (    <div className="transport-landing">
      <div className="landing-header mobile-hidden-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={andarTayoLogo} alt="andarTayo!" className="w-12 h-12" />
            <h1 className="landing-title">
              <span className="andartayo-brand">andarTayo!</span>
            </h1>
          </div>
          <p className="landing-subtitle">
            Your comprehensive guide to Metro Manila's rail and bus transit systems
          </p>
        </motion.div>
      </div>

      <div className="transport-grid">
        {transportModes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`transport-card ${mode.available ? 'available' : 'coming-soon'}`}
            onClick={() => handleModeClick(mode)}
            style={{ '--mode-color': mode.color }}
          >
            <div className="card-header">
              <div className="mode-icon">{mode.icon}</div>
              <div className="mode-info">
                <h3 className="mode-name">{mode.name}</h3>
                <p className="mode-description">{mode.description}</p>
              </div>
            </div>

            <div className="mode-stats">
              <div className="stat-item">
                <span className="stat-label">Stations</span>
                <span className="stat-value">{mode.stats.stations}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Length</span>
                <span className="stat-value">{mode.stats.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Frequency</span>
                <span className="stat-value">{mode.stats.frequency}</span>
              </div>
            </div>            <div className="mode-features">
              <div className="features-header">
                <h4>Information</h4>
                {!mode.available && (
                  <div className="coming-soon-badge">Coming Soon</div>
                )}
              </div>
              <ul>
                {mode.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>{feature}</li>
                ))}
              </ul>
            </div>

            {mode.available && (
              <div className="card-action">
                <span>Create {mode.name} Route →</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>      <div className="landing-footer">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="footer-content"
        >
          <div className="footer-grid">
            <div className="footer-main">
              <p>
                <strong>andarTayo!</strong> provides real-time transit information and route planning 
                for Metro Manila's growing public transportation network.
              </p>
              <div className="feature-highlights">
                <div className="highlight">
                  <span className="highlight-icon">🗺️</span>
                  <span>Interactive route planning</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">⏱️</span>
                  <span>Real-time information</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">💰</span>
                  <span>Fare calculation</span>
                </div>
                <div className="highlight">
                  <span className="highlight-icon">📱</span>
                  <span>Mobile-friendly design</span>
                </div>
              </div>
            </div>
            
            <div className="footer-development">
              <h3 className="development-title">In Development</h3>
              <div className="development-list">
                <div className="development-item">
                  <span className="development-icon">🚌</span>
                  <span>EDSA Carousel BRT</span>
                </div>
                <div className="development-item">
                  <span className="development-icon">🗺️</span>
                  <span>Nearest stop tracking</span>
                </div>
                <div className="development-item">
                  <span className="development-icon">🗺️</span>
                  <span>Multi-modal routing</span>
                </div>
                <div className="development-item">
                  <span className="development-icon">⚡</span>
                  <span>Real-time arrivals</span>
                </div>
                <div className="development-item">
                  <span className="development-icon">🚶‍➡️</span>
                  <span>Commuter volume tracking</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TransportLanding;