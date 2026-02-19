import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Building2, Phone, Mail, MapPin, Stethoscope, Users, MessageSquare } from 'lucide-react-native';
import { authService } from '../services/AuthService';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: NavigationProp<any>;
}

export default function NurseDashboardScreen({ navigation }: Props) {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [doctorInfo, setDoctorInfo] = useState<any>(null);
    const [hospitalInfo, setHospitalInfo] = useState<any>(null);
    const [assignedPatients, setAssignedPatients] = useState<any[]>([]);

    useEffect(() => {
        loadNurseData();
    }, []);

    const loadNurseData = async () => {
        const user = authService.getCurrentUser();
        console.log('Nurse user:', user);
        setCurrentUser(user);

        if (user?.doctorId) {
            console.log('Looking for hospital with ID:', user.doctorId);
            // Find hospital by unique hospital ID
            const hospitalsJson = await AsyncStorage.getItem('registered_hospitals');
            const hospitals = hospitalsJson ? JSON.parse(hospitalsJson) : [];
            console.log('All hospitals:', hospitals);
            const hospital = hospitals.find((h: any) => h.uniqueHospitalId === user.doctorId);
            console.log('Found hospital:', hospital);
            setHospitalInfo(hospital);

            if (hospital) {
                // Find doctor who registered this hospital
                const usersJson = await AsyncStorage.getItem('docent_users');
                const users = usersJson ? JSON.parse(usersJson) : [];
                console.log('Looking for doctor with username:', hospital.adminContact);
                const doctor = users.find((u: any) => u.username === hospital.adminContact);
                console.log('Found doctor:', doctor);
                setDoctorInfo(doctor);

                // Get assigned patients based on nurse's assignedPatientIds
                console.log('Nurse assignedPatientIds:', user.assignedPatientIds);
                if (user.assignedPatientIds && user.assignedPatientIds.length > 0) {
                    const assignedPatients = users.filter((u: any) => 
                        user.assignedPatientIds.includes(u.id) && u.userType === 'patient'
                    );
                    console.log('Found assigned patients:', assignedPatients);
                    setAssignedPatients(assignedPatients);
                } else {
                    setAssignedPatients([]);
                }
            }
        } else {
            console.log('No doctorId found for nurse');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Nurse Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.nurseInfo}>
                        <View style={styles.nurseAvatar}>
                            <User size={24} color="#3B82F6" />
                        </View>
                        <View>
                            <Text style={styles.nurseName}>Nurse {currentUser?.username}</Text>
                            <Text style={styles.nurseEmail}>{currentUser?.email}</Text>
                            {currentUser?.phone && (
                                <Text style={styles.nursePhone}>{currentUser.phone}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Doctor Information */}
                {doctorInfo ? (
                    <View style={styles.infoCard}>
                        <View style={styles.sectionHeader}>
                            <Stethoscope size={20} color="#66BB6A" />
                            <Text style={styles.sectionTitle}>Supervising Doctor</Text>
                        </View>
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <User size={16} color="#9CA3AF" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Doctor Name</Text>
                                    <Text style={styles.detailValue}>Dr. {doctorInfo.username}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <Mail size={16} color="#9CA3AF" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Email</Text>
                                    <Text style={styles.detailValue}>{doctorInfo.email}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <Phone size={16} color="#9CA3AF" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Phone</Text>
                                    <Text style={styles.detailValue}>{doctorInfo.phone || 'Not provided'}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <Stethoscope size={16} color="#9CA3AF" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Doctor ID</Text>
                                    <Text style={styles.detailValue}>{doctorInfo.uniqueDoctorId}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : hospitalInfo ? (
                    <View style={styles.warningCard}>
                        <Text style={styles.warningTitle}>Hospital Administrator Not Found</Text>
                        <Text style={styles.warningText}>
                            The administrator for this hospital could not be found in the system.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>Hospital Not Found</Text>
                        <Text style={styles.errorText}>
                            We could not find a hospital associated with your account's registered Hospital ID.
                        </Text>
                        <TouchableOpacity 
                            style={styles.signOutButton}
                            onPress={() => {
                                authService.signout();
                                navigation.reset({ index: 0, routes: [{ name: 'Signin' }] });
                            }}
                        >
                            <Text style={styles.signOutButtonText}>Sign Out & Try Again</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Hospital Information */}
                {hospitalInfo && (
                    <View style={styles.infoCard}>
                        <View style={styles.sectionHeader}>
                            <Building2 size={20} color="#F59E0B" />
                            <Text style={styles.sectionTitle}>Hospital Details</Text>
                        </View>
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Building2 size={16} color="#9CA3AF" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Hospital Name</Text>
                                    <Text style={styles.detailValue}>{hospitalInfo.name}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <User size={16} color="#9CA3AF" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Type</Text>
                                    <Text style={styles.detailValue}>{hospitalInfo.type}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <Phone size={16} color="#9CA3AF" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Emergency Phone</Text>
                                    <Text style={styles.detailValue}>{hospitalInfo.phone || 'Not provided'}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <Mail size={16} color="#9CA3AF" />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Emergency Email</Text>
                                    <Text style={styles.detailValue}>{hospitalInfo.emergencyEmail || 'Not provided'}</Text>
                                </View>
                            </View>
                            {hospitalInfo.address && (
                                <View style={[styles.detailItem, styles.fullWidth]}>
                                    <MapPin size={16} color="#9CA3AF" />
                                    <View style={styles.detailContent}>
                                        <Text style={styles.detailLabel}>Address</Text>
                                        <Text style={styles.detailValue}>{hospitalInfo.address}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Assigned Patients Section */}
                        <View style={styles.patientsSection}>
                            <View style={styles.patientsSectionHeader}>
                                <View style={styles.sectionHeader}>
                                    <Users size={20} color="#66BB6A" />
                                    <Text style={styles.sectionTitle}>Assigned Patients</Text>
                                </View>
                                <TouchableOpacity style={styles.teamChatButton}>
                                    <MessageSquare size={16} color="white" />
                                    <Text style={styles.teamChatText}>Team Chat</Text>
                                </TouchableOpacity>
                            </View>

                            {assignedPatients.length === 0 ? (
                                <Text style={styles.noPatients}>
                                    No patients assigned yet. Contact your supervising doctor for patient assignments.
                                </Text>
                            ) : (
                                assignedPatients.map((patient) => (
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
                                                    <Text style={styles.patientCondition}>Under monitoring</Text>
                                                </View>
                                            </View>
                                            <View style={styles.statusBadge}>
                                                <Text style={styles.statusText}>Active Monitoring</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.viewDashboardButton}>
                                            <Text style={styles.viewDashboardText}>View RPM Dashboard</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                )}
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
    infoCard: {
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
    nurseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nurseAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    nurseName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    nurseEmail: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    nursePhone: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginLeft: 8,
    },
    detailsGrid: {
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    fullWidth: {
        width: '100%',
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    warningCard: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderWidth: 1,
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#92400E',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#A16207',
    },
    errorCard: {
        backgroundColor: '#FEF2F2',
        borderColor: '#F87171',
        borderWidth: 1,
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#DC2626',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        marginBottom: 16,
    },
    signOutButton: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    signOutButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    patientsSection: {
        marginTop: 24,
    },
    patientsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    teamChatButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    teamChatText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    noPatients: {
        fontSize: 14,
        color: '#64748B',
        fontStyle: 'italic',
    },
    patientCard: {
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        backgroundColor: 'white',
    },
    patientHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    patientAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(102, 187, 106, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    patientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    patientId: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    patientCondition: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#15803D',
        fontWeight: 'bold',
    },
    viewDashboardButton: {
        backgroundColor: '#66BB6A',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    viewDashboardText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});