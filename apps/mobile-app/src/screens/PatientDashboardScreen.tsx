import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, MapPin, Shield, AlertTriangle } from 'lucide-react-native';
import { NavigationProp } from '@react-navigation/native';
import { crashDetectionService } from '../services/CrashDetectionService';
import { authService } from '../services/AuthService';

interface Props {
    navigation: NavigationProp<any>;
}

export default function PatientDashboardScreen({ navigation }: Props) {
    const [crashDetectionActive, setCrashDetectionActive] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        loadUserData();
        checkCrashDetectionStatus();
    }, []);

    const loadUserData = async () => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
    };

    const checkCrashDetectionStatus = () => {
        setCrashDetectionActive(crashDetectionService.isActive());
    };

    const toggleCrashDetection = async () => {
        if (crashDetectionActive) {
            crashDetectionService.stopMonitoring();
            setCrashDetectionActive(false);
            Alert.alert('Crash Detection', 'Crash detection has been disabled.');
        } else {
            const started = await crashDetectionService.startMonitoring();
            if (started) {
                setCrashDetectionActive(true);
                Alert.alert('Crash Detection', 'Crash detection is now active. Your device will automatically detect accidents and call for help.');
            } else {
                Alert.alert('Error', 'Failed to start crash detection. Please check permissions.');
            }
        }
    };

    const testCrashDetection = () => {
        Alert.alert(
            'Test Crash Detection',
            'This will simulate a crash and trigger emergency services. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Test', 
                    style: 'destructive',
                    onPress: () => crashDetectionService.reportManualCrash('moderate')
                }
            ]
        );
    };
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <User size={24} color="#66BB6A" />
                        </View>
                        <View>
                            <Text style={styles.userName}>{currentUser?.username || 'John Doe'}</Text>
                            <View style={styles.statusContainer}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Live Monitoring</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.locationCard}>
                        <MapPin size={16} color="#64748B" />
                        <Text style={styles.locationText}>123 Main St, New York, NY 10001</Text>
                    </View>

                    {/* Crash Detection Card */}
                    <View style={[styles.crashDetectionCard, crashDetectionActive && styles.crashDetectionCardActive]}>
                        <View style={styles.crashDetectionHeader}>
                            <View style={styles.crashDetectionIcon}>
                                <Shield size={20} color={crashDetectionActive ? '#10B981' : '#6B7280'} />
                            </View>
                            <View style={styles.crashDetectionInfo}>
                                <Text style={styles.crashDetectionTitle}>Crash Detection</Text>
                                <Text style={[styles.crashDetectionStatus, crashDetectionActive && styles.crashDetectionStatusActive]}>
                                    {crashDetectionActive ? 'Active - Monitoring' : 'Inactive'}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={toggleCrashDetection}
                                style={[styles.crashToggleButton, crashDetectionActive && styles.crashToggleButtonActive]}
                            >
                                <Text style={[styles.crashToggleText, crashDetectionActive && styles.crashToggleTextActive]}>
                                    {crashDetectionActive ? 'ON' : 'OFF'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {crashDetectionActive && (
                            <TouchableOpacity onPress={testCrashDetection} style={styles.testButton}>
                                <AlertTriangle size={16} color="#F59E0B" />
                                <Text style={styles.testButtonText}>Test Emergency Response</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Vitals</Text>
                    <View style={styles.vitalsGrid}>
                        <View style={styles.vitalCard}>
                            <View style={styles.vitalHeader}>
                                <View style={styles.vitalIcon}>
                                    <Text style={styles.vitalIconText}>♥</Text>
                                </View>
                                <Text style={styles.vitalTrend}>+2%</Text>
                            </View>
                            <Text style={styles.vitalLabel}>Heart Rate</Text>
                            <Text style={styles.vitalValue}>76 <Text style={styles.vitalUnit}>bpm</Text></Text>
                        </View>
                        <View style={styles.vitalCard}>
                            <View style={styles.vitalHeader}>
                                <View style={[styles.vitalIcon, { backgroundColor: '#EBF8FF' }]}>
                                    <Text style={[styles.vitalIconText, { color: '#3B82F6' }]}>⚡</Text>
                                </View>
                                <Text style={[styles.vitalTrend, { color: '#3B82F6' }]}>Normal</Text>
                            </View>
                            <Text style={styles.vitalLabel}>Blood Pressure</Text>
                            <Text style={styles.vitalValue}>120/80 <Text style={styles.vitalUnit}>mmHg</Text></Text>
                        </View>
                        <View style={styles.vitalCard}>
                            <View style={styles.vitalHeader}>
                                <View style={[styles.vitalIcon, { backgroundColor: '#F0FDF4' }]}>
                                    <Text style={[styles.vitalIconText, { color: '#66BB6A' }]}>○</Text>
                                </View>
                                <Text style={[styles.vitalTrend, { color: '#66BB6A' }]}>-1%</Text>
                            </View>
                            <Text style={styles.vitalLabel}>SpO2</Text>
                            <Text style={styles.vitalValue}>98 <Text style={styles.vitalUnit}>%</Text></Text>
                        </View>
                        <View style={styles.vitalCard}>
                            <View style={styles.vitalHeader}>
                                <View style={[styles.vitalIcon, { backgroundColor: '#FFFBEB' }]}>
                                    <Text style={[styles.vitalIconText, { color: '#F59E0B' }]}>🌡</Text>
                                </View>
                                <Text style={[styles.vitalTrend, { color: '#F59E0B' }]}>Stable</Text>
                            </View>
                            <Text style={styles.vitalLabel}>Temperature</Text>
                            <Text style={styles.vitalValue}>98.6 <Text style={styles.vitalUnit}>°F</Text></Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.activityCard}>
                        <Text style={styles.activityTitle}>Medication Reminder</Text>
                        <Text style={styles.activityTime}>2 hours ago</Text>
                        <Text style={styles.activityDesc}>Blood pressure medication taken</Text>
                    </View>
                    <View style={styles.activityCard}>
                        <Text style={styles.activityTitle}>Doctor Consultation</Text>
                        <Text style={styles.activityTime}>1 day ago</Text>
                        <Text style={styles.activityDesc}>Routine checkup completed</Text>
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
        paddingBottom: 20,
    },
    header: {
        backgroundColor: 'white',
        padding: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(102, 187, 106, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#66BB6A',
        marginRight: 8,
    },
    statusText: {
        color: '#66BB6A',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    locationCard: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    locationText: {
        color: '#64748B',
        marginLeft: 8,
        fontSize: 12,
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    vitalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    vitalCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        borderColor: '#E2E8F0',
        borderWidth: 1,
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
        marginBottom: 8,
    },
    vitalIcon: {
        backgroundColor: '#FEF2F2',
        padding: 8,
        borderRadius: 12,
    },
    vitalIconText: {
        fontSize: 16,
        color: '#EF4444',
    },
    vitalTrend: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    vitalLabel: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    vitalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    vitalUnit: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: 'normal',
    },
    activityCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#66BB6A',
        marginBottom: 8,
    },
    activityDesc: {
        fontSize: 14,
        color: '#64748B',
    },
    crashDetectionCard: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    crashDetectionCardActive: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    crashDetectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    crashDetectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    crashDetectionInfo: {
        flex: 1,
    },
    crashDetectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    crashDetectionStatus: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    crashDetectionStatusActive: {
        color: '#10B981',
        fontWeight: '500',
    },
    crashToggleButton: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    crashToggleButtonActive: {
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
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF3C7',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 8,
        gap: 6,
    },
    testButtonText: {
        fontSize: 12,
        color: '#D97706',
        fontWeight: '500',
    },
});