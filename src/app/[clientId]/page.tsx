export const dynamic = 'force-dynamic';

import { WifiCredentials } from '@/lib/wifi-service';
import { fetchSheetData } from '@/lib/sheets-server';
import WiFiCard from '@/components/WiFiCard';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{
        clientId: string;
    }>;
}

export default async function ClientPage({ params }: PageProps) {
    const { clientId } = await params;
    const credentials = await fetchSheetData(clientId) as WifiCredentials | null;

    if (!credentials || !credentials.ssid) {
        return (
            <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-6">
                <h1 className="text-2xl text-white font-light tracking-widest uppercase">AuraTap Service</h1>
                <p className="text-white/40 text-sm max-w-xs">Connecting to this venue is currently unavailable. Please try again or visit the dashboard.</p>
                <a href="/dashboard" className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-xs uppercase tracking-widest font-bold">Admin Dashboard</a>
            </main>
        );
    }

    const themeMap: Record<string, string> = {
        marble: '/assets/matte-marble.png',
        steel: '/assets/brushed-steel.png',
        wood: '/assets/walnut-wood.png',
    };

    const bgImage = credentials.theme ? themeMap[credentials.theme] : themeMap['marble'];

    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 w-full flex justify-center p-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
                <WiFiCard credentials={credentials} />
            </div>
        </main>
    );
}
