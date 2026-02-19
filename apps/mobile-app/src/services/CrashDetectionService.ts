import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import { emergencyService } from './EmergencyService';
import { authService } from './AuthService';

interface SensorData {
    x: number;
    y: number;
    z: number;
    timestamp: number;
}

interface CrashEvent {
    id: string;
    userId: string;
    location: { lat: number; lng: number };
    accelerationMagnitude: number;
    timestamp: string;
    severity: 'minor' | 'moderate' | 'severe';
    autoConfirmed: boolean;
}

class CrashDetectionService {
    private isMonitoring = false;
    private accelerometerData: SensorData[] = [];
    private gyroscopeData: SensorData[] = [];
    private lastLocation: { lat: number; lng: number } | null = null;
    private crashThreshold = 25; // m/s² - typical car crash threshold
    private gyroThreshold = 10; // rad/s - sudden rotation threshold

    async startMonitoring(): Promise<boolean> {
        if (this.isMonitoring) return true;

        try {
            // Request permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Location permission denied');
                return false;
            }

            // Start location tracking and wait for initial location
            await this.startLocationTracking();

            // Start sensor monitoring
            Accelerometer.setUpdateInterval(100); // 10Hz
            Gyroscope.setUpdateInterval(100);

            const accelSubscription = Accelerometer.addListener(this.handleAccelerometerData.bind(this));
            const gyroSubscription = Gyroscope.addListener(this.handleGyroscopeData.bind(this));

            this.isMonitoring = true;
            console.log('Crash detection monitoring started with location:', this.lastLocation);
            return true;

        } catch (error) {
            console.error('Failed to start crash detection:', error);
            return false;
        }
    }

    private async startLocationTracking() {
        try {
            // Get current location first
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            
            this.lastLocation = {
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude
            };
            
            console.log('Initial location obtained:', this.lastLocation);
            
            // Start watching for location updates
            Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10
                },
                (location) => {
                    this.lastLocation = {
                        lat: location.coords.latitude,
                        lng: location.coords.longitude
                    };
                }
            );
        } catch (error) {
            console.error('Failed to get location:', error);
            throw error;
        }
    }

    private handleAccelerometerData(data: { x: number; y: number; z: number }) {
        const timestamp = Date.now();
        const sensorData: SensorData = { ...data, timestamp };
        
        // Keep only last 50 readings (5 seconds at 10Hz)
        this.accelerometerData.push(sensorData);
        if (this.accelerometerData.length > 50) {
            this.accelerometerData.shift();
        }

        // Calculate acceleration magnitude
        const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
        
        // Check for crash threshold
        if (magnitude > this.crashThreshold) {
            this.detectPotentialCrash(magnitude, timestamp);
        }
    }

    private handleGyroscopeData(data: { x: number; y: number; z: number }) {
        const timestamp = Date.now();
        const sensorData: SensorData = { ...data, timestamp };
        
        this.gyroscopeData.push(sensorData);
        if (this.gyroscopeData.length > 50) {
            this.gyroscopeData.shift();
        }

        // Check for sudden rotation (rollover detection)
        const rotationMagnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
        if (rotationMagnitude > this.gyroThreshold) {
            this.detectPotentialCrash(rotationMagnitude * 5, timestamp); // Weight rotation events
        }
    }

    private async detectPotentialCrash(magnitude: number, timestamp: number) {
        // Prevent multiple detections within 10 seconds
        const recentCrashes = this.accelerometerData.filter(
            d => timestamp - d.timestamp < 10000 && Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2) > this.crashThreshold
        );
        
        if (recentCrashes.length > 1) return; // Already processing

        // Analyze sensor pattern for crash confirmation
        const isCrash = await this.analyzeCrashPattern(magnitude);
        
        if (isCrash) {
            await this.triggerCrashResponse(magnitude);
        }
    }

    private async analyzeCrashPattern(magnitude: number): Promise<boolean> {
        // Simple crash detection algorithm
        // In production, this would use ML models trained on crash data
        
        const recentAccel = this.accelerometerData.slice(-10); // Last 1 second
        const recentGyro = this.gyroscopeData.slice(-10);
        
        // Check for sudden deceleration followed by stillness
        const avgAccelBefore = this.calculateAverageAcceleration(this.accelerometerData.slice(-20, -10));
        const avgAccelAfter = this.calculateAverageAcceleration(recentAccel);
        
        const suddenStop = avgAccelBefore > 5 && avgAccelAfter < 2;
        const highImpact = magnitude > this.crashThreshold;
        const rotationalMovement = recentGyro.some(g => 
            Math.sqrt(g.x ** 2 + g.y ** 2 + g.z ** 2) > 5
        );

        return highImpact && (suddenStop || rotationalMovement);
    }

    private calculateAverageAcceleration(data: SensorData[]): number {
        if (data.length === 0) return 0;
        
        const sum = data.reduce((acc, d) => 
            acc + Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2), 0
        );
        
        return sum / data.length;
    }

    private async triggerCrashResponse(magnitude: number) {
        if (!this.lastLocation) {
            console.error('No location available for crash detection');
            return;
        }

        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            console.error('No user logged in for crash detection');
            return;
        }

        let severity: 'minor' | 'moderate' | 'severe' = 'moderate';
        if (magnitude > 40) severity = 'severe';
        else if (magnitude < 30) severity = 'minor';

        const crashEvent: CrashEvent = {
            id: `CRASH-${Date.now()}`,
            userId: currentUser.id,
            location: this.lastLocation,
            accelerationMagnitude: magnitude,
            timestamp: new Date().toISOString(),
            severity,
            autoConfirmed: false
        };

        // Show confirmation dialog with 30-second countdown
        await this.showCrashConfirmationDialog(crashEvent);
    }

    private async showCrashConfirmationDialog(crashEvent: CrashEvent) {
        return new Promise<void>((resolve) => {
            let countdown = 30;
            let timeoutId: NodeJS.Timeout;
            let intervalId: NodeJS.Timeout;

            const confirmCrash = async () => {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                await this.createEmergencyCall(crashEvent);
                resolve();
            };

            const cancelAlert = () => {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                console.log('Crash alert cancelled by user');
                resolve();
            };

            // Auto-confirm after 30 seconds
            timeoutId = setTimeout(async () => {
                clearInterval(intervalId);
                crashEvent.autoConfirmed = true;
                await this.createEmergencyCall(crashEvent);
                resolve();
            }, 30000);

            // Update countdown every second
            intervalId = setInterval(() => {
                countdown--;
                // In a real app, this would update the UI
                console.log(`Emergency alert in ${countdown} seconds...`);
            }, 1000);

            // Show alert dialog (React Native Alert)
            const Alert = require('react-native').Alert;
            Alert.alert(
                '🚨 CRASH DETECTED',
                `A potential accident has been detected.\n\nEmergency services will be contacted automatically in 30 seconds unless you cancel.\n\nAre you okay?`,
                [
                    {
                        text: "I'm OK - Cancel Alert",
                        onPress: cancelAlert,
                        style: 'cancel'
                    },
                    {
                        text: 'SEND HELP NOW',
                        onPress: confirmCrash,
                        style: 'destructive'
                    }
                ],
                { 
                    cancelable: false // Prevent dismissing by tapping outside
                }
            );
        });
    }

    private async createEmergencyCall(crashEvent: CrashEvent) {
        const emergencyCallId = await emergencyService.createEmergencyCall({
            patientId: crashEvent.userId,
            location: crashEvent.location,
            severity: crashEvent.severity === 'minor' ? 'medium' : 'critical',
            symptoms: `${crashEvent.autoConfirmed ? 'Auto-detected' : 'User-confirmed'} vehicle crash. Impact: ${crashEvent.accelerationMagnitude.toFixed(1)} m/s²`
        });

        console.log(`Emergency call created: ${emergencyCallId}`);
        
        // Play emergency sound and vibration
        this.playEmergencyAlert();
        
        // Show emergency response confirmation
        await this.showEmergencyResponseConfirmation(crashEvent.autoConfirmed);
    }

    private async showEmergencyResponseConfirmation(autoConfirmed: boolean = false) {
        // Get nearest hospital (in production, this would come from the emergency service)
        const nearestHospital = this.getNearestHospital();
        
        const Alert = require('react-native').Alert;
        
        const title = autoConfirmed ? '🚨 EMERGENCY RESPONSE ACTIVATED' : '✅ EMERGENCY RESPONSE ACTIVATED';
        const message = autoConfirmed 
            ? `⚠️ USER DID NOT RESPOND - SIGNS OF CRASH/ACCIDENT DETECTED\n\nYour details have been sent to ${nearestHospital.name}.\n\nAmbulance will be dispatched immediately.\n\nEstimated arrival: 8-12 minutes\n\nStay calm and remain at your location if safe.`
            : `Your details have been sent to ${nearestHospital.name}.\n\nAmbulance will be dispatched immediately.\n\nEstimated arrival: 8-12 minutes\n\nStay calm and remain at your location if safe.`;
        
        return new Promise<void>((resolve) => {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: 'OK',
                        onPress: () => resolve(),
                        style: 'default'
                    }
                ],
                { cancelable: false }
            );
        });
    }

    private getNearestHospital() {
        // In production, this would calculate based on GPS location
        // For now, return a sample hospital
        const hospitals = [
            { name: 'City General Hospital', distance: 2.3 },
            { name: 'St. Mary\'s Medical Center', distance: 3.1 },
            { name: 'Regional Emergency Hospital', distance: 4.2 },
            { name: 'Metro Health Center', distance: 1.8 }
        ];
        
        // Return closest hospital
        return hospitals.sort((a, b) => a.distance - b.distance)[0];
    }

    private playEmergencyAlert() {
        // Vibration pattern for emergency
        const { Vibration } = require('react-native');
        Vibration.vibrate([500, 200, 500, 200, 500]); // SOS pattern
        
        // In production, would also play emergency sound
        console.log('🚨 EMERGENCY ALERT ACTIVATED 🚨');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        // Remove sensor listeners
        Accelerometer.removeAllListeners();
        Gyroscope.removeAllListeners();
        
        this.isMonitoring = false;
        console.log('Crash detection monitoring stopped');
    }

    isActive(): boolean {
        return this.isMonitoring;
    }

    // Manual crash report for testing
    async reportManualCrash(severity: 'minor' | 'moderate' | 'severe' = 'moderate') {
        if (!this.lastLocation) {
            console.error('No location available');
            return;
        }

        await this.triggerCrashResponse(severity === 'severe' ? 45 : severity === 'moderate' ? 30 : 20);
    }
}

export const crashDetectionService = new CrashDetectionService();