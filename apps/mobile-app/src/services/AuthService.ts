import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';

class AuthService {
    private users: User[] = [];
    private currentUser: Omit<User, 'password'> | null = null;
    private initialized: boolean = false;

    constructor() {
        this.initialize();
    }

    async initialize() {
        if (this.initialized) return;
        try {
            const stored = await AsyncStorage.getItem('docent_users');
            if (stored) {
                this.users = JSON.parse(stored);
            }
            const current = await AsyncStorage.getItem('docent_current_user');
            if (current) {
                this.currentUser = JSON.parse(current);
            }
        } catch (e) {
            console.error("Failed to load users", e);
            this.users = [];
        }
        this.initialized = true;
    }

    private async saveUsers() {
        try {
            await AsyncStorage.setItem('docent_users', JSON.stringify(this.users));
        } catch (e) {
            console.error("Failed to save users", e);
        }
    }

    async signup(userData: Omit<User, 'id' | 'uniqueDoctorId' | 'createdAt'>): Promise<AuthResponse> {
        await this.initialize();

        const existingUser = this.users.find(
            u => u.username === userData.username || u.email === userData.email
        );

        if (existingUser) {
            return {
                success: false,
                message: 'Username or email already exists'
            };
        }

        let uniqueDoctorId: string | undefined;
        if (userData.userType === 'doctor') {
            uniqueDoctorId = this.generateUniqueDoctorId();
        }

        const newUser: User = {
            id: Date.now().toString(),
            ...userData,
            uniqueDoctorId,
            createdAt: new Date().toISOString(),
            isOnline: false
        };

        this.users.push(newUser);
        await this.saveUsers();

        return {
            success: true,
            message: 'Account created successfully'
        };
    }

    async signin(credentials: { username: string; password: string }): Promise<AuthResponse> {
        await this.initialize();

        const user = this.users.find(
            u => (u.username === credentials.username || u.email === credentials.username) && u.password === credentials.password
        );

        if (!user) {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }

        const userIndex = this.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            this.users[userIndex].isOnline = true;
            await this.saveUsers();
        }

        const { password: _, ...userWithoutPassword } = this.users[userIndex];
        this.currentUser = userWithoutPassword;
        await AsyncStorage.setItem('docent_current_user', JSON.stringify(this.currentUser));

        return {
            success: true,
            message: 'Signed in successfully',
            user: userWithoutPassword
        };
    }

    getCurrentUser(): Omit<User, 'password'> | null {
        return this.currentUser;
    }

    async signout() {
        if (this.currentUser) {
            const userIndex = this.users.findIndex(u => u.id === this.currentUser?.id);
            if (userIndex !== -1) {
                this.users[userIndex].isOnline = false;
                await this.saveUsers();
            }
        }
        this.currentUser = null;
        await AsyncStorage.removeItem('docent_current_user');
    }

    getPatientsByDoctorId(doctorId: string): any[] {
        return this.users.filter(u => u.userType === 'patient' && u.doctorId === doctorId);
    }

    getStaffByHospitalId(hospitalId: string): any[] {
        return this.users.filter(u => 
            (u.userType === 'staff' || u.userType === 'nurse') && u.doctorId === hospitalId
        );
    }

    async updateUserStatus(userId: string, isOnline: boolean) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].isOnline = isOnline;
            await this.saveUsers();
        }
    }

    private generateUniqueDoctorId(): string {
        const prefix = 'DR';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    }
}

export const authService = new AuthService();