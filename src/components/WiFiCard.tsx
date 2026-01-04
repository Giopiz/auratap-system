'use client';

import { useState, useEffect } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';
import { QRCodeCanvas } from 'qrcode.react';

interface WiFiCardProps {
    credentials: WifiCredentials;
    clientId: string;
}

export default function WiFiCard({ credentials, clientId }: WiFiCardProps) {
    const [status, setStatus] = useState<'idle' | 'downloading' | 'connected'>('idle');
    const [isIos, setIsIos] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [qrImageData, setQrImageData] = useState<string>('');

    useEffect(() => {
        const ua = window.navigator.userAgent;
        setIsIos(/iPhone|iPad|iPod/i.test(ua));

        const timer = setTimeout(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                setQrImageData(canvas.toDataURL('image/png'));
            }
        }, 150);
        return () => clearTimeout(timer);
    }, []);

    const wifiString = `WIFI:S:${credentials.ssid};P:${credentials.password};T:${credentials.securityType || 'WPA'};;`;

    const handleConnect = () => {
        if (!isIos) {
            window.location.href = wifiString;
            setStatus('connected');
        } else {
            // iOS: Download Profile
            setStatus('downloading');
            setShowInstructions(true);
            window.location.href = `/api/${clientId}/wifi-profile`;
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

            <div className={`transition-all duration-500 ${showInstructions ? 'opacity-0 scale-95 h-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
                <div className="mb-8 space-y-6">
                    <div className="space-y-1">
                        <p className="text-white/40 text-xs uppercase tracking-widest">Network</p>
                        <p className="text-2xl text-white font-bold tracking-tight">
                            {credentials.ssid}
                        </p>
                    </div>

                    {/* QR Container - Hidden Canvas, Visible Image */}
                    <div className="relative inline-block p-4 bg-white rounded-2xl shadow-inner">
                        <div className="sr-only">
                            <QRCodeCanvas value={wifiString} size={256} level="H" />
                        </div>
                        {qrImageData ? (
                            <img src={qrImageData} alt="Scan" className="w-32 h-32 rounded-lg" />
                        ) : (
                            <div className="w-32 h-32 bg-neutral-200 animate-pulse rounded-lg" />
                        )}
                    </div>

                    <div className="px-4">
                        <p className="text-white/80 text-sm">
                            {isIos ? "Download your premium connection profile below." : "Tap to connect instantly to the network."}
                        </p>
                    </div>
                </div>

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
                    <span className="relative z-10">
                        {status === 'idle' && (isIos ? 'Connect iPhone' : 'One-Tap Connect')}
                        {status === 'downloading' && 'Downloading Profile...'}
                        {status === 'connected' && 'Connected'}
                    </span>
                    {status === 'idle' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                </button>
            </div>

            {/* iOS Instruction Guide */}
            {showInstructions && (
                <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
                    <div className="bg-blue-500/20 border border-blue-400/30 p-4 rounded-2xl text-left space-y-3">
                        <h3 className="text-blue-400 font-bold text-sm uppercase tracking-widest">Next Steps</h3>
                        <ol className="text-white/80 text-sm space-y-4">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                                <span>Tap <b>&quot;Allow&quot;</b> on the system prompt.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                                <span>Open <b>iPhone Settings</b>.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                                <span>Tap <b>&quot;Profile Downloaded&quot;</b> at the top.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
                                <span>Tap <b>&quot;Install&quot;</b> and you&apos;re connected!</span>
                            </li>
                        </ol>
                    </div>

                    <button
                        onClick={() => setShowInstructions(false)}
                        className="text-white/40 text-xs underline underline-offset-4 hover:text-white transition-colors"
                    >
                        Back to main screen
                    </button>
                </div>
            )}

            <div className="mt-8 text-white/20 text-[9px] uppercase tracking-[0.2em] font-bold">
                AuraTap™ Technology
            </div>
        </div>
    );
}
