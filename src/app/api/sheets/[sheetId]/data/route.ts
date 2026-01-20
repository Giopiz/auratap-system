import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData, addClientRecord, updateClientRecord } from '@/lib/sheets-server';

export async function GET(
    request: NextRequest,
    _context: { params: Promise<{ sheetId: string }> }
) {
    await _context.params;
    const { searchParams } = request.nextUrl;
    const clientId = searchParams.get('clientId');

    try {
        const result = await fetchSheetData(clientId || undefined);

        if (!result) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        if (clientId) {
            return NextResponse.json(result);
        }

        return NextResponse.json({ clients: result });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Sheets API GET Error]:', errorMessage);
        return NextResponse.json(
            { error: 'Failed to fetch from Google Sheets', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    _context: { params: Promise<{ sheetId: string }> }
) {
    await _context.params;
    try {
        const body = await request.json();
        const { clientId, ssid, password, theme, venueType, ownerEmail, lat, lng, logoUrl, instagram, facebook, website, radius, securityType, primaryColor, secondaryColor } = body;

        if (!clientId) {
            return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
        }

        await addClientRecord({
            clientId,
            ssid,
            password,
            theme,
            venueType,
            ownerEmail,
            lat: lat ? parseFloat(lat) : undefined,
            lng: lng ? parseFloat(lng) : undefined,
            logoUrl,
            instagram,
            facebook,
            website,
            radius: radius ? parseFloat(radius) : undefined,
            securityType,
            primaryColor,
            secondaryColor
        });
        return NextResponse.json({ success: true, message: 'Client added successfully' });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Sheets API POST Error]:', errorMessage);
        return NextResponse.json(
            { error: errorMessage }, // Return the actual error message directly
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    _context: { params: Promise<{ sheetId: string }> }
) {
    await _context.params;
    try {
        const body = await request.json();
        const {
            clientId, ssid, password, theme, venueType,
            ownerEmail, lat, lng, logoUrl, instagram,
            facebook, website, radius, securityType,
            primaryColor, secondaryColor
        } = body;

        if (!clientId) {
            return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
        }

        await updateClientRecord(clientId, {
            ssid,
            password,
            theme,
            venueType,
            ownerEmail,
            lat: lat !== undefined ? Number(lat) : undefined,
            lng: lng !== undefined ? Number(lng) : undefined,
            logoUrl,
            instagram,
            facebook,
            website,
            radius: radius !== undefined ? Number(radius) : undefined,
            securityType,
            primaryColor,
            secondaryColor
        });
        return NextResponse.json({ success: true, message: 'Client updated successfully' });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Sheets API PATCH Error]:', errorMessage);
        return NextResponse.json(
            { error: 'Failed to update client', details: errorMessage },
            { status: 500 }
        );
    }
}
