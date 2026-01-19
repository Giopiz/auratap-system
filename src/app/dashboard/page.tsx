'use client';

export const dynamic = 'force-dynamic';

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

    const [showAddForm, setShowAddForm] = useState(false);
    const [newClient, setNewClient] = useState({
        clientId: '',
        ssid: '',
        password: '',
        theme: 'marble',
        venueType: 'cafe',
        ownerEmail: '',
        lat: '',
        lng: '',
        logoUrl: '',
        instagram: '',
        facebook: '',
        website: '',
        radius: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedClient, setSelectedClient] = useState<{ id: string; creds: WifiCredentials } | null>(null);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/sheets/${SHEET_ID}/data?t=${Date.now()}`, { cache: 'no-store' });
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

    const getCurrentLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        navigator.geolocation.getCurrentPosition((pos) => {
            setNewClient({
                ...newClient,
                lat: pos.coords.latitude.toString(),
                lng: pos.coords.longitude.toString()
            });
        });
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

                // Optimistic Update: Add to list immediately
                setClients(prev => [...prev, {
                    ...newClient,
                    clientId: newClient.clientId.toLowerCase(),
                    // ensure fields match the type
                    ssid: newClient.ssid || undefined,
                    password: newClient.password || undefined,
                    ownerEmail: newClient.ownerEmail || undefined,
                    lat: newClient.lat ? Number(newClient.lat) : undefined,
                    lng: newClient.lng ? Number(newClient.lng) : undefined,
                    radius: newClient.radius ? Number(newClient.radius) : undefined
                } as WifiCredentials & { clientId: string }]);

                setNewClient({
                    clientId: '', ssid: '', password: '', theme: 'marble', venueType: 'cafe',
                    ownerEmail: '', lat: '', lng: '', logoUrl: '', instagram: '', facebook: '',
                    website: '', radius: ''
                });

                // Fetch several times to ensure Google Sheets propagation
                setTimeout(fetchClients, 1000);
                setTimeout(fetchClients, 3000);
                setTimeout(fetchClients, 5000);
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.error || 'Failed to add'}`);
            }
        } catch {
            alert('Network Error');
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
                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg">
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-3xl font-[family-name:var(--font-major-mono)] tracking-tight">AURATAP DASHBOARD</h1>
                    <p className="text-neutral-400 text-sm mt-1">Mass Production Management System</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                        + Add New Venue
                    </button>
                    <button
                        onClick={fetchClients}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 border border-neutral-700"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <a href={SHEET_URL} target="_blank" className="text-sm bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-lg">Source Sheet</a>
                </div>
            </header>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAddClient} className="bg-neutral-800 border border-neutral-700 w-full max-w-md rounded-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold">Register Venue</h2>

                        <div className="space-y-4">
                            <input
                                required
                                placeholder="Venue ID (e.g. joe-bar)"
                                value={newClient.clientId}
                                onChange={e => setNewClient({ ...newClient, clientId: e.target.value.toLowerCase() })}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="SSID" value={newClient.ssid} onChange={e => setNewClient({ ...newClient, ssid: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                                <input placeholder="Password" value={newClient.password} onChange={e => setNewClient({ ...newClient, password: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                            </div>

                            <select
                                value={newClient.venueType}
                                onChange={e => setNewClient({ ...newClient, venueType: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="cafe">Cafe</option>
                                <option value="bar">Bar</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="hotel">Hotel</option>
                                <option value="house">House</option>
                                <option value="gym">Gym</option>
                                <option value="other">Other</option>
                            </select>

                            <input
                                placeholder="Owner Email (for toolkit delivery)"
                                type="email"
                                value={newClient.ownerEmail}
                                onChange={e => setNewClient({ ...newClient, ownerEmail: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Lat" value={newClient.lat} onChange={e => setNewClient({ ...newClient, lat: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                                <input placeholder="Lng" value={newClient.lng} onChange={e => setNewClient({ ...newClient, lng: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <input placeholder="Radius (Meters)" type="number" value={newClient.radius} onChange={e => setNewClient({ ...newClient, radius: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 w-full" />
                                    <p className="text-[10px] text-neutral-500 mt-1 ml-1">The range in meters for users to discover this venue (e.g. 50 = 50m)</p>
                                </div>
                            </div>
                            <button type="button" onClick={getCurrentLocation} className="text-[10px] text-green-500 uppercase tracking-widest font-bold">Use My Current Location</button>

                            <div className="pt-4 border-t border-neutral-700 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Personalization & Socials</h3>
                                <input
                                    placeholder="Logo URL (Direct Image Link)"
                                    value={newClient.logoUrl}
                                    onChange={e => setNewClient({ ...newClient, logoUrl: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Instagram URL" value={newClient.instagram} onChange={e => setNewClient({ ...newClient, instagram: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                                    <input placeholder="Facebook URL" value={newClient.facebook} onChange={e => setNewClient({ ...newClient, facebook: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Website URL" value={newClient.website} onChange={e => setNewClient({ ...newClient, website: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                                </div>
                            </div>
                        </div>

                        <button disabled={isSubmitting} type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-xl">
                            {isSubmitting ? 'Syncing...' : 'Register Venue'}
                        </button>
                        <button type="button" onClick={() => setShowAddForm(false)} className="w-full text-xs text-neutral-500">Cancel</button>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-24 bg-neutral-800 rounded-2xl border border-neutral-700">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-neutral-500 animate-pulse uppercase tracking-widest text-xs font-bold">Syncing with Google Sheets...</p>
                </div>
            ) : (
                <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-neutral-900">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-neutral-500 uppercase">Venue</th>
                                    <th className="p-4 text-xs font-bold text-neutral-500 uppercase">Type</th>
                                    <th className="p-4 text-xs font-bold text-neutral-500 uppercase">Network</th>
                                    <th className="p-4 text-xs font-bold text-neutral-500 uppercase">Owner Email</th>
                                    <th className="p-4 text-xs font-bold text-neutral-500 uppercase">Coordinates</th>
                                    <th className="p-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-700/50">
                                {clients.map((client) => (
                                    <tr key={client.clientId} className="hover:bg-white/5">
                                        <td className="p-4 font-bold text-green-400">{client.clientId}</td>
                                        <td className="p-4 text-xs uppercase tracking-widest text-neutral-500">{client.venueType}</td>
                                        <td className="p-4">{client.ssid}</td>
                                        <td className="p-4 text-neutral-400 text-sm">{client.ownerEmail || <span className="opacity-30 italic">Not set</span>}</td>
                                        <td className="p-4 text-[10px] font-mono text-neutral-500">
                                            {client.lat}, {client.lng}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => setSelectedClient({ id: client.clientId, creds: client })} className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded text-xs font-bold">Toolkit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedClient && (
                <ClientToolkit
                    clientId={selectedClient.id}
                    credentials={selectedClient.creds}
                    onClose={() => setSelectedClient(null)}
                />
            )}
        </div>
    );
}
