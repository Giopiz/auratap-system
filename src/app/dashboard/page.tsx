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

    const [showAddForm, setShowAddForm] = useState(false);
    const [newClient, setNewClient] = useState({
        clientId: '',
        ssid: '',
        password: '',
        theme: 'marble',
        venueType: 'cafe',
        lat: '',
        lng: ''
    });
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
                setNewClient({ clientId: '', ssid: '', password: '', theme: 'marble', venueType: 'cafe', lat: '', lng: '' });
                fetchClients();
            } else {
                const errData = await res.json();
                alert(`Error: ${errData.error || 'Failed to add'}`);
            }
        } catch (err) {
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
        <div className="min-h-screen bg-neutral-900 text-white p-6 md:p-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Global Aura Discovery</h1>
                    <p className="text-neutral-400 text-sm mt-1">Mass Production Management System</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                        + Add New Venue
                    </button>
                    <a href={SHEET_URL} target="_blank" className="text-sm bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-lg">Source Sheet</a>
                </div>
            </header>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleAddClient} className="bg-neutral-800 border border-neutral-700 w-full max-w-md rounded-2xl p-8 space-y-6 animate-in fade-in zoom-in-95">
                        <h2 className="text-xl font-bold">Register Global Venue</h2>

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
                            </select>

                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Lat" value={newClient.lat} onChange={e => setNewClient({ ...newClient, lat: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                                <input placeholder="Lng" value={newClient.lng} onChange={e => setNewClient({ ...newClient, lng: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2" />
                            </div>
                            <button type="button" onClick={getCurrentLocation} className="text-[10px] text-green-500 uppercase tracking-widest font-bold">Use My Current Location</button>
                        </div>

                        <button disabled={isSubmitting} type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-xl">
                            {isSubmitting ? 'Syncing...' : 'Register Global Venue'}
                        </button>
                        <button type="button" onClick={() => setShowAddForm(false)} className="w-full text-xs text-neutral-500">Cancel</button>
                    </form>
                </div>
            )}

            <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-neutral-900">
                        <tr>
                            <th className="p-4 text-xs font-bold text-neutral-500 uppercase">Venue</th>
                            <th className="p-4 text-xs font-bold text-neutral-500 uppercase">Type</th>
                            <th className="p-4 text-xs font-bold text-neutral-500 uppercase">Network</th>
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

            {selectedClient && <ClientToolkit clientId={selectedClient.id} onClose={() => setSelectedClient(null)} />}
        </div>
    );
}
