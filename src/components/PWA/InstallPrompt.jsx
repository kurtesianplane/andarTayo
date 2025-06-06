import React from 'react';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon, 
  DevicePhoneMobileIcon, 
  BoltIcon, 
  WifiIcon, 
  MapPinIcon 
} from '@heroicons/react/24/outline';

const InstallPrompt = ({ 
  onInstall, 
  onDismiss, 
  isVisible, 
  context = 'general',
  userEngagement = {} 
}) => {
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  if (!isVisible || !isMobile()) return null;

  // Contextual messaging based on user behavior
  const getContextualMessage = () => {
    const { routesPlanned = 0, transportsViewed = [] } = userEngagement;
    
    switch (context) {
      case 'route_success':
        return {
          title: "Great route planning! 🚇",
          subtitle: "Install andarTayo! for faster access to your transit planning",
          highlight: "Your routes, instantly available"
        };
      
      case 'multi_transport':
        return {
          title: "Exploring Metro Manila transit? 🌟",
          subtitle: `You've checked ${transportsViewed.length} transport options. Get the app for easier planning!`,
          highlight: "All transport options in one tap"
        };
      
      case 'repeat_visitor':
        return {
          title: "Welcome back! 👋",
          subtitle: `You've planned ${routesPlanned} routes with us. Ready for the full experience?`,
          highlight: "Your favorite planner, now as an app"
        };
      
      case 'extended_session':
        return {
          title: "Loving the planning experience? ❤️",
          subtitle: "Install andarTayo! for instant access and offline maps",
          highlight: "Never lose your route plans"
        };
      
      default:
        return {
          title: "Install andarTayo! ⚡",
          subtitle: "Get faster access to Metro Manila's best transit planner",
          highlight: "Smart transit planning, made mobile"
        };
    }
  };

  const { title, subtitle, highlight } = getContextualMessage();
  const benefits = [
    { icon: BoltIcon, text: "Instant access - no browser needed" },
    { icon: WifiIcon, text: "Works offline with cached routes" },
    { icon: MapPinIcon, text: "Quick route planning on-the-go" },
    { icon: DevicePhoneMobileIcon, text: "Native mobile experience" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-3xl sm:rounded-t-2xl">          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close install prompt"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-blue-100 text-sm leading-relaxed">{subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Highlight benefit */}          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <ArrowDownTrayIcon className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{highlight}</h4>
                <p className="text-gray-600 text-xs mt-1">Join thousands of Metro Manila commuters</p>
              </div>
            </div>
          </div>          {/* Benefits list */}
          <div className="space-y-3 mb-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="text-gray-600 w-4 h-4" />
                </div>
                <span className="text-gray-700 text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">            <button
              onClick={onInstall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Install App
            </button>
            
            <button
              onClick={onDismiss}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 transition-colors duration-200"
            >
              Maybe later
            </button>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
            Free, secure, and works offline. No personal data required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
