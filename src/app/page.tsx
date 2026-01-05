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
          const data = await res.json();

          if (res.ok) {
            setVenue(data);
          } else {
            const diags = data.diagnostics || {};
            const dist = diags.closestDistanceDeg !== Infinity
              ? `Closest Match: ${diags.closestVenueId} (${(diags.closestDistanceDeg * 111).toFixed(2)} km away)`
              : "No valid GPS data found in sheet";

            setError(`
              Status: Blocked |
              Scanned: ${diags.totalVenuesScanned || 0} venues |
              Diagnostic: ${dist} |
              Your Signal: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
            `);
          }
        } catch (err) {
          console.error('[Discovery UI Error]:', err);
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
          <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-2xl text-white font-light tracking-widest font-sans">AURA<span className="font-bold">TAP</span></h1>

            <div className="space-y-2">
              <p className="text-white/80 text-lg font-light">No Venues Detected</p>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                We couldn't find an AuraTap spot at your current location. Please ensure you are at a participating venue.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/dashboard"
                className="inline-block px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Owner Dashboard
              </Link>
            </div>

            {/* Subtle Technical Details (Only if actual data exists) */}
            {error.includes('|') && (
              <details className="mt-8 text-left">
                <summary className="text-[10px] text-white/20 uppercase tracking-widest cursor-pointer hover:text-white/40 transition-colors list-none text-center">
                  Technical Diagnostics
                </summary>
                <div className="mt-4 p-4 bg-black/40 rounded-lg text-[10px] font-mono text-white/40 break-all border border-white/5 leading-loose">
                  {error.split('|').map((line, i) => (
                    <p key={i}>{line.trim()}</p>
                  ))}
                </div>
              </details>
            )}
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
