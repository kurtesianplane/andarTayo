import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  MapPinIcon,
  CurrencyDollarIcon,
  BellIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  Cog8ToothIcon,
  KeyIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  UserGroupIcon,
  SignalIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Import data files
import stopsData from '../transport/edsa-carousel/data/stops.json';
import fareData from '../transport/edsa-carousel/data/fareMatrix.json';
import { useAlerts } from '../context/AlertContext';

const springTransition = {
  type: "spring",
  damping: 25,
  stiffness: 300,
};

export default function AdminPanel({ onExit, initialAdminCode = '12345', onAdminCodeChange }) {
  const [activeTab, setActiveTab] = useState('stops');
  const [adminCode, setAdminCode] = useState(initialAdminCode);
  const [newAdminCode, setNewAdminCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const { alerts, updateAlerts } = useAlerts();
  
  const [stops, setStops] = useState(stopsData);
  const [fares, setFares] = useState(fareData);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStop, setEditingStop] = useState(null);
  const [editingAlert, setEditingAlert] = useState(null);
  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [isStopDropdownOpen, setIsStopDropdownOpen] = useState(false);
  const [stopForm, setStopForm] = useState({
    stop_id: '',
    name: '',
    lat: '',
    lng: '',
    sequence: '',
    direction: 'both',
    features: [],
    connections: { 
      rail: null, 
      terminal: null,
      type: 'curbside' // curbside, median, terminal
    },
    accessibility: {
      escalators: false,
      footbridge: false,
      wheelchair_accessible: false,
      tactile_paving: false
    },
    infrastructure: {
      covered_waiting_area: false,
      cctv: false,
      lighting: false,
      benches: false,
      digital_display: false
    },
    google_maps_link: ''
  });
  const [alertForm, setAlertForm] = useState({
    id: '',
    title: '',
    message: '',
    type: 'construction', // construction, closure, delay
    affected_stops: [],
    disable_stops: false,
    start_date: '',
    end_date: ''
  });
  // Advanced stop management states
  const [stopStats, setStopStats] = useState({});
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([
    {
      id: 'maint_001',
      type: 'Routine Inspection',
      stop_id: 'monumento',
      stop_name: 'Monumento Station',
      scheduled_date: '2024-01-15T09:00:00',
      duration: 2,
      status: 'scheduled',
      description: 'Monthly safety and cleanliness inspection'
    },
    {
      id: 'maint_002',
      type: 'Equipment Repair',
      stop_id: 'balintawak',
      stop_name: 'Balintawak',
      scheduled_date: '2024-01-10T14:00:00',
      duration: 4,
      status: 'active',
      description: 'Repair ticket vending machine'
    },
    {
      id: 'maint_003',
      type: 'Station Cleaning',
      stop_id: 'roosevelt',
      stop_name: 'Roosevelt',
      scheduled_date: '2024-01-08T06:00:00',
      duration: 1.5,
      status: 'completed',
      description: 'Deep cleaning and sanitization'
    }
  ]);
  const [stopOperatingHours, setStopOperatingHours] = useState({
    'monumento': { start: '4:30', end: '23:30' },
    'balintawak': { start: '5:00', end: '23:00' },
    'roosevelt': { start: '5:00', end: '23:00' },
    'quezon_ave': { start: '5:00', end: '23:00' },
    'kamuning': { start: '5:00', end: '23:00' }
  });
  const [bulkOperationMode, setBulkOperationMode] = useState(false);
  const [selectedStops, setSelectedStops] = useState([]);
  const [showStopAnalytics, setShowStopAnalytics] = useState(false);
  const [showMaintenancePanel, setShowMaintenancePanel] = useState(false);
  
  // Stop template form
  const [stopTemplate, setStopTemplate] = useState({
    name: '',
    type: 'standard', // standard, terminal, interchange
    features: [],
    defaultOperatingHours: { start: '05:00', end: '23:00' },
    capacity: 100
  });

  // Update admin code in parent component when it changes
  useEffect(() => {
    if (onAdminCodeChange && adminCode !== initialAdminCode) {
      onAdminCodeChange(adminCode);
    }
  }, [adminCode, initialAdminCode, onAdminCodeChange]);

  // Save functions (simulate API calls)
  const saveStops = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll just show a success message
      toast.success('Stops saved successfully!');
      console.log('Saved stops:', stops);
    } catch (error) {
      toast.error('Failed to save stops');
      console.error('Save error:', error);
    }
  };

  const saveAlerts = async () => {
    try {
      // In a real app, this would be an API call
      toast.success('Alerts saved successfully!');
      console.log('Saved alerts:', alerts);
    } catch (error) {
      toast.error('Failed to save alerts');
      console.error('Save error:', error);
    }
  };

  const saveFares = async () => {
    try {
      // In a real app, this would be an API call
      toast.success('Fares saved successfully!');
      console.log('Saved fares:', fares);
    } catch (error) {
      toast.error('Failed to save fares');
      console.error('Save error:', error);
    }
  };

  // Filter functions
  const filteredStops = stops.filter(stop => 
    stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.stop_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlerts = alerts.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // CRUD operations for stops
  const handleEditStop = (stop) => {
    setEditingStop(stop.stop_id);
    setStopForm({
      ...stop,
      features: [...(stop.features || [])],
      connections: { 
        rail: stop.connections?.rail || null,
        terminal: stop.connections?.terminal || null,
        type: stop.connections?.type || 'curbside'
      },
      accessibility: {
        escalators: stop.accessibility?.escalators || false,
        footbridge: stop.accessibility?.footbridge || false,
        wheelchair_accessible: stop.accessibility?.wheelchair_accessible || false,
        tactile_paving: stop.accessibility?.tactile_paving || false
      },
      infrastructure: {
        covered_waiting_area: stop.infrastructure?.covered_waiting_area || stop.features?.includes('covered_waiting_area') || false,
        cctv: stop.infrastructure?.cctv || stop.features?.includes('cctv') || false,
        lighting: stop.infrastructure?.lighting || false,
        benches: stop.infrastructure?.benches || false,
        digital_display: stop.infrastructure?.digital_display || false
      },
      google_maps_link: stop.google_maps_link || ''
    });
  };
  const handleSaveStop = () => {
    // Build features array from infrastructure and accessibility
    const features = [];
    
    // Add infrastructure features that are enabled
    Object.entries(stopForm.infrastructure || {}).forEach(([key, value]) => {
      if (value) features.push(key);
    });
    
    // Add rail connections to features for backward compatibility
    if (stopForm.connections?.rail?.length > 0) {
      stopForm.connections.rail.forEach(rail => {
        features.push(`${rail.toLowerCase()}_connection`);
      });
    }

    const stopData = {
      ...stopForm,
      features,
      lat: parseFloat(stopForm.lat),
      lng: parseFloat(stopForm.lng),
      sequence: parseInt(stopForm.sequence)
    };

    if (editingStop) {
      // Update existing stop
      setStops(prevStops => 
        prevStops.map(stop => 
          stop.stop_id === editingStop ? stopData : stop
        )
      );
      toast.success('Stop updated successfully!');
    } else {
      // Add new stop
      const newStop = {
        ...stopData,
        stop_id: stopForm.stop_id.toUpperCase().replace(/\s+/g, '_'),
        sequence: parseInt(stopForm.sequence) || stops.length + 1
      };
      setStops(prevStops => [...prevStops, newStop]);
      toast.success('Stop added successfully!');
    }
    setEditingStop(null);
    setShowAddStop(false);
    resetStopForm();
  };

  const handleDeleteStop = (stopId) => {
    if (window.confirm('Are you sure you want to delete this stop?')) {
      setStops(prevStops => prevStops.filter(stop => stop.stop_id !== stopId));
      toast.success('Stop deleted successfully!');
    }
  };
  const resetStopForm = () => {
    setStopForm({
      stop_id: '',
      name: '',
      lat: '',
      lng: '',
      sequence: '',
      direction: 'both',
      features: [],
      connections: { 
        rail: null, 
        terminal: null,
        type: 'curbside'
      },
      accessibility: {
        escalators: false,
        footbridge: false,
        wheelchair_accessible: false,
        tactile_paving: false
      },
      infrastructure: {
        covered_waiting_area: false,
        cctv: false,
        lighting: false,
        benches: false,
        digital_display: false
      },
      google_maps_link: ''
    });
  };

  // CRUD operations for alerts
  const handleEditAlert = (alert) => {
    setEditingAlert(alert.id);
    setAlertForm({
      ...alert,
      affected_stops: [...alert.affected_stops],
      start_date: alert.start_date.split('T')[0],
      end_date: alert.end_date.split('T')[0]
    });
  };
  const handleSaveAlert = () => {
    const alertData = {
      ...alertForm,
      start_date: `${alertForm.start_date}T00:00:00+08:00`,
      end_date: `${alertForm.end_date}T23:59:59+08:00`
    };

    if (editingAlert) {
      // Update existing alert
      const updatedAlerts = alerts.map(alert => 
        alert.id === editingAlert ? alertData : alert
      );
      updateAlerts(updatedAlerts);
      toast.success('Alert updated successfully!');
    } else {
      // Add new alert
      const newAlert = {
        ...alertData,
        id: `alert-${Date.now()}`
      };
      const updatedAlerts = [...alerts, newAlert];
      updateAlerts(updatedAlerts);
      toast.success('Alert added successfully!');
    }
    setEditingAlert(null);
    setShowAddAlert(false);
    resetAlertForm();
  };
  const handleDeleteAlert = (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      updateAlerts(updatedAlerts);
      toast.success('Alert deleted successfully!');
    }
  };  const resetAlertForm = () => {
    setAlertForm({
      id: '',
      title: '',
      message: '',
      type: 'construction',
      affected_stops: [],
      disable_stops: false,
      start_date: '',
      end_date: ''
    });
  };
  const tabs = [
    {
      id: 'stops',
      name: 'Stops',
      icon: MapPinIcon,
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: Cog8ToothIcon,
    },
    {
      id: 'analytics',
      name: 'Analytics', 
      icon: ChartBarIcon,
    },
    {
      id: 'fares',
      name: 'Fares',
      icon: CurrencyDollarIcon,
    },
    {
      id: 'alerts',
      name: 'Alerts',
      icon: BellIcon,
    },
  ];  const renderStopForm = () => (
    <div className="space-y-6 p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {editingStop ? 'Edit Stop' : 'Add New Stop'}
        </h3>
        <button
          onClick={() => {
            setEditingStop(null);
            setShowAddStop(false);
            resetStopForm();
          }}
          className="p-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Basic Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Stop ID
            </label>
            <input
              type="text"
              value={stopForm.stop_id}
              onChange={(e) => setStopForm(prev => ({ ...prev, stop_id: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
              placeholder="e.g., MONUMENTO"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Stop Name
            </label>
            <input
              type="text"
              value={stopForm.name}
              onChange={(e) => setStopForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
              placeholder="Stop name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={stopForm.lat}
              onChange={(e) => setStopForm(prev => ({ ...prev, lat: parseFloat(e.target.value) || '' }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
              placeholder="14.123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={stopForm.lng}
              onChange={(e) => setStopForm(prev => ({ ...prev, lng: parseFloat(e.target.value) || '' }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
              placeholder="121.123456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Sequence
            </label>
            <input
              type="number"
              value={stopForm.sequence}
              onChange={(e) => setStopForm(prev => ({ ...prev, sequence: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Direction
            </label>
            <select
              value={stopForm.direction}
              onChange={(e) => setStopForm(prev => ({ ...prev, direction: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
            >
              <option value="both">Both Directions</option>
              <option value="northbound">Northbound</option>
              <option value="southbound">Southbound</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Google Maps Link
          </label>
          <input
            type="url"
            value={stopForm.google_maps_link}
            onChange={(e) => setStopForm(prev => ({ ...prev, google_maps_link: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>

      {/* Stop Type & Connections */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Stop Type & Connections
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Stop Type
            </label>
            <select
              value={stopForm.connections?.type || 'curbside'}
              onChange={(e) => setStopForm(prev => ({ 
                ...prev, 
                connections: { ...prev.connections, type: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
            >
              <option value="curbside">Curbside</option>
              <option value="median">Median</option>
              <option value="terminal">Terminal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Rail Connections
            </label>
            <input
              type="text"
              value={stopForm.connections?.rail?.join(', ') || ''}
              onChange={(e) => {
                const railConnections = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                setStopForm(prev => ({ 
                  ...prev, 
                  connections: { ...prev.connections, rail: railConnections.length > 0 ? railConnections : null }
                }));
              }}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
              placeholder="e.g., LRT-1, MRT-3"
            />
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Accessibility Features
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'escalators', label: 'Escalators' },
            { key: 'footbridge', label: 'Footbridge' },
            { key: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
            { key: 'tactile_paving', label: 'Tactile Paving' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`accessibility_${key}`}
                checked={stopForm.accessibility?.[key] || false}
                onChange={(e) => setStopForm(prev => ({
                  ...prev,
                  accessibility: { ...prev.accessibility, [key]: e.target.checked }
                }))}
                className="w-4 h-4 text-ph-blue-600 bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded focus:ring-ph-blue-500 dark:focus:ring-ph-blue-400"
              />
              <label htmlFor={`accessibility_${key}`} className="text-sm text-neutral-700 dark:text-neutral-300">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure Features */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Infrastructure Features
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'covered_waiting_area', label: 'Covered Waiting Area' },
            { key: 'cctv', label: 'CCTV' },
            { key: 'lighting', label: 'Lighting' },
            { key: 'benches', label: 'Benches' },
            { key: 'digital_display', label: 'Digital Display' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`infrastructure_${key}`}
                checked={stopForm.infrastructure?.[key] || false}
                onChange={(e) => setStopForm(prev => ({
                  ...prev,
                  infrastructure: { ...prev.infrastructure, [key]: e.target.checked }
                }))}
                className="w-4 h-4 text-ph-blue-600 bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded focus:ring-ph-blue-500 dark:focus:ring-ph-blue-400"
              />
              <label htmlFor={`infrastructure_${key}`} className="text-sm text-neutral-700 dark:text-neutral-300">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => {
            setEditingStop(null);
            setShowAddStop(false);
            resetStopForm();
          }}
          className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Cancel
        </button>
        <motion.button
          onClick={handleSaveStop}
          className="px-4 py-2 text-sm font-medium text-white bg-ph-blue-500 hover:bg-ph-blue-600 dark:bg-ph-blue-600 dark:hover:bg-ph-blue-700 rounded-md transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {editingStop ? 'Update Stop' : 'Add Stop'}
        </motion.button>
      </div>
    </div>
  );

  const renderAlertForm = () => (
    <div className="space-y-4 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {editingAlert ? 'Edit Alert' : 'Add New Alert'}
        </h3>
        <button
          onClick={() => {
            setEditingAlert(null);
            setShowAddAlert(false);
            resetAlertForm();
          }}
          className="p-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Alert Title
          </label>          <input
            type="text"
            value={alertForm.title}
            onChange={(e) => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
            placeholder="Alert title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Alert Type
          </label>
          <select
            value={alertForm.type}
            onChange={(e) => setAlertForm(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
          >
            <option value="construction">🚧 Construction</option>
            <option value="closure">🚫 Closure</option>
            <option value="delay">⚠️ Delay/Traffic</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Message
          </label>
          <textarea
            value={alertForm.message}
            onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"            placeholder="Alert message"
          />
        </div>        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Affected Stops
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStopDropdownOpen(!isStopDropdownOpen)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 text-left flex items-center justify-between"
            >
              <span className="truncate">
                {alertForm.affected_stops.length > 0 
                  ? `${alertForm.affected_stops.length} stop${alertForm.affected_stops.length > 1 ? 's' : ''} selected`
                  : 'Select affected stops'
                }
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-neutral-500 transition-transform ${isStopDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isStopDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {stopsData.map((stop) => (
                  <div
                    key={stop.stop_id}
                    className="flex items-center px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-600 cursor-pointer"
                    onClick={() => {
                      const isSelected = alertForm.affected_stops.includes(stop.stop_id);
                      if (isSelected) {
                        setAlertForm(prev => ({
                          ...prev,
                          affected_stops: prev.affected_stops.filter(id => id !== stop.stop_id)
                        }));
                      } else {
                        setAlertForm(prev => ({
                          ...prev,
                          affected_stops: [...prev.affected_stops, stop.stop_id]
                        }));
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={alertForm.affected_stops.includes(stop.stop_id)}
                      onChange={() => {}} // Handled by parent onClick
                      className="w-4 h-4 text-ph-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-ph-blue-500 dark:focus:ring-ph-blue-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600 mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {stop.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {stop.stop_id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {alertForm.affected_stops.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {alertForm.affected_stops.map((stopId) => {
                const stop = stopsData.find(s => s.stop_id === stopId);
                return (
                  <span
                    key={stopId}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-ph-blue-100 text-ph-blue-800 dark:bg-ph-blue-500/20 dark:text-ph-blue-400 rounded-md"
                  >
                    {stop?.name || stopId}
                    <button
                      type="button"
                      onClick={() => {
                        setAlertForm(prev => ({
                          ...prev,
                          affected_stops: prev.affected_stops.filter(id => id !== stopId)
                        }));
                      }}
                      className="ml-1 text-ph-blue-600 dark:text-ph-blue-400 hover:text-ph-blue-800 dark:hover:text-ph-blue-300"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="disable_stops"
            checked={alertForm.disable_stops}
            onChange={(e) => setAlertForm(prev => ({ ...prev, disable_stops: e.target.checked }))}
            className="w-4 h-4 text-ph-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-ph-blue-500 dark:focus:ring-ph-blue-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
          />
          <label htmlFor="disable_stops" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Disable affected stops (make them unselectable)
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={alertForm.start_date}
              onChange={(e) => setAlertForm(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={alertForm.end_date}
              onChange={(e) => setAlertForm(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setEditingAlert(null);
            setShowAddAlert(false);
            resetAlertForm();
          }}
          className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Cancel
        </button>
        <motion.button
          onClick={handleSaveAlert}
          className="px-4 py-2 text-sm font-medium text-white bg-ph-blue-500 hover:bg-ph-blue-600 dark:bg-ph-blue-600 dark:hover:bg-ph-blue-700 rounded-md transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {editingAlert ? 'Update Alert' : 'Add Alert'}
        </motion.button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'stops':
        return (
          <div className="space-y-6">            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Manage Stops ({stops.length})
              </h2>
              <motion.button
                onClick={() => {
                  setShowAddStop(true);
                  resetStopForm();
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-ph-blue-500 hover:bg-ph-blue-600 dark:bg-ph-blue-600 dark:hover:bg-ph-blue-700 rounded-md transition-colors shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="w-4 h-4" />
                Add Stop
              </motion.button>
            </div>
            
            {(showAddStop || editingStop) && renderStopForm()}
            
            <div className="space-y-4">
              {/* Search field */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search stops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 dark:focus:border-ph-blue-400 transition-colors"
                />
              </div>

              {/* Stops list */}
              <div className="grid gap-3">
                {filteredStops.map((stop) => (
                  <motion.div 
                    key={stop.stop_id}
                    className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{stop.name}</h3>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">({stop.stop_id})</span>
                          {/* Stop type indicator */}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            stop.connections?.type === 'terminal' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                              : stop.connections?.type === 'median'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                          }`}>
                            {stop.connections?.type || 'curbside'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Seq: {stop.sequence} • {stop.direction === 'both' ? 'Both directions' : stop.direction}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          {stop.lat.toFixed(6)}, {stop.lng.toFixed(6)}
                        </p>
                        
                        {/* Rail connections */}
                        {stop.connections?.rail && stop.connections.rail.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">Rail:</span>
                            {stop.connections.rail.map((rail, index) => (
                              <span key={index} className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                rail === 'LRT-1' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                rail === 'LRT-2' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                                rail === 'MRT-3' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                              }`}>
                                {rail}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Accessibility features */}
                        {(stop.accessibility?.escalators || stop.accessibility?.footbridge || stop.accessibility?.wheelchair_accessible) && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">Access:</span>
                            {stop.accessibility?.wheelchair_accessible && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-full">♿</span>
                            )}
                            {stop.accessibility?.escalators && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full">🏃</span>
                            )}
                            {stop.accessibility?.footbridge && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 rounded-full">🌉</span>
                            )}
                          </div>
                        )}
                        
                        {/* Infrastructure features */}
                        {stop.features && stop.features.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            {stop.features.slice(0, 4).map((feature, index) => (
                              <span key={index} className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-full">
                                {feature.replace('_', ' ')}
                              </span>
                            ))}
                            {stop.features.length > 4 && (
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                +{stop.features.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Google Maps link indicator */}
                        {stop.google_maps_link && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">📍 Maps link available</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.button 
                          onClick={() => handleEditStop(stop)}
                          className="p-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>
                        <motion.button 
                          onClick={() => handleDeleteStop(stop.stop_id)}
                          className="p-1.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredStops.length === 0 && (
                  <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    {searchTerm ? 'No stops found matching your search.' : 'No stops available.'}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  onClick={saveStops}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
              </div>
            </div>          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-6">            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Maintenance Management
              </h2>
              <div className="flex items-center gap-2">
                <motion.button 
                  onClick={() => setShowMaintenancePanel(!showMaintenancePanel)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    showMaintenancePanel
                      ? 'bg-ph-blue-500 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-1.5" />
                  Schedule Maintenance
                </motion.button>
              </div>
            </div>

            {/* Maintenance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <div>                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Active Maintenance</h3>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {maintenanceSchedule.filter(m => m.status === 'active').length}
                    </p>
                  </div>
                  <WrenchScrewdriverIcon className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Scheduled</h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {maintenanceSchedule.filter(m => m.status === 'scheduled').length}
                    </p>
                  </div>
                  <ClockIcon className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Overdue</h3>
                    <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {maintenanceSchedule.filter(m => {
                        const dueDate = new Date(m.scheduled_date);
                        return dueDate < new Date() && m.status !== 'completed';
                      }).length}
                    </p>
                  </div>
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Maintenance Schedule Form */}
            {showMaintenancePanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                  Schedule New Maintenance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Maintenance Type
                    </label>
                    <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500">
                      <option value="routine">Routine Inspection</option>
                      <option value="cleaning">Station Cleaning</option>
                      <option value="repair">Equipment Repair</option>
                      <option value="upgrade">Infrastructure Upgrade</option>
                      <option value="emergency">Emergency Maintenance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Affected Stop
                    </label>
                    <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500">
                      <option value="">Select stop...</option>
                      {stops.map(stop => (
                        <option key={stop.stop_id} value={stop.stop_id}>
                          {stop.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Scheduled Date
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Estimated Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
                      placeholder="2.0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
                      placeholder="Describe the maintenance work to be performed..."
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 mt-6">
                  <motion.button
                    onClick={() => setShowMaintenancePanel(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 text-sm font-medium text-white bg-ph-blue-500 hover:bg-ph-blue-600 dark:bg-ph-blue-600 dark:hover:bg-ph-blue-700 rounded-md transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Schedule Maintenance
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Stop Status Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Operating Hours Overview */}
              <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-neutral-500" />
                  Operating Hours
                </h3>
                
                <div className="space-y-3">
                  {stops.slice(0, 5).map((stop) => (
                    <div key={stop.stop_id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-md">
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                          {stop.name}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {stop.stop_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {stopOperatingHours[stop.stop_id]?.start || '5:00'} - {stopOperatingHours[stop.stop_id]?.end || '23:00'}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full">
                          Operational
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <motion.button
                    className="w-full py-2 text-sm text-ph-blue-600 dark:text-ph-blue-400 hover:text-ph-blue-700 dark:hover:text-ph-blue-300 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    View All Stops →
                  </motion.button>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <DocumentArrowDownIcon className="w-5 h-5 text-neutral-500" />
                  Recent Maintenance
                </h3>
                
                <div className="space-y-3">
                  {maintenanceSchedule.length === 0 ? (
                    <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                      <WrenchScrewdriverIcon className="w-12 h-12 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
                      <p className="text-sm">No maintenance scheduled</p>
                    </div>
                  ) : (
                    maintenanceSchedule.slice(0, 5).map((maintenance, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-md">
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                            {maintenance.type}
                          </h4>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {maintenance.stop_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {new Date(maintenance.scheduled_date).toLocaleDateString()}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            maintenance.status === 'completed' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                              : maintenance.status === 'active'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          }`}>
                            {maintenance.status.charAt(0).toUpperCase() + maintenance.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Operations Panel */}
            <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-neutral-500" />
                Bulk Operations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  className="p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-ph-blue-400 hover:bg-ph-blue-50 dark:hover:bg-ph-blue-500/10 transition-colors text-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DocumentArrowUpIcon className="w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-neutral-500" />
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">Import Stops</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Upload CSV or JSON file
                  </p>
                </motion.button>
                
                <motion.button
                  className="p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg hover:border-ph-blue-400 hover:bg-ph-blue-50 dark:hover:bg-ph-blue-500/10 transition-colors text-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DocumentArrowDownIcon className="w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-neutral-500" />
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">Export Data</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Download current stops data
                  </p>
                </motion.button>
                
                <motion.button
                  onClick={() => setBulkOperationMode(!bulkOperationMode)}
                  className={`p-4 border-2 rounded-lg transition-colors text-center ${
                    bulkOperationMode
                      ? 'border-ph-blue-400 bg-ph-blue-50 dark:bg-ph-blue-500/10'
                      : 'border-dashed border-neutral-300 dark:border-neutral-600 hover:border-ph-blue-400 hover:bg-ph-blue-50 dark:hover:bg-ph-blue-500/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <EyeIcon className="w-8 h-8 mx-auto mb-2 text-neutral-400 dark:text-neutral-500" />
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">Batch Edit</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {bulkOperationMode ? 'Exit batch mode' : 'Select multiple stops'}
                  </p>
                </motion.button>
              </div>
            </div>
          </div>
        );

      case 'fares':
        return (
          <div className="space-y-6">            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Manage Fares
              </h2>
            </div>
            
            <div className="grid gap-6">
              <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">Base Rates</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Minimum Fare (First 4km)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">₱</span>
                      <input
                        type="number"
                        step="0.25"
                        className="w-24 px-3 py-2 text-sm text-right border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
                        defaultValue={fares.minimumFare || 15}
                        onChange={(e) => setFares(prev => ({ ...prev, minimumFare: parseFloat(e.target.value) || 15 }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Rate per km (after 4km)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">₱</span>
                      <input
                        type="number"
                        step="0.25"
                        className="w-24 px-3 py-2 text-sm text-right border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
                        defaultValue={fares.ratePerKm || 2.50}
                        onChange={(e) => setFares(prev => ({ ...prev, ratePerKm: parseFloat(e.target.value) || 2.50 }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">Discount Rates</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Senior Citizen / PWD / Student Discount</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-24 px-3 py-2 text-sm text-right border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500"
                        defaultValue={fares.discountRate || 20}
                        onChange={(e) => setFares(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 20 }))}
                      />
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Matrix Preview */}
              <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">Fare Preview</h3>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Sample fare calculations based on current rates:
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>First 4km (minimum fare):</span>
                    <span className="font-medium">₱{(fares.minimumFare || 15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>10km journey:</span>
                    <span className="font-medium">₱{((fares.minimumFare || 15) + (6 * (fares.ratePerKm || 2.50))).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>20km journey:</span>
                    <span className="font-medium">₱{((fares.minimumFare || 15) + (16 * (fares.ratePerKm || 2.50))).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
                    <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                      <span>With {fares.discountRate || 20}% discount (20km):</span>
                      <span className="font-medium">₱{(((fares.minimumFare || 15) + (16 * (fares.ratePerKm || 2.50))) * (1 - (fares.discountRate || 20) / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  onClick={saveFares}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
              </div>
            </div>
          </div>
        );case 'alerts':
        return (
          <div className="space-y-6">            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Service Alerts ({alerts.length})
              </h2>
              <motion.button 
                onClick={() => {
                  setShowAddAlert(true);
                  resetAlertForm();
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-ph-blue-500 hover:bg-ph-blue-600 dark:bg-ph-blue-600 dark:hover:bg-ph-blue-700 rounded-md transition-colors shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusIcon className="w-4 h-4" />
                New Alert
              </motion.button>
            </div>
            
            {(showAddAlert || editingAlert) && renderAlertForm()}
            
            <div className="space-y-4">
              {/* Search field */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 dark:focus:border-ph-blue-400 transition-colors"
                />
              </div>

              {/* Alerts list */}
              <div className="grid gap-3">
                {filteredAlerts.map((alert) => {
                  const startDate = new Date(alert.start_date);
                  const endDate = new Date(alert.end_date);
                  const now = new Date();
                  const isActive = now >= startDate && now <= endDate;
                  
                  return (
                    <motion.div 
                      key={alert.id}
                      className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow"
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              isActive 
                                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                : now > endDate
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                            }`}>
                              {isActive ? 'Active' : now > endDate ? 'Expired' : 'Scheduled'}
                            </span>
                          </div>
                          {alert.affected_stops && alert.affected_stops.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                Affects: {alert.affected_stops.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.button 
                            onClick={() => handleEditAlert(alert)}
                            className="p-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-300 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-1.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {filteredAlerts.length === 0 && (
                  <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    {searchTerm ? 'No alerts found matching your search.' : 'No alerts available.'}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  onClick={saveAlerts}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Analytics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Popular Routes</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Monumento → PITX</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">2,145</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">PITX → Monumento</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">1,932</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Passenger Types</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Regular</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">75%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Discounted</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-[260px,1fr] bg-neutral-50 dark:bg-neutral-900">
      {/* Sidebar */}
      <div className="bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-ph-blue-500 dark:text-ph-blue-400" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Admin Panel</h2>
          </div>
          <button
            onClick={onExit}
            className="p-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            title="Return to main page"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="py-4">
          <div className="px-4 mb-2">
            <h3 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-500 font-medium">
              Management
            </h3>
          </div>
          <div className="space-y-0.5">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                  ? 'bg-ph-blue-50 dark:bg-ph-blue-500/10 text-ph-blue-600 dark:text-ph-blue-400 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                }`}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <tab.icon className={`w-5 h-5 ${
                  activeTab === tab.id 
                  ? 'text-ph-blue-500 dark:text-ph-blue-400' 
                  : 'text-neutral-500 dark:text-neutral-500'
                }`} />
                {tab.name}
              </motion.button>
            ))}
          </div>
          
          <div className="mt-6 px-4 mb-2">
            <h3 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-500 font-medium">
              System
            </h3>
          </div>
          <div className="space-y-0.5">
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                showSettings
                ? 'bg-ph-blue-50 dark:bg-ph-blue-500/10 text-ph-blue-600 dark:text-ph-blue-400 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
              }`}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Cog8ToothIcon className={`w-5 h-5 ${
                showSettings
                ? 'text-ph-blue-500 dark:text-ph-blue-400' 
                : 'text-neutral-500 dark:text-neutral-500'
              }`} />
              Settings
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={springTransition}
              className="max-w-xl"
            >
              <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Security Settings</h2>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-5">
                <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <KeyIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  Change Admin Access Code
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="currentCode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Current Code
                    </label>
                    <input
                      type="text"
                      id="currentCode"
                      value={adminCode}
                      readOnly
                      className="block w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:ring-ph-blue-500 dark:focus:ring-ph-blue-400 focus:border-ph-blue-500 dark:focus:border-ph-blue-400"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="newCode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      New Code
                    </label>
                    <input
                      type="text"
                      id="newCode"
                      value={newAdminCode}
                      onChange={(e) => setNewAdminCode(e.target.value)}
                      placeholder="Enter new admin code"
                      className="block w-full px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm focus:ring-ph-blue-500 dark:focus:ring-ph-blue-400 focus:border-ph-blue-500 dark:focus:border-ph-blue-400"
                    />
                  </div>
                  
                  <motion.button
                    onClick={() => {
                      if (newAdminCode.trim()) {
                        setAdminCode(newAdminCode.trim());
                        setNewAdminCode('');
                        alert('Admin code updated successfully!');
                      }
                    }}
                    className="px-4 py-2 bg-ph-blue-500 dark:bg-ph-blue-600 text-white font-medium rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newAdminCode.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Update Code
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={springTransition}
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}