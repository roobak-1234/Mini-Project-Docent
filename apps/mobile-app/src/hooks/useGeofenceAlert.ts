import { useState, useEffect } from 'react';

export type AlertLevel = 'NONE' | 'INFO' | 'WARNING' | 'CRITICAL';

interface GeofenceAlert {
    level: AlertLevel;
    message: string;
    distanceToJunction: number; // meters
    ambulanceId?: string;
}

export const useGeofenceAlert = (junctionId: string) => {
    const [alert, setAlert] = useState<GeofenceAlert>({
        level: 'NONE',
        message: 'No active ambulances in range.',
        distanceToJunction: -1
    });

    useEffect(() => {
        // MOCK: Simulate connecting to Azure SignalR
        console.log(`[GeofenceMonitor] Connecting to SignalR for Junction ${junctionId}...`);

        const interval = setInterval(() => {
            // Randomly trigger alerts to demonstrate UI (Slightly more frequent for demo)
            const rand = Math.random();
            if (rand > 0.85) {
                setAlert({
                    level: 'CRITICAL',
                    message: 'AMBULANCE APPROACHING',
                    distanceToJunction: 300,
                    ambulanceId: 'AMB-001'
                });
            } else if (rand > 0.65) {
                setAlert({
                    level: 'WARNING',
                    message: 'Ambulance En Route',
                    distanceToJunction: 1200,
                    ambulanceId: 'AMB-001'
                });
            }
            // No automatic clear for demo stability
        }, 5000);

        return () => clearInterval(interval);
    }, [junctionId]);

    const acknowledgeAlert = () => {
        setAlert({
            level: 'NONE',
            message: 'Alert acknowledged.',
            distanceToJunction: -1
        });
    };

    return { alert, acknowledgeAlert };
};
