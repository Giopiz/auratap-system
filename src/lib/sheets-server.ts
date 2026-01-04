import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { WifiCredentials } from './wifi-service';
import fs from 'fs';
import path from 'path';

const GOOGLE_SHEET_ID = '1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ';

async function getDoc() {
    let creds;
    const secretsPath = path.join(process.cwd(), 'secrets', 'google-service-account.json');

    if (fs.existsSync(secretsPath)) {
        const fileContent = fs.readFileSync(secretsPath, 'utf8');
        creds = JSON.parse(fileContent);
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    }

    if (!creds) {
        throw new Error('No Google Service Account credentials found.');
    }

    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Full access for writes
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
}

export async function fetchSheetData(clientId?: string) {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        if (clientId) {
            const row = rows.find(r => r.get('clientId') === clientId);
            if (!row) return null;

            return {
                ssid: row.get('ssid'),
                password: row.get('password'),
                securityType: row.get('securityType') || 'WPA',
                theme: row.get('theme') || 'marble',
                venueType: row.get('venueType') || 'cafe',
                ownerEmail: row.get('ownerEmail') || '',
                lat: parseFloat(row.get('lat')) || null,
                lng: parseFloat(row.get('lng')) || null,
            };
        }

        return rows.map(row => ({
            clientId: row.get('clientId'),
            ssid: row.get('ssid'),
            password: row.get('password'),
            securityType: row.get('securityType') || 'WPA',
            theme: row.get('theme') || 'marble',
            venueType: row.get('venueType') || 'cafe',
            ownerEmail: row.get('ownerEmail') || '',
            lat: parseFloat(row.get('lat')) || null,
            lng: parseFloat(row.get('lng')) || null,
        }));

    } catch (error) {
        console.error('[Sheets Server Fetch Error]:', error);
        return clientId ? null : [];
    }
}

export async function addClientRecord(data: {
    clientId: string;
    ssid?: string;
    password?: string;
    theme?: string;
    venueType?: string;
    ownerEmail?: string;
    lat?: number;
    lng?: number;
}) {
    try {
        console.log('[Sheets Server] Attempting to add client:', data.clientId);
        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0];

        await sheet.addRow({
            clientId: data.clientId,
            ssid: data.ssid || '',
            password: data.password || '',
            securityType: 'WPA',
            theme: data.theme || 'marble',
            venueType: data.venueType || 'cafe',
            ownerEmail: data.ownerEmail || '',
            lat: data.lat !== undefined && data.lat !== null ? Number(data.lat) : '',
            lng: data.lng !== undefined && data.lng !== null ? Number(data.lng) : '',
        });

        console.log('[Sheets Server] Successfully added client to sheet.');
        return true;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[Sheets Server Add Error]:', message);
        if (message.includes('duplicate')) {
            throw new Error('This Client ID already exists in the sheet.');
        }
        throw new Error(`Google Sheets Error: ${message || 'Check your sheet headers'}`);
    }
}

export async function updateClientRecord(clientId: string, data: Partial<{
    ssid: string;
    password: string;
    theme: string;
    venueType: string;
    ownerEmail: string;
    lat: number;
    lng: number;
}>) {
    try {
        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        const row = rows.find(r => r.get('clientId') === clientId);
        if (!row) throw new Error('Client not found');

        if (data.ssid !== undefined) row.set('ssid', data.ssid);
        if (data.password !== undefined) row.set('password', data.password);
        if (data.theme !== undefined) row.set('theme', data.theme);
        if (data.venueType !== undefined) row.set('venueType', data.venueType);
        if (data.ownerEmail !== undefined) row.set('ownerEmail', data.ownerEmail);
        if (data.lat !== undefined) row.set('lat', data.lat !== null ? Number(data.lat) : '');
        if (data.lng !== undefined) row.set('lng', data.lng !== null ? Number(data.lng) : '');

        await row.save();
        return true;
    } catch (error) {
        console.error('[Sheets Server Update Error]:', error);
        throw error;
    }
}

/**
 * Discovery Engine: Finds the nearest venue based on lat/lng
 */
export async function fetchNearestVenue(userLat: number, userLng: number) {
    const venues = await fetchSheetData() as WifiCredentials[];
    if (!venues || venues.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    venues.forEach(venue => {
        if (venue.lat && venue.lng) {
            // Simple distance formula for close proximity
            const distance = Math.sqrt(
                Math.pow(venue.lat - userLat, 2) +
                Math.pow(venue.lng - userLng, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearest = venue;
            }
        }
    });

    // Only return if within ~500 meters (approx 0.005 degrees)
    return minDistance < 0.005 ? nearest : null;
}
