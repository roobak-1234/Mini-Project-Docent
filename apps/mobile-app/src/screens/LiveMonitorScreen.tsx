import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Grid, Maximize, RotateCcw, Settings } from 'lucide-react-native';
import { authService } from '../services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LiveMonitorScreen() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [hospitalInfo, setHospitalInfo] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
    const [selectedCamera, setSelectedCamera] = useState<number>(0);

    // Mock CCTV feeds - in real app these would be actual video streams
    const cameraFeeds = [
        { id: 1, name: 'Emergency Room', location: 'Ground Floor', status: 'online' },
        { id: 2, name: 'ICU Ward', location: '2nd Floor', status: 'online' },
        { id: 3, name: 'Main Entrance', location: 'Ground Floor', status: 'online' },
        { id: 4, name: 'Parking Area', location: 'Outside', status: 'offline' },
        { id: 5, name: 'Surgery Room 1', location: '3rd Floor', status: 'online' },
        { id: 6, name: 'Pharmacy', location: 'Ground Floor', status: 'online' },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);

        if (user?.username) {
            const hospitalsJson = await AsyncStorage.getItem('registered_hospitals');
            const hospitals = hospitalsJson ? JSON.parse(hospitalsJson) : [];
            const hospital = hospitals.find((h: any) => h.adminContact === user.username);
            setHospitalInfo(hospital);
        }
    };

    const renderCameraFeed = (camera: any, index: number) => (
        <TouchableOpacity
            key={camera.id}
            style={[
                styles.cameraFeed,
                viewMode === 'grid' ? styles.gridCamera : styles.singleCamera,
                selectedCamera === index && viewMode === 'single' && styles.selectedCamera
            ]}
            onPress={() => {
                if (viewMode === 'grid') {
                    setSelectedCamera(index);
                    setViewMode('single');
                }
            }}
        >
            <View style={styles.cameraHeader}>
                <View style={styles.cameraInfo}>
                    <Text style={styles.cameraName}>{camera.name}</Text>
                    <Text style={styles.cameraLocation}>{camera.location}</Text>
                </View>
                <View style={[styles.statusDot, camera.status === 'online' ? styles.online : styles.offline]} />
            </View>
            
            <View style={styles.videoContainer}>
                <Camera size={viewMode === 'grid' ? 32 : 48} color="#9CA3AF" />
                <Text style={styles.videoPlaceholder}>
                    {camera.status === 'online' ? 'Live Feed' : 'Camera Offline'}
                </Text>
            </View>

            {viewMode === 'single' && (
                <View style={styles.cameraControls}>
                    <TouchableOpacity style={styles.controlButton}>
                        <RotateCcw size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton}>
                        <Maximize size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton}>
                        <Settings size={16} color="#64748B" />
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Live Monitor</Text>
                    {hospitalInfo && (
                        <Text style={styles.subtitle}>{hospitalInfo.name} - CCTV System</Text>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.viewToggle}
                    onPress={() => setViewMode(viewMode === 'grid' ? 'single' : 'grid')}
                >
                    <Grid size={20} color="#3B82F6" />
                    <Text style={styles.viewToggleText}>
                        {viewMode === 'grid' ? 'Grid View' : 'Single View'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {!hospitalInfo ? (
                    <View style={styles.noHospital}>
                        <Camera size={48} color="#D1D5DB" />
                        <Text style={styles.noHospitalTitle}>No Hospital Registered</Text>
                        <Text style={styles.noHospitalText}>
                            Register a hospital first to access CCTV monitoring system.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.cameraGrid}>
                        {viewMode === 'grid' ? (
                            cameraFeeds.map((camera, index) => renderCameraFeed(camera, index))
                        ) : (
                            <>
                                {renderCameraFeed(cameraFeeds[selectedCamera], selectedCamera)}
                                <View style={styles.thumbnailRow}>
                                    <Text style={styles.thumbnailTitle}>Other Cameras</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {cameraFeeds.map((camera, index) => (
                                            index !== selectedCamera && (
                                                <TouchableOpacity
                                                    key={camera.id}
                                                    style={styles.thumbnail}
                                                    onPress={() => setSelectedCamera(index)}
                                                >
                                                    <Camera size={16} color="#9CA3AF" />
                                                    <Text style={styles.thumbnailName}>{camera.name}</Text>
                                                </TouchableOpacity>
                                            )
                                        ))}
                                    </ScrollView>
                                </View>
                            </>
                        )}
                    </View>
                )}

                {hospitalInfo && (
                    <View style={styles.systemInfo}>
                        <Text style={styles.systemTitle}>System Status</Text>
                        <View style={styles.statusGrid}>
                            <View style={styles.statusItem}>
                                <Text style={styles.statusValue}>
                                    {cameraFeeds.filter(c => c.status === 'online').length}
                                </Text>
                                <Text style={styles.statusLabel}>Online</Text>
                            </View>
                            <View style={styles.statusItem}>
                                <Text style={styles.statusValue}>
                                    {cameraFeeds.filter(c => c.status === 'offline').length}
                                </Text>
                                <Text style={styles.statusLabel}>Offline</Text>
                            </View>
                            <View style={styles.statusItem}>
                                <Text style={styles.statusValue}>{cameraFeeds.length}</Text>
                                <Text style={styles.statusLabel}>Total</Text>
                            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    viewToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewToggleText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
        marginLeft: 6,
    },
    scrollContainer: {
        padding: 20,
    },
    noHospital: {
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: 'white',
        borderRadius: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    noHospitalTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    noHospitalText: {
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    cameraGrid: {
        gap: 16,
    },
    cameraFeed: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        overflow: 'hidden',
    },
    gridCamera: {
        width: (width - 60) / 2,
        height: 160,
        marginBottom: 16,
    },
    singleCamera: {
        width: '100%',
        height: 280,
        marginBottom: 20,
    },
    selectedCamera: {
        borderColor: '#3B82F6',
        borderWidth: 2,
    },
    cameraHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    cameraInfo: {
        flex: 1,
    },
    cameraName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    cameraLocation: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    online: {
        backgroundColor: '#10B981',
    },
    offline: {
        backgroundColor: '#EF4444',
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        minHeight: 100,
    },
    videoPlaceholder: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    controlButton: {
        padding: 8,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    thumbnailRow: {
        marginTop: 20,
    },
    thumbnailTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 12,
    },
    thumbnail: {
        width: 80,
        height: 60,
        backgroundColor: 'white',
        borderRadius: 8,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    thumbnailName: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 4,
        textAlign: 'center',
    },
    systemInfo: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
        marginTop: 20,
    },
    systemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 16,
    },
    statusGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statusItem: {
        alignItems: 'center',
    },
    statusValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statusLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
});