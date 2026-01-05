import { NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets-server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const venues = await fetchSheetData();

        return NextResponse.json({
            count: Array.isArray(venues) ? venues.length : 0,
            venues: venues,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch sheet data', details: String(error) },
            { status: 500 }
        );
    }
}
