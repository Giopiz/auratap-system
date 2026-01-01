'use client';

import { useState } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';

interface WiFiCardProps {
    credentials: WifiCredentials;
}

export default function WiFiCard({ credentials }: WiFiCardProps) {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');

    const handleConnect = () => {
        setStatus('connecting');

        // Construct WiFi URI
        // Format: WIFI:S:ssid;P:password;T:securityType;;
        // Note: hidden is false by default in this context
        const security = credentials.securityType || 'WPA';
        const passwordPart = credentials.password ? `P:${credentials.password};` : '';
        const wifiString = `WIFI:S:${credentials.ssid};${passwordPart}T:${security};;`;

        // Attempt to launch URI
        window.location.href = wifiString;

        // Simulate "connected" state after a short delay for UX
        setTimeout(() => {
            setStatus('connected');
        }, 2000);
    };

    return (
        <div className="relative z-10 w-full max-w-md p-8 mx-4 overflow-hidden text-center transition-all duration-500 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-white/10 group">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <h1 className="text-3xl font-light tracking-widest text-white mb-2 font-sans">
                AURATAP
            </h1>
            <p className="text-white/60 text-sm tracking-wider uppercase mb-12">
                Premium Guest Access
            </p>

            <div className="mb-8 space-y-2">
                <p className="text-white/80 text-lg font-medium">Network</p>
                <p className="text-2xl text-white font-bold tracking-tight">
                    {credentials.ssid}
                </p>
            </div>

            <button
                onClick={handleConnect}
                disabled={status === 'connecting' || status === 'connected'}
                className={`
                    flex items-center justify-center gap-3 group overflow-hidden relative
                    w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 active:scale-95
                    ${status === 'idle'
                        ? 'bg-white text-black hover:bg-neutral-200 shadow-2xl hover:shadow-white/20'
                        : 'bg-green-500 text-white cursor-default'}
                `}
            >
                <span className="relative z-10">
                    {status === 'idle' && 'One-Tap Connect'}
                    {status === 'connecting' && 'Connecting...'}
                    {status === 'connected' && 'Connected'}
                </span>

                {status === 'idle' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
            </button>

            <div className="mt-8 text-white/40 text-xs">
                Powered by AuraTap™
            </div>
        </div>
    );
}
