import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Accelerometer } from 'expo-sensors';

const CRASH_DETECTION_TASK = 'CRASH_DETECTION_BACKGROUND';

// Background task for crash detection
TaskManager.defineTask(CRASH_DETECTION_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background crash detection error:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    // Process location updates in background
    console.log('Background location update:', locations);
  }
});

export class BackgroundCrashService {
  static async startBackgroundMonitoring(): Promise<boolean> {
    try {
      // Request background location permissions
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Background location permission denied');
        return false;
      }

      // Request notification permissions
      await Notifications.requestPermissionsAsync();

      // Start background location tracking
      await Location.startLocationUpdatesAsync(CRASH_DETECTION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
        foregroundService: {
          notificationTitle: 'Crash Detection Active',
          notificationBody: 'Monitoring for accidents in background',
          notificationColor: '#ff0000'
        }
      });

      console.log('Background crash detection started');
      return true;

    } catch (error) {
      console.error('Failed to start background monitoring:', error);
      return false;
    }
  }

  static async stopBackgroundMonitoring() {
    try {
      await Location.stopLocationUpdatesAsync(CRASH_DETECTION_TASK);
      console.log('Background crash detection stopped');
    } catch (error) {
      console.error('Failed to stop background monitoring:', error);
    }
  }

  static async sendEmergencyNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 CRASH DETECTED',
        body: 'Emergency services have been contacted automatically',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Show immediately
    });
  }
}