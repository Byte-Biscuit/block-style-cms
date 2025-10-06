import { NextRequest, NextResponse } from 'next/server';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

export async function POST(request: NextRequest) {
    try {
        if (!PEXELS_API_KEY) {
            return NextResponse.json(
                { error: 'Pexels API key not configured' },
                { status: 500 }
            );
        }

        const { query, page = 1, per_page = 15 } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`,
            {
                headers: {
                    'Authorization': PEXELS_API_KEY,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Pexels API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Pexels search error:', error);
        return NextResponse.json(
            { error: 'Failed to search images' },
            { status: 500 }
        );
    }
}
