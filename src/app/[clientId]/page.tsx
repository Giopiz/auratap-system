import { getWifiCredentials } from '@/lib/wifi-service';
import WiFiCard from '@/components/WiFiCard';
import { notFound } from 'next/navigation';

interface PageProps {
    params: {
        clientId: string;
    };
}

export default async function ClientPage({ params }: PageProps) {
    const { clientId } = await params;
    const credentials = await getWifiCredentials(clientId);

    if (!credentials) {
        notFound();
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
