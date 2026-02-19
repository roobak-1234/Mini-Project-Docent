import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapPin, Navigation, Zap } from 'lucide-react-native';
import * as Location from 'expo-location';
import { azureMapsService } from '../services/AzureMapsService';

interface Props {
    location?: { lat: number; lng: number };
    onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
    showCurrentLocation?: boolean;
    markers?: Array<{ lat: number; lng: number; title: string; color?: string }>;
    height?: number;
}

export default function AzureMapView({ 
    location, 
    onLocationSelect, 
    showCurrentLocation = true, 
    markers = [],
    height = 300 
}: Props) {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapUrl, setMapUrl] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [useNativeMaps, setUseNativeMaps] = useState<boolean>(false);

    useEffect(() => {
        if (showCurrentLocation) {
            getCurrentLocation();
        }
    }, [showCurrentLocation]);

    useEffect(() => {
        updateMapUrl();
    }, [location, currentLocation, markers]);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const position = await Location.getCurrentPositionAsync({});
            const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            setCurrentLocation(coords);
            
            // Get address for current location
            const addr = await azureMapsService.reverseGeocode(coords.lat, coords.lng);
            if (addr) setAddress(addr);
            
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const updateMapUrl = async () => {
        const mapLocation = location || currentLocation;
        if (!mapLocation) return;

        try {
            const { width } = Dimensions.get('window');
            let url = azureMapsService.getStaticMapUrl(
                mapLocation.lat, 
                mapLocation.lng, 
                15, 
                Math.floor(width - 32), 
                height
            );

            // Add markers to URL
            if (markers.length > 0) {
                const markerParams = markers.map(marker => 
                    `default|co${marker.color || '0xFF0000'}||${marker.lng} ${marker.lat}`
                ).join('&pins=');
                url += `&pins=${markerParams}`;
            }

            // Test if the URL loads
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setMapUrl(url);
                setUseNativeMaps(false);
            } else {
                setUseNativeMaps(true);
            }
        } catch (error) {
            console.log('Azure Maps failed, using native maps:', error);
            setUseNativeMaps(true);
        }
    };

    const handleMapPress = async () => {
        if (!onLocationSelect) return;

        const mapLocation = location || currentLocation;
        if (!mapLocation) return;

        const addr = await azureMapsService.reverseGeocode(mapLocation.lat, mapLocation.lng);
        onLocationSelect({
            lat: mapLocation.lat,
            lng: mapLocation.lng,
            address: addr || 'Unknown location'
        });
    };

    const centerOnCurrentLocation = () => {
        getCurrentLocation();
    };

    const mapLocation = location || currentLocation;

    if (!mapLocation) {
        return (
            <View style={[styles.container, { height }]}>
                <View style={styles.loadingContainer}>
                    <MapPin size={48} color="#9CA3AF" />
                    <Text style={styles.loadingText}>Loading map...</Text>
                </View>
            </View>
        );
    }

    if (useNativeMaps) {
        return (
            <View style={[styles.container, { height }]}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: mapLocation.lat,
                        longitude: mapLocation.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    onPress={handleMapPress}
                >
                    <Marker
                        coordinate={{
                            latitude: mapLocation.lat,
                            longitude: mapLocation.lng,
                        }}
                        title="Current Location"
                    />
                    {markers.map((marker, index) => (
                        <Marker
                            key={index}
                            coordinate={{
                                latitude: marker.lat,
                                longitude: marker.lng,
                            }}
                            title={marker.title}
                            pinColor={marker.color === '0x00FF00' ? 'green' : 'red'}
                        />
                    ))}
                </MapView>
                
                {address && (
                    <View style={styles.addressContainer}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.addressText}>{address}</Text>
                    </View>
                )}

                {showCurrentLocation && (
                    <TouchableOpacity 
                        style={styles.locationButton} 
                        onPress={centerOnCurrentLocation}
                    >
                        <Navigation size={20} color="white" />
                    </TouchableOpacity>
                )}

                {markers.length > 0 && (
                    <View style={styles.markerInfo}>
                        <Zap size={16} color="#F59E0B" />
                        <Text style={styles.markerText}>{markers.length} location(s)</Text>
                    </View>
                )}
            </View>
        );
    }

    if (!mapUrl) {
        return (
            <View style={[styles.container, { height }]}>
                <View style={styles.loadingContainer}>
                    <MapPin size={48} color="#9CA3AF" />
                    <Text style={styles.loadingText}>Loading map...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { height }]}>
            <TouchableOpacity onPress={handleMapPress} style={styles.mapContainer}>
                <Image 
                    source={{ uri: mapUrl }} 
                    style={styles.map}
                    resizeMode="cover"
                    onError={() => setUseNativeMaps(true)}
                />
            </TouchableOpacity>
            
            {address && (
                <View style={styles.addressContainer}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.addressText}>{address}</Text>
                </View>
            )}

            {showCurrentLocation && (
                <TouchableOpacity 
                    style={styles.locationButton} 
                    onPress={centerOnCurrentLocation}
                >
                    <Navigation size={20} color="white" />
                </TouchableOpacity>
            )}

            {markers.length > 0 && (
                <View style={styles.markerInfo}>
                    <Zap size={16} color="#F59E0B" />
                    <Text style={styles.markerText}>{markers.length} location(s)</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    addressContainer: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    addressText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#374151',
        flex: 1,
    },
    locationButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#3B82F6',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    markerInfo: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(251, 191, 36, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    markerText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#92400E',
        fontWeight: '500',
    },
});