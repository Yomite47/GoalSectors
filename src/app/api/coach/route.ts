import { NextResponse } from 'next/server';
import { getStore } from '@/lib/data';
import { validateCoachResponse, CoachResponse } from '@/lib/ai/schema';
import { evaluateRun } from '@/lib/ai/eval';
import * as opikAdapter from '@/lib/opik/adapter';

// Helper to generate smart mock response
function getSmartMockResponse(messages: any[], reason: string = "No API Key") {
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    const actions = [];
    let assistantMessage = `I'm ready to help! (${reason})`;

    // Simple Heuristic for Tasks
    if (lastMsg.includes('task') || lastMsg.includes('finish') || lastMsg.includes('create') || lastMsg.includes('remind') || lastMsg.includes('do') || lastMsg.includes('work on')) {
            // Extract potential title (very naive)
            let title = messages[messages.length - 1].content
            .replace(/create a task for me/i, '')
            .replace(/i want to/i, '')
            .replace(/remind me to/i, '')
            .replace(/add/i, '')
            .trim();
            
            // Smart Breakdown for Mock
            if (title.toLowerCase().includes('project')) title = "Draft project outline";
            if (title.toLowerCase().includes('workout')) title = "Do 15 mins HIIT";
            if (title.toLowerCase().includes('read')) title = "Read 10 pages";

        actions.push({
            type: "CREATE_TASK",
            payload: {
                title: title || "New Task",
                due_date: new Date().toISOString().split('T')[0]
            }
        });
        assistantMessage = `You got this! 🚀 I've added "${title}" to your plan. Small steps lead to big wins! Let's crush it today! (Smart Mock Mode)`;
    } 
    // Simple Heuristic for Habits
    else if (lastMsg.includes('habit')) {
            const title = messages[messages.length - 1].content.replace(/create a habit/i, '').trim();
            actions.push({
            type: "CREATE_HABIT",
            payload: {
                title: title || "New Habit",
                frequency: "daily"
            }
        });
        assistantMessage = `Consistency is key! 🌱 I've started tracking "${title}" for you. One day at a time. You're doing great! (Smart Mock Mode)`;
    }
    else {
            assistantMessage = `I'm here to support you! 🌟 (${reason}). Try telling me what you want to achieve today, like "Finish the report" or "Drink water". I'll help you break it down!`;
    }

    return JSON.stringify({
        assistant_message: assistantMessage,
        actions: actions
    });
}

// Helper to call OpenAI (or compatible)
async function callLLM(messages: any[]) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.AI_MODEL || 'gpt-4o-mini';

    console.log("[Coach API] Calling LLM...", { hasKey: !!apiKey, model });

    if (!apiKey) {
        console.warn("OPENAI_API_KEY is not set. Using SMART MOCK response.");
        return getSmartMockResponse(messages, "No API Key - Add OPENAI_API_KEY to .env.local");
    }

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                response_format: { type: "json_object" }, // Enforce JSON mode if supported
                temperature: 0.7
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error(`LLM API Error: ${res.status} ${txt}`);
            
            // Fallback for Quota or Auth errors
            if (res.status === 429 || res.status === 401 || res.status === 403) {
                return getSmartMockResponse(messages, `API Error ${res.status}: Quota/Auth`);
            }
            
            throw new Error(`LLM API Error: ${res.status} ${txt}`);
        }

        const data = await res.json();
        return data.choices[0].message.content;
    } catch (error: any) {
        console.error("LLM Call Failed:", error);
        // Network errors or other crashes -> fallback
        return getSmartMockResponse(messages, "Network/Unknown Error");
    }
}

export async function POST(req: Request) {
    const startTime = Date.now();
    const { userId, message, mode, enabledSectors: clientSectors, promptVersion = 'A' } = await req.json();
    
    if (!userId || !message) {
        return NextResponse.json({ error: "Missing userId or message" }, { status: 400 });
    }

    // Start Opik Trace
    const traceHandle = opikAdapter.startTrace('coach_run', { userId, mode, promptVersion });

    const store = getStore();
    await store.getOrCreateUser(userId);

    try {
        // 1. Load Context
        const [dbSectors, tasks, habits, streaks, goals] = await Promise.all([
            store.getEnabledSectors(userId),
            store.listTasksForDate(userId, new Date().toISOString().split('T')[0]),
            store.listHabits(userId),
            store.getHabitStreaks(userId),
            store.listGoals(userId)
        ]);

        // Use client sectors if provided (fixes local dev sync issues), otherwise DB
        const sectors = clientSectors || dbSectors;

        // Enrich goals with milestones
        const goalsWithMilestones = await Promise.all(goals.map(async g => {
            const milestones = await store.listMilestones(userId, g.id);
            return { ...g, milestones };
        }));

        // 2. Build Prompt
        const today = new Date().toISOString().split('T')[0];
        
        let systemPersona = "You are a world-class productivity coach. Your goal is to help the user achieve more while feeling good about it.";
        if (mode === 'strict') systemPersona = "You are a strict, high-performance drill sergeant. Push the user to their limits. No excuses.";
        if (mode === 'chill') systemPersona = "You are a supportive, empathetic friend. Focus on mental health and steady progress. No pressure.";

        // A/B Test Variations
        if (promptVersion === 'B') {
            systemPersona += " Be extremely concise. Use bullet points. Focus on 'one thing at a time'.";
        }

        const contextJson = JSON.stringify({
            today,
            enabled_sectors: sectors,
            tasks_today: tasks.map(t => ({ title: t.title, status: t.status })),
            habits: habits.map(h => {
                const s = streaks.find(st => st.habitId === h.id);
                return { title: h.title, streak: s?.currentStreak || 0 };
            }),
            goals: goalsWithMilestones.map(g => ({ 
                id: g.id, 
                title: g.title, 
                milestones: g.milestones.map(m => ({ title: m.title, completed: m.completed })) 
            }))
        }, null, 2);

        const schemaDefinition = `
{
  "assistant_message": "string",
  "actions": [
    { "type": "CREATE_TASK", "payload": { "title": "string", "due_date": "YYYY-MM-DD" } },
    { "type": "CREATE_HABIT", "payload": { "title": "string", "frequency": "daily" } },
    { "type": "CREATE_GOAL_PLAN", "payload": { "goal_id": "uuid", "milestones": [...], "weekly_plan": [...] } }
  ]
}
`;

        const systemPrompt = `
${systemPersona}

# CORE PHILOSOPHY
- **Deep Understanding**: Before jumping to solutions, try to understand the user's "Why". Ask clarifying questions if their goal is vague.
- **Be Encouraging & Supportive**: You are a partner, not just a bot. Celebrate their wins. Use emojis (🚀, 🌱, 💪, ✨) to keep energy high.
- **Action-Oriented (When Ready)**: Once you understand the goal, create TASKS. But don't rush if the user is just exploring.
- **Smart Breakdown**: If a user says "I need to work on X", help them break it down into concrete steps.

# INTERACTION STYLES
- **Discovery**: If the user shares a vague goal (e.g., "I want to get fit"), ask: "What does 'fit' look like to you? Running, lifting, or just moving more?"
- **Planning**: Once the goal is clear, propose a plan. "How about we start with 3 days of gym?"
- **Execution**: When they agree, generate the ACTIONS (Tasks/Habits).

# RULES FOR TASKS
1. **Specific**: Task titles must be concrete (e.g., "Write intro paragraph" vs "Write").
2. **Atomic**: Tasks should be doable in < 1 hour.
3. **Verbs**: Start with a verb.

Current Context:
${contextJson}

Instructions:
1. Analyze the user's request and the current context.
2. If the user asks to create something, generate the appropriate action.
3. IMPORTANT: Only generate actions for ENABLED sectors. 
   - Tasks -> Productivity
   - Habits -> Habits
   - Goals -> Goals
4. If the sector is disabled, explain why you can't do it in 'assistant_message'.
5. For 'CREATE_GOAL_PLAN', you must use an existing 'goal_id' from the context.
6. CLARIFICATION RULE: If the user's request is ambiguous (e.g. "Work on project"), DO NOT just ask back. PROPOSE a specific first step task and ask if that sounds good.
   - Bad: "What do you want to do?"
   - Good: "Let's get started! 🚀 Shall I create a task to 'Outline the project requirements' for today?"
7. Return strictly valid JSON matching this schema:
${schemaDefinition}
`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ];

        opikAdapter.traceEvent(traceHandle, 'prompt_built', { systemPersona, contextJson });

        // 3. Call LLM
        let rawResponse = await callLLM(messages);
        
        opikAdapter.traceEvent(traceHandle, 'model_response_received', { rawResponse });

        let validation = validateCoachResponse(JSON.parse(rawResponse));
        
        opikAdapter.traceEvent(traceHandle, 'schema_validated', { ok: validation.ok, error: validation.error });
        
        // 4. Retry Logic
        if (!validation.ok) {
            console.log("Validation failed, retrying...", validation.error);
            messages.push({ role: "assistant", content: rawResponse });
            messages.push({ role: "user", content: `Your JSON was invalid. Fix it to match the schema exactly. Error: ${validation.error}` });
            
            rawResponse = await callLLM(messages);
            validation = validateCoachResponse(JSON.parse(rawResponse));
        }

        const latencyMs = Date.now() - startTime;

        // 5. Log Run
        const runId = await store.logAiRun(
            userId, 
            '/api/coach', 
            messages[messages.length - 1].content, // Log last prompt
            rawResponse, 
            validation.ok, 
            latencyMs,
            promptVersion
        );

        if (!validation.ok) {
            // Log failure eval
            const evalResult = evaluateRun({
                enabledSectors: sectors,
                userMessage: message,
                assistantMessage: "Validation failed",
                actions: [],
                schemaValid: false,
                latencyMs
            });
            
            await store.logAiEval(userId, runId, {
                score_total: evalResult.score_total,
                schema_score: evalResult.scores.schema,
                sector_score: evalResult.scores.sector_compliance,
                usefulness_score: evalResult.scores.usefulness,
                efficiency_score: evalResult.scores.efficiency,
                violated_sector: evalResult.violated_sector,
                empty_actions: evalResult.empty_actions,
                reasons: JSON.stringify(evalResult.reasons)
            });
            
            // Log Opik failure
            opikAdapter.endTrace(traceHandle, { 
                error: validation.error, 
                rawResponse,
                eval: evalResult
            });
            if (traceHandle) {
                opikAdapter.logEval(traceHandle, 'Score', evalResult.score_total);
                opikAdapter.logEval(traceHandle, 'Schema', evalResult.scores.schema);
            }

            return NextResponse.json({ 
                assistant_message: "I'm having trouble processing your request correctly. Please try again.", 
                actions_applied: 0,
                eval: evalResult
            });
        }

        const result = validation.data!;
        let actionsApplied = 0;
        const MAX_ACTIONS = 5;

        // 6. Apply Actions with Guardrails
        for (const action of result.actions) {
            if (actionsApplied >= MAX_ACTIONS) {
                console.log("Action limit reached, skipping remaining actions.");
                break;
            }

            try {
                if (action.type === 'CREATE_TASK') {
                    if (sectors.includes('Productivity')) {
                        const { title, due_date } = action.payload;
                        
                        // Guardrail: Date Validation
                        if (due_date && due_date < today) {
                             console.warn(`Skipping task "${title}" - due date ${due_date} is in the past.`);
                             continue;
                        }

                        // Guardrail: Dedupe (Simple title check against today's tasks)
                        const isDuplicate = tasks.some(t => t.title.toLowerCase() === title.toLowerCase());
                        if (isDuplicate) {
                            console.log(`Skipping duplicate task: ${title}`);
                            continue;
                        }

                        await store.createTask(userId, title, due_date, undefined, 'ai', runId);
                        actionsApplied++;
                    }
                } else if (action.type === 'CREATE_HABIT') {
                    if (sectors.includes('Habits')) {
                        const { title } = action.payload;

                        // Guardrail: Dedupe
                        const isDuplicate = habits.some(h => h.title.toLowerCase() === title.toLowerCase());
                        if (isDuplicate) {
                            console.log(`Skipping duplicate habit: ${title}`);
                            continue;
                        }

                        await store.createHabit(userId, title, 'daily', 'ai', runId);
                        actionsApplied++;
                    }
                } else if (action.type === 'CREATE_GOAL_PLAN') {
                    if (sectors.includes('Goals')) {
                        const { goal_id, milestones, weekly_plan } = action.payload;
                        
                        // Create milestones (with tracking)
                        for (const m of milestones) {
                            // Guardrail: Date check for milestones
                            if (m.target_date && m.target_date < today) continue;
                            
                            await store.createMilestone(userId, goal_id, m.title, m.target_date || undefined, 'ai', runId);
                        }
                        
                        // Upsert weekly plans
                        for (const p of weekly_plan) {
                            await store.upsertWeeklyPlan(userId, goal_id, p.week_start, p.focus);
                        }
                        actionsApplied++;
                    }
                }
            } catch (err) {
                console.error(`Failed to apply action ${action.type}:`, err);
            }
        }
        
        opikAdapter.traceEvent(traceHandle, 'actions_applied', { count: actionsApplied });

        // Check if actions were blocked by sector guards
        let finalAssistantMessage = result.assistant_message;
        if (result.actions.length > 0 && actionsApplied === 0) {
            const missingSectors = result.actions.map(a => {
                if (a.type === 'CREATE_TASK') return 'Productivity';
                if (a.type === 'CREATE_HABIT') return 'Habits';
                if (a.type === 'CREATE_GOAL_PLAN') return 'Goals';
                return '';
            }).filter(s => s && !sectors.includes(s));
            
            const uniqueMissing = [...new Set(missingSectors)];
            
            if (uniqueMissing.length > 0) {
                finalAssistantMessage += `\n\n(Note: I couldn't create this item because the **${uniqueMissing.join(', ')}** sector is disabled. Please enable it in Settings!)`;
            }
        }

        // 7. Evaluate & Log (Post-Action)
        const evalResult = evaluateRun({
            enabledSectors: sectors,
            userMessage: message,
            assistantMessage: finalAssistantMessage,
            actions: result.actions,
            schemaValid: true,
            latencyMs
        });

        await store.logAiEval(userId, runId, {
            score_total: evalResult.score_total,
            schema_score: evalResult.scores.schema,
            sector_score: evalResult.scores.sector_compliance,
            usefulness_score: evalResult.scores.usefulness,
            efficiency_score: evalResult.scores.efficiency,
            violated_sector: evalResult.violated_sector,
            empty_actions: evalResult.empty_actions,
            reasons: JSON.stringify(evalResult.reasons)
        });

        // Opik End Trace & Eval
        opikAdapter.endTrace(traceHandle, {
            output: result,
            actionsApplied,
            score: evalResult.score_total
        });
        
        if (traceHandle) {
             Promise.all([
                opikAdapter.logEval(traceHandle, 'Total Score', evalResult.score_total),
                opikAdapter.logEval(traceHandle, 'Schema Score', evalResult.scores.schema),
                opikAdapter.logEval(traceHandle, 'Sector Score', evalResult.scores.sector_compliance),
                opikAdapter.logEval(traceHandle, 'Usefulness', evalResult.scores.usefulness),
                opikAdapter.logEval(traceHandle, 'Efficiency', evalResult.scores.efficiency)
             ]).catch(err => console.error("Failed to log Opik evals:", err));
        }

        const traceId = traceHandle?.id || null;

        return NextResponse.json({ 
            assistant_message: finalAssistantMessage, 
            actions_applied: actionsApplied,
            actions: result.actions, // Return actions for client-side sync
            eval: evalResult,
            latency_ms: latencyMs,
            traceId, // Return for client-side feedback
            runId
        });

    } catch (error: any) {
        console.error("Coach API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
