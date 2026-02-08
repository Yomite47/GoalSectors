/* eslint-disable @typescript-eslint/no-explicit-any */
import { Opik } from "opik";


export interface TraceHandle {
    id: string;
    traceObj: any; // Internal SDK object
}

export function isOpikEnabled(): boolean {
    return process.env.OPIK_ENABLED === 'true' && !!process.env.OPIK_API_KEY;
}

let client: Opik | null = null;

if (isOpikEnabled()) {
    try {
        client = new Opik({
            apiKey: process.env.OPIK_API_KEY,
            projectName: process.env.OPIK_PROJECT || 'goalsectors',
        });
    } catch (error) {
        console.warn("[Opik] Failed to initialize client:", error);
    }
}

export function startTrace(name: string, meta: any): TraceHandle | null {
    if (!client) return null;
    try {
        const traceObj = client.trace({
            name: name,
            metadata: meta,
            // @ts-expect-error - Opik SDK types might be missing or incomplete
            startTime: new Date()
        });
        return { id: (traceObj as any).id, traceObj };
    } catch (error) {
        console.error("[Opik] startTrace error:", error);
        return null;
    }
}

export function traceEvent(handle: TraceHandle | null, name: string, payload: any): void {
    if (!handle || !handle.traceObj) return;
    try {
        // Create a child span for the event
        const span = handle.traceObj.span({
            name: name,
            input: payload,
            // @ts-expect-error - Opik SDK types might be missing or incomplete
            startTime: new Date()
        });
        span.end();
    } catch (error) {
        console.error("[Opik] traceEvent error:", error);
    }
}

export function endTrace(handle: TraceHandle | null, resultMeta: any): void {
    if (!handle || !handle.traceObj) return;
    try {
        // Ideally we pass output to end()
        handle.traceObj.end({
            output: resultMeta,
            // @ts-expect-error - Opik SDK types might be missing or incomplete
            endTime: new Date()
        });
        client?.flush();
    } catch (error) {
        console.error("[Opik] endTrace error:", error);
    }
}

export async function logEval(handle: TraceHandle | null, name: string, value: number, reason?: string) {
    if (!client || !handle) return;
    try {
        await client.logTracesFeedbackScores([{
            id: handle.id,
            name,
            value,
            reason
        }]);
    } catch (error) {
        console.error("[Opik] logEval error:", error);
    }
}
