import { NextRequest, NextResponse } from 'next/server';
import { systemConfigService } from '@/lib/services/system-config-service';

const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

export async function POST(request: NextRequest) {
    try {
        const config = await systemConfigService.readConfig();
        const pexelsApiKey = config?.services?.pexels?.apiKey;

        if (!pexelsApiKey) {
            return NextResponse.json(
                { error: 'Pexels API key not configured in settings.json' },
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
                    'Authorization': pexelsApiKey,
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
