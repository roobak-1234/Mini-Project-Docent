const AZURE_MAPS_SUBSCRIPTION_KEY = process.env.EXPO_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY || '';

interface MapLocation {
    lat: number;
    lng: number;
    address?: string;
}

class AzureMapsService {
    private subscriptionKey = AZURE_MAPS_SUBSCRIPTION_KEY;
    private baseUrl = 'https://atlas.microsoft.com';

    async geocodeAddress(address: string): Promise<MapLocation | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/search/address/json?api-version=1.0&subscription-key=${this.subscriptionKey}&query=${encodeURIComponent(address)}`
            );
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                return {
                    lat: result.position.lat,
                    lng: result.position.lon,
                    address: result.address.freeformAddress
                };
            }
            
            return null;
        } catch (error) {
            console.error('Geocoding failed:', error);
            return null;
        }
    }

    async reverseGeocode(lat: number, lng: number): Promise<string | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/search/address/reverse/json?api-version=1.0&subscription-key=${this.subscriptionKey}&query=${lat},${lng}`
            );
            
            const data = await response.json();
            
            if (data.addresses && data.addresses.length > 0) {
                return data.addresses[0].address.freeformAddress;
            }
            
            return null;
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return null;
        }
    }

    async findNearbyHospitals(lat: number, lng: number, radius: number = 10000): Promise<any[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/search/nearby/json?api-version=1.0&subscription-key=${this.subscriptionKey}&lat=${lat}&lon=${lng}&radius=${radius}&categorySet=7321`
            );
            
            const data = await response.json();
            
            if (data.results) {
                return data.results.map((result: any) => ({
                    id: result.id,
                    name: result.poi.name,
                    address: result.address.freeformAddress,
                    location: {
                        lat: result.position.lat,
                        lng: result.position.lon
                    },
                    distance: result.dist,
                    phone: result.poi.phone
                }));
            }
            
            return [];
        } catch (error) {
            console.error('Hospital search failed:', error);
            return [];
        }
    }

    async calculateRoute(start: MapLocation, end: MapLocation): Promise<any> {
        try {
            const response = await fetch(
                `${this.baseUrl}/route/directions/json?api-version=1.0&subscription-key=${this.subscriptionKey}&query=${start.lat},${start.lng}:${end.lat},${end.lng}&routeType=fastest&traffic=true`
            );
            
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    distance: route.summary.lengthInMeters,
                    duration: route.summary.travelTimeInSeconds,
                    coordinates: route.legs[0].points.map((point: any) => ({
                        lat: point.latitude,
                        lng: point.longitude
                    }))
                };
            }
            
            return null;
        } catch (error) {
            console.error('Route calculation failed:', error);
            return null;
        }
    }

    getStaticMapUrl(lat: number, lng: number, zoom: number = 15, width: number = 400, height: number = 300): string {
        return `${this.baseUrl}/map/static/png?api-version=1.0&subscription-key=${this.subscriptionKey}&center=${lng},${lat}&zoom=${zoom}&width=${width}&height=${height}&pins=default|co0xFF0000||${lng} ${lat}`;
    }
}

export const azureMapsService = new AzureMapsService();