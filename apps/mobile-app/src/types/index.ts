export enum ControlType {
    MANUAL = 'MANUAL',
    AUTOMATED = 'AUTOMATED'
}

export enum SignalStatus {
    RED = 'RED',
    YELLOW = 'YELLOW',
    GREEN = 'GREEN',
    PREEMPTED = 'PREEMPTED', // Emergency Green
    MANUAL_CLEAR = 'MANUAL_CLEAR' // Officer directed
}

export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface Junction {
    id: string;
    name: string;
    location: Coordinate;
    controlType: ControlType;
    currentStatus: SignalStatus;
    lastUpdated: Date;
}

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    doctorId?: string;
    uniqueDoctorId?: string;
    userType: 'doctor' | 'patient' | 'nurse' | 'staff' | 'traffic-officer';
    country?: string;
    medicalId?: string;
    staffType?: string;
    vehicleNumber?: string;
    junctionId?: string;
    badgeNumber?: string;
    assignedPatientIds?: string[];
    permissions?: {
        canAccessPatientData?: boolean;
    };
    createdAt: string;
    isOnline?: boolean;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: Omit<User, 'password'>;
}
