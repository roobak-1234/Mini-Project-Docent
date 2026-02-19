import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Docent</Text>
                <Text style={styles.subtitle}>Intelligent Emergency Response</Text>
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Signup')}
            >
                <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Signin')}
            >
                <Text style={styles.secondaryButtonText}>I Have an Account</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#37474F',
        marginBottom: 8,
    },
    titleAccent: {
        color: '#66BB6A',
    },
    subtitle: {
        color: '#9E9E9E',
        letterSpacing: 2,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#66BB6A',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#66BB6A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#66BB6A',
        borderWidth: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#66BB6A',
        fontWeight: 'bold',
        fontSize: 18,
    },
});