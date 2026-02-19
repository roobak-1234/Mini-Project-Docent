import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Activity, Heart, Thermometer, Wind, User, Mail, Phone, MapPin, Edit, Save, ArrowLeft } from 'lucide-react-native';
import { authService } from '../services/AuthService';
import { NavigationProp } from '@react-navigation/native';

interface Props {
    navigation: NavigationProp<any>;
    route?: {
        params?: {
            patientId?: string;
        };
    };
}

export default function RPMPatientDashboardScreen({ navigation, route }: Props) {
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [dataSharingSettings, setDataSharingSettings] = useState<any>({ location: true });
    const [medicalHistory, setMedicalHistory] = useState('');
    const [emergencyContacts, setEmergencyContacts] = useState('');
    const [isEditingHistory, setIsEditingHistory] = useState(false);
    const [isEditingContacts, setIsEditingContacts] = useState(false);
    const currentUser = authService.getCurrentUser();
    const patientId = route?.params?.patientId;
    const screenWidth = Dimensions.get('window').width;

    // Vitals data for charts
    const vitalsData = {
        heartRate: { current: 76, history: [72, 75, 78, 85, 82, 79, 76] },
        bloodPressure: { current: '120/80', systolic: [118, 120, 122, 125, 123, 121, 120], diastolic: [78, 80, 82, 85, 83, 81, 80] },
        spO2: { current: 98, history: [98, 97, 98, 99, 98, 97, 98] },
        temperature: { current: 98.6, history: [98.4, 98.5, 98.6, 98.8, 98.7, 98.6, 98.6] }
    };

    useEffect(() => {
        if (patientId) {
            // Mock patient data
            setSelectedPatient({
                id: patientId,
                username: 'John Doe',
                email: 'john@example.com',
                phone: '555-0123'
            });
            
            // Load saved data
            const savedHistory = `Diabetes Type 2 (2018)
Hypertension (2020)
Allergic to Penicillin
Current Medications:
- Metformin 500mg twice daily
- Lisinopril 10mg once daily`;
            
            const savedContacts = `Name: Jane Doe
Relation: Spouse
Phone: +1 (555) 123-4567

Name: Robert Doe
Relation: Son
Phone: +1 (555) 987-6543`;
            
            setMedicalHistory(savedHistory);
            setEmergencyContacts(savedContacts);
        }
    }, [patientId]);

    const saveMedicalHistory = () => {
        Alert.alert('Success', 'Medical history saved');
        setIsEditingHistory(false);
    };

    const saveEmergencyContacts = () => {
        Alert.alert('Success', 'Emergency contacts saved');
        setIsEditingContacts(false);
    };

    const displayPatient = selectedPatient || (currentUser?.userType === 'patient' ? currentUser : null);
    const patientName = displayPatient ? displayPatient.username : 'Patient';
    const patientEmail = displayPatient ? displayPatient.email : '';
    const patientPhone = displayPatient ? displayPatient.phone : '';
    const patientIdDisplay = displayPatient ? displayPatient.id : '';

    const mockLocation = {
        lat: 40.7128,
        lng: -74.0060,
        address: '123 Main St, New York, NY 10001'
    };

    const VitalCard = ({ icon, color, label, value, unit, trend, trendColor }: any) => (
        <View style={styles.vitalCard}>
            <View style={styles.vitalHeader}>
                <View style={[styles.vitalIcon, { backgroundColor: color + '20' }]}>
                    {React.cloneElement(icon, { size: 24, color: color })}
                </View>
                <Text style={[styles.vitalTrend, { color: trendColor }]}>{trend}</Text>
            </View>
            <Text style={styles.vitalLabel}>{label}</Text>
            <View style={styles.vitalValueContainer}>
                <Text style={styles.vitalValue}>{value}</Text>
                <Text style={styles.vitalUnit}>{unit}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Patient Header */}
                <View style={styles.patientHeader}>
                    <View style={styles.patientHeaderLeft}>
                        <View style={styles.patientAvatar}>
                            <User size={24} color="#66BB6A" />
                        </View>
                        <View style={styles.patientInfo}>
                            <Text style={styles.patientName}>{patientName}</Text>
                            <View style={styles.patientDetails}>
                                <Text style={styles.patientId}>ID: {patientIdDisplay}</Text>
                                {patientEmail && (
                                    <>
                                        <Text style={styles.separator}>•</Text>
                                        <Mail size={12} color="#64748B" />
                                        <Text style={styles.contactInfo}>{patientEmail}</Text>
                                    </>
                                )}
                            </View>
                            <TouchableOpacity style={styles.aiButton}>
                                <Text style={styles.aiButtonText}>AI Summary</Text>
                            </TouchableOpacity>
                            <View style={styles.liveStatus}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>Live Monitoring Active</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Patient Info Cards */}
                <View style={styles.infoSection}>
                    {/* Location Card */}
                    {dataSharingSettings.location && (
                        <View style={styles.infoCard}>
                            <View style={styles.infoCardHeader}>
                                <MapPin size={20} color="#3B82F6" />
                                <Text style={styles.infoCardTitle}>Current Location</Text>
                            </View>
                            <Text style={styles.locationAddress}>{mockLocation.address}</Text>
                            <Text style={styles.locationCoords}>
                                Lat: {mockLocation.lat}, Lng: {mockLocation.lng}
                            </Text>
                            <View style={styles.locationAlert}>
                                <Text style={styles.locationAlertText}>📍 Location shared for emergency response</Text>
                            </View>
                        </View>
                    )}

                    {/* Medical History Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <Text style={styles.infoCardTitle}>Medical History</Text>
                            <TouchableOpacity
                                onPress={() => setIsEditingHistory(!isEditingHistory)}
                                style={styles.editButton}
                            >
                                {isEditingHistory ? <Save size={16} color="#66BB6A" /> : <Edit size={16} color="#64748B" />}
                            </TouchableOpacity>
                        </View>
                        {isEditingHistory ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    value={medicalHistory}
                                    onChangeText={setMedicalHistory}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Enter medical history, allergies, medications..."
                                />
                                <TouchableOpacity onPress={saveMedicalHistory} style={styles.saveButton}>
                                    <Text style={styles.saveButtonText}>Save History</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.infoText}>
                                {medicalHistory || 'No medical history recorded. Click edit to add.'}
                            </Text>
                        )}
                    </View>

                    {/* Emergency Contacts Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <Text style={styles.infoCardTitle}>Emergency Contacts</Text>
                            <TouchableOpacity
                                onPress={() => setIsEditingContacts(!isEditingContacts)}
                                style={styles.editButton}
                            >
                                {isEditingContacts ? <Save size={16} color="#66BB6A" /> : <Edit size={16} color="#64748B" />}
                            </TouchableOpacity>
                        </View>
                        {isEditingContacts ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    value={emergencyContacts}
                                    onChangeText={setEmergencyContacts}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Name: John Doe&#10;Relation: Spouse&#10;Phone: +1 (555) 123-4567"
                                />
                                <TouchableOpacity onPress={saveEmergencyContacts} style={styles.saveButton}>
                                    <Text style={styles.saveButtonText}>Save Contacts</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.infoText}>
                                {emergencyContacts || 'No emergency contacts recorded. Click edit to add.'}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Vitals Grid */}
                <View style={styles.vitalsGrid}>
                    <VitalCard 
                        icon={<Heart />} 
                        color="#EF4444" 
                        label="Heart Rate" 
                        value={vitalsData.heartRate.current.toString()} 
                        unit="bpm" 
                        trend="+2%" 
                        trendColor="#EF4444" 
                    />
                    <VitalCard 
                        icon={<Activity />} 
                        color="#64B5F6" 
                        label="Blood Pressure" 
                        value={vitalsData.bloodPressure.current} 
                        unit="mmHg" 
                        trend="Normal" 
                        trendColor="#3B82F6" 
                    />
                    <VitalCard 
                        icon={<Wind />} 
                        color="#66BB6A" 
                        label="SpO2" 
                        value={vitalsData.spO2.current.toString()} 
                        unit="%" 
                        trend="-1%" 
                        trendColor="#66BB6A" 
                    />
                    <VitalCard 
                        icon={<Thermometer />} 
                        color="#F59E0B" 
                        label="Temperature" 
                        value={vitalsData.temperature.current.toString()} 
                        unit="°F" 
                        trend="Stable" 
                        trendColor="#F59E0B" 
                    />
                </View>

                {/* Charts Section */}
                <View style={styles.chartsSection}>
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartTitle}>Heart Rate History</Text>
                            <View style={styles.liveBadge}>
                                <Text style={styles.liveBadgeText}>Live</Text>
                            </View>
                        </View>
                        <LineChart
                            data={{
                                labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'Now'],
                                datasets: [{
                                    data: vitalsData.heartRate.history,
                                    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                                    strokeWidth: 3
                                }]
                            }}
                            width={screenWidth - 80}
                            height={200}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: '4',
                                    strokeWidth: '2',
                                    stroke: '#EF4444'
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    </View>

                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartTitle}>Oxygen Saturation</Text>
                            <View style={styles.liveBadge}>
                                <Text style={styles.liveBadgeText}>Live</Text>
                            </View>
                        </View>
                        <LineChart
                            data={{
                                labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'Now'],
                                datasets: [{
                                    data: vitalsData.spO2.history,
                                    color: (opacity = 1) => `rgba(102, 187, 106, ${opacity})`,
                                    strokeWidth: 3
                                }]
                            }}
                            width={screenWidth - 80}
                            height={200}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(102, 187, 106, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: '4',
                                    strokeWidth: '2',
                                    stroke: '#66BB6A'
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    </View>
                </View>
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
    patientHeader: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    patientHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    patientInfo: {
        flex: 1,
    },

    patientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(102, 187, 106, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    patientName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    patientDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    patientId: {
        fontSize: 12,
        color: '#64748B',
    },
    separator: {
        fontSize: 12,
        color: '#64748B',
        marginHorizontal: 8,
    },
    contactInfo: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 4,
    },
    liveStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#66BB6A',
        marginRight: 8,
    },
    liveText: {
        fontSize: 14,
        color: '#66BB6A',
        fontWeight: '500',
    },
    aiButton: {
        backgroundColor: '#64B5F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
        marginBottom: 8,
    },
    aiButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoSection: {
        marginBottom: 24,
    },
    infoCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
        marginLeft: 8,
    },
    editButton: {
        padding: 8,
    },
    locationAddress: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 4,
    },
    locationCoords: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'monospace',
    },
    locationAlert: {
        backgroundColor: '#EBF8FF',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    locationAlertText: {
        fontSize: 12,
        color: '#1E40AF',
    },
    editContainer: {
        gap: 12,
    },
    textArea: {
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#66BB6A',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    vitalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    vitalCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        width: '48%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    vitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    vitalIcon: {
        padding: 12,
        borderRadius: 12,
    },
    vitalTrend: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    vitalLabel: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
        marginBottom: 4,
    },
    vitalValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    vitalValue: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    vitalUnit: {
        fontSize: 14,
        color: '#94A3B8',
        marginLeft: 4,
    },
    chartsSection: {
        gap: 20,
    },
    chartCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    liveBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveBadgeText: {
        fontSize: 12,
        color: '#66BB6A',
        fontWeight: 'bold',
    },

});