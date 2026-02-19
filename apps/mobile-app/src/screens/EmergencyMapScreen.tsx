import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Truck, Building2 } from 'lucide-react-native';
import { NavigationProp } from '@react-navigation/native';
import AzureMapView from '../components/AzureMapView';
import { emergencyService } from '../services/EmergencyService';
import { azureMapsService } from '../services/AzureMapsService';
import * as Location from 'expo-location';

interface Props {
    navigation: NavigationProp<any>;
}

export default function EmergencyMapScreen({ navigation }: Props) {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
    const [activeEmergencies, setActiveEmergencies] = useState<any[]>([]);
    const [mapMarkers, setMapMarkers] = useState<any[]>([]);

    useEffect(() => {
        loadMapData();
    }, []);

    const loadMapData = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const position = await Location.getCurrentPositionAsync({});
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            setCurrentLocation(location);

            // Load nearby hospitals
            const hospitals = await azureMapsService.findNearbyHospitals(location.lat, location.lng);
            setNearbyHospitals(hospitals);

            // Load active emergencies
            const emergencies = await emergencyService.getActiveEmergencies();
            setActiveEmergencies(emergencies);

            // Create map markers
            const markers = [
                ...hospitals.map(h => ({
                    lat: h.location.lat,
                    lng: h.location.lng,
                    title: h.name,
                    color: '0x00FF00'
                })),
                ...emergencies.map(e => ({
                    lat: e.location.lat,
                    lng: e.location.lng,
                    title: `Emergency ${e.id}`,
                    color: '0xFF0000'
                }))
            ];
            
            setMapMarkers(markers);

        } catch (error) {
            console.error('Error loading map data:', error);
        }
    };

    const createEmergencyCall = () => {
        if (!currentLocation) {
            Alert.alert('Error', 'Location not available');
            return;
        }

        Alert.alert(
            'Create Emergency Call',
            'This will dispatch emergency services to your location.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call Emergency', style: 'destructive', onPress: handleEmergencyCall }
            ]
        );
    };

    const handleEmergencyCall = async () => {
        if (!currentLocation) return;

        try {
            const callId = await emergencyService.createEmergencyCall({
                patientId: 'current-user',
                location: currentLocation,
                severity: 'high',
                symptoms: 'Manual emergency call from mobile app'
            });

            Alert.alert('Emergency Call Created', `Call ID: ${callId}\nHelp is on the way!`);
            loadMapData(); // Refresh data
        } catch (error) {
            Alert.alert('Error', 'Failed to create emergency call');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#64748B" />
                </TouchableOpacity>
                <Text style={styles.title}>Emergency Map</Text>
            </View>

            <View style={styles.mapContainer}>
                <AzureMapView
                    location={currentLocation}
                    markers={mapMarkers}
                    height={300}
                    showCurrentLocation={true}
                />
            </View>

            <ScrollView style={styles.content}>
                <TouchableOpacity style={styles.emergencyButton} onPress={createEmergencyCall}>
                    <Text style={styles.emergencyButtonText}>🚨 EMERGENCY CALL</Text>
                </TouchableOpacity>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nearby Hospitals ({nearbyHospitals.length})</Text>
                    {nearbyHospitals.map((hospital, index) => (
                        <View key={index} style={styles.hospitalCard}>
                            <Building2 size={20} color="#10B981" />
                            <View style={styles.hospitalInfo}>
                                <Text style={styles.hospitalName}>{hospital.name}</Text>
                                <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                                <Text style={styles.hospitalDistance}>{(hospital.distance / 1000).toFixed(1)} km away</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active Emergencies ({activeEmergencies.length})</Text>
                    {activeEmergencies.map((emergency) => (
                        <View key={emergency.id} style={styles.emergencyCard}>
                            <Truck size={20} color="#EF4444" />
                            <View style={styles.emergencyInfo}>
                                <Text style={styles.emergencyId}>{emergency.id}</Text>
                                <Text style={styles.emergencyStatus}>Status: {emergency.status}</Text>
                                <Text style={styles.emergencyTime}>
                                    {new Date(emergency.timestamp).toLocaleTimeString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    mapContainer: {
        margin: 16,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emergencyButton: {
        backgroundColor: '#DC2626',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    emergencyButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 12,
    },
    hospitalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    hospitalInfo: {
        marginLeft: 12,
        flex: 1,
    },
    hospitalName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    hospitalAddress: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    hospitalDistance: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
        marginTop: 2,
    },
    emergencyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    emergencyInfo: {
        marginLeft: 12,
        flex: 1,
    },
    emergencyId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
    },
    emergencyStatus: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    emergencyTime: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
});