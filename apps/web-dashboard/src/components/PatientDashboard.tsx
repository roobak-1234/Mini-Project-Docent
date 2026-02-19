import React, { useState, useEffect } from 'react';
import { User, Heart, Shield, Hospital, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/AuthService';

interface Doctor {
  id: string;
  username: string;
  email: string;
  phone?: string;
  uniqueDoctorId: string;
}

interface DataSharingSettings {
  vitals: boolean;
  location: boolean;
  emergencyContacts: boolean;
  medicalHistory: boolean;
}

const PatientDashboard: React.FC = () => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [dataSharingSettings, setDataSharingSettings] = useState<DataSharingSettings>({
    vitals: true,
    location: true,
    emergencyContacts: false,
    medicalHistory: false
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser?.doctorId) {
      // Find the doctor by their unique ID
      const allUsers = JSON.parse(localStorage.getItem('lifelink_users') || '[]');
      const assignedDoctor = allUsers.find((u: any) => 
        u.userType === 'doctor' && u.uniqueDoctorId === currentUser.doctorId
      );
      if (assignedDoctor) {
        const { password, ...doctorWithoutPassword } = assignedDoctor;
        setDoctor(doctorWithoutPassword as Doctor);
      }
    }

    // Load data sharing settings
    const savedSettings = localStorage.getItem(`data_sharing_${currentUser?.id}`);
    if (savedSettings) {
      setDataSharingSettings(JSON.parse(savedSettings));
    }
  }, [currentUser]);

  const toggleDataSharing = (key: keyof DataSharingSettings) => {
    const newSettings = { ...dataSharingSettings, [key]: !dataSharingSettings[key] };
    setDataSharingSettings(newSettings);
    localStorage.setItem(`data_sharing_${currentUser?.id}`, JSON.stringify(newSettings));
  };

  if (!currentUser || currentUser.userType !== 'patient') {
    return <div>Access denied. Patient account required.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Patient Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-lifelink-primary/10 p-3 rounded-full">
            <User className="h-8 w-8 text-lifelink-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-lifelink-text">{currentUser.username}</h2>
            <p className="text-gray-600">Patient ID: {currentUser.id}</p>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Active Monitoring</span>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Data Protected</span>
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Hospital className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Network Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Doctor Card */}
      {doctor ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-lifelink-text mb-4">Your Assigned Doctor</h3>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-lifelink-text">Dr. {doctor.username}</h4>
              <p className="text-sm text-gray-600">{doctor.email}</p>
              {doctor.phone && <p className="text-sm text-gray-600">{doctor.phone}</p>}
              <p className="text-xs text-gray-500 mt-1">Doctor ID: {doctor.uniqueDoctorId}</p>
            </div>
            <div className="text-right">
              <div className="flex gap-2">
                <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-lifelink-text mb-4">No Assigned Doctor</h3>
          <p className="text-gray-600">You haven't been assigned to a doctor yet. Contact your healthcare provider to get your doctor's ID.</p>
        </div>
      )}

      {/* Hospital Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-lifelink-text mb-4">Hospital Network</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Hospital className="h-6 w-6 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-800">City General Hospital</h4>
              <p className="text-sm text-gray-600">123 Medical Center Dr, Healthcare City</p>
              <p className="text-sm text-gray-600">Emergency: +1 (555) 911-HELP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sharing Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-lifelink-text mb-4">Data Sharing Settings</h3>
        <p className="text-gray-600 mb-6">Control what information you share with your healthcare team.</p>
        
        <div className="space-y-4">
          {[
            { key: 'vitals', label: 'Vital Signs & Health Metrics', description: 'Heart rate, blood pressure, temperature' },
            { key: 'location', label: 'Location Data', description: 'GPS location for emergency response' },
            { key: 'emergencyContacts', label: 'Emergency Contacts', description: 'Family and emergency contact information' },
            { key: 'medicalHistory', label: 'Medical History', description: 'Past diagnoses and treatments' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-lifelink-text">{label}</h4>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              <button
                onClick={() => toggleDataSharing(key as keyof DataSharingSettings)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  dataSharingSettings[key as keyof DataSharingSettings]
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dataSharingSettings[key as keyof DataSharingSettings] ? (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Sharing</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span className="text-sm font-medium">Private</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;