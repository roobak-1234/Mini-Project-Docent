import AsyncStorage from '@react-native-async-storage/async-storage';
import { ambulanceSignalRService } from './AmbulanceSignalRService';

interface EmergencyCall {
    id: string;
    patientId: string;
    location: { lat: number; lng: number };
    severity: 'low' | 'medium' | 'high' | 'critical';
    symptoms: string;
    vitals?: {
        heartRate?: number;
        bloodPressure?: string;
        spO2?: number;
    };
    assignedAmbulance?: string;
    assignedHospital?: string;
    status: 'pending' | 'dispatched' | 'en-route' | 'arrived' | 'completed';
    timestamp: string;
}

interface Hospital {
    id: string;
    name: string;
    location: { lat: number; lng: number };
    availableBeds: {
        icu: number;
        hdu: number;
        isolation: number;
    };
    specializations: string[];
    distance?: number;
}

class EmergencyService {
    async createEmergencyCall(callData: Omit<EmergencyCall, 'id' | 'timestamp' | 'status'>): Promise<string> {
        const emergencyCall: EmergencyCall = {
            ...callData,
            id: `EMG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        const calls = await this.getEmergencyCalls();
        calls.push(emergencyCall);
        await AsyncStorage.setItem('emergency_calls', JSON.stringify(calls));

        // Trigger ambulance dispatch logic
        await this.dispatchAmbulance(emergencyCall);

        return emergencyCall.id;
    }

    async getEmergencyCalls(): Promise<EmergencyCall[]> {
        try {
            const calls = await AsyncStorage.getItem('emergency_calls');
            return calls ? JSON.parse(calls) : [];
        } catch {
            return [];
        }
    }

    async updateCallStatus(callId: string, status: EmergencyCall['status'], updates?: Partial<EmergencyCall>) {
        const calls = await this.getEmergencyCalls();
        const callIndex = calls.findIndex(c => c.id === callId);
        
        if (callIndex !== -1) {
            calls[callIndex] = { ...calls[callIndex], status, ...updates };
            await AsyncStorage.setItem('emergency_calls', JSON.stringify(calls));
        }
    }

    private async dispatchAmbulance(call: EmergencyCall) {
        const availableAmbulances = await this.getAvailableAmbulances();
        const nearestAmbulance = this.findNearestAmbulance(availableAmbulances, call.location);
        
        if (nearestAmbulance) {
            await this.updateCallStatus(call.id, 'dispatched', { 
                assignedAmbulance: nearestAmbulance.id 
            });
            
            // Notify ambulance via SignalR
            await ambulanceSignalRService.broadcastAmbulanceUpdate({
                ambulanceId: nearestAmbulance.id,
                location: call.location,
                timestamp: Date.now()
            });
        }
    }

    async getAvailableAmbulances(): Promise<any[]> {
        // Mock ambulance data - in real app, this would come from GPS tracking
        return [
            { id: 'AMB-001', location: { lat: 12.9716, lng: 77.5946 }, status: 'available' },
            { id: 'AMB-002', location: { lat: 12.9352, lng: 77.6245 }, status: 'available' }
        ];
    }

    private findNearestAmbulance(ambulances: any[], location: { lat: number; lng: number }) {
        return ambulances.reduce((nearest, ambulance) => {
            const distance = this.calculateDistance(location, ambulance.location);
            return !nearest || distance < nearest.distance 
                ? { ...ambulance, distance }
                : nearest;
        }, null);
    }

    async findOptimalHospital(location: { lat: number; lng: number }, severity: string): Promise<Hospital | null> {
        const hospitals = await this.getHospitals();
        
        return hospitals
            .map(h => ({
                ...h,
                distance: this.calculateDistance(location, h.location)
            }))
            .filter(h => h.availableBeds.icu > 0 || severity !== 'critical')
            .sort((a, b) => {
                // Prioritize by severity match and distance
                const aScore = this.calculateHospitalScore(a, severity);
                const bScore = this.calculateHospitalScore(b, severity);
                return bScore - aScore;
            })[0] || null;
    }

    private calculateHospitalScore(hospital: Hospital & { distance: number }, severity: string): number {
        let score = 100 - hospital.distance; // Base score by proximity
        
        // Boost score for critical cases with ICU beds
        if (severity === 'critical' && hospital.availableBeds.icu > 0) {
            score += 50;
        }
        
        // Boost for specializations
        if (hospital.specializations.includes('trauma')) {
            score += 20;
        }
        
        return score;
    }

    private async getHospitals(): Promise<Hospital[]> {
        try {
            const hospitals = await AsyncStorage.getItem('registered_hospitals');
            return hospitals ? JSON.parse(hospitals).map((h: any) => ({
                id: h.uniqueHospitalId || h.id,
                name: h.name,
                location: { lat: h.latitude || 12.9716, lng: h.longitude || 77.5946 },
                availableBeds: {
                    icu: parseInt(h.icuBeds) || 0,
                    hdu: parseInt(h.hduBeds) || 0,
                    isolation: parseInt(h.isolationBeds) || 0
                },
                specializations: Object.entries(h.specializations || {})
                    .filter(([_, value]) => value)
                    .map(([key]) => key)
            })) : [];
        } catch {
            return [];
        }
    }

    private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
        const R = 6371; // Earth's radius in km
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLng = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    async updateVitals(callId: string, vitals: any) {
        await this.updateCallStatus(callId, 'en-route', { vitals });
    }

    async getActiveEmergencies(): Promise<EmergencyCall[]> {
        const calls = await this.getEmergencyCalls();
        return calls.filter(c => ['pending', 'dispatched', 'en-route'].includes(c.status));
    }
}

export const emergencyService = new EmergencyService();