import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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
            return NextResponse.json(nearest, {
                headers: { 'x-discovery-info': `Found ${nearest.clientId}` }
            });
        } else {
            return NextResponse.json(
                { message: 'No venue found nearby' },
                {
                    status: 404,
                    headers: { 'x-discovery-info': 'No match within 500m' }
                }
            );
        }
    } catch (error) {
        console.error('[Discovery API Error]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
