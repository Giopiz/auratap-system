
export interface WifiCredentials {
    ssid: string;
    password?: string;
    securityType?: 'WPA' | 'WEP' | 'nopass';
    theme?: 'marble' | 'steel' | 'wood';
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

export async function getWifiCredentials(clientId: string): Promise<WifiCredentials | null> {
    // Try to fetch from Google Sheets via API route
    try {
        const response = await fetch(`http://localhost:3000/api/sheets/${GOOGLE_SHEET_ID}/data?clientId=${clientId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.ssid) {
                console.log('✅ Fetched from Google Sheets:', data);
                return {
                    ssid: data.ssid,
                    password: data.password,
                    securityType: data.securityType || 'WPA',
                    theme: data.theme || 'marble'
                };
            }
        }
    } catch (error) {
        console.warn('⚠️ Google Sheets unavailable, using mock data:', error);
    }

    // Fallback to mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockData = MOCK_DB[clientId];
    if (mockData) {
        console.log('📦 Using mock data for:', clientId);
    }
    return mockData || null;
}
