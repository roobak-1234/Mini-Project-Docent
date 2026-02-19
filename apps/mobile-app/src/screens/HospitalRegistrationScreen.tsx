import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { ArrowLeft, Building2, MapPin, Bed, CheckCircle, Phone, Mail, ArrowRight } from 'lucide-react-native';
import { NavigationProp } from '@react-navigation/native';
import { authService } from '../services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    navigation: NavigationProp<any>;
}

interface HospitalData {
    name: string;
    type: string;
    phone: string;
    emergencyEmail: string;
    adminContact: string;
    address: string;
    latitude: number;
    longitude: number;
    icuBeds: string;
    hduBeds: string;
    isolationBeds: string;
    nicuBeds: string;
    picuBeds: string;
    ventilators: string;
    otStatus: string;
    accreditation: string;
    globalId: string;
    specializations: {
        traumaLevel1: boolean;
        cardiacCenter: boolean;
        pediatricEmergency: boolean;
        infectiousDisease: boolean;
        maternalFetal: boolean;
        strokeCenter: boolean;
        mentalHealth: boolean;
    };
    ambulanceIds: string;
}

export default function HospitalRegistrationScreen({ navigation }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<HospitalData>({
        name: '',
        type: '',
        phone: '',
        emergencyEmail: '',
        adminContact: '',
        address: '',
        latitude: 0,
        longitude: 0,
        icuBeds: '',
        hduBeds: '',
        isolationBeds: '',
        nicuBeds: '',
        picuBeds: '',
        ventilators: '',
        otStatus: '',
        accreditation: '',
        globalId: '',
        specializations: {
            traumaLevel1: false,
            cardiacCenter: false,
            pediatricEmergency: false,
            infectiousDisease: false,
            maternalFetal: false,
            strokeCenter: false,
            mentalHealth: false
        },
        ambulanceIds: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = [
        { title: 'Facility Identity', icon: Building2 },
        { title: 'Contact & Location', icon: MapPin },
        { title: 'Capacity & Specializations', icon: Bed },
        { title: 'Review & Submit', icon: CheckCircle }
    ];

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.userType === 'doctor') {
            setFormData(prev => ({ ...prev, adminContact: currentUser.username }));
        }
    }, []);

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.name.trim()) newErrors.name = 'Hospital name is required';
                if (!formData.type) newErrors.type = 'Hospital type is required';
                break;
            case 2:
                if (!formData.adminContact.trim()) newErrors.adminContact = 'Admin contact is required';
                if (!formData.address.trim()) newErrors.address = 'Address is required';
                if (formData.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
                    newErrors.phone = 'Invalid phone format';
                }
                if (formData.emergencyEmail && !/\S+@\S+\.\S+/.test(formData.emergencyEmail)) {
                    newErrors.emergencyEmail = 'Invalid email format';
                }
                break;
            case 3:
                if (!formData.icuBeds || parseInt(formData.icuBeds) < 0) newErrors.icuBeds = 'ICU beds count required';
                if (!formData.hduBeds || parseInt(formData.hduBeds) < 0) newErrors.hduBeds = 'HDU beds count required';
                if (!formData.isolationBeds || parseInt(formData.isolationBeds) < 0) newErrors.isolationBeds = 'Isolation beds count required';
                if (!formData.nicuBeds || parseInt(formData.nicuBeds) < 0) newErrors.nicuBeds = 'NICU beds count required';
                if (!formData.picuBeds || parseInt(formData.picuBeds) < 0) newErrors.picuBeds = 'PICU beds count required';
                if (!formData.ventilators || parseInt(formData.ventilators) < 0) newErrors.ventilators = 'Ventilator count required';
                if (!formData.otStatus) newErrors.otStatus = 'OT status required';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep) && currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);
        try {
            // Generate unique hospital ID
            const hospitalNamePrefix = formData.name
                .replace(/[^a-zA-Z0-9]/g, '')
                .substring(0, 4)
                .toUpperCase();
            const timestamp = Date.now().toString().slice(-4);
            const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
            const hospitalId = `${hospitalNamePrefix}-${timestamp}-${random}`;

            // Process ambulance IDs
            const ambulanceIds = formData.ambulanceIds
                ? formData.ambulanceIds.split(',').map(id => {
                    const trimmed = id.trim();
                    if (/[A-Za-z]/.test(trimmed) && !/^AMB-/.test(trimmed)) {
                        return `AMB-${trimmed.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}`;
                    }
                    return trimmed;
                }).filter(Boolean)
                : [];

            const hospitalData = {
                ...formData,
                uniqueHospitalId: hospitalId,
                id: Date.now().toString(),
                registeredAt: new Date().toISOString(),
                adminContact: authService.getCurrentUser()?.username || formData.adminContact,
                ambulanceIds
            };

            // Save to AsyncStorage
            const hospitalsJson = await AsyncStorage.getItem('registered_hospitals');
            const hospitals = hospitalsJson ? JSON.parse(hospitalsJson) : [];
            hospitals.push(hospitalData);
            await AsyncStorage.setItem('registered_hospitals', JSON.stringify(hospitals));

            Alert.alert(
                'Success',
                `Hospital registered successfully!\nHospital ID: ${hospitalId}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Error', 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const updateSpecialization = (key: keyof HospitalData['specializations'], value: boolean) => {
        setFormData(prev => ({
            ...prev,
            specializations: { ...prev.specializations, [key]: value }
        }));
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                const StepIcon = step.icon;

                return (
                    <View key={stepNumber} style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            isActive && styles.stepCircleActive,
                            isCompleted && styles.stepCircleCompleted
                        ]}>
                            <StepIcon size={16} color={isActive || isCompleted ? 'white' : '#9CA3AF'} />
                        </View>
                        <View style={styles.stepText}>
                            <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
                                Step {stepNumber}
                            </Text>
                            <Text style={[styles.stepTitle, isActive && styles.stepTitleActive]}>
                                {step.title}
                            </Text>
                        </View>
                        {stepNumber < steps.length && (
                            <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
                        )}
                    </View>
                );
            })}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#64748B" />
                </TouchableOpacity>
                <Text style={styles.title}>Register Hospital</Text>
            </View>

            {renderStepIndicator()}

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.card}>
                    {/* Step 1: Facility Identity */}
                    {currentStep === 1 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepHeader}>Facility Identity</Text>
                            
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Hospital Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.name}
                                    onChangeText={(text) => updateFormData('name', text)}
                                    placeholder="City General Hospital"
                                />
                                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Hospital Type</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={formData.type}
                                        onValueChange={(value) => updateFormData('type', value)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select type" value="" />
                                        <Picker.Item label="Private Hospital" value="Private" />
                                        <Picker.Item label="Government Hospital" value="Government" />
                                        <Picker.Item label="Clinic" value="Clinic" />
                                    </Picker>
                                </View>
                                {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
                            </View>
                        </View>
                    )}

                    {/* Step 2: Contact & Location */}
                    {currentStep === 2 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepHeader}>Contact & Location</Text>
                            
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Emergency Phone (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.phone}
                                    onChangeText={(text) => updateFormData('phone', text)}
                                    placeholder="+1 (555) 123-4567"
                                    keyboardType="phone-pad"
                                />
                                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Emergency Desk Email (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.emergencyEmail}
                                    onChangeText={(text) => updateFormData('emergencyEmail', text)}
                                    placeholder="emergency@hospital.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {errors.emergencyEmail && <Text style={styles.errorText}>{errors.emergencyEmail}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Admin Contact Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.adminContact}
                                    onChangeText={(text) => updateFormData('adminContact', text)}
                                    placeholder="Dr. John Smith"
                                />
                                {errors.adminContact && <Text style={styles.errorText}>{errors.adminContact}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Global Identifier (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.globalId}
                                    onChangeText={(text) => updateFormData('globalId', text)}
                                    placeholder="NPI, OID, or international ID"
                                />
                                <Text style={styles.helperText}>International identifier for system interoperability</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Accreditation Status (Optional)</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={formData.accreditation}
                                        onValueChange={(value) => updateFormData('accreditation', value)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select accreditation" value="" />
                                        <Picker.Item label="JCI (Joint Commission International)" value="JCI" />
                                        <Picker.Item label="ISO 9001" value="ISO" />
                                        <Picker.Item label="NABH (India)" value="NABH" />
                                        <Picker.Item label="ACHSI (Australia)" value="ACHSI" />
                                        <Picker.Item label="Other International" value="Other" />
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Hospital Address</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.address}
                                    onChangeText={(text) => updateFormData('address', text)}
                                    placeholder="123 Main Street, City, State"
                                    multiline
                                />
                                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                            </View>
                        </View>
                    )}

                    {/* Step 3: Capacity & Specializations */}
                    {currentStep === 3 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepHeader}>Critical Care Capacity & Equipment</Text>
                            
                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>ICU Beds</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.icuBeds}
                                        onChangeText={(text) => updateFormData('icuBeds', text)}
                                        placeholder="12"
                                        keyboardType="numeric"
                                    />
                                    {errors.icuBeds && <Text style={styles.errorText}>{errors.icuBeds}</Text>}
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>HDU Beds</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.hduBeds}
                                        onChangeText={(text) => updateFormData('hduBeds', text)}
                                        placeholder="8"
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.helperText}>High Dependency Unit</Text>
                                    {errors.hduBeds && <Text style={styles.errorText}>{errors.hduBeds}</Text>}
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Isolation Beds</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.isolationBeds}
                                        onChangeText={(text) => updateFormData('isolationBeds', text)}
                                        placeholder="4"
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.helperText}>Negative pressure rooms</Text>
                                    {errors.isolationBeds && <Text style={styles.errorText}>{errors.isolationBeds}</Text>}
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>NICU Beds</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.nicuBeds}
                                        onChangeText={(text) => updateFormData('nicuBeds', text)}
                                        placeholder="6"
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.helperText}>Neonatal ICU</Text>
                                    {errors.nicuBeds && <Text style={styles.errorText}>{errors.nicuBeds}</Text>}
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>PICU Beds</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.picuBeds}
                                        onChangeText={(text) => updateFormData('picuBeds', text)}
                                        placeholder="4"
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.helperText}>Pediatric ICU</Text>
                                    {errors.picuBeds && <Text style={styles.errorText}>{errors.picuBeds}</Text>}
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Ventilators</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.ventilators}
                                        onChangeText={(text) => updateFormData('ventilators', text)}
                                        placeholder="10"
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.helperText}>Available ventilators</Text>
                                    {errors.ventilators && <Text style={styles.errorText}>{errors.ventilators}</Text>}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Operating Theater Status</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={formData.otStatus}
                                        onValueChange={(value) => updateFormData('otStatus', value)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select status" value="" />
                                        <Picker.Item label="Available" value="Available" />
                                        <Picker.Item label="Occupied" value="Occupied" />
                                        <Picker.Item label="Under Maintenance" value="Maintenance" />
                                    </Picker>
                                </View>
                                {errors.otStatus && <Text style={styles.errorText}>{errors.otStatus}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Medical Specializations & Centers</Text>
                                {[
                                    { key: 'traumaLevel1', label: 'Trauma Level 1', desc: 'Comprehensive trauma care' },
                                    { key: 'cardiacCenter', label: 'Cardiac Center', desc: 'Heart surgery & interventions' },
                                    { key: 'strokeCenter', label: 'Stroke Center', desc: 'Neurological emergency care' },
                                    { key: 'pediatricEmergency', label: 'Pediatric Emergency', desc: 'Children emergency care' },
                                    { key: 'infectiousDisease', label: 'Infectious Disease', desc: 'Isolation & outbreak management' },
                                    { key: 'maternalFetal', label: 'Maternal-Fetal Medicine', desc: 'High-risk pregnancy care' },
                                    { key: 'mentalHealth', label: 'Mental Health', desc: 'Psychiatric emergency services' }
                                ].map(({ key, label, desc }) => (
                                    <View key={key} style={styles.checkboxContainer}>
                                        <View style={styles.checkboxRow}>
                                            <Switch
                                                value={formData.specializations[key as keyof typeof formData.specializations]}
                                                onValueChange={(value) => updateSpecialization(key as keyof typeof formData.specializations, value)}
                                                trackColor={{ false: '#D1D5DB', true: '#66BB6A' }}
                                                thumbColor={formData.specializations[key as keyof typeof formData.specializations] ? '#FFFFFF' : '#F3F4F6'}
                                            />
                                            <View style={styles.checkboxText}>
                                                <Text style={styles.checkboxLabel}>{label}</Text>
                                                <Text style={styles.checkboxDesc}>{desc}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Ambulance Fleet IDs or Vehicle Registration Numbers (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.ambulanceIds}
                                    onChangeText={(text) => updateFormData('ambulanceIds', text)}
                                    placeholder="AMB-001, ABC123, XYZ789"
                                    multiline
                                />
                                <Text style={styles.helperText}>Enter Fleet IDs (AMB-001) or Vehicle Registration Numbers (ABC123). Registration numbers will be auto-converted to Fleet IDs.</Text>
                            </View>
                        </View>
                    )}

                    {/* Step 4: Review & Submit */}
                    {currentStep === 4 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepHeader}>Review & Submit</Text>
                            
                            <View style={styles.reviewContainer}>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Hospital Name:</Text>
                                    <Text style={styles.reviewValue}>{formData.name}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Type:</Text>
                                    <Text style={styles.reviewValue}>{formData.type}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Phone:</Text>
                                    <Text style={styles.reviewValue}>{formData.phone || 'Not provided'}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Email:</Text>
                                    <Text style={styles.reviewValue}>{formData.emergencyEmail || 'Not provided'}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Admin:</Text>
                                    <Text style={styles.reviewValue}>{formData.adminContact}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>ICU Beds:</Text>
                                    <Text style={styles.reviewValue}>{formData.icuBeds}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>HDU Beds:</Text>
                                    <Text style={styles.reviewValue}>{formData.hduBeds}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Isolation Beds:</Text>
                                    <Text style={styles.reviewValue}>{formData.isolationBeds}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>NICU Beds:</Text>
                                    <Text style={styles.reviewValue}>{formData.nicuBeds}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>PICU Beds:</Text>
                                    <Text style={styles.reviewValue}>{formData.picuBeds}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Ventilators:</Text>
                                    <Text style={styles.reviewValue}>{formData.ventilators}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>OT Status:</Text>
                                    <Text style={styles.reviewValue}>{formData.otStatus}</Text>
                                </View>
                                {formData.accreditation && (
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Accreditation:</Text>
                                        <Text style={styles.reviewValue}>{formData.accreditation}</Text>
                                    </View>
                                )}
                                {formData.globalId && (
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Global ID:</Text>
                                        <Text style={styles.reviewValue}>{formData.globalId}</Text>
                                    </View>
                                )}
                                {formData.address && (
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Address:</Text>
                                        <Text style={styles.reviewValue}>{formData.address}</Text>
                                    </View>
                                )}
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Specializations:</Text>
                                    <Text style={styles.reviewValue}>
                                        {Object.entries(formData.specializations)
                                            .filter(([_, value]) => value)
                                            .map(([key]) => key.replace(/([A-Z])/g, ' $1'))
                                            .join(', ') || 'None'}
                                    </Text>
                                </View>
                                {formData.ambulanceIds && (
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Ambulance Fleet:</Text>
                                        <Text style={styles.reviewValue}>{formData.ambulanceIds}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Navigation Buttons */}
                    <View style={styles.navigationButtons}>
                        <TouchableOpacity
                            onPress={prevStep}
                            disabled={currentStep === 1}
                            style={[styles.navButton, styles.prevButton, currentStep === 1 && styles.disabledButton]}
                        >
                            <ArrowLeft size={16} color={currentStep === 1 ? '#9CA3AF' : '#6B7280'} />
                            <Text style={[styles.navButtonText, currentStep === 1 && styles.disabledButtonText]}>
                                Previous
                            </Text>
                        </TouchableOpacity>

                        {currentStep < 4 ? (
                            <TouchableOpacity onPress={nextStep} style={[styles.navButton, styles.nextButton]}>
                                <Text style={styles.nextButtonText}>Next</Text>
                                <ArrowRight size={16} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                style={[styles.navButton, styles.submitButton, isSubmitting && styles.disabledButton]}
                            >
                                <Text style={styles.submitButtonText}>
                                    {isSubmitting ? 'Registering...' : 'Register Hospital'}
                                </Text>
                                <CheckCircle size={16} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
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
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    stepItem: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: {
        borderColor: '#66BB6A',
        backgroundColor: '#66BB6A',
    },
    stepCircleCompleted: {
        borderColor: '#10B981',
        backgroundColor: '#10B981',
    },
    stepText: {
        alignItems: 'center',
        marginTop: 8,
    },
    stepNumber: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '500',
    },
    stepNumberActive: {
        color: '#66BB6A',
    },
    stepTitle: {
        fontSize: 8,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    stepTitleActive: {
        color: '#1F2937',
    },
    stepLine: {
        position: 'absolute',
        top: 16,
        right: -50,
        width: 100,
        height: 2,
        backgroundColor: '#D1D5DB',
        zIndex: -1,
    },
    stepLineCompleted: {
        backgroundColor: '#10B981',
    },
    scrollContainer: {
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    stepContent: {
        marginBottom: 24,
    },
    stepHeader: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: 'white',
    },
    picker: {
        height: 50,
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    halfInput: {
        flex: 1,
    },
    checkboxContainer: {
        marginBottom: 12,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
    },
    checkboxText: {
        flex: 1,
        marginLeft: 12,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    checkboxDesc: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    reviewContainer: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
    },
    reviewRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    reviewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        width: 120,
    },
    reviewValue: {
        fontSize: 14,
        color: '#1F2937',
        flex: 1,
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    prevButton: {
        backgroundColor: '#F3F4F6',
    },
    nextButton: {
        backgroundColor: '#66BB6A',
    },
    submitButton: {
        backgroundColor: '#66BB6A',
    },
    disabledButton: {
        opacity: 0.5,
    },
    navButtonText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    nextButtonText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
    },
    submitButtonText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
    },
    disabledButtonText: {
        color: '#9CA3AF',
    },
});