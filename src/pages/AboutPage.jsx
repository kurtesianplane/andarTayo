import React from 'react';
import { motion } from 'framer-motion';
import { Train, Bus, Heart, ExternalLink, Zap, MapPin, Bell, CircleDot } from 'lucide-react';

const transitLines = [
  { 
    id: 'lrt1',
    name: 'LRT-1', 
    subtitle: 'Green Line',
    stations: 25,
    length: '32 km',
    color: 'bg-lrt1',
    bgLight: 'bg-lrt1/10'
  },
  { 
    id: 'lrt2',
    name: 'LRT-2', 
    subtitle: 'Purple Line',
    stations: 13,
    length: '13.8 km',
    color: 'bg-lrt2',
    bgLight: 'bg-lrt2/10'
  },
  { 
    id: 'mrt3',
    name: 'MRT-3', 
    subtitle: 'Blue Line',
    stations: 13,
    length: '16.9 km',
    color: 'bg-mrt3',
    bgLight: 'bg-mrt3/10'
  },
  { 
    id: 'carousel',
    name: 'EDSA Carousel', 
    subtitle: 'BRT',
    stations: 20,
    length: '28 km',
    color: 'bg-carousel',
    bgLight: 'bg-carousel/10',
    isBus: true
  },
];

const features = [
  {
    Icon: MapPin,
    title: 'Smart Trip Planning',
    description: 'Auto-detect your location and plan optimal routes across Metro Manila.'
  },
  {
    Icon: CircleDot,
    title: 'Accurate Fares',
    description: 'Precise fare estimates with SJT, Beep Card, and PWD/Senior discounts.'
  },
  {
    Icon: Bell,
    title: 'Service Alerts',
    description: 'Stay informed about service disruptions and important transit updates.'
  },
  {
    Icon: Train,
    title: 'Train Car Tips',
    description: 'Get suggestions on best train cars for easier exits at your destination.'
  },
];

const techStack = ['React 18', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Lucide Icons', 'PWA'];

const AboutPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 lg:pt-8 lg:pb-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-carousel via-mrt3-accent to-mrt3 text-white text-3xl font-bold shadow-xl shadow-mrt3/20 mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            A
          </motion.div>
          <motion.h1 
            className="text-3xl lg:text-4xl font-bold brand-gradient mb-2"
            {...fadeIn}
          >
            andarTayo!
          </motion.h1>
          <motion.p 
            className="text-zinc-500 dark:text-zinc-400"
            {...fadeIn}
            transition={{ delay: 0.1 }}
          >
            Making Metro Manila transit accessible for everyone
          </motion.p>
        </div>
      </header>

      <div className="px-5">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* About */}
          <motion.section 
            className="transit-card"
            {...fadeIn}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-mrt3-accent" />
              What is andarTayo!?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
              andarTayo! is a mobile-first web app designed to make public transportation in Metro Manila 
              more accessible. We provide real-time transit info, smart route planning, and fare calculations 
              to help Filipino commuters navigate the city with confidence.
            </p>
            <div className="transit-card-flat">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <strong className="text-zinc-800 dark:text-zinc-200">"Andar"</strong> means "to go" in Spanish, 
                reflecting Manila's colonial history, while <strong className="text-zinc-800 dark:text-zinc-200">"Tayo"</strong> means 
                "us" in Filipino — together meaning <em>"Let's go!"</em>
              </p>
            </div>
          </motion.section>

          {/* Features */}
          <motion.section 
            className="transit-card"
            {...fadeIn}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-mrt3" />
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mrt3/10 flex items-center justify-center flex-shrink-0">
                    <feature.Icon className="w-5 h-5 text-mrt3" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Transit Lines */}
          <motion.section 
            className="transit-card"
            {...fadeIn}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Train className="w-5 h-5 text-lrt1" />
              Supported Transit
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {transitLines.map((line) => (
                <div 
                  key={line.id}
                  className={`${line.bgLight} rounded-xl p-4`}
                >
                  <div className={`inline-flex w-10 h-10 rounded-lg ${line.color} items-center justify-center text-white mb-2`}>
                    {line.isBus ? <Bus className="w-5 h-5" /> : <Train className="w-5 h-5" />}
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                    {line.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {line.stations} stations • {line.length}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Credits */}
          <motion.section 
            className="transit-card"
            {...fadeIn}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-carousel" />
              Credits
            </h2>
            <div className="space-y-3">
              <div className="transit-card-flat">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white text-sm">
                      Matthew Gan
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Train car positioning logic
                    </p>
                  </div>
                  <a 
                    href="https://ganmatthew.github.io/train-car-calculator" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </a>
                </div>
              </div>
              <div className="transit-card-flat">
                <h3 className="font-medium text-zinc-900 dark:text-white text-sm mb-1">
                  Transit Data Sources
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  LRMC, LRTA, DOTr, and community contributions
                </p>
              </div>
            </div>
          </motion.section>

          {/* Tech */}
          <motion.section 
            className="transit-card"
            {...fadeIn}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-lrt2" />
                Tech Stack
              </h2>
              <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">v2.0</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div 
            className="text-center py-8"
            {...fadeIn}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex flex-col items-center gap-2 px-5 py-3 bg-gradient-to-r from-mrt3/10 to-lrt1/10 rounded-2xl">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-carousel" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Made with love for Filipino commuters
                </span>
              </div>
              <a 
                href="https://github.com/kurtesianplane" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-mrt3 hover:underline flex items-center gap-1"
              >
                by kurtesianplane
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
