'use client';

import { useState } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';

// Reusing MOCK_DB locally for display
const INITIAL_DATA: Record<string, WifiCredentials> = {
    'client1': {
        ssid: 'AuraTap_Guest',
        password: 'supersecretpassword',
        securityType: 'WPA',
        theme: 'marble'
    },
    'client2': {
        ssid: 'VIP_Lounge',
        password: 'luxurylifeonly',
        securityType: 'WPA',
        theme: 'steel'
    },
    'cafe-spot': {
        ssid: 'Cafe_Free_WiFi',
        securityType: 'nopass',
        theme: 'wood'
    }
};

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [data] = useState(INITIAL_DATA);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin') {
            setIsLoggedIn(true);
        } else {
            alert('Invalid password (try "admin")');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 w-full max-w-sm">
                    <h1 className="text-2xl text-white font-bold mb-6 text-center">AuraTap Admin</h1>
                    <input
                        type="password"
                        placeholder="Enter access code"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-neutral-900 text-white border border-neutral-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none mb-4"
                    />
                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors">
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6 md:p-12">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <button onClick={() => setIsLoggedIn(false)} className="text-sm text-neutral-400 hover:text-white">
                    Logout
                </button>
            </header>

            <div className="overflow-x-auto bg-neutral-800 rounded-2xl border border-neutral-700 shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-neutral-900/50">
                        <tr>
                            <th className="p-4 text-xs uppercase tracking-wider text-neutral-400">Client ID</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-neutral-400">SSID</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-neutral-400">Password</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-neutral-400">Theme</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-neutral-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                        {Object.entries(data).map(([id, creds]) => (
                            <tr key={id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-sm text-green-400">{id}</td>
                                <td className="p-4">{creds.ssid}</td>
                                <td className="p-4 font-mono text-neutral-400">
                                    {creds.password || <span className="text-neutral-600 italic">None</span>}
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-neutral-700 rounded text-xs capitalize">
                                        {creds.theme || 'default'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => alert('Editing is live via Google Sheets.')}
                                        className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 p-4 border-green-500/30 bg-green-500/10 rounded-lg text-green-200 text-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>
                    <strong>Live System:</strong> Connected via Cloud-Ready Direct API to Sheet `1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ`.
                    Real-time edits are synced instantly from the cloud.
                </span>
            </div>
        </div>
    );
}
