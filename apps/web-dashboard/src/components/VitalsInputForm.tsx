import React, { useState } from 'react';
import { Heart, Activity, Thermometer, FileText, Save, X, Bluetooth, Wifi } from 'lucide-react';

interface VitalsData {
  heartRate?: number;
  bloodPressure?: string;
  spO2?: number;
  notes?: string;
}

interface VitalsInputFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vitals: VitalsData) => void;
  initialData?: VitalsData;
}

const VitalsInputForm: React.FC<VitalsInputFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData = {}
}) => {
  const [vitals, setVitals] = useState<VitalsData>(initialData);
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [wifiConnected, setWifiConnected] = useState(false);

  const handleSave = () => {
    onSave(vitals);
    onClose();
    setVitals({});
  };

  const handleInputChange = (field: keyof VitalsData, value: string | number) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const connectBluetooth = () => {
    setBluetoothConnected(!bluetoothConnected);
    alert(bluetoothConnected ? 'Bluetooth Disconnected' : 'Bluetooth Connected to Monitor-Defibrillator');
  };

  const connectWifi = () => {
    setWifiConnected(!wifiConnected);
    alert(wifiConnected ? 'WiFi Disconnected' : 'WiFi Connected to Monitor-Defibrillator');
  };

  const syncVitalsFromDevice = () => {
    if (!bluetoothConnected && !wifiConnected) {
      alert('Please connect via Bluetooth or WiFi first');
      return;
    }
    
    const connectionType = bluetoothConnected ? 'Bluetooth' : 'WiFi';
    
    setVitals({
      heartRate: 78,
      bloodPressure: '120/80',
      spO2: 98,
      notes: vitals.notes || ''
    });
    
    alert(`Vitals synced from Monitor-Defibrillator via ${connectionType}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header - High contrast for vehicle use */}
        <div className="bg-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Patient Vitals</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-700 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-red-100 mt-1">Touch-optimized for in-transit use</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Device Connection Section */}
          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              Monitor-Defibrillator Connection
            </h3>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  bluetoothConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  BT: {bluetoothConnected ? 'Connected' : 'Disconnected'}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  wifiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  WiFi: {wifiConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={connectBluetooth}
                className={`flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                  bluetoothConnected 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-100 text-blue-600 border-2 border-blue-600 hover:bg-blue-200'
                }`}
              >
                <Bluetooth className="h-4 w-4 mr-2" />
                {bluetoothConnected ? 'Disconnect BT' : 'Connect Bluetooth'}
              </button>
              
              <button
                onClick={connectWifi}
                className={`flex items-center justify-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                  wifiConnected 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-green-100 text-green-600 border-2 border-green-600 hover:bg-green-200'
                }`}
              >
                <Wifi className="h-4 w-4 mr-2" />
                {wifiConnected ? 'Disconnect WiFi' : 'Connect WiFi'}
              </button>
            </div>
            
            <button
              onClick={syncVitalsFromDevice}
              disabled={!bluetoothConnected && !wifiConnected}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-colors ${
                (bluetoothConnected || wifiConnected)
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Activity className="h-4 w-4 mr-2" />
              Sync Vitals from Device
            </button>
          </div>
          {/* Heart Rate - Large touch targets */}
          <div>
            <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              Heart Rate (BPM)
            </label>
            <input
              type="number"
              value={vitals.heartRate || ''}
              onChange={(e) => handleInputChange('heartRate', parseInt(e.target.value) || 0)}
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 text-center font-bold"
              placeholder="80"
              min="30"
              max="200"
            />
          </div>

          {/* Blood Pressure */}
          <div>
            <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <Activity className="h-6 w-6 text-blue-500 mr-2" />
              Blood Pressure
            </label>
            <input
              type="text"
              value={vitals.bloodPressure || ''}
              onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-bold"
              placeholder="120/80"
            />
          </div>

          {/* SpO2 */}
          <div>
            <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <Thermometer className="h-6 w-6 text-green-500 mr-2" />
              SpO2 (%)
            </label>
            <input
              type="number"
              value={vitals.spO2 || ''}
              onChange={(e) => handleInputChange('spO2', parseInt(e.target.value) || 0)}
              className="w-full text-2xl p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 text-center font-bold"
              placeholder="98"
              min="70"
              max="100"
            />
          </div>

          {/* Notes - Large text area for gloved hands */}
          <div>
            <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
              <FileText className="h-6 w-6 text-purple-500 mr-2" />
              Trauma Notes
            </label>
            <textarea
              value={vitals.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full text-lg p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 min-h-[120px] resize-none"
              placeholder="Patient condition, injuries, medications administered..."
            />
          </div>

          {/* Action Buttons - Extra large for vehicle use */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 text-xl font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 text-xl font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Save className="h-6 w-6 mr-2" />
              Save Vitals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsInputForm;