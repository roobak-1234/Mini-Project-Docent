import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { Heart, Activity, Thermometer, FileText, Save, X } from 'lucide-react-native';

interface VitalsData {
    heartRate?: number;
    bloodPressure?: string;
    spO2?: number;
    notes?: string;
}

interface Props {
    isVisible: boolean;
    onClose: () => void;
    onSave: (vitals: VitalsData) => void;
    initialData?: VitalsData;
}

export default function VitalsInputForm({ isVisible, onClose, onSave, initialData = {} }: Props) {
    const [vitals, setVitals] = useState<VitalsData>(initialData);

    const handleSave = () => {
        onSave(vitals);
        onClose();
        setVitals({});
    };

    const handleInputChange = (field: keyof VitalsData, value: string | number) => {
        setVitals(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.headerTitle}>Patient Vitals</Text>
                            <Text style={styles.headerSubtitle}>Touch-optimized for in-transit use</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Heart size={24} color="#EF4444" />
                                <Text style={styles.label}>Heart Rate (BPM)</Text>
                            </View>
                            <TextInput
                                style={styles.numberInput}
                                value={vitals.heartRate?.toString() || ''}
                                onChangeText={(text) => handleInputChange('heartRate', parseInt(text) || 0)}
                                placeholder="80"
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Activity size={24} color="#3B82F6" />
                                <Text style={styles.label}>Blood Pressure</Text>
                            </View>
                            <TextInput
                                style={styles.numberInput}
                                value={vitals.bloodPressure || ''}
                                onChangeText={(text) => handleInputChange('bloodPressure', text)}
                                placeholder="120/80"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <Thermometer size={24} color="#10B981" />
                                <Text style={styles.label}>SpO2 (%)</Text>
                            </View>
                            <TextInput
                                style={styles.numberInput}
                                value={vitals.spO2?.toString() || ''}
                                onChangeText={(text) => handleInputChange('spO2', parseInt(text) || 0)}
                                placeholder="98"
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelContainer}>
                                <FileText size={24} color="#8B5CF6" />
                                <Text style={styles.label}>Trauma Notes</Text>
                            </View>
                            <TextInput
                                style={styles.textArea}
                                value={vitals.notes || ''}
                                onChangeText={(text) => handleInputChange('notes', text)}
                                placeholder="Patient condition, injuries, medications administered..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                                <Save size={24} color="white" />
                                <Text style={styles.saveButtonText}>Save Vitals</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        maxHeight: '90%',
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#DC2626',
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#FCA5A5',
        marginTop: 4,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    content: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 8,
    },
    numberInput: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 16,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        backgroundColor: 'white',
        color: '#1F2937',
    },
    textArea: {
        fontSize: 16,
        padding: 16,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        backgroundColor: 'white',
        color: '#1F2937',
        minHeight: 120,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: '#16A34A',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});