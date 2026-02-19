import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { User, Copy, Heart, Check, Building2, Camera, MessageSquare, MapPin, Shield } from 'lucide-react-native';
import { authService } from '../services/AuthService';
import { crashDetectionService } from '../services/CrashDetectionService';
import { NavigationProp } from '@react-navigation/native';
import { User as UserType } from '../types';

interface Props {
    navigation: NavigationProp<any>;
}

export default function DoctorDashboardScreen({ navigation }: Props) {
    const [patients, setPatients] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<Partial<UserType> | null>(null);
    const [copied, setCopied] = useState(false);
    const [crashDetectionActive, setCrashDetectionActive] = useState(false);

    useEffect(() => {
        loadData();
        setCrashDetectionActive(crashDetectionService.isActive());
    }, []);

    const loadData = async () => {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);

        if (user?.uniqueDoctorId) {
            // Get actual patients registered under this doctor
            const actualPatients = authService.getPatientsByDoctorId(user.uniqueDoctorId);
            setPatients(actualPatients);
        }
    };

    const copyDoctorId = async () => {
        const doctorId = currentUser?.uniqueDoctorId || 'DR-892-11';
        await Clipboard.setStringAsync(doctorId);
        Alert.alert('Copied', 'Doctor ID copied to clipboard');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <View style={styles.doctorInfo}>
                        <View>
                            <Text style={styles.doctorName}>Dr. {currentUser?.username || 'House'}</Text>
                            <Text style={styles.doctorEmail}>{currentUser?.email || 'doctor@docent.ai'}</Text>
                        </View>
                        <View style={styles.idContainer}>
                            <Text style={styles.idLabel}>Doctor ID</Text>
                            <TouchableOpacity style={styles.idButton} onPress={copyDoctorId}>
                                <Text style={styles.idText}>{currentUser?.uniqueDoctorId || 'DR-892-11'}</Text>
                                {copied ? <Check size={14} color="#22C55E" /> : <Copy size={14} color="#64748B" />}
                            </TouchableOpacity>
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
                </View>

                <Text style={styles.sectionTitle}>My Patients</Text>

                {patients.length === 0 ? (
                    <View style={styles.emptyState}>
                        <User size={48} color="#D1D5DB" />
                        <Text style={styles.emptyStateTitle}>No Patients Registered</Text>
                        <Text style={styles.emptyText}>
                            Share your Doctor ID with patients so they can register under your care.
                        </Text>
                        <View style={styles.doctorIdCard}>
                            <Text style={styles.doctorIdCardText}>
                                Doctor ID: {currentUser?.uniqueDoctorId || 'DR-892-11'}
                            </Text>
                            <Text style={styles.doctorIdCardSubtext}>
                                Patients should use this ID during registration to link to your account.
                            </Text>
                        </View>
                    </View>
                ) : (
                    patients.map((patient) => (
                        <TouchableOpacity
                            key={patient.id}
                            style={styles.patientCard}
                            onPress={() => navigation.navigate('RPMPatientDashboard', { patientId: patient.id })}
                        >
                            <View style={styles.patientHeader}>
                                <View style={styles.patientInfo}>
                                    <View style={styles.patientAvatar}>
                                        <User size={20} color="#66BB6A" />
                                    </View>
                                    <View>
                                        <Text style={styles.patientName}>{patient.username}</Text>
                                        <Text style={styles.patientId}>ID: {patient.id}</Text>
                                    </View>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Heart size={12} color="#16A34A" />
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                            </View>

                            <View style={styles.patientDetails}>
                                <Text style={styles.patientEmail}>{patient.email}</Text>
                                <View style={styles.viewButton}>
                                    <Text style={styles.viewButtonText}>View Dashboard ></Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View style={styles.quickActions}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('LiveMonitor')}
                        >
                            <Camera size={24} color="#3B82F6" />
                            <Text style={styles.quickActionText}>Live Monitor</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('HospitalRegistration')}
                        >
                            <Building2 size={24} color="#66BB6A" />
                            <Text style={styles.quickActionText}>Register Hospital</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('HospitalManagement')}
                        >
                            <Building2 size={24} color="#7C3AED" />
                            <Text style={styles.quickActionText}>Manage Hospital</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('Chat')}
                        >
                            <MessageSquare size={24} color="#F59E0B" />
                            <Text style={styles.quickActionText}>Team Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('EmergencyMap')}
                        >
                            <MapPin size={24} color="#A855F7" />
                            <Text style={styles.quickActionText}>Emergency Map</Text>
                        </TouchableOpacity>
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
    header: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    doctorInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    doctorName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    doctorEmail: {
        color: '#64748B',
    },
    idContainer: {
        alignItems: 'flex-end',
    },
    idLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4,
    },
    idButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    idText: {
        color: '#66BB6A',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    patientCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    patientHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    patientAvatar: {
        backgroundColor: 'rgba(102, 187, 106, 0.1)',
        padding: 8,
        borderRadius: 20,
        marginRight: 12,
    },
    patientName: {
        fontWeight: 'bold',
        color: '#1E293B',
    },
    patientId: {
        fontSize: 12,
        color: '#94A3B8',
    },
    statusBadge: {
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        color: '#15803D',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    patientDetails: {
        paddingLeft: 48,
    },
    patientEmail: {
        color: '#64748B',
        fontSize: 12,
        marginBottom: 4,
    },
    viewButton: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    viewButtonText: {
        color: '#66BB6A',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    doctorIdCard: {
        backgroundColor: '#EBF8FF',
        padding: 16,
        borderRadius: 8,
        maxWidth: 300,
    },
    doctorIdCardText: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: '600',
    },
    doctorIdCardSubtext: {
        fontSize: 12,
        color: '#3B82F6',
        marginTop: 4,
    },
    quickActions: {
        marginTop: 24,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: '31%',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionText: {
        fontSize: 12,
        color: '#1E293B',
        marginTop: 8,
        textAlign: 'center',
    },
    crashCard: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
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
});