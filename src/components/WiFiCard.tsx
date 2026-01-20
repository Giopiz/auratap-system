'use client';

import { useState, useEffect, useRef } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';
import { QRCodeCanvas } from 'qrcode.react';
import Image from 'next/image';

interface WiFiCardProps {
    credentials: WifiCredentials;
}

export default function WiFiCard({ credentials }: WiFiCardProps) {
    const [status, setStatus] = useState<'idle' | 'copying' | 'connected'>('idle');
    const [isIos, setIsIos] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);
    const [qrImageData, setQrImageData] = useState<string>('');

    const ssid = credentials.ssid || 'AuraTap Guest';
    const password = credentials.password || '';
    const wifiString = `WIFI:S:${ssid};P:${password};T:${credentials.securityType || 'WPA'};;`;

    useEffect(() => {
        const ua = window.navigator.userAgent;
        setIsIos(/iPhone|iPad|iPod/i.test(ua));

        const timer = setTimeout(() => {
            const canvas = qrRef.current?.querySelector('canvas');
            if (canvas) {
                setQrImageData(canvas.toDataURL('image/png'));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [wifiString]);

    const handleConnect = () => {
        // Copy to clipboard for all - it's the safest fallback
        navigator.clipboard.writeText(credentials.password || '');
        setStatus('copying');

        if (!isIos) {
            // Try direct join on Android (might be blocked by browser)
            window.location.href = wifiString;
            // status is already set to 'copying' which shows the toast
        }

        setTimeout(() => setStatus('idle'), 5000);
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
            case 'house':
                return (
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            case 'gym':
                return (
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                );
            case 'other':
                return (
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
        <div
            className="relative z-10 w-full max-w-md p-8 mx-auto overflow-hidden text-center transition-all duration-500 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-white/10 group select-none touch-none"
            style={{
                background: credentials.primaryColor && credentials.secondaryColor
                    ? `linear-gradient(135deg, ${credentials.primaryColor}33, ${credentials.secondaryColor}33)`
                    : undefined,
                borderColor: credentials.primaryColor ? `${credentials.primaryColor}44` : undefined
            }}
        >
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: credentials.primaryColor && credentials.secondaryColor
                        ? `linear-gradient(135deg, ${credentials.primaryColor}55, ${credentials.secondaryColor}55)`
                        : 'linear-gradient(to bottom right, rgba(255,255,255,0.3), transparent)'
                }}
            />

            <div className="flex justify-center mb-6">
                {credentials.logoUrl ? (
                    <div className="relative w-24 h-24 p-1 bg-white/10 rounded-2xl border border-white/20">
                        <Image
                            src={credentials.logoUrl}
                            alt="Logo"
                            fill
                            className="object-contain p-2 rounded-xl"
                            unoptimized
                        />
                    </div>
                ) : (
                    <VenueIcon />
                )}
            </div>

            <h1 className="text-3xl font-light tracking-widest text-white mb-2 font-sans uppercase">
                {credentials.ssid || 'AURATAP'}
            </h1>
            <p className="text-white/60 text-[10px] tracking-[0.3em] uppercase mb-8">
                {credentials.venueType || 'Premium'} Guest Network
            </p>

            <div className="mb-8 flex flex-col items-center gap-6">
                <div className="relative p-4 bg-white rounded-2xl shadow-inner">
                    <div className="sr-only" ref={qrRef}>
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
                        <p className="text-white/60 text-xs uppercase tracking-[0.1em] text-center">
                            {isIos ? "Instant Connection Helper" : "One-Tap Connect"}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-4 px-4">
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
                    style={{
                        backgroundColor: (status === 'idle' && credentials.ssid && credentials.primaryColor) ? credentials.primaryColor : undefined,
                        color: (status === 'idle' && credentials.ssid && credentials.primaryColor) ? 'white' : undefined
                    }}
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
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-medium text-center">
                            1. Open Settings &gt; Wi-Fi <br />
                            2. Tap <b>&quot;{credentials.ssid}&quot;</b> <br />
                            3. Tap <b>Paste</b> when prompted!
                        </div>
                    </div>
                )}

                {/* Socials & Website Area */}
                <div className="pt-8 flex justify-center gap-6">
                    {credentials.instagram && (
                        <a
                            href={credentials.instagram.startsWith('http') ? credentials.instagram : `https://instagram.com/${credentials.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z" /></svg>
                        </a>
                    )}
                    {credentials.facebook && (
                        <a
                            href={credentials.facebook.startsWith('http') ? credentials.facebook : `https://facebook.com/${credentials.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.783h-2.954v-3.429h2.954v-2.527c0-2.925 1.787-4.516 4.396-4.516 1.25 0 2.324.093 2.637.135v3.056h-1.808c-1.419 0-1.694.675-1.694 1.662v2.19h3.384l-.441 3.429h-2.943v8.783h6.135c.731 0 1.325-.593 1.325-1.324v-21.351c0-.732-.593-1.325-1.325-1.325z" /></svg>
                        </a>
                    )}
                    {credentials.website && (
                        <a
                            href={credentials.website.startsWith('http') ? credentials.website : `https://${credentials.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </a>
                    )}
                </div>

            </div>

            <div className="mt-8 text-white/20 text-[9px] uppercase tracking-[0.2em] font-bold">
                Powered by Cell Side Studios
            </div>
        </div>
    );
}
