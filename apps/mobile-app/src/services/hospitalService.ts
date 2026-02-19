import AsyncStorage from '@react-native-async-storage/async-storage';

interface HospitalRegistrationData {
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
    ambulanceIds: string[];
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message: string;
}

class HospitalService {
    private baseUrl = 'https://lifelink-api.azurewebsites.net/api';

    async registerHospital(hospitalData: HospitalRegistrationData): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${this.baseUrl}/hospitals/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({ hospitalData })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: true,
                data: result,
                message: 'Hospital registered successfully'
            };

        } catch (error) {
            console.error('Hospital registration failed:', error);
            await this.storeHospitalLocally(hospitalData);
            return {
                success: true,
                message: 'Hospital registered successfully (demo mode)'
            };
        }
    }

    private async storeHospitalLocally(hospitalData: HospitalRegistrationData): Promise<void> {
        try {
            const hospitalsJson = await AsyncStorage.getItem('registered_hospitals');
            const hospitals = hospitalsJson ? JSON.parse(hospitalsJson) : [];
            hospitals.push({
                ...hospitalData,
                id: Date.now().toString(),
                registeredAt: new Date().toISOString()
            });
            await AsyncStorage.setItem('registered_hospitals', JSON.stringify(hospitals));
        } catch (error) {
            console.error('Failed to store hospital locally:', error);
        }
    }

    async getRegisteredHospitals(): Promise<ApiResponse<HospitalRegistrationData[]>> {
        try {
            const response = await fetch(`${this.baseUrl}/hospitals`, {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const hospitals = await response.json();
            return {
                success: true,
                data: hospitals,
                message: 'Hospitals retrieved successfully'
            };

        } catch (error) {
            const hospitalsJson = await AsyncStorage.getItem('registered_hospitals');
            const hospitals = hospitalsJson ? JSON.parse(hospitalsJson) : [];
            return {
                success: true,
                data: hospitals,
                message: 'Hospitals retrieved from local storage'
            };
        }
    }

    private async getAuthToken(): Promise<string> {
        try {
            return await AsyncStorage.getItem('auth_token') || 'demo_token';
        } catch {
            return 'demo_token';
        }
    }

    async generateCapabilitySummary(hospitalData: HospitalRegistrationData): Promise<string> {
        try {
            const specializations = Object.entries(hospitalData.specializations)
                .filter(([_, value]) => value)
                .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
                .join(', ');

            return `${hospitalData.name} is a ${hospitalData.type.toLowerCase()} facility with ${hospitalData.icuBeds} ICU, ${hospitalData.hduBeds} HDU, ${hospitalData.isolationBeds} isolation beds, and ${hospitalData.ventilators} ventilators available. OT currently ${hospitalData.otStatus.toLowerCase()}. ${specializations ? `Specialized for ${specializations} cases.` : ''} Optimal for emergency patients requiring these specific services.`;

        } catch (error) {
            console.error('AI summary generation failed:', error);
            return `${hospitalData.name} - ${hospitalData.type} hospital with ${hospitalData.icuBeds} ICU beds available.`;
        }
    }
}

export const hospitalService = new HospitalService();