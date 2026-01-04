'use client';

import { useState, useEffect } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';
import { QRCodeCanvas } from 'qrcode.react';
import Image from 'next/image';

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

    const ssid = credentials.ssid || 'AuraTap Guest';
    const password = credentials.password || '';
    const wifiString = `WIFI:S:${ssid};P:${password};T:${credentials.securityType || 'WPA'};;`;

    const handleConnect = () => {
        if (!isIos) {
            window.location.href = wifiString;
            setStatus('connected');
        } else {
            navigator.clipboard.writeText(credentials.password || '');
            setStatus('copying');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    // Venue Icons
    const VenueIcon = () => {
        const type = credentials.venueType || 'cafe';
        switch (type) {
            case 'bar':
                return (
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.888 1.332l-3.08 9.336A2 2 0 019.064 21H9" />
                    </svg>
                );
            case 'hotel':
                return (
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
            case 'restaurant':
                return (
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                );
            default: // cafe
                return (
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                );
        }
    };

    return (
        <div className="relative z-10 w-full max-w-md p-8 mx-4 overflow-hidden text-center transition-all duration-500 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-white/10 group select-none touch-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="flex justify-center mb-4">
                <VenueIcon />
            </div>

            <h1 className="text-3xl font-light tracking-widest text-white mb-2 font-sans uppercase">
                {credentials.ssid || 'AURATAP'}
            </h1>
            <p className="text-white/60 text-[10px] tracking-[0.3em] uppercase mb-8">
                {credentials.venueType || 'Premium'} Guest Network
            </p>

            <div className="mb-8 space-y-6">
                <div className="relative inline-block p-4 bg-white rounded-2xl shadow-inner">
                    <div className="sr-only">
                        <QRCodeCanvas value={wifiString} size={256} level="H" />
                    </div>
                    {qrImageData ? (
                        <Image
                            src={qrImageData}
                            alt="Scan"
                            width={128}
                            height={128}
                            className="rounded-lg"
                            unoptimized
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
                            {isIos ? "Instant Connection Helper" : "One-Tap Connect"}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={handleConnect}
                    disabled={!credentials.ssid}
                    className={`
                        flex items-center justify-center gap-3 group overflow-hidden relative
                        w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 active:scale-95
                        ${status === 'idle'
                            ? (credentials.ssid ? 'bg-white text-black hover:bg-neutral-200 shadow-2xl hover:shadow-white/20' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed')
                            : 'bg-green-500 text-white shadow-green-500/50'}
                    `}
                >
                    <span className="relative z-10">
                        {!credentials.ssid && 'AuraTap Offline'}
                        {credentials.ssid && status === 'idle' && (isIos ? 'Join Wi-Fi' : 'Connect Now')}
                        {status === 'copying' && 'Ready to Paste'}
                        {status === 'connected' && 'Connecting...'}
                    </span>
                    {status === 'idle' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                </button>

                {isIos && status === 'copying' && (
                    <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-medium">
                            1. Open Settings &gt; Wi-Fi <br />
                            2. Tap <b>&quot;{credentials.ssid}&quot;</b> <br />
                            3. Tap <b>Paste</b> when prompted!
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-white/20 text-[9px] uppercase tracking-[0.2em] font-bold">
                AuraTap Discovery™ 2026
            </div>
        </div>
    );
}
