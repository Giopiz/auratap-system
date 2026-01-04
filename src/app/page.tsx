'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import WiFiCard from '@/components/WiFiCard';
import Link from 'next/link';
import { WifiCredentials } from '@/lib/wifi-service';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState<WifiCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/discover?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            setVenue(data);
          } else {
            setError("No AuraTap venue found at your current location.");
          }
        } catch {
          setError("Unable to connect to AuraTap Discovery.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Please allow location access to discover local Wi-Fi.");
        setLoading(false);
      }
    );
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-black to-blue-900/20" />

      <div className="relative z-10 w-full flex flex-col items-center justify-center p-4">
        {loading && (
          <div className="text-center space-y-4 animate-pulse">
            <div className="w-16 h-16 border-t-2 border-white/40 rounded-full animate-spin mx-auto" />
            <p className="text-white/40 text-xs uppercase tracking-[0.3em]">Discovering nearby Aura...</p>
          </div>
        )}

        {error && !venue && (
          <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center space-y-6">
            <h1 className="text-2xl text-white font-light tracking-widest">AURATAP</h1>
            <p className="text-white/60 text-sm">{error}</p>
            <div className="pt-4 text-center">
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-xs uppercase tracking-widest hover:bg-white/20 transition-all font-bold"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        )}

        {venue && (
          <div className="animate-in fade-in zoom-in-95 duration-1000">
            <WiFiCard credentials={venue} />
          </div>
        )}
      </div>
    </main>
  );
}
