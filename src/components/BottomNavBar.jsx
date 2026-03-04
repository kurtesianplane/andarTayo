import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Bell, Newspaper, Info, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const navItems = [
  { label: 'Plan', path: '/', Icon: Map },
  { label: 'Alerts', path: '/alerts', Icon: Bell },
  { label: 'News', path: '/news', Icon: Newspaper },
  { label: 'About', path: '/about', Icon: Info },
];

const BottomNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <nav className="bottom-nav lg:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
          (item.path === '/' && location.pathname === '');
        
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <item.Icon className="icon" />
            <span className="label">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="navIndicator"
                className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-mrt3"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
      
      <button
        onClick={toggleDarkMode}
        className="nav-item"
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Sun className="icon" /> : <Moon className="icon" />}
        <span className="label">{isDarkMode ? 'Light' : 'Dark'}</span>
      </button>
    </nav>
  );
};

export default BottomNavBar;
