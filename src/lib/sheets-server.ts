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
    const normalizedKey = key.toLowerCase().trim();

    // Define aliases for common fields
    const aliases: Record<string, string[]> = {
        lat: ['lat', 'latitude', 'lattitude', 'y'],
        lng: ['lng', 'longitude', 'longtitude', 'long', 'x'],
        clientid: ['clientid', 'client_id', 'id', 'user_id'],
        ssid: ['ssid', 'wifi', 'wifi_name', 'network'],
        password: ['password', 'pass', 'wifi_password', 'key'],
    };

    const searchKeys = aliases[normalizedKey] || [normalizedKey];

    // Check for exact match first
    for (const sKey of searchKeys) {
        const value = row.get(sKey);
        if (value !== undefined && value !== null && value !== '') return String(value).trim();
    }

    // Fallback to case-insensitive search across all headers
    for (const [header, value] of Object.entries(rawData)) {
        const normalizedHeader = header.toLowerCase().trim();
        if (searchKeys.includes(normalizedHeader)) {
            return String(value).trim();
        }
    }
    return '';
}

function parseCoordinate(val: string | number | null | undefined): number | null {
    if (val === undefined || val === null) return null;
    const strVal = String(val).trim();
    if (strVal === '') return null;
    const num = parseFloat(strVal);
    return isNaN(num) ? null : num;
}

function mapRowToVenue(row: GoogleSpreadsheetRow): WifiCredentials {
    return {
        clientId: getRowValue(row, 'clientId'),
        ssid: getRowValue(row, 'ssid'),
        password: getRowValue(row, 'password'),
        securityType: (getRowValue(row, 'securityType') as 'WPA' | 'WEP' | 'nopass' | undefined) || 'WPA',
        theme: (getRowValue(row, 'theme') as 'marble' | 'steel' | 'wood' | undefined) || 'marble',
        venueType: getRowValue(row, 'venueType') || 'cafe',
        ownerEmail: getRowValue(row, 'ownerEmail') || '',
        lat: parseCoordinate(getRowValue(row, 'lat')),
        lng: parseCoordinate(getRowValue(row, 'lng')),
        logoUrl: getRowValue(row, 'logoUrl'),
        instagram: getRowValue(row, 'instagram'),
        facebook: getRowValue(row, 'facebook'),
        website: getRowValue(row, 'website'),
    };
}

export async function fetchSheetData(clientId?: string) {
    try {
        const doc = await getDoc();

        if (clientId) {
            // Priority search for specific client
            const sheet = await getPreferredSheet(doc);
            const rows = await sheet.getRows();
            const row = rows.find((r: GoogleSpreadsheetRow) => getRowValue(r, 'clientId') === clientId);

            if (row) return mapRowToVenue(row);

            // Fallback: Search ALL sheets for this clientId
            console.log(`[Sheets Server] Client "${clientId}" not in preferred sheet. Searching all sheets...`);
            for (const s of doc.sheetsByIndex) {
                const sRows = await s.getRows();
                const found = sRows.find((r: GoogleSpreadsheetRow) => getRowValue(r, 'clientId') === clientId);
                if (found) return mapRowToVenue(found);
            }
            return null;
        }

        // For discovery (no clientId): Scan ALL sheets and combine
        let allVenues: WifiCredentials[] = [];
        for (const s of doc.sheetsByIndex) {
            const sRows = await s.getRows();
            const mapped = sRows.map(mapRowToVenue).filter(v => v.clientId);
            allVenues = [...allVenues, ...mapped];
        }
        return allVenues;

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
    logoUrl?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
}) {
    try {
        console.log('[Sheets Server] Attempting to add client:', data.clientId);
        const doc = await getDoc();
        const sheet = await getPreferredSheet(doc);

        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        console.log('[Sheets Server] Target Sheet:', sheet.title);
        console.log('[Sheets Server] Detected Headers:', headers);

        // Smart Mapping: Find which actual header corresponds to our internal keys
        // logic: reuse the 'findHeader' logic but in reverse

        const findHeaderFor = (possibleNames: string[]) => {
            const lowerNames = possibleNames.map(n => n.toLowerCase());
            return headers.find(h => {
                const normH = h.toString().toLowerCase().trim().replace(/_/g, '');
                return lowerNames.some(n => normH === n || normH.includes(n));
            });
        };

        // Map internal keys to ACTUAL sheet headers
        const rowData: Record<string, string | number> = {};

        const keyMap: Record<string, string[]> = {
            clientId: ['clientid', 'id', 'venueid'],
            ssid: ['ssid', 'wifi', 'network', 'wifiname'],
            password: ['password', 'pass', 'key', 'wifipassword'],
            securityType: ['security', 'sectype'],
            theme: ['theme', 'style', 'color'],
            venueType: ['venuetype', 'type', 'category'],
            ownerEmail: ['owneremail', 'email', 'contact', 'owner'],
            lat: ['lat', 'latitude', 'y'],
            lng: ['lng', 'longitude', 'long', 'x'],
            logoUrl: ['logo', 'logourl', 'image'],
            instagram: ['instagram', 'ig', 'insta'],
            facebook: ['facebook', 'fb'],
            website: ['website', 'site', 'url'],
            merchLink: ['merch', 'shop', 'merchandise', 'store']
        };

        // Fill the rowData object using the FOUND headers
        if (findHeaderFor(keyMap.clientId)) rowData[findHeaderFor(keyMap.clientId)!] = data.clientId;
        if (findHeaderFor(keyMap.ssid)) rowData[findHeaderFor(keyMap.ssid)!] = data.ssid || '';
        if (findHeaderFor(keyMap.password)) rowData[findHeaderFor(keyMap.password)!] = data.password || '';
        if (findHeaderFor(keyMap.securityType)) rowData[findHeaderFor(keyMap.securityType)!] = 'WPA';
        if (findHeaderFor(keyMap.theme)) rowData[findHeaderFor(keyMap.theme)!] = data.theme || 'marble';
        if (findHeaderFor(keyMap.venueType)) rowData[findHeaderFor(keyMap.venueType)!] = data.venueType || 'cafe';
        if (findHeaderFor(keyMap.ownerEmail)) rowData[findHeaderFor(keyMap.ownerEmail)!] = data.ownerEmail || '';
        if (findHeaderFor(keyMap.lat)) rowData[findHeaderFor(keyMap.lat)!] = data.lat !== undefined && data.lat !== null ? Number(data.lat) : '';
        if (findHeaderFor(keyMap.lng)) rowData[findHeaderFor(keyMap.lng)!] = data.lng !== undefined && data.lng !== null ? Number(data.lng) : '';
        if (findHeaderFor(keyMap.logoUrl)) rowData[findHeaderFor(keyMap.logoUrl)!] = data.logoUrl || '';
        if (findHeaderFor(keyMap.instagram)) rowData[findHeaderFor(keyMap.instagram)!] = data.instagram || '';
        if (findHeaderFor(keyMap.facebook)) rowData[findHeaderFor(keyMap.facebook)!] = data.facebook || '';
        if (findHeaderFor(keyMap.website)) rowData[findHeaderFor(keyMap.website)!] = data.website || '';

        console.log('[Sheets Server] Writing Row Data:', JSON.stringify(rowData));

        if (Object.keys(rowData).length === 0) {
            throw new Error('No matching headers found. Please ensure sheet has columns like "Client ID", "SSID", "Lat", "Lng".');
        }

        await sheet.addRow(rowData);

        console.log('[Sheets Server] Successfully added client to sheet.');
        return true;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[Sheets Server Add Error]:', message);
        console.error('[Sheets Diagnostic]:', JSON.stringify({
            failedId: data.clientId,
            errorType: typeof error,
            rawError: error
        }));

        if (message.includes('duplicate')) {
            throw new Error('This Client ID already exists in the sheet.');
        }
        if (message.includes('403')) {
            throw new Error('Permission Denied: Service Account is not an Editor on this Sheet.');
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
    logoUrl: string;
    instagram: string;
    facebook: string;
    website: string;
}>) {
    try {
        const doc = await getDoc();
        const sheet = await getPreferredSheet(doc);

        // Load headers for smart mapping
        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;

        const findHeaderFor = (possibleNames: string[]) => {
            const lowerNames = possibleNames.map(n => n.toLowerCase());
            return headers.find(h => {
                const normH = h.toString().toLowerCase().trim().replace(/_/g, '');
                return lowerNames.some(n => normH === n || normH.includes(n));
            });
        };

        const keyMap: Record<string, string[]> = {
            clientId: ['clientid', 'id', 'venueid'],
            ssid: ['ssid', 'wifi', 'network', 'wifiname'],
            password: ['password', 'pass', 'key', 'wifipassword'],
            securityType: ['security', 'sectype'],
            theme: ['theme', 'style', 'color'],
            venueType: ['venuetype', 'type', 'category'],
            ownerEmail: ['owneremail', 'email', 'contact', 'owner'],
            lat: ['lat', 'latitude', 'y'],
            lng: ['lng', 'longitude', 'long', 'x'],
            logoUrl: ['logo', 'logourl', 'image'],
            instagram: ['instagram', 'ig', 'insta'],
            facebook: ['facebook', 'fb'],
            website: ['website', 'site', 'url'],
            merchLink: ['merch', 'shop', 'merchandise', 'store']
        };

        const rows = await sheet.getRows();
        const row = rows.find((r: GoogleSpreadsheetRow) => getRowValue(r, 'clientId') === clientId);

        if (!row) throw new Error(`Client "${clientId}" not found in sheet "${sheet.title}"`);

        // Smart Update using mapped headers
        if (data.ssid !== undefined && findHeaderFor(keyMap.ssid)) row.set(findHeaderFor(keyMap.ssid)!, data.ssid);
        if (data.password !== undefined && findHeaderFor(keyMap.password)) row.set(findHeaderFor(keyMap.password)!, data.password);
        if (data.theme !== undefined && findHeaderFor(keyMap.theme)) row.set(findHeaderFor(keyMap.theme)!, data.theme);
        if (data.venueType !== undefined && findHeaderFor(keyMap.venueType)) row.set(findHeaderFor(keyMap.venueType)!, data.venueType);
        if (data.ownerEmail !== undefined && findHeaderFor(keyMap.ownerEmail)) row.set(findHeaderFor(keyMap.ownerEmail)!, data.ownerEmail);
        if (data.logoUrl !== undefined && findHeaderFor(keyMap.logoUrl)) row.set(findHeaderFor(keyMap.logoUrl)!, data.logoUrl);
        if (data.instagram !== undefined && findHeaderFor(keyMap.instagram)) row.set(findHeaderFor(keyMap.instagram)!, data.instagram);
        if (data.facebook !== undefined && findHeaderFor(keyMap.facebook)) row.set(findHeaderFor(keyMap.facebook)!, data.facebook);
        if (data.website !== undefined && findHeaderFor(keyMap.website)) row.set(findHeaderFor(keyMap.website)!, data.website);

        // Handle coordinates carefully
        if (data.lat !== undefined && findHeaderFor(keyMap.lat)) {
            row.set(findHeaderFor(keyMap.lat)!, data.lat !== null ? String(data.lat) : '');
        }
        if (data.lng !== undefined && findHeaderFor(keyMap.lng)) {
            row.set(findHeaderFor(keyMap.lng)!, data.lng !== null ? String(data.lng) : '');
        }

        await row.save();
        console.log(`[Sheets Server] Updated client "${clientId}" successfully.`);
        return true;
    } catch (error) {
        console.error('[Sheets Server Update Error]:', error);
        throw error;
    }
}

/**
 * Discovery Engine: Finds the nearest venue based on lat/lng with diagnostic metadata
 */
export async function fetchNearestVenue(userLat: number, userLng: number) {
    const venues = await fetchSheetData() as WifiCredentials[];

    const diagnostics = {
        totalVenuesScanned: venues ? venues.length : 0,
        closestDistanceDeg: Infinity as number,
        closestVenueId: 'NONE' as string,
        radiusUsedKm: 1,
    };

    if (!venues || venues.length === 0) {
        console.log('[Discovery] No venues found in sheet.');
        return { nearest: null, diagnostics };
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
                diagnostics.closestDistanceDeg = distance;
                diagnostics.closestVenueId = venue.clientId || 'unknown';
            }
        }
    }

    console.log(`[Discovery] Nearest Venue: ${nearest?.clientId || 'NONE'} | Min Dist: ${minDistance === Infinity ? '0' : minDistance.toFixed(6)}`);

    // Only return if within ~1km (approx 0.01 degrees)
    const result = minDistance < 0.01 ? nearest : null;
    return { nearest: result, diagnostics };
}
