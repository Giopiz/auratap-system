
export interface WifiCredentials {
    clientId?: string;
    ssid: string;
    password?: string;
    securityType?: 'WPA' | 'WEP' | 'nopass';
    theme?: 'marble' | 'steel' | 'wood';
    venueType?: string;
    ownerEmail?: string;
    lat?: number | null;
    lng?: number | null;
    logoUrl?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
}

// Mock data store - will be replaced by MCP Google Sheets later
const MOCK_DB: Record<string, WifiCredentials> = {
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

const GOOGLE_SHEET_ID = '1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ';

/**
 * Fetches credentials for a specific client.
 * Note: When called from Server Components, this needs a full URL or a direct DB call.
 * For now, we'll use a relative URL which works on the client, and a fallback for server-side.
 */
export async function getWifiCredentials(clientId: string): Promise<WifiCredentials | null> {
    try {
        // Use relative URL for client-side, and handle server-side via environment variable or default
        const baseUrl = typeof window !== 'undefined'
            ? ''
            : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

        const response = await fetch(`${baseUrl}/api/sheets/${GOOGLE_SHEET_ID}/data?clientId=${clientId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 0 } // Disable cache for live data
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.ssid) {
                return data;
            }
        }
    } catch (error) {
        console.warn('⚠️ Google Sheets sync issue:', error);
    }

    // Fallback to mock data for instant preview if Sheets are down
    const mockData = MOCK_DB[clientId];
    return mockData || null;
}
