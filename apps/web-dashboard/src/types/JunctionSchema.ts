
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

export interface TrafficOfficer {
    id: string;
    name: string;
    junctionId: string; // The junction they are currently manning
    status: 'ACTIVE' | 'OFF_DUTY';
    deviceBatteryLevel: number;
}

export interface Ambulance {
    id: string;
    callSign: string;
    location: Coordinate;
    speed: number; // km/h
    heading: number; // degrees
    destination: Coordinate;
    status: 'IDLE' | 'DISPATCHED' | 'EN_ROUTE_TO_HOSPITAL';
    etaToNextJunction: number; // seconds
}
