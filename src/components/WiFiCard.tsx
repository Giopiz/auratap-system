'use client';

import { useState, useEffect, useRef } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';
import { QRCodeCanvas } from 'qrcode.react';

interface WiFiCardProps {
    credentials: WifiCredentials;
}

export default function WiFiCard({ credentials }: WiFiCardProps) {
    const [status, setStatus] = useState<'idle' | 'copying' | 'connected'>('idle');
    const [isIos, setIsIos] = useState(false);
    const [qrImageData, setQrImageData] = useState<string>('');
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ua = window.navigator.userAgent;
        setIsIos(/iPhone|iPad|iPod/i.test(ua));

        // Small delay to ensure canvas is rendered before grabbing image
        const timer = setTimeout(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                setQrImageData(canvas.toDataURL('image/png'));
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const wifiString = `WIFI:S:${credentials.ssid};P:${credentials.password};T:${credentials.securityType || 'WPA'};;`;

    const handleConnect = () => {
        if (!isIos) {
            window.location.href = wifiString;
            setStatus('connected');
        } else {
            navigator.clipboard.writeText(credentials.password || '');
            setStatus('copying');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="relative z-10 w-full max-w-md p-8 mx-4 overflow-hidden text-center transition-all duration-500 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl hover:shadow-white/10 group select-none">
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

                {/* QR Container - Hidden Canvas, Visible Image */}
                <div className="relative inline-block p-4 bg-white rounded-2xl shadow-inner overflow-hidden">
                    {/* The Canvas is used just to generate the data, then hidden */}
                    <div className="sr-only">
                        <QRCodeCanvas
                            value={wifiString}
                            size={256}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    {/* The Image is what the iPhone user actually holds down on */}
                    {qrImageData ? (
                        <img
                            src={qrImageData}
                            alt="Scan to Connect"
                            className="w-40 h-40 rounded-lg shadow-sm block pointer-events-auto"
                            style={{ WebkitTouchCallout: 'default' }} // Explicitly allow Safari system menu
                        />
                    ) : (
                        <div className="w-40 h-40 bg-neutral-200 animate-pulse rounded-lg" />
                    )}

                    {isIos && (
                        <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce pointer-events-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="px-4">
                    {isIos ? (
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                            <span className="text-blue-400 font-bold underline decoration-blue-400/30 underline-offset-4">Hold down</span> the QR code & tap <br />
                            <span className="text-white">&quot;Join Network&quot;</span> to connect.
                        </p>
                    ) : (
                        <p className="text-white/80 text-sm">
                            Tap the button below or scan the QR code.
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={handleConnect}
                    className={`
                        flex items-center justify-center gap-3 group overflow-hidden relative
                        w-full py-4 px-6 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 active:scale-95
                        ${status === 'idle'
                            ? 'bg-white text-black hover:bg-neutral-200 shadow-2xl hover:shadow-white/20'
                            : 'bg-green-500 text-white'}
                    `}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {status === 'idle' && (
                            <>
                                {isIos ? 'Copy Password Assistant' : 'One-Tap Connect'}
                            </>
                        )}
                        {status === 'copying' && 'Password Copied!'}
                        {status === 'connected' && 'Joining Network...'}
                    </span>

                    {status === 'idle' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                </button>

                {isIos && status === 'copying' && (
                    <p className="text-[10px] text-green-400 animate-pulse font-medium">
                        Paste it when prompted for the Wi-Fi password.
                    </p>
                )}
            </div>

            <div className="mt-8 text-white/20 text-[9px] uppercase tracking-[0.2em] font-bold">
                AuraTap™ Technology
            </div>
        </div>
    );
}
