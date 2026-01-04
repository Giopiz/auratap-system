import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

const GOOGLE_SHEET_ID = '1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ';

export async function fetchSheetData(clientId?: string) {
    try {
        let creds;
        const secretsPath = path.join(process.cwd(), 'secrets', 'google-service-account.json');

        // 1. Load Credentials (File or Env)
        if (fs.existsSync(secretsPath)) {
            const fileContent = fs.readFileSync(secretsPath, 'utf8');
            creds = JSON.parse(fileContent);
        } else if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        }

        if (!creds) {
            throw new Error('No Google Service Account credentials found.');
        }

        // 2. Authenticate
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

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
            };
        }

        return rows.map(row => ({
            clientId: row.get('clientId'),
            ssid: row.get('ssid'),
            password: row.get('password'),
            securityType: row.get('securityType') || 'WPA',
            theme: row.get('theme') || 'marble',
        }));

    } catch (error) {
        console.error('[Sheets Server Error]:', error);
        throw error;
    }
}
