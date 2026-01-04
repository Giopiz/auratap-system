'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CustomerSetupPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params?.clientId as string;

    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ssid) return alert('Wi-Fi Name (SSID) is required');

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/sheets/1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ/data`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId, ssid, password })
            });

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => router.push(`/${clientId}`), 3000);
            } else {
                alert('Connection error. Please try again.');
            }
        } catch {
            alert('Failed to update. Please check your internet.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
                <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Setup Complete!</h1>
                    <p className="text-neutral-400">Your AuraTap is now active. Redirecting to your landing page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-800 to-neutral-950">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="text-green-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">AuraTap Onboarding</div>
                    <h1 className="text-3xl font-bold text-white mb-2">Configure Your WiFi</h1>
                    <p className="text-neutral-400 text-sm">Enter your cafe&apos;s Wi-Fi details below to activate your one-tap connect page.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-neutral-800/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Wi-Fi Name (SSID)</label>
                            <input
                                required
                                placeholder="Exact name of your Wi-Fi"
                                value={ssid}
                                onChange={e => setSsid(e.target.value)}
                                className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Wi-Fi Password</label>
                            <input
                                type="text"
                                placeholder="Leave empty if none"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-neutral-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            />
                            <p className="text-[10px] text-neutral-600">Note: This is stored securely in your private Google Sheet.</p>
                        </div>
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-700 text-black font-bold py-4 rounded-2xl transition-all shadow-xl active:scale-[0.98]"
                    >
                        {isSubmitting ? 'Activating...' : 'Activate AuraTap'}
                    </button>

                    <p className="text-center text-[11px] text-neutral-600">
                        Managing: <span className="text-neutral-400 font-mono">{clientId}</span>
                    </p>
                </form>

                <div className="text-center pt-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Encrypted Connection</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
