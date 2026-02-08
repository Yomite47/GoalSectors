/* eslint-disable @typescript-eslint/no-explicit-any */
import { Opik } from "opik";


export interface OpikConfig {
    apiKey: string;
    project: string;
    enabled: boolean;
}

export function getOpikConfig(): OpikConfig {
    return {
        apiKey: process.env.OPIK_API_KEY || '',
        project: process.env.OPIK_PROJECT || 'goalsectors',
        enabled: process.env.OPIK_ENABLED === 'true'
    };
}

export function isOpikEnabled(): boolean {
    const config = getOpikConfig();
    return config.enabled && !!config.apiKey;
}

// Minimal types for Opik payloads
interface OpikTrace {
    name: string;
    startTime: string; // ISO
    endTime: string; // ISO
    input?: any;
    output?: any;
    metadata?: any;
    tags?: string[];
}

interface OpikFeedback {
    traceId: string;
    name: string;
    value: number;
    reason?: string;
}

export class OpikClient {
    private client: Opik | null = null;

    constructor() {
        if (isOpikEnabled()) {
            try {
                const config = getOpikConfig();
                this.client = new Opik({
                    apiKey: config.apiKey,
                    projectName: config.project,
                });
            } catch (error) {
                console.warn("[Opik] Failed to initialize client:", error);
            }
        }
    }

    async logTrace(traceData: OpikTrace): Promise<string | null> {
        if (!this.client) return null;

        try {
            // Note: The Opik SDK trace() method primarily starts a trace.
            // To log a retrospective trace with specific start/end times,
            // we rely on the SDK's ability to accept these fields if available,
            // or we accept that the trace duration might reflect the logging time.
            const trace = this.client.trace({
                name: traceData.name,
                input: traceData.input,
                output: traceData.output,
                metadata: traceData.metadata,
                tags: traceData.tags,
                // @ts-ignore - Attempting to pass timestamps if supported by underlying implementation
                startTime: new Date(traceData.startTime),
                // @ts-ignore
                endTime: new Date(traceData.endTime)
            });
            
            trace.end();
            await this.client.flush();
            
            // Accessing internal data ID - this matches the SDK usage examples
            // @ts-expect-error - Opik SDK types might be missing or incomplete
            return trace.data?.id || trace.id; 
        } catch (error) {
            console.error("[Opik] Failed to log trace:", error);
            return null;
        }
    }

    async logEvaluation(feedback: OpikFeedback) {
        if (!this.client) return;

        try {
            await this.client.logTracesFeedbackScores([{
                id: feedback.traceId,
                name: feedback.name,
                value: feedback.value,
                reason: feedback.reason
            }]);
            await this.client.flush();
        } catch (error) {
            console.error("[Opik] Failed to log evaluation:", error);
        }
    }
}

export const opik = new OpikClient();
