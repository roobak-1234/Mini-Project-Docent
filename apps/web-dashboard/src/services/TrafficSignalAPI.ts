
import { Junction, SignalStatus, ControlType } from '../types/JunctionSchema';

// MOCK DATA
const MOCK_JUNCTIONS: Junction[] = [
    {
        id: 'J-101',
        name: 'Downtown Main & 4th',
        location: { latitude: 47.6062, longitude: -122.3321 },
        controlType: ControlType.AUTOMATED,
        currentStatus: SignalStatus.GREEN,
        lastUpdated: new Date()
    },
    {
        id: 'J-102',
        name: 'Harborview Drive Entry',
        location: { latitude: 47.6040, longitude: -122.3290 },
        controlType: ControlType.MANUAL,
        currentStatus: SignalStatus.RED,
        lastUpdated: new Date()
    }
];

class TrafficSignalApiService {

    // Simulate fetching status
    async getJunctionStatus(junctionId: string): Promise<Junction | undefined> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const junction = MOCK_JUNCTIONS.find(j => j.id === junctionId);
                resolve(junction);
            }, 300); // Simulate network latency
        });
    }

    // Simulate Automated Preemption (V2I)
    async requestPreemption(junctionId: string, vehicleId: string): Promise<{ success: boolean; message: string }> {
        console.log(`[API] Preemption requested for Junction ${junctionId} by Vehicle ${vehicleId}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                // Logic: In a real system, this would contact Azure IoT Hub -> Traffic Controller
                // Here we just mock success
                const junction = MOCK_JUNCTIONS.find(j => j.id === junctionId);
                if (junction) {
                    junction.currentStatus = SignalStatus.PREEMPTED;
                    junction.lastUpdated = new Date();
                    resolve({ success: true, message: 'Signal priority granted. Green wave active.' });
                } else {
                    resolve({ success: false, message: 'Junction not found or offline.' });
                }
            }, 800);
        });
    }

    // Simulate Manual Officer Override
    async setManualOverride(junctionId: string, state: SignalStatus.MANUAL_CLEAR | SignalStatus.RED): Promise<boolean> {
        console.log(`[API] Manual override for Junction ${junctionId} to ${state}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                const junction = MOCK_JUNCTIONS.find(j => j.id === junctionId);
                if (junction) {
                    junction.currentStatus = state;
                    junction.lastUpdated = new Date();
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 500);
        });
    }

    // Get all junctions near a location (Mock implementation just returns all)
    async getNearbyJunctions(lat: number, lon: number, radiusKm: number): Promise<Junction[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_JUNCTIONS);
            }, 400);
        });
    }
}

export const TrafficSignalAPI = new TrafficSignalApiService();
