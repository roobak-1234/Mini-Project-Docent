import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { User, Mail, Phone, Shield, Stethoscope } from 'lucide-react-native';
import { authService } from '../../services/AuthService';
import { NavigationProp } from '@react-navigation/native';

interface Props {
    navigation: NavigationProp<any>;
}

export default function SignupScreen({ navigation }: Props) {
    const [userType, setUserType] = useState<'doctor' | 'staff' | 'patient' | 'traffic-officer'>('patient');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        country: '',
        medicalId: '',
        doctorId: '',
        staffType: '',
        vehicleNumber: '',
        junctionId: '',
        badgeNumber: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const countryMedicalIds = {
        'India': 'NMR ID',
        'USA': 'NPI Number',
        'UK': 'GMC Number',
        'Canada': 'CPSO Number',
        'Australia': 'AHPRA Number'
    };

    const staffTypes = [
        'Nurse',
        'Ambulance Staff',
        'Pharmacist',
        'Receptionist',
        'Lab Technician'
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password.trim()) newErrors.password = 'Password is required';

        if (userType === 'doctor') {
            if (!formData.country) newErrors.country = 'Country is required';
            if (!formData.medicalId.trim()) newErrors.medicalId = `${countryMedicalIds[formData.country as keyof typeof countryMedicalIds] || 'Medical ID'} is required`;
        }

        if (userType === 'staff') {
            if (!formData.doctorId.trim()) newErrors.doctorId = 'Hospital ID is required';
            if (!formData.staffType) newErrors.staffType = 'Staff type is required';
            if (formData.staffType === 'Ambulance Staff' && !formData.vehicleNumber.trim()) {
                newErrors.vehicleNumber = 'Vehicle number is required for ambulance staff';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await authService.signup({
                ...formData,
                userType: userType
            });

            if (response.success) {
                Alert.alert('Success', 'Account created successfully!', [
                    { text: 'OK', onPress: () => navigation.navigate('Signin') }
                ]);
            } else {
                setErrors({ submit: response.message || 'Registration failed. Please try again.' });
            }
        } catch (error) {
            setErrors({ submit: 'An error occurred during registration.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const CategoryButton = ({ type, label, icon, isActive }: any) => (
        <TouchableOpacity
            onPress={() => {
                const newType = type === 'doctor' ? 'doctor' : type;
                setUserType(newType);
                setFormData(prev => ({ 
                    ...prev, 
                    country: '', 
                    medicalId: '', 
                    doctorId: '', 
                    staffType: '', 
                    vehicleNumber: '', 
                    junctionId: '', 
                    badgeNumber: '' 
                }));
            }}
            style={[
                styles.categoryButton,
                isActive ? styles.categoryButtonActive : styles.categoryButtonInactive
            ]}
        >
            {React.cloneElement(icon, { 
                size: 16, 
                color: isActive ? '#66BB6A' : '#64748B' 
            })}
            <Text style={[
                styles.categoryButtonText,
                isActive ? styles.categoryButtonTextActive : styles.categoryButtonTextInactive
            ]}>{label}</Text>
        </TouchableOpacity>
    );

    const SubRoleButton = ({ role, label, isActive }: any) => (
        <TouchableOpacity
            onPress={() => {
                setUserType(role);
                setErrors({});
            }}
            style={[
                styles.subRoleButton,
                isActive ? styles.subRoleButtonActive : styles.subRoleButtonInactive
            ]}
        >
            <Text style={[
                styles.subRoleButtonText,
                isActive ? styles.subRoleButtonTextActive : styles.subRoleButtonTextInactive
            ]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Healthcare Provider Signup</Text>
                    <Text style={styles.subtitle}>Join the Docent emergency network</Text>
                </View>

                {/* Role Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Select Your Category</Text>
                    <View style={styles.categoryGrid}>
                        <CategoryButton
                            type="doctor"
                            label="Hospital Staff"
                            icon={<Stethoscope />}
                            isActive={['doctor', 'staff'].includes(userType)}
                        />
                        <CategoryButton
                            type="patient"
                            label="Patient"
                            icon={<User />}
                            isActive={userType === 'patient'}
                        />
                        <CategoryButton
                            type="traffic-officer"
                            label="Traffic Officer"
                            icon={<Shield />}
                            isActive={userType === 'traffic-officer'}
                        />
                    </View>

                    {/* Sub-Role Selection for Hospital Staff */}
                    {(userType === 'doctor' || userType === 'staff') && (
                        <View style={styles.subRoleContainer}>
                            <Text style={styles.subRoleLabel}>Specific Hospital Role</Text>
                            <View style={styles.subRoleGrid}>
                                <SubRoleButton
                                    role="doctor"
                                    label="Doctor"
                                    isActive={userType === 'doctor'}
                                />
                                <SubRoleButton
                                    role="staff"
                                    label="Health Staff"
                                    isActive={userType === 'staff'}
                                />
                            </View>
                        </View>
                    )}
                </View>

                {/* Basic Fields */}
                <View style={styles.section}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Username</Text>
                        <View style={styles.inputContainer}>
                            <User size={16} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.username}
                                onChangeText={(value) => handleInputChange('username', value)}
                                placeholder="Enter username"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Mail size={16} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                placeholder="Enter email"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                            />
                        </View>
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Shield size={16} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                placeholder="Enter password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                            />
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone (Optional)</Text>
                        <View style={styles.inputContainer}>
                            <Phone size={16} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.phone}
                                onChangeText={(value) => handleInputChange('phone', value)}
                                placeholder="Enter phone number"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>
                </View>

                {/* Doctor-specific fields */}
                {userType === 'doctor' && (
                    <View style={styles.section}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Country</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.country}
                                    onValueChange={(value) => handleInputChange('country', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Country" value="" />
                                    {Object.keys(countryMedicalIds).map(country => (
                                        <Picker.Item key={country} label={country} value={country} />
                                    ))}
                                </Picker>
                            </View>
                            {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
                        </View>

                        {formData.country && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    {countryMedicalIds[formData.country as keyof typeof countryMedicalIds]}
                                </Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.medicalId}
                                    onChangeText={(value) => handleInputChange('medicalId', value)}
                                    placeholder={`Enter ${countryMedicalIds[formData.country as keyof typeof countryMedicalIds]}`}
                                    placeholderTextColor="#9CA3AF"
                                />
                                {errors.medicalId && <Text style={styles.errorText}>{errors.medicalId}</Text>}
                            </View>
                        )}
                    </View>
                )}

                {/* Staff fields */}
                {userType === 'staff' && (
                    <View style={styles.section}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Hospital ID</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.doctorId}
                                onChangeText={(value) => handleInputChange('doctorId', value)}
                                placeholder="Enter Hospital ID (HOSP-XXXXXX)"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text style={styles.helperText}>Get this ID from your hospital administrator</Text>
                            {errors.doctorId && <Text style={styles.errorText}>{errors.doctorId}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Staff Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.staffType}
                                    onValueChange={(value) => handleInputChange('staffType', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Staff Type" value="" />
                                    {staffTypes.map(type => (
                                        <Picker.Item key={type} label={type} value={type} />
                                    ))}
                                </Picker>
                            </View>
                            {errors.staffType && <Text style={styles.errorText}>{errors.staffType}</Text>}
                        </View>

                        {formData.staffType === 'Ambulance Staff' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Vehicle Number / Registration</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.vehicleNumber}
                                    onChangeText={(value) => handleInputChange('vehicleNumber', value)}
                                    placeholder="Enter vehicle registration number"
                                    placeholderTextColor="#9CA3AF"
                                />
                                <Text style={styles.helperText}>Enter the ambulance vehicle registration number</Text>
                                {errors.vehicleNumber && <Text style={styles.errorText}>{errors.vehicleNumber}</Text>}
                            </View>
                        )}
                    </View>
                )}

                {/* Patient doctor ID field */}
                {userType === 'patient' && (
                    <View style={styles.section}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Doctor ID (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.doctorId}
                                onChangeText={(value) => handleInputChange('doctorId', value)}
                                placeholder="DR-XXXXXX-XXX"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text style={styles.helperText}>Enter your doctor's unique ID to link your account</Text>
                        </View>
                    </View>
                )}

                {/* Traffic Officer fields */}
                {userType === 'traffic-officer' && (
                    <View style={styles.section}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Junction Location (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.junctionId}
                                onChangeText={(value) => handleInputChange('junctionId', value)}
                                placeholder="Main St & 4th Ave"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text style={styles.helperText}>Enter your assigned junction/intersection location</Text>
                            {errors.junctionId && <Text style={styles.errorText}>{errors.junctionId}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Badge Number (Optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={formData.badgeNumber}
                                onChangeText={(value) => handleInputChange('badgeNumber', value)}
                                placeholder="TO-12345"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text style={styles.helperText}>Enter your traffic officer badge number</Text>
                            {errors.badgeNumber && <Text style={styles.errorText}>{errors.badgeNumber}</Text>}
                        </View>
                    </View>
                )}

                {/* Submit Section */}
                <View style={styles.section}>
                    {errors.submit && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errors.submit}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading}
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
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
    scrollContainer: {
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    categoryGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    categoryButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    categoryButtonActive: {
        borderColor: '#66BB6A',
        backgroundColor: '#E8F5E8',
    },
    categoryButtonInactive: {
        borderColor: '#D1D5DB',
        backgroundColor: 'white',
    },
    categoryButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    categoryButtonTextActive: {
        color: '#66BB6A',
    },
    categoryButtonTextInactive: {
        color: '#64748B',
    },
    subRoleContainer: {
        backgroundColor: '#F1F5F9',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    subRoleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    subRoleGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    subRoleButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    subRoleButtonActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderTopWidth: 2,
        borderTopColor: '#66BB6A',
    },
    subRoleButtonInactive: {
        backgroundColor: 'transparent',
    },
    subRoleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    subRoleButtonTextActive: {
        color: '#66BB6A',
    },
    subRoleButtonTextInactive: {
        color: '#64748B',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: 'white',
    },
    inputIcon: {
        marginLeft: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: 'white',
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
    errorContainer: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#66BB6A',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});