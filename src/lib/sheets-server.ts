import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
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

async function getPreferredSheet(doc: GoogleSpreadsheet) {
    // Priority 1: A sheet named "LOCATION" (User's specific request)
    // Priority 2: A sheet named "Clients" (Legacy/Standard)
    // Priority 3: The first sheet (Fallback)
    const preferredNames = ['LOCATION', 'Clients'];
    for (const name of preferredNames) {
        const sheet = doc.sheetsByTitle[name];
        if (sheet) return sheet;
    }
    return doc.sheetsByIndex[0];
}

function getRowValue(row: GoogleSpreadsheetRow, key: string): string {
    const rawData = row.toObject();
    const normalizedKey = key.toLowerCase();

    // Check for exact match first
    const exactMatch = row.get(key);
    if (exactMatch !== undefined) return exactMatch;

    // Fallback to case-insensitive search
    for (const [header, value] of Object.entries(rawData)) {
        if (header.toLowerCase() === normalizedKey) {
            return String(value);
        }
    }
    return '';
}

function parseCoordinate(val: string | number | null | undefined): number | null {
    if (val === undefined || val === null || val === '') return null;
    const num = parseFloat(String(val));
    return isNaN(num) ? null : num;
}

export async function fetchSheetData(clientId?: string) {
    try {
        const doc = await getDoc();
        const sheet = await getPreferredSheet(doc);
        const rows = await sheet.getRows();
        console.log(`[Sheets Server] Reading from "${sheet.title}". Headers:`, sheet.headerValues.join(', '));

        if (clientId) {
            const row = rows.find((r: GoogleSpreadsheetRow) => getRowValue(r, 'clientId') === clientId);
            if (!row) return null;

            return {
                ssid: getRowValue(row, 'ssid'),
                password: getRowValue(row, 'password'),
                securityType: getRowValue(row, 'securityType') || 'WPA',
                theme: getRowValue(row, 'theme') || 'marble',
                venueType: getRowValue(row, 'venueType') || 'cafe',
                ownerEmail: getRowValue(row, 'ownerEmail') || '',
                lat: parseCoordinate(getRowValue(row, 'lat')),
                lng: parseCoordinate(getRowValue(row, 'lng')),
            };
        }

        return rows.map((row: GoogleSpreadsheetRow) => ({
            clientId: getRowValue(row, 'clientId'),
            ssid: getRowValue(row, 'ssid'),
            password: getRowValue(row, 'password'),
            securityType: getRowValue(row, 'securityType') || 'WPA',
            theme: getRowValue(row, 'theme') || 'marble',
            venueType: getRowValue(row, 'venueType') || 'cafe',
            ownerEmail: getRowValue(row, 'ownerEmail') || '',
            lat: parseCoordinate(getRowValue(row, 'lat')),
            lng: parseCoordinate(getRowValue(row, 'lng')),
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
        const sheet = await getPreferredSheet(doc);

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
        const sheet = await getPreferredSheet(doc);
        const rows = await sheet.getRows();

        const row = rows.find((r: GoogleSpreadsheetRow) => getRowValue(r, 'clientId') === clientId);
        if (!row) throw new Error(`Client "${clientId}" not found in sheet "${sheet.title}"`);

        if (data.ssid !== undefined) row.set('ssid', data.ssid);
        if (data.password !== undefined) row.set('password', data.password);
        if (data.theme !== undefined) row.set('theme', data.theme);
        if (data.venueType !== undefined) row.set('venueType', data.venueType);
        if (data.ownerEmail !== undefined) row.set('ownerEmail', data.ownerEmail);
        if (data.lat !== undefined) row.set('lat', data.lat !== null ? String(data.lat) : '');
        if (data.lng !== undefined) row.set('lng', data.lng !== null ? String(data.lng) : '');

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
    if (!venues || venues.length === 0) {
        console.log('[Discovery] No venues found in sheet.');
        return null;
    }

    let nearest: WifiCredentials | null = null;
    let minDistance = Infinity;

    for (const venue of venues) {
        const vLat = venue.lat;
        const vLng = venue.lng;

        if (vLat !== null && vLng !== null && vLat !== undefined && vLng !== undefined) {
            // Simple distance formula for close proximity
            const distance = Math.sqrt(
                Math.pow(vLat - userLat, 2) +
                Math.pow(vLng - userLng, 2)
            );

            console.log(`[Discovery] Checking Venue: ${venue.clientId || 'unknown'} | Dist: ${distance.toFixed(6)}`);

            if (distance < minDistance) {
                minDistance = distance;
                nearest = venue;
            }
        }
    }

    console.log(`[Discovery] Nearest Venue: ${nearest?.clientId || 'NONE'} | Min Dist: ${minDistance === Infinity ? '0' : minDistance.toFixed(6)}`);

    // Only return if within ~1km (approx 0.01 degrees)
    return minDistance < 0.01 ? nearest : null;
}
