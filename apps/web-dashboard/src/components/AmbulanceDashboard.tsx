import React, { useState, useEffect } from 'react';
import { MapPin, Activity, Phone, Navigation, CheckCircle, AlertTriangle, Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import { useAmbulanceSession } from '../hooks/useAmbulanceSession';
import { useGeolocationStream } from '../hooks/useGeolocationStream';
import { ambulanceSignalRService } from '../services/AmbulanceSignalRService';
import { AzureMap } from './AzureMap';
import VitalsInputForm from './VitalsInputForm';

interface AmbulanceDashboardProps {
  onBack?: () => void;
}

const AmbulanceDashboard: React.FC<AmbulanceDashboardProps> = ({ onBack }) => {
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showHospitalDetails, setShowHospitalDetails] = useState(false);
  const [pendingDispatch, setPendingDispatch] = useState(false);
  const [dispatchAccepted, setDispatchAccepted] = useState(false);
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [wifiConnected, setWifiConnected] = useState(false);
  const [hospitalInfo] = useState({
    name: 'City General Hospital',
    address: '123 Medical Center Dr',
    phone: '+1 (555) 123-4567',
    emergencyPhone: '+1 (555) 911-HELP',
    email: 'emergency@citygeneral.com',
    eta: '8 min',
    distance: '2.3 mi'
  });

  const [emergencyCall] = useState({
    id: 'EMG-001',
    location: '456 Emergency Ave, Downtown',
    type: 'Vehicle Crash - Multiple Injuries',
    priority: 'Critical',
    distance: '1.8 miles',
    eta: '6 minutes',
    caller: 'Traffic Control Center',
    phone: '911'
  });

  const {
    session,
    startSession,
    updateVitals,
    completeHandover,
    isSessionActive
  } = useAmbulanceSession();

  // Real-time GPS tracking with SignalR broadcast
  const { location, error: gpsError, isTracking, startTracking } = useGeolocationStream({
    onLocationUpdate: async (locationData) => {
      if (session && isConnected) {
        // Critical: "Golden Hour" optimization - reduces blind spot between ambulance and ER
        await ambulanceSignalRService.broadcastAmbulanceUpdate({
          ambulanceId: session.ambulanceId,
          location: {
            lat: locationData.latitude,
            lng: locationData.longitude,
            accuracy: locationData.accuracy
          },
          vitals: session.vitals.length > 0 ? {
            heartRate: session.vitals[session.vitals.length - 1].heartRate,
            bloodPressure: session.vitals[session.vitals.length - 1].bloodPressure,
            spO2: session.vitals[session.vitals.length - 1].spO2,
            notes: session.vitals[session.vitals.length - 1].notes
          } : undefined,
          timestamp: Date.now()
        });
      }
    },
    updateInterval: 5000 // 5-second updates for real-time tracking
  });

  // Initialize SignalR connection
  useEffect(() => {
    // Set connected to true for demo purposes
    setIsConnected(true);
  }, []);

  // Start demo session if none exists
  useEffect(() => {
    if (!session) {
      startSession('AMB-001', 'HOSP-001', 'PAT-001');
    }
  }, [session, startSession]);

  // Auto-start GPS tracking when session is active
  useEffect(() => {
    if (isSessionActive && !isTracking) {
      startTracking();
    }
  }, [isSessionActive, isTracking, startTracking]);

  const handleVitalsSave = (vitals: any) => {
    updateVitals(vitals);
  };

  const handleCompleteHandover = () => {
    if (window.confirm('Complete handover to hospital? This will end the current session.')) {
      completeHandover();
      
      // Reset dispatch states to make ambulance available for new calls
      setDispatchAccepted(false);
      setPendingDispatch(false);
      
      alert('✅ HANDOVER COMPLETE\n\nPatient successfully transferred to hospital.\n\nAmbulance is now available for new dispatches.');
    }
  };

  const handleAcceptDispatch = () => {
    if (window.confirm(`🚨 ACCEPT DISPATCH\n\nEmergency: ${emergencyCall.type}\nLocation: ${emergencyCall.location}\nPriority: ${emergencyCall.priority}\n\nAccept this dispatch?`)) {
      setDispatchAccepted(true);
      setPendingDispatch(false);
      alert('✅ DISPATCH ACCEPTED\n\nDispatch confirmed to control center.\nProceeding to emergency location.');
    }
  };

  const handleDeclineDispatch = () => {
    if (window.confirm('Decline this emergency dispatch?')) {
      setPendingDispatch(false);
      alert('Dispatch declined. Returning to available status.');
    }
  };

  const getLatestVitals = () => {
    if (!session || session.vitals.length === 0) return null;
    return session.vitals[session.vitals.length - 1];
  };

  const latestVitals = getLatestVitals();

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 flex flex-col">
      {/* Header - Mission Control Style */}
      <div className="bg-red-600 p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-red-700 hover:bg-red-800 rounded-lg text-white transition-colors"
                aria-label="Back to Hospital Management"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Mission Control</h1>
              <p className="text-red-100">Ambulance {session?.ambulanceId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-6 w-6 text-green-300" />
            ) : (
              <WifiOff className="h-6 w-6 text-red-300" />
            )}
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Dispatch Alert */}
      {pendingDispatch && (
        <div className="bg-yellow-600 p-4 border-l-4 border-yellow-400">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-6 w-6 text-yellow-200 mr-2" />
                <h2 className="text-xl font-bold text-white">INCOMING DISPATCH</h2>
                <span className="ml-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">URGENT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-100 mb-4">
                <div><strong>Type:</strong> {emergencyCall.type}</div>
                <div><strong>Priority:</strong> {emergencyCall.priority}</div>
                <div><strong>Location:</strong> {emergencyCall.location}</div>
                <div><strong>Distance:</strong> {emergencyCall.distance}</div>
                <div><strong>Caller:</strong> {emergencyCall.caller}</div>
                <div><strong>ETA:</strong> {emergencyCall.eta}</div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAcceptDispatch}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg flex items-center transition-colors"
                >
                  🚨 ACCEPT DISPATCH
                </button>
                <button
                  onClick={handleDeclineDispatch}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-green-400 font-bold text-lg">
              {isTracking ? 'TRACKING' : 'GPS OFF'}
            </div>
            <div className="text-sm text-gray-400">GPS Status</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold text-lg">{hospitalInfo.eta}</div>
            <div className="text-sm text-gray-400">ETA</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold text-lg">{hospitalInfo.distance}</div>
            <div className="text-sm text-gray-400">Distance</div>
          </div>
          <div>
            <div className="text-purple-400 font-bold text-lg">
              {session?.vitals.length || 0}
            </div>
            <div className="text-sm text-gray-400">Vitals Logged</div>
          </div>
        </div>
      </div>

      {/* Patient Info & Latest Vitals */}
      <div className="flex-1 p-4 bg-gray-800 border-b border-gray-700 flex flex-col">
        <h3 className="text-lg font-semibold mb-3">Patient Status</h3>
        {latestVitals ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-900 p-3 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-gray-300">Heart Rate</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {latestVitals.heartRate || '--'} BPM
              </div>
            </div>
            <div className="bg-blue-900 p-3 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-sm text-gray-300">Blood Pressure</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {latestVitals.bloodPressure || '--'}
              </div>
            </div>
            <div className="bg-green-900 p-3 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm text-gray-300">SpO2</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {latestVitals.spO2 || '--'}%
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gray-700 rounded-lg min-h-[400px]">
            <AzureMap
              subscriptionKey={process.env.REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY || ""}
              center={{ latitude: 40.7128, longitude: -74.0060 }}
              zoom={13}
            />
          </div>
        )}
      </div>

      {/* Action Buttons - Large touch targets */}
      <div className="p-4 space-y-4 flex-shrink-0">
        {/* Dispatch Control */}
        {!pendingDispatch && !dispatchAccepted && (
          <button
            onClick={() => setPendingDispatch(true)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-4 px-6 rounded-xl text-xl font-semibold flex items-center justify-center transition-colors"
          >
            <AlertTriangle className="h-6 w-6 mr-2" />
            Simulate Emergency Dispatch
          </button>
        )}
        
        {pendingDispatch && (
          <button
            onClick={handleAcceptDispatch}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl text-xl font-semibold flex items-center justify-center transition-colors animate-pulse"
          >
            🚨 ACCEPT DISPATCH
          </button>
        )}

        <button
          onClick={() => setIsVitalsModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl text-xl font-semibold flex items-center justify-center transition-colors"
        >
          <Activity className="h-6 w-6 mr-2" />
          Update Patient Vitals
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setShowHospitalDetails(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-colors"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call Hospital
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-colors">
            <Navigation className="h-5 w-5 mr-2" />
            Navigation
          </button>
        </div>

        {/* Handover Button */}
        <button
          onClick={handleCompleteHandover}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl text-xl font-semibold flex items-center justify-center transition-colors"
        >
          <CheckCircle className="h-6 w-6 mr-2" />
          Complete Hospital Handover
        </button>
      </div>

      {/* Hospital Info */}
      <div className="p-4 bg-gray-800 flex-shrink-0">
        <h3 className="text-lg font-semibold mb-2">Destination Hospital</h3>
        <div className="text-gray-300">
          <p className="font-medium">{hospitalInfo.name}</p>
          <p className="text-sm">{hospitalInfo.address}</p>
        </div>
      </div>

      {/* Vitals Input Modal */}
      <VitalsInputForm
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        onSave={handleVitalsSave}
      />

      {/* Hospital Details Modal */}
      {showHospitalDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Hospital Contact Details</h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <p className="font-semibold">{hospitalInfo.name}</p>
                <p className="text-sm">{hospitalInfo.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Emergency Line:</p>
                <p className="text-blue-600 font-mono">{hospitalInfo.emergencyPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Main Line:</p>
                <p className="text-blue-600 font-mono">{hospitalInfo.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email:</p>
                <p className="text-blue-600">{hospitalInfo.email}</p>
              </div>
            </div>
            <button
              onClick={() => setShowHospitalDetails(false)}
              className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceDashboard;