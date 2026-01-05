'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';

interface ClientToolkitProps {
    clientId: string;
    ownerEmail?: string;
    onClose: () => void;
}

export default function ClientToolkit({ clientId, ownerEmail, onClose }: ClientToolkitProps) {
    const [copied, setCopied] = useState(false);
    const landingUrl = typeof window !== 'undefined' ? `${window.location.origin}/${clientId}` : '';
    const setupUrl = typeof window !== 'undefined' ? `${window.location.origin}/${clientId}/setup` : '';

    const handleCopyNfc = () => {
        navigator.clipboard.writeText(landingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-800 border border-neutral-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 md:p-6 border-b border-neutral-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Client Toolkit</h2>
                        <p className="text-neutral-400 text-sm font-mono">{clientId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-6 md:space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* QR Code Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                            <QRCodeCanvas
                                value={landingUrl}
                                size={180}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <p className="text-sm text-neutral-400 text-center">
                            Point a camera here to open the landing page instantly.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* NFC Section */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-neutral-500 font-bold">NFC / QR Link</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={landingUrl}
                                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 font-mono focus:outline-none"
                                />
                                <button
                                    onClick={handleCopyNfc}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                                        }`}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        {/* Setup Section */}
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-blue-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-wider">Remote Customer Setup</span>
                            </div>
                            <p className="text-xs text-blue-200/70">
                                Send this link to the owner so they can set up their own Wi-Fi info:
                            </p>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={setupUrl}
                                    className="flex-1 bg-neutral-900/50 border border-blue-500/20 rounded px-2 py-1 text-[10px] text-blue-300 font-mono outline-none"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(setupUrl);
                                        alert('Setup link copied!');
                                    }}
                                    className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded font-bold transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-neutral-900/50 flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-white hover:bg-neutral-200 text-black font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                        Print QR Code
                    </button>
                    <button
                        onClick={() => {
                            const subject = encodeURIComponent(`AuraTap Setup: ${clientId}`);
                            const body = encodeURIComponent(
                                `Hi,\n\nWelcome to AuraTap!\n\nYour 3D printed Wi-Fi base is ready. Please use the link below to set up your Wi-Fi credentials (SSID and Password) so your customers can connect instantly:\n\nSetup Link: ${setupUrl}\n\nBest regards,\nThe AuraTap Team`
                            );
                            window.location.href = `mailto:${ownerEmail || ''}?subject=${subject}&body=${body}`;
                        }}
                        className={`flex-1 font-semibold py-2.5 rounded-xl text-sm transition-all ${ownerEmail ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                            }`}
                    >
                        {ownerEmail ? 'Email Owner' : 'Add Email First'}
                    </button>
                </div>
            </div>
        </div>
    );
}
