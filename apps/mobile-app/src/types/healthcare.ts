// Primary Healthcare Data Models - TypeScript Interfaces
// Demonstrates robust, strongly-typed data handling for complex healthcare systems

export interface Patient {
  id: string;
  username: string;
  email: string;
  phone?: string;
  doctorId: string; // Links patient to supervising doctor
  medicalId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
  vitals?: VitalSigns[];
  createdAt: string;
  isActive: boolean;
}

export interface Doctor {
  id: string;
  username: string;
  email: string;
  phone?: string;
  uniqueDoctorId: string; // Unique identifier for patient registration
  specialization?: string;
  licenseNumber?: string;
  hospitalId?: string; // Links doctor to hospital
  assignedPatients: string[]; // Array of patient IDs
  assignedNurses?: string[]; // Array of nurse IDs
  permissions: {
    canPrescribe: boolean;
    canAccessAllPatients: boolean;
    canManageHospital: boolean;
  };
  createdAt: string;
  isOnline: boolean;
}

export interface Nurse {
  id: string;
  username: string;
  email: string;
  phone?: string;
  doctorId: string; // Links nurse to supervising doctor
  hospitalId?: string;
  assignedPatientIds?: string[]; // Patients assigned by doctor
  licenseNumber?: string;
  shift?: 'day' | 'night' | 'rotating';
  permissions: {
    canAccessPatientData: boolean;
    canRecordVitals: boolean;
  };
  createdAt: string;
  isOnline: boolean;
}

export interface Hospital {
  id: string;
  uniqueHospitalId: string;
  name: string;
  type: 'public' | 'private' | 'specialty';
  address: string;
  phone: string;
  emergencyEmail: string;
  adminContact: string; // Doctor username who registered hospital
  capacity: {
    totalBeds: number;
    availableBeds: number;
    icuBeds: number;
    emergencyBeds: number;
  };
  departments: string[];
  ambulanceFleet: AmbulanceUnit[];
  createdAt: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  recordedBy: string; // User ID of who recorded
  heartRate: number; // BPM
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  spO2: number; // Oxygen saturation percentage
  temperature: number; // Fahrenheit
  respiratoryRate: number; // Breaths per minute
  bloodGlucose?: number; // mg/dL
  notes?: string;
  deviceSource?: 'manual' | 'bluetooth' | 'wifi'; // How data was captured
  timestamp: string;
  isEmergency: boolean;
}

export interface AmbulanceSession {
  id: string;
  ambulanceId: string;
  patientId?: string; // Links to patient being transported
  doctorId?: string; // Receiving doctor
  hospitalId?: string; // Destination hospital
  crew: {
    paramedic: string; // User ID
    driver: string; // User ID
    nurse?: string; // Optional nurse ID
  };
  status: 'available' | 'dispatched' | 'enroute' | 'onscene' | 'transporting' | 'arrived';
  emergency: {
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    location: {
      address: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    caller: {
      name: string;
      phone: string;
    };
  };
  vitalsRecorded: VitalSigns[]; // Real-time vitals during transport
  timeline: {
    dispatched: string;
    enroute?: string;
    onscene?: string;
    transporting?: string;
    arrived?: string;
  };
  estimatedArrival?: string;
  actualArrival?: string;
  createdAt: string;
}

export interface AmbulanceUnit {
  id: string;
  vehicleNumber: string;
  hospitalId: string; // Which hospital owns this ambulance
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  equipment: {
    defibrillator: boolean;
    ventilator: boolean;
    oxygenTank: boolean;
    medicationKit: boolean;
  };
  crew: {
    paramedic?: string;
    driver?: string;
  };
  lastMaintenance: string;
  mileage: number;
}

export interface EmergencyCall {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  caller: {
    name: string;
    phone: string;
  };
  description: string;
  assignedAmbulance?: string;
  status: 'pending' | 'dispatched' | 'responded' | 'completed' | 'cancelled';
  createdAt: string;
  respondedAt?: string;
  completedAt?: string;
}

// Real-time monitoring data structure
export interface RPMSession {
  id: string;
  patientId: string;
  doctorId: string;
  deviceId?: string; // Connected monitoring device
  isActive: boolean;
  vitalsStream: VitalSigns[]; // Continuous vitals data
  alerts: {
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }[];
  startTime: string;
  endTime?: string;
}

// Traffic control integration
export interface TrafficPreemption {
  id: string;
  ambulanceId: string;
  junctionId: string;
  requestedAt: string;
  approvedAt?: string;
  clearedAt?: string;
  status: 'requested' | 'approved' | 'active' | 'cleared';
  priority: number;
}

// Crash Detection System Interfaces
export interface SensorData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface CrashEvent {
  id: string;
  userId: string;
  location: { lat: number; lng: number };
  accelerationMagnitude: number;
  timestamp: string;
  severity: 'minor' | 'moderate' | 'severe';
  autoConfirmed: boolean;
  emergencyCallId?: string; // Links to created emergency call
}

export interface CrashDetectionConfig {
  crashThreshold: number; // m/s² acceleration threshold
  gyroThreshold: number; // rad/s rotation threshold
  confirmationTimeout: number; // seconds before auto-confirmation
  sensorUpdateInterval: number; // milliseconds
  locationUpdateInterval: number; // milliseconds
}