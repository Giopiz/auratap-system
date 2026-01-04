import { NextRequest, NextResponse } from 'next/server';
import { fetchNearestVenue } from '@/lib/sheets-server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    try {
        const nearest = await fetchNearestVenue(lat, lng);

        if (nearest) {
            return NextResponse.json(nearest);
        } else {
            return NextResponse.json({ message: 'No venue found nearby' }, { status: 404 });
        }
    } catch (error) {
        console.error('[Discovery API Error]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
