import { NextResponse } from 'next/server';
import { getStore } from '@/lib/data';
import { isOpikEnabled } from '@/lib/opik/adapter';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        const store = getStore();
        const runs = await store.listAiRunsWithEvals(userId);
        
        return NextResponse.json({ 
            runs,
            opikStatus: {
                enabled: isOpikEnabled(),
                project: process.env.OPIK_PROJECT || 'goalsectors',
            }
        });
    } catch (error) {
        console.error('Error fetching runs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
