'use client';

import { useState, useEffect } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';
import ClientToolkit from '@/components/ClientToolkit';

const SHEET_ID = '1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`;

export default function DashboardPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [clients, setClients] = useState<(WifiCredentials & { clientId: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Automation States
    const [showAddForm, setShowAddForm] = useState(false);
    const [newClient, setNewClient] = useState({ clientId: '', ssid: '', password: '', theme: 'marble' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedClient, setSelectedClient] = useState<{ id: string; creds: WifiCredentials } | null>(null);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/sheets/${SHEET_ID}/data`);
            const data = await res.json();
            if (data.clients) {
                setClients(data.clients);
            }
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchClients();
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

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClient.clientId) return alert('Client ID is required');

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/sheets/${SHEET_ID}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClient)
            });

            if (res.ok) {
                setShowAddForm(false);
                setNewClient({ clientId: '', ssid: '', password: '', theme: 'marble' });
                fetchClients();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Failed to add client'}`);
            }
        } catch {
            alert('Failed to connect to API');
        } finally {
            setIsSubmitting(false);
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
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-neutral-400 text-sm mt-1">Live Management System</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Cafe
                    </button>
                    <a
                        href={SHEET_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        Source Sheet
                    </a>
                    <button onClick={() => setIsLoggedIn(false)} className="text-sm bg-neutral-900 hover:text-white border border-neutral-800 px-4 py-2 rounded-lg">
                        Logout
                    </button>
                </div>
            </header>

            {/* Quick-Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAddClient} className="bg-neutral-800 border border-neutral-700 w-full max-w-md rounded-2xl p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Register New Cafe</h2>
                            <button type="button" onClick={() => setShowAddForm(false)} className="text-neutral-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Client ID (URL Name)</label>
                                <input
                                    required
                                    placeholder="e.g. star-cafe"
                                    value={newClient.clientId}
                                    onChange={e => setNewClient({ ...newClient, clientId: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none"
                                />
                                <p className="text-[10px] text-neutral-600 font-mono">Link: auratap.io/{newClient.clientId || '...'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Wi-Fi Name (SSID)</label>
                                    <input
                                        placeholder="Optional"
                                        value={newClient.ssid}
                                        onChange={e => setNewClient({ ...newClient, ssid: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Password</label>
                                    <input
                                        placeholder="Optional"
                                        value={newClient.password}
                                        onChange={e => setNewClient({ ...newClient, password: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-neutral-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/20"
                        >
                            {isSubmitting ? 'Syncing with Google...' : 'Create Cafe & Sync'}
                        </button>
                    </form>
                </div>
            )}

            {/* Client List */}
            <div className="overflow-x-auto bg-neutral-800 rounded-2xl border border-neutral-700 shadow-xl min-h-[400px]">
                {isLoading ? (
                    <div className="p-24 text-center text-neutral-500 flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <span className="font-medium">Connecting to Cloud-Ready API...</span>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-neutral-900/50">
                            <tr>
                                <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-bold">Cafe ID</th>
                                <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-bold">Network SSID</th>
                                <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-bold">Password</th>
                                <th className="p-4 text-xs uppercase tracking-wider text-neutral-500 font-bold text-right">Setup Toolkit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700/50">
                            {clients.length > 0 ? (
                                clients.map((client) => (
                                    <tr key={client.clientId} className="group hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-green-400">{client.clientId}</span>
                                                <span className="text-[10px] text-neutral-600 font-mono truncate max-w-[150px]">
                                                    /{client.clientId}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-neutral-200">
                                            {client.ssid || <span className="text-neutral-600 italic">Not set</span>}
                                        </td>
                                        <td className="p-4 font-mono text-neutral-400 text-sm">
                                            {client.password || <span className="text-neutral-600 italic">No password</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedClient({ id: client.clientId, creds: client })}
                                                className="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                            >
                                                Open Toolkit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-24 text-center text-neutral-600">
                                        <div className="opacity-20 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        No cafes found. Click &quot;Add New Cafe&quot; to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Selected Client Toolkit Modal */}
            {selectedClient && (
                <ClientToolkit
                    clientId={selectedClient.id}
                    onClose={() => setSelectedClient(null)}
                />
            )}

            <div className="mt-12 p-6 border border-white/5 bg-white/[0.02] rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <div>
                        <p className="text-sm font-bold text-white">Cloud-Ready Sync Active</p>
                        <p className="text-xs text-neutral-500">All changes write directly to Google Sheets in real-time.</p>
                    </div>
                </div>
                <div className="text-xs text-neutral-600 font-mono">
                    Sheet ID: 1Wtid4l...QLQ
                </div>
            </div>
        </div>
    );
}
