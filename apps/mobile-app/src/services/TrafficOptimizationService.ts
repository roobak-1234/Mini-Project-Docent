import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrafficSignal {
    id: string;
    location: { lat: number; lng: number };
    status: 'red' | 'yellow' | 'green';
    timeRemaining: number;
    isEmergencyOverride: boolean;
}

interface GreenCorridor {
    id: string;
    ambulanceId: string;
    route: { lat: number; lng: number }[];
    affectedSignals: string[];
    startTime: string;
    estimatedDuration: number;
    status: 'active' | 'completed' | 'cancelled';
}

class TrafficOptimizationService {
    private signals: Map<string, TrafficSignal> = new Map();
    private activeCorridors: Map<string, GreenCorridor> = new Map();

    async initializeSignals() {
        // Mock traffic signals - in real app, this would connect to city traffic system
        const mockSignals: TrafficSignal[] = [
            { id: 'SIG-001', location: { lat: 12.9716, lng: 77.5946 }, status: 'red', timeRemaining: 30, isEmergencyOverride: false },
            { id: 'SIG-002', location: { lat: 12.9352, lng: 77.6245 }, status: 'green', timeRemaining: 45, isEmergencyOverride: false },
            { id: 'SIG-003', location: { lat: 12.9279, lng: 77.6271 }, status: 'red', timeRemaining: 20, isEmergencyOverride: false }
        ];

        mockSignals.forEach(signal => {
            this.signals.set(signal.id, signal);
        });
    }

    async createGreenCorridor(ambulanceId: string, route: { lat: number; lng: number }[]): Promise<string> {
        const corridorId = `GC-${Date.now()}`;
        const affectedSignals = this.findSignalsAlongRoute(route);
        
        const corridor: GreenCorridor = {
            id: corridorId,
            ambulanceId,
            route,
            affectedSignals,
            startTime: new Date().toISOString(),
            estimatedDuration: this.calculateCorridorDuration(route),
            status: 'active'
        };

        this.activeCorridors.set(corridorId, corridor);
        
        // Override traffic signals
        await this.activateEmergencyOverride(affectedSignals);
        
        // Store for persistence
        await this.saveCorridors();
        
        return corridorId;
    }

    private findSignalsAlongRoute(route: { lat: number; lng: number }[]): string[] {
        const affectedSignals: string[] = [];
        const PROXIMITY_THRESHOLD = 0.5; // 500 meters

        route.forEach(point => {
            this.signals.forEach((signal, signalId) => {
                const distance = this.calculateDistance(point, signal.location);
                if (distance <= PROXIMITY_THRESHOLD && !affectedSignals.includes(signalId)) {
                    affectedSignals.push(signalId);
                }
            });
        });

        return affectedSignals;
    }

    private async activateEmergencyOverride(signalIds: string[]) {
        signalIds.forEach(signalId => {
            const signal = this.signals.get(signalId);
            if (signal) {
                signal.status = 'green';
                signal.isEmergencyOverride = true;
                signal.timeRemaining = 120; // 2 minutes override
                this.signals.set(signalId, signal);
            }
        });

        // In real implementation, this would send commands to traffic control system
        console.log(`Emergency override activated for signals: ${signalIds.join(', ')}`);
    }

    async updateAmbulancePosition(ambulanceId: string, position: { lat: number; lng: number }) {
        const activeCorridor = Array.from(this.activeCorridors.values())
            .find(c => c.ambulanceId === ambulanceId && c.status === 'active');

        if (activeCorridor) {
            // Check if ambulance has passed through the corridor
            const progress = this.calculateRouteProgress(position, activeCorridor.route);
            
            if (progress > 0.9) { // 90% complete
                await this.deactivateGreenCorridor(activeCorridor.id);
            } else {
                // Update signal timing based on ambulance speed
                await this.optimizeSignalTiming(activeCorridor, position);
            }
        }
    }

    private calculateRouteProgress(currentPosition: { lat: number; lng: number }, route: { lat: number; lng: number }[]): number {
        if (route.length < 2) return 0;

        let minDistance = Infinity;
        let closestSegmentIndex = 0;

        // Find closest point on route
        for (let i = 0; i < route.length - 1; i++) {
            const distance = this.distanceToLineSegment(currentPosition, route[i], route[i + 1]);
            if (distance < minDistance) {
                minDistance = distance;
                closestSegmentIndex = i;
            }
        }

        return closestSegmentIndex / (route.length - 1);
    }

    private async optimizeSignalTiming(corridor: GreenCorridor, ambulancePosition: { lat: number; lng: number }) {
        // Predict arrival time at each signal
        const speed = 50; // km/h average ambulance speed
        
        corridor.affectedSignals.forEach(signalId => {
            const signal = this.signals.get(signalId);
            if (signal && signal.isEmergencyOverride) {
                const distance = this.calculateDistance(ambulancePosition, signal.location);
                const arrivalTime = (distance / speed) * 60; // minutes
                
                // Ensure signal stays green until ambulance passes
                if (arrivalTime < signal.timeRemaining) {
                    signal.timeRemaining = Math.max(arrivalTime + 1, 30); // At least 30 seconds
                    this.signals.set(signalId, signal);
                }
            }
        });
    }

    async deactivateGreenCorridor(corridorId: string) {
        const corridor = this.activeCorridors.get(corridorId);
        if (corridor) {
            corridor.status = 'completed';
            
            // Restore normal signal operation
            corridor.affectedSignals.forEach(signalId => {
                const signal = this.signals.get(signalId);
                if (signal) {
                    signal.isEmergencyOverride = false;
                    // Resume normal cycle
                    this.resumeNormalCycle(signal);
                    this.signals.set(signalId, signal);
                }
            });

            await this.saveCorridors();
            console.log(`Green corridor ${corridorId} deactivated`);
        }
    }

    private resumeNormalCycle(signal: TrafficSignal) {
        // Implement normal traffic light cycle logic
        signal.status = 'red';
        signal.timeRemaining = 60; // Default cycle time
    }

    private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
        const R = 6371;
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLng = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private distanceToLineSegment(point: { lat: number; lng: number }, lineStart: { lat: number; lng: number }, lineEnd: { lat: number; lng: number }): number {
        const A = point.lat - lineStart.lat;
        const B = point.lng - lineStart.lng;
        const C = lineEnd.lat - lineStart.lat;
        const D = lineEnd.lng - lineStart.lng;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;
        if (param < 0) {
            xx = lineStart.lat;
            yy = lineStart.lng;
        } else if (param > 1) {
            xx = lineEnd.lat;
            yy = lineEnd.lng;
        } else {
            xx = lineStart.lat + param * C;
            yy = lineStart.lng + param * D;
        }

        const dx = point.lat - xx;
        const dy = point.lng - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private calculateCorridorDuration(route: { lat: number; lng: number }[]): number {
        let totalDistance = 0;
        for (let i = 0; i < route.length - 1; i++) {
            totalDistance += this.calculateDistance(route[i], route[i + 1]);
        }
        return Math.ceil((totalDistance / 50) * 60); // minutes at 50 km/h
    }

    private async saveCorridors() {
        try {
            const corridorsArray = Array.from(this.activeCorridors.values());
            await AsyncStorage.setItem('green_corridors', JSON.stringify(corridorsArray));
        } catch (error) {
            console.error('Failed to save corridors:', error);
        }
    }

    async getActiveCorridors(): Promise<GreenCorridor[]> {
        return Array.from(this.activeCorridors.values()).filter(c => c.status === 'active');
    }

    getSignalStatus(signalId: string): TrafficSignal | undefined {
        return this.signals.get(signalId);
    }
}

export const trafficOptimizationService = new TrafficOptimizationService();