import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  DevicePhoneMobileIcon, 
  ShareIcon,
  PlusIcon,
  ChevronRightIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const MobileInstallInstructions = ({ 
  isVisible, 
  onDismiss, 
  browserType 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isVisible) return null;

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isChrome = /chrome/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);

    if (isIOS && isSafari) {
      return {
        browser: 'Safari',
        os: 'iOS',
        steps: [
          {
            icon: ShareIcon,
            title: 'Tap the Share button',
            description: 'Look for the share icon at the bottom of your screen',
            detail: 'It looks like a square with an arrow pointing up'
          },
          {
            icon: PlusIcon,
            title: 'Select "Add to Home Screen"',
            description: 'Scroll down in the share menu to find this option',
            detail: 'You might need to scroll down to see it'
          },
          {
            icon: DevicePhoneMobileIcon,
            title: 'Tap "Add" to confirm',
            description: 'andarTayo! will be added to your home screen',
            detail: 'You can now access it like any other app'
          }
        ]
      };
    } else if (isAndroid && isChrome) {
      return {
        browser: 'Chrome',
        os: 'Android',
        steps: [
          {
            icon: GlobeAltIcon,
            title: 'Open browser menu',
            description: 'Tap the three dots (⋮) in the top-right corner',
            detail: 'This opens the Chrome menu'
          },
          {
            icon: PlusIcon,
            title: 'Select "Add to Home screen"',
            description: 'Look for this option in the menu',
            detail: 'Chrome will show a popup to confirm'
          },
          {
            icon: DevicePhoneMobileIcon,
            title: 'Tap "Add"',
            description: 'andarTayo! will be installed on your device',
            detail: 'The app icon will appear on your home screen'
          }
        ]
      };
    } else if (isAndroid && isFirefox) {
      return {
        browser: 'Firefox',
        os: 'Android',
        steps: [
          {
            icon: GlobeAltIcon,
            title: 'Open Firefox menu',
            description: 'Tap the three dots (⋮) in the address bar',
            detail: 'This opens the Firefox options'
          },
          {
            icon: PlusIcon,
            title: 'Select "Install"',
            description: 'Look for the install option in the menu',
            detail: 'Firefox may show "Add to Home Screen" instead'
          },
          {
            icon: DevicePhoneMobileIcon,
            title: 'Confirm installation',
            description: 'Tap "Install" or "Add" to confirm',
            detail: 'andarTayo! will be added to your home screen'
          }
        ]
      };
    } else {
      return {
        browser: 'Browser',
        os: 'Mobile',
        steps: [
          {
            icon: GlobeAltIcon,
            title: 'Open browser menu',
            description: 'Look for the menu button (usually three dots or lines)',
            detail: 'This is typically in the top-right corner'
          },
          {
            icon: PlusIcon,
            title: 'Find "Add to Home Screen"',
            description: 'Look for options like "Install", "Add to Home Screen", or "Add to Desktop"',
            detail: 'The exact wording varies by browser'
          },
          {
            icon: DevicePhoneMobileIcon,
            title: 'Confirm installation',
            description: 'Follow your browser\'s prompts to install',
            detail: 'andarTayo! will be available from your home screen'
          }
        ]
      };
    }
  };

  const { browser, os, steps } = getBrowserInstructions();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-t-3xl shadow-2xl w-full max-w-md transform transition-transform duration-300 ease-out max-h-[85vh] overflow-hidden">
        <div className="relative p-6 pb-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-3xl">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close install instructions"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              Install andarTayo!
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" />
              </svg>
            </h3>
            <p className="text-green-100 text-sm leading-relaxed">
              Add to your home screen for the best experience
            </p>
            <div className="mt-2 text-xs text-green-200">
              {browser} on {os}
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center justify-center mb-6">
            {steps.map((_, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index <= currentStep 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-8 h-0.5 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                {React.createElement(steps[currentStep].icon, { className: "w-6 h-6 text-green-600" })}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {steps[currentStep].title}
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">              <p className="text-sm text-gray-700 flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                </svg>
                <span><strong>Tip:</strong> {steps[currentStep].detail}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Got it!
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Why install?</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Faster loading and better performance</li>
              <li>• Works offline when internet is slow</li>
              <li>• Easy access from your home screen</li>
              <li>• Push notifications for service alerts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileInstallInstructions;
