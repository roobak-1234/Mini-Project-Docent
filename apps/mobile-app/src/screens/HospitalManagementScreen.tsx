import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, Users, ArrowLeft, User, Mail, Phone, UserCheck, Truck } from 'lucide-react-native';
import { NavigationProp } from '@react-navigation/native';
import { authService } from '../services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: NavigationProp<any>;
}

export default function HospitalManagementScreen({ navigation }: Props) {
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
    const [hospitalInfo, setHospitalInfo] = useState<any>(null);
    const [hospitalStaff, setHospitalStaff] = useState<any[]>([]);
    const [doctorPatients, setDoctorPatients] = useState<any[]>([]);

    useEffect(() => {
        loadHospitalData();
    }, []);

    const loadHospitalData = async () => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);

        if (user) {
            try {
                const hospitalsJson = await AsyncStorage.getItem('registered_hospitals');
                const hospitals = hospitalsJson ? JSON.parse(hospitalsJson) : [];
                let doctorHospital = hospitals.find((h: any) => h.adminContact === user.username);

                if (doctorHospital && !doctorHospital.uniqueHospitalId) {
                    const hospitalNamePrefix = doctorHospital.name
                        .replace(/[^a-zA-Z0-9]/g, '')
                        .substring(0, 4)
                        .toUpperCase();
                    const timestamp = Date.now().toString().slice(-4);
                    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                    const newHospitalId = `${hospitalNamePrefix}-${timestamp}-${random}`;

                    doctorHospital.uniqueHospitalId = newHospitalId;
                    const hospitalIndex = hospitals.findIndex((h: any) => h.adminContact === user.username);
                    if (hospitalIndex !== -1) {
                        hospitals[hospitalIndex] = doctorHospital;
                        await AsyncStorage.setItem('registered_hospitals', JSON.stringify(hospitals));
                    }
                }

                setHospitalInfo(doctorHospital);

                if (doctorHospital?.uniqueHospitalId) {
                    const allUsersJson = await AsyncStorage.getItem('docent_users');
                    const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];
                    const staff = allUsers.filter((u: any) =>
                        (u.userType === 'nurse' || u.userType === 'staff') &&
                        u.doctorId === doctorHospital.uniqueHospitalId
                    );
                    setHospitalStaff(staff);

                    // Get ambulance staff and add to hospital's ambulance fleet
                    const ambulanceStaff = staff.filter((s: any) => 
                        s.staffType === 'Ambulance Staff' && s.vehicleNumber
                    );
                    
                    // Update hospital ambulance fleet with registered ambulance staff
                    const updatedAmbulanceIds = [
                        ...(doctorHospital.ambulanceIds || []),
                        ...ambulanceStaff.map((staff: any) => ({
                            id: staff.vehicleNumber.startsWith('AMB-') ? staff.vehicleNumber : `AMB-${staff.vehicleNumber}`,
                            staffName: staff.username,
                            isOnline: staff.isOnline || false,
                            type: 'staff'
                        }))
                    ];
                    
                    // Remove duplicates based on vehicle ID
                    const uniqueAmbulances = updatedAmbulanceIds.filter((ambulance, index, self) => 
                        index === self.findIndex(a => 
                            (typeof a === 'string' ? a : a.id) === (typeof ambulance === 'string' ? ambulance : ambulance.id)
                        )
                    );
                    
                    doctorHospital.ambulanceIds = uniqueAmbulances;
                    setHospitalInfo(doctorHospital);

                    if (user.uniqueDoctorId) {
                        const patients = authService.getPatientsByDoctorId(user.uniqueDoctorId);
                        setDoctorPatients(patients);
                    }
                }
            } catch (error) {
                console.error('Error loading hospital data:', error);
            }
        }
    };

    const updateStaffPermissions = async (staffId: string, permission: string, value: boolean) => {
        try {
            const allUsersJson = await AsyncStorage.getItem('docent_users');
            const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];
            const updatedUsers = allUsers.map((u: any) =>
                u.id === staffId
                    ? { ...u, permissions: { ...u.permissions, [permission]: value } }
                    : u
            );
            await AsyncStorage.setItem('docent_users', JSON.stringify(updatedUsers));
            
            const updatedStaff = hospitalStaff.map(s =>
                s.id === staffId
                    ? { ...s, permissions: { ...s.permissions, [permission]: value } }
                    : s
            );
            setHospitalStaff(updatedStaff);
        } catch (error) {
            console.error('Error updating staff permissions:', error);
        }
    };

    const updatePatientAssignment = async (staffId: string, patientId: string, isAssigned: boolean) => {
        try {
            const staff = hospitalStaff.find(s => s.id === staffId);
            const currentPatients = staff?.assignedPatientIds || [];
            const updatedPatients = isAssigned
                ? [...currentPatients, patientId]
                : currentPatients.filter((id: string) => id !== patientId);

            const allUsersJson = await AsyncStorage.getItem('docent_users');
            const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];
            const updatedUsers = allUsers.map((u: any) =>
                u.id === staffId
                    ? { ...u, assignedPatientIds: updatedPatients }
                    : u
            );
            await AsyncStorage.setItem('docent_users', JSON.stringify(updatedUsers));

            const updatedStaff = hospitalStaff.map(s =>
                s.id === staffId
                    ? { ...s, assignedPatientIds: updatedPatients }
                    : s
            );
            setHospitalStaff(updatedStaff);
        } catch (error) {
            console.error('Error updating patient assignment:', error);
        }
    };

    if (!currentUser || currentUser.userType !== 'doctor') {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Access denied. Doctor account required.</Text>
            </SafeAreaView>
        );
    }

    if (!hospitalInfo) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#64748B" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Hospital Management</Text>
                </View>
                <View style={styles.noHospitalContainer}>
                    <Building2 size={48} color="#F59E0B" />
                    <Text style={styles.noHospitalTitle}>No Hospital Registered</Text>
                    <Text style={styles.noHospitalText}>
                        You need to register a hospital first to access management features.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#64748B" />
                </TouchableOpacity>
                <Text style={styles.title}>Hospital Management</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Hospital Info Card */}
                <View style={styles.card}>
                    <View style={styles.hospitalHeader}>
                        <View style={styles.hospitalIcon}>
                            <Building2 size={32} color="#7C3AED" />
                        </View>
                        <View style={styles.hospitalInfo}>
                            <Text style={styles.hospitalName}>{hospitalInfo.name}</Text>
                            <Text style={styles.hospitalType}>{hospitalInfo.type} Hospital</Text>
                        </View>
                        <View style={styles.hospitalId}>
                            <Text style={styles.hospitalIdLabel}>Hospital ID</Text>
                            <Text style={styles.hospitalIdValue}>
                                {hospitalInfo.uniqueHospitalId || 'ID not found'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{hospitalInfo.icuBeds || 0}</Text>
                            <Text style={styles.statLabel}>ICU Beds</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#3B82F6' }]}>{hospitalInfo.hduBeds || 0}</Text>
                            <Text style={styles.statLabel}>HDU Beds</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{hospitalInfo.ventilators || 0}</Text>
                            <Text style={styles.statLabel}>Ventilators</Text>
                        </View>
                    </View>
                </View>

                {/* Hospital Staff */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Users size={20} color="#66BB6A" />
                            <Text style={styles.sectionTitle}>Hospital Staff</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{hospitalStaff.length} Staff Members</Text>
                        </View>
                    </View>

                    {hospitalStaff.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Users size={48} color="#D1D5DB" />
                            <Text style={styles.emptyStateTitle}>No Staff Registered</Text>
                            <Text style={styles.emptyStateText}>
                                Share your Hospital ID with staff members so they can register under your hospital.
                            </Text>
                            <View style={styles.hospitalIdCard}>
                                <Text style={styles.hospitalIdCardText}>
                                    Hospital ID: {hospitalInfo.uniqueHospitalId || 'ID not found'}
                                </Text>
                                <Text style={styles.hospitalIdCardSubtext}>
                                    Staff should use this ID during registration to join your hospital.
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.staffList}>
                            {hospitalStaff.map((staff) => (
                                <View key={staff.id} style={[
                                    styles.staffCard,
                                    staff.isOnline && styles.staffCardOnline
                                ]}>
                                    <View style={styles.staffHeader}>
                                        <View style={styles.staffInfo}>
                                            <View style={[
                                                styles.staffIcon,
                                                staff.isOnline && styles.staffIconOnline
                                            ]}>
                                                {staff.userType === 'nurse' ? (
                                                    <UserCheck size={16} color={staff.isOnline ? '#10B981' : '#66BB6A'} />
                                                ) : (
                                                    <User size={16} color={staff.isOnline ? '#10B981' : '#66BB6A'} />
                                                )}
                                            </View>
                                            <View>
                                                <View style={styles.staffNameContainer}>
                                                    <Text style={styles.staffName}>{staff.username}</Text>
                                                    {staff.isOnline && <View style={styles.onlineDot} />}
                                                </View>
                                                <Text style={styles.staffRole}>
                                                    {staff.userType === 'nurse' ? 'Nurse' : staff.staffType || 'Staff'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.staffBadges}>
                                            <View style={[
                                                styles.roleBadge,
                                                staff.userType === 'nurse' ? styles.nurseBadge : styles.staffBadge
                                            ]}>
                                                <Text style={[
                                                    styles.roleBadgeText,
                                                    staff.userType === 'nurse' ? styles.nurseBadgeText : styles.staffBadgeText
                                                ]}>
                                                    {staff.userType === 'nurse' ? 'Nurse' : 'Staff'}
                                                </Text>
                                            </View>
                                            {staff.isOnline && (
                                                <Text style={styles.onlineText}>Online</Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.staffDetails}>
                                        <View style={styles.contactInfo}>
                                            <Mail size={12} color="#6B7280" />
                                            <Text style={styles.contactText}>{staff.email}</Text>
                                        </View>
                                        {staff.phone && (
                                            <View style={styles.contactInfo}>
                                                <Phone size={12} color="#6B7280" />
                                                <Text style={styles.contactText}>{staff.phone}</Text>
                                            </View>
                                        )}
                                        <Text style={styles.joinedText}>
                                            {staff.isOnline ? (
                                                <Text style={styles.activeText}>Currently Active</Text>
                                            ) : (
                                                `Joined: ${new Date(staff.createdAt).toLocaleDateString()}`
                                            )}
                                        </Text>
                                    </View>

                                    <View style={styles.permissionsSection}>
                                        <Text style={styles.permissionsTitle}>Permissions</Text>
                                        <View style={styles.permissionRow}>
                                            <Text style={styles.permissionLabel}>Patient Data Access</Text>
                                            <Switch
                                                value={staff.permissions?.canAccessPatientData || false}
                                                onValueChange={(value) => updateStaffPermissions(staff.id, 'canAccessPatientData', value)}
                                                trackColor={{ false: '#D1D5DB', true: '#66BB6A' }}
                                                thumbColor={staff.permissions?.canAccessPatientData ? '#FFFFFF' : '#F3F4F6'}
                                            />
                                        </View>

                                        {staff.userType === 'nurse' && (
                                            <View style={styles.patientAssignments}>
                                                <Text style={styles.assignmentsTitle}>Assigned Patients</Text>
                                                {doctorPatients.length === 0 ? (
                                                    <Text style={styles.noPatients}>No patients available</Text>
                                                ) : (
                                                    <View style={styles.patientsList}>
                                                        {doctorPatients.map((patient) => (
                                                            <View key={patient.id} style={styles.patientRow}>
                                                                <Text style={styles.patientName}>{patient.username}</Text>
                                                                <Switch
                                                                    value={(staff.assignedPatientIds || []).includes(patient.id)}
                                                                    onValueChange={(value) => updatePatientAssignment(staff.id, patient.id, value)}
                                                                    trackColor={{ false: '#D1D5DB', true: '#66BB6A' }}
                                                                    thumbColor={(staff.assignedPatientIds || []).includes(patient.id) ? '#FFFFFF' : '#F3F4F6'}
                                                                />
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                                {(staff.assignedPatientIds || []).length > 0 && (
                                                    <Text style={styles.assignedCount}>
                                                        {(staff.assignedPatientIds || []).length} patient(s) assigned
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Ambulance Fleet */}
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Truck size={20} color="#DC2626" />
                            <Text style={styles.sectionTitle}>Ambulance Fleet</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: '#FEF2F2' }]}>
                            <Text style={[styles.badgeText, { color: '#DC2626' }]}>
                                {hospitalInfo.ambulanceIds?.length || 0} Vehicles
                            </Text>
                        </View>
                    </View>

                    {!hospitalInfo.ambulanceIds || hospitalInfo.ambulanceIds.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Truck size={48} color="#D1D5DB" />
                            <Text style={styles.emptyStateTitle}>No Ambulances Registered</Text>
                            <Text style={styles.emptyStateText}>
                                No ambulance fleet has been registered for this hospital.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.ambulanceGrid}>
                            {hospitalInfo.ambulanceIds.map((ambulance: any, index: number) => {
                                const isActive = ambulance.isOnline || (ambulance.type === 'staff' && ambulance.isOnline);

                                return (
                                    <View key={index} style={[
                                        styles.ambulanceCard,
                                        isActive ? styles.ambulanceCardActive : styles.ambulanceCardInactive
                                    ]}>
                                        <View style={styles.ambulanceHeader}>
                                            <View style={[
                                                styles.ambulanceIcon,
                                                isActive ? styles.ambulanceIconActive : styles.ambulanceIconInactive
                                            ]}>
                                                <Truck size={24} color={isActive ? '#10B981' : '#DC2626'} />
                                            </View>
                                            <View>
                                                <Text style={styles.ambulanceId}>{ambulance.id || ambulance}</Text>
                                                <Text style={[
                                                    styles.ambulanceStatus,
                                                    isActive ? styles.ambulanceStatusActive : styles.ambulanceStatusInactive
                                                ]}>
                                                    {isActive ? (
                                                        `● Active • Driver: ${ambulance.staffName}`
                                                    ) : (
                                                        '○ Offline • Unassigned'
                                                    )}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.ambulanceFooter}>
                                            <View style={[
                                                styles.statusBadge,
                                                isActive ? styles.statusBadgeActive : styles.statusBadgeInactive
                                            ]}>
                                                <Text style={[
                                                    styles.statusBadgeText,
                                                    isActive ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive
                                                ]}>
                                                    {isActive ? 'In Service' : 'Offline'}
                                                </Text>
                                            </View>
                                            {isActive && (
                                                <TouchableOpacity style={styles.trackButton}>
                                                    <Text style={styles.trackButtonText}>Track Live</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
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
    scrollContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    hospitalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    hospitalIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    hospitalInfo: {
        flex: 1,
    },
    hospitalName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    hospitalType: {
        fontSize: 14,
        color: '#6B7280',
    },
    hospitalId: {
        alignItems: 'flex-end',
    },
    hospitalIdLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    hospitalIdValue: {
        fontSize: 14,
        fontFamily: 'monospace',
        color: '#7C3AED',
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#66BB6A',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    badge: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#66BB6A',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 16,
    },
    hospitalIdCard: {
        backgroundColor: '#EBF8FF',
        padding: 16,
        borderRadius: 8,
        maxWidth: 300,
    },
    hospitalIdCardText: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: '600',
    },
    hospitalIdCardSubtext: {
        fontSize: 12,
        color: '#3B82F6',
        marginTop: 4,
    },
    staffList: {
        gap: 16,
    },
    staffCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 16,
    },
    staffCardOnline: {
        borderColor: '#D1FAE5',
        backgroundColor: '#F0FDF4',
    },
    staffHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    staffInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    staffIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    staffIconOnline: {
        backgroundColor: '#D1FAE5',
    },
    staffNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    staffName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    staffRole: {
        fontSize: 12,
        color: '#6B7280',
    },
    staffBadges: {
        alignItems: 'flex-end',
        gap: 4,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    nurseBadge: {
        backgroundColor: '#DBEAFE',
    },
    staffBadge: {
        backgroundColor: '#E0E7FF',
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    nurseBadgeText: {
        color: '#1D4ED8',
    },
    staffBadgeText: {
        color: '#4338CA',
    },
    onlineText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#10B981',
        textTransform: 'uppercase',
    },
    staffDetails: {
        gap: 4,
        marginBottom: 16,
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#6B7280',
    },
    joinedText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
    },
    activeText: {
        color: '#10B981',
        fontWeight: '500',
    },
    permissionsSection: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
    },
    permissionsTitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    permissionLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    patientAssignments: {
        marginTop: 8,
    },
    assignmentsTitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    noPatients: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    patientsList: {
        maxHeight: 120,
        gap: 8,
    },
    patientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    patientName: {
        fontSize: 12,
        color: '#374151',
    },
    assignedCount: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
        marginTop: 8,
    },
    ambulanceGrid: {
        gap: 16,
    },
    ambulanceCard: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
    },
    ambulanceCardActive: {
        borderColor: '#D1FAE5',
        backgroundColor: '#F0FDF4',
    },
    ambulanceCardInactive: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    ambulanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    ambulanceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ambulanceIconActive: {
        backgroundColor: '#D1FAE5',
    },
    ambulanceIconInactive: {
        backgroundColor: '#FECACA',
    },
    ambulanceId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    ambulanceStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    ambulanceStatusActive: {
        color: '#059669',
    },
    ambulanceStatusInactive: {
        color: '#DC2626',
    },
    ambulanceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusBadgeActive: {
        backgroundColor: '#D1FAE5',
    },
    statusBadgeInactive: {
        backgroundColor: '#FECACA',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statusBadgeTextActive: {
        color: '#065F46',
    },
    statusBadgeTextInactive: {
        color: '#991B1B',
    },
    trackButton: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    trackButtonText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
        marginTop: 50,
    },
    noHospitalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    noHospitalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F59E0B',
        marginTop: 16,
        marginBottom: 8,
    },
    noHospitalText: {
        fontSize: 14,
        color: '#D97706',
        textAlign: 'center',
    },
});