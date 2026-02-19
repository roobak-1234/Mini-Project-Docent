import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/AuthService';
import { NavigationProp } from '@react-navigation/native';
import { Lock, Mail, TriangleAlert } from 'lucide-react-native';

interface Props {
    navigation: NavigationProp<any>;
}

export default function SigninScreen({ navigation }: Props) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignin = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await authService.signin(formData);
            if (response.success) {
                const user = response.user;
                if (user?.userType === 'traffic-officer') {
                    navigation.navigate('TrafficSentinel');
                } else if (user?.userType === 'patient') {
                    navigation.navigate('PatientDashboard');
                } else if (user?.userType === 'doctor') {
                    navigation.navigate('DoctorDashboard');
                } else if (user?.userType === 'nurse') {
                    navigation.navigate('NurseDashboard');
                } else if (user?.userType === 'staff') {
                    if (user?.staffType === 'Ambulance Staff') {
                        navigation.navigate('AmbulanceDashboard');
                    } else {
                        navigation.navigate('PatientDashboard'); // Default staff dashboard
                    }
                } else {
                    Alert.alert('Coming Soon', `Dashboard for ${user?.userType} is under construction.`);
                }
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('An error occurred during signin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <TriangleAlert size={16} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Mail size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.input}
                            placeholder="Username or Email"
                            placeholderTextColor="#94A3B8"
                            autoCapitalize="none"
                            value={formData.username}
                            onChangeText={(text) => setFormData({ ...formData, username: text })}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text></Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        backgroundColor: '#66BB6A',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        color: '#64748B',
        fontSize: 16,
    },
    errorContainer: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        borderWidth: 1,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorText: {
        color: '#DC2626',
        marginLeft: 8,
        fontWeight: '500',
    },
    formContainer: {
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        color: '#1E293B',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#66BB6A',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    linkContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        color: '#64748B',
    },
    linkTextBold: {
        color: '#66BB6A',
        fontWeight: 'bold',
    },
});