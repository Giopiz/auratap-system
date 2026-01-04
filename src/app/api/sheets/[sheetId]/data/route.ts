import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets-server';

export async function GET(
    request: NextRequest,
    _context: { params: Promise<{ sheetId: string }> }
) {
    // Note: sheetId is passed in params but fetchSheetData currently uses a hardcoded one.
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
        console.error('[Sheets API Error]:', errorMessage);
        return NextResponse.json(
            { error: 'Failed to fetch from Google Sheets', details: errorMessage },
            { status: 500 }
        );
    }
}
