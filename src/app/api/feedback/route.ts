import { NextResponse } from 'next/server';
import { opik } from '@/lib/opik/client';
import { getStore } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const { userId, runId, traceId, score, reason } = await req.json();

        // 1. Log to Store (DB or Local)
        if (userId && runId) {
            const store = getStore();
            // score: 1 = helpful, 0 = not helpful
            await store.logAiFeedback(userId, runId, score === 1, reason);
        }

        // 2. Log feedback to Opik (if enabled)
        if (traceId) {
            // Score: 1 = Like, 0 = Dislike
            await opik.logEvaluation({
                traceId,
                name: 'User Feedback',
                value: score,
                reason: reason || (score === 1 ? 'User liked' : 'User disliked')
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Feedback API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
