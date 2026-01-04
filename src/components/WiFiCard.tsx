'use client';

import { useState, useEffect } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';
import { QRCodeCanvas } from 'qrcode.react';

interface WiFiCardProps {
    credentials: WifiCredentials;
}

export default function WiFiCard({ credentials }: WiFiCardProps) {
    const [status, setStatus] = useState<'idle' | 'copying' | 'connected'>('idle');
    const [isIos, setIsIos] = useState(false);
    const [qrImageData, setQrImageData] = useState<string>('');

    useEffect(() => {
        const ua = window.navigator.userAgent;
        setIsIos(/iPhone|iPad|iPod/i.test(ua));

        const timer = setTimeout(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                setQrImageData(canvas.toDataURL('image/png'));
            }
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const wifiString = `WIFI:S:${credentials.ssid};P:${credentials.password};T:${credentials.securityType || 'WPA'};;`;

    const handleConnect = () => {
        if (!isIos) {
            // Android: Pure One-Tap
            window.location.href = wifiString;
            setStatus('connected');
        } else {
            // iOS: One-Tap Copy + Instruction
            navigator.clipboard.writeText(credentials.password || '');
            setStatus('copying');
            // Auto-reset copying state after 5 seconds
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <div className="relative z-10 w-full max-w-md p-8 mx-4 overflow-hidden text-center transition-all duration-500 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-white/10 group select-none touch-none">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <h1 className="text-3xl font-light tracking-widest text-white mb-2 font-sans">
                AURATAP
            </h1>
            <p className="text-white/60 text-[10px] tracking-[0.3em] uppercase mb-8">
                Premium Guest Access
            </p>

            <div className="mb-8 space-y-6">
                <div className="space-y-1">
                    <p className="text-white/40 text-xs uppercase tracking-widest">Network</p>
                    <p className="text-2xl text-white font-bold tracking-tight">
                        {credentials.ssid}
                    </p>
                </div>

                {/* QR Container - Reference only for other devices */}
                <div className="relative inline-block p-4 bg-white rounded-2xl shadow-inner">
                    <div className="sr-only">
                        <QRCodeCanvas value={wifiString} size={256} level="H" />
                    </div>
                    {qrImageData ? (
                        <img
                            src={qrImageData}
                            alt="Scan"
                            className="w-32 h-32 rounded-lg opacity-80"
                        />
                    ) : (
                        <div className="w-32 h-32 bg-neutral-200 animate-pulse rounded-lg" />
                    )}
                </div>

                <div className="px-4 min-h-[40px] flex items-center justify-center">
                    {status === 'copying' ? (
                        <p className="text-green-400 text-sm font-bold animate-pulse">
                            Password Copied! ✨
                        </p>
                    ) : (
                        <p className="text-white/60 text-xs uppercase tracking-[0.1em]">
                            {isIos ? "Instant iPhone Connection" : "One-Tap Connect"}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={handleConnect}
                    className={`
                        flex items-center justify-center gap-3 group overflow-hidden relative
                        w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 active:scale-95
                        ${status === 'idle'
                            ? 'bg-white text-black hover:bg-neutral-200 shadow-2xl hover:shadow-white/20'
                            : 'bg-green-500 text-white shadow-green-500/50'}
                    `}
                >
                    <span className="relative z-10">
                        {status === 'idle' && (isIos ? 'Join Wi-Fi' : 'Connect Now')}
                        {status === 'copying' && 'Ready to Paste'}
                        {status === 'connected' && 'Connecting...'}
                    </span>
                    {status === 'idle' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                </button>

                {/* iOS Assistant Graphic */}
                {isIos && status === 'copying' && (
                    <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                            <p className="text-white text-sm font-medium">
                                1. Open your <b>Settings</b> app <br />
                                2. Select <b>Wi-Fi</b> <br />
                                3. Tap <b>&quot;{credentials.ssid}&quot;</b> & paste!
                            </p>
                            <div className="flex justify-center">
                                <div className="w-8 h-12 border-2 border-white/20 rounded-lg relative overflow-hidden">
                                    <div className="absolute top-1 left-1 right-1 h-3 bg-white/10 rounded-sm animate-pulse" />
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border border-white/40 border-dashed animate-spin" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-white/20 text-[9px] uppercase tracking-[0.2em] font-bold">
                AuraTap™ Technology
            </div>
        </div>
    );
}
