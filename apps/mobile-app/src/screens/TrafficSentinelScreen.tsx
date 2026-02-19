import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { TriangleAlert, Zap, Shield, Power } from 'lucide-react-native';
import { useGeofenceAlert } from '../hooks/useGeofenceAlert';
import { TrafficSignalAPI } from '../services/TrafficSignalAPI';
import { SignalStatus } from '../types';
import { authService } from '../services/AuthService';

export default function TrafficSentinelScreen() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentJunctionId, setCurrentJunctionId] = useState('J-101');
    const { alert, acknowledgeAlert } = useGeofenceAlert(currentJunctionId);

    const [status, setStatus] = useState<SignalStatus>(SignalStatus.RED);
    const [automatedMode, setAutomatedMode] = useState(true);
    
    // Debug initial state
    useEffect(() => {
        console.log('Initial state - Status:', status, 'AutomatedMode:', automatedMode);
    }, []);
    
    const defaultLocation = { lat: 40.7589, lng: -73.9851 };
    const [junctionLocation, setJunctionLocation] = useState(defaultLocation);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        
        if (user?.junctionId) {
            setCurrentJunctionId(user.junctionId);
        }
    };

    useEffect(() => {
        TrafficSignalAPI.getJunctionStatus(currentJunctionId).then(data => {
            if (data) {
                console.log('API returned status:', data.currentStatus);
                setStatus(data.currentStatus);
                // If status is MANUAL_CLEAR, set automated mode to false
                if (data.currentStatus === SignalStatus.MANUAL_CLEAR) {
                    setAutomatedMode(false);
                }
            }
        }).catch(error => {
            console.log('API error, using default state:', error);
            // Ensure consistent default state
            setStatus(SignalStatus.RED);
            setAutomatedMode(true);
        });
    }, [currentJunctionId]);

    const handleOverride = async () => {
        console.log('Clear lane button clicked, current status:', status);
        const newStatus = SignalStatus.MANUAL_CLEAR;
        setStatus(newStatus);
        setAutomatedMode(false);
        console.log('Status changed to:', newStatus, 'Mode changed to: MANUAL');
        try {
            await TrafficSignalAPI.setManualOverride(currentJunctionId, newStatus);
            acknowledgeAlert();
        } catch (error) {
            console.log('Error in override:', error);
        }
    };

    const handleRestoreAuto = async () => {
        console.log('Restore automation clicked, current mode:', automatedMode);
        setAutomatedMode(true);
        setStatus(SignalStatus.RED);
        try {
            await TrafficSignalAPI.restoreAutomation(currentJunctionId);
            console.log('Automation restored successfully');
        } catch (error) {
            console.log('Error restoring automation:', error);
        }
    };

    const getStatusColor = (s: SignalStatus) => {
        switch (s) {
            case SignalStatus.GREEN: return '#10B981';
            case SignalStatus.MANUAL_CLEAR: return '#A855F7';
            default: return '#EF4444';
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.iconContainer}>
                            <Shield size={20} color="white" />
                        </View>
                        <View>
                            <Text style={styles.title}>TRAFFIC<Text style={styles.titleAccent}>SENTINEL</Text></Text>
                            <Text style={styles.subtitle}>Intelligent Control</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.officerLabel}>OFFICER</Text>
                        <Text style={styles.officerName}>{currentUser?.badgeNumber || currentUser?.username || 'OFFICER'}</Text>
                    </View>
                </View>

                {alert.level !== 'NONE' && (
                    <View style={[
                        styles.alertBanner,
                        alert.level === 'CRITICAL' ? styles.alertCritical : styles.alertWarning
                    ]}>
                        <TriangleAlert size={16} color={alert.level === 'CRITICAL' ? '#EF4444' : '#F59E0B'} />
                        <Text style={[
                            styles.alertText,
                            alert.level === 'CRITICAL' ? styles.alertTextCritical : styles.alertTextWarning
                        ]}>{alert.message}</Text>
                    </View>
                )}
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: junctionLocation.lat,
                        longitude: junctionLocation.lng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                >
                    <Marker
                        coordinate={{
                            latitude: junctionLocation.lat,
                            longitude: junctionLocation.lng,
                        }}
                        title={currentUser?.junctionId || currentJunctionId}
                        description={currentUser?.junctionId ? `Junction: ${currentUser.junctionId}` : 'Traffic Control Point'}
                        pinColor="red"
                    />
                    <Marker
                        coordinate={{
                            latitude: 40.7595,
                            longitude: -73.9845,
                        }}
                        title="Emergency Vehicle"
                        description="Ambulance Unit 12"
                        pinColor="green"
                    />
                </MapView>
            </View>

            <View style={styles.controls}>
                <View style={styles.statusContainer}>
                    <View>
                        <Text style={styles.statusLabel}>Signal Status</Text>
                        <Text style={[styles.statusValue, { color: getStatusColor(status) }]}>{status}</Text>
                    </View>
                    <View style={[
                        styles.modeBadge,
                        automatedMode ? styles.modeBadgeAuto : styles.modeBadgeManual
                    ]}>
                        <Text style={[
                            styles.modeText,
                            automatedMode ? styles.modeTextAuto : styles.modeTextManual
                        ]}>
                            {automatedMode ? 'AI ACTIVE' : 'MANUAL'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.overrideButton,
                        status === SignalStatus.MANUAL_CLEAR ? styles.overrideButtonDisabled : styles.overrideButtonActive
                    ]}
                    onPress={() => {
                        console.log('Button pressed, disabled:', status === SignalStatus.MANUAL_CLEAR);
                        if (status !== SignalStatus.MANUAL_CLEAR) {
                            handleOverride();
                        }
                    }}
                    activeOpacity={status === SignalStatus.MANUAL_CLEAR ? 1 : 0.7}
                >
                    <Zap size={32} color={status === SignalStatus.MANUAL_CLEAR ? '#64748B' : 'white'} />
                    <Text style={[
                        styles.overrideButtonText,
                        status === SignalStatus.MANUAL_CLEAR ? styles.overrideButtonTextDisabled : styles.overrideButtonTextActive
                    ]}>
                        {status === SignalStatus.MANUAL_CLEAR ? 'LANE CLEARED' : 'CLEAR LANE'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[
                        styles.restoreButton,
                        !automatedMode ? styles.restoreButtonActive : styles.restoreButtonInactive
                    ]} 
                    onPress={() => {
                        console.log('Restore button pressed, disabled:', automatedMode);
                        if (!automatedMode) {
                            handleRestoreAuto();
                        }
                    }}
                    activeOpacity={automatedMode ? 1 : 0.7}
                >
                    <Power size={20} color={automatedMode ? '#64748B' : '#22D3EE'} />
                    <Text style={[
                        styles.restoreButtonText,
                        automatedMode ? styles.restoreButtonTextInactive : styles.restoreButtonTextActive
                    ]}>Restore Automation</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0F1C',
    },
    header: {
        backgroundColor: '#1E293B',
        borderBottomColor: '#334155',
        borderBottomWidth: 1,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: '#2563EB',
        padding: 8,
        borderRadius: 8,
        marginRight: 12,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    titleAccent: {
        color: '#22D3EE',
    },
    subtitle: {
        color: 'rgba(34, 211, 238, 0.8)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    officerLabel: {
        color: '#94A3B8',
        fontSize: 10,
        textAlign: 'right',
    },
    officerName: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'right',
    },
    alertBanner: {
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    alertCritical: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    alertWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 0.5)',
    },
    alertText: {
        marginLeft: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    alertTextCritical: {
        color: '#F87171',
    },
    alertTextWarning: {
        color: '#FBBF24',
    },
    mapContainer: {
        height: '50%',
        backgroundColor: '#1E293B',
    },
    map: {
        flex: 1,
    },
    controls: {
        height: '50%',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        padding: 16,
        borderTopColor: '#475569',
        borderTopWidth: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statusLabel: {
        color: '#94A3B8',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    statusValue: {
        fontSize: 30,
        fontWeight: '900',
    },
    modeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    modeBadgeAuto: {
        borderColor: 'rgba(34, 211, 238, 0.3)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
    },
    modeBadgeManual: {
        borderColor: 'rgba(168, 85, 247, 0.3)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
    },
    modeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    modeTextAuto: {
        color: '#22D3EE',
    },
    modeTextManual: {
        color: '#A855F7',
    },
    overrideButton: {
        width: '100%',
        height: 96,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    overrideButtonActive: {
        backgroundColor: '#059669',
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        borderTopWidth: 1,
    },
    overrideButtonDisabled: {
        backgroundColor: '#1E293B',
        borderColor: '#475569',
        borderWidth: 2,
    },
    overrideButtonText: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 4,
    },
    overrideButtonTextActive: {
        color: 'white',
    },
    overrideButtonTextDisabled: {
        color: '#64748B',
    },
    restoreButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    restoreButtonActive: {
        borderColor: 'rgba(34, 211, 238, 0.3)',
        backgroundColor: 'rgba(8, 47, 73, 0.3)',
    },
    restoreButtonInactive: {
        borderColor: 'rgba(100, 116, 139, 0.3)',
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
    },
    restoreButtonText: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginLeft: 8,
        letterSpacing: 1,
    },
    restoreButtonTextActive: {
        color: '#22D3EE',
    },
    restoreButtonTextInactive: {
        color: '#64748B',
    },
});