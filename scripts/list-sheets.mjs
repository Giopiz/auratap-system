import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

const GOOGLE_SHEET_ID = '1Wtid4l81oQvqdqY1wXk_cOgF6moodVRkzKj9V7ORQLQ';

async function listSheets() {
    let creds;
    const secretsPath = path.join(process.cwd(), 'secrets', 'google-service-account.json');

    if (fs.existsSync(secretsPath)) {
        creds = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    }

    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    console.log('Available Sheets:');
    doc.sheetsByIndex.forEach((sheet, index) => {
        console.log(`[${index}] Title: "${sheet.title}" | Rows: ${sheet.rowCount}`);
    });
}

listSheets().catch(console.error);
