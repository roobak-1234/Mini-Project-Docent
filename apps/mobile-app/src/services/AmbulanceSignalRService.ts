interface AmbulanceUpdate {
    ambulanceId: string;
    location: {
        lat: number;
        lng: number;
        accuracy: number;
    };
    vitals?: {
        heartRate?: number;
        bloodPressure?: string;
        spO2?: number;
        notes?: string;
    };
    timestamp: number;
}

class AmbulanceSignalRService {
    private connection: WebSocket | null = null;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private eventHandlers: { [key: string]: Array<(data: any) => void> } = {};

    async initialize(): Promise<boolean> {
        try {
            // For React Native, use WebSocket instead of SignalR client
            const wsUrl = 'wss://lifelink-signalr.service.signalr.net/client/?hub=ambulancehub';
            this.connection = new WebSocket(wsUrl);

            this.connection.onopen = () => {
                console.log('WebSocket connected successfully');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };

            this.connection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.connection.onclose = () => {
                console.log('WebSocket connection closed');
                this.isConnected = false;
                this.attemptReconnect();
            };

            this.connection.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
            };

            return true;

        } catch (error) {
            console.error('WebSocket connection failed:', error);
            return false;
        }
    }

    private handleMessage(data: any) {
        const { type, payload } = data;
        if (this.eventHandlers[type]) {
            this.eventHandlers[type].forEach(handler => handler(payload));
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(async () => {
                try {
                    await this.initialize();
                } catch (error) {
                    console.error('Reconnection failed:', error);
                }
            }, 5000 * this.reconnectAttempts);
        }
    }

    async broadcastAmbulanceUpdate(update: AmbulanceUpdate): Promise<boolean> {
        if (!this.connection || !this.isConnected) {
            console.warn('WebSocket not connected, queuing update');
            return false;
        }

        try {
            const message = {
                type: 'BroadcastAmbulanceUpdate',
                payload: {
                    ...update,
                    timestamp: Date.now()
                }
            };
            
            this.connection.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Failed to broadcast ambulance update:', error);
            return false;
        }
    }

    onHospitalMessage(callback: (message: any) => void) {
        this.addEventListener('HospitalMessage', callback);
    }

    addEventListener(eventType: string, callback: (data: any) => void) {
        if (!this.eventHandlers[eventType]) {
            this.eventHandlers[eventType] = [];
        }
        this.eventHandlers[eventType].push(callback);
    }

    removeEventListener(eventType: string, callback: (data: any) => void) {
        if (this.eventHandlers[eventType]) {
            this.eventHandlers[eventType] = this.eventHandlers[eventType].filter(cb => cb !== callback);
        }
    }

    async joinAmbulanceGroup(ambulanceId: string) {
        if (this.connection && this.isConnected) {
            try {
                const message = {
                    type: 'JoinAmbulanceGroup',
                    payload: { ambulanceId }
                };
                this.connection.send(JSON.stringify(message));
            } catch (error) {
                console.error('Failed to join ambulance group:', error);
            }
        }
    }

    async disconnect() {
        if (this.connection) {
            this.connection.close();
            this.isConnected = false;
        }
    }

    getConnectionState(): string {
        if (!this.connection) return 'Disconnected';
        
        switch (this.connection.readyState) {
            case WebSocket.CONNECTING: return 'Connecting';
            case WebSocket.OPEN: return 'Connected';
            case WebSocket.CLOSING: return 'Closing';
            case WebSocket.CLOSED: return 'Closed';
            default: return 'Unknown';
        }
    }

    isConnectionActive(): boolean {
        return this.isConnected;
    }
}

export const ambulanceSignalRService = new AmbulanceSignalRService();