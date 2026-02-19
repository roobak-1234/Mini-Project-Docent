import { useState, useEffect, useCallback } from 'react';

// Configuration
const IMPACT_THRESHOLD_G = 4.0; // 4 Gs is a reasonable start for a "hard stop" or impact
const ZERO_RESPONSE_TIMEOUT_MS = 25000; // 25 seconds

interface CrashStatus {
    isCrashDetected: boolean;
    gForce: number;
    timeRemaining: number;
    isEmergencyTriggered: boolean;
}

/**
 * useCrashDetection Hook
 * Monitors device motion for G-force spikes exceeding threshold.
 * Triggers a countdown that, if not cancelled, executes the onEmergency callback.
 * 
 * @param onEmergency - Callback function to execute when countdown hits zero
 * @returns crashStatus object and cancel function
 */
export const useCrashDetection = (onEmergency: () => void) => {
    const [crashStatus, setCrashStatus] = useState<CrashStatus>({
        isCrashDetected: false,
        gForce: 0,
        timeRemaining: ZERO_RESPONSE_TIMEOUT_MS / 1000,
        isEmergencyTriggered: false,
    });

    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    const handleMotion = useCallback((event: DeviceMotionEvent) => {
        if (crashStatus.isCrashDetected || crashStatus.isEmergencyTriggered) return;

        const { accelerationIncludingGravity } = event;
        if (!accelerationIncludingGravity) return;

        const x = accelerationIncludingGravity.x || 0;
        const y = accelerationIncludingGravity.y || 0;
        const z = accelerationIncludingGravity.z || 0;

        // Calculate G-force magnitude
        // 1G = 9.8 m/s^2 roughly
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const gForce = magnitude / 9.81;

        if (gForce > IMPACT_THRESHOLD_G) {
            triggerCrashProtocol(gForce);
        }
    }, [crashStatus.isCrashDetected, crashStatus.isEmergencyTriggered]);

    const triggerCrashProtocol = (force: number) => {
        setCrashStatus(prev => ({
            ...prev,
            isCrashDetected: true,
            gForce: force,
            timeRemaining: ZERO_RESPONSE_TIMEOUT_MS / 1000
        }));
    };

    // Countdown Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (crashStatus.isCrashDetected && !crashStatus.isEmergencyTriggered && crashStatus.timeRemaining > 0) {
            interval = setInterval(() => {
                setCrashStatus(prev => {
                    const newVal = prev.timeRemaining - 1;
                    if (newVal <= 0) {
                        clearInterval(interval);
                        onEmergency();
                        return { ...prev, timeRemaining: 0, isEmergencyTriggered: true };
                    }
                    return { ...prev, timeRemaining: newVal };
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [crashStatus.isCrashDetected, crashStatus.timeRemaining, crashStatus.isEmergencyTriggered, onEmergency]);

    // Motion Event Listener
    useEffect(() => {
        // Feature detection for iOS 13+ permissions if needed
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            (DeviceMotionEvent as any).requestPermission()
                .then((response: string) => {
                    if (response === 'granted') {
                        window.addEventListener('devicemotion', handleMotion);
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('devicemotion', handleMotion);
        }

        return () => {
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, [handleMotion]);

    const cancelEmergency = () => {
        setCrashStatus({
            isCrashDetected: false,
            gForce: 0,
            timeRemaining: ZERO_RESPONSE_TIMEOUT_MS / 1000,
            isEmergencyTriggered: false,
        });
    };

    return {
        ...crashStatus,
        cancelEmergency,
    };
};
