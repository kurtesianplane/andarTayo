import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Map, Bell, Newspaper, Info, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import BottomNavBar from './BottomNavBar';

const navItems = [
  { label: 'Plan', path: '/', Icon: Map },
  { label: 'Alerts', path: '/alerts', Icon: Bell },
  { label: 'News', path: '/news', Icon: Newspaper },
  { label: 'About', path: '/about', Icon: Info },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 ${isDarkMode ? 'dark' : ''}`}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          className: 'text-sm font-medium',
          style: {
            background: isDarkMode ? '#27272A' : '#FFFFFF',
            color: isDarkMode ? '#FAFAFA' : '#18181B',
            border: `1px solid ${isDarkMode ? '#3F3F46' : '#E4E4E7'}`,
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-40">
        {/* Logo */}
        <div className="px-6 py-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <img 
              src="/icon-250x250.png" 
              alt="andarTayo!" 
              className="w-10 h-10 rounded-xl shadow-lg shadow-mrt3/20"
            />
            <div>
              <h1 className="text-lg font-bold brand-gradient">andarTayo!</h1>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Metro Manila Transit
              </p>
            </div>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/' && location.pathname === '');
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-mrt3/10 text-mrt3 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <item.Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="desktopNavIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-mrt3"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNavBar />
    </div>
  );
};

export default Layout;
