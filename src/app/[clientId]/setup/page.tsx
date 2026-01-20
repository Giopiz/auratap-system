'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { WifiCredentials } from '@/lib/wifi-service';
import { useParams } from 'next/navigation';
import WiFiCard from '@/components/WiFiCard';

export default function OwnerSetupPage() {
    const params = useParams();
    const clientId = params?.clientId as string;

    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        ssid: '',
        password: '',
        lat: '',
        lng: '',
        logoUrl: '',
        website: '',
        instagram: '',
        facebook: '',
        securityType: 'WPA' as 'WPA' | 'WEP' | 'nopass',
        venueType: 'cafe'
    });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (clientId) fetchBrief();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId]);

    const fetchBrief = async () => {
        try {
            const res = await fetch(`/api/sheets/generic_id/data?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            const found = data.clients?.find((c: WifiCredentials) => c.clientId === clientId);
            if (found) {
                setFormData({
                    ssid: found.ssid || '',
                    password: found.password || '',
                    lat: found.lat ? String(found.lat) : '',
                    lng: found.lng ? String(found.lng) : '',
                    logoUrl: found.logoUrl || '',
                    website: found.website || '',
                    instagram: found.instagram || '',
                    facebook: found.facebook || '',
                    securityType: found.securityType || 'WPA',
                    venueType: found.venueType || 'cafe'
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation is not supported by your browser');

        setIsSaving(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData(prev => ({
                    ...prev,
                    lat: String(pos.coords.latitude),
                    lng: String(pos.coords.longitude)
                }));
                setIsSaving(false);
            },
            (err) => {
                alert('Error getting location: ' + err.message);
                setIsSaving(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMsg('');

        try {
            const res = await fetch(`/api/sheets/generic_sheet_id/data`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId,
                    ssid: formData.ssid,
                    password: formData.password,
                    lat: formData.lat,
                    lng: formData.lng,
                    logoUrl: formData.logoUrl,
                    website: formData.website,
                    instagram: formData.instagram,
                    facebook: formData.facebook,
                    securityType: formData.securityType,
                    venueType: formData.venueType
                })
            });

            if (res.ok) {
                setMsg('✅ Settings updated successfully!');
            } else {
                const err = await res.json();
                setMsg('❌ Error: ' + err.error);
            }
        } catch {
            setMsg('❌ Network Error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!clientId) return <div className="p-8 text-white">Invalid Client ID</div>;

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Form Side */}
                <div className="bg-neutral-800 border border-neutral-700 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Venue Setup</h1>
                        <div className="inline-block bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-mono">
                            {clientId}
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Location Section */}
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                            <label className="block text-sm font-bold text-neutral-400 uppercase tracking-widest">
                                1. Set Location
                            </label>
                            <p className="text-xs text-neutral-500">
                                Stand in the center of your venue and tap the button below.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    disabled
                                    placeholder="Lat"
                                    value={formData.lat}
                                    className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-xs text-neutral-500"
                                />
                                <input
                                    disabled
                                    placeholder="Lng"
                                    value={formData.lng}
                                    className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-xs text-neutral-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleGetLocation}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                📍 Localize Aura Radius
                            </button>
                        </div>

                        {/* WiFi Section */}
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                            <label className="block text-sm font-bold text-neutral-400 uppercase tracking-widest">
                                2. WiFi Details
                            </label>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">Network Name (SSID)</label>
                                    <input
                                        value={formData.ssid}
                                        onChange={e => setFormData({ ...formData, ssid: e.target.value })}
                                        placeholder="e.g. Cafe_Guest_Free"
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:border-green-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">Password</label>
                                    <input
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Leave empty if open network"
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:border-green-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">Security Type</label>
                                    <select
                                        value={formData.securityType}
                                        onChange={(e) => setFormData({ ...formData, securityType: e.target.value as 'WPA' | 'WEP' | 'nopass' })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:border-green-500 outline-none"
                                    >
                                        <option value="WPA">WPA/WPA2 (Standard)</option>
                                        <option value="WEP">WEP (Legacy)</option>
                                        <option value="nopass">None (Open)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Venue Type Area */}
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                            <label className="block text-sm font-bold text-neutral-400 uppercase tracking-widest">
                                3. Venue Category
                            </label>
                            <select
                                value={formData.venueType}
                                onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:border-green-500 outline-none"
                            >
                                <option value="cafe">Cafe</option>
                                <option value="bar">Bar</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="hotel">Hotel</option>
                                <option value="house">House</option>
                                <option value="gym">Gym</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Branding & Socials Section */}
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                            <label className="block text-sm font-bold text-neutral-400 uppercase tracking-widest">
                                4. Branding & Socials
                            </label>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">Logo Image URL</label>
                                    <input
                                        value={formData.logoUrl}
                                        onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                                        placeholder="https://"
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:border-green-500 outline-none"
                                    />
                                    <p className="text-[10px] text-neutral-500 mt-1">Direct link to logo (PNG/JPG)</p>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">Website</label>
                                    <input
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://"
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:border-green-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-1 block">Instagram</label>
                                        <input
                                            value={formData.instagram}
                                            onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                            placeholder="@handle"
                                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:border-green-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-500 mb-1 block">Facebook</label>
                                        <input
                                            value={formData.facebook}
                                            onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                                            placeholder="Profile URL"
                                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 focus:border-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-500/20"
                        >
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </button>

                        {msg && (
                            <div className={`p-4 rounded-lg text-center font-bold ${msg.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-400'}`}>
                                {msg}
                            </div>
                        )}
                    </form>
                </div>

                {/* Preview Side */}
                <div className="sticky top-12 space-y-8 flex flex-col items-center">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-500">Live Preview</h2>
                        <p className="text-xs text-neutral-600">This is exactly what your customers will see</p>
                    </div>

                    <div className="w-full pointer-events-none transform scale-90 sm:scale-100 transition-transform duration-500">
                        <WiFiCard
                            credentials={{
                                clientId: clientId,
                                ssid: formData.ssid || 'Your WiFi Name',
                                password: formData.password || 'password123',
                                securityType: formData.securityType,
                                logoUrl: formData.logoUrl,
                                website: formData.website,
                                instagram: formData.instagram,
                                facebook: formData.facebook,
                                venueType: formData.venueType,
                                theme: 'marble'
                            }}
                        />
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-sm text-blue-400 max-w-sm text-center">
                        💡 <b>Tip:</b> If you enter just your Instagram handle (like <i>@aura_tap</i>), we&apos;ll automatically create the link for you!
                    </div>
                </div>

            </div>
        </div>
    );
}
