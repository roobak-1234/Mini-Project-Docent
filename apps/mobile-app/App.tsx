import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LandingScreen from './src/screens/LandingScreen';
import SigninScreen from './src/screens/auth/SigninScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import TrafficSentinelScreen from './src/screens/TrafficSentinelScreen';
import PatientDashboardScreen from './src/screens/PatientDashboardScreen';
import DoctorDashboardScreen from './src/screens/DoctorDashboardScreen';
import NurseDashboardScreen from './src/screens/NurseDashboardScreen';
import AmbulanceDashboardScreen from './src/screens/AmbulanceDashboardScreen';
import RPMPatientDashboardScreen from './src/screens/RPMPatientDashboardScreen';
import HospitalRegistrationScreen from './src/screens/HospitalRegistrationScreen';
import ChatScreen from './src/screens/ChatScreen';
import HospitalManagementScreen from './src/screens/HospitalManagementScreen';
import EmergencyMapScreen from './src/screens/EmergencyMapScreen';
import LiveMonitorScreen from './src/screens/LiveMonitorScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Signin" component={SigninScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="TrafficSentinel" component={TrafficSentinelScreen} />
          <Stack.Screen name="PatientDashboard" component={PatientDashboardScreen} />
          <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
          <Stack.Screen name="NurseDashboard" component={NurseDashboardScreen} />
          <Stack.Screen name="AmbulanceDashboard" component={AmbulanceDashboardScreen} />
          <Stack.Screen name="RPMPatientDashboard" component={RPMPatientDashboardScreen} />
          <Stack.Screen name="HospitalRegistration" component={HospitalRegistrationScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="HospitalManagement" component={HospitalManagementScreen} />
          <Stack.Screen name="LiveMonitor" component={LiveMonitorScreen} />
          <Stack.Screen name="EmergencyMap" component={EmergencyMapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
