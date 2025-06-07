import React from 'react';
import TransportLanding from '../transport/shared/TransportLanding';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleModeSelect = (modeId) => {
    navigate(`/transport/${modeId}`);
  };

  return <TransportLanding onModeSelect={handleModeSelect} />;
};

export default HomePage;
