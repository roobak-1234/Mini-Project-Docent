import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, MapPin, Phone, Clock, AlertTriangle, Truck, Shield, Heart, Activity, Thermometer, Bluetooth, Wifi } from 'lucide-react-native';
import { crashDetectionService } from '../services/CrashDetectionService';
import { NavigationProp } from '@react-navigation/native';

interface Props {
    navigation: NavigationProp<any>;
}

export default function AmbulanceDashboardScreen({ navigation }: Props) {
    const [currentStatus, setCurrentStatus] = useState<'available' | 'dispatched' | 'enroute' | 'onscene'>('available');
    const [currentLocation, setCurrentLocation] = useState({ lat: 40.7128, lng: -74.0060 });
    const [crashDetectionActive, setCrashDetectionActive] = useState(false);
    const [showVitalsForm, setShowVitalsForm] = useState(false);
    const [bluetoothConnected, setBluetoothConnected] = useState(false);
    const [wifiConnected, setWifiConnected] = useState(false);
    const [pendingDispatch, setPendingDispatch] = useState(false); // Start with false, show button to simulate
    const [dispatchAccepted, setDispatchAccepted] = useState(false); // Track if dispatch is accepted
    const [vitals, setVitals] = useState({
        heartRate: '',
        bloodPressure: '',
        spO2: '',
        temperature: '',
        respiratoryRate: '',
        patientName: ''
    });

    useEffect(() => {
        setCrashDetectionActive(crashDetectionService.isActive());
    }, []);

    const emergencyCall = {
        id: 'EMG-001',
        location: '123 Main St, New York, NY',
        type: 'Cardiac Emergency',
        priority: 'High',
        distance: '2.3 miles',
        eta: '8 minutes',
        caller: 'John Doe',
        phone: '555-0123'
    };

    const handleStatusChange = (newStatus: typeof currentStatus) => {
        setCurrentStatus(newStatus);
        
        // Reset dispatch states when returning to available
        if (newStatus === 'available') {
            setDispatchAccepted(false);
            setPendingDispatch(false);
        }
        
        Alert.alert('Status Updated', `Status changed to ${newStatus.toUpperCase()}`);
    };

    const handleAcceptDispatch = () => {
        Alert.alert(
            '🚨 ACCEPT DISPATCH',
            `Emergency Call: ${emergencyCall.type}\nLocation: ${emergencyCall.location}\nPriority: ${emergencyCall.priority}\n\nAccept this dispatch?`,
            [
                { 
                    text: 'Decline', 
                    style: 'cancel',
                    onPress: () => {
                        setPendingDispatch(false);
                        Alert.alert('Dispatch Declined', 'Emergency call declined. Returning to available status.');
                    }
                },
                { 
                    text: 'ACCEPT DISPATCH', 
                    style: 'destructive',
                    onPress: () => {
                        setDispatchAccepted(true);
                        setPendingDispatch(false);
                        setCurrentStatus('dispatched');
                        Alert.alert(
                            '✅ DISPATCH ACCEPTED', 
                            `You have accepted the emergency call.\n\nDispatch confirmed to control center.\nProceeding to: ${emergencyCall.location}`
                        );
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return '#66BB6A';
            case 'dispatched': return '#F59E0B';
            case 'enroute': return '#3B82F6';
            case 'onscene': return '#EF4444';
            default: return '#64748B';
        }
    };

    const toggleCrashDetection = async () => {
        if (crashDetectionActive) {
            crashDetectionService.stopMonitoring();
            setCrashDetectionActive(false);
            Alert.alert('Crash Detection', 'Crash detection disabled.');
        } else {
            const started = await crashDetectionService.startMonitoring();
            if (started) {
                setCrashDetectionActive(true);
                Alert.alert('Crash Detection', 'Crash detection is now active.');
            } else {
                Alert.alert('Error', 'Failed to start crash detection.');
            }
        }
    };

    const connectBluetooth = () => {
        setBluetoothConnected(!bluetoothConnected);
        Alert.alert(
            bluetoothConnected ? 'Bluetooth Disconnected' : 'Bluetooth Connected',
            bluetoothConnected ? 'Disconnected from Monitor-Defibrillator' : 'Connected to Monitor-Defibrillator via Bluetooth'
        );
    };

    const connectWifi = () => {
        setWifiConnected(!wifiConnected);
        Alert.alert(
            wifiConnected ? 'WiFi Disconnected' : 'WiFi Connected',
            wifiConnected ? 'Disconnected from Monitor-Defibrillator WiFi' : 'Connected to Monitor-Defibrillator via WiFi'
        );
    };

    const syncVitalsFromDevice = () => {
        if (!bluetoothConnected && !wifiConnected) {
            Alert.alert('Error', 'Please connect via Bluetooth or WiFi first');
            return;
        }
        
        const connectionType = bluetoothConnected ? 'Bluetooth' : 'WiFi';
        
        // Simulate receiving data from integrated monitor-defibrillator
        setVitals({
            ...vitals,
            heartRate: '78',
            bloodPressure: '120/80',
            spO2: '98',
            temperature: '98.6',
            respiratoryRate: '16'
        });
        Alert.alert('Success', `Vitals synced from Monitor-Defibrillator via ${connectionType}`);
    };

    const saveVitals = () => {
        if (!vitals.patientName.trim()) {
            Alert.alert('Error', 'Please enter patient name');
            return;
        }
        
        Alert.alert('Success', 'Vitals saved successfully');
        setShowVitalsForm(false);
        setVitals({
            heartRate: '',
            bloodPressure: '',
            spO2: '',
            temperature: '',
            respiratoryRate: '',
            patientName: ''
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Truck size={32} color="#66BB6A" />
                        <View style={styles.headerText}>
                            <Text style={styles.title}>Ambulance Unit</Text>
                            <Text style={styles.subtitle}>AMB-001</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(currentStatus)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(currentStatus) }]}>
                            {currentStatus.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.crashCard, crashDetectionActive && styles.crashCardActive]}
                    onPress={toggleCrashDetection}
                >
                    <Shield size={20} color={crashDetectionActive ? '#10B981' : '#6B7280'} />
                    <View style={styles.crashInfo}>
                        <Text style={styles.crashTitle}>Crash Detection</Text>
                        <Text style={[styles.crashStatus, crashDetectionActive && styles.crashStatusActive]}>
                            {crashDetectionActive ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                    <View style={[styles.crashToggle, crashDetectionActive && styles.crashToggleActive]}>
                        <Text style={[styles.crashToggleText, crashDetectionActive && styles.crashToggleTextActive]}>
                            {crashDetectionActive ? 'ON' : 'OFF'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.locationCard}>
                    <View style={styles.locationHeader}>
                        <MapPin size={20} color="#64748B" />
                        <Text style={styles.locationTitle}>Current Location</Text>
                    </View>
                    <Text style={styles.locationText}>Downtown Medical District</Text>
                    <Text style={styles.coordinates}>
                        {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </Text>
                </View>

                {pendingDispatch && (
                    <View style={styles.dispatchCard}>
                        <View style={styles.dispatchHeader}>
                            <AlertTriangle size={24} color="#F59E0B" />
                            <Text style={styles.dispatchTitle}>INCOMING DISPATCH</Text>
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>URGENT</Text>
                            </View>
                        </View>

                        <View style={styles.dispatchDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.type}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Location:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.location}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Priority:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.priority}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Distance:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.distance}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Caller:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.caller}</Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.acceptDispatchButton}
                            onPress={handleAcceptDispatch}
                        >
                            <Text style={styles.acceptDispatchText}>🚨 ACCEPT DISPATCH</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {dispatchAccepted && currentStatus !== 'available' && (
                    <View style={styles.emergencyCard}>
                        <View style={styles.emergencyHeader}>
                            <AlertTriangle size={24} color="#EF4444" />
                            <Text style={styles.emergencyTitle}>Active Emergency</Text>
                            <View style={styles.priorityBadge}>
                                <Text style={styles.priorityText}>{emergencyCall.priority}</Text>
                            </View>
                        </View>

                        <View style={styles.emergencyDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.type}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Location:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.location}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Distance:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.distance}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>ETA:</Text>
                                <Text style={styles.detailValue}>{emergencyCall.eta}</Text>
                            </View>
                        </View>

                        <View style={styles.emergencyActions}>
                            <TouchableOpacity style={styles.callButton}>
                                <Phone size={16} color="white" />
                                <Text style={styles.callButtonText}>Call Dispatch</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navigateButton}>
                                <Navigation size={16} color="white" />
                                <Text style={styles.navigateButtonText}>Navigate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {currentStatus === 'available' && !pendingDispatch && (
                    <View style={styles.availableCard}>
                        <Text style={styles.availableTitle}>Ready for Dispatch</Text>
                        <Text style={styles.availableText}>
                            Waiting for emergency calls. All systems operational.
                        </Text>
                        <TouchableOpacity 
                            style={styles.testButton}
                            onPress={() => {
                                setPendingDispatch(true);
                                setCurrentStatus('available'); // Reset status to show dispatch properly
                            }}
                        >
                            <Text style={styles.testButtonText}>Simulate Emergency Dispatch</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.statusControls}>
                    <Text style={styles.controlsTitle}>Update Status</Text>
                    <View style={styles.statusButtons}>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                currentStatus === 'available' && styles.statusButtonActive
                            ]}
                            onPress={() => {
                                handleStatusChange('available');
                                // Show completion message
                                Alert.alert(
                                    '✅ HANDOVER COMPLETE',
                                    'Patient successfully transferred to hospital.\n\nAmbulance is now available for new dispatches.'
                                );
                            }}
                        >
                            <Text style={[
                                styles.statusButtonText,
                                currentStatus === 'available' && styles.statusButtonTextActive
                            ]}>Available</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                currentStatus === 'enroute' && styles.statusButtonActive
                            ]}
                            onPress={() => handleStatusChange('enroute')}
                        >
                            <Text style={[
                                styles.statusButtonText,
                                currentStatus === 'enroute' && styles.statusButtonTextActive
                            ]}>En Route</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.statusButton,
                                currentStatus === 'onscene' && styles.statusButtonActive
                            ]}
                            onPress={() => handleStatusChange('onscene')}
                        >
                            <Text style={[
                                styles.statusButtonText,
                                currentStatus === 'onscene' && styles.statusButtonTextActive
                            ]}>On Scene</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.quickStats}>
                    <Text style={styles.controlsTitle}>Dispatch Control</Text>
                    <View style={styles.actionGrid}>
                        {!pendingDispatch ? (
                            <TouchableOpacity 
                                style={styles.simulateButton}
                                onPress={() => setPendingDispatch(true)}
                            >
                                <AlertTriangle size={24} color="#F59E0B" />
                                <Text style={styles.simulateButtonText}>Simulate Dispatch</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                style={styles.acceptButton}
                                onPress={handleAcceptDispatch}
                            >
                                <AlertTriangle size={24} color="white" />
                                <Text style={styles.acceptButtonText}>🚨 ACCEPT DISPATCH</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => setShowVitalsForm(true)}
                        >
                            <Heart size={24} color="#EF4444" />
                            <Text style={styles.actionButtonText}>Record Vitals</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.quickStats}>
                    <Text style={styles.controlsTitle}>Device Connection</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity 
                            style={[styles.actionButton, bluetoothConnected && styles.actionButtonActive]}
                            onPress={connectBluetooth}
                        >
                            <Bluetooth size={24} color={bluetoothConnected ? "white" : "#3B82F6"} />
                            <Text style={[styles.actionButtonText, bluetoothConnected && styles.actionButtonTextActive]}>
                                {bluetoothConnected ? 'Connected' : 'Connect Device'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.quickStats}>
                    <Text style={styles.controlsTitle}>Today's Stats</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>7</Text>
                            <Text style={styles.statLabel}>Calls Responded</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>4.2</Text>
                            <Text style={styles.statLabel}>Avg Response (min)</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>156</Text>
                            <Text style={styles.statLabel}>Miles Driven</Text>
                        </View>
                    </View>
                </View>

                {/* Vitals Input Modal */}
                <Modal
                    visible={showVitalsForm}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Patient Vitals</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setShowVitalsForm(false)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.deviceConnection}>
                                <View style={styles.connectionHeader}>
                                    <Text style={styles.connectionTitle}>Monitor-Defibrillator</Text>
                                    <View style={styles.connectionStatusContainer}>
                                        <View style={[styles.connectionStatus, bluetoothConnected && styles.connectionStatusActive]}>
                                            <Text style={[styles.connectionStatusText, bluetoothConnected && styles.connectionStatusTextActive]}>
                                                BT: {bluetoothConnected ? 'Connected' : 'Disconnected'}
                                            </Text>
                                        </View>
                                        <View style={[styles.connectionStatus, wifiConnected && styles.connectionStatusActive]}>
                                            <Text style={[styles.connectionStatusText, wifiConnected && styles.connectionStatusTextActive]}>
                                                WiFi: {wifiConnected ? 'Connected' : 'Disconnected'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                <View style={styles.connectionButtons}>
                                    <TouchableOpacity 
                                        style={[styles.connectionButton, bluetoothConnected && styles.connectionButtonActive]}
                                        onPress={connectBluetooth}
                                    >
                                        <Bluetooth size={16} color={bluetoothConnected ? "white" : "#3B82F6"} />
                                        <Text style={[styles.connectionButtonText, bluetoothConnected && styles.connectionButtonTextActive]}>
                                            {bluetoothConnected ? 'Disconnect BT' : 'Connect Bluetooth'}
                                        </Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={[styles.connectionButton, wifiConnected && styles.connectionButtonActive]}
                                        onPress={connectWifi}
                                    >
                                        <Wifi size={16} color={wifiConnected ? "white" : "#10B981"} />
                                        <Text style={[styles.connectionButtonText, wifiConnected && styles.connectionButtonTextActive]}>
                                            {wifiConnected ? 'Disconnect WiFi' : 'Connect WiFi'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <TouchableOpacity 
                                    style={styles.syncButton}
                                    onPress={syncVitalsFromDevice}
                                    disabled={!bluetoothConnected && !wifiConnected}
                                >
                                    <Activity size={16} color={(bluetoothConnected || wifiConnected) ? "white" : "#9CA3AF"} />
                                    <Text style={[styles.syncButtonText, (!bluetoothConnected && !wifiConnected) && styles.syncButtonTextDisabled]}>
                                        Sync Vitals from Device
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Patient Information</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Patient Name"
                                    value={vitals.patientName}
                                    onChangeText={(text) => setVitals({...vitals, patientName: text})}
                                />
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.sectionTitle}>Vital Signs</Text>
                                
                                <View style={styles.inputRow}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Heart Rate (BPM)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="78"
                                            value={vitals.heartRate}
                                            onChangeText={(text) => setVitals({...vitals, heartRate: text})}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>SpO2 (%)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="98"
                                            value={vitals.spO2}
                                            onChangeText={(text) => setVitals({...vitals, spO2: text})}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Blood Pressure</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="120/80"
                                            value={vitals.bloodPressure}
                                            onChangeText={(text) => setVitals({...vitals, bloodPressure: text})}
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Temperature (°F)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="98.6"
                                            value={vitals.temperature}
                                            onChangeText={(text) => setVitals({...vitals, temperature: text})}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Respiratory Rate (breaths/min)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="16"
                                        value={vitals.respiratoryRate}
                                        onChangeText={(text) => setVitals({...vitals, respiratoryRate: text})}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={saveVitals}>
                                <Text style={styles.saveButtonText}>Save Vitals</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </SafeAreaView>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    locationCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginLeft: 8,
    },
    locationText: {
        fontSize: 18,
        color: '#1E293B',
        marginBottom: 4,
    },
    coordinates: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'monospace',
    },
    emergencyCard: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        borderWidth: 1,
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    emergencyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    emergencyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#DC2626',
        marginLeft: 8,
        flex: 1,
    },
    priorityBadge: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emergencyDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748B',
        width: 80,
    },
    detailValue: {
        fontSize: 14,
        color: '#1E293B',
        flex: 1,
        fontWeight: '500',
    },
    emergencyActions: {
        flexDirection: 'row',
        gap: 12,
    },
    callButton: {
        backgroundColor: '#DC2626',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
    },
    callButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    navigateButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
    },
    navigateButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    availableCard: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        borderWidth: 1,
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    availableTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#15803D',
        marginBottom: 8,
    },
    availableText: {
        fontSize: 14,
        color: '#166534',
        textAlign: 'center',
        marginBottom: 16,
    },
    testButton: {
        backgroundColor: '#66BB6A',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    testButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    statusControls: {
        marginBottom: 24,
    },
    controlsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 12,
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    statusButton: {
        flex: 1,
        backgroundColor: 'white',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    statusButtonActive: {
        backgroundColor: '#66BB6A',
        borderColor: '#66BB6A',
    },
    statusButtonText: {
        color: '#64748B',
        fontWeight: '500',
    },
    statusButtonTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    quickStats: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#66BB6A',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 4,
    },
    crashCard: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    crashCardActive: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    crashInfo: {
        flex: 1,
        marginLeft: 12,
    },
    crashTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    crashStatus: {
        fontSize: 12,
        color: '#6B7280',
    },
    crashStatusActive: {
        color: '#10B981',
        fontWeight: '500',
    },
    crashToggle: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    crashToggleActive: {
        backgroundColor: '#10B981',
    },
    crashToggleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    crashToggleTextActive: {
        color: 'white',
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        backgroundColor: 'white',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    actionButtonText: {
        fontSize: 12,
        color: '#1E293B',
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    actionButtonTextActive: {
        color: 'white',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#64748B',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    deviceConnection: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    connectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    connectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    connectionStatusContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    connectionStatus: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    connectionStatusActive: {
        backgroundColor: '#DCFCE7',
    },
    connectionStatusText: {
        fontSize: 12,
        color: '#DC2626',
        fontWeight: 'bold',
    },
    connectionStatusTextActive: {
        color: '#15803D',
    },
    connectionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    connectionButton: {
        backgroundColor: '#EBF8FF',
        borderColor: '#3B82F6',
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
    },
    connectionButtonActive: {
        backgroundColor: '#3B82F6',
    },
    connectionButtonText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    connectionButtonTextActive: {
        color: 'white',
    },
    syncButton: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    syncButtonText: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    syncButtonTextDisabled: {
        color: '#9CA3AF',
    },
    formSection: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1E293B',
    },
    saveButton: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dispatchCard: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderWidth: 2,
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dispatchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dispatchTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D97706',
        marginLeft: 8,
        flex: 1,
    },
    urgentBadge: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    urgentText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dispatchDetails: {
        marginBottom: 20,
    },
    acceptDispatchButton: {
        backgroundColor: '#DC2626',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    acceptDispatchText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    simulateButton: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderWidth: 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
    },
    simulateButtonText: {
        fontSize: 14,
        color: '#D97706',
        marginTop: 8,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    acceptButton: {
        backgroundColor: '#DC2626',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});