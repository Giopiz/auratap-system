import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

// This route now talks DIRECTLY to Google Sheets, eliminating the need for a local MCP server.
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sheetId: string }> }
) {
    const { sheetId } = await params;
    const { searchParams } = request.nextUrl;
    const clientId = searchParams.get('clientId');

    if (!clientId) {
        return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    try {
        let creds;
        const secretsPath = path.join(process.cwd(), 'secrets', 'google-service-account.json');

        // 1. Load Credentials (File or Env)
        if (fs.existsSync(secretsPath)) {
            const fileContent = fs.readFileSync(secretsPath, 'utf8');
            creds = JSON.parse(fileContent);
        } else if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
            // Support for Vercel/Cloud deployment via Environment Variable
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

        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0]; // Assuming first sheet
        const rows = await sheet.getRows();

        // 3. Find Client
        const row = rows.find(r => r.get('clientId') === clientId);

        if (!row) {
            console.warn(`[Sheets API] Client ${clientId} not found in sheet.`);
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // 4. Transform to our WifiCredentials format
        const data = {
            ssid: row.get('ssid'),
            password: row.get('password'),
            securityType: row.get('securityType') || 'WPA',
            theme: row.get('theme') || 'marble',
        };

        return NextResponse.json(data);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Sheets API Error]:', errorMessage);
        return NextResponse.json(
            { error: 'Failed to fetch from Google Sheets', details: errorMessage },
            { status: 500 }
        );
    }
}
