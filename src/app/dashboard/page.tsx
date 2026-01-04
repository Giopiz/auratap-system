'use client';

import { useState, useEffect } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';

const SHEET_ID = '1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`;

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [clients, setClients] = useState<(WifiCredentials & { clientId: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isLoggedIn) {
            fetch(`/api/sheets/${SHEET_ID}/data`)
                .then(res => res.json())
                .then(data => {
                    if (data.clients) {
                        setClients(data.clients);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch clients:', err);
                    setIsLoading(false);
                });
        }
    }, [isLoggedIn]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'Gardmanje1000@') {
            setIsLoggedIn(true);
        } else {
            alert('Invalid password.');
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
                    <p className="mt-4 text-xs text-neutral-500 text-center">Security tip: Use your unique admin password.</p>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6 md:p-12">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-neutral-400 text-sm mt-1">Live Management System</p>
                </div>
                <div className="flex gap-4">
                    <a
                        href={SHEET_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        Edit in Google Sheets
                    </a>
                    <button onClick={() => setIsLoggedIn(false)} className="text-sm bg-neutral-900 hover:text-white border border-neutral-800 px-4 py-2 rounded-lg">
                        Logout
                    </button>
                </div>
            </header>

            <div className="overflow-x-auto bg-neutral-800 rounded-2xl border border-neutral-700 shadow-xl min-h-[200px]">
                {isLoading ? (
                    <div className="p-12 text-center text-neutral-500">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        Fetching live data...
                    </div>
                ) : (
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
                            {clients.length > 0 ? (
                                clients.map((client) => (
                                    <tr key={client.clientId} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-sm text-green-400">{client.clientId}</td>
                                        <td className="p-4">{client.ssid}</td>
                                        <td className="p-4 font-mono text-neutral-400 text-sm">
                                            {client.password || <span className="text-neutral-600 italic">None</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-neutral-700 rounded text-[10px] tracking-wide uppercase font-semibold text-neutral-300">
                                                {client.theme || 'default'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <a
                                                href={SHEET_URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-400 hover:text-blue-300 font-medium bg-blue-400/10 px-3 py-1 rounded-md transition-colors"
                                            >
                                                Edit
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500 italic">No clients found in sheet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-8 p-4 border border-green-500/20 bg-green-500/5 rounded-xl text-green-200/80 text-sm flex items-center gap-4">
                <div className="relative flex">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping absolute opacity-75" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 relative" />
                </div>
                <span>
                    <strong>Live System:</strong> Connected via Cloud-Ready Direct API to Sheet `1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ`.
                    Real-time edits are synced instantly from the cloud.
                </span>
            </div>
        </div>
    );
}
