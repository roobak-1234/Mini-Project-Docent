
import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Activity, Navigation, Zap, Radio, Shield, Power } from 'lucide-react';
import { AzureMap } from './AzureMap';
import { useGeofenceAlert } from '../hooks/useGeofenceAlert';
import { TrafficSignalAPI } from '../services/TrafficSignalAPI';
import { SignalStatus } from '../types/JunctionSchema';

const TrafficSentinelDashboard: React.FC = () => {
    const currentJunctionId = 'J-101';
    const { alert, acknowledgeAlert } = useGeofenceAlert(currentJunctionId);

    const [status, setStatus] = useState<SignalStatus>(SignalStatus.RED);
    const [automatedMode, setAutomatedMode] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Memoize center to prevent map reset on re-renders
    const mapCenter = useMemo(() => ({ latitude: 47.6062, longitude: -122.3321 }), []);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Initial Fetch
    useEffect(() => {
        TrafficSignalAPI.getJunctionStatus(currentJunctionId).then(data => {
            if (data) {
                setStatus(data.currentStatus);
            }
        });
    }, [currentJunctionId]);

    const handleOverride = async () => {
        const newStatus = SignalStatus.MANUAL_CLEAR;
        setStatus(newStatus);
        setAutomatedMode(false);
        await TrafficSignalAPI.setManualOverride(currentJunctionId, newStatus);
        alert.level = 'NONE';
        acknowledgeAlert();
    };

    const handleRestoreAuto = () => {
        setAutomatedMode(true);
        setStatus(SignalStatus.RED);
    };

    const getStatusColor = (s: SignalStatus) => {
        switch (s) {
            case SignalStatus.GREEN: return 'text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]';
            case SignalStatus.PREEMPTED: return 'text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.5)]';
            case SignalStatus.MANUAL_CLEAR: return 'text-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.5)]';
            default: return 'text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]';
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0a0f1c] text-slate-100 font-sans overflow-hidden selection:bg-cyan-500/30 pt-20">
            {/* HUD HEADER */}
            <header className="h-16 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-20 relative">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg shadow-lg shadow-blue-500/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-wider text-white">TRAFFIC<span className="text-cyan-400">SENTINEL</span></h1>
                        <p className="text-[10px] text-cyan-500/80 tracking-[0.2em] font-mono uppercase">Intelligent Traffic Control System</p>
                    </div>
                </div>

                {/* Center Alert Banner */}
                <div className={`flex-1 mx-12 flex items-center justify-center`}>
                    {alert.level !== 'NONE' && (
                        <div className={`flex items-center gap-3 px-6 py-2 rounded-full border ${alert.level === 'CRITICAL' ? 'bg-red-500/10 border-red-500/50 animate-pulse text-red-400' :
                            'bg-amber-500/10 border-amber-500/50 text-amber-400'
                            }`}>
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold tracking-wide uppercase text-sm">{alert.message}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-6 font-mono text-sm">
                    <div className="text-right">
                        <div className="text-slate-400 text-xs">OFFICER ON DUTY</div>
                        <div className="text-white font-bold">R. DECKARD</div>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-700"></div>
                    <div className="text-right">
                        <div className="text-slate-400 text-xs">SYSTEM TIME</div>
                        <div className="text-cyan-400 font-bold">{currentTime.toLocaleTimeString()}</div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Background Grid Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(13,18,30,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(13,18,30,0.9)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] pointer-events-none z-0"></div>

                {/* LEFT CONTROL PANEL */}
                <aside className="w-[400px] bg-slate-900/40 backdrop-blur-xl border-r border-slate-700/50 p-6 flex flex-col gap-6 z-10 relative">

                    {/* Junction Status Card */}
                    <div className="bg-[#0f1629] border border-slate-700/50 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">Active Junction</h2>
                                <h1 className="text-2xl font-bold text-white tracking-wide">Main & 4th Ave</h1>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${automatedMode ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' : 'border-purple-500/30 text-purple-400 bg-purple-500/10'}`}>
                                {automatedMode ? 'AI Control Active' : 'Manual Override'}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-slate-500 uppercase">Signal Status</span>
                                <span className={`text-3xl font-black tracking-wider ${getStatusColor(status)}`}>
                                    {status}
                                </span>
                            </div>
                            <div className={`h-12 w-12 rounded-full border-4 shadow-lg ${status === SignalStatus.RED ? 'bg-red-500 border-red-400/30 shadow-red-500/50' :
                                status === SignalStatus.GREEN ? 'bg-emerald-500 border-emerald-400/30 shadow-emerald-500/50' :
                                    'bg-amber-500 border-amber-400/30 shadow-amber-500/50'
                                }`}></div>
                        </div>

                        {/* Telemetry Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className="w-3 h-3 text-cyan-400" />
                                    <span className="text-[10px] text-slate-400 uppercase">Network Latency</span>
                                </div>
                                <div className="text-xl font-mono text-white">12<span className="text-sm text-slate-500 ml-1">ms</span></div>
                            </div>
                            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <Radio className="w-3 h-3 text-purple-400" />
                                    <span className="text-[10px] text-slate-400 uppercase">IoT Devices</span>
                                </div>
                                <div className="text-xl font-mono text-white">ACTIVE</div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN ACTION BUTTON */}
                    <div className="flex-1 flex flex-col justify-center gap-4 py-4">
                        <button
                            onClick={handleOverride}
                            disabled={status === SignalStatus.MANUAL_CLEAR}
                            className={`group relative w-full h-40 rounded-2xl overflow-hidden transition-all duration-300 transform active:scale-[0.98] ${status === SignalStatus.MANUAL_CLEAR
                                ? 'bg-slate-800 border-2 border-slate-600 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-br from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 border-t border-white/20 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]'
                                }`}
                        >
                            {!automatedMode ? null : (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_60%)] group-hover:opacity-75 transition-opacity duration-500"></div>
                            )}
                            <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                                <Zap className={`w-12 h-12 ${status === SignalStatus.MANUAL_CLEAR ? 'text-slate-500' : 'text-white fill-white animate-[pulse_2s_infinite]'}`} />
                                <span className={`text-2xl font-black tracking-widest ${status === SignalStatus.MANUAL_CLEAR ? 'text-slate-500' : 'text-white'}`}>
                                    {status === SignalStatus.MANUAL_CLEAR ? 'LANE CLEARED' : 'CLEAR LANE'}
                                </span>
                            </div>
                        </button>

                        {!automatedMode && (
                            <button
                                onClick={handleRestoreAuto}
                                className="w-full py-5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-400 hover:text-cyan-300 font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
                            >
                                <Power className="w-5 h-5" />
                                Restore Automation
                            </button>
                        )}
                    </div>
                </aside>

                {/* RIGHT MAP PANEL */}
                <div className="flex-1 relative bg-gray-100">
                    <AzureMap
                        subscriptionKey={process.env.REACT_APP_AZURE_MAPS_SUBSCRIPTION_KEY || ""}
                        center={mapCenter}
                        zoom={15}
                        markers={[
                            { coordinate: mapCenter, color: 'blue', popupContent: 'Junction Control Point' },
                            { coordinate: { latitude: 47.6040, longitude: -122.3290 }, color: 'green', popupContent: 'Traffic Signal' }
                        ]}
                        ambulances={alert.ambulanceId ? [
                            { id: alert.ambulanceId, coordinate: { latitude: 47.6050, longitude: -122.3300 }, status: 'dispatched' as const }
                        ] : []}
                    />



                    {/* AMBULANCE TRACKING OVERLAY */}
                    {alert.ambulanceId && (
                        <div className="absolute bottom-8 left-8 right-8 bg-slate-900/90 backdrop-blur-xl border-t-2 border-red-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-between animate-in slide-in-from-bottom-10 fade-in duration-500">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/50 animate-pulse">
                                    <Navigation className="w-8 h-8 text-red-500 fill-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-red-400 font-bold tracking-widest uppercase text-sm mb-1">Emergency Vehicle Detected</h3>
                                    <div className="text-3xl font-black text-white tracking-tight">AMBULANCE <span className="text-slate-500">#{alert.ambulanceId}</span></div>
                                </div>
                            </div>

                            <div className="flex gap-12 text-right">
                                <div>
                                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Distance</div>
                                    <div className="text-4xl font-mono font-bold text-white">{alert.distanceToJunction}<span className="text-lg text-slate-400 ml-1">m</span></div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">ETA</div>
                                    <div className="text-4xl font-mono font-bold text-red-500">{Math.ceil(alert.distanceToJunction / 15)}<span className="text-lg text-red-400/70 ml-1">s</span></div>
                                </div>
                                <div className="h-12 w-[1px] bg-slate-700 self-center"></div>
                                <div className="flex flex-col justify-center">
                                    <div className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                        GREEN WAVE ACTIVE
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrafficSentinelDashboard;
